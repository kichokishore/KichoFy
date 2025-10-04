// src/pages/NotFound.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft, ShoppingBag, AlertCircle } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Animated 404 Illustration */}
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-16 h-16 text-primary" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold">4</span>
          </div>
          <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold">4</span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div>
            <h1 className="text-6xl font-heading font-bold text-gray-900 dark:text-white mb-2">
              404
            </h1>
            <h2 className="text-2xl font-heading font-semibold text-gray-900 dark:text-white mb-4">
              Page Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Oops! The page you're looking for seems to have wandered off. 
              Don't worry, let's get you back on track.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="flex items-center justify-center space-x-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-light transition-colors font-medium"
            >
              <Home size={20} />
              <span>Go Home</span>
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center space-x-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
            >
              <ArrowLeft size={20} />
              <span>Go Back</span>
            </button>
          </div>

          {/* Quick Links */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Popular Pages
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/collections"
                className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group"
              >
                <ShoppingBag size={16} className="text-gray-600 dark:text-gray-400 group-hover:text-primary transition-colors" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Collections</span>
              </Link>
              
              <Link
                to="/best-sellers"
                className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group"
              >
                <ShoppingBag size={16} className="text-gray-600 dark:text-gray-400 group-hover:text-primary transition-colors" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Best Sellers</span>
              </Link>
              
              <Link
                to="/new-arrivals"
                className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group"
              >
                <ShoppingBag size={16} className="text-gray-600 dark:text-gray-400 group-hover:text-primary transition-colors" />
                <span className="text-sm text-gray-700 dark:text-gray-300">New Arrivals</span>
              </Link>
              
              <Link
                to="/search"
                className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group"
              >
                <Search size={16} className="text-gray-600 dark:text-gray-400 group-hover:text-primary transition-colors" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Search</span>
              </Link>
            </div>
          </div>

          {/* Help Section */}
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Still can't find what you're looking for?
            </p>
            <div className="flex justify-center space-x-4 text-sm">
              <a
                href="mailto:support@kichofy.com"
                className="text-primary hover:text-primary-light transition-colors"
              >
                Contact Support
              </a>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <a
                href="tel:+916374288038"
                className="text-primary hover:text-primary-light transition-colors"
              >
                Call Us
              </a>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 flex justify-center space-x-2">
          {[1, 2, 3, 4, 5].map((dot) => (
            <div
              key={dot}
              className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce"
              style={{ animationDelay: `${dot * 0.1}s` }}
            />
          ))}
        </div>
      </div>

      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-light"></div>
      </div>
    </div>
  );
};

export default NotFound;