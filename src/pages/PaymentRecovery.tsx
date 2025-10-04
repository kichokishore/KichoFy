// src/pages/PaymentRecovery.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { paymentRecoveryService } from '../utils/paymentRecoveryService';
import { ordersService } from '../utils/databaseService';
import { useApp } from '../contexts/AppContext';

export const PaymentRecovery: React.FC = () => {
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const navigate = useNavigate();
  const { dispatch } = useApp();

  const handleRecovery = async () => {
    if (!sessionId.trim()) return;
    
    setLoading(true);
    try {
      const pendingPayment = await paymentRecoveryService.getPendingPayment(sessionId);
      
      if (!pendingPayment) {
        setResult({ 
          success: false, 
          message: 'Payment session not found or expired. Please contact support.' 
        });
        return;
      }

      // Verify payment and create order
      const order = await paymentRecoveryService.verifyPaymentAndCreateOrder(sessionId);
      
      setResult({ 
        success: true, 
        message: 'Payment verified successfully! Your order has been created.',
        orderId: order.id
      });

      dispatch({
        type: 'SET_NOTIFICATION',
        payload: {
          type: 'success',
          message: 'Payment verified! Your order is now confirmed.',
          show: true
        }
      });

    } catch (error) {
      console.error('Payment recovery error:', error);
      setResult({ 
        success: false, 
        message: 'Failed to verify payment. Please contact support with your payment proof.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4 max-w-2xl">
        {/* Header */}
        <div className="flex items-center space-x-2 sm:space-x-4 mb-6 sm:mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-1 sm:p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-heading font-bold text-gray-900 dark:text-white">
              Payment Recovery
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
              Recover your order if payment was made but order wasn't confirmed
            </p>
          </div>
        </div>

        {/* Recovery Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter Payment Session ID
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  placeholder="Enter your payment session ID (e.g., session_123456...)"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                You can find this in your order confirmation email or on the payment page.
              </p>
            </div>

            <button
              onClick={handleRecovery}
              disabled={loading || !sessionId.trim()}
              className="w-full bg-primary hover:bg-primary-light text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying Payment...</span>
                </>
              ) : (
                <span>Verify Payment</span>
              )}
            </button>
          </div>
        </div>

        {/* Result Display */}
        {result && (
          <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg ${
            result.success 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-start space-x-3">
              {result.success ? (
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p className={`font-medium text-sm sm:text-base ${
                  result.success 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {result.success ? 'Success!' : 'Unable to Verify'}
                </p>
                <p className={`text-sm sm:text-base mt-1 ${
                  result.success 
                    ? 'text-green-700 dark:text-green-300' 
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {result.message}
                </p>
                {result.success && result.orderId && (
                  <div className="mt-3">
                    <button
                      onClick={() => navigate(`/order-confirmation/${result.orderId}`)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      View Order Details
                    </button>
                  </div>
                )}
                {!result.success && (
                  <div className="mt-3">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Please contact support at <strong>+91 6374288038</strong> with your payment proof and this session ID.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Support Information */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 mt-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-sm sm:text-base">
            Need Help?
          </h3>
          <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
            If you can't find your session ID or need assistance:
          </p>
          <div className="space-y-2 text-sm">
            <p className="text-blue-600 dark:text-blue-400">
              📞 Call us: <strong>+91 6374288038</strong>
            </p>
            <p className="text-blue-600 dark:text-blue-400">
              📧 Email: <strong>support@kichofy.com</strong>
            </p>
            <p className="text-blue-600 dark:text-blue-400">
              💬 WhatsApp: <strong>+91 6374288038</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentRecovery;