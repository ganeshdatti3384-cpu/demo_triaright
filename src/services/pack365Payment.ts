
import { authApi } from './api';

interface PaymentOptions {
  streamName: string;
  courseId?: string;
  courseName: string;
  fromStream: boolean;
  fromCourse: boolean;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export class Pack365PaymentService {
  static async processPayment(
    options: PaymentOptions,
    onSuccess: (response: RazorpayResponse) => void,
    onError: (error: any) => void
  ) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Create order with backend
      const orderResponse = await authApi.createOrderEnhanced(token, {
        stream: options.streamName,
        courseId: options.courseId,
        fromStream: options.fromStream,
        fromCourse: options.fromCourse
      });

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Failed to create order');
      }

      // Initialize Razorpay
      const razorpayOptions = {
        key: orderResponse.key,
        amount: 365 * 100, // ₹365 in paise
        currency: 'INR',
        name: 'Triaright',
        description: `Payment for ${options.courseName}`,
        order_id: orderResponse.orderId,
        handler: async (response: RazorpayResponse) => {
          try {
            // Verify payment with backend
            const verifyResponse = await authApi.verifyPayment(token, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyResponse.success) {
              onSuccess(response);
            } else {
              throw new Error(verifyResponse.message || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            onError(error);
          }
        },
        modal: {
          ondismiss: () => {
            onError(new Error('Payment cancelled by user'));
          }
        },
        theme: {
          color: '#3B82F6'
        }
      };

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.head.appendChild(script);
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      // Open Razorpay checkout
      const rzp = new window.Razorpay(razorpayOptions);
      rzp.open();

    } catch (error) {
      console.error('Payment initiation error:', error);
      onError(error);
    }
  }
}

// Extend window interface for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}
