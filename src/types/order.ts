// src/types/order.ts

/**
 * Order status types
 */
export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'completed' 
  | 'cancelled' 
  | 'refunded' 
  | 'payment_review' 
  | 'partially_shipped' 
  | 'return_requested' 
  | 'return_approved' 
  | 'return_rejected' 
  | 'return_completed';

/**
 * Payment status types
 */
export type PaymentStatus = 
  | 'pending' 
  | 'paid' 
  | 'failed' 
  | 'refunded' 
  | 'pending_verification' 
  | 'partially_paid' 
  | 'cancelled';

/**
 * Shipping status types
 */
export type ShippingStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'packed' 
  | 'shipped' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'failed' 
  | 'returned';

/**
 * Fulfillment status types
 */
export type FulfillmentStatus = 
  | 'unfulfilled' 
  | 'fulfilled' 
  | 'partially_fulfilled' 
  | 'restocked';

/**
 * Return status types
 */
export type ReturnStatus = 
  | 'requested' 
  | 'approved' 
  | 'rejected' 
  | 'picked_up' 
  | 'received' 
  | 'processed' 
  | 'cancelled';

/**
 * Refund status types
 */
export type RefundStatus = 
  | 'pending' 
  | 'processed' 
  | 'failed' 
  | 'cancelled';

/**
 * Shipping method types
 */
export type ShippingMethod = 
  | 'standard' 
  | 'express' 
  | 'next_day' 
  | 'same_day' 
  | 'store_pickup' 
  | 'international';

/**
 * Order type classifications
 */
export type OrderType = 
  | 'regular' 
  | 'pre_order' 
  | 'back_order' 
  | 'wholesale' 
  | 'custom';

/**
 * Main order interface
 */
export interface Order {
  id: string;
  user_id: string | null;
  order_number: string;
  
  // Status information
  status: OrderStatus;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  
  // Pricing and amounts
  total_amount: number;
  subtotal_amount: number;
  shipping_amount: number;
  tax_amount: number;
  discount_amount: number;
  grand_total: number;
  
  // Payment information
  paid_amount: number;
  pending_amount: number;
  currency: string;
  payment_method: string;
  payment_id: string | null;
  payment_session_id: string | null;
  
  // Shipping information
  shipping_address: ShippingAddress;
  shipping_method: ShippingMethod;
  shipping_method_id: string | null;
  shipping_tracking_number: string | null;
  shipping_carrier: string | null;
  estimated_delivery: string | null;
  actual_delivery: string | null;
  
  // Customer information
  customer_email: string;
  customer_phone: string | null;
  customer_note: string | null;
  
  // Metadata
  source: 'web' | 'mobile' | 'pos' | 'api';
  ip_address: string | null;
  user_agent: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  confirmed_at: string | null;
  cancelled_at: string | null;
  completed_at: string | null;
  
  // Relationships (optional - populated when joined)
  user?: User;
  order_items?: OrderItem[];
  payments?: Payment[];
  shipping_method_details?: ShippingMethodDetails;
  status_history?: OrderStatusHistory[];
  returns?: Return[];
  refunds?: Refund[];
}

/**
 * Shipping address for orders
 */
export interface ShippingAddress {
  name: string;
  phone: string;
  email: string | null;
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  landmark: string | null;
  type: 'home' | 'work' | 'other';
  is_default: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Order item interface
 */
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  
  // Product details at time of order
  product_name: string;
  product_sku: string;
  product_image: string | null;
  product_description: string | null;
  
  // Pricing
  unit_price: number;
  original_price: number | null;
  discount_amount: number;
  
  // Quantity and variants
  quantity: number;
  size: string | null;
  color: string | null;
  material: string | null;
  weight: number | null;
  
  // Status
  status: OrderStatus;
  is_returnable: boolean;
  return_deadline: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Relationships
  order?: Order;
  product?: Product;
  returns?: ReturnItem[];
}

/**
 * Shipping method details
 */
export interface ShippingMethodDetails {
  id: string;
  name: string;
  description: string | null;
  cost: number;
  estimated_days: string;
  is_active: boolean;
  supported_regions: string[];
  weight_limit: number | null;
  dimension_limit: string | null;
  free_shipping_threshold: number | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Relationships
  orders?: Order[];
}

/**
 * Order status history
 */
export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  note: string | null;
  created_by: string | null; // user_id or system
  created_at: string;
  
  // Relationships
  order?: Order;
  user?: User;
}

/**
 * Return request
 */
export interface Return {
  id: string;
  order_id: string;
  user_id: string;
  
  // Return information
  reason: string;
  status: ReturnStatus;
  type: 'refund' | 'exchange' | 'store_credit';
  refund_amount: number | null;
  exchange_product_id: string | null;
  
  // Customer comments
  customer_comments: string | null;
  customer_images: string[];
  
  // Admin handling
  admin_comments: string | null;
  admin_id: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  rejected_at: string | null;
  processed_at: string | null;
  
  // Relationships
  order?: Order;
  user?: User;
  admin?: User;
  return_items?: ReturnItem[];
  refund?: Refund;
}

/**
 * Return item
 */
export interface ReturnItem {
  id: string;
  return_id: string;
  order_item_id: string;
  
  // Return details
  quantity: number;
  reason: string;
  condition: 'unopened' | 'like_new' | 'used' | 'damaged';
  images: string[];
  
  // Approval and processing
  approved_quantity: number | null;
  refund_amount: number | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Relationships
  return?: Return;
  order_item?: OrderItem;
}

/**
 * Refund for order
 */
export interface Refund {
  id: string;
  order_id: string;
  return_id: string | null;
  
  // Refund details
  amount: number;
  reason: string;
  status: RefundStatus;
  method: 'original' | 'store_credit' | 'bank_transfer' | 'wallet';
  
  // Processing information
  processed_by: string | null;
  transaction_id: string | null;
  notes: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  processed_at: string | null;
  
  // Relationships
  order?: Order;
  return?: Return;
  processed_by_user?: User;
}

/**
 * Order tracking information
 */
export interface OrderTracking {
  id: string;
  order_id: string;
  tracking_number: string;
  carrier: string;
  carrier_url: string | null;
  
  // Tracking events
  events: TrackingEvent[];
  
  // Estimated delivery
  estimated_delivery: string | null;
  actual_delivery: string | null;
  
  // Current status
  current_status: ShippingStatus;
  current_location: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Relationships
  order?: Order;
}

/**
 * Tracking event
 */
export interface TrackingEvent {
  id: string;
  tracking_id: string;
  status: ShippingStatus;
  description: string;
  location: string | null;
  timestamp: string;
  created_at: string;
  
  // Relationships
  tracking?: OrderTracking;
}

/**
 * Order analytics data
 */
export interface OrderAnalytics {
  date: string;
  
  // Order counts
  total_orders: number;
  new_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  
  // Revenue metrics
  total_revenue: number;
  average_order_value: number;
  conversion_rate: number;
  
  // Customer metrics
  new_customers: number;
  returning_customers: number;
  
  // Status breakdown
  status_breakdown: Record<OrderStatus, number>;
  
  // Payment method breakdown
  payment_method_breakdown: Record<string, number>;
}

/**
 * Order summary for lists and dashboards
 */
export interface OrderSummary {
  id: string;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  total_amount: number;
  item_count: number;
  customer_name: string;
  customer_email: string;
  created_at: string;
  estimated_delivery: string | null;
}

/**
 * Order creation request
 */
export interface OrderCreateRequest {
  user_id?: string | null;
  shipping_address: ShippingAddress;
  shipping_method: ShippingMethod;
  payment_method: string;
  items: OrderItemCreateRequest[];
  customer_note?: string | null;
  coupon_code?: string | null;
  source?: 'web' | 'mobile' | 'pos' | 'api';
}

/**
 * Order item creation request
 */
export interface OrderItemCreateRequest {
  product_id: string;
  quantity: number;
  size?: string | null;
  color?: string | null;
  material?: string | null;
}

/**
 * Order update request
 */
export interface OrderUpdateRequest {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  shipping_tracking_number?: string;
  shipping_carrier?: string;
  estimated_delivery?: string;
  customer_note?: string;
}

/**
 * Return creation request
 */
export interface ReturnCreateRequest {
  order_id: string;
  items: ReturnItemCreateRequest[];
  reason: string;
  type: 'refund' | 'exchange' | 'store_credit';
  customer_comments?: string;
  customer_images?: string[];
}

/**
 * Return item creation request
 */
export interface ReturnItemCreateRequest {
  order_item_id: string;
  quantity: number;
  reason: string;
  condition: 'unopened' | 'like_new' | 'used' | 'damaged';
  images?: string[];
}

/**
 * Order filter options
 */
export interface OrderFilters {
  status?: OrderStatus[];
  payment_status?: PaymentStatus[];
  date_from?: string;
  date_to?: string;
  customer_email?: string;
  order_number?: string;
  min_amount?: number;
  max_amount?: number;
  sort_by?: 'created_at' | 'total_amount' | 'updated_at';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Order search result
 */
export interface OrderSearchResult {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  filters: OrderFilters;
}

/**
 * Order statistics
 */
export interface OrderStatistics {
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  average_order_value: number;
  popular_products: Array<{
    product_id: string;
    product_name: string;
    quantity_sold: number;
    revenue: number;
  }>;
  recent_orders: OrderSummary[];
}

/**
 * Invoice information
 */
export interface Invoice {
  id: string;
  order_id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  
  // Company information
  company_name: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  company_gstin: string | null;
  
  // Customer information
  customer_name: string;
  customer_address: string;
  customer_phone: string;
  customer_email: string;
  customer_gstin: string | null;
  
  // Amount breakdown with taxes
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  grand_total: number;
  
  // Tax breakdown
  tax_breakdown: Array<{
    name: string;
    rate: number;
    amount: number;
  }>;
  
  // Items
  items: InvoiceItem[];
  
  // Payment information
  payment_status: PaymentStatus;
  payment_method: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Relationships
  order?: Order;
}

/**
 * Invoice item
 */
export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  
  // Relationships
  invoice?: Invoice;
}

/**
 * Type guards for order-related types
 */
export const isOrder = (item: any): item is Order => {
  return item && typeof item.id === 'string' && typeof item.total_amount === 'number';
};

export const isOrderItem = (item: any): item is OrderItem => {
  return item && typeof item.id === 'string' && typeof item.unit_price === 'number';
};

export const isReturn = (item: any): item is Return => {
  return item && typeof item.id === 'string' && typeof item.order_id === 'string';
};

export const isShippingAddress = (item: any): item is ShippingAddress => {
  return item && typeof item.street === 'string' && typeof item.city === 'string';
};

/**
 * Utility types for order management
 */
export type OrderCreateInput = Omit<Order,
  | 'id'
  | 'order_number'
  | 'created_at'
  | 'updated_at'
  | 'confirmed_at'
  | 'cancelled_at'
  | 'completed_at'
  | 'user'
  | 'order_items'
  | 'payments'
  | 'shipping_method_details'
  | 'status_history'
  | 'returns'
  | 'refunds'
>;

export type OrderUpdateInput = Partial<Omit<Order,
  | 'id'
  | 'user_id'
  | 'order_number'
  | 'created_at'
  | 'user'
  | 'order_items'
  | 'payments'
  | 'shipping_method_details'
  | 'status_history'
  | 'returns'
  | 'refunds'
>>;

export type OrderItemCreateInput = Omit<OrderItem,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'order'
  | 'product'
  | 'returns'
>;

export type ReturnCreateInput = Omit<Return,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'approved_at'
  | 'rejected_at'
  | 'processed_at'
  | 'order'
  | 'user'
  | 'admin'
  | 'return_items'
  | 'refund'
>;

// Re-export related types that might be defined elsewhere
export type { User } from './user';
export type { Product } from './product';
export type { Payment } from './payment';

export default {
  OrderStatus,
  PaymentStatus,
  ShippingStatus,
  FulfillmentStatus,
  ReturnStatus,
  RefundStatus,
  ShippingMethod,
  OrderType,
  isOrder,
  isOrderItem,
  isReturn,
  isShippingAddress
};