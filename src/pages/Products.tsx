// src/pages/Products.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ProductGrid } from '../components/product/ProductGrid';
import { ProductFilters } from '../components/product/ProductFilters';
import { ProductSort } from '../components/product/ProductSort';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useTranslation } from '../hooks/useTranslation';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Get URL parameters or use defaults
  const category = searchParams.get('category') || '';
  const sortBy = searchParams.get('sort') || 'newest';
  const searchQuery = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');

  // Custom hooks
  const { 
    products, 
    loading: productsLoading, 
    error: productsError,
    hasMore 
  } = useProducts({
    category,
    sortBy,
    searchQuery,
    page
  });
  
  const { categories, loading: categoriesLoading } = useCategories();

  // State for UI
  const [showFilters, setShowFilters] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Update URL when filters change
  const updateSearchParams = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    
    setSearchParams(newParams);
  };

  const handleCategoryChange = (newCategory: string) => {
    updateSearchParams({ 
      category: newCategory,
      page: '1' // Reset to first page
    });
  };

  const handleSortChange = (newSort: string) => {
    updateSearchParams({ sort: newSort });
  };

  const handleSearch = (query: string) => {
    updateSearchParams({ 
      search: query,
      page: '1'
    });
  };

  const handleLoadMore = async () => {
    if (hasMore && !loadingMore) {
      setLoadingMore(true);
      updateSearchParams({ page: (page + 1).toString() });
      // The actual loading will be handled by the useProducts hook
      setLoadingMore(false);
    }
  };

  // Get current category name for display
  const currentCategory = categories.find(cat => cat.id === category);

  if (productsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('errorLoadingProducts') || 'Error loading products'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {productsError.message || 'There was a problem loading the products. Please try again.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            {t('tryAgain') || 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-heading">
                {t('allProducts') || 'All Products'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 font-sans">
                {searchQuery 
                  ? `${t('searchResultsFor') || 'Search results for'}: "${searchQuery}"`
                  : category 
                    ? `${currentCategory?.name || category}`
                    : t('discoverOurCollection') || 'Discover our complete collection'
                }
              </p>
            </div>
            
            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden px-4 py-2 bg-primary text-white rounded-lg flex items-center space-x-2 font-sans"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                </svg>
                <span>{t('filters') || 'Filters'}</span>
              </button>
              
              {/* Product sort */}
              <ProductSort 
                sortBy={sortBy}
                onSortChange={handleSortChange}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Filters */}
          <div className={`lg:w-80 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-24">
              <ProductFilters
                categories={categories}
                selectedCategory={category}
                onCategoryChange={handleCategoryChange}
                searchQuery={searchQuery}
                onSearchChange={handleSearch}
                loading={categoriesLoading}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Results summary and mobile filter close */}
            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-600 dark:text-gray-400 font-sans">
                {products.length > 0 && `${products.length} ${t('productsFound') || 'products found'}`}
              </p>
              
              {/* Mobile filter close button */}
              {showFilters && (
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm font-sans"
                >
                  {t('close') || 'Close'}
                </button>
              )}
            </div>

            {/* Product Grid */}
            <ProductGrid 
              products={products}
              loading={productsLoading}
              emptyMessage={t('noProductsFound') || 'No products found matching your criteria'}
              itemsPerRow={4}
              className="mb-8"
            />

            {/* Load More Button for pagination */}
            {hasMore && !productsLoading && products.length > 0 && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-sans flex items-center space-x-2"
                >
                  {loadingMore ? (
                    <>
                      <LoadingSpinner size="small" />
                      <span>{t('loading') || 'Loading...'}</span>
                    </>
                  ) : (
                    <span>{t('loadMore') || 'Load More Products'}</span>
                  )}
                </button>
              </div>
            )}

            {/* End of results message */}
            {!hasMore && products.length > 0 && (
              <div className="text-center py-8 border-t border-gray-200 dark:border-gray-700 mt-8">
                <p className="text-gray-500 dark:text-gray-400 font-sans">
                  {t('endOfProducts') || "You've seen all the products!"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;