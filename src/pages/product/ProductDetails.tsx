// src/pages/product/ProductDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { productService } from '../../services/supabaseService';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { Product, CartItem } from '../../types';
import { SizeSelector } from '../../components/product/SizeSelector';
import { ColorSelector } from '../../components/product/ColorSelector';
import { LoadingSpinner } from '../../components/UI/LoadingSpinner';
import { Button } from '../../components/UI/Button';
import { ProductReviews } from './ProductReviews';
import { RelatedProducts } from './RelatedProducts';
import { useTranslation } from '../../hooks/useTranslation';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { addToCart, updateCartQuantity } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { t } = useTranslation();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'shipping'>('description');

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);
      const response = await productService.getById(productId, `
        *,
        categories(*),
        inventory(*),
        reviews:reviews(
          *,
          profiles:user_id(name, avatar_url)
        )
      `);

      if (response.success && response.data) {
        setProduct(response.data as Product);
      } else {
        setError(response.error || 'Product not found');
      }
    } catch (err) {
      setError('Failed to fetch product');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    const cartItem: CartItem = {
      id: `temp_${Date.now()}`,
      product_id: product.id,
      quantity,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
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

  const handleBuyNow = () => {
    if (!product) return;

    const cartItem: CartItem = {
      id: `temp_${Date.now()}`,
      product_id: product.id,
      quantity,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      product: product
    };

    addToCart(cartItem);
    navigate('/cart');
  };

  const handleWishlistToggle = () => {
    if (!product) return;

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const getAvailableSizes = () => {
    if (!product?.inventory?.length) return product?.sizes || [];
    
    const availableSizes = product.inventory
      .filter(item => item.stock_quantity > 0)
      .map(item => item.size)
      .filter((size): size is string => size !== null);
    
    return [...new Set(availableSizes)];
  };

  const getAvailableColors = () => {
    if (!product?.inventory?.length) return product?.colors || [];
    
    const availableColors = product.inventory
      .filter(item => item.stock_quantity > 0)
      .map(item => item.color)
      .filter((color): color is string => color !== null);
    
    return [...new Set(availableColors)];
  };

  const getStockForVariant = () => {
    if (!product?.inventory?.length) return product?.stock || 0;
    
    const variant = product.inventory.find(item => 
      item.size === selectedSize && item.color === selectedColor
    );
    
    return variant?.stock_quantity || product.stock;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Product not found'}
          </h2>
          <Button
            onClick={() => navigate('/collections')}
            variant="primary"
          >
            {t('backToCollections')}
          </Button>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 
    ? product.images 
    : product.image_url 
      ? [product.image_url] 
      : ['/fallback.jpg'];

  const availableSizes = getAvailableSizes();
  const availableColors = getAvailableColors();
  const variantStock = getStockForVariant();
  const isOutOfStock = variantStock === 0;
  const discount = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <button
                onClick={() => navigate('/')}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              >
                {t('home')}
              </button>
            </li>
            <li>
              <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
            <li>
              <button
                onClick={() => navigate('/collections')}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              >
                {t('collections')}
              </button>
            </li>
            <li>
              <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
            <li>
              <span className="text-gray-500 dark:text-gray-400">{product.name}</span>
            </li>
          </ol>
        </nav>

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Image gallery */}
          <div className="flex flex-col-reverse">
            {/* Image selector */}
            <div className="w-full max-w-2xl mx-auto mt-6 hidden sm:block lg:max-w-none">
              <div className="grid grid-cols-4 gap-2" aria-orientation="horizontal">
                {images.map((image, index) => (
                  <button
                    key={index}
                    className={`relative h-24 bg-white dark:bg-gray-800 rounded-md flex items-center justify-center text-sm font-medium uppercase text-gray-900 dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring focus:ring-offset-4 focus:ring-opacity-50 ${
                      activeImage === index ? 'ring-2 ring-indigo-500' : ''
                    }`}
                    onClick={() => setActiveImage(index)}
                  >
                    <span className="sr-only">{product.name} image {index + 1}</span>
                    <img
                      src={image}
                      alt=""
                      className="w-full h-full object-center object-cover rounded-md"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full aspect-w-1 aspect-h-1">
              <img
                src={images[activeImage]}
                alt={product.name}
                className="w-full h-full object-center object-cover sm:rounded-lg"
              />
            </div>
          </div>

          {/* Product info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              {product.name}
            </h1>

            <div className="mt-3">
              <h2 className="sr-only">{t('productInformation')}</h2>
              <div className="flex items-center space-x-4">
                {product.rating && (
                  <div className="flex items-center">
                    <div className="flex items-center">
                      {[0, 1, 2, 3, 4].map((rating) => (
                        <svg
                          key={rating}
                          className={`h-5 w-5 flex-shrink-0 ${
                            product.rating && product.rating > rating
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
                    <p className="ml-2 text-sm text-gray-900 dark:text-white">
                      {product.rating} ({product.reviews} {t('reviews')})
                    </p>
                  </div>
                )}
                {product.is_best_seller && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                    {t('bestSeller')}
                  </span>
                )}
                {product.is_new && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                    {t('new')}
                  </span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="mt-6">
              <div className="flex items-center">
                {product.original_price && product.original_price > product.price ? (
                  <>
                    <p className="text-3xl text-gray-900 dark:text-white">
                      ₹{product.price.toLocaleString()}
                    </p>
                    <p className="ml-4 text-xl text-gray-500 dark:text-gray-400 line-through">
                      ₹{product.original_price.toLocaleString()}
                    </p>
                    <span className="ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
                      {discount}% OFF
                    </span>
                  </>
                ) : (
                  <p className="text-3xl text-gray-900 dark:text-white">
                    ₹{product.price.toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {/* Stock status */}
            <div className="mt-4">
              {isOutOfStock ? (
                <p className="text-sm text-red-600 dark:text-red-400">{t('outOfStock')}</p>
              ) : variantStock < 10 ? (
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  {t('only')} {variantStock} {t('leftInStock')}
                </p>
              ) : (
                <p className="text-sm text-green-600 dark:text-green-400">{t('inStock')}</p>
              )}
            </div>

            {/* Size selector */}
            {availableSizes.length > 0 && (
              <div className="mt-6">
                <SizeSelector
                  sizes={availableSizes}
                  selectedSize={selectedSize}
                  onSizeSelect={setSelectedSize}
                />
              </div>
            )}

            {/* Color selector */}
            {availableColors.length > 0 && (
              <div className="mt-6">
                <ColorSelector
                  colors={availableColors}
                  selectedColor={selectedColor}
                  onColorSelect={setSelectedColor}
                />
              </div>
            )}

            {/* Quantity selector */}
            <div className="mt-6">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('quantity')}
              </label>
              <div className="mt-1 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="p-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-400 hover:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">{t('decreaseQuantity')}</span>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="text-lg font-medium text-gray-900 dark:text-white">{quantity}</span>
                <button
                  type="button"
                  onClick={incrementQuantity}
                  disabled={quantity >= variantStock}
                  className="p-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-400 hover:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">{t('increaseQuantity')}</span>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-10 flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
              <Button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                variant="primary"
                className="flex-1"
              >
                {isOutOfStock ? t('outOfStock') : t('addToCart')}
              </Button>
              
              <Button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                variant="secondary"
                className="flex-1"
              >
                {t('buyNow')}
              </Button>

              <button
                type="button"
                onClick={handleWishlistToggle}
                className={`p-3 border border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-center text-sm font-medium ${
                  isInWishlist(product.id)
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-400 hover:text-gray-500 dark:hover:text-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                <svg
                  className={`h-6 w-6 flex-shrink-0 ${
                    isInWishlist(product.id) ? 'fill-current' : ''
                  }`}
                  fill={isInWishlist(product.id) ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span className="sr-only">
                  {isInWishlist(product.id) ? t('removeFromWishlist') : t('addToWishlist')}
                </span>
              </button>
            </div>

            {/* Product details */}
            <div className="mt-12">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: 'description', name: t('description') },
                    { id: 'reviews', name: t('reviews') },
                    { id: 'shipping', name: t('shipping') },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`whitespace-nowrap py-6 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="pt-6">
                {activeTab === 'description' && (
                  <div className="prose prose-sm text-gray-500 dark:text-gray-400 max-w-none">
                    <p>{product.description || t('noDescriptionAvailable')}</p>
                    
                    {product.tags && product.tags.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{t('tags')}:</h4>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {product.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <ProductReviews product={product} />
                )}

                {activeTab === 'shipping' && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <ul className="space-y-2">
                      <li>• {t('freeShipping')} ₹499</li>
                      <li>• {t('deliveryTime')} 3-7 {t('days')}</li>
                      <li>• {t('easyReturns')} 30 {t('days')}</li>
                      <li>• {t('securePayment')}</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        <RelatedProducts 
          productId={product.id} 
          categoryId={product.category_id} 
        />
      </div>
    </div>
  );
};

export default ProductDetails;