// src/components/checkout/index.ts
// Re-export all components from this directory
export { Checkout } from './Checkout';
export { ShippingForm } from './ShippingForm';
export { PaymentMethod } from './PaymentMethod';
export { OrderSummary } from './OrderSummary';
export { UPIPayment } from './UPIPayment';
export { ProgressSteps } from './ProgressSteps';
export { AddressForm } from './AddressForm';
export { CouponSection } from './CouponSection';

// Export types too if you have them
export type { ShippingFormData, CartItem, OrderData } from './types';