import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { CreditCard, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// IMPROVED: Add an interface for the location state for better type safety.
interface LocationState {
  streamName?: string;
  courseId?: string;
  courseName?: string;
  fromStream?: boolean;
  fromCourse?: boolean;
  streamPrice?: number;
  coursesCount?: number;
  coursePrice?: number;
}

const PaymentSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    streamName, 
    courseId, 
    courseName, 
    fromStream, 
    fromCourse, 
    streamPrice, 
    coursesCount, 
    coursePrice 
  }: LocationState = location.state || {};

  const handleRazorpayPayment = () => {
    navigate('/razorpay-payment', { 
      state: { streamName, courseId, courseName, fromStream, fromCourse, streamPrice, coursesCount, coursePrice } 
    });
  };

  // REMOVED: The handleCouponCode function is no longer needed.

  const basePrice = fromCourse ? (coursePrice || 0) : (streamPrice || 0);
  const gst = Math.round(basePrice * 0.18);
  const totalPrice = basePrice + gst;
  const purchaseTitle = fromStream ? `${streamName} Bundle` : courseName;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Complete Your Enrollment
            </h1>
            <p className="text-gray-600 mt-2">
              You're one step away from starting your journey.
            </p>
          </div>

          {/* IMPROVED: A single, unified payment card */}
          <Card 
            className="shadow-lg border-gray-200 w-full"
          >
            <CardHeader className="bg-gray-50/50 p-6">
              <CardTitle className="text-xl text-gray-900">Order Summary</CardTitle>
              <CardDescription>{purchaseTitle}</CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              <div className="space-y-4 text-gray-700">
                <div className="flex justify-between">
                  <span>Base Price:</span>
                  <span className="font-medium">₹{basePrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%):</span>
                  <span className="font-medium">₹{gst.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between font-bold text-lg text-gray-900">
                    <span>Total Amount:</span>
                    <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 p-6 bg-gray-50/50">
              <Button 
                onClick={handleRazorpayPayment} 
                className="w-full text-lg py-6 bg-blue-600 hover:bg-blue-700"
              >
                <CreditCard className="mr-2 h-5 w-5" />
                Proceed to Payment
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </CardFooter>
          </Card>

        </div>
      </div>
      <Footer />
    </>
  );
};

export default PaymentSelection;