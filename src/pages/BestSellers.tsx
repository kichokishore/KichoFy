import React from 'react';
import { Award, Star, TrendingUp, Users } from 'lucide-react';
import { ProductCard } from '../components/UI/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { useTranslation } from '../hooks/useTranslation';

export const BestSellers: React.FC = () => {
  const { t } = useTranslation();
  const { products: bestSellerProducts, loading: bestSellersLoading } = useProducts({ isBestSeller: true });
  const { products: allProducts, loading: allLoading } = useProducts();

  const topRatedProducts = allProducts
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 8);

  if (bestSellersLoading || allLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading best sellers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-fadeIn">
      {/* Header */}
      <section className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="bg-primary/10 p-4 rounded-full">
                <Award className="text-primary" size={32} />
              </div>
            </div>
            <h1 className="text-5xl lg:text-6xl font-heading font-bold text-gray-900 dark:text-white mb-6">
              {t('bestSellers')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Customer favorites that have earned their place at the top. These timeless pieces 
              continue to win hearts and compliments everywhere.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <Users size={16} />
                <span>Customer Favorites</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star size={16} />
                <span>Top Rated</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp size={16} />
                <span>Most Loved</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers Grid */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-4">
              Top Performers
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              These products have consistently been our customers' top choices, 
              loved for their quality, style, and versatility.
            </p>
          </div>

          {bestSellerProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
              {bestSellerProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <Award size={64} className="mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Best sellers coming soon
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We're currently updating our best seller collection
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Customer Favorites */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-4">
              Highest Rated
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Products with the highest customer ratings and glowing reviews. 
              See what makes our customers happy!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {topRatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Why These Are Best Sellers */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-4">
              Why Customers Love These
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              What makes a product a best seller? Here's what our customers tell us.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <Award className="text-primary" size={32} />
              </div>
              <h3 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-4">
                Exceptional Quality
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Premium materials and impeccable craftsmanship that customers notice and appreciate. 
                Quality that stands the test of time.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <Star className="text-primary" size={32} />
              </div>
              <h3 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-4">
                Perfect Fit & Comfort
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Designed with the modern woman in mind. Comfortable fits that flatter 
                every body type and make you feel confident.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <Users className="text-primary" size={32} />
              </div>
              <h3 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-4">
                Versatile Styling
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Pieces that work for multiple occasions and can be styled in different ways. 
                Maximum versatility for your wardrobe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary-light">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-heading font-bold text-white mb-12">
            What Our Customers Say
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white">
              <div className="flex justify-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="text-yellow-400 fill-current" size={20} />
                ))}
              </div>
              <p className="mb-6 leading-relaxed">
                "I've ordered multiple pieces from the best sellers collection and each one 
                has exceeded my expectations. The quality is outstanding!"
              </p>
              <div className="font-semibold">- Priya S.</div>
              <div className="text-white/80 text-sm">Mumbai</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white">
              <div className="flex justify-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="text-yellow-400 fill-current" size={20} />
                ))}
              </div>
              <p className="mb-6 leading-relaxed">
                "Best sellers for a reason! Perfect fit, beautiful colors, and I always 
                get compliments when I wear KichoFy outfits."
              </p>
              <div className="font-semibold">- Anita K.</div>
              <div className="text-white/80 text-sm">Delhi</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white">
              <div className="flex justify-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="text-yellow-400 fill-current" size={20} />
                ))}
              </div>
              <p className="mb-6 leading-relaxed">
                "These pieces have become staples in my wardrobe. Great value for money 
                and the customer service is excellent too!"
              </p>
              <div className="font-semibold">- Meera R.</div>
              <div className="text-white/80 text-sm">Bangalore</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};