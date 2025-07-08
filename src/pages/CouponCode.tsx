
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Tag, CheckCircle2, AlertCircle, Percent } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

interface CouponData {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  description: string;
  isValid: boolean;
}

const CouponCode = () => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Get course/pack data from navigation state
  const { courseData, originalAmount, courseName } = location.state || {};

  // Mock coupon database
  const validCoupons: Record<string, CouponData> = {
    'SAVE20': {
      code: 'SAVE20',
      discount: 20,
      type: 'percentage',
      description: '20% off on all courses',
      isValid: true
    },
    'FIRST50': {
      code: 'FIRST50',
      discount: 50,
      type: 'fixed',
      description: '$50 off for first-time users',
      isValid: true
    },
    'STUDENT15': {
      code: 'STUDENT15',
      discount: 15,
      type: 'percentage',
      description: '15% student discount',
      isValid: true
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: 'Invalid Coupon',
        description: 'Please enter a coupon code',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const coupon = validCoupons[couponCode.toUpperCase()];
      
      if (coupon && coupon.isValid) {
        setAppliedCoupon(coupon);
        toast({
          title: 'Coupon Applied!',
          description: `${coupon.description} has been applied successfully`,
        });
      } else {
        toast({
          title: 'Invalid Coupon',
          description: 'The coupon code you entered is not valid or has expired',
          variant: 'destructive',
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast({
      title: 'Coupon Removed',
      description: 'Coupon has been removed from your order',
    });
  };

  const calculateDiscount = () => {
    if (!appliedCoupon || !originalAmount) return 0;
    
    if (appliedCoupon.type === 'percentage') {
      return (originalAmount * appliedCoupon.discount) / 100;
    } else {
      return appliedCoupon.discount;
    }
  };

  const getFinalAmount = () => {
    if (!originalAmount) return 0;
    const discount = calculateDiscount();
    return Math.max(0, originalAmount - discount);
  };

  const proceedToPayment = () => {
    const finalAmount = getFinalAmount();
    const discount = calculateDiscount();
    
    navigate('/payment', {
      state: {
        ...location.state,
        finalAmount,
        discount,
        appliedCoupon,
        originalAmount
      }
    });
  };

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={handleBack}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Course Info */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Tag className="h-5 w-5 text-blue-600" />
                  <span>Order Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900">{courseName || 'Course/Pack'}</h3>
                  <p className="text-sm text-blue-700 mt-1">Premium learning experience</p>
                </div>
                
                <div className="space-y-3 border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Original Price:</span>
                    <span className="font-semibold">${originalAmount || 0}</span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between items-center text-green-600">
                      <span>Discount ({appliedCoupon.code}):</span>
                      <span className="font-semibold">
                        -{appliedCoupon.type === 'percentage' ? `${appliedCoupon.discount}%` : `$${appliedCoupon.discount}`}
                        {' '}(${calculateDiscount()})
                      </span>
                    </div>
                  )}
                  
                  <div className="border-t pt-3 flex justify-between items-center text-lg font-bold">
                    <span>Total Amount:</span>
                    <span className="text-blue-600">${getFinalAmount()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Coupon Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Percent className="h-5 w-5 text-green-600" />
                  <span>Apply Coupon Code</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!appliedCoupon ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="coupon">Enter Coupon Code</Label>
                      <div className="flex space-x-2 mt-2">
                        <Input
                          id="coupon"
                          placeholder="Enter your coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="flex-1"
                        />
                        <Button
                          onClick={applyCoupon}
                          disabled={isLoading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isLoading ? 'Applying...' : 'Apply'}
                        </Button>
                      </div>
                    </div>

                    {/* Available Coupons */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-800">Available Coupons:</h3>
                      {Object.values(validCoupons).map((coupon) => (
                        <div
                          key={coupon.code}
                          className="border border-dashed border-gray-300 p-3 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                          onClick={() => setCouponCode(coupon.code)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <Badge variant="secondary" className="mb-1">
                                {coupon.code}
                              </Badge>
                              <p className="text-sm text-gray-600">{coupon.description}</p>
                            </div>
                            <div className="text-right">
                              <span className="font-semibold text-green-600">
                                {coupon.type === 'percentage' ? `${coupon.discount}% OFF` : `$${coupon.discount} OFF`}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-green-800">Coupon Applied Successfully!</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge className="bg-green-600 mb-1">{appliedCoupon.code}</Badge>
                          <p className="text-sm text-green-700">{appliedCoupon.description}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={removeCoupon}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 text-blue-800">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">
                          You're saving ${calculateDiscount()} with this coupon!
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={proceedToPayment}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3"
                  size="lg"
                >
                  Proceed to Payment - ${getFinalAmount()}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default CouponCode;
