// components/internships/APRazorpayPayment.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, Loader2, CheckCircle, CreditCard, IndianRupee, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface APRazorpayPaymentProps {
  internshipId: string;
  internshipTitle: string;
  amount: number;
  applicationId: string;
  couponCode?: string;
  discountAmount?: number;
  onPaymentSuccess: () => void;
  onBack: () => void;
}

const APRazorpayPayment = ({
  internshipId,
  internshipTitle,
  amount,
  applicationId,
  couponCode,
  discountAmount = 0,
  onPaymentSuccess,
  onBack
}: APRazorpayPaymentProps) => {
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const { toast } = useToast();

  const finalAmount = Math.max(0, amount - discountAmount);
  const hasDiscount = discountAmount > 0;

  useEffect(() => {
    // Load Razorpay script dynamically
    const loadRazorpay = () => {
      return new Promise((resolve, reject) => {
        if (typeof window !== 'undefined' && (window as any).Razorpay) {
          resolve(true);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
          console.log('Razorpay SDK loaded successfully');
          resolve(true);
        };
        script.onerror = () => {
          console.error('Failed to load Razorpay SDK');
          reject(new Error('Failed to load payment gateway'));
        };
        document.body.appendChild(script);
      });
    };

    loadRazorpay()
      .then(() => setInitializing(false))
      .catch((error) => {
        console.error('Error loading Razorpay:', error);
        toast({
          title: 'Error',
          description: 'Failed to load payment gateway. Please refresh the page.',
          variant: 'destructive'
        });
        setInitializing(false);
      });
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

      // Get application details to retrieve the Razorpay order
      const applicationResponse = await fetch(`/api/internships/apinternshipapplications/${applicationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const applicationData = await applicationResponse.json();

      if (!applicationResponse.ok || !applicationData.success) {
        throw new Error(applicationData.message || 'Failed to fetch application details');
      }

      const application = applicationData.application;
      
      if (!application.orderId) {
        throw new Error('Payment order not found for this application');
      }

      // Use the existing Razorpay order from the application
      const razorpayOrder = {
        id: application.orderId,
        amount: Math.round(Number(application.finalAmountPaid) * 100),
        currency: "INR"
      };

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Triaright Education',
        description: `AP Internship: ${internshipTitle}`,
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
          color: '#2563eb'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            toast({
              title: 'Payment Cancelled',
              description: 'You can complete the payment later from your applications',
              variant: 'default'
            });
          }
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();

      razorpay.on('payment.failed', function (response: any) {
        setLoading(false);
        console.error('Payment failed:', response.error);
        toast({
          title: 'Payment Failed',
          description: response.error.description || 'Payment could not be completed. Please try again.',
          variant: 'destructive'
        });
      });

    } catch (error: any) {
      console.error('Payment initialization error:', error);
      toast({
        title: 'Payment Error',
        description: error.message || 'Failed to initialize payment. Please try again.',
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
          title: 'Payment Verified Successfully!',
          description: 'Your payment has been verified and you are now enrolled in the internship.',
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
              <p className="text-gray-600 mt-2">Please wait while we initialize the payment system.</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
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
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Complete Your Enrollment
              </h1>
              <p className="text-gray-600">
                Secure payment for <strong>{internshipTitle}</strong>
              </p>
            </div>

            {/* Price Breakdown */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-3">Price Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Internship Program:</span>
                  <span className="font-semibold text-blue-900">{internshipTitle}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Original Amount:</span>
                  <span className="font-semibold flex items-center">
                    <IndianRupee className="h-4 w-4 mr-1" />
                    {amount.toLocaleString()}
                  </span>
                </div>
                
                {hasDiscount && (
                  <>
                    <div className="flex justify-between items-center text-green-600">
                      <span className="text-sm flex items-center">
                        <Tag className="h-3 w-3 mr-1" />
                        Discount ({couponCode}):
                      </span>
                      <span className="font-semibold flex items-center">
                        - <IndianRupee className="h-4 w-4 mr-1" />
                        {discountAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="border-t border-blue-200 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">Final Amount:</span>
                        <span className="text-2xl font-bold text-green-600 flex items-center">
                          <IndianRupee className="h-5 w-5 mr-1" />
                          {finalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </>
                )}
                
                {!hasDiscount && (
                  <div className="flex justify-between items-center border-t border-blue-200 pt-2">
                    <span className="text-sm font-semibold text-gray-700">Total Amount:</span>
                    <span className="text-2xl font-bold text-green-600 flex items-center">
                      <IndianRupee className="h-5 w-5 mr-1" />
                      {finalAmount.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center text-sm text-green-600">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Application submitted successfully
              </div>
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
              className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700 font-semibold"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Pay ₹{finalAmount.toLocaleString()} Securely
                </>
              )}
            </Button>

            <div className="text-xs text-gray-500 text-center mt-4">
              By proceeding, you agree to our{' '}
              <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default APRazorpayPayment;

