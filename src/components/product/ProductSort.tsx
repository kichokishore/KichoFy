import React from 'react';
import { ChevronDown } from 'lucide-react';
import { SORT_OPTIONS } from '../../utils/constants';

interface ProductSortProps {
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  className?: string;
}

export const ProductSort: React.FC<ProductSortProps> = ({
  sortBy,
  onSortChange,
  className = '',
}) => {
  const currentSort = SORT_OPTIONS.find(option => option.value === sortBy) || SORT_OPTIONS[0];

  return (
    <div className={`relative ${className}`}>
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white font-sans cursor-pointer"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
    </div>
  );
};

// Sort with label
export const ProductSortWithLabel: React.FC<ProductSortProps> = (props) => {
  return (
    <div className="flex items-center space-x-3">
      <span className="text-gray-700 dark:text-gray-300 font-sans font-medium whitespace-nowrap">
        Sort by:
      </span>
      <ProductSort {...props} />
    </div>
  );
};

export default ProductSort;