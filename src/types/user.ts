// src/types/user.ts

/**
 * User roles in the system
 */
export type UserRole = 'customer' | 'admin' | 'vendor' | 'moderator';

/**
 * User status types
 */
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification';

/**
 * User profile information
 */
export interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  mobile_number: string | null;
  role: UserRole;
  status: UserStatus;
  avatar_url: string | null;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | null;
  
  // Address fields (legacy - should be moved to separate addresses table)
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  email_verified_at: string | null;
  phone_verified_at: string | null;
  
  // Preferences
  preferences: UserPreferences | null;
  
  // Statistics (computed fields)
  statistics?: UserStatistics;
  
  // Relationships (optional - populated when joined)
  addresses?: Address[];
  orders?: Order[];
  reviews?: Review[];
  wishlist?: WishlistItem[];
  notifications?: Notification[];
}

/**
 * User preferences and settings
 */
export interface UserPreferences {
  // Communication preferences
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  
  // Display preferences
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'ta' | 'hi' | 'te';
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  
  // Shopping preferences
  size_system: 'indian' | 'us' | 'uk' | 'eu';
  preferred_categories: string[];
  excluded_brands: string[];
  
  // Privacy settings
  show_reviews: boolean;
  show_wishlist: boolean;
  show_orders: boolean;
  data_sharing: boolean;
}

/**
 * User statistics and activity
 */
export interface UserStatistics {
  total_orders: number;
  completed_orders: number;
  pending_orders: number;
  total_spent: number;
  average_order_value: number;
  favorite_categories: string[];
  last_order_date: string | null;
  join_duration_days: number;
  review_count: number;
  wishlist_count: number;
}

/**
 * User address for shipping and billing
 */
export interface Address {
  id: string;
  user_id: string;
  type: 'shipping' | 'billing' | 'both';
  label: string | null; // Home, Work, etc.
  
  // Address details
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  
  // Contact information
  contact_name: string | null;
  contact_phone: string | null;
  
  // Metadata
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Relationships
  user?: User;
}

/**
 * User session information
 */
export interface UserSession {
  id: string;
  user_id: string;
  device_type: 'web' | 'mobile' | 'tablet';
  device_info: string | null;
  ip_address: string | null;
  user_agent: string | null;
  location: string | null;
  is_active: boolean;
  last_activity_at: string;
  expires_at: string;
  created_at: string;
}

/**
 * User activity log
 */
export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: UserActivityType;
  description: string;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  
  // Relationships
  user?: User;
}

/**
 * Types of user activities
 */
export type UserActivityType = 
  | 'login'
  | 'logout'
  | 'profile_update'
  | 'password_change'
  | 'email_verification'
  | 'phone_verification'
  | 'order_created'
  | 'order_cancelled'
  | 'review_created'
  | 'wishlist_added'
  | 'wishlist_removed'
  | 'address_added'
  | 'address_updated'
  | 'address_deleted'
  | 'payment_method_added'
  | 'payment_method_removed';

/**
 * User notification preferences
 */
export interface NotificationPreference {
  id: string;
  user_id: string;
  type: NotificationType;
  email: boolean;
  push: boolean;
  sms: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Notification types
 */
export type NotificationType = 
  | 'order_confirmation'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_cancelled'
  | 'payment_success'
  | 'payment_failed'
  | 'price_drop'
  | 'back_in_stock'
  | 'new_arrival'
  | 'promotional'
  | 'security'
  | 'system';

/**
 * User wishlist item
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
 * User review and rating
 */
export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  order_id: string | null;
  rating: number; // 1-5
  title: string | null;
  comment: string | null;
  is_verified: boolean;
  is_approved: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  
  // Relationships
  user?: User;
  product?: Product;
  order?: Order;
  images?: ReviewImage[];
  helpful_votes?: HelpfulVote[];
}

/**
 * Review image attachment
 */
export interface ReviewImage {
  id: string;
  review_id: string;
  image_url: string;
  alt_text: string | null;
  created_at: string;
  
  // Relationships
  review?: Review;
}

/**
 * Helpful vote on reviews
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
 * User payment methods
 */
export interface PaymentMethod {
  id: string;
  user_id: string;
  type: 'card' | 'upi' | 'netbanking' | 'wallet';
  provider: string;
  is_default: boolean;
  
  // Card details (encrypted)
  card_last4: string | null;
  card_brand: string | null;
  card_exp_month: number | null;
  card_exp_year: number | null;
  
  // UPI details
  upi_id: string | null;
  
  // Wallet details
  wallet_type: string | null;
  
  // Metadata
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Relationships
  user?: User;
}

/**
 * User support tickets
 */
export interface SupportTicket {
  id: string;
  user_id: string;
  type: 'general' | 'technical' | 'billing' | 'order' | 'product' | 'refund';
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  
  // Relationships
  user?: User;
  assigned_admin?: User;
  messages?: SupportMessage[];
  attachments?: SupportAttachment[];
}

/**
 * Support ticket message
 */
export interface SupportMessage {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_internal: boolean;
  created_at: string;
  
  // Relationships
  ticket?: SupportTicket;
  user?: User;
  attachments?: SupportAttachment[];
}

/**
 * Support attachment
 */
export interface SupportAttachment {
  id: string;
  message_id: string | null;
  ticket_id: string | null;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
  
  // Relationships
  message?: SupportMessage;
  ticket?: SupportTicket;
}

/**
 * User loyalty program information
 */
export interface LoyaltyPoints {
  id: string;
  user_id: string;
  total_points: number;
  available_points: number;
  used_points: number;
  expired_points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points_to_next_tier: number;
  created_at: string;
  updated_at: string;
  
  // Relationships
  user?: User;
  transactions?: LoyaltyTransaction[];
}

/**
 * Loyalty points transaction
 */
export interface LoyaltyTransaction {
  id: string;
  loyalty_id: string;
  type: 'earned' | 'redeemed' | 'expired' | 'adjusted';
  points: number;
  description: string;
  order_id: string | null;
  expires_at: string | null;
  created_at: string;
  
  // Relationships
  loyalty?: LoyaltyPoints;
  order?: Order;
}

/**
 * User referral information
 */
export interface Referral {
  id: string;
  referrer_id: string;
  referred_email: string;
  referred_user_id: string | null;
  code: string;
  status: 'pending' | 'completed' | 'expired';
  reward_issued: boolean;
  expires_at: string;
  created_at: string;
  
  // Relationships
  referrer?: User;
  referred_user?: User;
}

/**
 * User search history
 */
export interface SearchHistory {
  id: string;
  user_id: string;
  query: string;
  results_count: number;
  created_at: string;
  
  // Relationships
  user?: User;
}

/**
 * User browsing history
 */
export interface BrowsingHistory {
  id: string;
  user_id: string;
  product_id: string;
  duration_seconds: number;
  page_views: number;
  last_viewed_at: string;
  created_at: string;
  
  // Relationships
  user?: User;
  product?: Product;
}

/**
 * Type guards for user-related types
 */
export const isUser = (item: any): item is User => {
  return item && typeof item.id === 'string' && typeof item.email === 'string';
};

export const isAddress = (item: any): item is Address => {
  return item && typeof item.id === 'string' && typeof item.line1 === 'string';
};

export const isReview = (item: any): item is Review => {
  return item && typeof item.id === 'string' && typeof item.rating === 'number';
};

export const isWishlistItem = (item: any): item is WishlistItem => {
  return item && typeof item.id === 'string' && typeof item.product_id === 'string';
};

/**
 * Utility types for user management
 */
export type UserCreateInput = Omit<User, 
  | 'id' 
  | 'created_at' 
  | 'updated_at' 
  | 'last_login_at' 
  | 'email_verified_at' 
  | 'phone_verified_at'
  | 'statistics'
  | 'addresses'
  | 'orders'
  | 'reviews'
  | 'wishlist'
  | 'notifications'
>;

export type UserUpdateInput = Partial<Omit<User, 
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'statistics'
  | 'addresses'
  | 'orders'
  | 'reviews'
  | 'wishlist'
  | 'notifications'
>>;

export type AddressCreateInput = Omit<Address, 
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'user'
>;

export type AddressUpdateInput = Partial<Omit<Address,
  | 'id'
  | 'user_id'
  | 'created_at'
  | 'updated_at'
  | 'user'
>>;

// Re-export related types that might be defined elsewhere
export type { Order } from './order';
export type { Product } from './product';
export type { Notification } from './notification';

export default {
  UserRole,
  UserStatus,
  UserActivityType,
  NotificationType,
  isUser,
  isAddress,
  isReview,
  isWishlistItem
};