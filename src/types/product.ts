// src/types/product.ts

/**
 * Product status types
 */
export type ProductStatus = 'active' | 'inactive' | 'draft' | 'out_of_stock' | 'discontinued';

/**
 * Product availability status
 */
export type AvailabilityStatus = 'in_stock' | 'out_of_stock' | 'pre_order' | 'backorder';

/**
 * Product condition types
 */
export type ProductCondition = 'new' | 'refurbished' | 'used';

/**
 * Size systems
 */
export type SizeSystem = 'indian' | 'us' | 'uk' | 'eu' | 'universal';

/**
 * Weight units
 */
export type WeightUnit = 'g' | 'kg' | 'lb' | 'oz';

/**
 * Dimension units
 */
export type DimensionUnit = 'cm' | 'm' | 'in' | 'ft';

/**
 * Main product interface
 */
export interface Product {
  id: string;
  name: string;
  description: string | null;
  
  // Pricing
  price: number;
  original_price: number | null;
  cost_price: number | null;
  discount_percentage: number | null;
  
  // Inventory
  stock: number;
  sku: string;
  barcode: string | null;
  manage_stock: boolean;
  low_stock_threshold: number;
  availability_status: AvailabilityStatus;
  
  // Categorization
  category_id: string | null;
  subcategory: string | null;
  brand: string | null;
  collection: string | null;
  
  // Media
  image_url: string | null;
  images: string[];
  video_url: string | null;
  
  // Variants
  sizes: string[];
  colors: string[];
  materials: string[];
  tags: string[];
  
  // Specifications
  weight: number | null;
  weight_unit: WeightUnit;
  dimensions: ProductDimensions | null;
  care_instructions: string | null;
  features: string[];
  specifications: Record<string, any> | null;
  
  // Status and metadata
  status: ProductStatus;
  condition: ProductCondition;
  is_featured: boolean;
  is_best_seller: boolean;
  is_new: boolean;
  is_on_sale: boolean;
  
  // Ratings and reviews
  rating: number | null;
  reviews_count: number;
  wishlist_count: number;
  view_count: number;
  
  // SEO and visibility
  slug: string;
  meta_title: string | null;
  meta_description: string | null;
  search_keywords: string[];
  
  // Timestamps
  created_at: string;
  updated_at: string;
  published_at: string | null;
  
  // Relationships (optional - populated when joined)
  category?: Category;
  inventory?: ProductInventory[];
  variants?: ProductVariant[];
  reviews?: Review[];
  related_products?: Product[];
}

/**
 * Product dimensions
 */
export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: DimensionUnit;
}

/**
 * Product category
 */
export interface Category {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  parent_id: string | null;
  slug: string;
  
  // Metadata
  display_order: number;
  is_active: boolean;
  product_count: number;
  
  // SEO
  meta_title: string | null;
  meta_description: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Relationships
  parent_category?: Category;
  subcategories?: Category[];
  products?: Product[];
}

/**
 * Product inventory for variants
 */
export interface ProductInventory {
  id: string;
  product_id: string;
  size: string | null;
  color: string | null;
  material: string | null;
  
  // Inventory details
  stock_quantity: number;
  reserved_quantity: number;
  sku: string;
  barcode: string | null;
  
  // Pricing (override product pricing if different)
  price: number | null;
  original_price: number | null;
  
  // Media (variant-specific images)
  image_url: string | null;
  
  // Status
  is_active: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Relationships
  product?: Product;
}

/**
 * Product variant combination
 */
export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  
  // Variant options
  options: VariantOption[];
  
  // Inventory and pricing
  sku: string;
  stock_quantity: number;
  price: number | null;
  original_price: number | null;
  
  // Media
  image_url: string | null;
  
  // Status
  is_active: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Relationships
  product?: Product;
}

/**
 * Variant option (size, color, etc.)
 */
export interface VariantOption {
  name: string; // Size, Color, Material
  value: string; // M, Red, Cotton
}

/**
 * Product collection
 */
export interface Collection {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  banner_image: string | null;
  
  // Metadata
  display_order: number;
  is_active: boolean;
  is_featured: boolean;
  
  // SEO
  slug: string;
  meta_title: string | null;
  meta_description: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  start_date: string | null;
  end_date: string | null;
  
  // Relationships
  products?: Product[];
}

/**
 * Product brand
 */
export interface Brand {
  id: string;
  name: string;
  description: string | null;
  logo: string | null;
  banner_image: string | null;
  
  // Metadata
  website: string | null;
  contact_email: string | null;
  is_active: boolean;
  product_count: number;
  
  // SEO
  slug: string;
  meta_title: string | null;
  meta_description: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Relationships
  products?: Product[];
}

/**
 * Product review
 */
export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  order_id: string | null;
  
  // Review content
  rating: number; // 1-5
  title: string | null;
  comment: string | null;
  
  // Verification and moderation
  is_verified: boolean;
  is_approved: boolean;
  helpful_count: number;
  report_count: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Relationships
  product?: Product;
  user?: User;
  order?: Order;
  images?: ReviewImage[];
  helpful_votes?: HelpfulVote[];
}

/**
 * Review image
 */
export interface ReviewImage {
  id: string;
  review_id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  created_at: string;
  
  // Relationships
  review?: Review;
}

/**
 * Helpful vote for reviews
 */
export interface HelpfulVote {
  id: string;
  review_id: string;
  user_id: string;
  is_helpful: boolean;
  created_at: string;
  
  // Relationships
  review?: Review;
  user?: User;
}

/**
 * Product question and answer
 */
export interface ProductQuestion {
  id: string;
  product_id: string;
  user_id: string;
  question: string;
  is_anonymous: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  
  // Relationships
  product?: Product;
  user?: User;
  answers?: ProductAnswer[];
}

/**
 * Product answer
 */
export interface ProductAnswer {
  id: string;
  question_id: string;
  user_id: string;
  answer: string;
  is_seller_response: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  
  // Relationships
  question?: ProductQuestion;
  user?: User;
}

/**
 * Product view tracking
 */
export interface ProductView {
  id: string;
  product_id: string;
  user_id: string | null;
  session_id: string;
  ip_address: string | null;
  user_agent: string | null;
  duration_seconds: number;
  created_at: string;
  
  // Relationships
  product?: Product;
  user?: User;
}

/**
 * Product click tracking
 */
export interface ProductClick {
  id: string;
  product_id: string;
  user_id: string | null;
  session_id: string;
  source: string; // search, category, recommendation, etc.
  position: number;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  
  // Relationships
  product?: Product;
  user?: User;
}

/**
 * Product analytics data
 */
export interface ProductAnalytics {
  product_id: string;
  date: string;
  
  // View metrics
  views: number;
  unique_views: number;
  average_view_duration: number;
  
  // Engagement metrics
  clicks: number;
  add_to_cart: number;
  purchases: number;
  
  // Conversion metrics
  conversion_rate: number;
  revenue: number;
  units_sold: number;
  
  // Relationships
  product?: Product;
}

/**
 * Product filter options
 */
export interface ProductFilters {
  // Category and brand
  categories?: string[];
  brands?: string[];
  collections?: string[];
  
  // Price range
  price_range?: {
    min: number;
    max: number;
  };
  
  // Variants
  sizes?: string[];
  colors?: string[];
  materials?: string[];
  
  // Ratings
  ratings?: number[];
  
  // Availability and status
  in_stock?: boolean;
  on_sale?: boolean;
  is_featured?: boolean;
  is_new?: boolean;
  
  // Sort options
  sort_by?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'popular' | 'rating' | 'name_asc' | 'name_desc';
  
  // Pagination
  page?: number;
  limit?: number;
}

/**
 * Product search result
 */
export interface ProductSearchResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  filters: ProductFilters;
  suggestions: string[];
}

/**
 * Product comparison
 */
export interface ProductComparison {
  id: string;
  user_id: string;
  name: string;
  products: Product[];
  created_at: string;
  updated_at: string;
  
  // Relationships
  user?: User;
}

/**
 * Product wishlist item
 */
export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  
  // Relationships
  user?: User;
  product?: Product;
}

/**
 * Product stock alert
 */
export interface StockAlert {
  id: string;
  product_id: string;
  user_id: string;
  email: string;
  is_notified: boolean;
  created_at: string;
  notified_at: string | null;
  
  // Relationships
  product?: Product;
  user?: User;
}

/**
 * Product price history
 */
export interface PriceHistory {
  id: string;
  product_id: string;
  price: number;
  original_price: number | null;
  discount_percentage: number | null;
  created_at: string;
  
  // Relationships
  product?: Product;
}

/**
 * Type guards for product-related types
 */
export const isProduct = (item: any): item is Product => {
  return item && typeof item.id === 'string' && typeof item.name === 'string' && typeof item.price === 'number';
};

export const isCategory = (item: any): item is Category => {
  return item && typeof item.id === 'string' && typeof item.name === 'string';
};

export const isReview = (item: any): item is Review => {
  return item && typeof item.id === 'string' && typeof item.rating === 'number';
};

export const isProductInventory = (item: any): item is ProductInventory => {
  return item && typeof item.id === 'string' && typeof item.product_id === 'string';
};

/**
 * Utility types for product management
 */
export type ProductCreateInput = Omit<Product, 
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'published_at'
  | 'rating'
  | 'reviews_count'
  | 'wishlist_count'
  | 'view_count'
  | 'category'
  | 'inventory'
  | 'variants'
  | 'reviews'
  | 'related_products'
>;

export type ProductUpdateInput = Partial<Omit<Product,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'published_at'
  | 'rating'
  | 'reviews_count'
  | 'wishlist_count'
  | 'view_count'
  | 'category'
  | 'inventory'
  | 'variants'
  | 'reviews'
  | 'related_products'
>>;

export type CategoryCreateInput = Omit<Category,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'product_count'
  | 'parent_category'
  | 'subcategories'
  | 'products'
>;

export type CategoryUpdateInput = Partial<Omit<Category,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'product_count'
  | 'parent_category'
  | 'subcategories'
  | 'products'
>>;

/**
 * Product import/export types
 */
export interface ProductImportRecord {
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  sku: string;
  stock: number;
  category?: string;
  brand?: string;
  sizes?: string;
  colors?: string;
  tags?: string;
  images?: string;
}

export interface ProductExportRecord {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  sku: string;
  stock: number;
  category: string | null;
  brand: string | null;
  sizes: string[];
  colors: string[];
  tags: string[];
  rating: number | null;
  reviews_count: number;
  status: string;
  created_at: string;
}

// Re-export related types that might be defined elsewhere
export type { User } from './user';
export type { Order } from './order';

export default {
  ProductStatus,
  AvailabilityStatus,
  ProductCondition,
  SizeSystem,
  WeightUnit,
  DimensionUnit,
  isProduct,
  isCategory,
  isReview,
  isProductInventory
};