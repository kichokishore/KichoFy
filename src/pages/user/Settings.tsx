// src/pages/user/Settings.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiSave as Save,
  FiBell as Bell,
  FiGlobe as Globe,
  FiMoon as Moon,
  FiSun as Sun,
  FiShield as Shield,
  FiCreditCard as CreditCard,
  FiUser as User,
  FiMail as Mail
} from 'react-icons/fi';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../../components/UI/Button';
import { LoadingSpinner } from '../../components/UI/LoadingSpinner';

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

export const Settings: React.FC = () => {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    orderUpdates: true,
    promotions: false,
    priceDrops: true,
    newArrivals: true,
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    showProfile: true,
    showOrders: false,
    showWishlist: true,
    dataSharing: false,
    personalizedAds: false,
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
    deviceManagement: true,
  });

  useEffect(() => {
    // Load saved settings from localStorage
    const loadSettings = () => {
      try {
        // Notification settings
        const savedNotifications = localStorage.getItem('kichofy_notification_settings');
        if (savedNotifications) {
          setNotificationSettings(JSON.parse(savedNotifications));
        }

        // Privacy settings
        const savedPrivacy = localStorage.getItem('kichofy_privacy_settings');
        if (savedPrivacy) {
          setPrivacySettings(JSON.parse(savedPrivacy));
        }

        // Security settings
        const savedSecurity = localStorage.getItem('kichofy_security_settings');
        if (savedSecurity) {
          setSecuritySettings(JSON.parse(savedSecurity));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Save to localStorage
      localStorage.setItem('kichofy_notification_settings', JSON.stringify(notificationSettings));
      localStorage.setItem('kichofy_privacy_settings', JSON.stringify(privacySettings));
      localStorage.setItem('kichofy_security_settings', JSON.stringify(securitySettings));

      setSuccess('Settings saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (key: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePrivacyChange = (key: keyof typeof privacySettings) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSecurityChange = (key: keyof typeof securitySettings) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleDarkMode = () => {
    dispatch({ type: 'TOGGLE_DARK_MODE' });
  };

  const resetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      setNotificationSettings({
        emailNotifications: true,
        pushNotifications: true,
        orderUpdates: true,
        promotions: false,
        priceDrops: true,
        newArrivals: true,
      });
      setPrivacySettings({
        showProfile: true,
        showOrders: false,
        showWishlist: true,
        dataSharing: false,
        personalizedAds: false,
      });
      setSecuritySettings({
        twoFactorAuth: false,
        loginAlerts: true,
        deviceManagement: true,
      });
      
      // Clear localStorage
      localStorage.removeItem('kichofy_notification_settings');
      localStorage.removeItem('kichofy_privacy_settings');
      localStorage.removeItem('kichofy_security_settings');
      
      setSuccess('Settings reset to default');
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  if (!state.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
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
                Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage your account preferences and settings
              </p>
            </div>
            <Button
              onClick={handleSaveSettings}
              variant="primary"
              disabled={loading}
              className="flex items-center"
            >
              {loading ? (
                <LoadingSpinner size="small" />
              ) : (
                <Save className="mr-2" size={18} />
              )}
              Save Changes
            </Button>
          </div>

          {/* Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg dark:bg-red-900 dark:text-red-100"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg dark:bg-green-900 dark:text-green-100"
            >
              {success}
            </motion.div>
          )}

          {/* App Settings */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Globe className="mr-3 text-primary" size={24} />
              App Settings
            </h2>

            <div className="space-y-6">
              {/* Dark Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Dark Mode</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Toggle dark mode appearance
                  </p>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    state.darkMode ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      state.darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                  {state.darkMode ? (
                    <Moon className="absolute left-1 text-white" size={12} />
                  ) : (
                    <Sun className="absolute right-1 text-gray-600" size={12} />
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Notification Settings */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Bell className="mr-3 text-primary" size={24} />
              Notifications
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive notifications via email
                  </p>
                </div>
                <button
                  onClick={() => handleNotificationChange('emailNotifications')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationSettings.emailNotifications ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Push Notifications</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive push notifications in your browser
                  </p>
                </div>
                <button
                  onClick={() => handleNotificationChange('pushNotifications')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationSettings.pushNotifications ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationSettings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Order Updates</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get updates about your orders
                  </p>
                </div>
                <button
                  onClick={() => handleNotificationChange('orderUpdates')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationSettings.orderUpdates ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationSettings.orderUpdates ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Promotions & Offers</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive promotional emails and offers
                  </p>
                </div>
                <button
                  onClick={() => handleNotificationChange('promotions')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationSettings.promotions ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationSettings.promotions ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Privacy Settings */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Shield className="mr-3 text-primary" size={24} />
              Privacy
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Show Public Profile</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Allow others to see your profile information
                  </p>
                </div>
                <button
                  onClick={() => handlePrivacyChange('showProfile')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    privacySettings.showProfile ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      privacySettings.showProfile ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Show Order History</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Make your order history visible to others
                  </p>
                </div>
                <button
                  onClick={() => handlePrivacyChange('showOrders')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    privacySettings.showOrders ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      privacySettings.showOrders ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Show Wishlist</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Allow others to see your wishlist
                  </p>
                </div>
                <button
                  onClick={() => handlePrivacyChange('showWishlist')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    privacySettings.showWishlist ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      privacySettings.showWishlist ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Security Settings */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <CreditCard className="mr-3 text-primary" size={24} />
              Security
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Login Alerts</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get notified of new sign-ins to your account
                  </p>
                </div>
                <button
                  onClick={() => handleSecurityChange('loginAlerts')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    securitySettings.loginAlerts ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      securitySettings.loginAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Device Management</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Manage and review your logged-in devices
                  </p>
                </div>
                <button
                  onClick={() => handleSecurityChange('deviceManagement')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    securitySettings.deviceManagement ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      securitySettings.deviceManagement ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Account Actions */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <User className="mr-3 text-primary" size={24} />
              Account Actions
            </h2>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Reset Settings</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Reset all settings to their default values
                  </p>
                </div>
                <Button
                  onClick={resetSettings}
                  variant="secondary"
                  className="text-red-600 border-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900"
                >
                  Reset to Default
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;