// src/pages/NewArrivals.tsx
import React from 'react';
import { Calendar, Star, TrendingUp } from 'lucide-react';
import { ProductCard } from '../components/UI/ProductCard';
import { useProducts } from '../hooks/useProducts';

export const NewArrivals: React.FC = () => {
  const { products: newProducts, loading: newLoading } = useProducts({ isNew: true });
  const { products: allProducts, loading: allLoading } = useProducts();

  const recentProducts = allProducts
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  if (newLoading || allLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading new arrivals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-fadeIn">
      {/* Header */}
      <section className="bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="bg-primary/10 p-4 rounded-full">
                <TrendingUp className="text-primary" size={32} />
              </div>
            </div>
            <h1 className="text-5xl lg:text-6xl font-heading font-bold text-gray-900 dark:text-white mb-6">
              New Arrivals
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Discover the latest trends and fresh styles that just landed in our collection. 
              Be the first to wear what's next in fashion.
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <Calendar size={16} />
                <span>Updated Weekly</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star size={16} />
                <span>Trending Styles</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Products Grid */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-4">
              Fresh Arrivals
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Just arrived! These stunning pieces are already turning heads and setting new trends.
            </p>
          </div>

          {newProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
              {newProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <Calendar size={64} className="mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No new arrivals at the moment
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Check back soon for fresh styles and latest trends
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Recently Added */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-4">
              Recently Added
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              The latest additions to our collection, curated with love and attention to detail.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-heading font-bold text-white mb-4">
            Never Miss New Arrivals
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and be the first to know when new styles arrive. 
            Get exclusive early access and special discounts.
          </p>
          
          <div className="flex flex-col sm:flex-row max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-3 rounded-l-full sm:rounded-r-none rounded-r-full focus:outline-none focus:ring-4 focus:ring-white/20"
            />
            <button className="bg-white text-primary px-8 py-3 rounded-r-full sm:rounded-l-none rounded-l-full font-semibold hover:bg-gray-100 transition-colors mt-4 sm:mt-0">
              Subscribe
            </button>
          </div>

          <div className="mt-8 flex justify-center space-x-8 text-white/80 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar size={16} />
              <span>Weekly Updates</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star size={16} />
              <span>Exclusive Access</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewArrivals;