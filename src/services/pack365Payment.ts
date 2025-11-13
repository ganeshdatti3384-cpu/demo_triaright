/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from 'axios';
import { useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentOptions {
  streamName: string;
  fromStream: boolean;
  amount?: number;
  couponCode?: string;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature?: string;
  userID?: string;
}

interface OrderResponse {
  orderId: string;
  amount: number;
  baseAmount: number;
  discount: number;
  gst: number;
  coursesCount: number;
  stream: string;
}

interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  enrollment?: any;
  userID?: string;
  paymentDetails?: {
    orderId: string;
    amount: number;
    baseAmount: number;
    discount: number;
    gst: number;
    coursesCount: number;
    stream: string;
  };
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

  static calculatePaymentAmount(baseAmount: number = 999, discount: number = 0): {
    baseAmount: number;
    discount: number;
    billableAmount: number;
    gst: number;
    finalAmount: number;
  } {
    const billableAmount = Math.max(0, baseAmount - discount);
    const gst = Math.round(billableAmount * 0.18); // 18% GST
    const finalAmount = billableAmount + gst;

    return {
      baseAmount,
      discount,
      billableAmount,
      gst,
      finalAmount
    };
  }

  // Helper method to normalize stream names for backend
  private static normalizeStreamName(streamName: string): string {
    if (!streamName) return 'it';
    
    const normalized = streamName.toLowerCase();
    
    if (normalized.includes('it')) return 'IT';
    if (normalized.includes('finance')) return 'FINANCE';
    if (normalized.includes('marketing')) return 'mMARKETING';
    if (normalized.includes('hr')) return 'HR';
    if (normalized.includes('pharma')) return 'PHARMA';
    if (normalized.includes('non')) return 'NON-IT';
    
    // Default fallback
    return 'IT';
  }

  static async createOrder(options: PaymentOptions): Promise<OrderResponse> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    console.log('Creating order with options:', options);

    try {
      // Normalize stream name for backend compatibility
      const normalizedStream = this.normalizeStreamName(options.streamName);
      console.log('Normalized stream name:', options.streamName, '->', normalizedStream);

      const requestData: any = {
        stream: normalizedStream
      };

      // Add coupon code if provided
      if (options.couponCode) {
        requestData.code = options.couponCode;
      }
      console.log("Sending createOrder request with data:",requestData);
      const response = await axios.post(
        `${API_BASE_URL}/pack365/create-order`,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Order created successfully:', response.data);
      
      // Handle free enrollment case (when total amount is 0)
      if (response.data.success && response.data.enrollmentId) {
        // This means user was enrolled directly with free coupon
        throw new Error('FREE_ENROLLMENT');
      }

      // For paid orders, extract the order details
      const orderData = response.data;
      
      return {
        orderId: orderData.orderId,
        amount: orderData.totalAmount || orderData.amount,
        baseAmount: orderData.baseAmount,
        discount: orderData.discount || 0,
        gst: orderData.gst,
        coursesCount: orderData.coursesCount,
        stream: normalizedStream
      };

    } catch (error: any) {
      console.error('Error creating order:', error);
      
      // Handle free enrollment case
      if (error.message === 'FREE_ENROLLMENT') {
        throw error;
      }
      
      if (error.response) {
        const errorMessage = error.response.data?.error || error.response.data?.message || 'Failed to create order';
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.message || 'Unable to create payment order. Please try again later.');
      }
    }
  }

  static async processPayment(
    options: PaymentOptions,
    onSuccess?: (response: RazorpayResponse) => void,
    onError?: (error: any) => void
  ): Promise<void> {
    try {
      console.log('Starting payment process...');
      
      const orderDetails = await this.createOrder(options);
      console.log('Order created:', orderDetails);

      const isScriptLoaded = await this.loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Failed to load Razorpay payment gateway. Please check your internet connection and try again.');
      }

      const currentUser = localStorage.getItem('currentUser');
      const user = currentUser ? JSON.parse(currentUser) : null;

      const razorpayOptions = {
        key: "rzp_live_muJa8GZA0HcuE1",
        amount: orderDetails.amount * 100,
        currency: 'INR',
        name: 'Pack365',
        description: `${orderDetails.stream} Bundle - ${orderDetails.coursesCount} courses`,
        order_id: orderDetails.orderId,
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
          // Don't verify here - let the calling component handle verification
          if (onSuccess) {
            onSuccess(response);
          }
        },
        modal: {
          ondismiss: () => {
            console.log('Payment cancelled by user');
            const error = new Error('Payment was cancelled by user');
            if (onError) {
              onError(error);
            }
          }
        }
      };

      console.log('Opening Razorpay checkout with options:', razorpayOptions);

      if (!window.Razorpay) {
        throw new Error('Razorpay is not loaded. Please refresh the page and try again.');
      }

      const razorpay = new window.Razorpay(razorpayOptions);
      razorpay.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response.error);
        const error = new Error(response.error.description || 'Payment failed');
        if (onError) {
          onError(error);
        }
      });

      razorpay.open();

    } catch (error: any) {
      console.error('Error processing payment:', error);
      
      // Handle free enrollment case
      if (error.message === 'FREE_ENROLLMENT') {
        console.log('Free enrollment detected, redirecting to success page');
        if (onSuccess) {
          onSuccess({
            razorpay_payment_id: 'FREE_COUPON',
            razorpay_order_id: 'FREE_ENROLLMENT',
            razorpay_signature: 'FREE_ENROLLMENT'
          });
        }
        return;
      }
      
      if (onError) {
        onError(error);
      }
    }
  }

  static async verifyPayment(
    response: RazorpayResponse,
    stream: string,
    couponCode?: string,
    navigate?: ReturnType<typeof useNavigate>
  ): Promise<PaymentVerificationResponse> {
    try {
      // Handle free enrollment case
      if (response.razorpay_order_id === 'FREE_ENROLLMENT') {
        console.log('Free enrollment - automatically successful');
        
        if (navigate) {
          navigate('/payment-success');
        }
        
        return {
          success: true,
          message: 'Free enrollment successful',
          enrollment: {
            freeEnrollment: true,
            stream: stream,
            enrollmentDate: new Date().toISOString()
          }
        };
      }

      const requestData: any = {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      };

      console.log('Verifying payment with data:', requestData);

      const verificationResponse = await axios.post(
        `${API_BASE_URL}/pack365/payment/verify`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Payment verification response:', verificationResponse.data);

      if (verificationResponse.data.success) {
        console.log('Payment verification successful');
        if (navigate) {
          navigate('/payment-success');
        }
      } else {
        console.log('Payment verification failed');
        if (navigate) {
          navigate('/payment-failure');
        }
        throw new Error(verificationResponse.data.message || 'Payment verification failed');
      }

      return verificationResponse.data;
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      if (navigate) {
        navigate('/payment-failure');
      }

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
