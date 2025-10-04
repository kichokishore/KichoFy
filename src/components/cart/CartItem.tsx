// src/components/cart/CartItem.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, X, AlertCircle } from 'lucide-react';
import { CartItem as CartItemType } from '../../types';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatters';

interface CartItemProps {
  item: CartItemType;
  showActions?: boolean;
  compact?: boolean;
}

export const CartItem: React.FC<CartItemProps> = ({ 
  item, 
  showActions = true,
  compact = false 
}) => {
  const { updateQuantity, removeItem } = useCart();
  const [imageError, setImageError] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > (item.product?.stock || 99)) return;
    
    setUpdating(true);
    try {
      await updateQuantity(item.id, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async () => {
    setUpdating(true);
    try {
      await removeItem(item.id);
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleIncrement = () => handleQuantityChange(item.quantity + 1);
  const handleDecrement = () => handleQuantityChange(item.quantity - 1);

  const itemTotal = (item.product?.price || 0) * item.quantity;
  const isLowStock = item.product && item.product.stock > 0 && item.product.stock <= 10;
  const isOutOfStock = item.product && item.product.stock === 0;

  if (compact) {
    return (
      <div className="flex items-center space-x-3 py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <img
            src={imageError || !item.product?.image_url 
              ? '/assets/fallback.jpg' 
              : item.product.image_url
            }
            alt={item.product?.name || 'Product image'}
            className="w-12 h-12 object-cover rounded-lg"
            onError={() => setImageError(true)}
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <Link 
            to={`/product/${item.product_id}`}
            className="block font-medium text-gray-900 dark:text-white hover:text-primary truncate text-sm"
          >
            {item.product?.name}
          </Link>
          
          {/* Variants */}
          {(item.size || item.color) && (
            <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
              {item.size && <span>Size: {item.size}</span>}
              {item.color && <span>Color: {item.color}</span>}
            </div>
          )}

          {/* Price and Quantity */}
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatCurrency(item.product?.price || 0)}
              </span>
              <span className="text-gray-500">×</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {item.quantity}
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatCurrency(itemTotal)}
            </span>
          </div>
        </div>

        {/* Remove Button */}
        {showActions && (
          <button
            onClick={handleRemove}
            disabled={updating}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
          >
            <X size={16} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex py-6 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      {/* Product Image */}
      <div className="flex-shrink-0">
        <Link to={`/product/${item.product_id}`}>
          <img
            src={imageError || !item.product?.image_url 
              ? '/assets/fallback.jpg' 
              : item.product.image_url
            }
            alt={item.product?.name || 'Product image'}
            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg hover:opacity-90 transition-opacity"
            onError={() => setImageError(true)}
          />
        </Link>
      </div>

      {/* Product Details */}
      <div className="ml-4 flex-1 flex flex-col sm:flex-row sm:justify-between">
        <div className="flex-1 min-w-0">
          {/* Product Name and Link */}
          <Link 
            to={`/product/${item.product_id}`}
            className="text-lg font-medium text-gray-900 dark:text-white hover:text-primary transition-colors line-clamp-2"
          >
            {item.product?.name}
          </Link>

          {/* Product Description */}
          {item.product?.description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {item.product.description}
            </p>
          )}

          {/* Variant Details */}
          {(item.size || item.color) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {item.size && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  Size: {item.size}
                </span>
              )}
              {item.color && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  Color: {item.color}
                </span>
              )}
            </div>
          )}

          {/* Stock Status */}
          {isOutOfStock && (
            <div className="mt-2 flex items-center space-x-1 text-sm text-red-600 dark:text-red-400">
              <AlertCircle size={16} />
              <span>Out of Stock</span>
            </div>
          )}

          {isLowStock && (
            <div className="mt-2 flex items-center space-x-1 text-sm text-amber-600 dark:text-amber-400">
              <AlertCircle size={16} />
              <span>Only {item.product.stock} left in stock</span>
            </div>
          )}

          {/* Mobile: Price and Actions */}
          <div className="mt-4 sm:hidden">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(itemTotal)}
              </div>
              
              {showActions && (
                <button
                  onClick={handleRemove}
                  disabled={updating}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop: Price, Quantity, and Actions */}
        <div className="mt-4 sm:mt-0 sm:ml-6 flex sm:flex-col sm:items-end sm:justify-between">
          {/* Price */}
          <div className="hidden sm:block text-right">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(itemTotal)}
            </div>
            {item.quantity > 1 && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {formatCurrency(item.product?.price || 0)} each
              </div>
            )}
          </div>

          {/* Quantity Controls */}
          {showActions && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                <button
                  onClick={handleDecrement}
                  disabled={updating || item.quantity <= 1}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus size={16} />
                </button>
                
                <span className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white min-w-12 text-center">
                  {updating ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  ) : (
                    item.quantity
                  )}
                </span>
                
                <button
                  onClick={handleIncrement}
                  disabled={updating || (item.product && item.quantity >= item.product.stock)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Remove Button - Desktop */}
              <button
                onClick={handleRemove}
                disabled={updating}
                className="hidden sm:flex p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* Remove Button - Mobile (if no quantity controls) */}
          {showActions && !compact && (
            <button
              onClick={handleRemove}
              disabled={updating}
              className="sm:hidden mt-2 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 border border-red-300 dark:border-red-600 rounded-md transition-colors disabled:opacity-50"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartItem;