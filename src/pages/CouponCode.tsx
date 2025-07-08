import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Tag, 
  Percent, 
  Gift, 
  CreditCard,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PaymentGateway from '@/components/PaymentGateway';

const CouponCode = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [discount, setDiscount] = useState<number | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  
  const courseId = searchParams.get('courseId');
  const courseName = searchParams.get('courseName') || 'Course';
  const originalAmount = parseFloat(searchParams.get('amount') || '365');
  const type = searchParams.get('type') || 'pack365';

  // Mock coupon codes for demo
  const validCoupons = {
    'SAVE10': { discount: 10, type: 'percentage' },
    'SAVE20': { discount: 20, type: 'percentage' },
    'FLAT50': { discount: 50, type: 'fixed' },
    'STUDENT25': { discount: 25, type: 'percentage' },
    'NEWUSER': { discount: 15, type: 'percentage' }
  };

  const finalAmount = discount 
    ? validCoupons[couponCode as keyof typeof validCoupons]?.type === 'percentage'
      ? originalAmount - (originalAmount * discount / 100)
      : originalAmount - discount
    : originalAmount;

  const handleValidateCoupon = () => {
    if (!couponCode.trim()) {
      toast({ title: 'Please enter a coupon code', variant: 'destructive' });
      return;
    }

    setIsValidating(true);
    
    // Simulate API call
    setTimeout(() => {
      if (validCoupons[couponCode as keyof typeof validCoupons]) {
        const coupon = validCoupons[couponCode as keyof typeof validCoupons];
        setDiscount(coupon.discount);
        toast({ 
          title: 'Coupon applied successfully!', 
          description: `You saved ${coupon.type === 'percentage' ? `${coupon.discount}%` : `₹${coupon.discount}`}` 
        });
      } else {
        toast({ 
          title: 'Invalid coupon code', 
          description: 'Please check your coupon code and try again.',
          variant: 'destructive' 
        });
        setDiscount(null);
      }
      setIsValidating(false);
    }, 1000);
  };

  const handleProceedToPayment = () => {
    setShowPayment(true);
  };

  const handlePaymentComplete = (success: boolean) => {
    if (success) {
      navigate(`/payment-success?courseId=${courseId}&type=${type}`);
    } else {
      navigate(`/payment-failed?courseId=${courseId}&type=${type}`);
    }
  };

  const handleSkipCoupon = () => {
    const params = new URLSearchParams({
      courseId: courseId || '',
      courseName,
      amount: originalAmount.toString(),
      type
    });
    navigate(`/payment-gateway?${params.toString()}`);
  };

  if (showPayment) {
    return (
      <PaymentGateway
        amount={Math.round(finalAmount)}
        courseName={courseName}
        onPaymentComplete={handlePaymentComplete}
        onBack={() => setShowPayment(false)}
      />
    );
  }

  return (
    <>
      <Navbar onOpenAuth={() => {}} />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full mb-4">
              <Gift className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Apply Coupon Code
            </h1>
            <p className="text-gray-600">
              Enter your coupon code to get amazing discounts on your purchase
            </p>
          </div>

          <Card className="shadow-xl backdrop-blur-sm bg-white/90">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Tag className="h-5 w-5 mr-2 text-purple-600" />
                Course Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Course Info */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800">{courseName}</span>
                  <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                    {type === 'pack365' ? 'Pack365' : 'Premium'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Original Price</span>
                  <span className={`text-lg font-bold ${discount ? 'line-through text-gray-500' : 'text-purple-600'}`}>
                    ₹{originalAmount}
                  </span>
                </div>
                {discount && (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-green-600">Discounted Price</span>
                    <span className="text-xl font-bold text-green-600">₹{Math.round(finalAmount)}</span>
                  </div>
                )}
              </div>

              {/* Coupon Input */}
              <div className="space-y-4">
                <Label htmlFor="coupon" className="text-base font-medium">
                  Enter Coupon Code
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="coupon"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g., SAVE20, STUDENT25"
                    className="flex-1 text-center font-mono tracking-wider uppercase"
                    disabled={isValidating}
                  />
                  <Button
                    onClick={handleValidateCoupon}
                    disabled={isValidating || !couponCode.trim()}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isValidating ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    Apply
                  </Button>
                </div>
              </div>

              {/* Sample Coupons */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Percent className="h-4 w-4 mr-1" />
                  Try these sample codes:
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(validCoupons).map(([code, details]) => (
                    <button
                      key={code}
                      onClick={() => setCouponCode(code)}
                      className="text-xs bg-white border border-gray-200 rounded px-2 py-1 hover:bg-purple-50 hover:border-purple-300 transition-colors"
                    >
                      {code}
                      <span className="block text-gray-500">
                        {details.type === 'percentage' ? `${details.discount}% off` : `₹${details.discount} off`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Discount Summary */}
              {discount && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-700 mb-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Coupon Applied Successfully!</span>
                  </div>
                  <div className="text-sm text-green-600">
                    You're saving ₹{Math.round(originalAmount - finalAmount)} on this purchase
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <Button
                  onClick={handleProceedToPayment}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg py-3"
                  disabled={!discount}
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Pay ₹{Math.round(finalAmount)} {discount && '(Discounted)'}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleSkipCoupon}
                  className="w-full"
                >
                  Continue without coupon code
                </Button>
              </div>

              {/* Info */}
              <div className="text-xs text-gray-500 text-center space-y-1">
                <div className="flex items-center justify-center space-x-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>Coupon codes are case-insensitive</span>
                </div>
                <div>Only one coupon can be applied per transaction</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CouponCode;