// src/pages/product/ProductReviews.tsx
import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Review, Product } from '../../types';
import { supabase } from '../../services/supabaseService';
import { Button } from '../../components/UI/Button';
import { LoadingSpinner } from '../../components/UI/LoadingSpinner';
import { useTranslation } from '../../hooks/useTranslation';

interface ProductReviewsProps {
  product: Product;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ product }) => {
  const { state } = useApp();
  const { t } = useTranslation();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    fetchReviews();
  }, [product.id]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:user_id(name, avatar_url)
        `)
        .eq('product_id', product.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.user) {
      // Show login prompt
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .insert([
          {
            product_id: product.id,
            user_id: state.user.id,
            rating: newReview.rating,
            comment: newReview.comment
          }
        ]);

      if (error) throw error;

      // Refresh reviews
      await fetchReviews();
      
      // Reset form
      setNewReview({ rating: 5, comment: '' });
      setShowReviewForm(false);
      
      // Show success message
      // You can add a notification here
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const hasPurchasedProduct = () => {
    // Implement logic to check if user has purchased this product
    // This would require checking the user's order history
    return false;
  };

  const canReview = state.user && hasPurchasedProduct();

  if (loading) {
    return <LoadingSpinner size="small" />;
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(review => review.rating === stars).length,
    percentage: reviews.length > 0 ? (reviews.filter(review => review.rating === stars).length / reviews.length) * 100 : 0
  }));

  return (
    <div className="space-y-8">
      {/* Review Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="text-5xl font-bold text-gray-900 dark:text-white">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex justify-center mt-2">
            {[0, 1, 2, 3, 4].map((rating) => (
              <svg
                key={rating}
                className={`h-5 w-5 flex-shrink-0 ${
                  averageRating > rating
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
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {reviews.length} {t('reviews')}
          </p>
        </div>

        <div className="md:col-span-2">
          <div className="space-y-2">
            {ratingDistribution.map(({ stars, count, percentage }) => (
              <div key={stars} className="flex items-center">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 w-8">
                  {stars}
                </div>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mx-2">
                  <div
                    className="h-2 bg-yellow-400 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 w-12 text-right">
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Form */}
      {state.user ? (
        canReview ? (
          !showReviewForm ? (
            <Button
              onClick={() => setShowReviewForm(true)}
              variant="primary"
            >
              {t('writeReview')}
            </Button>
          ) : (
            <form onSubmit={handleSubmitReview} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('writeReview')}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('rating')}
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                      className="text-2xl focus:outline-none"
                    >
                      {star <= newReview.rating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('review')}
                </label>
                <textarea
                  id="comment"
                  rows={4}
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder={t('shareYourExperience')}
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  type="submit"
                  disabled={submitting || !newReview.comment.trim()}
                  variant="primary"
                >
                  {submitting ? t('submitting') : t('submitReview')}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  variant="secondary"
                >
                  {t('cancel')}
                </Button>
              </div>
            </form>
          )
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('purchaseToReview')}
          </p>
        )
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('loginToReview')}
        </p>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            {t('noReviewsYet')}
          </p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    {review.profiles?.avatar_url ? (
                      <img
                        src={review.profiles.avatar_url}
                        alt={review.profiles.name || 'User'}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {(review.profiles?.name || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {review.profiles?.name || t('anonymous')}
                    </p>
                    <div className="flex items-center">
                      <div className="flex">
                        {[0, 1, 2, 3, 4].map((rating) => (
                          <svg
                            key={rating}
                            className={`h-4 w-4 flex-shrink-0 ${
                              review.rating > rating
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
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {review.comment && (
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                  {review.comment}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews;