import React from 'react';
import { ShippingFormData } from './types';

interface ShippingFormProps {
  formData: ShippingFormData;
  onChange: (field: keyof ShippingFormData, value: string) => void;
  user: any;
}

export const ShippingForm: React.FC<ShippingFormProps> = ({ 
  formData, 
  onChange, 
  user 
}) => {
  const handleInputChange = (field: keyof ShippingFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = e.target.value;
    
    // Format specific fields
    if (field === 'phone') {
      value = value.replace(/\D/g, '').slice(0, 10);
    } else if (field === 'pincode') {
      value = value.replace(/\D/g, '').slice(0, 6);
    }
    
    onChange(field, value);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          Shipping Information
        </h2>
        {user && (
          <span className="text-xs sm:text-sm text-green-600 bg-green-50 dark:bg-green-900/20 px-2 sm:px-3 py-1 rounded-full">
            Logged in as {user.name}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={handleInputChange('name')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm sm:text-base"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
            Email *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={handleInputChange('email')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm sm:text-base"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={handleInputChange('phone')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm sm:text-base"
            placeholder="9876543210"
            maxLength={10}
            pattern="[6-9]\d{9}"
          />
          <p className="text-xs text-gray-500 mt-1">10-digit mobile number</p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
            Address *
          </label>
          <input
            type="text"
            required
            value={formData.address}
            onChange={handleInputChange('address')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm sm:text-base"
            placeholder="Street address, apartment, suite, etc."
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
            City *
          </label>
          <input
            type="text"
            required
            value={formData.city}
            onChange={handleInputChange('city')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm sm:text-base"
            placeholder="Your city"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
            State *
          </label>
          <input
            type="text"
            required
            value={formData.state}
            onChange={handleInputChange('state')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm sm:text-base"
            placeholder="Your state"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
            PIN Code *
          </label>
          <input
            type="text"
            required
            value={formData.pincode}
            onChange={handleInputChange('pincode')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm sm:text-base"
            placeholder="6-digit PIN code"
            maxLength={6}
            pattern="\d{6}"
          />
          <p className="text-xs text-gray-500 mt-1">6-digit PIN code</p>
        </div>
      </div>
    </div>
  );
};