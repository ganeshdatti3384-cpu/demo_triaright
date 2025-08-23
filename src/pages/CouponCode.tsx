/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Gift, Check } from 'lucide-react';
import { pack365Api } from '@/services/api';
import { useLocation, useNavigate } from 'react-router-dom';

const CouponCode = () => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();
  const { user,token } = useAuth();
  const navigate = useNavigate()

  const location = useLocation();
  const { courseId, courseName, streamName, fromStream, fromCourse } = location.state || {};

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

    try {
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await pack365Api.enrollWithCode(couponCode, token);

      if (response?.success) {
        if (fromStream && streamName) {
          setAppliedCoupon({ 
            courseName: `${streamName} Bundle`, 
            description: 'Stream access granted' 
          });

          toast({
            title: 'Successfully Enrolled!',
            description: `You now have access to all ${streamName} courses`,
          });
          
          // Navigate back to pack365 with success state to show courses
          setTimeout(() => {
            navigate(`/${user.role}?tab=pack365&stream=${streamName}&enrolled=true`);
          }, 2000);
        } else if (fromCourse && response?.courseDetails) {
          setAppliedCoupon(response.courseDetails);

          toast({
            title: 'Successfully Enrolled!',
            description: `You are now enrolled in the course: "${response.courseDetails.courseName}"`,
          });
        }
      } else {
        throw new Error(response?.message || 'Invalid coupon code');
      }
    } catch (error) {
      toast({
        title: 'Invalid Coupon',
        description: 'The coupon code you entered is not valid or has expired.',
        variant: 'destructive',
      });
    } finally {
      setIsValidating(false);
    }
  };


  const removeCoupon = () => {
    navigate(`/${user.role}`)
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
                <div className="py-8 space-y-4 text-gray-700">
                  {appliedCoupon ? (
                    <div className="rounded-md bg-green-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <Check className="h-5 w-5 text-green-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-green-800">Coupon Applied!</h3>
                          <div className="mt-2 text-sm text-green-700">
                            <p>
                              {appliedCoupon.description || 'Valid enrollment code'} (Course:{' '}
                              {appliedCoupon.courseName})
                            </p>
                          </div>
                           <div className="mt-4 flex space-x-2">
                             <Button size="sm" variant="destructive" onClick={removeCoupon}>
                               Go to Dashboard
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