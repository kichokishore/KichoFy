// src/types/payment.ts

/**
 * Payment method types
 */
export type PaymentMethodType = 
  | 'upi' 
  | 'card' 
  | 'netbanking' 
  | 'wallet' 
  | 'cash_on_delivery' 
  | 'emi' 
  | 'pay_later';

/**
 * Payment status types
 */
export type PaymentStatus = 
  | 'created' 
  | 'authorized' 
  | 'captured' 
  | 'failed' 
  | 'refunded' 
  | 'pending' 
  | 'pending_verification' 
  | 'partially_refunded' 
  | 'disputed' 
  | 'cancelled';

/**
 * Currency types
 */
export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';

/**
 * Card types
 */
export type CardType = 'visa' | 'mastercard' | 'amex' | 'rupay' | 'discover' | 'maestro' | 'other';

/**
 * Card network types
 */
export type CardNetwork = 'visa' | 'mastercard' | 'amex' | 'rupay' | 'discover' | 'maestro';

/**
 * UPI app types
 */
export type UpiApp = 
  | 'google_pay' 
  | 'phonepe' 
  | 'paytm' 
  | 'bhim' 
  | 'amazon_pay' 
  | 'other';

/**
 * Wallet types
 */
export type WalletType = 
  | 'paytm' 
  | 'amazon_pay' 
  | 'mobikwik' 
  | 'freecharge' 
  | 'oxigen' 
  | 'other';

/**
 * Bank types for netbanking
 */
export type BankCode = 
  | 'HDFC' | 'ICICI' | 'SBI' | 'AXIS' | 'KOTAK' | 'YES' | 'BOB' | 'PNB' 
  | 'CANARA' | 'UNION' | 'INDIAN' | 'IOB' | 'UBI' | 'CENTRAL' | 'OTHER';

/**
 * EMI provider types
 */
export type EmiProvider = 
  | 'hdfc' 
  | 'icici' 
  | 'sbi' 
  | 'axis' 
  | 'kotak' 
  | 'yes' 
  | 'indusind' 
  | 'other';

/**
 * Pay later provider types
 */
export type PayLaterProvider = 
  | 'simpl' 
  | 'lazypay' 
  | 'epaylater' 
  | 'zestmoney' 
  | 'other';

/**
 * Refund status types
 */
export type RefundStatus = 
  | 'pending' 
  | 'processed' 
  | 'failed' 
  | 'cancelled';

/**
 * Main payment interface
 */
export interface Payment {
  id: string;
  order_id: string;
  payment_id: string | null; // Gateway payment ID
  payment_method: PaymentMethodType;
  
  // Amount details
  amount: number;
  currency: Currency;
  amount_refunded: number;
  amount_due: number;
  
  // Status and metadata
  status: PaymentStatus;
  gateway: string; // razorpay, stripe, paypal, etc.
  gateway_fee: number | null;
  tax_on_fee: number | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  authorized_at: string | null;
  captured_at: string | null;
  failed_at: string | null;
  
  // Error information
  error_code: string | null;
  error_description: string | null;
  error_source: string | null;
  error_step: string | null;
  error_reason: string | null;
  
  // Relationships
  order?: Order;
  refunds?: Refund[];
  payment_method_details?: PaymentMethodDetails;
  gateway_responses?: GatewayResponse[];
}

/**
 * Payment method details (polymorphic based on payment method)
 */
export interface PaymentMethodDetails {
  id: string;
  payment_id: string;
  payment_method: PaymentMethodType;
  
  // Common fields
  is_saved: boolean;
  is_default: boolean;
  
  // Card details (encrypted/hashed)
  card_details?: CardDetails;
  
  // UPI details
  upi_details?: UpiDetails;
  
  // Netbanking details
  netbanking_details?: NetbankingDetails;
  
  // Wallet details
  wallet_details?: WalletDetails;
  
  // EMI details
  emi_details?: EmiDetails;
  
  // Pay later details
  pay_later_details?: PayLaterDetails;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Relationships
  payment?: Payment;
}

/**
 * Card payment details
 */
export interface CardDetails {
  card_id: string | null; // Gateway card ID for saved cards
  card_last4: string;
  card_network: CardNetwork;
  card_type: CardType;
  card_issuer: string | null;
  card_country: string | null;
  card_exp_month: number;
  card_exp_year: number;
  card_name: string | null;
  card_token: string | null; // Tokenized card data
  is_international: boolean;
}

/**
 * UPI payment details
 */
export interface UpiDetails {
  upi_id: string;
  upi_app: UpiApp;
  vpa: string; // Virtual Payment Address
  flow: 'collect' | 'intent' | 'qr';
  qr_code_url: string | null;
  deep_link: string | null;
}

/**
 * Netbanking payment details
 */
export interface NetbankingDetails {
  bank_code: BankCode;
  bank_name: string;
  bank_ifsc: string | null;
  bank_account: string | null; // Masked account number
}

/**
 * Wallet payment details
 */
export interface WalletDetails {
  wallet_type: WalletType;
  wallet_id: string | null;
  wallet_phone: string | null;
  wallet_email: string | null;
}

/**
 * EMI payment details
 */
export interface EmiDetails {
  emi_provider: EmiProvider;
  emi_duration: number; // in months
  emi_interest_rate: number;
  emi_total_amount: number;
  emi_monthly_amount: number;
  bank_code: BankCode | null;
}

/**
 * Pay later details
 */
export interface PayLaterDetails {
  provider: PayLaterProvider;
  credit_limit: number | null;
  due_date: string | null;
  interest_rate: number | null;
}

/**
 * Cash on delivery details
 */
export interface CashOnDeliveryDetails {
  collected_amount: number | null;
  collected_at: string | null;
  collected_by: string | null;
  change_given: number | null;
}

/**
 * Refund information
 */
export interface Refund {
  id: string;
  payment_id: string;
  refund_id: string | null; // Gateway refund ID
  order_id: string;
  
  // Amount details
  amount: number;
  currency: Currency;
  reason: string;
  
  // Status and metadata
  status: RefundStatus;
  gateway: string;
  gateway_fee_refunded: number | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  processed_at: string | null;
  
  // Error information
  error_code: string | null;
  error_description: string | null;
  
  // Relationships
  payment?: Payment;
  order?: Order;
}

/**
 * Payment gateway response logs
 */
export interface GatewayResponse {
  id: string;
  payment_id: string;
  step: string; // create, authorize, capture, refund, etc.
  request_data: Record<string, any>;
  response_data: Record<string, any>;
  response_code: string | null;
  response_message: string | null;
  is_success: boolean;
  created_at: string;
  
  // Relationships
  payment?: Payment;
}

/**
 * Saved payment method for user
 */
export interface SavedPaymentMethod {
  id: string;
  user_id: string;
  payment_method: PaymentMethodType;
  is_default: boolean;
  is_active: boolean;
  
  // Method-specific details
  card_details?: SavedCardDetails;
  upi_details?: SavedUpiDetails;
  wallet_details?: SavedWalletDetails;
  
  // Metadata
  last_used_at: string | null;
  usage_count: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Relationships
  user?: User;
}

/**
 * Saved card details
 */
export interface SavedCardDetails {
  card_id: string; // Gateway card ID
  card_last4: string;
  card_network: CardNetwork;
  card_type: CardType;
  card_issuer: string | null;
  card_exp_month: number;
  card_exp_year: number;
  card_name: string | null;
  card_token: string | null;
  is_international: boolean;
}

/**
 * Saved UPI details
 */
export interface SavedUpiDetails {
  upi_id: string;
  vpa: string;
  upi_app: UpiApp;
  is_verified: boolean;
}

/**
 * Saved wallet details
 */
export interface SavedWalletDetails {
  wallet_type: WalletType;
  wallet_id: string;
  wallet_phone: string | null;
  wallet_email: string | null;
}

/**
 * Payment gateway configuration
 */
export interface PaymentGateway {
  id: string;
  name: string; // razorpay, stripe, paypal, etc.
  display_name: string;
  is_active: boolean;
  is_test_mode: boolean;
  
  // Configuration
  api_key: string | null;
  api_secret: string | null;
  webhook_secret: string | null;
  merchant_id: string | null;
  
  // Supported features
  supported_methods: PaymentMethodType[];
  supported_currencies: Currency[];
  supported_card_networks: CardNetwork[];
  supported_banks: BankCode[];
  supported_wallets: WalletType[];
  supported_emi_providers: EmiProvider[];
  supported_pay_later_providers: PayLaterProvider[];
  
  // Fees and limits
  transaction_fee_percentage: number;
  transaction_fee_fixed: number;
  minimum_amount: number;
  maximum_amount: number;
  
  // Configuration
  config: Record<string, any>;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Payment intent (for client-side payment initialization)
 */
export interface PaymentIntent {
  id: string;
  order_id: string;
  client_secret: string | null;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  payment_method_types: PaymentMethodType[];
  next_action: any | null;
  created_at: string;
  updated_at: string;
  
  // Relationships
  order?: Order;
}

/**
 * Payment webhook event
 */
export interface PaymentWebhook {
  id: string;
  gateway: string;
  event_type: string;
  event_id: string;
  payload: Record<string, any>;
  processed: boolean;
  processing_error: string | null;
  created_at: string;
  processed_at: string | null;
}

/**
 * Payment transaction summary
 */
export interface PaymentTransaction {
  id: string;
  payment_id: string;
  type: 'payment' | 'refund' | 'fee' | 'adjustment';
  amount: number;
  currency: Currency;
  description: string;
  metadata: Record<string, any> | null;
  created_at: string;
  
  // Relationships
  payment?: Payment;
}

/**
 * Payment dispute information
 */
export interface PaymentDispute {
  id: string;
  payment_id: string;
  dispute_id: string | null; // Gateway dispute ID
  reason: string;
  status: 'needs_response' | 'under_review' | 'won' | 'lost' | 'warning_needs_response' | 'warning_under_review' | 'warning_closed' | 'closed';
  amount: number;
  currency: Currency;
  evidence: Record<string, any> | null;
  evidence_due_by: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  
  // Relationships
  payment?: Payment;
}

/**
 * Payment analytics data
 */
export interface PaymentAnalytics {
  date: string;
  gateway: string;
  
  // Transaction counts
  total_transactions: number;
  successful_transactions: number;
  failed_transactions: number;
  refunded_transactions: number;
  
  // Amount metrics
  total_amount: number;
  successful_amount: number;
  failed_amount: number;
  refunded_amount: number;
  gateway_fees: number;
  
  // Method distribution
  method_breakdown: Record<PaymentMethodType, number>;
  
  // Conversion rates
  success_rate: number;
  refund_rate: number;
}

/**
 * Payment request for creating new payments
 */
export interface PaymentRequest {
  order_id: string;
  amount: number;
  currency: Currency;
  payment_method: PaymentMethodType;
  
  // Method-specific data
  card_details?: Partial<CardDetails>;
  upi_details?: Partial<UpiDetails>;
  netbanking_details?: Partial<NetbankingDetails>;
  wallet_details?: Partial<WalletDetails>;
  emi_details?: Partial<EmiDetails>;
  pay_later_details?: Partial<PayLaterDetails>;
  
  // Customer information
  customer_email: string;
  customer_phone: string | null;
  
  // Metadata
  save_payment_method: boolean;
  notes: Record<string, any> | null;
}

/**
 * Payment response from gateway
 */
export interface PaymentResponse {
  success: boolean;
  payment_id: string | null;
  order_id: string;
  status: PaymentStatus;
  next_action: any | null;
  error_code: string | null;
  error_message: string | null;
  gateway_response: Record<string, any> | null;
}

/**
 * Refund request
 */
export interface RefundRequest {
  payment_id: string;
  amount: number;
  reason: string;
  notes: Record<string, any> | null;
}

/**
 * Type guards for payment-related types
 */
export const isPayment = (item: any): item is Payment => {
  return item && typeof item.id === 'string' && typeof item.amount === 'number';
};

export const isRefund = (item: any): item is Refund => {
  return item && typeof item.id === 'string' && typeof item.amount === 'number';
};

export const isSavedPaymentMethod = (item: any): item is SavedPaymentMethod => {
  return item && typeof item.id === 'string' && typeof item.user_id === 'string';
};

export const isPaymentGateway = (item: any): item is PaymentGateway => {
  return item && typeof item.id === 'string' && typeof item.name === 'string';
};

/**
 * Utility types for payment management
 */
export type PaymentCreateInput = Omit<Payment,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'authorized_at'
  | 'captured_at'
  | 'failed_at'
  | 'order'
  | 'refunds'
  | 'payment_method_details'
  | 'gateway_responses'
>;

export type PaymentUpdateInput = Partial<Omit<Payment,
  | 'id'
  | 'order_id'
  | 'created_at'
  | 'order'
  | 'refunds'
  | 'payment_method_details'
  | 'gateway_responses'
>>;

export type RefundCreateInput = Omit<Refund,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'processed_at'
  | 'payment'
  | 'order'
>;

export type SavedPaymentMethodCreateInput = Omit<SavedPaymentMethod,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'last_used_at'
  | 'usage_count'
  | 'user'
>;

// Re-export related types that might be defined elsewhere
export type { Order } from './order';
export type { User } from './user';

export default {
  PaymentMethodType,
  PaymentStatus,
  Currency,
  CardType,
  CardNetwork,
  UpiApp,
  WalletType,
  BankCode,
  EmiProvider,
  PayLaterProvider,
  RefundStatus,
  isPayment,
  isRefund,
  isSavedPaymentMethod,
  isPaymentGateway
};