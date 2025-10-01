import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Calendar, IndianRupee, Search, Filter, ArrowLeft } from 'lucide-react';
import { ordersService } from '../utils/databaseService';
import { Order } from '../types';
import { useApp } from '../contexts/AppContext';

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { state } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      if (!state.user) {
        navigate('/login');
        return;
      }
      
      const data = await ordersService.getUserOrders(state.user.id);
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
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

  const getProductNames = (order: Order) => {
    if (!order.order_items || order.order_items.length === 0) {
      return 'No products';
    }
    
    // Use the products data from order_items
    const names = order.order_items
      .slice(0, 2) // Show only first 2 products
      .map(item => item.products?.name || 'Product')
      .join(', ');
    
    if (order.order_items.length > 2) {
      return `${names} and ${order.order_items.length - 2} more`;
    }
    
    return names;
  };

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (statusFilter === '' || order.status === statusFilter)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-center py-8 sm:py-12">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Loading your orders...</p>
            </div>
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
              onClick={() => navigate(-1)}
              className="p-1 sm:p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-gray-900 dark:text-white">
                My Orders
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                Track and manage your orders ({orders.length} orders)
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg mb-4 sm:mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search orders by ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 sm:pl-12 sm:pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            
            {/* Status Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-8 sm:pl-12 sm:pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base appearance-none"
              >
                <option value="">All Status</option>
                <option value="pending">Order Placed</option>
                <option value="payment_review">Payment Review</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="completed">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Refresh Button */}
            <button 
              onClick={loadOrders}
              className="px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors text-sm sm:text-base font-medium flex items-center justify-center space-x-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh Orders</span>
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-3 sm:space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
              {/* Order Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 sm:mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                      Order #
                    </h3>
                    <code className="text-sm sm:text-base font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                      {order.id.slice(0, 8).toUpperCase()}
                    </code>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-1">
                    Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm truncate">
                    {getProductNames(order)}
                  </p>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4 mt-2 md:mt-0">
                  <span className={`inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                  <div className="flex items-center space-x-1 text-base sm:text-lg font-bold text-primary">
                    <IndianRupee size={16} className="sm:w-5 sm:h-5" />
                    <span>{order.total_amount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Order Footer */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4 mt-3 sm:mt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-2 sm:mb-0">
                    <Package size={16} className="sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-sm">
                      {order.order_items?.reduce((total, item) => total + (item.quantity || 1), 0) || 0} items
                    </span>
                  </div>
                  
                  <div className="flex space-x-2 sm:space-x-3">
                    <Link
                      to={`/order-details/${order.id}`}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs sm:text-sm font-medium"
                    >
                      View Details
                    </Link>
                    {order.status === 'shipped' && (
                      <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors text-xs sm:text-sm font-medium">
                        Track Order
                      </button>
                    )}
                    {order.status === 'payment_review' && (
                      <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-lg text-xs sm:text-sm font-medium">
                        Payment Under Review
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <div className="text-gray-400 mb-3 sm:mb-4">
              <Package size={48} className="mx-auto sm:w-16 sm:h-16" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchTerm || statusFilter ? 'No orders found' : 'No orders yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-4 sm:mb-6">
              {searchTerm || statusFilter 
                ? 'Try adjusting your search or filters'
                : 'Start shopping to see your orders here'
              }
            </p>
            {!searchTerm && !statusFilter && (
              <button
                onClick={() => navigate('/collections')}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors text-sm sm:text-base font-medium"
              >
                Start Shopping
              </button>
            )}
            {(searchTerm || statusFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                }}
                className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};