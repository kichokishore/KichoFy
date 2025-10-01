import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  BarChart3, 
  Settings,
  Plus,
  TrendingUp,
  DollarSign,
  Eye,
  AlertTriangle,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';
import { ProductsManagement } from './components/ProductsManagement';
import { UsersManagement } from './components/UsersManagement';
import { OrdersManagement } from './components/OrdersManagement';
import { Analytics } from './components/Analytics';
import { Product, Order } from '../../types';
import { analyticsService } from '../../utils/databaseService';

type TabType = 'dashboard' | 'products' | 'users' | 'orders' | 'analytics' | 'settings';

export const CMS: React.FC = () => {
  const { user, isAdmin } = useAdmin();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [lowStockCount, setLowStockCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    averageRating: 0,
    monthlyGrowth: 0
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!isAdmin) {
    return null;
  }

  const tabs = [
    { id: 'dashboard' as TabType, name: 'Dashboard', icon: BarChart3 },
    { id: 'products' as TabType, name: 'Products', icon: Package },
    { id: 'users' as TabType, name: 'Users', icon: Users },
    { id: 'orders' as TabType, name: 'Orders', icon: ShoppingCart },
    { id: 'analytics' as TabType, name: 'Analytics', icon: TrendingUp },
    { id: 'settings' as TabType, name: 'Settings', icon: Settings },
  ];

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [stats, lowStockProducts, recentOrdersData] = await Promise.all([
          analyticsService.getDashboardStats(),
          analyticsService.getLowStockProducts(),
          analyticsService.getRecentOrders()
        ]);

        setDashboardStats(stats);
        setLowStockCount(lowStockProducts.length);
        setRecentOrders(recentOrdersData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  // Add these missing functions
  const handleLowStockAlert = (products: Product[]) => {
    setLowStockCount(products.length);
  };

  const handleNewOrder = (order: Order) => {
    // Handle new order notification
    console.log('New order received:', order);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductsManagement onLowStockAlert={handleLowStockAlert} />;
      case 'users':
        return <UsersManagement />;
      case 'orders':
        return <OrdersManagement onNewOrder={handleNewOrder} />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <Dashboard 
          lowStockCount={lowStockCount} 
          recentOrders={recentOrders}
          dashboardStats={dashboardStats}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-heading font-bold text-gray-900 dark:text-white">
                  KichoFy CMS
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                  Welcome back, {user?.name || 'Admin'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {lowStockCount > 0 && (
                <div className="relative">
                  <div className="bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex items-center">
                    <AlertTriangle size={14} className="mr-1" />
                    {lowStockCount} Low Stock
                  </div>
                </div>
              )}
              <button className="bg-primary text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-primary-light transition-colors flex items-center text-sm sm:text-base">
                <Plus size={16} className="mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Quick Action</span>
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Settings size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
          {/* Mobile Sidebar Overlay */}
          {isMobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div className={`
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
            w-64 flex-shrink-0 transition-transform duration-300 ease-in-out lg:transition-none
            bg-white dark:bg-gray-800 lg:bg-transparent lg:dark:bg-transparent
            lg:block
          `}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 h-full lg:h-auto lg:sticky lg:top-24 overflow-y-auto lg:overflow-visible">
              {/* Mobile Close Button */}
              <div className="flex justify-between items-center mb-4 lg:hidden">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="space-y-1 sm:space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-200 text-sm sm:text-base ${
                        activeTab === tab.id
                          ? 'bg-primary text-white shadow-lg shadow-primary/25'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon size={18} className="sm:w-5 sm:h-5" />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Quick Stats */}
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Online</span>
                    <span className="text-green-500 font-medium">Active</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Last Login</span>
                    <span className="text-gray-900 dark:text-white">Just now</span>
                  </div>
                  {lowStockCount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Low Stock</span>
                      <span className="text-red-500 font-medium">{lowStockCount} items</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0"> {/* min-w-0 prevents flex item from overflowing */}
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Component with enhanced props
interface DashboardProps {
  lowStockCount: number;
  recentOrders: Order[];
  dashboardStats: {
    totalProducts: number;
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    averageRating: number;
    monthlyGrowth: number;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ lowStockCount, recentOrders, dashboardStats }) => {
  const [emailNotifications, setEmailNotifications] = useState({
    lowStock: true,
    newOrders: true
  });

  const toggleEmailNotification = async (type: 'lowStock' | 'newOrders') => {
    setEmailNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
    
    console.log(`${type} notifications ${emailNotifications[type] ? 'disabled' : 'enabled'}`);
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount}`;
  };

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Total Products</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {dashboardStats.totalProducts}
              </p>
            </div>
            <div className="bg-primary/10 p-2 sm:p-3 rounded-full">
              <Package className="text-primary w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4 flex items-center text-xs sm:text-sm text-green-500">
            <TrendingUp size={14} className="mr-1" />
            <span>+{dashboardStats.monthlyGrowth}% this month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Total Users</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {dashboardStats.totalUsers}
              </p>
            </div>
            <div className="bg-green-500/10 p-2 sm:p-3 rounded-full">
              <Users className="text-green-500 w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4 flex items-center text-xs sm:text-sm text-green-500">
            <TrendingUp size={14} className="mr-1" />
            <span>+{dashboardStats.monthlyGrowth}% this month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Total Orders</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {dashboardStats.totalOrders}
              </p>
            </div>
            <div className="bg-blue-500/10 p-2 sm:p-3 rounded-full">
              <ShoppingCart className="text-blue-500 w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4 flex items-center text-xs sm:text-sm text-green-500">
            <TrendingUp size={14} className="mr-1" />
            <span>+{dashboardStats.monthlyGrowth}% this month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Revenue</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(dashboardStats.totalRevenue)}
              </p>
            </div>
            <div className="bg-purple-500/10 p-2 sm:p-3 rounded-full">
              <DollarSign className="text-purple-500 w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>
          <div className="mt-2 sm:mt-4 flex items-center text-xs sm:text-sm text-green-500">
            <TrendingUp size={14} className="mr-1" />
            <span>+{dashboardStats.monthlyGrowth}% this month</span>
          </div>
        </div>
      </div>

      {/* Alerts and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
          <h2 className="text-lg sm:text-xl font-heading font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Recent Orders
          </h2>
          <div className="space-y-3 sm:space-y-4">
            {recentOrders.slice(0, 4).map((order) => (
              <div key={order.id} className="flex items-center space-x-3 sm:space-x-4 p-2 sm:p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-500 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 dark:text-white font-medium text-sm sm:text-base truncate">
                    New order #{order.id.slice(0, 8)}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm truncate">
                    {order.profiles?.name || 'Customer'} • ₹{order.total_amount} • {new Date(order.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <button className="text-primary hover:text-primary-light transition-colors flex-shrink-0">
                  <Eye size={14} className="sm:w-4 sm:h-4" />
                </button>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-3 sm:py-4 text-sm sm:text-base">
                No recent orders
              </p>
            )}
          </div>
        </div>

        {/* Email Notifications Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
          <h2 className="text-lg sm:text-xl font-heading font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
            <Bell className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
            Email Notifications
          </h2>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex-1 min-w-0 mr-3">
                <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Low Stock Alerts</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                  Get notified when products are running low
                </p>
              </div>
              <button
                onClick={() => toggleEmailNotification('lowStock')}
                className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                  emailNotifications.lowStock ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                    emailNotifications.lowStock ? 'translate-x-4 sm:translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex-1 min-w-0 mr-3">
                <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">New Order Notifications</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                  Receive emails for new orders
                </p>
              </div>
              <button
                onClick={() => toggleEmailNotification('newOrders')}
                className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                  emailNotifications.newOrders ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                    emailNotifications.newOrders ? 'translate-x-4 sm:translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {lowStockCount > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
                <div className="flex items-center">
                  <AlertTriangle className="text-red-500 mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-red-800 dark:text-red-300 text-sm sm:text-base">
                      {lowStockCount} products running low on stock
                    </p>
                    <p className="text-red-600 dark:text-red-400 text-xs sm:text-sm">
                      Check the products page to restock
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Settings Panel Component
const SettingsPanel: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
      <h2 className="text-lg sm:text-xl font-heading font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
        Settings
      </h2>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Store Settings</h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex-1 min-w-0 mr-3">
                <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Store Name</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">KichoFy Fashion Store</p>
              </div>
              <button className="text-primary hover:text-primary-light transition-colors text-sm sm:text-base flex-shrink-0">
                Edit
              </button>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex-1 min-w-0 mr-3">
                <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Currency</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Indian Rupee (₹)</p>
              </div>
              <button className="text-primary hover:text-primary-light transition-colors text-sm sm:text-base flex-shrink-0">
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};