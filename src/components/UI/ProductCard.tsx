import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Eye, Star } from 'lucide-react';
import { Product } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { useTranslation } from '../..//hooks/useTranslation';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
  const { dispatch, state } = useApp();
  const { t } = useTranslation();

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!state.user) {
      // Redirect to login if user is not authenticated
      window.location.href = '/login';
      return;
    }
    
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        id: `cart_${product.id}_${Date.now()}`,
        user_id: state.user.id,
        product_id: product.id,
        quantity: 1,
        size: product.sizes?.[0] || 'Free Size',
        color: product.colors?.[0] || 'Default',
        product: product,
      }
    });
  };

  const discount = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden hover-lift ${className}`}>
      <div className="relative overflow-hidden flex-shrink-0">
        <img
          src={product.image_url || '/placeholder-image.jpg'}
          alt={product.name}
          className="w-full h-40 xs:h-44 sm:h-52 md:h-60 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Badges - Original position and colors */}
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
        </div>

        {/* Overlay Actions - Only on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex space-x-2 sm:space-x-3">
            <button className="bg-white text-gray-900 p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Heart size={14} className="sm:w-4 sm:h-4" />
            </button>
            <Link
              to={`/product/${product.id}`}
              className="bg-white text-gray-900 p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Eye size={14} className="sm:w-4 sm:h-4" />
            </Link>
            <button
              onClick={addToCart}
              className="bg-primary text-white p-1.5 sm:p-2 rounded-full hover:bg-primary-light transition-colors"
            >
              <ShoppingCart size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-3 sm:p-4">
        {/* Product Name */}
        <h3 className="font-heading text-sm sm:text-base font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 mb-2 flex-1">
          {product.name}
        </h3>

        {/* Description - Hidden on mobile, shown on sm and above with fixed height */}
        <div className="hidden sm:block mb-2 sm:mb-3 flex-shrink-0">
          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm line-clamp-2 min-h-[2.5rem]">
            {product.description}
          </p>
        </div>

        {/* Rating - Hidden on xs, shown on sm and above */}
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

        {/* Add to Cart Button - Full width on new line */}
        <button
          onClick={addToCart}
          className="w-full bg-primary text-white py-2.5 sm:py-3 rounded-lg hover:bg-primary-light transition-colors font-semibold text-sm sm:text-base flex items-center justify-center space-x-2 shadow-md hover:shadow-lg flex-shrink-0"
        >
          <ShoppingCart size={16} />
          <span>{t('addToCart')}</span>
        </button>
      </div>
    </div>
  );
};