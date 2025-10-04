// src/utils/validators.ts

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Common validation patterns
 */
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[6-9]\d{9}$/,
  PINCODE: /^\d{6}$/,
  NAME: /^[a-zA-Z\s]{2,50}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,30}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  URL: /^https?:\/\/.+\..+$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  DECIMAL: /^\d+(\.\d{1,2})?$/,
  INTEGER: /^\d+$/,
  COLOR_HEX: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
} as const;

/**
 * Validate email address
 */
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];

  if (!email.trim()) {
    errors.push('Email is required');
  } else if (!PATTERNS.EMAIL.test(email)) {
    errors.push('Please enter a valid email address');
  } else if (email.length > 255) {
    errors.push('Email must be less than 255 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate phone number (Indian format)
 */
export const validatePhone = (phone: string): ValidationResult => {
  const errors: string[] = [];
  const cleaned = phone.replace(/\D/g, '');

  if (!cleaned) {
    errors.push('Phone number is required');
  } else if (!PATTERNS.PHONE.test(cleaned)) {
    errors.push('Please enter a valid 10-digit Indian phone number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate name
 */
export const validateName = (name: string, fieldName: string = 'Name'): ValidationResult => {
  const errors: string[] = [];

  if (!name.trim()) {
    errors.push(`${fieldName} is required`);
  } else if (name.trim().length < 2) {
    errors.push(`${fieldName} must be at least 2 characters long`);
  } else if (name.trim().length > 50) {
    errors.push(`${fieldName} must be less than 50 characters`);
  } else if (!PATTERNS.NAME.test(name.trim())) {
    errors.push(`${fieldName} can only contain letters and spaces`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate password
 */
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];

  if (!password) {
    errors.push('Password is required');
  } else if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  } else if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  } else if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate confirm password
 */
export const validateConfirmPassword = (password: string, confirmPassword: string): ValidationResult => {
  const errors: string[] = [];

  if (!confirmPassword) {
    errors.push('Please confirm your password');
  } else if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate address
 */
export const validateAddress = (address: {
  line1: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}): ValidationResult => {
  const errors: string[] = [];

  if (!address.line1?.trim()) {
    errors.push('Address line 1 is required');
  } else if (address.line1.trim().length < 5) {
    errors.push('Address line 1 must be at least 5 characters long');
  }

  if (!address.city?.trim()) {
    errors.push('City is required');
  } else if (address.city.trim().length < 2) {
    errors.push('City must be at least 2 characters long');
  }

  if (!address.state?.trim()) {
    errors.push('State is required');
  } else if (address.state.trim().length < 2) {
    errors.push('State must be at least 2 characters long');
  }

  if (!address.country?.trim()) {
    errors.push('Country is required');
  }

  if (!address.postal_code?.trim()) {
    errors.push('Postal code is required');
  } else if (!PATTERNS.PINCODE.test(address.postal_code.replace(/\s/g, ''))) {
    errors.push('Please enter a valid 6-digit postal code');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate product data
 */
export const validateProduct = (product: {
  name: string;
  price: number;
  stock: number;
  category_id?: string;
}): ValidationResult => {
  const errors: string[] = [];

  if (!product.name?.trim()) {
    errors.push('Product name is required');
  } else if (product.name.trim().length < 2) {
    errors.push('Product name must be at least 2 characters long');
  } else if (product.name.trim().length > 255) {
    errors.push('Product name must be less than 255 characters');
  }

  if (product.price == null || product.price === undefined) {
    errors.push('Price is required');
  } else if (product.price < 0) {
    errors.push('Price cannot be negative');
  } else if (product.price > 1000000) {
    errors.push('Price cannot exceed ₹10,00,000');
  } else if (!PATTERNS.DECIMAL.test(product.price.toString())) {
    errors.push('Price must be a valid number with up to 2 decimal places');
  }

  if (product.stock == null || product.stock === undefined) {
    errors.push('Stock quantity is required');
  } else if (product.stock < 0) {
    errors.push('Stock quantity cannot be negative');
  } else if (product.stock > 100000) {
    errors.push('Stock quantity cannot exceed 100,000');
  } else if (!PATTERNS.INTEGER.test(product.stock.toString())) {
    errors.push('Stock quantity must be a whole number');
  }

  if (!product.category_id) {
    errors.push('Category is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate order data
 */
export const validateOrder = (order: {
  shipping_address: any;
  total_amount: number;
}): ValidationResult => {
  const errors: string[] = [];

  if (!order.shipping_address) {
    errors.push('Shipping address is required');
  } else {
    const addressValidation = validateAddress(order.shipping_address);
    if (!addressValidation.isValid) {
      errors.push(...addressValidation.errors);
    }
  }

  if (order.total_amount == null || order.total_amount === undefined) {
    errors.push('Total amount is required');
  } else if (order.total_amount <= 0) {
    errors.push('Total amount must be greater than 0');
  } else if (order.total_amount > 1000000) {
    errors.push('Total amount cannot exceed ₹10,00,000');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate coupon data
 */
export const validateCoupon = (coupon: {
  code: string;
  discount_value: number;
  discount_type: string;
  min_order_amount: number;
  valid_from: string;
  valid_until: string;
}): ValidationResult => {
  const errors: string[] = [];

  if (!coupon.code?.trim()) {
    errors.push('Coupon code is required');
  } else if (coupon.code.trim().length < 3) {
    errors.push('Coupon code must be at least 3 characters long');
  } else if (coupon.code.trim().length > 20) {
    errors.push('Coupon code must be less than 20 characters');
  } else if (!PATTERNS.ALPHANUMERIC.test(coupon.code.replace(/-/g, ''))) {
    errors.push('Coupon code can only contain letters, numbers, and hyphens');
  }

  if (coupon.discount_value == null || coupon.discount_value === undefined) {
    errors.push('Discount value is required');
  } else if (coupon.discount_value <= 0) {
    errors.push('Discount value must be greater than 0');
  }

  if (coupon.discount_type !== 'percentage' && coupon.discount_type !== 'fixed') {
    errors.push('Discount type must be either "percentage" or "fixed"');
  } else if (coupon.discount_type === 'percentage' && coupon.discount_value > 100) {
    errors.push('Percentage discount cannot exceed 100%');
  }

  if (coupon.min_order_amount < 0) {
    errors.push('Minimum order amount cannot be negative');
  }

  const now = new Date();
  const validFrom = new Date(coupon.valid_from);
  const validUntil = new Date(coupon.valid_until);

  if (validUntil <= validFrom) {
    errors.push('Valid until date must be after valid from date');
  }

  if (validUntil <= now) {
    errors.push('Valid until date must be in the future');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate file upload
 */
export const validateFile = (
  file: File, 
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    maxFiles?: number;
  } = {}
): ValidationResult => {
  const errors: string[] = [];
  const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/webp'], maxFiles = 1 } = options;

  if (!file) {
    errors.push('File is required');
    return { isValid: false, errors };
  }

  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    errors.push(`File size must be less than ${maxSizeMB}MB`);
  }

  if (!allowedTypes.includes(file.type)) {
    const allowedExtensions = allowedTypes.map(type => type.split('/')[1]).join(', ');
    errors.push(`File type must be one of: ${allowedExtensions}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate numeric range
 */
export const validateNumberRange = (
  value: number, 
  min: number, 
  max: number, 
  fieldName: string = 'Value'
): ValidationResult => {
  const errors: string[] = [];

  if (value == null || value === undefined) {
    errors.push(`${fieldName} is required`);
  } else if (value < min) {
    errors.push(`${fieldName} must be at least ${min}`);
  } else if (value > max) {
    errors.push(`${fieldName} cannot exceed ${max}`);
  } else if (!PATTERNS.DECIMAL.test(value.toString())) {
    errors.push(`${fieldName} must be a valid number`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate required field
 */
export const validateRequired = (value: any, fieldName: string): ValidationResult => {
  const errors: string[] = [];

  if (value === null || value === undefined || value === '') {
    errors.push(`${fieldName} is required`);
  } else if (typeof value === 'string' && !value.trim()) {
    errors.push(`${fieldName} is required`);
  } else if (Array.isArray(value) && value.length === 0) {
    errors.push(`${fieldName} is required`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate array length
 */
export const validateArrayLength = (
  array: any[], 
  min: number, 
  max: number, 
  fieldName: string = 'Array'
): ValidationResult => {
  const errors: string[] = [];

  if (!array || !Array.isArray(array)) {
    errors.push(`${fieldName} must be an array`);
  } else if (array.length < min) {
    errors.push(`${fieldName} must have at least ${min} item${min !== 1 ? 's' : ''}`);
  } else if (array.length > max) {
    errors.push(`${fieldName} cannot have more than ${max} item${max !== 1 ? 's' : ''}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate URL
 */
export const validateUrl = (url: string, fieldName: string = 'URL'): ValidationResult => {
  const errors: string[] = [];

  if (!url.trim()) {
    errors.push(`${fieldName} is required`);
  } else if (!PATTERNS.URL.test(url)) {
    errors.push(`Please enter a valid ${fieldName.toLowerCase()}`);
  } else if (url.length > 2048) {
    errors.push(`${fieldName} must be less than 2048 characters`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate date range
 */
export const validateDateRange = (
  startDate: string, 
  endDate: string, 
  fieldNames: { start: string; end: string } = { start: 'Start date', end: 'End date' }
): ValidationResult => {
  const errors: string[] = [];

  if (!startDate) {
    errors.push(`${fieldNames.start} is required`);
  }

  if (!endDate) {
    errors.push(`${fieldNames.end} is required`);
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start > end) {
      errors.push(`${fieldNames.end} must be after ${fieldNames.start}`);
    }

    if (end < now) {
      errors.push(`${fieldNames.end} must be in the future`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate credit card number (basic Luhn algorithm)
 */
export const validateCreditCard = (cardNumber: string): ValidationResult => {
  const errors: string[] = [];
  const cleaned = cardNumber.replace(/\s/g, '');

  if (!cleaned) {
    errors.push('Card number is required');
  } else if (!PATTERNS.INTEGER.test(cleaned)) {
    errors.push('Card number must contain only numbers');
  } else if (cleaned.length < 13 || cleaned.length > 19) {
    errors.push('Card number must be between 13 and 19 digits');
  } else {
    // Luhn algorithm validation
    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    if (sum % 10 !== 0) {
      errors.push('Invalid card number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate CVV
 */
export const validateCVV = (cvv: string): ValidationResult => {
  const errors: string[] = [];

  if (!cvv) {
    errors.push('CVV is required');
  } else if (!PATTERNS.INTEGER.test(cvv)) {
    errors.push('CVV must contain only numbers');
  } else if (cvv.length < 3 || cvv.length > 4) {
    errors.push('CVV must be 3 or 4 digits');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate expiration date
 */
export const validateExpiryDate = (expiry: string): ValidationResult => {
  const errors: string[] = [];

  if (!expiry) {
    errors.push('Expiry date is required');
  } else if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    errors.push('Expiry date must be in MM/YY format');
  } else {
    const [month, year] = expiry.split('/').map(Number);
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;

    if (month < 1 || month > 12) {
      errors.push('Invalid month');
    }

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      errors.push('Card has expired');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Compose multiple validators
 */
export const composeValidators = (...validators: Array<(value: any) => ValidationResult>) => {
  return (value: any): ValidationResult => {
    const errors: string[] = [];

    for (const validator of validators) {
      const result = validator(value);
      if (!result.isValid) {
        errors.push(...result.errors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };
};

export default {
  PATTERNS,
  validateEmail,
  validatePhone,
  validateName,
  validatePassword,
  validateConfirmPassword,
  validateAddress,
  validateProduct,
  validateOrder,
  validateCoupon,
  validateFile,
  validateNumberRange,
  validateRequired,
  validateArrayLength,
  validateUrl,
  validateDateRange,
  validateCreditCard,
  validateCVV,
  validateExpiryDate,
  composeValidators
};