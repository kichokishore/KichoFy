import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  text,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'border-primary border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-400 border-t-transparent',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`
          border-2 rounded-full animate-spin
          ${sizeClasses[size]}
          ${colorClasses[color]}
        `}
      />
      {text && (
        <p
          className={`
            mt-3 text-gray-600 dark:text-gray-400 font-sans
            ${textSizeClasses[size]}
          `}
        >
          {text}
        </p>
      )}
    </div>
  );
};

// Page loading spinner
export const PageLoader: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" color="primary" />
        <p className="text-gray-600 dark:text-gray-300 mt-4 font-sans">{text}</p>
      </div>
    </div>
  );
};

// Content loading spinner
export const ContentLoader: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <LoadingSpinner size="lg" color="primary" />
    </div>
  );
};

// Button loading spinner (small inline)
export const ButtonSpinner: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`inline-flex ${className}`}>
      <LoadingSpinner size="sm" color="white" />
    </div>
  );
};

// Skeleton loader for content
export const SkeletonLoader: React.FC<{
  type?: 'text' | 'image' | 'card' | 'circle';
  className?: string;
}> = ({ type = 'text', className = '' }) => {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';

  const typeClasses = {
    text: 'h-4',
    image: 'h-48',
    card: 'h-64',
    circle: 'h-12 w-12 rounded-full',
  };

  return <div className={`${baseClasses} ${typeClasses[type]} ${className}`} />;
};

// Product card skeleton
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg mb-4"></div>
      <div className="space-y-2">
        <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded"></div>
        <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-3/4"></div>
        <div className="bg-gray-200 dark:bg-gray-700 h-6 rounded w-1/2"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;