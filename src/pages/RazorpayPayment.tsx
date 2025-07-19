
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Shield, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Pack365PaymentService } from '@/services/pack365Payment';
import { useToast } from '@/hooks/use-toast';

const RazorpayPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { streamName, fromStream } = location.state || {};
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to continue with payment',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    // Validate required data
    if (!streamName ) {
      toast({
        title: 'Error',
        description: 'Invalid payment data. Please try again.',
        variant: 'destructive'
      });
      navigate('/pack365');
      return;
    }

    // Log payment data for debugging
    console.log('Payment data:', { streamName, fromStream });
  }, [navigate, streamName, toast, fromStream]);

  const handlePayment = async () => {
    if (!streamName) {
      toast({
        title: 'Error',
        description: 'Stream Name is missing. Please try again.',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('Starting Razorpay payment process...');

      await Pack365PaymentService.processPayment(
        {
          streamName: streamName || '',
          courseName: `${streamName} Bundle`,
          fromStream: fromStream || false,
          fromCourse: false,
        },
        // Success callback
        (response) => {
          console.log('Payment successful:', response);
          toast({
            title: 'Payment Successful!',
            description: 'Your enrollment has been completed successfully.',
          });
          
          // Navigate to success page
          navigate('/payment-success', {
            state: {
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              streamName,
              fromStream,
            }
          });
        },
        // Error callback
        (error) => {
          console.error('Payment failed:', error);
          const errorMessage = error.message || 'Payment could not be processed. Please try again.';
          
          toast({
            title: 'Payment Failed',
            description: errorMessage,
            variant: 'destructive'
          });
          
          // Navigate to failure page
          navigate('/payment-failed', {
            state: {
              error: errorMessage,
              streamName
            }
          });
        }
      );
    } catch (error: any) {
      console.error('Error initiating payment:', error);
      toast({
        title: 'Payment Error',
        description: error.message || 'Failed to initiate payment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Show error if required data is missing
  if (!streamName) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Data Missing</h2>
              <p className="text-gray-600 mb-6">
                Required payment information is missing. Please go back and try again.
              </p>
              <Button onClick={() => navigate('/pack365')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Pack365
              </Button>
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Button
              variant="outline"
              onClick={handleBack}
              className="mb-6"
              disabled={isProcessing}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="text-2xl flex items-center">
                  <Shield className="h-6 w-6 mr-2" />
                  Secure Payment - Pack365
                </CardTitle>
                <div className="mt-4 bg-white/10 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-90">
                      {`${streamName} Bundle` }
                    </span>
                    <Badge className="bg-white text-blue-600">Pack365</Badge>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-lg">Total Amount</span>
                    <span className="text-2xl font-bold">₹365</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* Payment Details */}
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3">Payment Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Course/Bundle:</span>
                        <span className="font-medium">
                          {fromStream ? `${streamName} Bundle` : "no Stream Name"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Package:</span>
                        <span className="font-medium">Pack365</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Access Duration:</span>
                        <span className="font-medium">365 Days</span>
                      </div>
                      <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                        <span>Total Amount:</span>
                        <span className="text-xl text-blue-600">₹365</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Features */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                      <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-green-800">Secure Payment</p>
                      <p className="text-xs text-green-600">SSL Encrypted</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <CheckCircle2 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-purple-800">Instant Access</p>
                      <p className="text-xs text-purple-600">Immediate enrollment</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <CreditCard className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-orange-800">Multiple Options</p>
                      <p className="text-xs text-orange-600">UPI, Cards, Wallets</p>
                    </div>
                  </div>

                  {/* Payment Button */}
                  <Button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6"
                  >
                    {isProcessing ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Opening Payment Gateway...</span>
                      </div>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Pay ₹365 Securely
                      </>
                    )}
                  </Button>

                  {/* Security Notice */}
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-gray-600 mt-0.5" />
                      <div className="text-sm text-gray-700">
                        <p className="font-medium mb-1">Secure Payment Gateway</p>
                        <p>Your payment is processed through Razorpay's secure payment gateway. We don't store your payment information.</p>
                      </div>
                    </div>
                  </div>

                  {/* Terms */}
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
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RazorpayPayment;
