import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Eye, Star } from 'lucide-react';
import { Product } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { useTranslation } from '../../hooks/useTranslation';

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
    <div className={`group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden hover-lift ${className}`}>
      <div className="relative overflow-hidden">
        <img
          src={product.image_url || '/placeholder-image.jpg'}
          alt={product.name}
          className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col space-y-2">
          {product.is_new && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              NEW
            </span>
          )}
          {discount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              -{discount}%
            </span>
          )}
          {product.is_best_seller && (
            <span className="bg-primary text-white text-xs px-2 py-1 rounded-full font-medium">
              BESTSELLER
            </span>
          )}
        </div>

        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex space-x-3">
            <button className="bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Heart size={18} />
            </button>
            <Link
              to={`/product/${product.id}`}
              className="bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Eye size={18} />
            </Link>
            <button
              onClick={addToCart}
              className="bg-primary text-white p-2 rounded-full hover:bg-primary-light transition-colors"
            >
              <ShoppingCart size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-2">
          <h3 className="font-heading text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center mb-3">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  className={`${
                    star <= product.rating!
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
              ({product.reviews})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">
              ₹{product.price.toLocaleString()}
            </span>
            {product.original_price && (
              <span className="text-gray-400 line-through text-sm">
                ₹{product.original_price.toLocaleString()}
              </span>
            )}
          </div>
          
          <button
            onClick={addToCart}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-light transition-colors text-sm font-medium"
          >
            {t('addToCart')}
          </button>
        </div>

        {/* Stock Status */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <span className={`text-xs font-medium ${
            product.stock > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {product.stock > 0 ? `${t('inStock')} (${product.stock})` : t('outOfStock')}
          </span>
        </div>
      </div>
    </div>
  );
};