
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import { Shield, CheckCircle, Users, TrendingUp, BookOpen, Award, Star, Clock } from 'lucide-react';

const JobAssurance = () => {
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

  const programs = [
    {
      id: 1,
      track: 'IT Track',
      duration: '1 Year Program',
      fee: '₹30,000',
      description: 'Comprehensive training for IT professionals with guaranteed placement',
      features: [
        'Full Stack Development Training',
        'Data Structures & Algorithms',
        'System Design Concepts',
        'Mock Interviews & Resume Building',
        'Industry Project Experience',
        '100% Placement Guarantee'
      ],
      color: 'from-blue-600 to-blue-800',
      icon: BookOpen
    },
    {
      id: 2,
      track: 'Non-IT Track',
      duration: '100-Day Program',
      fee: '₹10,000',
      description: 'Focused training for non-technical roles with job assistance',
      features: [
        'Business Communication Skills',
        'Industry-Specific Training',
        'Soft Skills Development',
        'Interview Preparation',
        'Job Search Strategies',
        'Placement Support'
      ],
      color: 'from-green-600 to-green-800',
      icon: Users
    }
  ];

  const successStats = [
    { label: 'Students Placed', value: '2,500+', icon: Users },
    { label: 'Partner Companies', value: '150+', icon: Shield },
    { label: 'Average Package', value: '₹6.5 LPA', icon: TrendingUp },
    { label: 'Success Rate', value: '95%', icon: Star }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar onOpenAuth={handleOpenAuth} />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Job Assurance Program</h1>
            <p className="text-xl max-w-3xl mx-auto mb-8">
              Get guaranteed placement with our comprehensive training programs. Choose from IT or Non-IT tracks designed to secure your career.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3"
                onClick={() => handleOpenAuth('register', 'student')}
              >
                <Shield className="h-5 w-5 mr-2" />
                Start Your Journey
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

      {/* Success Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {successStats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <stat.icon className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Programs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Track</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the program that best fits your career goals and get guaranteed placement
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {programs.map((program) => (
            <Card key={program.id} className="overflow-hidden border-2 hover:shadow-xl transition-all">
              <div className={`bg-gradient-to-r ${program.color} p-6 text-white`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <program.icon className="h-8 w-8 mr-3" />
                    <div>
                      <h3 className="text-2xl font-bold">{program.track}</h3>
                      <p className="opacity-90">{program.duration}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{program.fee}</div>
                    <div className="text-sm opacity-90">One-time fee</div>
                  </div>
                </div>
                <p className="text-lg opacity-95">{program.description}</p>
              </div>

              <CardContent className="p-6">
                <h4 className="font-semibold text-lg mb-4">What You'll Get:</h4>
                <ul className="space-y-3">
                  {program.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full mt-6 bg-gradient-to-r ${program.color} hover:opacity-90 text-white`}
                  onClick={() => handleOpenAuth('register', 'student')}
                >
                  Enroll in {program.track}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How Our Job Assurance Works</h2>
            <p className="text-xl text-gray-600">A proven 4-step process to guarantee your career success</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Skill Assessment', desc: 'We evaluate your current skills and career goals', color: 'bg-blue-500' },
              { step: '2', title: 'Intensive Training', desc: 'Comprehensive training with industry experts', color: 'bg-purple-500' },
              { step: '3', title: 'Mock Interviews', desc: 'Practice with real interview scenarios', color: 'bg-green-500' },
              { step: '4', title: 'Guaranteed Placement', desc: 'Get placed in top companies with assured jobs', color: 'bg-orange-500' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className={`${item.color} rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center`}>
                  <span className="text-white text-2xl font-bold">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Secure Your Future?</h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of successful students who have secured their dream jobs through our assurance program
          </p>
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3"
            onClick={() => handleOpenAuth('register', 'student')}
          >
            <Award className="h-5 w-5 mr-2" />
            Get Job Assurance Now
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
