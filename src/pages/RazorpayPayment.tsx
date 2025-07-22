
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Pack365PaymentInterface from '@/components/Pack365PaymentInterface';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const RazorpayPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { streamName, fromStream, coursesCount } = location.state || {};
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

 useEffect(() => {
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    try {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      console.log(parsedUser.id || "No user ID found");
    } catch (err) {
      console.error("Failed to parse user:", err);
    }
  } else {
    console.log("No user data found in localStorage");
  }
}, []);

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
    if (!streamName) {
      toast({
        title: 'Error',
        description: 'Invalid payment data. Please try again.',
        variant: 'destructive'
      });
      navigate('/pack365');
      return;
    }
    // Log payment data for debugging
    console.log('Payment data:', { streamName, fromStream, coursesCount });
  }, [navigate, streamName, toast, fromStream, coursesCount]);

  const handlePaymentSuccess = async (response: any) => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'User data is missing. Please login again.',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    const requestData = {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
      userID: user.id || "687a31ca106507a3da6b1837",
    };

    console.log("Verifying with data:", requestData);

    try {
      const verifyResponse = await fetch('/api/pack365/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestData),
      });

      const result = await verifyResponse.json();
      console.log(result);

      if (verifyResponse.ok) {
        toast({
          title: 'Payment Successful!',
          description: 'You have been enrolled successfully.',
        });
        navigate('/payment-success', {
          state: {
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            streamName,
            fromStream,
            type: 'pack365',
          },
        });
      } else {
        throw new Error(result.message || 'Payment verification failed');
      }
    } catch (err: any) {
      console.error('Payment verification error:', err);
      toast({
        title: 'Payment Failed',
        description: err.message || 'Could not verify payment.',
        variant: 'destructive',
      });
      navigate('/payment-failed', {
        state: {
          error: err.message || 'Verification failed',
          streamName,
          type: 'pack365',
        },
      });
    }
  };

  const handlePaymentError = (error: any) => {
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
        streamName,
        type: 'pack365'
      }
    });
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
          <Pack365PaymentInterface
            streamName={streamName}
            coursesCount={coursesCount || 3}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
            onBack={handleBack}
          />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RazorpayPayment;
