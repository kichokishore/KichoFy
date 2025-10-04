// src/pages/user/Wishlist.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FiHeart as Heart,
  FiShoppingCart as Cart,
  FiTrash2 as Trash,
  FiEye as Eye,
  FiSearch as Search
} from 'react-icons/fi';
import { useApp } from '../../contexts/AppContext';
import { useWishlist } from '../../hooks/useWishlist';
import { useCart } from '../../hooks/useCart';
import { Product } from '../../types';
import { Button } from '../../components/UI/Button';
import { LoadingSpinner } from '../../components/UI/LoadingSpinner';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export const Wishlist: React.FC = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const {
    wishlistItems,
    loading,
    error,
    removeFromWishlist,
    refreshWishlist
  } = useWishlist();
  const { addToCart } = useCart();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'name'>('newest');

  useEffect(() => {
    if (state.user) {
      refreshWishlist();
    }
  }, [state.user]);

  const filteredItems = wishlistItems.filter(item => 
    item.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product?.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'price-low':
        return (a.product?.price || 0) - (b.product?.price || 0);
      case 'price-high':
        return (b.product?.price || 0) - (a.product?.price || 0);
      case 'name':
        return (a.product?.name || '').localeCompare(b.product?.name || '');
      default:
        return 0;
    }
  });

  const handleAddToCart = (product: Product) => {
    const cartItem = {
      id: `temp_${Date.now()}`,
      product_id: product.id,
      quantity: 1,
      product: product
    };

    addToCart(cartItem);
    
    dispatch({
      type: 'SET_NOTIFICATION',
      payload: {
        type: 'success',
        message: `${product.name} added to cart`,
        show: true
      }
    });
  };

  const handleRemoveFromWishlist = async (wishlistItemId: string, productName: string) => {
    await removeFromWishlist(wishlistItemId);
    
    dispatch({
      type: 'SET_NOTIFICATION',
      payload: {
        type: 'info',
        message: `${productName} removed from wishlist`,
        show: true
      }
    });
  };

  const handleViewProduct = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  if (!state.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center max-w-xs w-full">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600 dark:text-gray-300 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 px-3 sm:px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4 sm:space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 sm:gap-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-red-100 dark:bg-red-900 rounded-full">
                <Heart className="text-red-500" size={16} sm:size={20} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  My Wishlist
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  {wishlistItems.length} items saved
                </p>
              </div>
            </div>
            
            <Button
              onClick={refreshWishlist}
              variant="secondary"
              disabled={loading}
              size="sm"
              className="flex items-center text-xs sm:text-sm"
            >
              Refresh
            </Button>
          </div>

          {/* Search and Sort */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search in wishlist..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-primary focus:border-primary"
                />
              </div>
              
              {/* Sort */}
              <div className="w-full sm:w-48">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-primary focus:border-primary"
                >
                  <option value="newest">Newest First</option>
                  <option value="name">Name A-Z</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 sm:p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg dark:bg-red-900 dark:text-red-100 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-8 sm:py-12">
              <LoadingSpinner size="large" />
            </div>
          )}

          {/* Wishlist Items */}
          {!loading && sortedItems.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="text-center py-8 sm:py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
            >
              <Heart className="mx-auto text-gray-400" size={48} />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                {searchTerm ? 'No matching items' : 'Your wishlist is empty'}
              </h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Start adding products you love to your wishlist'
                }
              </p>
              {searchTerm && (
                <Button
                  onClick={() => setSearchTerm('')}
                  variant="primary"
                  className="mt-4 text-sm"
                >
                  Clear Search
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {sortedItems.map((wishlistItem) => (
                <motion.div
                  key={wishlistItem.id}
                  variants={itemVariants}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  {/* Product Image */}
                  <div 
                    className="relative aspect-square bg-gray-100 dark:bg-gray-700 cursor-pointer"
                    onClick={() => handleViewProduct(wishlistItem.product.id)}
                  >
                    {wishlistItem.product.image_url ? (
                      <img
                        src={wishlistItem.product.image_url}
                        alt={wishlistItem.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Heart className="text-gray-400" size={32} />
                      </div>
                    )}
                    
                    {/* Out of Stock Badge */}
                    {wishlistItem.product.stock === 0 && (
                      <div className="absolute top-2 left-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                          Out of Stock
                        </span>
                      </div>
                    )}
                    
                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromWishlist(wishlistItem.id, wishlistItem.product.name);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
                    >
                      <Trash className="text-red-500" size={14} />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-3 sm:p-4">
                    <div className="space-y-2 sm:space-y-3">
                      {/* Product Name */}
                      <h3 
                        className="font-medium text-gray-900 dark:text-white text-sm sm:text-base line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleViewProduct(wishlistItem.product.id)}
                      >
                        {wishlistItem.product.name}
                      </h3>

                      {/* Price */}
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          ₹{wishlistItem.product.price.toLocaleString()}
                        </span>
                        {wishlistItem.product.original_price && wishlistItem.product.original_price > wishlistItem.product.price && (
                          <>
                            <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                              ₹{wishlistItem.product.original_price.toLocaleString()}
                            </span>
                            <span className="text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 px-1.5 py-0.5 rounded">
                              {Math.round(((wishlistItem.product.original_price - wishlistItem.product.price) / wishlistItem.product.original_price) * 100)}% OFF
                            </span>
                          </>
                        )}
                      </div>

                      {/* Rating */}
                      {wishlistItem.product.rating && (
                        <div className="flex items-center space-x-1">
                          <div className="flex">
                            {[0, 1, 2, 3, 4].map((star) => (
                              <svg
                                key={star}
                                className={`h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 ${
                                  wishlistItem.product.rating && wishlistItem.product.rating > star
                                    ? 'text-yellow-400'
                                    : 'text-gray-300 dark:text-gray-600'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({wishlistItem.product.reviews || 0})
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex space-x-2 pt-2">
                        <Button
                          onClick={() => handleViewProduct(wishlistItem.product.id)}
                          variant="secondary"
                          size="sm"
                          className="flex-1 flex items-center justify-center text-xs"
                        >
                          <Eye className="mr-1" size={12} />
                          View
                        </Button>
                        <Button
                          onClick={() => handleAddToCart(wishlistItem.product)}
                          variant="primary"
                          size="sm"
                          disabled={wishlistItem.product.stock === 0}
                          className="flex-1 flex items-center justify-center text-xs"
                        >
                          <Cart className="mr-1" size={12} />
                          {wishlistItem.product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Wishlist;