import React, { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export const Notification: React.FC = () => {
  const { state, dispatch } = useApp();

  useEffect(() => {
    if (state.notification.show) {
      const timer = setTimeout(() => {
        dispatch({ type: 'CLEAR_NOTIFICATION' });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [state.notification.show, dispatch]);

  if (!state.notification.show) return null;

  const getIcon = () => {
    switch (state.notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    switch (state.notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className={`flex items-center p-4 rounded-lg border ${getStyles()} shadow-lg animate-in slide-in-from-right-5 duration-300`}>
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{state.notification.message}</p>
        </div>
        <button
          onClick={() => dispatch({ type: 'CLEAR_NOTIFICATION' })}
          className="flex-shrink-0 ml-3 hover:opacity-70 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};