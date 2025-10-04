import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { PaymentService } from '../../services/paymentService';

interface UPIPaymentProps {
  total: number;
  paymentSessionId: string;
  loading: boolean;
  orderSubmitted: boolean;
  onPayment: () => void;
  onBack: () => void;
}

export const UPIPayment: React.FC<UPIPaymentProps> = ({
  total,
  loading,
  orderSubmitted,
  onPayment,
  onBack
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes
  const [qrData, setQrData] = useState<string>('');
  const [razorpayOrderId, setRazorpayOrderId] = useState<string>('');

  // Generate QR code data - FIXED VERSION
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        // Use createOrder instead of createUPIOrder
        const order = await PaymentService.createOrder({
          amount: total,
          receipt: `receipt_${Date.now()}`,
          notes: {
            purpose: 'Product Purchase'
          }
        });
        
        setRazorpayOrderId(order.id);
        // Simple UPI string for QR code
        const upiId = "kaviyamurugan286-1@okaxis"; // Your UPI ID
        setQrData(`upi://pay?pa=${upiId}&pn=Kichofy&am=${total.toFixed(2)}&tn=Order${order.id.slice(-6)}&cu=INR`);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQRCode();
  }, [total]);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRazorpayUPI = async () => {
    try {
      await onPayment();
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
        UPI Payment
      </h2>

      {/* Security Notice */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start space-x-2">
          <div className="text-blue-600 dark:text-blue-400 mt-0.5">🔒</div>
          <div>
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 text-sm sm:text-base mb-1">
              Secure Payment
            </h4>
            <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-400">
              Powered by Razorpay - PCI DSS Certified
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Razorpay UPI Option */}
        <div className="border-2 border-green-500 rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Pay with UPI Apps
            </h3>
            <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
              Recommended
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
              Pay securely using any UPI app through Razorpay
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg border border-gray-200 mb-2">
                  <img
                    src="https://logos-download.com/wp-content/uploads/2020/06/Google_Pay_Logo.png"
                    alt="Google Pay"
                    className="h-8 mx-auto object-contain"
                  />
                </div>
                <span className="text-xs font-medium">Google Pay</span>
              </div>
              
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg border border-gray-200 mb-2">
                  <img
                    src="https://logos-download.com/wp-content/uploads/2021/01/PhonePe_Logo.png"
                    alt="PhonePe"
                    className="h-8 mx-auto object-contain"
                  />
                </div>
                <span className="text-xs font-medium">PhonePe</span>
              </div>
            </div>

            <button
              onClick={handleRazorpayUPI}
              disabled={loading || orderSubmitted}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 text-base"
            >
              {loading ? 'Processing...' : `Pay ₹${total.toLocaleString()} with UPI`}
            </button>
            
            <p className="text-xs text-gray-500 mt-3">
              You'll be redirected to a secure payment page
            </p>
          </div>
        </div>

        {/* QR Code Option */}
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Scan QR Code
            </h3>
            <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
              timeLeft > 60 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              ⏰ {formatTime(timeLeft)}
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-white p-4 rounded-lg inline-block mb-4 border border-gray-200">
              <QRCodeCanvas
                value={qrData}
                size={180}
                level="M"
                includeMargin={true}
                bgColor="#FFFFFF"
                fgColor="#000000"
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Scan with any UPI app to pay ₹{total.toLocaleString()}
            </p>
            <button
              onClick={onPayment}
              disabled={loading || orderSubmitted}
              className="bg-primary hover:bg-primary-light text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'I have Paid'}
            </button>
          </div>
        </div>

        {/* Manual UPI Instructions */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Manual UPI Payment
          </h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
            If you prefer to pay manually:
          </p>
          <div className="bg-white dark:bg-gray-700 p-3 rounded border">
            <div className="text-center space-y-2">
              <div>
                <p className="text-xs text-gray-500">UPI ID</p>
                <p className="font-mono text-sm font-bold">kaviyamurugan286-1@okaxis</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Amount</p>
                <p className="text-lg font-bold text-green-600">₹{total.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Note</p>
                <p className="text-xs">Order # {razorpayOrderId.slice(-8)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={onBack}
            className="text-primary hover:text-primary-light font-medium py-2"
          >
            ← Back to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};