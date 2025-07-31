
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Gift } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PaymentSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { streamName, courseId, courseName, fromStream, fromCourse, streamPrice, coursesCount } = location.state || {};

  const handleRazorpayPayment = () => {
    navigate('/razorpay-payment', { 
      state: { streamName, courseId, courseName, fromStream, fromCourse, streamPrice, coursesCount } 
    });
  };

  const handleCouponCode = () => {
    navigate('/Coupon-code', { 
      state: { streamName, courseId, courseName, fromStream, fromCourse, streamPrice, coursesCount } 
    });
  };

  // Calculate GST for display
  const basePrice = streamPrice || 365;
  const gst = Math.round(basePrice * 0.18);
  const totalPrice = basePrice + gst;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
                Select Your Payment Option
              </h1>
              <p className="text-lg text-gray-700 mb-2">
                {fromStream 
                  ? `You're enrolling in the ${streamName} Bundle` 
                  : `You're enrolling in ${courseName}`}
              </p>
              {fromStream && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 max-w-md mx-auto">
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Base Price:</span>
                      <span>₹{basePrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (18%):</span>
                      <span>₹{gst}</span>
                    </div>
                    <div className="border-t border-blue-300 pt-1 mt-2">
                      <div className="flex justify-between font-semibold text-blue-700">
                        <span>Total Amount:</span>
                        <span>₹{totalPrice}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8">
              {/* Razorpay Option */}
              <Card 
                onClick={handleRazorpayPayment}
                className="cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] border border-blue-200"
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-4 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 text-white shadow-md">
                    <CreditCard className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-2xl font-semibold text-blue-700">Pay with Razorpay</CardTitle>
                </CardHeader>
                <CardContent className="text-center px-6 pb-6">
                  <p className="text-gray-600 mb-4">
                    Use UPI, card, or net banking with secure Razorpay integration.
                  </p>
                  {fromStream && (
                    <div className="text-lg font-semibold text-blue-600 mb-4">
                      Total: ₹{totalPrice}
                    </div>
                  )}
                  <Button className="w-full text-lg py-2">Proceed to Payment</Button>
                </CardContent>
              </Card>

              {/* Coupon Option */}
              <Card 
                onClick={handleCouponCode}
                className="cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] border border-green-200"
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-4 rounded-full bg-gradient-to-tr from-green-400 to-green-600 text-white shadow-md">
                    <Gift className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-2xl font-semibold text-green-700">Have a Coupon?</CardTitle>
                </CardHeader>
                <CardContent className="text-center px-6 pb-6">
                  <p className="text-gray-600 mb-6">
                    Enter a valid coupon code for instant enrollment.
                  </p>
                  <Button variant="outline" className="w-full text-lg py-2 border-green-500 text-green-700 hover:bg-green-100">
                    Use Coupon Code
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-10">
              <Button 
                variant="ghost" 
                onClick={() => navigate(-1)}
                className="text-gray-500 hover:text-gray-900 text-base"
              >
                ← Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PaymentSelection;
