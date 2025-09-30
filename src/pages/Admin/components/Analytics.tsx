import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, ShoppingCart, DollarSign, Eye, Star } from 'lucide-react';
import { analyticsService } from '../../../utils/databaseService';

export const Analytics: React.FC = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    averageRating: 0,
    monthlyGrowth: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await analyticsService.getDashboardStats();
        setStats({
          totalRevenue: data.totalRevenue,
          totalOrders: data.totalOrders,
          totalUsers: data.totalUsers,
          averageRating: data.averageRating,
          monthlyGrowth: data.monthlyGrowth
        });
      } catch (error) {
        console.error('Error loading analytics:', error);
      }
    };

    loadStats();
  }, []);

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
          Analytics Dashboard
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Track your store performance and customer insights
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <div className="bg-green-500/10 p-3 rounded-full">
              <DollarSign className="text-green-500" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-500">
            <TrendingUp size={16} className="mr-1" />
            <span>+{stats.monthlyGrowth}% this month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.totalOrders}
              </p>
            </div>
            <div className="bg-blue-500/10 p-3 rounded-full">
              <ShoppingCart className="text-blue-500" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-500">
            <TrendingUp size={16} className="mr-1" />
            <span>+{stats.monthlyGrowth}% this month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.totalUsers}
              </p>
            </div>
            <div className="bg-purple-500/10 p-3 rounded-full">
              <Users className="text-purple-500" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-500">
            <TrendingUp size={16} className="mr-1" />
            <span>+{stats.monthlyGrowth}% this month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Avg. Rating</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.averageRating > 0 ? `${stats.averageRating}/5` : 'N/A'}
              </p>
            </div>
            <div className="bg-yellow-500/10 p-3 rounded-full">
              <Star className="text-yellow-500" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-500">
            <TrendingUp size={16} className="mr-1" />
            <span>+{stats.monthlyGrowth}% this month</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Sales Overview
          </h3>
          <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <TrendingUp size={48} className="mx-auto mb-2" />
              <p>Sales chart will be displayed here</p>
              <p className="text-sm mt-2">Total Revenue: {formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {[
              { name: 'Revenue Growth', value: `+${stats.monthlyGrowth}%`, type: 'revenue' },
              { name: 'New Customers', value: `+${stats.monthlyGrowth}%`, type: 'customers' },
              { name: 'Order Volume', value: `+${stats.monthlyGrowth}%`, type: 'orders' },
              { name: 'Customer Satisfaction', value: `${stats.averageRating > 0 ? stats.averageRating + '/5' : 'N/A'}`, type: 'rating' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    item.type === 'revenue' ? 'bg-green-500/10' :
                    item.type === 'customers' ? 'bg-blue-500/10' :
                    item.type === 'orders' ? 'bg-purple-500/10' : 'bg-yellow-500/10'
                  }`}>
                    <span className={`text-sm font-medium ${
                      item.type === 'revenue' ? 'text-green-500' :
                      item.type === 'customers' ? 'text-blue-500' :
                      item.type === 'orders' ? 'text-purple-500' : 'text-yellow-500'
                    }`}>
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">{item.value}</p>
                  <p className="text-green-500 text-sm">Active</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Performance Metrics</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Conversion Rate</span>
              <span className="font-medium">{(stats.totalOrders / Math.max(stats.totalUsers, 1) * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Avg. Order Value</span>
              <span className="font-medium">{formatCurrency(stats.totalRevenue / Math.max(stats.totalOrders, 1))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Customer Growth</span>
              <span className="font-medium">+{stats.monthlyGrowth}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Store Health</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Products</span>
              <span className="font-medium">{stats.totalOrders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Active Customers</span>
              <span className="font-medium">{stats.totalUsers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Monthly Growth</span>
              <span className="font-medium">+{stats.monthlyGrowth}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Revenue Insights</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Revenue</span>
              <span className="font-medium">{formatCurrency(stats.totalRevenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Revenue Growth</span>
              <span className="font-medium">+{stats.monthlyGrowth}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Orders Processed</span>
              <span className="font-medium">{stats.totalOrders}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};