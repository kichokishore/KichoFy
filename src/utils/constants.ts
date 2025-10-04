// Application Configuration
export const APP_CONFIG = {
  NAME: 'KichoFy',
  DESCRIPTION: 'Your premium handmade products marketplace',
  VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@kichofy.com',
  SUPPORT_PHONE: '+91-9876543210',
  BASE_URL: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
} as const;

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_SUPABASE_URL,
  ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
} as const;

// Payment Configuration
export const PAYMENT_CONFIG = {
  CURRENCY: 'INR',
  RAZORPAY_KEY: import.meta.env.VITE_RAZORPAY_KEY_ID,
  ALLOWED_PAYMENT_METHODS: ['upi', 'card', 'netbanking', 'wallet'] as const,
  UPI_APPS: ['google_pay', 'phonepe', 'paytm', 'bhim_upi'] as const,
} as const;

// Shipping Configuration
export const SHIPPING_CONFIG = {
  FREE_SHIPPING_THRESHOLD: 999,
  STANDARD_SHIPPING_COST: 49,
  EXPRESS_SHIPPING_COST: 99,
  DEFAULT_ESTIMATED_DAYS: {
    STANDARD: '5-7 business days',
    EXPRESS: '2-3 business days',
  },
} as const;

// Cart & Inventory Constants
export const CART_CONFIG = {
  MAX_QUANTITY_PER_ITEM: 10,
  GUEST_CART_EXPIRY_DAYS: 7,
  LOW_STOCK_THRESHOLD: 5,
  OUT_OF_STOCK_THRESHOLD: 0,
} as const;

// Order Status Constants
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  PAYMENT_REVIEW: 'payment_review',
  REFUNDED: 'refunded',
} as const;

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Pending',
  [ORDER_STATUS.CONFIRMED]: 'Confirmed',
  [ORDER_STATUS.PROCESSING]: 'Processing',
  [ORDER_STATUS.SHIPPED]: 'Shipped',
  [ORDER_STATUS.DELIVERED]: 'Delivered',
  [ORDER_STATUS.COMPLETED]: 'Completed',
  [ORDER_STATUS.CANCELLED]: 'Cancelled',
  [ORDER_STATUS.PAYMENT_REVIEW]: 'Payment Review',
  [ORDER_STATUS.REFUNDED]: 'Refunded',
} as const;

export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [ORDER_STATUS.CONFIRMED]: 'bg-blue-100 text-blue-800',
  [ORDER_STATUS.PROCESSING]: 'bg-purple-100 text-purple-800',
  [ORDER_STATUS.SHIPPED]: 'bg-indigo-100 text-indigo-800',
  [ORDER_STATUS.DELIVERED]: 'bg-green-100 text-green-800',
  [ORDER_STATUS.COMPLETED]: 'bg-gray-100 text-gray-800',
  [ORDER_STATUS.CANCELLED]: 'bg-red-100 text-red-800',
  [ORDER_STATUS.PAYMENT_REVIEW]: 'bg-orange-100 text-orange-800',
  [ORDER_STATUS.REFUNDED]: 'bg-pink-100 text-pink-800',
} as const;

// Payment Status Constants
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PENDING_VERIFICATION: 'pending_verification',
  PARTIALLY_PAID: 'partially_paid',
} as const;

export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.PENDING]: 'Pending',
  [PAYMENT_STATUS.PAID]: 'Paid',
  [PAYMENT_STATUS.FAILED]: 'Failed',
  [PAYMENT_STATUS.REFUNDED]: 'Refunded',
  [PAYMENT_STATUS.PENDING_VERIFICATION]: 'Verification Pending',
  [PAYMENT_STATUS.PARTIALLY_PAID]: 'Partially Paid',
} as const;

// User Roles
export const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  VENDOR: 'vendor',
} as const;

// Product Constants
export const PRODUCT_CONFIG = {
  FEATURED_LIMIT: 8,
  RELATED_PRODUCTS_LIMIT: 4,
  PRODUCTS_PER_PAGE: 12,
  MAX_IMAGES_PER_PRODUCT: 5,
  DEFAULT_SORT: 'newest',
} as const;

// Available Sizes for Products
export const PRODUCT_SIZES = [
  'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL',
  '28', '30', '32', '34', '36', '38', '40', '42', '44',
  'One Size',
  'Custom'
] as const;

// Available Colors for Products
export const PRODUCT_COLORS = [
  'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 
  'Pink', 'Purple', 'Orange', 'Brown', 'Gray', 'Navy',
  'Maroon', 'Teal', 'Olive', 'Coral', 'Beige', 'Gold',
  'Silver', 'Multi-color'
] as const;

// Category Constants
export const CATEGORIES = {
  CLOTHING: 'clothing',
  ACCESSORIES: 'accessories',
  HOME_DECOR: 'home-decor',
  JEWELRY: 'jewelry',
  ART: 'art',
  CUSTOM: 'custom',
} as const;

export const CATEGORY_LABELS = {
  [CATEGORIES.CLOTHING]: 'Clothing',
  [CATEGORIES.ACCESSORIES]: 'Accessories',
  [CATEGORIES.HOME_DECOR]: 'Home Decor',
  [CATEGORIES.JEWELRY]: 'Jewelry',
  [CATEGORIES.ART]: 'Art & Craft',
  [CATEGORIES.CUSTOM]: 'Custom Orders',
} as const;

// Sort Options
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'name_asc', label: 'Name: A to Z' },
  { value: 'name_desc', label: 'Name: Z to A' },
] as const;

// Filter Constants
export const PRICE_RANGES = [
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 - ₹1000', min: 500, max: 1000 },
  { label: '₹1000 - ₹2000', min: 1000, max: 2000 },
  { label: '₹2000 - ₹5000', min: 2000, max: 5000 },
  { label: 'Over ₹5000', min: 5000, max: 100000 },
] as const;

export const RATING_OPTIONS = [
  { value: '4.5', label: '4.5★ & above' },
  { value: '4', label: '4★ & above' },
  { value: '3', label: '3★ & above' },
  { value: '2', label: '2★ & above' },
  { value: '1', label: '1★ & above' },
] as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_SESSION: 'kichofy_user_session',
  GUEST_CART: 'kichofy_guest_cart',
  RECENT_SEARCHES: 'kichofy_recent_searches',
  PREFERENCES: 'kichofy_user_preferences',
  AUTH_TOKEN: 'kichofy_auth_token',
} as const;

// Date & Time Formats
export const DATE_FORMATS = {
  DISPLAY_DATE: 'DD MMM YYYY',
  DISPLAY_DATETIME: 'DD MMM YYYY, hh:mm A',
  ORDER_DATE: 'DD MMM YYYY, ddd',
  API_DATE: 'YYYY-MM-DD',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Please login to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Something went wrong. Please try again.',
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  OUT_OF_STOCK: 'Sorry, this product is out of stock.',
  LOW_STOCK: 'Only a few items left in stock.',
  INVALID_COUPON: 'Invalid or expired coupon code.',
  COUPON_MIN_ORDER: 'Coupon requires minimum order amount.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  ORDER_PLACED: 'Order placed successfully!',
  PAYMENT_SUCCESS: 'Payment completed successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  ADDRESS_ADDED: 'Address added successfully!',
  ITEM_ADDED_TO_CART: 'Item added to cart!',
  ITEM_ADDED_TO_WISHLIST: 'Item added to wishlist!',
  REVIEW_ADDED: 'Thank you for your review!',
  COUPON_APPLIED: 'Coupon applied successfully!',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  EMAIL: {
    MAX_LENGTH: 100,
  },
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 15,
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 100,
  },
  PINCODE: {
    LENGTH: 6,
  },
  PRODUCT: {
    NAME_MAX_LENGTH: 100,
    DESCRIPTION_MAX_LENGTH: 1000,
  },
  REVIEW: {
    COMMENT_MAX_LENGTH: 500,
  },
} as const;

// API Endpoints (Supabase Tables)
export const TABLE_NAMES = {
  PROFILES: 'profiles',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  CART_ITEMS: 'cart_items',
  ORDERS: 'orders',
  ORDER_ITEMS: 'order_items',
  ORDER_STATUS_HISTORY: 'order_status_history',
  ADDRESSES: 'addresses',
  PAYMENTS: 'payments',
  PENDING_PAYMENTS: 'pending_payments',
  WISHLIST: 'wishlist',
  REVIEWS: 'reviews',
  COUPONS: 'coupons',
  COUPON_USAGE: 'coupon_usage',
  NOTIFICATIONS: 'notifications',
  RETURNS: 'returns',
  RETURN_ITEMS: 'return_items',
  SHIPPING_METHODS: 'shipping_methods',
  PRODUCT_INVENTORY: 'product_inventory',
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_WISHLIST: true,
  ENABLE_REVIEWS: true,
  ENABLE_COUPONS: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_RETURNS: true,
  ENABLE_MULTI_LANGUAGE: true,
  ENABLE_ADMIN_DASHBOARD: true,
} as const;

// Language Support
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
] as const;

// Social Media Links
export const SOCIAL_LINKS = {
  FACEBOOK: 'https://facebook.com/kichofy',
  INSTAGRAM: 'https://instagram.com/kichofy',
  TWITTER: 'https://twitter.com/kichofy',
  PINTEREST: 'https://pinterest.com/kichofy',
} as const;

// SEO Constants
export const SEO_CONFIG = {
  DEFAULT_TITLE: 'KichoFy - Handmade Products Marketplace',
  DEFAULT_DESCRIPTION: 'Discover unique handmade products, custom crafts, and artisanal goods at KichoFy.',
  KEYWORDS: 'handmade, crafts, artisanal, custom products, handmade jewelry, home decor',
} as const;

// Performance Constants
export const PERFORMANCE_CONFIG = {
  DEBOUNCE_DELAY: 300,
  INFINITE_SCROLL_THRESHOLD: 100,
  LAZY_LOAD_THRESHOLD: 0.1,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
} as const;

// Export Type Helpers
export type OrderStatusType = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];
export type PaymentStatusType = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];
export type UserRoleType = typeof USER_ROLES[keyof typeof USER_ROLES];
export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];
export type SortOptionType = typeof SORT_OPTIONS[number]['value'];