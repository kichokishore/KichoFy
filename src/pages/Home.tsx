import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, TrendingUp, Award, Truck } from 'lucide-react';
import { ProductCard } from '../components/UI/ProductCard';
import { products, categories } from '../data/products';
import { useTranslation } from '../hooks/useTranslation';

export const Home: React.FC = () => {
  const { t } = useTranslation();

  const featuredProducts = products.slice(0, 4);
  const newProducts = products.filter(p => p.isNew).slice(0, 4);
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 4);

  return (
    <div className="animate-fadeIn">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slideIn">
              <div>
                <h1 className="text-5xl lg:text-7xl font-heading font-bold text-gray-900 dark:text-white leading-tight">
                  {t('heroTitle')}
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mt-6 max-w-lg">
                  {t('heroSubtitle')}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/collections"
                  className="inline-flex items-center bg-primary hover:bg-primary-light text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                >
                  {t('shopNow')}
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                </Link>
                <Link
                  to="/new-arrivals"
                  className="inline-flex items-center border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105"
                >
                  {t('newCollection')}
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">10K+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">500+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">4.8</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Rating</div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="relative z-10">
                <img
                  src="https://images.pexels.com/photos/9503741/pexels-photo-9503741.jpeg"
                  alt="Fashion Model"
                  className="w-full h-[600px] object-cover rounded-3xl shadow-2xl"
                />
              </div>
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary opacity-20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-pink-400 opacity-20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Truck className="text-primary" size={24} />
              </div>
              <h3 className="font-semibold mb-2">Free Shipping</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">On orders above ₹999</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Award className="text-primary" size={24} />
              </div>
              <h3 className="font-semibold mb-2">Quality Guarantee</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Premium quality products</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Star className="text-primary" size={24} />
              </div>
              <h3 className="font-semibold mb-2">Customer Rated</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">4.8/5 customer rating</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <TrendingUp className="text-primary" size={24} />
              </div>
              <h3 className="font-semibold mb-2">Trending Styles</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Latest fashion trends</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-gray-900 dark:text-white mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover our curated collections designed for every occasion and style preference
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/collections/${category.id}`}
                className="group relative overflow-hidden rounded-2xl hover-lift"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-all duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white text-2xl font-heading font-semibold text-center group-hover:scale-105 transition-transform">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-gray-900 dark:text-white mb-4">
              {t('featuredProducts')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Handpicked items that define style and elegance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/collections"
              className="inline-flex items-center bg-primary hover:bg-primary-light text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105"
            >
              View All Products
              <ArrowRight className="ml-2" size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-16">
            <div>
              <h2 className="text-4xl font-heading font-bold text-gray-900 dark:text-white mb-4">
                {t('newCollection')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Fresh styles just arrived
              </p>
            </div>
            <Link
              to="/new-arrivals"
              className="hidden md:inline-flex items-center text-primary hover:text-primary-light font-semibold transition-colors"
            >
              View All
              <ArrowRight className="ml-2" size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {newProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center md:hidden">
            <Link
              to="/new-arrivals"
              className="inline-flex items-center text-primary hover:text-primary-light font-semibold transition-colors"
            >
              View All New Arrivals
              <ArrowRight className="ml-2" size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-16">
            <div>
              <h2 className="text-4xl font-heading font-bold text-gray-900 dark:text-white mb-4">
                {t('bestSellers')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Customer favorites that never go out of style
              </p>
            </div>
            <Link
              to="/best-sellers"
              className="hidden md:inline-flex items-center text-primary hover:text-primary-light font-semibold transition-colors"
            >
              View All
              <ArrowRight className="ml-2" size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center md:hidden">
            <Link
              to="/best-sellers"
              className="inline-flex items-center text-primary hover:text-primary-light font-semibold transition-colors"
            >
              View All Best Sellers
              <ArrowRight className="ml-2" size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-light">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-heading font-bold text-white mb-4">
            Stay in Style
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and be the first to know about new arrivals, exclusive offers, and fashion tips
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
        </div>
      </section>
    </div>
  );
};