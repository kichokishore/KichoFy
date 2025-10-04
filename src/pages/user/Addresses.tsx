// src/pages/user/Addresses.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiPlus as Plus,
  FiEdit2 as Edit,
  FiTrash2 as Trash,
  FiMapPin as MapPin,
  FiCheck as Check
} from 'react-icons/fi';
import { useApp } from '../../contexts/AppContext';
import { useAddresses } from '../../hooks/useAddresses';
import { Address } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { Button } from '../../components/UI/Button';
import { LoadingSpinner } from '../../components/UI/LoadingSpinner';
import { Modal } from '../../components/UI/Modal';
import { AddressModal } from '../../components/profile/AddressModal';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export const Addresses: React.FC = () => {
  const { state } = useApp();
  const { t } = useTranslation();
  const {
    addresses,
    loading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    refreshAddresses
  } = useAddresses();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingAddress, setDeletingAddress] = useState<Address | null>(null);

  useEffect(() => {
    if (state.user) {
      refreshAddresses();
    }
  }, [state.user]);

  const handleAddAddress = async (addressData: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!state.user) return;

    const success = await addAddress({
      ...addressData,
      user_id: state.user.id
    });

    if (success) {
      setShowAddModal(false);
    }
  };

  const handleEditAddress = async (addressData: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!editingAddress) return;

    const success = await updateAddress(editingAddress.id, addressData);
    if (success) {
      setEditingAddress(null);
    }
  };

  const handleDeleteAddress = async () => {
    if (!deletingAddress) return;

    await deleteAddress(deletingAddress.id);
    setDeletingAddress(null);
  };

  const handleSetDefault = async (addressId: string) => {
    await setDefaultAddress(addressId);
  };

  if (!state.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('myAddresses')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {t('manageYourAddresses')}
              </p>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              variant="primary"
              className="flex items-center"
            >
              <Plus className="mr-2" size={18} />
              {t('addNewAddress')}
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg dark:bg-red-900 dark:text-red-100"
            >
              {error}
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          )}

          {/* Addresses Grid */}
          {!loading && addresses.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="text-center py-12"
            >
              <MapPin className="mx-auto text-gray-400" size={48} />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                {t('noAddresses')}
              </h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                {t('addYourFirstAddress')}
              </p>
              <Button
                onClick={() => setShowAddModal(true)}
                variant="primary"
                className="mt-4"
              >
                {t('addNewAddress')}
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.map((address) => (
                <motion.div
                  key={address.id}
                  variants={itemVariants}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 p-6 relative ${
                    address.is_default 
                      ? 'border-primary border-2' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {/* Default Badge */}
                  {address.is_default && (
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                        <Check className="mr-1" size={12} />
                        {t('default')}
                      </span>
                    </div>
                  )}

                  {/* Address Content */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {address.line1}
                      </h3>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                      {address.line2 && (
                        <p>{address.line2}</p>
                      )}
                      <p>
                        {address.city}, {address.state} {address.postal_code}
                      </p>
                      <p>{address.country}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex space-x-3">
                        {!address.is_default && (
                          <button
                            onClick={() => handleSetDefault(address.id)}
                            className="text-sm text-primary hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                          >
                            {t('setAsDefault')}
                          </button>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingAddress(address)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          title={t('edit')}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setDeletingAddress(address)}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title={t('remove')}
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={t('addNewAddress')}
      >
        <AddressModal
          onSubmit={handleAddAddress}
          onCancel={() => setShowAddModal(false)}
          isLoading={loading}
        />
      </Modal>

      {/* Edit Address Modal */}
      <Modal
        isOpen={!!editingAddress}
        onClose={() => setEditingAddress(null)}
        title={t('editAddress')}
      >
        {editingAddress && (
          <AddressModal
            address={editingAddress}
            onSubmit={handleEditAddress}
            onCancel={() => setEditingAddress(null)}
            isLoading={loading}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingAddress}
        onClose={() => setDeletingAddress(null)}
        title={t('deleteAddress')}
        size="sm"
      >
        <div className="text-center">
          <Trash className="mx-auto text-red-500" size={48} />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            {t('confirmDeleteAddress')}
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {t('deleteAddressConfirmation')}
          </p>
          
          {deletingAddress && (
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {deletingAddress.line1}
              </p>
              {deletingAddress.line2 && (
                <p className="text-sm text-gray-600 dark:text-gray-300">{deletingAddress.line2}</p>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {deletingAddress.city}, {deletingAddress.state} {deletingAddress.postal_code}
              </p>
            </div>
          )}

          <div className="mt-6 flex justify-center space-x-3">
            <Button
              onClick={() => setDeletingAddress(null)}
              variant="secondary"
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleDeleteAddress}
              variant="danger"
            >
              {t('delete')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Addresses;