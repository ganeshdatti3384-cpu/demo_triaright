import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { courseApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RealPaymentGatewayProps {
  courseId: string;
  amount: number;
  courseName: string;
  onPaymentComplete: (success: boolean) => void;
  onBack: () => void;
}

const RealPaymentGateway = ({ 
  courseId, 
  amount, 
  courseName, 
  onPaymentComplete, 
  onBack 
}: RealPaymentGatewayProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => setIsRazorpayLoaded(true);
    script.onerror = () => {
      toast({
        title: 'Error',
        description: 'Failed to load payment gateway',
        variant: 'destructive'
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [toast]);

  const processPayment = async () => {
    if (!isRazorpayLoaded) {
      toast({
        title: 'Error',
        description: 'Payment gateway is still loading',
        variant: 'destructive'
      });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Error',
        description: 'Please login to continue',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create order
      console.log('Creating order for courseId:', courseId);
      console.log('API URL:', `${import.meta.env.VITE_BACKEND_URL || 'https://dev.triaright.com/api'}/courses/enrollments/order`);
      console.log('Auth token exists:', !!token);
      console.log('Amount to be paid:', amount);
      
      const orderResponse = await courseApi.createOrder(token, courseId);
      console.log('Order response received:', orderResponse);
      
      if (!orderResponse.success) {
        throw new Error('Failed to create order');
      }

      const { order } = orderResponse;

      // Configure Razorpay options
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_9WaeLLfVddGUmR';
      console.log('Using Razorpay key:', razorpayKey);
      console.log('Order details from backend:', {
        id: order.id,
        amount: order.amount,
        currency: order.currency
      });
      
      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'TriaRight',
        description: `Payment for ${courseName}`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await courseApi.verifyPaymentAndEnroll(token, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyResponse.success) {
              toast({
                title: 'Success',
                description: 'Payment successful! You are now enrolled in the course.',
              });
              onPaymentComplete(true);
            } else {
              throw new Error(verifyResponse.message || 'Payment verification failed');
            }
          } catch (error: any) {
            console.error('Payment verification error:', error);
            toast({
              title: 'Payment Error',
              description: error.message || 'Payment verification failed',
              variant: 'destructive'
            });
            onPaymentComplete(false);
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        notes: {
          courseId,
          courseName
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            toast({
              title: 'Payment Cancelled',
              description: 'Payment was cancelled by user',
              variant: 'destructive'
            });
          }
        }
      };

      console.log('Initializing Razorpay with options:', {
        key: options.key,
        amount: options.amount,
        currency: options.currency,
        order_id: options.order_id
      });
      
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error: any) {
      console.error('Payment initiation error:', error);
      toast({
        title: 'Payment Error',
        description: error.message || 'Failed to initiate payment',
        variant: 'destructive'
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Button
        variant="outline"
        onClick={onBack}
        className="mb-6"
        disabled={isProcessing}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Course Details
      </Button>

      <Card className="shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardTitle className="text-2xl flex items-center">
            <Shield className="h-6 w-6 mr-2" />
            Secure Payment Gateway
          </CardTitle>
          <div className="mt-4 bg-white/10 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">{courseName}</span>
              <Badge className="bg-white text-blue-600">Course</Badge>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-lg">Total Amount</span>
              <span className="text-2xl font-bold">₹{amount}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <Shield className="h-4 w-4" />
                <span>256-bit SSL Encrypted Payment</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <Clock className="h-4 w-4" />
                <span>Instant course access after payment</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Secure Razorpay payment gateway</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Course Price:</span>
                <span>₹{amount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Processing Fee:</span>
                <span>₹0</span>
              </div>
              <div className="border-t pt-2 flex items-center justify-between font-semibold">
                <span>Total Amount:</span>
                <span className="text-xl text-blue-600">₹{amount}</span>
              </div>
            </div>

            <Button
              onClick={processPayment}
              disabled={isProcessing || !isRazorpayLoaded}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6"
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="animate-spin h-4 w-4" />
                  <span>Processing Payment...</span>
                </div>
              ) : !isRazorpayLoaded ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="animate-spin h-4 w-4" />
                  <span>Loading Payment Gateway...</span>
                </div>
              ) : (
                `Pay ₹${amount} Securely`
              )}
            </Button>

            <div className="text-xs text-gray-500 text-center">
              By proceeding, you agree to our{' '}
              <a 
                href="/terms-conditions" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-700"
              >
                Terms of Service
              </a>
              {', '}
              <a 
                href="/privacy-policy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-700"
              >
                Privacy Policy
              </a>
              {', and '}
              <a 
                href="/refund-policy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-700"
              >
                Refund Policy
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealPaymentGateway;