// src/components/UI/ProductCard.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, Star, ShoppingCart } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../hooks/useCart';
import { useApp } from '../../contexts/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import { IconButton } from './Button';
import { Modal } from './Modal';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { state: { user } } = useApp();
  const [isHovered, setIsHovered] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const isAuthenticated = !!user; // Check if user exists

  const discount = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  // FIX: Implement the missing getAvailableQuantity function
  const getAvailableQuantity = (product: Product): number => {
    return product.stock_quantity || 
           product.quantity || 
           product.inventory_count || 
           product.available_stock || 
           0;
  };

  // FIX: Implement isInCart function locally since it's missing from useCart
  const isInCart = (productId: string): boolean => {
    // This is a simple implementation - you might want to get this from your cart context
    // For now, we'll return false. You should implement proper cart state management.
    return false;
  };

  const availableQuantity = getAvailableQuantity(product);
  const isOutOfStock = availableQuantity === 0;
  const isInCartCheck = isInCart(product.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (isOutOfStock) {
      return;
    }

    try {
      setIsAddingToCart(true);
      await addToCart(
        product, 
        1, 
        product.sizes?.[0], 
        product.colors?.[0]
      );
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Quick view:', product.id);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Add to wishlist:', product.id);
  };

  const handleLoginRedirect = () => {
    setShowLoginModal(false);
    window.location.href = '/auth/login';
  };

  return (
    <>
      <div 
        className={`group flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden hover-lift ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative overflow-hidden flex-shrink-0">
          <img
            src={product.image_url || '/placeholder-image.jpg'}
            alt={product.name}
            className="w-full h-40 xs:h-44 sm:h-52 md:h-60 object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Badges */}
          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 flex gap-1 sm:gap-2">
            {product.is_new && (
              <span className="bg-gray-500/60 text-white text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap">
                NEW
              </span>
            )}
            {discount > 0 && (
              <span className="bg-gray-500/50 text-white text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap">
                -{discount}%
              </span>
            )}
            {product.is_best_seller && (
              <span className="bg-gray-500/60 text-white text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap">
                BEST
              </span>
            )}
            {isOutOfStock && (
              <span className="bg-red-500/80 text-white text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap">
                OUT OF STOCK
              </span>
            )}
          </div>

          {/* Overlay Actions */}
          <div className={`absolute inset-0 bg-black transition-opacity duration-300 flex items-center justify-center ${
            isHovered ? 'bg-opacity-40 opacity-100' : 'bg-opacity-0 opacity-0'
          }`}>
            <div className="flex space-x-2 sm:space-x-3">
              <IconButton
                icon={Heart}
                variant="ghost"
                size="sm"
                onClick={handleWishlist}
                className="bg-white text-gray-900 hover:bg-gray-100"
              />
              <Link
                to={`/product/${product.id}`}
                className="bg-white text-gray-900 p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center"
                onClick={handleQuickView}
              >
                <Eye size={14} className="sm:w-4 sm:h-4" />
              </Link>
              <IconButton
                icon={ShoppingCart}
                variant="primary"
                size="sm"
                onClick={handleAddToCart}
                loading={isAddingToCart}
                disabled={isOutOfStock}
                className={`${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 p-3 sm:p-4">
          {/* Product Name */}
          <Link to={`/product/${product.id}`}>
            <h3 className="font-heading text-sm sm:text-base font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 mb-2 flex-1">
              {product.name}
            </h3>
          </Link>

          {/* Description */}
          <div className="hidden sm:block mb-2 sm:mb-3 flex-shrink-0">
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm line-clamp-2 min-h-[2.5rem]">
              {product.description}
            </p>
          </div>

          {/* Rating */}
          {product.rating && (
            <div className="hidden sm:flex items-center mb-2 sm:mb-3 flex-shrink-0">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={12}
                    className={`sm:w-3.5 sm:h-3.5 ${
                      star <= product.rating!
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 ml-1 sm:ml-2">
                ({product.reviews || 0})
              </span>
            </div>
          )}

          {/* Price Section */}
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <span className="text-base sm:text-lg md:text-xl font-bold text-primary">
                ₹{product.price.toLocaleString()}
              </span>
              {product.original_price && (
                <span className="text-gray-400 line-through text-xs sm:text-sm">
                  ₹{product.original_price.toLocaleString()}
                </span>
              )}
            </div>
            
            {/* Quick rating for mobile */}
            {product.rating && (
              <div className="sm:hidden flex items-center space-x-1 text-xs text-gray-500">
                <Star size={10} className="text-yellow-400 fill-current" />
                <span>{product.rating}</span>
              </div>
            )}
          </div>

          {/* Stock Information */}
          {availableQuantity > 0 && availableQuantity < 10 && (
            <div className="mb-2 flex-shrink-0">
              <p className="text-xs text-orange-600 dark:text-orange-400">
                Only {availableQuantity} left in stock
              </p>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAddingToCart}
            className={`w-full py-2.5 sm:py-3 rounded-lg transition-colors font-semibold text-sm sm:text-base flex items-center justify-center space-x-2 shadow-md hover:shadow-lg flex-shrink-0 ${
              isOutOfStock 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : isInCartCheck
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-primary text-white hover:bg-primary-light'
            } ${isAddingToCart ? 'opacity-70 cursor-wait' : ''}`}
          >
            {isAddingToCart ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShoppingCart size={16} />
                <span>
                  {isOutOfStock 
                    ? 'Out of Stock' 
                    : isInCartCheck 
                    ? 'Added to Cart' 
                    : t('addToCart') || 'Add to Cart'
                  }
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Login Required Modal */}
      <Modal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Login Required"
        size="sm"
      >
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-6 font-sans">
            Please login to add items to your cart.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowLoginModal(false)}
              className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-colors font-sans"
            >
              Cancel
            </button>
            <button
              onClick={handleLoginRedirect}
              className="px-4 py-2 bg-primary text-white rounded-full font-semibold hover:bg-primary-light transition-all duration-300 hover:scale-105 font-sans"
            >
              Login
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};