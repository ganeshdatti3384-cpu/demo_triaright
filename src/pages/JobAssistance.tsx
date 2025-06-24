
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Zap, Bell, Target, CreditCard, Smartphone } from 'lucide-react';

const JobAssistance = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: Bell,
      title: "Real-time updates on job opportunities",
      description: "Get instant notifications about new job openings that match your profile"
    },
    {
      icon: Target,
      title: "Customized preparation guidance",
      description: "Personalized interview preparation and skill development recommendations"
    },
    {
      icon: Zap,
      title: "Insider tips to stand out from competition",
      description: "Learn industry secrets and strategies to make your application stand out"
    },
    {
      icon: Bell,
      title: "Direct notifications about openings",
      description: "Be the first to know about exclusive job opportunities from our partner companies"
    }
  ];

  const paymentMethods = [
    {
      name: "UPI",
      icon: "📱",
      description: "Pay securely using any UPI app"
    },
    {
      name: "Card",
      icon: "💳",
      description: "Credit/Debit card payments"
    },
    {
      name: "Razorpay",
      icon: "💰",
      description: "Multiple payment options via Razorpay"
    }
  ];

  const handleGetStarted = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">Advance Your Career with Expert Guidance</h1>
            <p className="text-2xl mb-8 text-green-100">
              🚀 Land Your Dream Job Faster with Triaright's Professional Job Assistance
            </p>
            
            <div className="bg-white/20 rounded-2xl p-8 max-w-2xl mx-auto">
              <div className="text-6xl font-bold mb-4">₹500 Only</div>
              <div className="text-2xl mb-4">Lifetime Access</div>
              <p className="text-lg text-green-100">One-time investment for lifetime career support!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Benefits Include</h2>
            <p className="text-lg text-gray-600">Get comprehensive support for your job search journey</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <benefit.icon className="h-6 w-6 text-green-600" />
                    </div>
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Features Highlight */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What You Get</h2>
            <p className="text-lg text-gray-600">Comprehensive career support that works</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Bell className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Instant Job Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Never miss an opportunity with real-time notifications tailored to your skills and preferences.</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>Personalized Guidance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Get customized advice and preparation strategies based on your career goals and market trends.</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Zap className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>Competitive Edge</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Access insider tips and industry insights that give you an advantage over other candidates.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Options Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Payment Options</h2>
            <p className="text-lg text-gray-600">Choose your preferred payment method</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {paymentMethods.map((method, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-4xl mb-2">{method.icon}</div>
                  <CardTitle className="text-xl">{method.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{method.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Value Proposition */}
      <div className="py-16 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why This Investment Makes Sense</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">₹500</div>
                <div className="text-sm text-gray-600">One-time payment</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">Lifetime</div>
                <div className="text-sm text-gray-600">No recurring fees</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">∞</div>
                <div className="text-sm text-gray-600">Unlimited opportunities</div>
              </div>
            </div>

            <p className="text-lg text-gray-700 mb-8">
              Invest once and gain lifetime access to career opportunities that could potentially increase your salary by lakhs. 
              The average salary increase our users experience pays for this investment within the first month!
            </p>

            <Button 
              onClick={handleGetStarted}
              size="lg"
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 font-semibold px-8 py-4 text-lg"
            >
              Get Started Now - ₹500 Only!
            </Button>
          </div>
        </div>
      </div>

      {/* Testimonial/Trust Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Trusted by Thousands</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">5000+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">85%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default JobAssistance;
