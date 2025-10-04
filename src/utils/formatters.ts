// src/utils/formatters.ts

/**
 * Format currency for Indian Rupees
 */
export const formatCurrency = (amount: number, includeSymbol: boolean = true): string => {
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  
  return includeSymbol ? `₹${formatted}` : formatted;
};

/**
 * Format date to readable string
 */
export const formatDate = (dateString: string | Date, options: Intl.DateTimeFormatOptions = {}): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  return date.toLocaleDateString('en-IN', { ...defaultOptions, ...options });
};

/**
 * Format date with time
 */
export const formatDateTime = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Format relative time (e.g., "2 hours ago", "3 days ago")
 */
export const formatRelativeTime = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  } else if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks !== 1 ? 's' : ''} ago`;
  } else if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
  } else {
    return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
  }
};

/**
 * Format file size to human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if it's an Indian phone number
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  
  // Return original if format doesn't match
  return phoneNumber;
};

/**
 * Format product rating with stars
 */
export const formatRating = (rating: number | null): string => {
  if (rating === null || rating === undefined) return 'No ratings';
  
  return `${rating.toFixed(1)}/5.0`;
};

/**
 * Format order ID for display
 */
export const formatOrderId = (orderId: string, length: number = 8): string => {
  if (orderId.length <= length) return orderId.toUpperCase();
  
  return `#${orderId.slice(-length).toUpperCase()}`;
};

/**
 * Format address for display
 */
export const formatAddress = (address: {
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}): string => {
  const parts = [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.postal_code,
    address.country
  ].filter(part => part && part.trim());
  
  return parts.join(', ');
};

/**
 * Format product name with ellipsis for limited space
 */
export const formatProductName = (name: string, maxLength: number = 50): string => {
  if (name.length <= maxLength) return name;
  
  return name.slice(0, maxLength).trim() + '...';
};

/**
 * Format discount percentage or amount
 */
export const formatDiscount = (discountType: 'percentage' | 'fixed', value: number, maxDiscount?: number): string => {
  if (discountType === 'percentage') {
    return maxDiscount 
      ? `${value}% off (up to ₹${formatCurrency(maxDiscount, false)})`
      : `${value}% off`;
  } else {
    return `₹${formatCurrency(value, false)} off`;
  }
};

/**
 * Format order status for display
 */
export const formatOrderStatus = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'pending': 'Pending',
    'confirmed': 'Confirmed',
    'processing': 'Processing',
    'shipped': 'Shipped',
    'delivered': 'Delivered',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'payment_review': 'Payment Review',
    'refunded': 'Refunded'
  };
  
  return statusMap[status] || status;
};

/**
 * Format payment status for display
 */
export const formatPaymentStatus = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'pending': 'Pending',
    'paid': 'Paid',
    'failed': 'Failed',
    'refunded': 'Refunded',
    'pending_verification': 'Pending Verification',
    'partially_paid': 'Partially Paid'
  };
  
  return statusMap[status] || status;
};

/**
 * Format number with commas (Indian numbering system)
 */
export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat('en-IN').format(number);
};

/**
 * Format estimated delivery date
 */
export const formatDeliveryDate = (days: number): string => {
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + days);
  
  return formatDate(deliveryDate);
};

/**
 * Format time remaining for order cancellation
 */
export const formatTimeRemaining = (endTime: string | Date): string => {
  const end = typeof endTime === 'string' ? new Date(endTime) : endTime;
  const now = new Date();
  const diffInMs = end.getTime() - now.getTime();
  
  if (diffInMs <= 0) return 'Expired';
  
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const remainingMinutes = diffInMinutes % 60;
  
  if (diffInHours > 0) {
    return `${diffInHours}h ${remainingMinutes}m`;
  } else {
    return `${diffInMinutes}m`;
  }
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

/**
 * Capitalize first letter of each word
 */
export const capitalizeWords = (text: string): string => {
  return text.replace(/\b\w/g, char => char.toUpperCase());
};

/**
 * Format social media numbers (e.g., 1.2K, 3.5M)
 */
export const formatSocialNumber = (number: number): string => {
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + 'M';
  } else if (number >= 1000) {
    return (number / 1000).toFixed(1) + 'K';
  }
  return number.toString();
};

export default {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatFileSize,
  formatPhoneNumber,
  formatRating,
  formatOrderId,
  formatAddress,
  formatProductName,
  formatDiscount,
  formatOrderStatus,
  formatPaymentStatus,
  formatNumber,
  formatDeliveryDate,
  formatTimeRemaining,
  truncateText,
  capitalizeWords,
  formatSocialNumber
};