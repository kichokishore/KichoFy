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
  Bell
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
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
                KichoFy CMS
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Welcome back, {user?.name || 'Admin'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {lowStockCount > 0 && (
                <div className="relative">
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm flex items-center">
                    <AlertTriangle size={16} className="mr-1" />
                    {lowStockCount} Low Stock
                  </div>
                </div>
              )}
              <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-light transition-colors flex items-center">
                <Plus size={18} className="mr-2" />
                Quick Action
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sticky top-24">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-primary text-white shadow-lg shadow-primary/25'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Quick Stats */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Online</span>
                    <span className="text-green-500 font-medium">Active</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Last Login</span>
                    <span className="text-gray-900 dark:text-white">Just now</span>
                  </div>
                  {lowStockCount > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Low Stock</span>
                      <span className="text-red-500 font-medium">{lowStockCount} items</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
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
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Products</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {dashboardStats.totalProducts}
              </p>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <Package className="text-primary" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-500">
            <TrendingUp size={16} className="mr-1" />
            <span>+{dashboardStats.monthlyGrowth}% this month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {dashboardStats.totalUsers}
              </p>
            </div>
            <div className="bg-green-500/10 p-3 rounded-full">
              <Users className="text-green-500" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-500">
            <TrendingUp size={16} className="mr-1" />
            <span>+{dashboardStats.monthlyGrowth}% this month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {dashboardStats.totalOrders}
              </p>
            </div>
            <div className="bg-blue-500/10 p-3 rounded-full">
              <ShoppingCart className="text-blue-500" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-500">
            <TrendingUp size={16} className="mr-1" />
            <span>+{dashboardStats.monthlyGrowth}% this month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(dashboardStats.totalRevenue)}
              </p>
            </div>
            <div className="bg-purple-500/10 p-3 rounded-full">
              <DollarSign className="text-purple-500" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-500">
            <TrendingUp size={16} className="mr-1" />
            <span>+{dashboardStats.monthlyGrowth}% this month</span>
          </div>
        </div>
      </div>

      {/* Alerts and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-6">
            Recent Orders
          </h2>
          <div className="space-y-4">
            {recentOrders.slice(0, 4).map((order) => (
              <div key={order.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white font-medium">
                    New order #{order.id.slice(0, 8)}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {order.profiles?.name || 'Customer'} • ₹{order.total_amount} • {new Date(order.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <button className="text-primary hover:text-primary-light transition-colors">
                  <Eye size={16} />
                </button>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No recent orders
              </p>
            )}
          </div>
        </div>

        {/* Email Notifications Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <Bell className="mr-2" size={20} />
            Email Notifications
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Low Stock Alerts</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Get notified when products are running low
                </p>
              </div>
              <button
                onClick={() => toggleEmailNotification('lowStock')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  emailNotifications.lowStock ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    emailNotifications.lowStock ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">New Order Notifications</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Receive emails for new orders
                </p>
              </div>
              <button
                onClick={() => toggleEmailNotification('newOrders')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  emailNotifications.newOrders ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    emailNotifications.newOrders ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {lowStockCount > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="text-red-500 mr-2" size={20} />
                  <div>
                    <p className="font-medium text-red-800 dark:text-red-300">
                      {lowStockCount} products running low on stock
                    </p>
                    <p className="text-red-600 dark:text-red-400 text-sm">
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
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
      <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-6">
        Settings
      </h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Store Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Store Name</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">KichoFy Fashion Store</p>
              </div>
              <button className="text-primary hover:text-primary-light transition-colors">
                Edit
              </button>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Currency</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Indian Rupee (₹)</p>
              </div>
              <button className="text-primary hover:text-primary-light transition-colors">
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};