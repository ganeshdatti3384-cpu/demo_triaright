// components/internships/APRazorpayPayment.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

interface APRazorpayPaymentProps {
  internshipId: string;
  internshipTitle: string;
  amount: number;
  applicationId: string;
  onPaymentSuccess: () => void;
  onBack: () => void;
}

const APRazorpayPayment = ({
  internshipId,
  internshipTitle,
  amount,
  applicationId,
  onPaymentSuccess,
  onBack
}: APRazorpayPaymentProps) => {
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if Razorpay is available
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      setInitializing(false);
    } else {
      // Load Razorpay script dynamically
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        setInitializing(false);
      };
      script.onerror = () => {
        toast({
          title: 'Error',
          description: 'Failed to load payment gateway',
          variant: 'destructive'
        });
        setInitializing(false);
      };
      document.body.appendChild(script);
    }
  }, [toast]);

  const initializeRazorpayPayment = async () => {
    if (!(window as any).Razorpay) {
      toast({
        title: 'Error',
        description: 'Payment gateway not loaded. Please refresh the page.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: 'Authentication Required',
          description: 'Please login to proceed with payment',
          variant: 'destructive'
        });
        return;
      }

      // Create Razorpay order via your backend
      const orderResponse = await fetch('/api/internships/apinternshipapply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          internshipId,
          amount: Math.round(amount * 100), // Convert to paise
          currency: 'INR'
        })
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok || !orderData.success) {
        throw new Error(orderData.message || 'Failed to create payment order');
      }

      const razorpayOrder = orderData.razorpayOrder;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Triaright Education - AP Internships',
        description: `Internship: ${internshipTitle}`,
        order_id: razorpayOrder.id,
        handler: async function (response: any) {
          await verifyPayment(response);
        },
        prefill: {
          name: localStorage.getItem('userName') || '',
          email: localStorage.getItem('userEmail') || '',
          contact: localStorage.getItem('userPhone') || ''
        },
        theme: {
          color: '#4F46E5'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            toast({
              title: 'Payment Cancelled',
              description: 'You cancelled the payment process',
              variant: 'default'
            });
          }
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();

      razorpay.on('payment.failed', function (response: any) {
        setLoading(false);
        toast({
          title: 'Payment Failed',
          description: response.error.description || 'Payment could not be completed',
          variant: 'destructive'
        });
      });

    } catch (error: any) {
      console.error('Payment initialization error:', error);
      toast({
        title: 'Payment Error',
        description: error.message || 'Failed to initialize payment',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  const verifyPayment = async (response: any) => {
    try {
      const token = localStorage.getItem('token');
      
      const verifyResponse = await fetch('/api/internships/apinternshipverify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature
        })
      });

      const verifyData = await verifyResponse.json();

      if (verifyResponse.ok && verifyData.success) {
        toast({
          title: 'Payment Successful!',
          description: 'You have been successfully enrolled in the internship',
          variant: 'default'
        });
        onPaymentSuccess();
      } else {
        throw new Error(verifyData.message || 'Payment verification failed');
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      toast({
        title: 'Payment Verification Failed',
        description: error.message || 'Could not verify payment. Please contact support.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-2xl mx-auto px-4">
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Loading Payment Gateway...</h2>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="mb-6"
            disabled={loading}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Internship
          </Button>

          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Complete Your Internship Enrollment
              </h1>
              <p className="text-gray-600">
                Secure payment for {internshipTitle}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Internship:</span>
                <span className="font-semibold">{internshipTitle}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="text-xl font-bold text-green-600">
                  ₹{amount}
                </span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Secure 256-bit SSL encrypted payment
              </div>
              <div className="flex items-center text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Instant internship access after payment
              </div>
              <div className="flex items-center text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Razorpay secured payment gateway
              </div>
            </div>

            <Button
              onClick={initializeRazorpayPayment}
              disabled={loading || initializing}
              className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Processing Payment...
                </>
              ) : (
                `Pay ₹${amount} Securely`
              )}
            </Button>

            <div className="text-xs text-gray-500 text-center mt-4">
              By proceeding, you agree to our{' '}
              <a href="/terms" className="text-blue-600 hover:underline">Terms</a>
              {' '}and{' '}
              <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default APRazorpayPayment;