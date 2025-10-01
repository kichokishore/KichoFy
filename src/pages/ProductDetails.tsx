import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  Truck, 
  Shield, 
  ArrowLeft,
  Plus,
  Minus,
  Share2,
  Check,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { productsService, reviewsService } from '../utils/databaseService';
import { Product, Review } from '../types';
import { ScrollToTop } from '../components/Layout/ScrollToTop';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dispatch, state } = useApp();
  const { t } = useTranslation();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const productData = await productsService.getProductById(id);
        setProduct(productData);
        
        // Set default selections
        if (productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0]);
        }
        if (productData.colors.length > 0) {
          setSelectedColor(productData.colors[0]);
        }

        // Fetch reviews
        const reviewsData = await reviewsService.getProductReviews(id);
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error fetching product:', error);
        navigate('/collections');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id, navigate]);

  const addToCart = () => {
    if (!state.user) {
      navigate('/login');
      return;
    }

    if (!product) return;

    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        id: `cart_${product.id}_${Date.now()}`,
        user_id: state.user.id,
        product_id: product.id,
        quantity: quantity,
        size: selectedSize || product.sizes?.[0] || 'Free Size',
        color: selectedColor || product.colors?.[0] || 'Default',
        product: product,
      }
    });
  };

  const handleBuyNow = () => {
    if (!state.user) {
      navigate('/login');
      return;
    }

    addToCart();
    navigate('/cart');
  };

  const handleImageClick = (index: number) => {
    setModalImageIndex(index);
    setShowImageModal(true);
  };

  const navigateModalImage = (direction: 'prev' | 'next') => {
    const images = product?.images && product.images.length > 0 ? product.images : [product?.image_url].filter(Boolean);
    if (!images) return;

    if (direction === 'prev') {
      setModalImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
    } else {
      setModalImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
    }
  };

  const discount = product?.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Product Not Found</h2>
          <Link to="/collections" className="text-primary hover:text-primary-light">
            Back to Collections
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image_url].filter(Boolean);
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-3 sm:px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-3 sm:space-y-4">
            {/* Main Image */}
            <div 
              className="bg-gray-100 dark:bg-gray-800 rounded-xl sm:rounded-2xl overflow-hidden cursor-zoom-in"
              onClick={() => handleImageClick(activeImage)}
            >
              <img
                src={images[activeImage] || '/placeholder-image.jpg'}
                alt={product.name}
                className="w-full h-64 sm:h-80 md:h-96 object-contain"
              />
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex space-x-2 sm:space-x-3 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === index 
                        ? 'border-primary' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4 sm:space-y-6">
            {/* Breadcrumb */}
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <Link to="/" className="hover:text-primary">Home</Link>
              <span className="mx-1 sm:mx-2">/</span>
              <Link to="/collections" className="hover:text-primary">Collections</Link>
              {product.category_id && (
                <>
                  <span className="mx-1 sm:mx-2">/</span>
                  <span className="text-gray-900 dark:text-white">{product.category_id}</span>
                </>
              )}
            </div>

            {/* Product Title */}
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-gray-900 dark:text-white leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={`${
                          star <= product.rating!
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white ml-1 sm:ml-2">
                    {product.rating}
                  </span>
                </div>
                <span className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                  ({product.reviews.toLocaleString()} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline space-x-2 sm:space-x-4">
              <span className="text-2xl sm:text-3xl font-bold text-primary">
                ₹{product.price.toLocaleString()}
              </span>
              {product.original_price && (
                <>
                  <span className="text-lg sm:text-xl text-gray-400 line-through">
                    ₹{product.original_price.toLocaleString()}
                  </span>
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs sm:text-sm font-semibold">
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className={`inline-flex items-center px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold ${
              isOutOfStock 
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : isLowStock
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            }`}>
              {isOutOfStock ? 'Out of Stock' : 
               isLowStock ? `Only ${product.stock} left in stock` : 
               'In Stock'}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Description
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Size Selection */}
            {product.sizes.length > 0 && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                  Size: <span className="text-primary">{selectedSize}</span>
                </h3>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg border-2 transition-all text-sm sm:text-base ${
                        selectedSize === size
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-300 dark:border-gray-600 hover:border-primary'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors.length > 0 && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                  Color: <span className="text-primary">{selectedColor}</span>
                </h3>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg border-2 transition-all flex items-center space-x-2 text-sm sm:text-base ${
                        selectedColor === color
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-300 dark:border-gray-600 hover:border-primary'
                      }`}
                    >
                      <div 
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border"
                        style={{ backgroundColor: color.toLowerCase() }}
                      ></div>
                      <span>{color}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                Quantity
              </h3>
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="flex items-center space-x-2 sm:space-x-3 border border-gray-300 dark:border-gray-600 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 sm:w-12 text-center font-semibold text-sm sm:text-base">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {product.stock} available
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
              <button
                onClick={addToCart}
                disabled={isOutOfStock}
                className="flex-1 bg-primary hover:bg-primary-light text-white py-3 sm:py-4 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <ShoppingCart size={18} />
                <span>Add to Cart</span>
              </button>
              
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex-1 bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 text-white py-3 sm:py-4 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                Buy Now
              </button>

              <div className="flex xs:flex-col sm:flex-row gap-2 sm:gap-4">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="flex p-3 items-center justify-center sm:p-4 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex-1"
                >
                  <Heart 
                    size={18} 
                    className={isWishlisted ? 'fill-red-500 text-red-500' : ''}
                  />
                </button>

                <button className="flex p-3 sm:p-4 items-center justify-center border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex-1">
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Truck className="text-primary" size={16} />
                <div>
                  <p className="font-semibold text-sm sm:text-base">Free Shipping</p>
                  <p className="text-xs sm:text-sm text-gray-500">On orders above ₹999</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Shield className="text-primary" size={16} />
                <div>
                  <p className="font-semibold text-sm sm:text-base">Quality Guarantee</p>
                  <p className="text-xs sm:text-sm text-gray-500">Premium quality products</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Check className="text-primary" size={16} />
                <div>
                  <p className="font-semibold text-sm sm:text-base">Easy Returns</p>
                  <p className="text-xs sm:text-sm text-gray-500">30-day return policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 sm:mt-16 border-t border-gray-200 dark:border-gray-700 pt-8 sm:pt-16">
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-gray-900 dark:text-white mb-6 sm:mb-8">
            Customer Reviews ({reviews.length})
          </h2>
          
          {reviews.length > 0 ? (
            <div className="space-y-4 sm:space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold text-sm sm:text-base">
                        {review.profiles?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                        {review.profiles?.name || 'Anonymous'}
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={12}
                              className={`${
                                star <= review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs sm:text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-400 mb-3 sm:mb-4">
                <Star size={32} className="mx-auto" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No reviews yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                Be the first to review this product!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full w-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black/50 rounded-full p-2"
            >
              <X size={24} />
            </button>
            
            <button
              onClick={() => navigateModalImage('prev')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black/50 rounded-full p-2"
            >
              <ChevronLeft size={24} />
            </button>
            
            <button
              onClick={() => navigateModalImage('next')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black/50 rounded-full p-2"
            >
              <ChevronRight size={24} />
            </button>

            <img
              src={images[modalImageIndex]}
              alt={`${product.name} ${modalImageIndex + 1}`}
              className="w-full h-full object-contain max-h-[80vh]"
            />
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
              {modalImageIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};