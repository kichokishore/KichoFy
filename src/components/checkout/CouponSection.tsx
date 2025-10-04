// src/components/checkout/CouponSection.tsx
import React, { useState, useEffect } from 'react';
import { Tag, Check, X, AlertCircle, Gift } from 'lucide-react';
import { Coupon } from '../../types';
import { supabase } from '../../utils/supabaseClient';
import { useApp } from '../../contexts/AppContext';

interface CouponSectionProps {
  subtotal: number;
  onCouponApplied: (coupon: Coupon | null, discountAmount: number) => void;
  appliedCoupon?: Coupon | null;
}

export const CouponSection: React.FC<CouponSectionProps> = ({
  subtotal,
  onCouponApplied,
  appliedCoupon
}) => {
  const { state } = useApp();
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);

  // Load available coupons
  useEffect(() => {
    loadAvailableCoupons();
  }, []);

  const loadAvailableCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .gte('valid_until', new Date().toISOString())
        .lte('valid_from', new Date().toISOString())
        .order('discount_value', { ascending: false });

      if (!error && data) {
        setAvailableCoupons(data as Coupon[]);
      }
    } catch (error) {
      console.error('Error loading coupons:', error);
    }
  };

  const validateCoupon = (coupon: Coupon): { isValid: boolean; message: string } => {
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = new Date(coupon.valid_until);

    // Check validity period
    if (now < validFrom) {
      return { isValid: false, message: 'This coupon is not yet valid' };
    }

    if (now > validUntil) {
      return { isValid: false, message: 'This coupon has expired' };
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return { isValid: false, message: 'This coupon has reached its usage limit' };
    }

    // Check minimum order amount
    if (subtotal < coupon.min_order_amount) {
      return { 
        isValid: false, 
        message: `Minimum order amount of ₹${coupon.min_order_amount} required` 
      };
    }

    return { isValid: true, message: 'Coupon is valid' };
  };

  const calculateDiscount = (coupon: Coupon): number => {
    if (coupon.discount_type === 'percentage') {
      const discount = (subtotal * coupon.discount_value) / 100;
      return coupon.max_discount ? Math.min(discount, coupon.max_discount) : discount;
    } else {
      // Fixed discount
      return Math.min(coupon.discount_value, subtotal);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Find coupon by code
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        setError('Invalid coupon code');
        setLoading(false);
        return;
      }

      const coupon = data as Coupon;

      // Validate coupon
      const validation = validateCoupon(coupon);
      if (!validation.isValid) {
        setError(validation.message);
        setLoading(false);
        return;
      }

      // Check if user has already used this coupon
      if (state.user) {
        const { data: usageData } = await supabase
          .from('coupon_usage')
          .select('id')
          .eq('coupon_id', coupon.id)
          .eq('user_id', state.user.id)
          .single();

        if (usageData) {
          setError('You have already used this coupon');
          setLoading(false);
          return;
        }
      }

      // Calculate discount amount
      const discountAmount = calculateDiscount(coupon);

      // Apply coupon
      onCouponApplied(coupon, discountAmount);
      setSuccess(`Coupon applied successfully! You saved ₹${discountAmount.toLocaleString()}`);
      setCouponCode('');

    } catch (error) {
      console.error('Error applying coupon:', error);
      setError('Failed to apply coupon. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = () => {
    onCouponApplied(null, 0);
    setSuccess('');
    setError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      applyCoupon();
    }
  };

  const formatDiscountText = (coupon: Coupon): string => {
    if (coupon.discount_type === 'percentage') {
      const maxDiscount = coupon.max_discount 
        ? ` (up to ₹${coupon.max_discount})`
        : '';
      return `${coupon.discount_value}% off${maxDiscount}`;
    } else {
      return `₹${coupon.discount_value} off`;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Tag className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Apply Coupon
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Enter your coupon code to get discounts
        </p>
      </div>

      <div className="p-6">
        {/* Applied Coupon Display */}
        {appliedCoupon && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-800 dark:text-green-200">
                  {appliedCoupon.code}
                </span>
                <span className="text-sm text-green-700 dark:text-green-300">
                  - {formatDiscountText(appliedCoupon)}
                </span>
              </div>
              <button
                onClick={removeCoupon}
                className="p-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center space-x-2 text-green-800 dark:text-green-200">
              <Check size={16} />
              <span className="text-sm">{success}</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center space-x-2 text-red-800 dark:text-red-200">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Coupon Input */}
        <div className="flex space-x-3">
          <div className="flex-1">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="Enter coupon code"
              disabled={loading || !!appliedCoupon}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <button
            onClick={applyCoupon}
            disabled={loading || !couponCode.trim() || !!appliedCoupon}
            className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Apply'
            )}
          </button>
        </div>

        {/* Available Coupons */}
        {availableCoupons.length > 0 && !appliedCoupon && (
          <div className="mt-6">
            <div className="flex items-center space-x-2 mb-3">
              <Gift className="w-4 h-4 text-gray-500" />
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Available Coupons
              </h4>
            </div>
            <div className="space-y-2">
              {availableCoupons.slice(0, 3).map((coupon) => (
                <div
                  key={coupon.id}
                  className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary transition-colors cursor-pointer"
                  onClick={() => {
                    setCouponCode(coupon.code);
                    // Auto-apply after a short delay for better UX
                    setTimeout(() => applyCoupon(), 100);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {coupon.code}
                        </span>
                        <span className="text-sm text-primary font-medium">
                          {formatDiscountText(coupon)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {coupon.min_order_amount > 0 && 
                          `Min. order: ₹${coupon.min_order_amount}`
                        }
                        {coupon.usage_limit && 
                          ` • ${coupon.usage_limit - (coupon.used_count || 0)} uses left`
                        }
                      </p>
                    </div>
                    <button className="text-primary hover:text-primary-light transition-colors text-sm font-medium">
                      Apply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coupon Terms */}
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          <p>• Coupons are subject to terms and conditions</p>
          <p>• Only one coupon can be applied per order</p>
          <p>• Coupon cannot be combined with other offers</p>
        </div>
      </div>
    </div>
  );
};

export default CouponSection;