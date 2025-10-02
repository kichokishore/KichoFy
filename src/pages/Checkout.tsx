import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { ordersService } from '../utils/databaseService';
import { QRCodeCanvas } from "qrcode.react";
import { paymentRecoveryService } from '../utils/paymentRecoveryService';

export const Checkout: React.FC = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [showUPIOptions, setShowUPIOptions] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [qrExpiryTime, setQrExpiryTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(120); // 2 minutes
  const [paymentSessionId, setPaymentSessionId] = useState<string>('');
  const qrRefreshInterval = useRef<NodeJS.Timeout>();
  const timeInterval = useRef<NodeJS.Timeout>();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  // Payment details
  const UPIid = "kaviyamurugan286-1@okaxis";
  const phoneNumber = "+91 6374288038"; // Direct payment number

  // Calculate totals
  const subtotal = state.cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const shipping = subtotal > 999 ? 0 : 1;
  const total = subtotal + shipping;

  // Generate unique payment session ID
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Generate UPI payment URL with session ID
  const generateUPIUrl = (amount: number, sessionId: string, upiId: string = UPIid) => {
    const note = `KichoFy Order - ${sessionId}`;
    const formattedAmount = amount.toFixed(2);
    return `upi://pay?pa=${upiId}&pn=KichoFy&am=${formattedAmount}&tn=${encodeURIComponent(note)}&cu=INR`;
  };

  // Generate UPI string for QR code with session ID
  const generateUPIString = (amount: number, sessionId: string, upiId: string = UPIid) => {
    const note = `KichoFy Order - ${sessionId}`;
    const formattedAmount = amount.toFixed(2);
    return `upi://pay?pa=${upiId}&pn=KichoFy&am=${formattedAmount}&tn=${note}&cu=INR`;
  };

  // Start QR code expiry timer
  const startQrTimer = () => {
    const expiryTime = Date.now() + 120000; // 2 minutes from now
    setQrExpiryTime(expiryTime);
    setTimeLeft(120);

    if (timeInterval.current) clearInterval(timeInterval.current);
    timeInterval.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timeInterval.current);
          refreshQRCode();
          return 120;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Refresh QR code every 2 minutes
  const refreshQRCode = () => {
    const newSessionId = generateSessionId();
    setPaymentSessionId(newSessionId);
    startQrTimer();

    // Store the session in localStorage for recovery
    const pendingPayment = {
      sessionId: newSessionId,
      timestamp: Date.now(),
      amount: total,
      cart: state.cart,
      formData: formData
    };
    localStorage.setItem('pendingUPIPayment', JSON.stringify(pendingPayment));
  };

  // Check for pending payments on component mount
  useEffect(() => {
    const pendingPayment = localStorage.getItem('pendingUPIPayment');
    if (pendingPayment) {
      const paymentData = JSON.parse(pendingPayment);
      const timeElapsed = Date.now() - paymentData.timestamp;

      // If payment session is less than 10 minutes old, offer recovery
      if (timeElapsed < 600000) {
        const shouldRecover = window.confirm(
          `We found a pending payment of ₹${paymentData.amount}. Would you like to continue with this payment?`
        );

        if (shouldRecover) {
          setPaymentSessionId(paymentData.sessionId);
          setFormData(paymentData.formData);
          setShowUPIOptions(true);
          startQrTimer();
        } else {
          localStorage.removeItem('pendingUPIPayment');
        }
      } else {
        localStorage.removeItem('pendingUPIPayment');
      }
    }

    return () => {
      if (qrRefreshInterval.current) clearInterval(qrRefreshInterval.current);
      if (timeInterval.current) clearInterval(timeInterval.current);
    };
  }, []);

  // Email notification function
  const sendOrderEmail = async (orderData: any) => {
    const formspreeEndpoint = 'https://formspree.io/f/xgvnyegy';

    const emailData = {
      subject: `New Order - ${orderData.orderId}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
      orderId: orderData.orderId,
      totalAmount: total,
      paymentMethod: paymentMethod,
      paymentStatus: orderData.paymentStatus || 'pending',
      paymentSessionId: paymentSessionId,
      items: state.cart.map(item => ({
        product: item.product?.name,
        quantity: item.quantity,
        price: item.product?.price,
        size: item.size,
        color: item.color
      }))
    };

    try {
      const response = await fetch(formspreeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  };

  // Add this after the sendOrderEmail function
  const createPendingPaymentSession = async (sessionId: string) => {
    try {
      await paymentRecoveryService.createPendingPayment({
        session_id: sessionId,
        user_id: state.user!.id,
        amount: total,
        order_data: {
          shipping_address: {
            name: formData.name,
            street: formData.address,
            city: formData.city,
            state: formData.state,
            postal_code: formData.pincode,
            phone: formData.phone
          },
          items: state.cart.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.product?.price || 0,
            size: item.size || null,
            color: item.color || null
          }))
        }
      });
      console.log('Pending payment session created:', sessionId);
    } catch (error) {
      console.error('Error creating pending payment session:', error);
    }
  };

  // Validate form data
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

    // Basic phone validation
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

    // Basic pincode validation
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (orderSubmitted || loading) {
      console.log('Order already submitted, preventing duplicate');
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
        navigate('/login');
        return;
      }

      // For UPI payment, show UPI options
      if (paymentMethod === 'upi') {
        const sessionId = generateSessionId();
        setPaymentSessionId(sessionId);
        setShowUPIOptions(true);
        startQrTimer();
        setLoading(false);
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

  // Create order in database
  const createOrder = async (status: string, paymentStatus: string) => {
    console.log('Creating order...');

    const currentCartItems = [...state.cart];
    const sessionId = paymentSessionId || generateSessionId();

    const order = await ordersService.createOrder({
      user_id: state.user!.id,
      total_amount: total,
      status: status,
      payment_status: paymentStatus,
      payment_session_id: sessionId,
      shipping_address: formData,
      items: currentCartItems.map(item => ({
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

    console.log('Order created successfully:', order.id);

    // Send email notification
    await sendOrderEmail({
      orderId: order.id,
      paymentStatus: paymentStatus
    });

    // Clear pending payment from localStorage
    localStorage.removeItem('pendingUPIPayment');

    // Navigate to confirmation page
    navigate(`/order-confirmation/${order.id}`, {
      state: {
        paymentPending: paymentStatus === 'pending_verification',
        message: paymentStatus === 'pending_verification'
          ? 'Your order is placed and waiting for payment verification. We will confirm your order once payment is verified.'
          : 'Your order has been placed successfully!'
      }
    });

    // Clear cart after navigation
    setTimeout(() => {
      dispatch({ type: 'CLEAR_CART' });
    }, 100);

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

  const handleUPIPayment = async (method: string) => {
    if (orderSubmitted || loading) {
      console.log('Order already submitted, preventing duplicate');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setOrderSubmitted(true);

    try {
      // FIRST: Create pending payment session in database
      await createPendingPaymentSession(paymentSessionId);

      // SECOND: Create the actual order with payment_review status
      const order = await ordersService.createOrder({
        user_id: state.user!.id,
        total_amount: total,
        status: 'payment_review',
        payment_status: 'pending_verification',
        payment_session_id: paymentSessionId, // Store session ID in order
        shipping_address: {
          name: formData.name,
          street: formData.address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.pincode,
          phone: formData.phone
        },
        items: state.cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.product?.price || 0,
          size: item.size || null,
          color: item.color || null
        }))
      });

      console.log('UPI order created successfully:', order.id);

      // Send email notification
      await sendOrderEmail({
        orderId: order.id,
        paymentStatus: 'pending_verification',
        paymentSessionId: paymentSessionId
      });

      // Navigate to confirmation
      navigate(`/order-confirmation/${order.id}`, {
        state: {
          paymentPending: true,
          paymentSessionId: paymentSessionId,
          message: `Your order is placed! Payment Session ID: ${paymentSessionId}. We will verify your payment and confirm your order.`
        }
      });

      // Clear cart after navigation
      setTimeout(() => {
        dispatch({ type: 'CLEAR_CART' });
      }, 100);

      // For UPI apps, open the payment app
      if (method !== 'qr') {
        setTimeout(() => {
          const upiUrl = generateUPIUrl(total, paymentSessionId);
          window.location.href = upiUrl;
        }, 1000);
      }

    } catch (error) {
      console.error('Error processing UPI payment:', error);
      dispatch({
        type: 'SET_NOTIFICATION',
        payload: {
          type: 'error',
          message: 'Failed to process payment. Please try again.',
          show: true
        }
      });
      setOrderSubmitted(false);
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Only redirect to cart if we're not in UPI payment flow
  if (state.cart.length === 0 && !showUPIOptions) {
    console.log('Cart is empty and not in UPI flow, redirecting to cart');
    dispatch({
      type: 'SET_NOTIFICATION',
      payload: {
        type: 'info',
        message: 'Your cart is empty',
        show: true
      }
    });
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Header with Progress Steps */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Checkout
          </h1>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <div className="flex items-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold">
                1
              </div>
              <div className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium text-primary">Cart</div>
            </div>

            <div className="w-12 sm:w-16 h-1 bg-primary mx-1 sm:mx-2"></div>

            <div className="flex items-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold">
                2
              </div>
              <div className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium text-primary">Checkout</div>
            </div>

            <div className="w-12 sm:w-16 h-1 bg-gray-300 dark:bg-gray-600 mx-1 sm:mx-2"></div>

            <div className="flex items-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold">
                3
              </div>
              <div className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Confirmation</div>
            </div>
          </div>
        </div>

        {showUPIOptions ? (
          // UPI Payment Options
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
              UPI Payment Options
            </h2>

            {/* Security Notice */}
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start space-x-2">
                <div className="text-blue-600 dark:text-blue-400 mt-0.5">🔒</div>
                <div>
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 text-sm sm:text-base mb-1">
                    Secure Payment Session
                  </h4>
                  <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-400">
                    Payment session ID: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">{paymentSessionId}</code>
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                    This session will help us track your payment securely.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* QR Code Option */}
              <div className="border-2 border-primary rounded-lg p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Scan QR Code
                  </h3>
                  <div className={`px-2 py-1 rounded-full text-xs font-semibold ${timeLeft > 30 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    ⏰ {formatTime(timeLeft)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-white p-3 sm:p-4 rounded-lg inline-block mb-3 sm:mb-4 border border-gray-200 relative">
                    <QRCodeCanvas
                      value={generateUPIString(total, paymentSessionId)}
                      size={160}
                      level="M"
                      includeMargin={true}
                      bgColor="#FFFFFF"
                      fgColor="#000000"
                    />
                    {timeLeft <= 30 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                        <span className="text-white text-sm font-semibold">Refreshing soon...</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Scan this QR code with any UPI app to pay ₹{total.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mb-3 sm:mb-4">
                    Amount: ₹{total.toLocaleString()} | Session: {paymentSessionId.slice(0, 8)}...
                  </p>
                  <button
                    onClick={() => handleUPIPayment('qr')}
                    disabled={loading || orderSubmitted}
                    className="bg-primary hover:bg-primary-light text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 text-sm sm:text-base"
                  >
                    {loading ? 'Processing...' : 'I have Paid'}
                  </button>
                </div>
              </div>

              {/* UPI Apps Option */}
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  Pay with UPI App
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Click below to open your preferred UPI app and complete the payment of ₹{total.toLocaleString()}
                  </p>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <button
                      onClick={() => handleUPIPayment('gpay')}
                      disabled={loading || orderSubmitted}
                      className="bg-white border border-gray-300 rounded-lg p-3 sm:p-4 hover:border-primary transition-colors disabled:opacity-50 hover:shadow-md"
                    >
                      <div className="text-center">
                        <img
                          src="https://static0.anpoimages.com/wordpress/wp-content/uploads/2020/11/05/Google-Pay-India-Tez-new-icon.jpg"
                          alt="Google Pay"
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mx-auto mb-2 object-cover"
                        />
                        <span className="text-xs sm:text-sm font-medium">Google Pay</span>
                      </div>
                    </button>

                    <button
                      onClick={() => handleUPIPayment('phonepe')}
                      disabled={loading || orderSubmitted}
                      className="bg-white border border-gray-300 rounded-lg p-3 sm:p-4 hover:border-primary transition-colors disabled:opacity-50 hover:shadow-md"
                    >
                      <div className="text-center">
                        <img
                          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTo4x8kSTmPUq4PFzl4HNT0gObFuEhivHOFYg&s"
                          alt="PhonePe"
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mx-auto mb-2 object-cover"
                        />
                        <span className="text-xs sm:text-sm font-medium">PhonePe</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Direct Phone Payment */}
              <div className="border border-green-300 dark:border-green-600 rounded-lg p-4 sm:p-6 bg-green-50 dark:bg-green-900/20">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  Direct Phone Payment
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Call or WhatsApp us for direct payment assistance
                  </p>

                  <div className="bg-white dark:bg-gray-700 p-3 sm:p-4 rounded-lg border">
                    <div className="text-center space-y-2">
                      <div>
                        <p className="text-xs text-gray-500">Phone Number</p>
                        <a
                          href={`tel:${phoneNumber}`}
                          className="text-lg sm:text-xl font-bold text-primary hover:text-primary-light transition-colors"
                        >
                          {phoneNumber}
                        </a>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">UPI ID</p>
                        <p className="text-sm sm:text-base font-mono font-semibold">{UPIid}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Amount to Pay</p>
                        <p className="text-lg font-bold text-green-600">₹{total.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 sm:p-3 rounded border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs text-yellow-700 dark:text-yellow-400 text-center">
                      💡 <strong>Important:</strong> Mention this session ID when paying: <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">{paymentSessionId}</code>
                    </p>
                  </div>

                  <button
                    onClick={() => handleUPIPayment('phone')}
                    disabled={loading || orderSubmitted}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 sm:py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 text-sm sm:text-base"
                  >
                    {loading ? 'Processing...' : 'I have Paid via Phone'}
                  </button>
                </div>
              </div>

              {/* Manual UPI Instructions */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 sm:p-4">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2 text-sm sm:text-base">
                  Manual UPI Payment
                </h4>
                <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                  If the above options don't work, you can manually send ₹{total.toLocaleString()} to:
                </p>
                <div className="mt-2 p-2 sm:p-3 bg-white dark:bg-gray-700 rounded border">
                  <p className="font-mono text-xs sm:text-sm font-bold text-center">{UPIid}</p>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Include this note: <code className="bg-gray-100 dark:bg-gray-600 px-1 rounded">{paymentSessionId}</code>
                  </p>
                </div>
              </div>

              {/* Back Button */}
              <div className="text-center">
                <button
                  onClick={() => setShowUPIOptions(false)}
                  className="text-primary hover:text-primary-light font-medium py-1 sm:py-2 text-sm sm:text-base"
                >
                  ← Back to Checkout
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Main Checkout Form (same as before, but with enhanced validation)
          <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Left Column - Forms */}
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              {/* Shipping Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    Shipping Information
                  </h2>
                  {state.user && (
                    <span className="text-xs sm:text-sm text-green-600 bg-green-50 dark:bg-green-900/20 px-2 sm:px-3 py-1 rounded-full">
                      Logged in as {state.user.name}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm sm:text-base"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm sm:text-base"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm sm:text-base"
                      placeholder="9876543210"
                      maxLength={10}
                      pattern="[6-9]\d{9}"
                    />
                    <p className="text-xs text-gray-500 mt-1">10-digit mobile number</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm sm:text-base"
                      placeholder="Street address, apartment, suite, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm sm:text-base"
                      placeholder="Your city"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm sm:text-base"
                      placeholder="Your state"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm sm:text-base"
                      placeholder="6-digit PIN code"
                      maxLength={6}
                      pattern="\d{6}"
                    />
                    <p className="text-xs text-gray-500 mt-1">6-digit PIN code</p>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
                  Payment Method
                </h2>

                <div className="space-y-3 sm:space-y-4">
                  <label className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 border-2 border-primary bg-primary/5 rounded-lg cursor-pointer transition-all">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Cash on Delivery</span>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Pay when you receive your order
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary/50 transition-all">
                    <input
                      type="radio"
                      name="payment"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">UPI Payment</span>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Pay using UPI apps, QR code, or phone
                      </p>
                    </div>
                  </label>
                </div>

                {paymentMethod === 'cod' && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                      💡 You'll pay ₹{total.toLocaleString()} when your order is delivered.
                    </p>
                  </div>
                )}

                {paymentMethod === 'upi' && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-xs sm:text-sm text-green-700 dark:text-green-300">
                      ✅ Multiple payment options available. Order confirmed after payment verification.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div>
              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg sticky top-4 sm:top-8">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
                  Order Summary
                </h2>

                {/* Cart Items */}
                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 max-h-60 sm:max-h-80 overflow-y-auto">
                  {state.cart.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 sm:space-x-4 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <img
                        src={item.product?.image_url}
                        alt={item.product?.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                          {item.product?.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          Qty: {item.quantity} • {item.size} • {item.color}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                          ₹{((item.product?.price || 0) * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 sm:space-y-3 border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Subtotal</span>
                    <span className="font-semibold text-sm sm:text-base">₹{subtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Shipping</span>
                    <span className="font-semibold text-sm sm:text-base">
                      {shipping === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `₹${shipping}`
                      )}
                    </span>
                  </div>

                  {subtotal < 999 && (
                    <div className="text-xs sm:text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                      Add ₹{(999 - subtotal).toLocaleString()} more for FREE shipping!
                    </div>
                  )}

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2 sm:pt-3">
                    <div className="flex justify-between text-base sm:text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">₹{total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={loading || orderSubmitted}
                  className="w-full bg-primary hover:bg-primary-light text-white py-3 sm:py-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 sm:mt-6 flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing Order...</span>
                    </>
                  ) : paymentMethod === 'cod' ? (
                    <span>Place Order (Cash on Delivery)</span>
                  ) : (
                    <span>Proceed to UPI Payment</span>
                  )}
                </button>

                {/* Security Notice */}
                <div className="mt-3 sm:mt-4 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center space-x-1">
                    <span>🔒</span>
                    <span>Your information is secure and protected</span>
                  </p>
                </div>

                {/* Continue Shopping */}
                <button
                  type="button"
                  onClick={() => navigate('/collections')}
                  className="w-full mt-2 sm:mt-3 px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};