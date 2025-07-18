import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CreditCard, QrCode, Wallet2, Lock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const RazorpayPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { streamName, courseId, courseName, fromStream, fromCourse } = location.state || {};
  const [isProcessing, setIsProcessing] = useState(false);
  const [method, setMethod] = useState<'card' | 'upi' | 'qr'>('card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    name: '',
    upi: '',
  });

  const handlePayment = async () => {
    setIsProcessing(true);
    setTimeout(() => {
      const isSuccess = Math.random() > 0.2;
      navigate(isSuccess ? '/payment-success' : '/payment-failed', {
        state: { streamName, courseId, courseName, fromStream, fromCourse }
      });
      setIsProcessing(false);
    }, 3000);
  };

  const amount = fromStream ? 365 : 499;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-tr from-blue-50 to-purple-100 py-10 px-4">
        <div className="max-w-xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 text-gray-700 hover:text-black flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>

          <Card className="bg-white/80 backdrop-blur shadow-xl rounded-2xl">
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto w-fit p-4 bg-blue-100 rounded-full shadow">
                <CreditCard className="text-blue-600 w-7 h-7" />
              </div>
              <CardTitle className="text-2xl font-semibold">Secure Payment</CardTitle>
              <p className="text-sm text-gray-500">Complete your payment below</p>
            </CardHeader>

            <CardContent className="space-y-6 px-6 pb-6">
              <div className="rounded-lg p-4 border bg-white shadow-sm">
                <h3 className="font-semibold text-lg text-gray-800">
                  {fromStream ? `${streamName} Bundle` : courseName}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {fromStream ? `Access all ${streamName} courses` : 'Single course access'}
                </p>
                <div className="flex justify-between items-center font-medium text-base">
                  <span>Total</span>
                  <span className="text-blue-600 font-semibold">₹{amount}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Select Payment Method</h4>
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => setMethod('card')} className={`p-3 border rounded-lg text-sm ${method === 'card' ? 'bg-blue-100 font-semibold' : 'bg-gray-50'}`}>
                    <CreditCard className="w-4 h-4 mb-1 mx-auto" />
                    Card
                  </button>
                  <button onClick={() => setMethod('upi')} className={`p-3 border rounded-lg text-sm ${method === 'upi' ? 'bg-blue-100 font-semibold' : 'bg-gray-50'}`}>
                    <Wallet2 className="w-4 h-4 mb-1 mx-auto" />
                    UPI
                  </button>
                  <button onClick={() => setMethod('qr')} className={`p-3 border rounded-lg text-sm ${method === 'qr' ? 'bg-blue-100 font-semibold' : 'bg-gray-50'}`}>
                    <QrCode className="w-4 h-4 mb-1 mx-auto" />
                    QR Code
                  </button>
                </div>
              </div>

              {method === 'card' && (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Card Number"
                    maxLength={16}
                    className="w-full p-2 border rounded-md text-sm"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                  />
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-1/2 p-2 border rounded-md text-sm"
                      value={formData.expiry}
                      onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                    />
                    <input
                      type="password"
                      placeholder="CVV"
                      maxLength={3}
                      className="w-1/2 p-2 border rounded-md text-sm"
                      value={formData.cvv}
                      onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Name on Card"
                    className="w-full p-2 border rounded-md text-sm"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              )}

              {method === 'upi' && (
                <input
                  type="text"
                  placeholder="Enter your UPI ID"
                  className="w-full p-2 border rounded-md text-sm"
                  value={formData.upi}
                  onChange={(e) => setFormData({ ...formData, upi: e.target.value })}
                />
              )}

              {method === 'qr' && (
                <div className="flex flex-col items-center gap-2">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=your@upi&pn=Your%20Name&am=999"
                    alt="QR Code"
                    className="w-40 h-40"
                  />
                  <p className="text-xs text-gray-500">Scan with your UPI app</p>
                </div>
              )}

              <Button
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing Payment...' : `Pay ₹${amount}`}
              </Button>

              <div className="flex items-center justify-center mt-2 text-xs text-gray-500 gap-1">
                <Lock className="w-3 h-3" />
                100% secure payment • Powered by Razorpay
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RazorpayPayment;
