import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CreditCard } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const RazorpayPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { streamName, courseId, courseName, fromStream, fromCourse } = location.state || {};
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      // Simulate 80% success rate
      const isSuccess = Math.random() > 0.2;
      
      if (isSuccess) {
        navigate('/payment-success', {
          state: { streamName, courseId, courseName, fromStream, fromCourse }
        });
      } else {
        navigate('/payment-failed', {
          state: { streamName, courseId, courseName, fromStream, fromCourse }
        });
      }
      setIsProcessing(false);
    }, 3000);
  };

  const amount = fromStream ? 999 : 499; // Stream bundle vs individual course

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mb-6 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">Payment Details</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold text-lg mb-2">
                    {fromStream ? `${streamName} Bundle` : courseName}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {fromStream 
                      ? `Access to all courses in ${streamName} stream`
                      : 'Individual course access'
                    }
                  </p>
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total Amount:</span>
                    <span>₹{amount}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Payment Methods Available:</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 border rounded-lg text-center">
                      <div className="font-medium">Credit/Debit Card</div>
                    </div>
                    <div className="p-3 border rounded-lg text-center">
                      <div className="font-medium">UPI</div>
                    </div>
                    <div className="p-3 border rounded-lg text-center">
                      <div className="font-medium">Net Banking</div>
                    </div>
                    <div className="p-3 border rounded-lg text-center">
                      <div className="font-medium">Wallet</div>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing Payment...' : `Pay ₹${amount}`}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Powered by Razorpay • Secure Payment Gateway
                </p>
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