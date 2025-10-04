import React from 'react';
import { PRODUCT_SIZES } from '../../utils/constants';

interface SizeSelectorProps {
  sizes: string[];
  selectedSize?: string;
  onSizeSelect: (size: string) => void;
  className?: string;
  disabled?: boolean;
}

export const SizeSelector: React.FC<SizeSelectorProps> = ({
  sizes,
  selectedSize,
  onSizeSelect,
  className = '',
  disabled = false,
}) => {
  const availableSizes = sizes.length > 0 ? sizes : PRODUCT_SIZES;

  return (
    <div className={className}>
      <h4 className="font-heading font-semibold text-gray-900 dark:text-white mb-3">
        Size
      </h4>
      <div className="flex flex-wrap gap-2">
        {availableSizes.map((size) => (
          <button
            key={size}
            onClick={() => onSizeSelect(size)}
            disabled={disabled}
            className={`
              px-4 py-2 border-2 rounded-full font-sans font-medium transition-all duration-200
              ${selectedSize === size
                ? 'border-primary bg-primary text-white'
                : 'border-gray-300 text-gray-700 hover:border-primary hover:text-primary'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
            `}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
};

// Size selector with stock information
interface SizeSelectorWithStockProps extends SizeSelectorProps {
  sizeStock?: { [size: string]: number };
}

export const SizeSelectorWithStock: React.FC<SizeSelectorWithStockProps> = ({
  sizes,
  selectedSize,
  onSizeSelect,
  sizeStock = {},
  className = '',
  disabled = false,
}) => {
  const availableSizes = sizes.length > 0 ? sizes : PRODUCT_SIZES;

  return (
    <div className={className}>
      <h4 className="font-heading font-semibold text-gray-900 dark:text-white mb-3">
        Size
      </h4>
      <div className="flex flex-wrap gap-2">
        {availableSizes.map((size) => {
          const stock = sizeStock[size] || 0;
          const isOutOfStock = stock === 0;
          const isLowStock = stock > 0 && stock <= 5;

          return (
            <button
              key={size}
              onClick={() => !isOutOfStock && onSizeSelect(size)}
              disabled={disabled || isOutOfStock}
              className={`
                relative px-4 py-2 border-2 rounded-full font-sans font-medium transition-all duration-200
                ${selectedSize === size
                  ? 'border-primary bg-primary text-white'
                  : isOutOfStock
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:border-primary hover:text-primary'
                }
                ${!isOutOfStock && !disabled ? 'hover:scale-105' : ''}
              `}
            >
              {size}
              {isLowStock && !isOutOfStock && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SizeSelector;