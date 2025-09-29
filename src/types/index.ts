export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  language: 'en' | 'ta' | 'hi' | 'te';
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory?: string;
  stock: number;
  image_url: string;
  images?: string[];
  sizes?: string[];
  colors?: string[];
  tags?: string[];
  rating?: number;
  reviews?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  created_at: string;
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

export interface Order {
  id: string;
  user_id: string;
  products: CartItem[];
  total_price: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string;
  payment_method: string;
  created_at: string;
}

export interface Language {
  code: 'en' | 'ta' | 'hi' | 'te';
  name: string;
  flag: string;
}