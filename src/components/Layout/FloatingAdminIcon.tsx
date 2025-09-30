import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, X, Package, Users, ShoppingCart, BarChart3 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export const FloatingAdminIcon: React.FC = () => {
  const { state } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);

  // Only show for admin users
  if (!state.user || state.user.role !== 'admin') {
    return null;
  }

  const adminLinks = [
    { to: '/admin/cms', icon: BarChart3, label: 'Dashboard' },
    { to: '/admin/cms?tab=products', icon: Package, label: 'Products' },
    { to: '/admin/cms?tab=users', icon: Users, label: 'Users' },
    { to: '/admin/cms?tab=orders', icon: ShoppingCart, label: 'Orders' },
  ];

  return (
    <>
      {/* Floating Admin Button */}
      <div className="fixed bottom-6 left-6 z-50">
        {/* Expanded Menu */}
        {isExpanded && (
          <div className="absolute bottom-16 left-0 mb-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 min-w-48">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Admin Panel</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            
            <div className="space-y-2">
              {adminLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsExpanded(false)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200 group"
                  >
                    <Icon size={18} className="text-gray-600 dark:text-gray-400 group-hover:text-primary" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary">
                      {link.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Quick Stats */}
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <div className="flex justify-between">
                  <span>Role:</span>
                  <span className="text-green-600 font-medium">Admin</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-green-600 font-medium">Online</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Floating Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`relative bg-primary hover:bg-primary-light text-white p-3 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-110 group ${
            isExpanded ? 'bg-primary-light shadow-lg' : 'shadow-xl'
          }`}
        >
          <Settings 
            size={24} 
            className={`transition-transform duration-300 ${
              isExpanded ? 'rotate-90' : 'group-hover:rotate-45'
            }`}
          />
          
          {/* Ping Animation */}
          <div className="absolute -top-1 -right-1">
            <div className="relative flex h-3 w-3">
              <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></div>
              <div className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></div>
            </div>
          </div>

          {/* Tooltip */}
          {!isExpanded && (
            <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-3 hidden group-hover:block">
              <div className="bg-gray-900 text-white text-xs font-medium px-2 py-1 rounded whitespace-nowrap">
                Admin Panel
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
              </div>
            </div>
          )}
        </button>
      </div>

      {/* Backdrop (optional - closes menu when clicking outside) */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
};