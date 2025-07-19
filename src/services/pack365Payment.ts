
/* eslint-disable @typescript-eslint/no-explicit-any */

import { pack365Api } from './api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentOptions {
  streamName: string;
  courseId?: string;
  courseName?: string;
  fromStream: boolean;
  fromCourse: boolean;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export class Pack365PaymentService {
  private static loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.log('Razorpay script loaded successfully');
        resolve(true);
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  static async createOrder(options: PaymentOptions): Promise<{ orderId: string; key: string; amount: number }> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    if (!options.courseId) {
      throw new Error('Course ID is required');
    }

    console.log('Creating order with courseId:', options.courseId);

    try {
      const response = await pack365Api.createOrder(token, options.courseId, 'payment');

      console.log('Order response:', response);

      if (!response.success) {
        throw new Error(response.message || 'Failed to create order');
      }

      return {
        orderId: response.order.id,
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_PGrSvKSsu8PlqK',
        amount: response.order.amount
      };
    } catch (error: any) {
      console.error('Error creating order:', error);
      throw new Error(error.message || 'Failed to create payment order');
    }
  }

  static async processPayment(
    options: PaymentOptions,
    onSuccess: (response: RazorpayResponse) => void,
    onError: (error: any) => void
  ): Promise<void> {
    try {
      console.log('Starting payment process...');
      
      // Load Razorpay script
      const isScriptLoaded = await this.loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Failed to load Razorpay payment gateway. Please check your internet connection and try again.');
      }

      // Create order
      const { orderId, key, amount } = await this.createOrder(options);
      console.log('Order created:', { orderId, key, amount });

      // Get user info
      const currentUser = localStorage.getItem('currentUser');
      const user = currentUser ? JSON.parse(currentUser) : null;

      // Configure Razorpay options
      const razorpayOptions = {
        key: key,
        amount: amount, // Amount from backend
        currency: 'INR',
        name: 'Pack365',
        description: options.fromStream 
          ? `${options.streamName} Bundle - Pack365` 
          : `${options.courseName} - Pack365`,
        order_id: orderId,
        prefill: {
          name: user ? `${user.firstName} ${user.lastName}` : '',
          email: user?.email || '',
          contact: user?.phoneNumber || ''
        },
        theme: {
          color: '#3B82F6'
        },
        handler: async (response: RazorpayResponse) => {
          console.log('Payment successful:', response);
          try {
            await this.verifyPayment(response);
            onSuccess(response);
          } catch (error) {
            console.error('Payment verification failed:', error);
            onError(error);
          }
        },
        modal: {
          ondismiss: () => {
            console.log('Payment cancelled by user');
            onError(new Error('Payment was cancelled by user'));
          }
        }
      };

      console.log('Opening Razorpay checkout with options:', razorpayOptions);

      // Check if Razorpay is available
      if (!window.Razorpay) {
        throw new Error('Razorpay is not loaded. Please refresh the page and try again.');
      }

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(razorpayOptions);
      
      razorpay.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response.error);
        onError(new Error(response.error.description || 'Payment failed'));
      });

      razorpay.open();

    } catch (error: any) {
      console.error('Error processing payment:', error);
      onError(error);
    }
  }

  static async verifyPayment(response: RazorpayResponse): Promise<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      const verificationResponse = await pack365Api.verifyPayment(token, {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature
      });

      if (!verificationResponse.success) {
        throw new Error(verificationResponse.message || 'Payment verification failed');
      }

      return verificationResponse;
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      throw new Error(error.message || 'Payment verification failed');
    }
  }

  static async handlePaymentFailure(orderId: string): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await pack365Api.handlePaymentFailure(token, { razorpay_order_id: orderId });
    } catch (error) {
      console.error('Error handling payment failure:', error);
    }
  }

  static async checkEnrollmentStatus(courseId: string): Promise<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      const response = await pack365Api.checkEnrollmentStatus(token, courseId);
      return response;
    } catch (error: any) {
      console.error('Error checking enrollment status:', error);
      throw new Error(error.message || 'Failed to check enrollment status');
    }
  }
}
