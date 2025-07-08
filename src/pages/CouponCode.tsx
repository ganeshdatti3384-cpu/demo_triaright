import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Gift, Check, X } from 'lucide-react';

// Define valid coupons
const validCoupons = [
  { code: 'WELCOME20', discount: 20, description: '20% off on first purchase' },
  { code: 'STUDENT50', discount: 50, description: '50% off for students' },
  { code: 'EARLY25', discount: 25, description: '25% off early bird special' },
];

const CouponCode = () => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a coupon code',
        variant: 'destructive',
      });
      return;
    }

    setIsValidating(true);
    
    // Simulate API call
    setTimeout(() => {
      const coupon = validCoupons.find(c => c.code.toLowerCase() === couponCode.toLowerCase());
      
      if (coupon) {
        setAppliedCoupon(coupon);
        toast({
          title: 'Success!',
          description: `Coupon "${coupon.code}" applied successfully!`,
        });
      } else {
        toast({
          title: 'Invalid Coupon',
          description: 'The coupon code you entered is not valid or has expired.',
          variant: 'destructive',
        });
      }
      setIsValidating(false);
    }, 1000);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateCoupon();
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-6 flex flex-col justify-center sm:py-12">
        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-purple-400 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
          <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
            <div className="max-w-md mx-auto">
              <div>
                <h1 className="text-2xl font-semibold text-center">Apply Coupon Code</h1>
              </div>
              <div className="divide-y divide-gray-200">
                <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                  {appliedCoupon ? (
                    <div className="rounded-md bg-green-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <Check className="h-5 w-5 text-green-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-green-800">
                            Coupon Applied!
                          </h3>
                          <div className="mt-2 text-sm text-green-700">
                            <p>
                              {appliedCoupon.description} (Discount: {appliedCoupon.discount}%)
                            </p>
                          </div>
                          <div className="mt-2">
                            <Button size="sm" variant="destructive" onClick={removeCoupon}>
                              Remove Coupon
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="couponCode">Coupon Code</Label>
                        <Input
                          id="couponCode"
                          type="text"
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="mt-1 block w-full"
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isValidating}>
                        {isValidating ? 'Validating...' : 'Apply Coupon'}
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CouponCode;
