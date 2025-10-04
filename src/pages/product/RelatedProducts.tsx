// src/pages/product/RelatedProducts.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { productService } from '../../services/supabaseService';
import { ProductCard } from '../../components/UI/ProductCard';
import { LoadingSpinner } from '../../components/UI/LoadingSpinner';
import { useTranslation } from '../../hooks/useTranslation';

interface RelatedProductsProps {
  productId: string;
  categoryId?: string;
  currentProduct?: Product;
  limit?: number;
}

export const RelatedProducts: React.FC<RelatedProductsProps> = ({
  productId,
  categoryId,
  currentProduct,
  limit = 4
}) => {
  const { t } = useTranslation();
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        let products: Product[] = [];

        // If we have a category ID, get products from the same category
        if (categoryId) {
          products = await productService.getRelatedProducts(productId, categoryId, limit);
        } 
        // If no category ID but we have current product data, use its category
        else if (currentProduct?.category_id) {
          products = await productService.getRelatedProducts(productId, currentProduct.category_id, limit);
        }
        // Fallback: get new arrivals if no category info available
        else {
          products = await productService.getNewArrivals(limit);
          // Remove current product from the list if it's there
          products = products.filter(product => product.id !== productId);
        }

        // If we don't have enough related products, supplement with best sellers
        if (products.length < limit) {
          const bestSellers = await productService.getBestSellers(limit - products.length);
          const additionalProducts = bestSellers.filter(
            product => product.id !== productId && 
            !products.some(p => p.id === product.id)
          );
          products = [...products, ...additionalProducts];
        }

        setRelatedProducts(products);
      } catch (err: any) {
        console.error('Error fetching related products:', err);
        setError(err.message || 'Failed to load related products');
        
        // Fallback to empty array on error
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [productId, categoryId, currentProduct, limit]);

  if (loading) {
    return (
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <LoadingSpinner size="large" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              {t('loadingRelatedProducts') || 'Loading related products...'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600 dark:text-red-400">
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (relatedProducts.length === 0) {
    return null; // Don't show anything if no related products
  }

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('relatedProducts') || 'Related Products'}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('relatedProductsDescription') || 'You might also like these similar products'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {relatedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                }}
                whileHover={{ y: -5 }}
                className="h-full"
              >
                <ProductCard 
                  product={product}
                  className="h-full"
                />
              </motion.div>
            ))}
          </div>

          {/* View All Products Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-center mt-12"
          >
            <Link
              to="/collections"
              className="inline-flex items-center px-6 py-3 border-2 border-primary text-primary rounded-full font-semibold hover:bg-primary hover:text-white transition-all duration-300 hover:scale-105"
            >
              {t('viewAllProducts') || 'View All Products'}
              <svg
                className="ml-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default RelatedProducts;