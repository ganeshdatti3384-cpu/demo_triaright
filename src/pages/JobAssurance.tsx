
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Target, Users, BookOpen, TrendingUp, Award, Clock } from 'lucide-react';

const JobAssurance = () => {
  const navigate = useNavigate();
  const [authModal, setAuthModal] = useState({ isOpen: false, type: 'login' as 'login' | 'register', userType: 'student' });

  const whyChooseUs = [
    {
      icon: Target,
      title: "Tailored Career Path (IT & Non-IT)",
      description: "Customized learning paths based on your career goals and industry requirements"
    },
    {
      icon: Users,
      title: "One-on-One Mentorship",
      description: "Personal guidance from industry experts throughout your journey"
    },
    {
      icon: BookOpen,
      title: "Industry-Aligned Curriculum",
      description: "Updated course content that matches current industry standards"
    },
    {
      icon: TrendingUp,
      title: "Placement-Focused Approach",
      description: "Every aspect of training is designed to maximize your employability"
    },
    {
      icon: Award,
      title: "Job or Refund Guarantee",
      description: "100% money-back guarantee if you don't get placed within the program timeline"
    }
  ];

  const includedServices = [
    "Skill Assessment",
    "Resume & LinkedIn Optimization",
    "Communication & Soft Skills Training",
    "Domain-Specific Technical Training",
    "Weekly Progress Reviews",
    "Mock Interviews",
    "Direct Interview Opportunities"
  ];

  const handleApplyNow = () => {
    navigate('/register');
  };

  const handleOpenAuth = (type: 'login' | 'register', userType: string) => {
    setAuthModal({ isOpen: true, type, userType });
  };

  const handleCloseAuth = () => {
    setAuthModal({ ...authModal, isOpen: false });
  };

  const handleAuthSuccess = () => {
    setAuthModal({ ...authModal, isOpen: false });
    // Handle successful authentication
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onOpenAuth={handleOpenAuth} />
      
      {/* Hero Section */}
      <div className="bg-brand-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">Triaright Job Assurance Program</h1>
            <p className="text-2xl mb-8">
              Personalized Training + Guaranteed Placement — Or 100% Refund!
            </p>
            <div className="inline-flex items-center bg-white/20 rounded-full px-6 py-3 text-lg">
              🔥 Limited Slots Available – Apply Now!
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
            <p className="text-lg text-gray-600">Experience the difference with our comprehensive approach</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyChooseUs.map((item, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <item.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Program Details Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Program Details</h2>
            <p className="text-lg text-gray-600">Choose the track that best fits your career goals</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* IT Track */}
            <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
              <CardHeader className="bg-blue-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl text-brand-primary">IT Track</CardTitle>
                  <Badge className="bg-brand-primary">Popular</Badge>
                </div>
                <div className="flex items-center space-x-2 mt-4">
                  <Clock className="h-5 w-5 text-brand-primary" />
                  <span className="text-brand-primary font-medium">1 Year Program</span>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-brand-primary mb-2">₹30,000</div>
                  <p className="text-gray-600">Includes training & placement support</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Full-stack development training</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Modern frameworks & technologies</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Real-world project experience</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Industry certifications</span>
                  </li>
                </ul>
                <Button 
                  onClick={handleApplyNow}
                  className="w-full bg-brand-primary hover:bg-blue-700"
                >
                  Apply for IT Track
                </Button>
              </CardContent>
            </Card>

            {/* Non-IT Track */}
            <Card className="border-2 border-orange-200 hover:border-orange-400 transition-colors">
              <CardHeader className="bg-orange-50">
                <CardTitle className="text-2xl text-brand-secondary">Non-IT Track</CardTitle>
                <div className="flex items-center space-x-2 mt-4">
                  <Clock className="h-5 w-5 text-brand-secondary" />
                  <span className="text-brand-secondary font-medium">100-Day Program</span>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-brand-secondary mb-2">₹10,000</div>
                  <p className="text-gray-600">Includes targeted training & job assistance</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Business skills development</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Communication & leadership training</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Industry-specific knowledge</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Professional networking</span>
                  </li>
                </ul>
                <Button 
                  onClick={handleApplyNow}
                  className="w-full bg-brand-secondary hover:bg-orange-700"
                >
                  Apply for Non-IT Track
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Included Services Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Included Services</h2>
            <p className="text-lg text-gray-600">Everything you need for successful job placement</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {includedServices.map((service, index) => (
              <div key={index} className="flex items-center space-x-3 bg-gray-50 rounded-lg p-4">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 font-medium">{service}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-brand-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Career?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of successful professionals who started their journey with us
          </p>
          <Button 
            onClick={handleApplyNow}
            size="lg"
            className="bg-white text-brand-primary hover:bg-gray-100 font-semibold px-8 py-4 text-lg"
          >
            Apply Now - Limited Seats Available!
          </Button>
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

export default JobAssurance;
