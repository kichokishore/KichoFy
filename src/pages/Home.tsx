import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, TrendingUp, Award, Truck } from 'lucide-react';
import { ProductCard } from '../components/UI/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import llg3 from '../assets/llg3.png';
import { useTranslation } from '../hooks/useTranslation';
import { HandMadeSection } from '../components/HandMadeSection';

export const Home: React.FC = () => {
  const { t } = useTranslation();
  const { products: allProducts, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();

  // Filter products for different sections
  const featuredProducts = allProducts.slice(0, 4);
  const newProducts = allProducts.filter(p => p.is_new).slice(0, 4);
  const bestSellers = allProducts.filter(p => p.is_best_seller).slice(0, 4);

  if (productsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Hero Section */}
      <section 
        className="relative bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden"
        style={{ backgroundImage: `url(${llg3})` }}
      >
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12">
            <div className="space-y-8 animate-slideIn flex-1">
              <div>
                <h1 className="text-5xl lg:text-7xl font-heading font-bold text-white leading-tight">
                  {t('heroTitle')}
                </h1>
                <p className="text-xl text-gray-400 dark:text-gray-400 mt-6 max-w-lg">
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
                  to="/cart"
                  className="inline-flex items-center border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105"
                >
                  {t('newCollection')}
                </Link>
              </div>
            </div>

            <div className="relative flex-1">
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
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
            <div className="text-center group min-w-[140px] sm:min-w-[160px]">
              <div className="bg-primary/10 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors">
                <Truck className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2">Free Shipping</h3>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">On orders above ₹999</p>
            </div>

            <div className="text-center group min-w-[140px] sm:min-w-[160px]">
              <div className="bg-primary/10 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors">
                <Award className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2">Quality Guarantee</h3>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Premium quality products</p>
            </div>

            <div className="text-center group min-w-[140px] sm:min-w-[160px]">
              <div className="bg-primary/10 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors">
                <Star className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2">Customer Rated</h3>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">4.8/5 customer rating</p>
            </div>

            <div className="text-center group min-w-[140px] sm:min-w-[160px]">
              <div className="bg-primary/10 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors">
                <TrendingUp className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2">Trending Styles</h3>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Latest fashion trends</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Categories
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
              Rooted in culture, rising with confidence            
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/collections/${category.id}`}
                className="group relative overflow-hidden rounded-xl sm:rounded-2xl hover-lift min-w-[calc(50%-8px)] sm:min-w-[calc(50%-12px)] lg:min-w-[calc(25%-24px)] flex-1 max-w-[300px]"
              >
                <img
                  src={category.image || '/placeholder-category.jpg'}
                  alt={category.name}
                  className="w-full h-48 sm:h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-all duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white text-xl sm:text-2xl font-heading font-semibold text-center group-hover:scale-105 transition-transform">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <HandMadeSection />

      {/* Featured Products */}
      <section className="py-16 sm:py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              {t('featuredProducts')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
              Handpicked items that define style and elegance
            </p>
          </div>

          {featuredProducts.length > 0 ? (
            <>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6">
                {featuredProducts.map((product) => (
                  <div key={product.id} className="min-w-[calc(50%-6px)] xs:min-w-[calc(50%-6px)] sm:min-w-[calc(33.333%-16px)] md:min-w-[calc(25%-18px)] max-w-[300px]">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              <div className="text-center mt-8">
                <Link
                  to="/collections"
                  className="inline-flex items-center bg-primary hover:bg-primary-light text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                >
                  View All Products
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-400 mb-3 sm:mb-4">
                <TrendingUp className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Featured products coming soon
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                We're currently updating our featured collection
              </p>
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-12 sm:mb-16">
            <div className="text-center sm:text-left mb-4 sm:mb-0">
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
                New Collection
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                Fresh styles just arrived
              </p>
            </div>
            <Link
              to="/new-arrivals"
              className="hidden sm:inline-flex items-center text-primary hover:text-primary-light font-semibold transition-colors"
            >
              View All
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          {newProducts.length > 0 ? (
            <>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6">
                {newProducts.map((product) => (
                  <div key={product.id} className="min-w-[calc(50%-6px)] xs:min-w-[calc(50%-6px)] sm:min-w-[calc(33.333%-16px)] md:min-w-[calc(25%-18px)] max-w-[300px]">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              <div className="text-center mt-6 sm:hidden">
                <Link
                  to="/new-arrivals"
                  className="inline-flex items-center text-primary hover:text-primary-light font-semibold transition-colors text-sm"
                >
                  View All New Arrivals
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-400 mb-3 sm:mb-4">
                <Award className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                New arrivals coming soon
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                Check back for our latest fashion collections
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-16 sm:py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-12 sm:mb-16">
            <div className="text-center sm:text-left mb-4 sm:mb-0">
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
                {t('bestSellers')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                Customer favorites that never go out of style
              </p>
            </div>
            <Link
              to="/best-sellers"
              className="hidden sm:inline-flex items-center text-primary hover:text-primary-light font-semibold transition-colors"
            >
              View All
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          {bestSellers.length > 0 ? (
            <>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6">
                {bestSellers.map((product) => (
                  <div key={product.id} className="min-w-[calc(50%-6px)] xs:min-w-[calc(50%-6px)] sm:min-w-[calc(33.333%-16px)] md:min-w-[calc(25%-18px)] max-w-[300px]">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              <div className="text-center mt-6 sm:hidden">
                <Link
                  to="/best-sellers"
                  className="inline-flex items-center text-primary hover:text-primary-light font-semibold transition-colors text-sm"
                >
                  View All Best Sellers
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-400 mb-3 sm:mb-4">
                <Star className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Best sellers coming soon
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                Our most popular items will be here soon
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-primary to-primary-light">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-3 sm:mb-4">
            Stay in Style
          </h2>
          <p className="text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base">
            Subscribe to our newsletter and be the first to know about new arrivals, exclusive offers, and fashion tips
          </p>

          <div className="flex flex-col sm:flex-row max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full sm:rounded-r-none focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-white/20 text-sm sm:text-base"
            />
            <button className="bg-white text-primary px-6 sm:px-8 py-2.5 sm:py-3 rounded-full sm:rounded-l-none font-semibold hover:bg-gray-100 transition-colors mt-3 sm:mt-0 text-sm sm:text-base">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};