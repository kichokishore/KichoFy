// Enhanced Payment Service with Razorpay

const RAZORPAY_TEST_KEY = 'rzp_test_ROb3Jn2Tc1VeAT'; 

declare global {
    interface Window {
        Razorpay: any;
    }
}

export interface PaymentOptions {
    amount: number;
    currency?: string;
    receipt?: string;
    notes?: Record<string, string>;
    customer?: {
        name: string;
        email: string;
        phone: string;
    };
}

export interface UPIApp {
    name: string;
    package: string;
    logo: string;
}

export class PaymentService {
    private static readonly UPI_APPS: UPIApp[] = [
        {
            name: 'Google Pay',
            package: 'com.google.android.apps.nbu.paisa.user',
            logo: 'https://logos-download.com/wp-content/uploads/2020/06/Google_Pay_Logo.png'
        },
        {
            name: 'PhonePe',
            package: 'com.phonepe.app',
            logo: 'https://logos-download.com/wp-content/uploads/2021/01/PhonePe_Logo.png'
        },
        {
            name: 'Paytm',
            package: 'net.one97.paytm',
            logo: 'https://logos-download.com/wp-content/uploads/2016/05/Paytm_Logo.png'
        },
        {
            name: 'BHIM',
            package: 'in.org.npci.upiapp',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/BHIM_Logo.svg/1200px-BHIM_Logo.svg.png'
        }
    ];

    // Create Razorpay order
    static async createOrder(options: PaymentOptions): Promise<any> {
        try {
            // For now, let's create a mock order without backend
            console.log('Creating mock order for amount:', options.amount);

            const mockOrder = {
                id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                amount: options.amount * 100, // Convert to paise
                currency: options.currency || 'INR',
                receipt: options.receipt,
                status: 'created',
                created_at: Math.floor(Date.now() / 1000)
            };

            console.log('Mock order created:', mockOrder);
            return mockOrder;

            /* 
            // Uncomment this when you have a backend:
            const response = await fetch('/api/create-order', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                amount: options.amount * 100,
                currency: options.currency || 'INR',
                receipt: options.receipt,
                notes: options.notes,
              }),
            });
        
            if (!response.ok) {
              throw new Error('Failed to create order');
            }
        
            return await response.json();
            */
        } catch (error) {
            console.error('Error creating order:', error);

            // Fallback mock order
            return {
                id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                amount: options.amount * 100,
                currency: options.currency || 'INR',
                receipt: options.receipt,
                status: 'created'
            };
        }
    }

    // Initialize Razorpay payment
    static async initiatePayment(order: any, customer: any, callbacks: {
        onSuccess: (paymentId: string) => void;
        onFailure: (error: any) => void;
        onDismiss: () => void;
    }) {
        const razorpayKey = RAZORPAY_TEST_KEY;

        console.log('Razorpay Key:', razorpayKey); // Debug log

        const options = {
            key: razorpayKey,
            amount: order.amount,
            currency: order.currency,
            name: 'Kichofy Store',
            description: 'Product Purchase',
            order_id: order.id,
            prefill: {
                name: customer.name,
                email: customer.email,
                contact: customer.phone,
            },
            theme: {
                color: '#4F46E5',
            },
            handler: function (response: any) {
                callbacks.onSuccess(response.razorpay_payment_id);
            },
            modal: {
                ondismiss: function () {
                    callbacks.onDismiss();
                },
            },
        };

        try {
            // Check if Razorpay is loaded
            if (typeof window.Razorpay === 'undefined') {
                throw new Error('Razorpay script not loaded. Check if script is in index.html');
            }

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error('Error initializing Razorpay:', error);
            callbacks.onFailure(error);
        }
    }

    // Verify payment with backend
    static async verifyPayment(paymentId: string, orderId: string): Promise<boolean> {
        try {
            console.log('Mock verifying payment:', paymentId, 'for order:', orderId);
            
            // For testing, always return true
            // In production, you'd call your backend here
            return new Promise((resolve) => {
                setTimeout(() => {
                    console.log('Payment verification completed');
                    resolve(true); // Always return true for testing
                }, 1000);
            });
            
            /* 
            // Uncomment when you have a backend:
            const response = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    payment_id: paymentId,
                    order_id: orderId,
                }),
            });

            if (!response.ok) {
                throw new Error('Payment verification failed');
            }

            const result = await response.json();
            return result.success;
            */
        } catch (error) {
            console.error('Error verifying payment:', error);
            return false;
        }
    }

    // Get available UPI apps
    static getUPIApps(): UPIApp[] {
        return this.UPI_APPS;
    }

    // Generate UPI deep link (fallback)
    static generateUPIDeeplink(upiId: string, amount: number, note: string): string {
        const cleanUpiId = upiId.trim().toLowerCase().replace(/\s+/g, '');
        const formattedAmount = amount.toFixed(2);

        return `upi://pay?pa=${cleanUpiId}&pn=Kichofy&am=${formattedAmount}&tn=${encodeURIComponent(note)}&cu=INR`;
    }

    // Check if UPI app is installed
    static isUPIAppInstalled(packageName: string): boolean {
        // This is a simplified check - in reality, you'd need more complex detection
        return false;
    }
}