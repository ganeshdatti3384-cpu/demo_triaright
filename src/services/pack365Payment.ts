
/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from 'axios';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentOptions {
  streamName: string;
  fromStream: boolean;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface OrderResponse {
  orderId: string;
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://dev.triaright.com/api';

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
      document.head.appendChild(script);
    });
  }

  static async createOrder(options: PaymentOptions): Promise<OrderResponse> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    console.log('Creating order with options:', options);

    try {
      const requestData = {
        stream: options.streamName || 'it',
        fromStream: options.fromStream,
      };

      console.log('Sending request to backend:', requestData);

      const response = await axios.post(
        `${API_BASE_URL}/pack365/packenroll365/create-order`,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Order response:', response.data);

      if (!response.data.orderId) {
        throw new Error('Invalid order response from server');
      }

      return {
        orderId: response.data.orderId,
      };
    } catch (error: any) {
      console.error('Error creating order:', error);
      
      if (error.response) {
        throw new Error(error.response.data?.error || error.response.data?.message || 'Failed to create payment order');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        throw new Error(error.message || 'Failed to create payment order');
      }
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
      const { orderId } = await this.createOrder(options);
      console.log('Order created:', { orderId});

      // Get user info
      const currentUser = localStorage.getItem('currentUser');
      const user = currentUser ? JSON.parse(currentUser) : null;

      // Configure Razorpay options
      const razorpayOptions = {
        amount: 36500, // ₹365 in paise
        currency: 'INR',
        name: 'Pack365',
        description: options.streamName ,
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
      const verificationResponse = await axios.post(
        `${API_BASE_URL}/pack365/verify-payment`,
        {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Payment verification response:', verificationResponse.data);

      if (!verificationResponse.data.success) {
        throw new Error(verificationResponse.data.message || 'Payment verification failed');
      }

      return verificationResponse.data;
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      
      if (error.response) {
        throw new Error(error.response.data?.message || 'Payment verification failed');
      } else if (error.request) {
        throw new Error('Network error during payment verification');
      } else {
        throw new Error(error.message || 'Payment verification failed');
      }
    }
  }

  static async handlePaymentFailure(orderId: string): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.post(
        `${API_BASE_URL}/pack365/payment-failure`,
        { razorpay_order_id: orderId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
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
      const response = await axios.get(
        `${API_BASE_URL}/pack365/check-enrollment/${courseId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error checking enrollment status:', error);
      throw new Error(error.message || 'Failed to check enrollment status');
    }
  }
}
