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
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
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

export interface Order {
  id: string;
  user_id: string | null; // nullable because of ON DELETE SET NULL
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'completed' | 'cancelled' | 'payment_review';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'pending_verification';
  payment_session_id?: string; // corresponds to text column
  total_amount: number;
  shipping_address: ShippingAddress; // corresponds to JSONB column
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[]; // fetched via relation
  profiles?: User;    
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
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles?: {
    name: string;
  };
}

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
  role: string;
  created_at: string;
  updated_at: string;
  avatar_url: string | null; 
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  size?: string;
  color?: string;
  product?: Product;
}