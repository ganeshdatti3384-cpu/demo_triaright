
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Smartphone, 
  QrCode, 
  Wallet,
  Shield,
  Clock,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

interface PaymentGatewayProps {
  amount: number;
  courseName: string;
  onPaymentComplete: (success: boolean) => void;
  onBack: () => void;
}

const PaymentGateway = ({ amount, courseName, onPaymentComplete, onBack }: PaymentGatewayProps) => {
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: '',
    upiId: '',
    bankAccount: '',
    ifscCode: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const processPayment = () => {
    setIsProcessing(true);
    
    // Simulate payment processing time
    setTimeout(() => {
      const isSuccess = Math.random() > 0.2; // 80% success rate
      setIsProcessing(false);
      onPaymentComplete(isSuccess);
    }, 3000);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  return (
    <><Navbar onOpenAuth={function (type: 'login' | 'register', userType: string): void {
      throw new Error('Function not implemented.');
    } } user={{
      role: '',
      name: ''
    }} onLogout={function (): void {
      throw new Error('Function not implemented.');
    } } />
    <div className="max-w-2xl mx-auto p-6">
      <Button
        variant="outline"
        onClick={onBack}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Course Details
      </Button>

      <Card className="shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardTitle className="text-2xl flex items-center">
            <Shield className="h-6 w-6 mr-2" />
            Secure Payment Gateway
          </CardTitle>
          <div className="mt-4 bg-white/10 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">{courseName}</span>
              <Badge className="bg-white text-blue-600">Pack365</Badge>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-lg">Total Amount</span>
              <span className="text-2xl font-bold">₹{amount}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs value={selectedMethod} onValueChange={setSelectedMethod}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="card" className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Card</span>
              </TabsTrigger>
              <TabsTrigger value="upi" className="flex items-center space-x-2">
                <Smartphone className="h-4 w-4" />
                <span className="hidden sm:inline">UPI</span>
              </TabsTrigger>
              <TabsTrigger value="qr" className="flex items-center space-x-2">
                <QrCode className="h-4 w-4" />
                <span className="hidden sm:inline">QR</span>
              </TabsTrigger>
              <TabsTrigger value="wallet" className="flex items-center space-x-2">
                <Wallet className="h-4 w-4" />
                <span className="hidden sm:inline">Wallet</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="card" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                    maxLength={19} />
                </div>
                <div>
                  <Label htmlFor="cardHolder">Card Holder Name</Label>
                  <Input
                    id="cardHolder"
                    placeholder="John Doe"
                    value={formData.cardHolder}
                    onChange={(e) => handleInputChange('cardHolder', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      value={formData.expiryDate}
                      onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                      maxLength={5} />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={formData.cvv}
                      onChange={(e) => handleInputChange('cvv', e.target.value)}
                      maxLength={4} />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="upi" className="space-y-4">
              <div className="text-center mb-4">
                <Smartphone className="h-16 w-16 mx-auto text-blue-600 mb-2" />
                <h3 className="text-lg font-semibold">UPI Payment</h3>
                <p className="text-gray-600">Pay using your UPI ID</p>
              </div>
              <div>
                <Label htmlFor="upiId">UPI ID</Label>
                <Input
                  id="upiId"
                  placeholder="yourname@paytm"
                  value={formData.upiId}
                  onChange={(e) => handleInputChange('upiId', e.target.value)} />
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-blue-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">Instant payment confirmation</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="qr" className="space-y-4">
              <div className="text-center">
                <QrCode className="h-16 w-16 mx-auto text-purple-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">QR Code Payment</h3>
                <div className="bg-white border-2 border-gray-200 p-8 rounded-lg inline-block">
                  <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded-lg">
                    <div className="text-center">
                      <QrCode className="h-16 w-16 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Scan QR Code</p>
                      <p className="text-xs text-gray-500">with any UPI app</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  Scan using Google Pay, PhonePe, Paytm, or any UPI app
                </p>
              </div>
            </TabsContent>

            <TabsContent value="wallet" className="space-y-4">
              <div className="text-center mb-4">
                <Wallet className="h-16 w-16 mx-auto text-green-600 mb-2" />
                <h3 className="text-lg font-semibold">Digital Wallet</h3>
                <p className="text-gray-600">Choose your preferred wallet</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {['Paytm', 'PhonePe', 'Google Pay', 'Amazon Pay'].map((wallet) => (
                  <Button
                    key={wallet}
                    variant="outline"
                    className="h-16 flex flex-col items-center justify-center"
                  >
                    <Wallet className="h-6 w-6 mb-1" />
                    <span className="text-sm">{wallet}</span>
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Course Price:</span>
              <span>₹{amount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Processing Fee:</span>
              <span>₹0</span>
            </div>
            <div className="border-t pt-2 flex items-center justify-between font-semibold">
              <span>Total Amount:</span>
              <span className="text-xl text-blue-600">₹{amount}</span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <Shield className="h-4 w-4" />
              <span>256-bit SSL Encrypted Payment</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <Clock className="h-4 w-4" />
              <span>Instant course access after payment</span>
            </div>
          </div>

          <Button
            onClick={processPayment}
            disabled={isProcessing}
            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6"
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing Payment...</span>
              </div>
            ) : (
              `Pay ₹${amount} Securely`
            )}
          </Button>

          <div className="text-xs text-gray-500 text-center mt-4">
            By proceeding, you agree to our Terms of Service and Privacy Policy
          </div>
        </CardContent>
      </Card>
    </div>
    <Footer />
    </>
  );
};

export default PaymentGateway;
