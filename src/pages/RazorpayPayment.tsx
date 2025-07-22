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
  const [isUserLoaded, setIsUserLoaded] = useState(false);
  const { toast } = useToast();

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = () => {
      const savedUser = localStorage.getItem('currentUser');
      const token = localStorage.getItem('token');
      
      console.log('Token exists:', !!token);
      console.log('SavedUser exists:', !!savedUser);
      
      if (!token) {
        console.log('No token found, redirecting to login');
        toast({
          title: 'Authentication Required',
          description: 'Please login to continue with payment',
          variant: 'destructive'
        });
        navigate('/login');
        return;
      }

      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          console.log('Parsed user data:', parsedUser);
          console.log('User ID:', parsedUser._id || parsedUser.id);
          
          setUser(parsedUser);
          setIsUserLoaded(true);
        } catch (err) {
          console.error("Failed to parse user:", err);
          toast({
            title: 'Error',
            description: 'User data is corrupted. Please login again.',
            variant: 'destructive'
          });
          // Clear corrupted data and redirect
          localStorage.removeItem('currentUser');
          navigate('/login');
        }
      } else {
        console.log("No user data found in localStorage");
        toast({
          title: 'Authentication Required',
          description: 'Please login to continue with payment',
          variant: 'destructive'
        });
        navigate('/login');
      }
    };

    loadUserData();
  }, [navigate, toast]);

  // Validate required payment data
  useEffect(() => {
    if (isUserLoaded) {
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
      console.log('User loaded:', user);
    }
  }, [isUserLoaded, streamName, toast, fromStream, coursesCount, user, navigate]);

  // Updated handlePaymentSuccess function in RazorpayPayment component
const handlePaymentSuccess = async (response: any) => {
  console.log('Payment success handler called in RazorpayPayment');
  console.log('Payment response received:', response);
  
  // Prepare verification request data
  const requestData = {
    razorpay_order_id: response.razorpay_order_id,
    razorpay_payment_id: response.razorpay_payment_id,
    razorpay_signature: response.razorpay_signature,
  };

  console.log("Sending verification request with data:", requestData);

  try {
    // Call your verification API
    const verifyResponse = await fetch('/api/pack365/payment/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const result = await verifyResponse.json();
    console.log('Verification API response:', result);
    console.log('Verification status:', verifyResponse.ok);
    console.log('Response status code:', verifyResponse.status);

    if (verifyResponse.ok ||  result.success) {
      console.log('Payment verification successful, navigating to success page');
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
          enrollmentDetails: result // Pass the enrollment details
        },
      });
    } else {
      console.log('Payment verification failed:', result);
      throw new Error(result.message || 'Payment verification failed');
    }
  } catch (err: any) {
    console.error('Payment verification error:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      response: err.response
    });
    
    toast({
      title: 'Payment Verification Failed',
      description: err.message || 'Could not verify payment. Please contact support.',
      variant: 'destructive',
    });
    
    navigate('/payment-failed', {
      state: {
        error: err.message || 'Verification failed',
        streamName,
        type: 'pack365',
        paymentId: response.razorpay_payment_id,
        orderId: response.razorpay_order_id
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

  // Show loading while user data is being loaded
  if (!isUserLoaded) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h2>
              <p className="text-gray-600">Please wait while we prepare your payment.</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

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