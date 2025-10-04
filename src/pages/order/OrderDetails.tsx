// src/pages/order/OrderDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft as ArrowLeft,
  FiPackage as Package,
  FiCalendar as Calendar,
  FiTruck as Truck,
  FiMapPin as MapPin,
  FiDollarSign as DollarSign,
  FiCreditCard as CreditCard,
  FiRefreshCw as Refresh,
  FiPrinter as Printer,
  FiMessageCircle as MessageCircle
} from 'react-icons/fi';
import { useApp } from '../../contexts/AppContext';
import { useOrders } from '../../hooks/useOrders';
import { Order, OrderItem } from '../../types';
import { Button } from '../../components/UI/Button';
import { LoadingSpinner } from '../../components/UI/LoadingSpinner';
import { OrderStatusBadge } from '../../components/order/OrderStatusBadge';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { state } = useApp();
  const { getOrderById, refreshOrders } = useOrders();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!state.user) {
        navigate('/login');
        return;
      }

      const orderData = await getOrderById(orderId!);
      setOrder(orderData);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadOrder();
    await refreshOrders();
  };

  const handlePrint = () => {
    window.print();
  };

  const getTotalItems = (order: Order) => {
    return order.order_items?.reduce((total, item) => total + item.quantity, 0) || 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodText = (method?: string) => {
    switch (method) {
      case 'upi': return 'UPI';
      case 'card': return 'Credit/Debit Card';
      case 'netbanking': return 'Net Banking';
      case 'wallet': return 'Wallet';
      case 'emi': return 'EMI';
      case 'cash_on_delivery': return 'Cash on Delivery';
      default: return 'Online Payment';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 px-3 sm:px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-8 sm:py-12">
            <div className="text-center max-w-xs w-full">
              <LoadingSpinner size="large" />
              <p className="mt-4 text-gray-600 dark:text-gray-300 text-sm">Loading order details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 px-3 sm:px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-8 sm:py-12">
            <div className="text-red-500 mb-4">
              <Package size={48} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {error ? 'Error Loading Order' : 'Order Not Found'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 max-w-md mx-auto">
              {error || "The order you're looking for doesn't exist or you don't have permission to view it."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => navigate('/orders')}
                variant="primary"
                className="text-sm"
              >
                View All Orders
              </Button>
              <Button
                onClick={loadOrder}
                variant="secondary"
                className="text-sm"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 px-3 sm:px-4 print:bg-white print:dark:bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4 sm:space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 sm:gap-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => navigate('/orders')}
                className="p-1.5 sm:p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft size={16} className="sm:w-5 sm:h-5" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Order Details
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  Order #{order.id.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleRefresh}
                variant="secondary"
                size="sm"
                className="flex items-center text-xs sm:text-sm"
              >
                <Refresh className="mr-1 sm:mr-2" size={14} />
                Refresh
              </Button>
              <Button
                onClick={handlePrint}
                variant="secondary"
                size="sm"
                className="flex items-center text-xs sm:text-sm print:hidden"
              >
                <Printer className="mr-1 sm:mr-2" size={14} />
                Print
              </Button>
            </div>
          </div>

          {/* Order Status Card */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full">
                  <Package className="text-primary" size={20} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    Order Status
                  </h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <OrderStatusBadge status={order.status} />
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      Updated {formatDate(order.updated_at)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:items-end space-y-1">
                <div className="flex items-center space-x-1 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  <DollarSign size={16} className="sm:w-5 sm:h-5" />
                  <span>₹{order.total_amount.toLocaleString()}</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {getTotalItems(order)} items
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Order Items */}
            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Order Items List */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Order Items ({getTotalItems(order)})
                </h3>
                <div className="space-y-4">
                  {order.order_items?.map((item: OrderItem) => (
                    <div key={item.id} className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden flex-shrink-0">
                        {item.product?.image_url ? (
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="text-gray-400" size={24} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base line-clamp-2">
                          {item.product?.name || 'Product'}
                        </h4>
                        <div className="flex flex-wrap gap-2 mt-1 sm:mt-2">
                          {item.size && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Size: {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Color: {item.color}
                            </span>
                          )}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Qty: {item.quantity}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2 sm:mt-3">
                          <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                            ₹{item.price.toLocaleString()}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            Total: ₹{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Order Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="text-gray-900 dark:text-white">
                      ₹{order.total_amount.toLocaleString()}
                    </span>
                  </div>
                  {order.discount_amount && order.discount_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Discount</span>
                      <span className="text-green-600 dark:text-green-400">
                        -₹{order.discount_amount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {order.shipping_method && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                      <span className="text-gray-900 dark:text-white">
                        ₹{order.shipping_method.cost.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span>Total</span>
                    <span className="text-primary">
                      ₹{order.total_amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Order Information Sidebar */}
            <motion.div variants={itemVariants} className="space-y-4 sm:space-y-6">
              {/* Shipping Address */}
              {order.shipping_address && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <MapPin className="mr-2 text-primary" size={18} />
                    Shipping Address
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p className="font-medium text-gray-900 dark:text-white">{order.shipping_address.name}</p>
                    <p>{order.shipping_address.street}</p>
                    <p>
                      {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                    </p>
                    {order.shipping_address.country && <p>{order.shipping_address.country}</p>}
                    {order.shipping_address.phone && <p>{order.shipping_address.phone}</p>}
                  </div>
                </div>
              )}

              {/* Order Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <Calendar className="mr-2 text-primary" size={18} />
                  Order Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Order ID</p>
                    <p className="font-mono text-gray-900 dark:text-white">{order.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Order Date</p>
                    <p className="text-gray-900 dark:text-white">{formatDate(order.created_at)}</p>
                  </div>
                  {order.payment_session_id && (
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Payment Session</p>
                      <p className="font-mono text-xs text-gray-900 dark:text-white">{order.payment_session_id}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <CreditCard className="mr-2 text-primary" size={18} />
                  Payment Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Payment Status</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      order.payment_status === 'paid' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                        : order.payment_status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                    }`}>
                      {order.payment_status?.toUpperCase()}
                    </span>
                  </div>
                  {order.payments && order.payments.length > 0 && (
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Payment Method</p>
                      <p className="text-gray-900 dark:text-white">
                        {getPaymentMethodText(order.payments[0].method)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Order Actions
                </h3>
                <div className="space-y-2">
                  {order.status === 'shipped' && (
                    <Button
                      onClick={() => navigate(`/track-order/${order.id}`)}
                      variant="primary"
                      className="w-full flex items-center justify-center text-sm"
                    >
                      <Truck className="mr-2" size={16} />
                      Track Order
                    </Button>
                  )}
                  <Button
                    onClick={() => navigate('/contact')}
                    variant="secondary"
                    className="w-full flex items-center justify-center text-sm"
                  >
                    <MessageCircle className="mr-2" size={16} />
                    Contact Support
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderDetails;