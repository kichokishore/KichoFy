import React from 'react';
import { Product } from '../../types';
import { ProductCard } from '../UI/ProductCard';
import { ProductCardSkeleton } from '../UI/LoadingSpinner';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  itemsPerRow?: 2 | 3 | 4 | 5;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading = false,
  emptyMessage = 'No products found',
  className = '',
  itemsPerRow = 4,
}) => {
  const gridClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
  };

  if (loading) {
    return (
      <div className={`grid gap-4 sm:gap-6 ${gridClasses[itemsPerRow]} ${className}`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-heading font-semibold text-gray-900 dark:text-white mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 font-sans">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 sm:gap-6 ${gridClasses[itemsPerRow]} ${className}`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          className="h-full"
        />
      ))}
    </div>
  );
};

// Infinite scroll product grid
interface InfiniteProductGridProps extends ProductGridProps {
  hasMore?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
}

export const InfiniteProductGrid: React.FC<InfiniteProductGridProps> = ({
  products,
  loading = false,
  hasMore = false,
  onLoadMore,
  loadingMore = false,
  ...props
}) => {
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasMore && onLoadMore && !loadingMore) {
      onLoadMore();
    }
  };

  return (
    <div onScroll={handleScroll} className="overflow-y-auto">
      <ProductGrid products={products} loading={loading} {...props} />
      
      {loadingMore && (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {!hasMore && products.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 font-sans">
            You've reached the end of the products
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;