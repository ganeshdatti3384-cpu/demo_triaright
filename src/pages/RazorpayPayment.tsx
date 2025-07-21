
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

const RazorpayPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { streamName, fromStream, coursesCount } = location.state || {};
  const { toast } = useToast();

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

  const handlePaymentSuccess = (response: any) => {
    console.log('Payment successful:', response);
    toast({
      title: 'Payment Successful!',
      description: 'Your enrollment has been completed successfully.',
    });
    
    // Navigate to success page
    navigate('/payment-success', {
      state: {
        paymentId: response.razorpay_payment_id,
        orderId: response.razorpay_order_id,
        streamName,
        fromStream,
        type: 'pack365'
      }
    });
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
