// src/pages/CategoryProducts.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Filter, Grid2x2 as Grid, List, SlidersHorizontal, ArrowLeft, Home } from 'lucide-react';
import { ProductCard } from '../components/UI/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';

export const CategoryProducts: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { products: allProducts, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();

  // Find current category and its subcategories
  const currentCategory = useMemo(() => {
    return categories.find(cat => cat.id === categoryId);
  }, [categories, categoryId]);

  const subcategories = useMemo(() => {
    if (!currentCategory) return [];
    return categories.filter(cat => cat.parent_id === currentCategory.id);
  }, [categories, currentCategory]);

  // Filter products by category and subcategory
  const filteredProducts = useMemo(() => {
    if (!currentCategory) return [];

    let filtered = allProducts.filter(product => {
      const categoryMatch = product.category_id === currentCategory.id;
      const subcategoryMatch = selectedSubcategory === 'all' || product.subcategory === selectedSubcategory;
      const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
      
      return categoryMatch && subcategoryMatch && priceMatch;
    });

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      default: // featured
        filtered.sort((a, b) => {
          if (a.is_best_seller && !b.is_best_seller) return -1;
          if (!a.is_best_seller && b.is_best_seller) return 1;
          if (a.is_new && !b.is_new) return -1;
          if (!a.is_new && b.is_new) return 1;
          return 0;
        });
    }

    return filtered;
  }, [allProducts, currentCategory, selectedSubcategory, sortBy, priceRange]);

  // Reset subcategory filter when category changes
  useEffect(() => {
    setSelectedSubcategory('all');
  }, [categoryId]);

  const clearFilters = () => {
    setSelectedSubcategory('all');
    setPriceRange([0, 10000]);
  };

  if (productsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading category...</p>
        </div>
      </div>
    );
  }

  if (!currentCategory) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <Home size={64} className="mx-auto" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-4">
            Category Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The category you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate('/collections')}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-light transition-colors"
          >
            Browse All Categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <button
              onClick={() => navigate('/')}
              className="hover:text-primary transition-colors"
            >
              Home
            </button>
            <span>/</span>
            <button
              onClick={() => navigate('/collections')}
              className="hover:text-primary transition-colors"
            >
              Collections
            </button>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-medium">{currentCategory.name}</span>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 dark:text-white">
                    {currentCategory.name}
                  </h1>
                  {currentCategory.description && (
                    <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
                      {currentCategory.description}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {filteredProducts.length} products available
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}
                >
                  <List size={18} />
                </button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
              </select>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                <SlidersHorizontal size={18} />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary hover:text-primary-light transition-colors"
                >
                  Clear All
                </button>
              </div>
              
              {/* Subcategory Filter */}
              {subcategories.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Subcategories</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="subcategory"
                        value="all"
                        checked={selectedSubcategory === 'all'}
                        onChange={(e) => setSelectedSubcategory(e.target.value)}
                        className="text-primary focus:ring-primary"
                      />
                      <span className="ml-2 text-gray-600 dark:text-gray-400">All {currentCategory.name}</span>
                    </label>
                    {subcategories.map((subcategory) => (
                      <label key={subcategory.id} className="flex items-center">
                        <input
                          type="radio"
                          name="subcategory"
                          value={subcategory.name}
                          checked={selectedSubcategory === subcategory.name}
                          onChange={(e) => setSelectedSubcategory(e.target.value)}
                          className="text-primary focus:ring-primary"
                        />
                        <span className="ml-2 text-gray-600 dark:text-gray-400">{subcategory.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Price Range</h4>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Quick Filters */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Quick Filters</h4>
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm">
                    New Arrivals
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm">
                    Best Sellers
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm">
                    On Sale
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm">
                    In Stock
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <Filter size={64} className="mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {selectedSubcategory !== 'all' || priceRange[1] < 10000
                    ? "Try adjusting your filters to see more products"
                    : `No products available in ${currentCategory.name} at the moment`}
                </p>
                {(selectedSubcategory !== 'all' || priceRange[1] < 10000) && (
                  <button
                    onClick={clearFilters}
                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-light transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Subcategory Navigation */}
                {subcategories.length > 0 && (
                  <div className="mb-6 flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedSubcategory('all')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedSubcategory === 'all'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      All
                    </button>
                    {subcategories.map((subcategory) => (
                      <button
                        key={subcategory.id}
                        onClick={() => setSelectedSubcategory(subcategory.name)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          selectedSubcategory === subcategory.name
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {subcategory.name}
                      </button>
                    ))}
                  </div>
                )}

                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1'
                }`}>
                  {filteredProducts.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product}
                      className={viewMode === 'list' ? 'flex-row' : ''}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Related Categories */}
            {filteredProducts.length > 0 && (
              <div className="mt-12">
                <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-6">
                  Related Categories
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {categories
                    .filter(cat => cat.id !== currentCategory.id && cat.parent_id === null)
                    .slice(0, 4)
                    .map((category) => (
                      <button
                        key={category.id}
                        onClick={() => navigate(`/category/${category.id}`)}
                        className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center hover:shadow-lg transition-shadow group"
                      >
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg mx-auto mb-3 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <Home size={24} className="text-gray-600 dark:text-gray-400 group-hover:text-primary transition-colors" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                          {category.name}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryProducts;