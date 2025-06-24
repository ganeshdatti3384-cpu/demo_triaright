
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import { Users, FileText, Search, MessageCircle, Star, CheckCircle, Target, TrendingUp } from 'lucide-react';

const JobAssistance = () => {
  const [authModal, setAuthModal] = useState({ isOpen: false, type: 'login' as 'login' | 'register', userType: 'student' });

  const handleOpenAuth = (type: 'login' | 'register', userType: string) => {
    setAuthModal({ isOpen: true, type, userType });
  };

  const handleCloseAuth = () => {
    setAuthModal({ isOpen: false, type: 'login', userType: 'student' });
  };

  const handleAuthSuccess = (userRole: string, userName: string) => {
    console.log(`User ${userName} logged in as ${userRole}`);
    setAuthModal({ isOpen: false, type: 'login', userType: 'student' });
  };

  const services = [
    {
      icon: FileText,
      title: 'Resume Review & Optimization',
      description: 'Get your resume reviewed by industry experts and optimized for ATS systems',
      features: ['Professional formatting', 'Keyword optimization', 'Industry-specific tips', 'ATS compatibility check'],
      color: 'from-blue-500 to-blue-700'
    },
    {
      icon: MessageCircle,
      title: 'Career Counseling',
      description: 'One-on-one sessions with career counselors to plan your career path',
      features: ['Personalized guidance', 'Industry insights', 'Skill gap analysis', 'Career roadmap'],
      color: 'from-purple-500 to-purple-700'
    },
    {
      icon: Search,
      title: 'Job Matching Services',
      description: 'We find and recommend jobs that match your skills and preferences',
      features: ['Curated job listings', 'Skill-based matching', 'Company research', 'Application tracking'],
      color: 'from-green-500 to-green-700'
    },
    {
      icon: Target,
      title: 'Interview Preparation',
      description: 'Mock interviews and preparation strategies to ace your job interviews',
      features: ['Mock interview sessions', 'Common questions prep', 'Behavioral interview tips', 'Technical prep'],
      color: 'from-orange-500 to-orange-700'
    }
  ];

  const successStories = [
    { name: 'Priya S.', role: 'Software Developer', company: 'TCS', package: '₹6.5 LPA' },
    { name: 'Rahul K.', role: 'Data Analyst', company: 'Infosys', package: '₹7.2 LPA' },
    { name: 'Sneha P.', role: 'Business Analyst', company: 'Wipro', package: '₹5.8 LPA' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar onOpenAuth={handleOpenAuth} />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Job Assistance Program</h1>
            <p className="text-xl max-w-3xl mx-auto mb-8">
              Get personalized career support with our lifetime job assistance program. ₹500 one-time fee for unlimited access.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3"
                onClick={() => handleOpenAuth('register', 'student')}
              >
                <Users className="h-5 w-5 mr-2" />
                Get Started - ₹500
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Job Assistance Services</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive support to help you land your dream job
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-xl transition-all">
              <div className={`bg-gradient-to-r ${service.color} p-6 text-white`}>
                <div className="flex items-center mb-4">
                  <service.icon className="h-8 w-8 mr-3" />
                  <h3 className="text-2xl font-bold">{service.title}</h3>
                </div>
                <p className="text-lg opacity-95">{service.description}</p>
              </div>
              <CardContent className="p-6">
                <h4 className="font-semibold text-lg mb-4">Includes:</h4>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Simple, Affordable Pricing</h2>
          <Card className="border-2 border-blue-200 max-w-md mx-auto">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardTitle className="text-3xl">Job Assistance</CardTitle>
              <CardDescription className="text-blue-100">Lifetime Access</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="text-6xl font-bold text-blue-600 mb-4">₹500</div>
              <div className="text-gray-600 mb-6">One-time payment</div>
              <ul className="space-y-3 text-left mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Resume review & optimization
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Career counseling sessions
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Job matching services
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Interview preparation
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Lifetime support
                </li>
              </ul>
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => handleOpenAuth('register', 'student')}
              >
                Get Job Assistance
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Stories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
          <p className="text-xl text-gray-600">See how our job assistance helped others</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {successStories.map((story, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{story.name}</h3>
                <p className="text-blue-600 font-medium">{story.role}</p>
                <p className="text-gray-600">{story.company}</p>
                <Badge className="mt-2 bg-green-100 text-green-800">{story.package}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-white/90">Simple steps to get your career on track</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Sign Up', desc: 'Register for job assistance program', icon: Users },
              { step: '2', title: 'Assessment', desc: 'Complete skills and career assessment', icon: Target },
              { step: '3', title: 'Get Support', desc: 'Receive personalized career guidance', icon: MessageCircle },
              { step: '4', title: 'Land Job', desc: 'Secure your dream position', icon: TrendingUp }
            ].map((item, index) => (
              <div key={index} className="text-center text-white">
                <div className="bg-white/20 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-white/90">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={authModal.isOpen}
        onClose={handleCloseAuth}
        type={authModal.type}
        userType={authModal.userType}
        onAuthSuccess={handleAuthSuccess}
      />
      <Footer />
    </div>
  );
};

export default JobAssistance;
