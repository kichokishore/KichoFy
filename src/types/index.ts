// Core Product Types
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category_id: string | null;
  subcategory: string | null;
  stock: number;
  image_url: string | null;
  images: string[];
  sizes: string[];
  colors: string[];
  tags: string[];
  rating: number | null;
  reviews: number;
  is_new: boolean;
  is_best_seller: boolean;
  created_at: string;
  updated_at: string;
  // Enhanced with inventory data
  inventory?: ProductInventory[];
  category?: Category;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  // Enhanced relationships
  parent_category?: Category;
  subcategories?: Category[];
  products_count?: number;
}

// User and Profile Types (Updated to match old version)
export interface User {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  mobile_number: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  pincode: string | null;
  role: 'customer' | 'admin' | 'vendor';
  created_at: string;
  updated_at: string;
  avatar_url: string | null;
  // Language field from old version
  language?: 'en' | 'ta' | 'hi' | 'te';
  // Enhanced with relationships
  addresses?: Address[];
  orders?: Order[];
  reviews?: Review[];
}

// Address Management
export interface Address {
  id: string;
  user_id: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
}

// Cart System
export interface CartItem {
  id: string;
  user_id?: string; // Optional for guest users
  product_id: string;
  quantity: number;
  size?: string;
  color?: string;
  product?: Product;
}

export interface DBCartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  size: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
  products?: Product;
}

// Product Inventory/Variants
export interface ProductInventory {
  id: string;
  product_id: string;
  size: string | null;
  color: string | null;
  stock_quantity: number;
  sku: string;
  created_at: string;
  updated_at: string;
  product?: Product;
}

// Order Management
export interface Order {
  id: string;
  user_id: string | null;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'payment_review' | 'refunded';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'pending_verification' | 'partially_paid';
  payment_session_id?: string;
  payment_id?: string; // Razorpay payment ID
  total_amount: number;
  paid_amount?: number; // For partial payments
  pending_amount?: number; // For partial payments
  shipping_address: ShippingAddress;
  shipping_method_id?: string;
  discount_amount?: number;
  tracking_number?: string;
  estimated_delivery?: string;
  created_at: string;
  updated_at: string;
  // Enhanced relationships
  order_items?: OrderItem[];
  profiles?: User;
  shipping_method?: ShippingMethod;
  status_history?: OrderStatusHistory[];
  payments?: Payment[];
  shipping_address_id?: string;
  address?: Address;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  size: string | null;
  color: string | null;
  product?: Product;
  order?: Order;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: string;
  note: string | null;
  created_at: string;
  order?: Order;
}

// Payment System
export interface Payment {
  id: string;
  order_id: string;
  payment_id: string | null; // Razorpay payment ID
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'pending';
  method: 'upi' | 'card' | 'netbanking' | 'wallet' | 'emi' | 'cash_on_delivery';
  bank: string | null;
  wallet: string | null;
  card_id: string | null;
  created_at: string;
  updated_at: string;
  order?: Order;
}

export interface PendingPayment {
  id: string;
  session_id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'verified' | 'expired';
  order_data: any; // JSONB data
  created_at: string;
  expires_at: string;
  user?: User;
}

// Shipping Methods
export interface ShippingMethod {
  id: string;
  name: string;
  description: string | null;
  cost: number;
  estimated_days: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Coupons and Discounts
export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
}

export interface CouponUsage {
  id: string;
  coupon_id: string;
  user_id: string;
  order_id: string;
  discount_amount: number;
  used_at: string;
  coupon?: Coupon;
  user?: User;
  order?: Order;
}

// Reviews and Ratings
export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles?: {
    name: string;
    avatar_url?: string;
  };
  product?: Product;
  user?: User;
}

// Wishlist
export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
  user?: User;
}

// Returns and Refunds
export interface Return {
  id: string;
  order_id: string;
  user_id: string;
  reason: string;
  status: 'requested' | 'approved' | 'rejected' | 'processed';
  refund_amount: number | null;
  created_at: string;
  updated_at: string;
  order?: Order;
  user?: User;
  return_items?: ReturnItem[];
}

export interface ReturnItem {
  id: string;
  return_id: string;
  order_item_id: string;
  quantity: number;
  reason: string | null;
  created_at: string;
  order_item?: OrderItem;
  return?: Return;
}

// Notifications
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  related_entity_type: 'order' | 'product' | 'payment' | 'return' | null;
  related_entity_id: string | null;
  created_at: string;
  user?: User;
}

// Analytics Types
export interface ProductAnalytics {
  product_id: string;
  product_name: string;
  views: number;
  add_to_cart: number;
  purchases: number;
  revenue: number;
  created_at: string;
  product?: Product;
}

export interface SalesAnalytics {
  date: string;
  revenue: number;
  orders: number;
  average_order_value: number;
}

export interface CustomerAnalytics {
  total_customers: number;
  new_customers: number;
  returning_customers: number;
  customer_acquisition_cost: number;
  customer_lifetime_value: number;
}

// User Session (for analytics)
export interface UserSession {
  id: string;
  user_id: string | null;
  session_data: any;
  created_at: string;
  expires_at: string;
  user?: User;
}

// App Context Types (Updated to match old version)
export type Language = 'en' | 'ta' | 'hi' | 'te';

export interface AppNotification {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  show: boolean;
}

export interface AppState {
  user: User | null;
  cart: CartItem[];
  orders: Order[];
  darkMode: boolean;
  language: Language;
  isLoading: boolean;
  notification: AppNotification;
}

export type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_NOTIFICATION'; payload: AppNotification }
  | { type: 'CLEAR_NOTIFICATION' }
  | { type: 'SET_CART'; payload: CartItem[] };

// Form Data Types
export interface CheckoutFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  shipping_method?: string;
  coupon_code?: string;
}

// Search and Filter Types
export interface ProductFilters {
  categories?: string[];
  price_range?: { min: number; max: number };
  sizes?: string[];
  colors?: string[];
  ratings?: number[];
  in_stock?: boolean;
  on_sale?: boolean;
  sort_by?: 'price_asc' | 'price_desc' | 'newest' | 'popular' | 'rating';
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Payment Gateway Types
export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret?: string;
}

export interface PaymentMethod {
  type: 'card' | 'upi' | 'netbanking' | 'wallet';
  details: any;
}

// Database Enums and Constants
export const OrderStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  PAYMENT_REVIEW: 'payment_review',
  REFUNDED: 'refunded'
} as const;

export const PaymentStatus = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PENDING_VERIFICATION: 'pending_verification',
  PARTIALLY_PAID: 'partially_paid'
} as const;

export const UserRole = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  VENDOR: 'vendor'
} as const;

// Type Guards
export const isProduct = (item: any): item is Product => {
  return item && typeof item.id === 'string' && typeof item.name === 'string';
};

export const isOrder = (item: any): item is Order => {
  return item && typeof item.id === 'string' && typeof item.total_amount === 'number';
};

export const isUser = (item: any): item is User => {
  return item && typeof item.id === 'string' && typeof item.email === 'string';
};

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;