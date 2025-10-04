import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { ShippingForm } from './ShippingForm';
import { PaymentMethod } from './PaymentMethod';
import { OrderSummary } from './OrderSummary';
import { UPIPayment } from './UPIPayment';
import { ProgressSteps } from './ProgressSteps';
import { ShippingFormData } from './types';
import { PaymentService } from '../../services/paymentService';
import { ordersService } from '../../utils/databaseService';

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

export const Checkout: React.FC = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const razorpayLoaded = useRef(false);

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [showUPIOptions, setShowUPIOptions] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [paymentSessionId, setPaymentSessionId] = useState<string>('');

  const [formData, setFormData] = useState<ShippingFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const steps = ['Cart', 'Checkout', 'Confirmation'];
  const currentStep = showUPIOptions ? 2 : 1;

  // Calculate totals
  const subtotal = state.cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const shipping = subtotal > 999 ? 0 : 1;
  const total = subtotal + shipping;

  // Safe Razorpay script loading
  useEffect(() => {
    const loadRazorpayScript = async () => {
      if (razorpayLoaded.current || typeof window === 'undefined') return;

      try {
        // Check if script already exists
        if (document.getElementById('razorpay-script')) {
          razorpayLoaded.current = true;
          return;
        }

        const script = document.createElement('script');
        script.id = 'razorpay-script';
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        
        script.onload = () => {
          console.log('Razorpay script loaded successfully');
          razorpayLoaded.current = true;
        };
        
        script.onerror = () => {
          console.error('Failed to load Razorpay script');
          dispatch({
            type: 'SET_NOTIFICATION',
            payload: {
              type: 'error',
              message: 'Payment system temporarily unavailable. Please try another payment method.',
              show: true
            }
          });
        };

        document.body.appendChild(script);
      } catch (error) {
        console.error('Error loading Razorpay:', error);
      }
    };

    // Load Razorpay when component mounts if payment method requires it
    if (paymentMethod === 'upi' || paymentMethod === 'card') {
      loadRazorpayScript();
    }
  }, [paymentMethod, dispatch]);

  // Safe message handler
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only process messages from trusted origins
      const trustedOrigins = [
        'https://checkout.razorpay.com',
        'https://api.razorpay.com',
        window.location.origin
      ];

      if (!trustedOrigins.includes(event.origin)) {
        return;
      }

      try {
        // Handle Razorpay messages safely
        if (event.data && typeof event.data === 'object') {
          console.log('Razorpay message:', event.data);
        }
      } catch (error) {
        // Silently handle errors from cross-origin messages
        console.warn('Error processing payment message');
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Generate session ID
  const generateSessionId = () => {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Form validation
  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.address ||
      !formData.city || !formData.state || !formData.pincode) {
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: {
          type: 'error',
          message: 'Please fill all required shipping information',
          show: true
        }
      });
      return false;
    }

    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: {
          type: 'error',
          message: 'Please enter a valid 10-digit phone number',
          show: true
        }
      });
      return false;
    }

    // Pincode validation
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(formData.pincode)) {
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: {
          type: 'error',
          message: 'Please enter a valid 6-digit PIN code',
          show: true
        }
      });
      return false;
    }

    return true;
  };

  // Safe Razorpay payment handler
  const handleRazorpayPayment = (order: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      // Wait for Razorpay to load
      const checkRazorpay = () => {
        if (typeof window !== 'undefined' && window.Razorpay) {
          initializePayment();
        } else if (Date.now() - startTime < 10000) { // 10 second timeout
          setTimeout(checkRazorpay, 100);
        } else {
          reject(new Error('Razorpay payment gateway timeout'));
        }
      };

      const startTime = Date.now();

      const initializePayment = () => {
        try {
          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: 'INR',
            name: 'KichoFy',
            description: 'Order Payment',
            order_id: order.id,
            handler: (response: any) => {
              resolve(response);
            },
            prefill: {
              name: formData.name,
              email: formData.email,
              contact: formData.phone
            },
            notes: {
              address: formData.address,
              session_id: paymentSessionId
            },
            theme: {
              color: '#6366f1'
            },
            modal: {
              ondismiss: () => {
                reject(new Error('Payment cancelled by user'));
              }
            }
          };

          const razorpay = new window.Razorpay(options);
          razorpay.open();
        } catch (error) {
          reject(error);
        }
      };

      checkRazorpay();
    });
  };

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (orderSubmitted || loading) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (!state.user) {
        dispatch({
          type: 'SET_NOTIFICATION',
          payload: {
            type: 'error',
            message: 'Please login to place an order',
            show: true
          }
        });
        navigate('/auth/login');
        return;
      }

      // For UPI payment, show UPI options
      if (paymentMethod === 'upi') {
        const sessionId = generateSessionId();
        setPaymentSessionId(sessionId);
        setShowUPIOptions(true);
        setLoading(false);
        return;
      }

      // For card payment, process immediately
      if (paymentMethod === 'card') {
        await processCardPayment();
        return;
      }

      // Create Cash on Delivery order
      await createOrder('confirmed', 'pending');

    } catch (error) {
      console.error('Error in checkout:', error);
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: {
          type: 'error',
          message: 'Failed to process order. Please try again.',
          show: true
        }
      });
      setOrderSubmitted(false);
    } finally {
      setLoading(false);
    }
  };

  // Process card payment
  const processCardPayment = async () => {
    try {
      const sessionId = generateSessionId();
      setPaymentSessionId(sessionId);

      // Create Razorpay order
      const razorpayOrder = await PaymentService.createOrder({
        amount: Math.round(total * 100), // Convert to paise
        receipt: `receipt_${Date.now()}`,
        notes: {
          shipping_address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
          customer_name: formData.name,
          customer_phone: formData.phone,
          session_id: sessionId
        }
      });

      // Process payment
      const paymentResponse = await handleRazorpayPayment(razorpayOrder);

      // Verify payment
      const isVerified = await PaymentService.verifyPayment(
        paymentResponse.razorpay_payment_id, 
        razorpayOrder.id
      );

      if (isVerified) {
        await createOrder('confirmed', 'paid', paymentResponse.razorpay_payment_id);
      } else {
        await createOrder('payment_review', 'pending_verification', paymentResponse.razorpay_payment_id);
      }

    } catch (error: any) {
      console.error('Card payment error:', error);
      if (error.message.includes('cancelled')) {
        dispatch({
          type: 'SET_NOTIFICATION',
          payload: {
            type: 'info',
            message: 'Payment cancelled',
            show: true
          }
        });
      } else {
        dispatch({
          type: 'SET_NOTIFICATION',
          payload: {
            type: 'error',
            message: error.message || 'Payment failed. Please try again.',
            show: true
          }
        });
      }
      setOrderSubmitted(false);
    }
  };

  // Create order in database
  const createOrder = async (status: string, paymentStatus: string, paymentId?: string) => {
    const order = await ordersService.createOrder({
      user_id: state.user!.id,
      total_amount: total,
      status: status,
      payment_status: paymentStatus,
      payment_session_id: paymentSessionId,
      payment_id: paymentId,
      shipping_address: formData,
      items: state.cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product?.price || 0,
        size: item.size,
        color: item.color,
        product: {
          name: item.product?.name,
          image_url: item.product?.image_url,
          description: item.product?.description
        }
      }))
    });

    // Clear cart after successful order
    dispatch({ type: 'CLEAR_CART' });

    // Navigate to confirmation page
    navigate(`/order-confirmation/${order.id}`, {
      state: {
        paymentPending: paymentStatus === 'pending_verification',
        message: paymentStatus === 'pending_verification'
          ? 'Your order is placed and waiting for payment verification. We will confirm your order once payment is verified.'
          : 'Your order has been placed successfully!'
      }
    });

    // Show success notification
    dispatch({
      type: 'SET_NOTIFICATION',
      payload: {
        type: 'success',
        message: `Order placed successfully!${paymentStatus === 'pending_verification' ? ' Waiting for payment verification.' : ''}`,
        show: true
      }
    });

    return order;
  };

  // Handle UPI payment
  const handleUPIPayment = async () => {
    if (orderSubmitted || loading) return;
    if (!validateForm()) return;

    setLoading(true);
    setOrderSubmitted(true);

    try {
      // Create Razorpay order
      const razorpayOrder = await PaymentService.createOrder({
        amount: Math.round(total * 100),
        receipt: `receipt_${Date.now()}`,
        notes: {
          shipping_address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
          customer_name: formData.name,
          customer_phone: formData.phone,
          session_id: paymentSessionId
        }
      });

      // Process UPI payment
      const paymentResponse = await handleRazorpayPayment(razorpayOrder);

      // Verify payment
      const isVerified = await PaymentService.verifyPayment(
        paymentResponse.razorpay_payment_id, 
        razorpayOrder.id
      );

      if (isVerified) {
        await createOrder('confirmed', 'paid', paymentResponse.razorpay_payment_id);
      } else {
        await createOrder('payment_review', 'pending_verification', paymentResponse.razorpay_payment_id);
      }

    } catch (error: any) {
      console.error('Error processing UPI payment:', error);
      if (error.message.includes('cancelled')) {
        dispatch({
          type: 'SET_NOTIFICATION',
          payload: {
            type: 'info',
            message: 'Payment cancelled',
            show: true
          }
        });
      } else {
        dispatch({
          type: 'SET_NOTIFICATION',
          payload: {
            type: 'error',
            message: error.message || 'Failed to process payment. Please try again.',
            show: true
          }
        });
      }
      setOrderSubmitted(false);
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof ShippingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Redirect if cart is empty
  if (state.cart.length === 0 && !showUPIOptions) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Checkout
          </h1>

          <ProgressSteps
            currentStep={currentStep}
            steps={steps}
          />
        </div>

        {showUPIOptions ? (
          <UPIPayment
            total={total}
            paymentSessionId={paymentSessionId}
            loading={loading}
            orderSubmitted={orderSubmitted}
            onPayment={handleUPIPayment}
            onBack={() => setShowUPIOptions(false)}
          />
        ) : (
          <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Left Column - Forms */}
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              <ShippingForm
                formData={formData}
                onChange={handleInputChange}
                user={state.user}
              />

              <PaymentMethod
                paymentMethod={paymentMethod}
                onChange={setPaymentMethod}
                total={total}
              />
            </div>

            {/* Right Column - Order Summary */}
            <OrderSummary
              cart={state.cart}
              subtotal={subtotal}
              shipping={shipping}
              total={total}
              loading={loading}
              orderSubmitted={orderSubmitted}
              paymentMethod={paymentMethod}
              onSubmit={handleSubmit}
            />
          </form>
        )}
      </div>
    </div>
  );
};