// src/components/checkout/AddressForm.tsx
import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Check, Edit2 } from 'lucide-react';
import { Address, ShippingAddress } from '../../types';
import { addressService } from '../../services/addressService';
import { useApp } from '../../contexts/AppContext';

interface AddressFormProps {
  onAddressSelect: (address: ShippingAddress) => void;
  selectedAddress?: ShippingAddress;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  onAddressSelect,
  selectedAddress
}) => {
  const { state } = useApp();
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    country: 'India',
    postal_code: '',
    is_default: false
  });

  // Load saved addresses
  useEffect(() => {
    if (state.user) {
      loadSavedAddresses();
    }
  }, [state.user]);

  const loadSavedAddresses = async () => {
    if (!state.user) return;

    setLoading(true);
    try {
      const response = await addressService.getUserAddresses(state.user.id);
      if (response.success) {
        setSavedAddresses(response.data);
        
        // Auto-select default address if available
        const defaultAddress = response.data.find(addr => addr.is_default);
        if (defaultAddress && !selectedAddress) {
          handleAddressSelect(defaultAddress);
        }
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelect = (address: Address) => {
    const shippingAddress: ShippingAddress = {
      name: state.user?.name || '',
      street: address.line1,
      city: address.city,
      state: address.state,
      country: address.country,
      postal_code: address.postal_code,
      phone: state.user?.mobile_number || ''
    };
    onAddressSelect(shippingAddress);
    setShowAddressForm(false);
    setEditingAddress(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.user) return;

    const validation = addressService.validateAddress(formData);
    if (!validation.isValid) {
      alert(validation.errors.join('\n'));
      return;
    }

    setLoading(true);
    try {
      let response;
      
      if (editingAddress) {
        response = await addressService.updateAddress(editingAddress.id, formData);
      } else {
        response = await addressService.createAddress({
          ...formData,
          user_id: state.user.id
        });
      }

      if (response.success) {
        await loadSavedAddresses();
        if (response.data) {
          handleAddressSelect(response.data);
        }
        resetForm();
      } else {
        alert(response.message || 'Failed to save address');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      line1: '',
      line2: '',
      city: '',
      state: '',
      country: 'India',
      postal_code: '',
      is_default: false
    });
    setEditingAddress(null);
    setShowAddressForm(false);
  };

  const handleEditAddress = (address: Address) => {
    setFormData({
      line1: address.line1,
      line2: address.line2 || '',
      city: address.city,
      state: address.state,
      country: address.country,
      postal_code: address.postal_code,
      is_default: address.is_default
    });
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const response = await addressService.deleteAddress(addressId);
      if (response.success) {
        await loadSavedAddresses();
      } else {
        alert(response.message || 'Failed to delete address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address. Please try again.');
    }
  };

  const isAddressSelected = (address: Address) => {
    if (!selectedAddress) return false;
    return (
      selectedAddress.street === address.line1 &&
      selectedAddress.city === address.city &&
      selectedAddress.postal_code === address.postal_code
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Delivery Address
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Choose a saved address or add a new one
        </p>
      </div>

      <div className="p-6">
        {/* Saved Addresses */}
        {!showAddressForm && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Loading addresses...</p>
              </div>
            ) : savedAddresses.length > 0 ? (
              <div className="space-y-3">
                {savedAddresses.map((address) => (
                  <div
                    key={address.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      isAddressSelected(address)
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => handleAddressSelect(address)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {addressService.formatAddress(address)}
                          </span>
                          {address.is_default && (
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>{address.city}, {address.state}</span>
                          <span>{address.postal_code}</span>
                          <span>{address.country}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAddress(address);
                          }}
                          className="p-1 text-gray-400 hover:text-primary transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        {!address.is_default && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAddress(address.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                    {isAddressSelected(address) && (
                      <div className="flex items-center space-x-1 mt-2 text-primary text-sm">
                        <Check size={16} />
                        <span>Selected</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No saved addresses found
                </p>
              </div>
            )}

            {/* Add New Address Button */}
            <button
              onClick={() => setShowAddressForm(true)}
              className="w-full flex items-center justify-center space-x-2 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-gray-600 dark:text-gray-400 hover:text-primary"
            >
              <Plus size={20} />
              <span className="font-medium">Add New Address</span>
            </button>
          </div>
        )}

        {/* Address Form */}
        {showAddressForm && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  name="line1"
                  value={formData.line1}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="House/Flat No, Building, Street"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address Line 2
                </label>
                <input
                  type="text"
                  name="line2"
                  value={formData.line2}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Area, Landmark (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="State"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Postal Code *
                </label>
                <input
                  type="text"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="PIN Code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Country *
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="is_default"
                checked={formData.is_default}
                onChange={handleInputChange}
                className="text-primary focus:ring-primary"
                id="default-address"
              />
              <label htmlFor="default-address" className="text-sm text-gray-700 dark:text-gray-300">
                Set as default address
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex items-center space-x-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary text-white py-2.5 px-4 rounded-lg font-medium hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </div>
                ) : editingAddress ? (
                  'Update Address'
                ) : (
                  'Save Address'
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddressForm;