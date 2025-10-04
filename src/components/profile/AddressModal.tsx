// src/components/profile/AddressModal.tsx
import React, { useState, useEffect } from 'react';
import { Address } from '../../types';
import { Button } from '../UI/Button';
import { useTranslation } from '../../hooks/useTranslation';

interface AddressModalProps {
  address?: Address;
  onSubmit: (addressData: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const AddressModal: React.FC<AddressModalProps> = ({
  address,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    country: 'India',
    postal_code: '',
    is_default: false
  });

  useEffect(() => {
    if (address) {
      setFormData({
        line1: address.line1,
        line2: address.line2 || '',
        city: address.city,
        state: address.state,
        country: address.country,
        postal_code: address.postal_code,
        is_default: address.is_default
      });
    }
  }, [address]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isFormValid = formData.line1.trim() && 
                     formData.city.trim() && 
                     formData.state.trim() && 
                     formData.postal_code.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="line1" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('addressLine1')} *
        </label>
        <input
          type="text"
          id="line1"
          name="line1"
          value={formData.line1}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
          placeholder={t('streetAddress')}
        />
      </div>

      <div>
        <label htmlFor="line2" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('addressLine2')}
        </label>
        <input
          type="text"
          id="line2"
          name="line2"
          value={formData.line2}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
          placeholder={t('apartmentSuite')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('city')} *
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
            placeholder={t('city')}
          />
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('state')} *
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
            placeholder={t('state')}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('country')} *
          </label>
          <select
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
          >
            <option value="India">India</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Canada">Canada</option>
            <option value="Australia">Australia</option>
          </select>
        </div>

        <div>
          <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('pincode')} *
          </label>
          <input
            type="text"
            id="postal_code"
            name="postal_code"
            value={formData.postal_code}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
            placeholder={t('pincode')}
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_default"
          name="is_default"
          checked={formData.is_default}
          onChange={handleChange}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <label htmlFor="is_default" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          {t('setAsDefaultAddress')}
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          onClick={onCancel}
          variant="secondary"
        >
          {t('cancel')}
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? t('saving') : (address ? t('update') : t('save'))}
        </Button>
      </div>
    </form>
  );
};