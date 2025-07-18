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
  const { streamName, courseId, courseName, fromStream, fromCourse } = location.state || {};

  const handleRazorpayPayment = () => {
    navigate('/razorpay-payment', { 
      state: { streamName, courseId, courseName, fromStream, fromCourse } 
    });
  };

  const handleCouponCode = () => {
    navigate('/Coupon-code', { 
      state: { streamName, courseId, courseName, fromStream, fromCourse } 
    });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Choose Payment Method
              </h1>
              <p className="text-gray-600">
                {fromStream 
                  ? `Enroll in ${streamName} Bundle` 
                  : `Enroll in ${courseName}`
                }
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Razorpay Payment Option */}
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleRazorpayPayment}>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                    <CreditCard className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">Pay with Razorpay</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-4">
                    Secure payment using credit card, debit card, UPI, or net banking
                  </p>
                  <Button className="w-full" onClick={handleRazorpayPayment}>
                    Proceed to Payment
                  </Button>
                </CardContent>
              </Card>

              {/* Coupon Code Option */}
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleCouponCode}>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                    <Gift className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">Have a Coupon?</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-4">
                    Enter your coupon code to get instant access to the course
                  </p>
                  <Button variant="outline" className="w-full" onClick={handleCouponCode}>
                    Use Coupon Code
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-8">
              <Button 
                variant="ghost" 
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-900"
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