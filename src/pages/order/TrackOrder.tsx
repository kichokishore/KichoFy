// src/pages/order/TrackOrder.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft as ArrowLeft,
  FiPackage as Package,
  FiTruck as Truck,
  FiCheckCircle as CheckCircle,
  FiClock as Clock,
  FiMapPin as MapPin,
  FiPhone as Phone,
  FiRefreshCw as Refresh,
  FiMessageCircle as MessageCircle
} from 'react-icons/fi';
import { useApp } from '../../contexts/AppContext';
import { useOrders } from '../../hooks/useOrders';
import { Order, OrderStatusHistory } from '../../types';
import { Button } from '../../components/UI/Button';
import { LoadingSpinner } from '../../components/UI/LoadingSpinner';

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

interface TrackingStep {
  status: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  active: boolean;
  date?: string;
}

export const TrackOrder: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { state } = useApp();
  const { getOrderById } = useOrders();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

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
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading order:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTrackingSteps = (order: Order): TrackingStep[] => {
    const steps: TrackingStep[] = [
      {
        status: 'pending',
        title: 'Order Placed',
        description: 'Your order has been received',
        icon: <Package size={16} />,
        completed: true,
        active: false,
        date: order.created_at
      },
      {
        status: 'confirmed',
        title: 'Order Confirmed',
        description: 'We\'ve confirmed your order',
        icon: <CheckCircle size={16} />,
        completed: ['confirmed', 'processing', 'shipped', 'delivered', 'completed'].includes(order.status),
        active: order.status === 'confirmed'
      },
      {
        status: 'processing',
        title: 'Processing',
        description: 'We\'re preparing your order',
        icon: <Package size={16} />,
        completed: ['processing', 'shipped', 'delivered', 'completed'].includes(order.status),
        active: order.status === 'processing'
      },
      {
        status: 'shipped',
        title: 'Shipped',
        description: 'Your order is on the way',
        icon: <Truck size={16} />,
        completed: ['shipped', 'delivered', 'completed'].includes(order.status),
        active: order.status === 'shipped'
      },
      {
        status: 'delivered',
        title: 'Out for Delivery',
        description: 'Your order is out for delivery',
        icon: <Truck size={16} />,
        completed: ['delivered', 'completed'].includes(order.status),
        active: order.status === 'delivered'
      },
      {
        status: 'completed',
        title: 'Delivered',
        description: 'Your order has been delivered',
        icon: <CheckCircle size={16} />,
        completed: order.status === 'completed',
        active: order.status === 'completed'
      }
    ];

    // Add dates from status history if available
    if (order.status_history) {
      order.status_history.forEach((history: OrderStatusHistory) => {
        const step = steps.find(s => s.status === history.status);
        if (step) {
          step.date = history.created_at;
        }
      });
    }

    return steps;
  };

  const getEstimatedDelivery = (order: Order): string => {
    if (order.estimated_delivery) {
      return new Date(order.estimated_delivery).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
    
    // Fallback estimation based on order date
    const orderDate = new Date(order.created_at);
    const estimatedDate = new Date(orderDate);
    estimatedDate.setDate(orderDate.getDate() + 7); // Default 7 days
    
    return estimatedDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-8 sm:py-12">
            <div className="text-center max-w-xs w-full">
              <LoadingSpinner size="large" />
              <p className="mt-4 text-gray-600 dark:text-gray-300 text-sm">Loading tracking information...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8 sm:py-12">
            <div className="text-red-500 mb-4">
              <Package size={48} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {error ? 'Error Loading Order' : 'Order Not Found'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 max-w-md mx-auto">
              {error || "We couldn't find tracking information for this order."}
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

  const trackingSteps = getTrackingSteps(order);
  const currentStepIndex = trackingSteps.findIndex(step => step.active || !step.completed);
  const estimatedDelivery = getEstimatedDelivery(order);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
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
                onClick={() => navigate(`/orders/${order.id}`)}
                className="p-1.5 sm:p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft size={16} className="sm:w-5 sm:h-5" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Track Your Order
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  Order #{order.id.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>
            
            <Button
              onClick={loadOrder}
              variant="secondary"
              size="sm"
              className="flex items-center text-xs sm:text-sm"
            >
              <Refresh className="mr-1 sm:mr-2" size={14} />
              Refresh
            </Button>
          </div>

          {/* Last Updated */}
          {lastUpdated && (
            <motion.div variants={itemVariants} className="text-center">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Last updated: {lastUpdated}
              </p>
            </motion.div>
          )}

          {/* Tracking Card */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  Order Status: <span className="text-primary capitalize">{order.status.replace('_', ' ')}</span>
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Estimated delivery: {estimatedDelivery}
                </p>
              </div>
              
              {order.tracking_number && (
                <div className="bg-primary/10 text-primary px-3 sm:px-4 py-2 rounded-lg">
                  <p className="text-sm font-semibold">Tracking #: {order.tracking_number}</p>
                </div>
              )}
            </div>

            {/* Tracking Progress */}
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700">
                <div 
                  className="bg-primary transition-all duration-500"
                  style={{ 
                    height: `${(currentStepIndex / (trackingSteps.length - 1)) * 100}%` 
                  }}
                />
              </div>

              {/* Steps */}
              <div className="space-y-6">
                {trackingSteps.map((step, index) => (
                  <div key={step.status} className="flex items-start space-x-4">
                    {/* Step Icon */}
                    <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                      step.completed 
                        ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' 
                        : step.active
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                    }`}>
                      {step.completed ? <CheckCircle size={16} /> : step.icon}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <h3 className={`font-semibold text-sm sm:text-base ${
                          step.completed || step.active
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {step.title}
                        </h3>
                        {step.date && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(step.date)}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs sm:text-sm mt-1 ${
                        step.completed || step.active
                          ? 'text-gray-600 dark:text-gray-300'
                          : 'text-gray-500 dark:text-gray-500'
                      }`}>
                        {step.description}
                      </p>
                      
                      {/* Status Note */}
                      {step.active && order.status_history && (
                        <div className="mt-2">
                          {order.status_history
                            .filter(history => history.status === step.status)
                            .map(history => (
                              <p key={history.id} className="text-xs text-primary italic">
                                {history.note}
                              </p>
                            ))
                          }
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Order Information */}
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            {/* Shipping Information */}
            {order.shipping_address && (
              <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
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
              </motion.div>
            )}

            {/* Support Card */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <MessageCircle className="mr-2 text-primary" size={18} />
                Need Help?
              </h3>
              <div className="space-y-3 text-sm">
                <p className="text-gray-600 dark:text-gray-400">
                  If you have any questions about your order delivery, our support team is here to help.
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone size={14} className="text-primary" />
                    <span className="text-gray-900 dark:text-white">+91 6374288038</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Available 9 AM - 7 PM, Monday to Saturday
                  </p>
                </div>

                <Button
                  onClick={() => navigate('/contact')}
                  variant="primary"
                  className="w-full text-sm mt-2"
                >
                  Contact Support
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Delivery Updates */}
          {order.status_history && order.status_history.length > 0 && (
            <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Delivery Updates
              </h3>
              <div className="space-y-3">
                {order.status_history
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .slice(0, 5)
                  .map(history => (
                    <div key={history.id} className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <Clock size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <p className="font-medium text-gray-900 dark:text-white text-sm capitalize">
                            {history.status.replace('_', ' ')}
                          </p>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(history.created_at)}
                          </span>
                        </div>
                        {history.note && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {history.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                }
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TrackOrder;