import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Calendar, IndianRupee, Truck, CheckCircle, Clock } from 'lucide-react';
import { ordersService } from '../utils/databaseService';
import { Order } from '../types';
import { useApp } from '../contexts/AppContext';

export const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { state } = useApp();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      if (!orderId) return;

      const orderData = await ordersService.getOrder(orderId);
      console.log('Order data loaded:', orderData);
      console.log('Order items:', orderData?.order_items);
      setOrder(orderData);
    } catch (error) {
      console.error('Error loading order details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get product image with fallbacks - FIXED
  const getProductImage = (item: any) => {
    // First try the images array, then image_url, then fallbacks
    if (item.products?.images?.[0]) {
      return item.products.images[0];
    }
    return item.products?.image_url || 
           item.image_url || 
           '/placeholder-image.jpg';
  };

  // Helper function to get product name with fallbacks - FIXED
  const getProductName = (item: any) => {
    return item.products?.name || 
           item.name || 
           'Product description not available';
  };

  // Helper function to get product description with fallbacks - FIXED
  const getProductDescription = (item: any) => {
    return item.products?.description || 
           item.description || 
           'Product description not available';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'payment_review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Order Placed';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'completed':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      case 'payment_review':
        return 'Payment Review';
      case 'confirmed':
        return 'Confirmed';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'shipped':
        return <Truck className="text-purple-500" size={20} />;
      case 'payment_review':
        return <Clock className="text-yellow-500" size={20} />;
      default:
        return <Package className="text-blue-500" size={20} />;
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
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Order Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The order you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <button
              onClick={() => navigate('/orders')}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => navigate('/orders')}
              className="p-1 sm:p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-gray-900 dark:text-white">
                Order Details
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Order Status Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
              <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
                {getStatusIcon(order.status)}
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    Order Status
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Last updated: {new Date(order.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-3 sm:px-4 py-2 rounded-full text-sm sm:text-base font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
                {order.status === 'payment_review' && (
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    Waiting for payment verification
                  </p>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Order Items ({order.order_items?.length || 0})
              </h3>
              
              {!order.order_items || order.order_items.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500 dark:text-gray-400">No items found in this order</p>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {order.order_items.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <img
                        src={getProductImage(item)}
                        alt={getProductName(item)}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
                        onError={(e) => {
                          // Fallback if image fails to load
                          e.currentTarget.src = '/placeholder-image.jpg';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg mb-1">
                          {getProductName(item)}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-2">
                          {getProductDescription(item)}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          <span>Quantity: {item.quantity}</span>
                          {item.size && <span>• Size: {item.size}</span>}
                          {item.color && <span>• Color: {item.color}</span>}
                          {item.product_id && <span>• Product ID: {item.product_id.slice(0, 8)}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white text-base sm:text-lg">
                          ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          ₹{(item.price || 0).toLocaleString('en-IN')} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Order Information Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Order Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Order ID</span>
                  <span className="font-mono text-sm">{order.id.slice(0, 8).toUpperCase()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Order Date</span>
                  <span className="text-sm">
                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Items</span>
                  <span className="text-sm">{order.order_items?.length || 0}</span>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total Amount</span>
                    <span className="text-primary">
                      <IndianRupee size={18} className="inline" />
                      {order.total_amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shipping_address && (
              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Shipping Address
                </h3>
                
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-gray-900 dark:text-white">{order.shipping_address.name}</p>
                  <p className="text-gray-600 dark:text-gray-400">{order.shipping_address.address}</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">Phone: {order.shipping_address.phone}</p>
                  <p className="text-gray-600 dark:text-gray-400">Email: {order.shipping_address.email}</p>
                </div>
              </div>
            )}

            {/* Support Information */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Need Help?
              </h4>
              <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
                If you have any questions about your order, contact our support team.
              </p>
              <div className="space-y-2 text-sm">
                <p className="text-blue-600 dark:text-blue-400">
                  📧 support@kichofy.com
                </p>
                <p className="text-blue-600 dark:text-blue-400">
                  📞 +91 6374288038
                </p>
              </div>
            </div>

            {order.status === 'payment_review' && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                  Payment Verification
                </h4>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                  Your payment is being verified. We'll confirm your order within 24 hours.
                  You'll receive an email confirmation once verified.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};