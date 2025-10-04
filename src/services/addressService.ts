// src/services/addressService.ts
import { supabase } from './supabaseService';
import { Address, ApiResponse, PaginatedResponse } from '../types';
import { TABLE_NAMES, ERROR_MESSAGES } from '../utils/constants';

export class AddressService {
  private tableName = TABLE_NAMES.ADDRESSES;

  /**
   * Get all addresses for a user
   */
  async getUserAddresses(userId: string): Promise<ApiResponse<Address[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user addresses:', error);
        return {
          data: [],
          success: false,
          error: error.message,
          message: ERROR_MESSAGES.FETCH_FAILED
        };
      }

      return {
        data: data as Address[],
        success: true,
        message: 'Addresses fetched successfully'
      };
    } catch (error) {
      console.error('Error in getUserAddresses:', error);
      return {
        data: [],
        success: false,
        error: ERROR_MESSAGES.SERVER_ERROR,
        message: ERROR_MESSAGES.SERVER_ERROR
      };
    }
  }

  /**
   * Get a specific address by ID
   */
  async getAddressById(addressId: string): Promise<ApiResponse<Address>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', addressId)
        .single();

      if (error) {
        console.error('Error fetching address:', error);
        return {
          data: null,
          success: false,
          error: error.message,
          message: ERROR_MESSAGES.NOT_FOUND
        };
      }

      return {
        data: data as Address,
        success: true,
        message: 'Address fetched successfully'
      };
    } catch (error) {
      console.error('Error in getAddressById:', error);
      return {
        data: null,
        success: false,
        error: ERROR_MESSAGES.SERVER_ERROR,
        message: ERROR_MESSAGES.SERVER_ERROR
      };
    }
  }

  /**
   * Create a new address
   */
  async createAddress(addressData: Omit<Address, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Address>> {
    try {
      // If this address is set as default, remove default from other addresses
      if (addressData.is_default) {
        await this.removeDefaultAddress(addressData.user_id);
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .insert([{
          ...addressData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating address:', error);
        return {
          data: null,
          success: false,
          error: error.message,
          message: ERROR_MESSAGES.CREATE_FAILED
        };
      }

      return {
        data: data as Address,
        success: true,
        message: 'Address created successfully'
      };
    } catch (error) {
      console.error('Error in createAddress:', error);
      return {
        data: null,
        success: false,
        error: ERROR_MESSAGES.SERVER_ERROR,
        message: ERROR_MESSAGES.SERVER_ERROR
      };
    }
  }

  /**
   * Update an existing address
   */
  async updateAddress(addressId: string, updates: Partial<Address>): Promise<ApiResponse<Address>> {
    try {
      // If updating to default, remove default from other addresses
      if (updates.is_default) {
        const address = await this.getAddressById(addressId);
        if (address.data) {
          await this.removeDefaultAddress(address.data.user_id);
        }
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', addressId)
        .select()
        .single();

      if (error) {
        console.error('Error updating address:', error);
        return {
          data: null,
          success: false,
          error: error.message,
          message: ERROR_MESSAGES.UPDATE_FAILED
        };
      }

      return {
        data: data as Address,
        success: true,
        message: 'Address updated successfully'
      };
    } catch (error) {
      console.error('Error in updateAddress:', error);
      return {
        data: null,
        success: false,
        error: ERROR_MESSAGES.SERVER_ERROR,
        message: ERROR_MESSAGES.SERVER_ERROR
      };
    }
  }

  /**
   * Delete an address
   */
  async deleteAddress(addressId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', addressId);

      if (error) {
        console.error('Error deleting address:', error);
        return {
          data: false,
          success: false,
          error: error.message,
          message: ERROR_MESSAGES.DELETE_FAILED
        };
      }

      return {
        data: true,
        success: true,
        message: 'Address deleted successfully'
      };
    } catch (error) {
      console.error('Error in deleteAddress:', error);
      return {
        data: false,
        success: false,
        error: ERROR_MESSAGES.SERVER_ERROR,
        message: ERROR_MESSAGES.SERVER_ERROR
      };
    }
  }

  /**
   * Set an address as default
   */
  async setDefaultAddress(addressId: string, userId: string): Promise<ApiResponse<Address>> {
    try {
      // First remove default from all other addresses
      await this.removeDefaultAddress(userId);

      // Then set this address as default
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          is_default: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', addressId)
        .select()
        .single();

      if (error) {
        console.error('Error setting default address:', error);
        return {
          data: null,
          success: false,
          error: error.message,
          message: ERROR_MESSAGES.UPDATE_FAILED
        };
      }

      return {
        data: data as Address,
        success: true,
        message: 'Default address set successfully'
      };
    } catch (error) {
      console.error('Error in setDefaultAddress:', error);
      return {
        data: null,
        success: false,
        error: ERROR_MESSAGES.SERVER_ERROR,
        message: ERROR_MESSAGES.SERVER_ERROR
      };
    }
  }

  /**
   * Get user's default address
   */
  async getDefaultAddress(userId: string): Promise<ApiResponse<Address | null>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('is_default', true)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching default address:', error);
        return {
          data: null,
          success: false,
          error: error.message,
          message: ERROR_MESSAGES.FETCH_FAILED
        };
      }

      return {
        data: data as Address | null,
        success: true,
        message: data ? 'Default address fetched successfully' : 'No default address found'
      };
    } catch (error) {
      console.error('Error in getDefaultAddress:', error);
      return {
        data: null,
        success: false,
        error: ERROR_MESSAGES.SERVER_ERROR,
        message: ERROR_MESSAGES.SERVER_ERROR
      };
    }
  }

  /**
   * Validate address data
   */
  validateAddress(addressData: Partial<Address>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!addressData.line1?.trim()) {
      errors.push('Address line 1 is required');
    }

    if (!addressData.city?.trim()) {
      errors.push('City is required');
    }

    if (!addressData.state?.trim()) {
      errors.push('State is required');
    }

    if (!addressData.country?.trim()) {
      errors.push('Country is required');
    }

    if (!addressData.postal_code?.trim()) {
      errors.push('Postal code is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format address for display
   */
  formatAddress(address: Address): string {
    const parts = [
      address.line1,
      address.line2,
      address.city,
      address.state,
      address.postal_code,
      address.country
    ].filter(part => part && part.trim());

    return parts.join(', ');
  }

  /**
   * Private method to remove default status from all addresses of a user
   */
  private async removeDefaultAddress(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update({
          is_default: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_default', true);

      if (error) {
        console.error('Error removing default addresses:', error);
      }
    } catch (error) {
      console.error('Error in removeDefaultAddress:', error);
    }
  }
}

// Export service instance
export const addressService = new AddressService();

export default addressService;