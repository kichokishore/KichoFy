import { BaseService } from './supabaseService';
import { TABLE_NAMES, PRODUCT_CONFIG, ERROR_MESSAGES } from '../utils/constants';
import type { 
  Product, 
  ProductInventory, 
  Category, 
  Review, 
  ApiResponse, 
  PaginatedResponse, 
  ProductFilters 
} from '../types';

export class ProductService extends BaseService<Product> {
  constructor() {
    super(TABLE_NAMES.PRODUCTS);
  }

  /**
   * Get products with advanced filtering, sorting, and pagination
   */
  async getProducts(
    filters: ProductFilters = {},
    pagination: { page?: number; limit?: number } = {}
  ): Promise<ApiResponse<PaginatedResponse<Product>>> {
    try {
      const { page = 1, limit = PRODUCT_CONFIG.PRODUCTS_PER_PAGE } = pagination;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = this.getSupabase()
        .from(this.tableName)
        .select('*, categories!inner(*)', { count: 'exact' })
        .range(from, to);

      // Apply filters
      query = this.applyProductFilters(query, filters);

      const { data, error, count } = await query;

      if (error) {
        return this.handleError(error);
      }

      const response: PaginatedResponse<Product> = {
        data: data as Product[],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };

      return this.handleSuccess(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Search products by name, description, or tags
   */
  async searchProducts(
    searchQuery: string,
    options: { 
      page?: number; 
      limit?: number;
      filters?: ProductFilters;
    } = {}
  ): Promise<ApiResponse<PaginatedResponse<Product>>> {
    try {
      const { page = 1, limit = PRODUCT_CONFIG.PRODUCTS_PER_PAGE, filters = {} } = options;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = this.getSupabase()
        .from(this.tableName)
        .select('*, categories!inner(*)', { count: 'exact' })
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`)
        .range(from, to);

      // Apply additional filters
      query = this.applyProductFilters(query, filters);

      const { data, error, count } = await query;

      if (error) {
        return this.handleError(error);
      }

      const response: PaginatedResponse<Product> = {
        data: data as Product[],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };

      return this.handleSuccess(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(
    categoryId: string,
    options: { 
      page?: number; 
      limit?: number;
      filters?: Omit<ProductFilters, 'categories'>;
    } = {}
  ): Promise<ApiResponse<PaginatedResponse<Product>>> {
    try {
      const { page = 1, limit = PRODUCT_CONFIG.PRODUCTS_PER_PAGE, filters = {} } = options;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = this.getSupabase()
        .from(this.tableName)
        .select('*, categories!inner(*)', { count: 'exact' })
        .eq('category_id', categoryId)
        .range(from, to);

      // Apply filters (excluding categories since we're filtering by specific category)
      query = this.applyProductFilters(query, filters);

      const { data, error, count } = await query;

      if (error) {
        return this.handleError(error);
      }

      const response: PaginatedResponse<Product> = {
        data: data as Product[],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };

      return this.handleSuccess(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get featured products (best sellers and new arrivals)
   */
  async getFeaturedProducts(limit: number = PRODUCT_CONFIG.FEATURED_LIMIT): Promise<ApiResponse<Product[]>> {
    try {
      const { data, error } = await this.getSupabase()
        .from(this.tableName)
        .select('*, categories(*)')
        .or('is_best_seller.eq.true,is_new.eq.true')
        .limit(limit)
        .order('created_at', { ascending: false });

      if (error) {
        return this.handleError(error);
      }

      return this.handleSuccess(data as Product[]);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get best seller products
   */
  async getBestSellers(limit: number = 12): Promise<ApiResponse<Product[]>> {
    try {
      const { data, error } = await this.getSupabase()
        .from(this.tableName)
        .select('*, categories(*)')
        .eq('is_best_seller', true)
        .limit(limit)
        .order('created_at', { ascending: false });

      if (error) {
        return this.handleError(error);
      }

      return this.handleSuccess(data as Product[]);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get new arrival products
   */
  async getNewArrivals(limit: number = 12): Promise<ApiResponse<Product[]>> {
    try {
      const { data, error } = await this.getSupabase()
        .from(this.tableName)
        .select('*, categories(*)')
        .eq('is_new', true)
        .limit(limit)
        .order('created_at', { ascending: false });

      if (error) {
        return this.handleError(error);
      }

      return this.handleSuccess(data as Product[]);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get related products (same category or similar tags)
   */
  async getRelatedProducts(
    productId: string, 
    limit: number = PRODUCT_CONFIG.RELATED_PRODUCTS_LIMIT
  ): Promise<ApiResponse<Product[]>> {
    try {
      // First get the current product to find related ones
      const productResult = await this.getById(productId, 'category_id, tags');
      if (!productResult.success) {
        return this.handleError(new Error('Product not found'));
      }

      const product = productResult.data;

      // Get products from same category, excluding current product
      const { data, error } = await this.getSupabase()
        .from(this.tableName)
        .select('*, categories(*)')
        .eq('category_id', product.category_id)
        .neq('id', productId)
        .limit(limit)
        .order('rating', { ascending: false })
        .order('reviews', { ascending: false });

      if (error) {
        return this.handleError(error);
      }

      // If not enough products from same category, get products with similar tags
      if (data.length < limit && product.tags && product.tags.length > 0) {
        const remainingLimit = limit - data.length;
        const { data: tagData } = await this.getSupabase()
          .from(this.tableName)
          .select('*, categories(*)')
          .overlaps('tags', product.tags)
          .neq('id', productId)
          .limit(remainingLimit)
          .order('rating', { ascending: false });

        if (tagData) {
          data.push(...tagData);
        }
      }

      return this.handleSuccess(data as Product[]);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get product by ID with full details including category and inventory
   */
  async getProductWithDetails(productId: string): Promise<ApiResponse<Product & {
    category?: Category;
    inventory?: ProductInventory[];
    reviews?: Review[];
  }>> {
    try {
      const { data, error } = await this.getSupabase()
        .from(this.tableName)
        .select(`
          *,
          categories (*),
          product_inventory (*),
          reviews (*, profiles (name, avatar_url))
        `)
        .eq('id', productId)
        .single();

      if (error) {
        return this.handleError(error);
      }

      return this.handleSuccess(data as any);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update product stock
   */
  async updateStock(productId: string, newStock: number): Promise<ApiResponse<Product>> {
    try {
      const { data, error } = await this.getSupabase()
        .from(this.tableName)
        .update({ 
          stock: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .select()
        .single();

      if (error) {
        return this.handleError(error);
      }

      return this.handleSuccess(data as Product, 'Stock updated successfully');
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Decrement product stock (for orders)
   */
  async decrementStock(productId: string, quantity: number): Promise<ApiResponse<Product>> {
    try {
      // First get current stock
      const productResult = await this.getById(productId, 'stock');
      if (!productResult.success) {
        return this.handleError(new Error('Product not found'));
      }

      const currentStock = productResult.data.stock || 0;
      
      if (currentStock < quantity) {
        return this.handleError(new Error(ERROR_MESSAGES.OUT_OF_STOCK));
      }

      const newStock = currentStock - quantity;

      return this.updateStock(productId, newStock);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Increment product stock (for returns/cancellations)
   */
  async incrementStock(productId: string, quantity: number): Promise<ApiResponse<Product>> {
    try {
      // First get current stock
      const productResult = await this.getById(productId, 'stock');
      if (!productResult.success) {
        return this.handleError(new Error('Product not found'));
      }

      const currentStock = productResult.data.stock || 0;
      const newStock = currentStock + quantity;

      return this.updateStock(productId, newStock);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get products with low stock (for admin alerts)
   */
  async getLowStockProducts(threshold: number = 5): Promise<ApiResponse<Product[]>> {
    try {
      const { data, error } = await this.getSupabase()
        .from(this.tableName)
        .select('*, categories(*)')
        .lte('stock', threshold)
        .order('stock', { ascending: true })
        .order('updated_at', { ascending: false });

      if (error) {
        return this.handleError(error);
      }

      return this.handleSuccess(data as Product[]);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get products on sale (with original_price > price)
   */
  async getProductsOnSale(
    options: { page?: number; limit?: number } = {}
  ): Promise<ApiResponse<PaginatedResponse<Product>>> {
    try {
      const { page = 1, limit = PRODUCT_CONFIG.PRODUCTS_PER_PAGE } = options;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await this.getSupabase()
        .from(this.tableName)
        .select('*, categories(*)', { count: 'exact' })
        .not('original_price', 'is', null)
        .lt('price', this.getSupabase().ref('original_price'))
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) {
        return this.handleError(error);
      }

      const response: PaginatedResponse<Product> = {
        data: data as Product[],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };

      return this.handleSuccess(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update product rating based on new review
   */
  async updateProductRating(productId: string): Promise<ApiResponse<Product>> {
    try {
      // Calculate new average rating from reviews
      const { data: reviews, error: reviewsError } = await this.getSupabase()
        .from(TABLE_NAMES.REVIEWS)
        .select('rating')
        .eq('product_id', productId);

      if (reviewsError) {
        return this.handleError(reviewsError);
      }

      if (reviews.length === 0) {
        // No reviews, set rating to null
        const { data, error } = await this.getSupabase()
          .from(this.tableName)
          .update({
            rating: null,
            reviews: 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', productId)
          .select()
          .single();

        if (error) {
          return this.handleError(error);
        }

        return this.handleSuccess(data as Product);
      }

      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      const roundedRating = Math.round(averageRating * 10) / 10; // Round to 1 decimal

      const { data, error } = await this.getSupabase()
        .from(this.tableName)
        .update({
          rating: roundedRating,
          reviews: reviews.length,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .select()
        .single();

      if (error) {
        return this.handleError(error);
      }

      return this.handleSuccess(data as Product, 'Product rating updated');
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get products by multiple IDs (for cart/order display)
   */
  async getProductsByIds(productIds: string[]): Promise<ApiResponse<Product[]>> {
    try {
      const { data, error } = await this.getSupabase()
        .from(this.tableName)
        .select('*, categories(*)')
        .in('id', productIds);

      if (error) {
        return this.handleError(error);
      }

      return this.handleSuccess(data as Product[]);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get product inventory variants
   */
  async getProductInventory(productId: string): Promise<ApiResponse<ProductInventory[]>> {
    try {
      const { data, error } = await this.getSupabase()
        .from(TABLE_NAMES.PRODUCT_INVENTORY)
        .select('*')
        .eq('product_id', productId)
        .order('size')
        .order('color');

      if (error) {
        return this.handleError(error);
      }

      return this.handleSuccess(data as ProductInventory[]);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Helper method to apply product filters to query
   */
  private applyProductFilters(query: any, filters: ProductFilters) {
    let filteredQuery = query;

    // Apply category filters
    if (filters.categories?.length) {
      filteredQuery = filteredQuery.in('category_id', filters.categories);
    }

    // Apply price range filter
    if (filters.price_range) {
      filteredQuery = filteredQuery.gte('price', filters.price_range.min);
      filteredQuery = filteredQuery.lte('price', filters.price_range.max);
    }

    // Apply size filter
    if (filters.sizes?.length) {
      filteredQuery = filteredQuery.overlaps('sizes', filters.sizes);
    }

    // Apply color filter
    if (filters.colors?.length) {
      filteredQuery = filteredQuery.overlaps('colors', filters.colors);
    }

    // Apply rating filter
    if (filters.ratings?.length) {
      const ratingConditions = filters.ratings.map(rating => 
        `rating.gte.${rating}`
      );
      filteredQuery = filteredQuery.or(ratingConditions.join(','));
    }

    // Apply in-stock filter
    if (filters.in_stock) {
      filteredQuery = filteredQuery.gt('stock', 0);
    }

    // Apply on-sale filter
    if (filters.on_sale) {
      filteredQuery = filteredQuery.not('original_price', 'is', null)
                 .lt('price', this.getSupabase().ref('original_price'));
    }

    // Apply sorting
    if (filters.sort_by) {
      switch (filters.sort_by) {
        case 'price_asc':
          filteredQuery = filteredQuery.order('price', { ascending: true });
          break;
        case 'price_desc':
          filteredQuery = filteredQuery.order('price', { ascending: false });
          break;
        case 'newest':
          filteredQuery = filteredQuery.order('created_at', { ascending: false });
          break;
        case 'popular':
          filteredQuery = filteredQuery.order('reviews', { ascending: false });
          break;
        case 'rating':
          filteredQuery = filteredQuery.order('rating', { ascending: false });
          break;
        default:
          filteredQuery = filteredQuery.order('created_at', { ascending: false });
      }
    } else {
      filteredQuery = filteredQuery.order('created_at', { ascending: false });
    }

    return filteredQuery;
  }

  /**
   * Get Supabase client instance
   */
  private getSupabase() {
    // This will be implemented in the BaseService
    return (this as any).supabase;
  }
}

// Export service instance
export const productService = new ProductService();

export default productService;