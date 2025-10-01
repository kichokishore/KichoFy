import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { CheckCircle, Package, Calendar, IndianRupee, ArrowRight, Home, ShoppingBag, Clock, AlertCircle } from 'lucide-react';
import { ordersService } from '../utils/databaseService';
import { Order } from '../types';

export const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Get state passed from checkout (like payment pending status)
  const { paymentPending, message } = location.state || {};

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const orderData = await ordersService.getOrder(orderId!);
      setOrder(orderData);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-center py-8 sm:py-12">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Loading order details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center py-8 sm:py-12">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Order Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The order you're looking for doesn't exist.
            </p>
            <button
              onClick={() => navigate('/orders')}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
            >
              View All Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isPaymentPending = paymentPending || order.status === 'payment_review';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Success Header */}
        <div className="text-center mb-6 sm:mb-8">
          {isPaymentPending ? (
            <>
              <Clock className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-500 mx-auto mb-3 sm:mb-4" />
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 dark:text-white mb-2">
                Order Received!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg mb-3">
                Your order has been received and is waiting for payment verification.
              </p>
            </>
          ) : (
            <>
              <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-3 sm:mb-4" />
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 dark:text-white mb-2">
                Order Confirmed!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg mb-3">
                Thank you for your purchase. Your order has been received.
              </p>
            </>
          )}
          
          <div className="mt-3 sm:mt-4 bg-primary/10 text-primary px-3 sm:px-4 py-2 rounded-lg inline-block">
            <p className="font-semibold text-sm sm:text-base">Order #{order.id.slice(0, 8).toUpperCase()}</p>
          </div>

          {/* Payment Pending Notice */}
          {isPaymentPending && (
            <div className="mt-4 max-w-md mx-auto bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 sm:p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle size={18} className="text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">
                    Payment Verification Required
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300 text-xs sm:text-sm mt-1">
                    {message || 'We will verify your payment and confirm your order within 24 hours. You will receive an email confirmation once verified.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto">
          {/* Order Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Order Summary
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Status</span>
                <span className={`font-medium text-sm sm:text-base ${
                  isPaymentPending 
                    ? 'text-yellow-600 dark:text-yellow-400' 
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {isPaymentPending ? 'Payment Review' : order.status}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Date</span>
                <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                  {new Date(order.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Items</span>
                <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                  {order.order_items?.length || 0}
                </span>
              </div>
              
              <div className="flex justify-between text-base sm:text-lg font-bold pt-3 border-t border-gray-200 dark:border-gray-700">
                <span>Total Amount</span>
                <div className="flex items-center text-primary">
                  <IndianRupee size={16} className="sm:w-5 sm:h-5" />
                  <span>{order.total_amount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Order Items Preview */}
            {order.order_items && order.order_items.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2 text-sm sm:text-base">
                  Order Items:
                </h3>
                <div className="space-y-2">
                  {order.order_items.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs sm:text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {item.quantity}x
                      </span>
                      <span className="text-gray-900 dark:text-white flex-1 truncate">
                        {item.product?.name || `Product ${index + 1}`}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        ₹{((item.price || 0) * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {order.order_items.length > 3 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      +{order.order_items.length - 3} more items
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
              What's Next?
            </h2>
            
            <div className="space-y-3 sm:space-y-4">
              {isPaymentPending ? (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock size={14} className="text-yellow-600 dark:text-yellow-400 sm:w-4 sm:h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Payment Verification</p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        We're verifying your payment details
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <Package size={14} className="text-blue-600 dark:text-blue-400 sm:w-4 sm:h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Order Processing</p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        We're preparing your order for shipment
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <Calendar size={14} className="text-purple-600 dark:text-purple-400 sm:w-4 sm:h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Tracking Information</p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        You'll receive tracking details via email
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <button
                onClick={() => navigate('/orders')}
                className="w-full flex items-center justify-center space-x-2 bg-primary text-white py-2 sm:py-3 rounded-lg hover:bg-primary-light transition-colors text-sm sm:text-base"
              >
                <span>View All Orders</span>
                <ArrowRight size={16} />
              </button>
              
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <Link
                  to="/"
                  className="flex items-center justify-center space-x-2 border border-gray-300 dark:border-gray-600 py-2 sm:py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs sm:text-sm"
                >
                  <Home size={14} className="sm:w-4 sm:h-4" />
                  <span>Home</span>
                </Link>
                
                <Link
                  to="/collections"
                  className="flex items-center justify-center space-x-2 border border-gray-300 dark:border-gray-600 py-2 sm:py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs sm:text-sm"
                >
                  <ShoppingBag size={14} className="sm:w-4 sm:h-4" />
                  <span>Shop More</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="text-center mt-6 sm:mt-8">
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Need help? <Link to="/contact" className="text-primary hover:underline">Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  );
}