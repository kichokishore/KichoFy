export interface ShippingFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  size?: string;
  color?: string;
  product?: {
    name: string;
    price: number;
    image_url: string;
    description: string;
  };
}

export interface OrderData {
  user_id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_session_id: string;
  shipping_address: ShippingFormData;
  items: any[];
}