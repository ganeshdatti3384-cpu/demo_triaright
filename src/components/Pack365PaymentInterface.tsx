/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Shield, 
  Clock, 
  IndianRupee, 
  Gift, 
  X,
  Calculator,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Pack365PaymentService } from '@/services/pack365Payment';
import { pack365Api } from '@/services/api';

interface Pack365PaymentInterfaceProps {
  streamName: string;
  coursesCount: number;
  onPaymentSuccess: (response: any) => void;
  onPaymentError: (error: any) => void;
  onBack: () => void;
}

const Pack365PaymentInterface = ({
  streamName,
  coursesCount,
  onPaymentSuccess,
  onPaymentError,
  onBack
}: Pack365PaymentInterfaceProps) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentCalculation, setPaymentCalculation] = useState({
    baseAmount: 999,
    discount: 0,
    billableAmount: 999,
    gst: 179,
    finalAmount: 1178
  });
  const { toast } = useToast();

  useEffect(() => {
    // Calculate initial payment amount
    const calculation = Pack365PaymentService.calculatePaymentAmount(999, 0);
    setPaymentCalculation(calculation);
  }, []);

const validateCoupon = async () => {
  if (!couponCode.trim()) {
    toast({
      title: 'Error',
      description: 'Please enter a coupon code',
      variant: 'destructive',
    });
    return;
  }

  setIsValidatingCoupon(true);

  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');

    // ✅ Call API to validate coupon with correct parameters
    const result = await pack365Api.validateEnrollmentCode(token, couponCode.trim(), streamName);

    if (!result.success) {
      throw new Error(result.message || "Invalid coupon");
    }

    const discount = result.couponDetails?.discount || 0;
    const finalAmount = result.courseDetails?.finalAmount || 0;

    // Update UI/payment state with correct property names
    setPaymentCalculation({
      baseAmount: result.courseDetails?.originalPrice || 999,
      discount,
      billableAmount: finalAmount - Math.round(finalAmount * 0.18),
      gst: Math.round(finalAmount * 0.18),
      finalAmount,
    });

    setAppliedCoupon({
      code: result.couponDetails?.code || couponCode,
      discount,
      description: result.couponDetails?.description || 'Discount applied',
    });

    toast({
      title: 'Coupon Applied!',
      description: `₹${discount} discount applied. New amount: ₹${finalAmount}`,
    });

  } catch (error: any) {
    toast({
      title: 'Invalid Coupon',
      description: error?.response?.data?.message || error.message || 'The coupon code is invalid or expired.',
      variant: 'destructive',
    });
  } finally {
    setIsValidatingCoupon(false);
  }
};

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    const calculation = Pack365PaymentService.calculatePaymentAmount(999, 0);
    setPaymentCalculation(calculation);
    toast({
      title: 'Coupon Removed',
      description: 'Coupon has been removed. Amount reset to original price.',
    });
  };

  const handlePayment = async () => {
  setIsProcessingPayment(true);

  try {
    // Make sure token exists
    const token = localStorage.getItem('token');
    if (!token) throw new Error('User not authenticated');

    // Optional: Ensure coupon was validated if entered
    if (couponCode && !appliedCoupon) {
      toast({
        title: 'Coupon Not Applied',
        description: 'Please validate the coupon before making payment.',
        variant: 'destructive',
      });
      setIsProcessingPayment(false);
      return;
    }

    // Proceed with payment using finalAmount and couponCode
    await Pack365PaymentService.processPayment(
      {
        streamName,
        fromStream: true,
        amount: paymentCalculation.finalAmount,
        couponCode: appliedCoupon?.code || undefined,
      },
      (response) => {
        console.log('Payment successful:', response);
        onPaymentSuccess(response);
      },
      (error) => {
        console.error('Payment failed:', error);
        onPaymentError(error);
      }
    );
  } catch (error: any) {
    console.error('Error initiating payment:', error);
    toast({
      title: 'Payment Error',
      description: error.message || 'Failed to initiate payment. Please try again.',
      variant: 'destructive',
    });
  } finally {
    setIsProcessingPayment(false);
  }
};

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardTitle className="text-2xl flex items-center">
            <Shield className="h-6 w-6 mr-2" />
            Pack365 Payment - {streamName} Bundle
          </CardTitle>
          <div className="mt-4 bg-white/10 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">
                {coursesCount} Courses • 365 Days Access
              </span>
              <Badge className="bg-white text-blue-600">Premium</Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <div className="space-y-6">
            {/* Coupon Section */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3 flex items-center">
                <Gift className="h-4 w-4 mr-2" />
                Apply Coupon Code
              </h4>
              
              {appliedCoupon ? (
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-800">
                        Coupon Applied: {appliedCoupon.code}
                      </p>
                      <p className="text-sm text-green-600">{appliedCoupon.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeCoupon}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <Label htmlFor="coupon">Enter coupon code</Label>
                      <Input
                        id="coupon"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                        onKeyPress={(e) => e.key === 'Enter' && validateCoupon()}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={validateCoupon}
                        disabled={isValidatingCoupon}
                        className="px-6"
                      >
                        {isValidatingCoupon ? 'Validating...' : 'Apply'}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Try "DISCOUNT200" for ₹200 off
                  </p>
                </div>
              )}
            </div>

            {/* Payment Calculation */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Payment Breakdown
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Amount:</span>
                  <span className="font-medium">₹{paymentCalculation.baseAmount}</span>
                </div>
                
                {paymentCalculation.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-medium text-green-600">
                      -₹{paymentCalculation.discount}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Billable Amount:</span>
                  <span className="font-medium">₹{paymentCalculation.billableAmount}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST (18%):</span>
                  <span className="font-medium">₹{paymentCalculation.gst}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-blue-600">₹{paymentCalculation.finalAmount}</span>
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
                <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-orange-800">365 Days</p>
                <p className="text-xs text-orange-600">Full year access</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handlePayment}
                disabled={isProcessingPayment}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6"
              >
                {isProcessingPayment ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Opening Payment Gateway...</span>
                  </div>
                ) : (
                  <>
                    <IndianRupee className="h-5 w-5 mr-2" />
                    Pay ₹{paymentCalculation.finalAmount} Securely
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={onBack}
                disabled={isProcessingPayment}
                className="w-full"
              >
                Back to Bundle Details
              </Button>
            </div>

            {/* Security Notice */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-gray-600 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-1">Secure Payment Gateway</p>
                  <p>
                    Your payment is processed through Razorpay's secure payment gateway. 
                    We don't store your payment information.
                  </p>
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
  );
};

export default Pack365PaymentInterface;
