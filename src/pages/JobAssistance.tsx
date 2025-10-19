import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Zap, 
  Bell, 
  Target, 
  Users, 
  BookOpen, 
  TrendingUp, 
  Award, 
  Clock,
  Shield,
  Rocket,
  Star,
  Crown,
  Sparkles,
  TrendingDown,
  Lightbulb,
  GraduationCap,
  Briefcase
} from 'lucide-react';

const CareerServices = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('assistance');

  const benefits = [
    {
      icon: Bell,
      title: "Real-time Job Alerts",
      description: "Instant notifications for new openings matching your profile",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Target,
      title: "Personalized Guidance",
      description: "Custom interview prep and skill development plans",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Zap,
      title: "Competitive Edge",
      description: "Industry secrets to make your application stand out",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Shield,
      title: "Exclusive Opportunities",
      description: "First access to jobs from our partner companies",
      color: "from-orange-500 to-red-500"
    }
  ];

  const whyChooseUs = [
    {
      icon: Target,
      title: "Tailored Career Path",
      description: "Customized learning for IT & Non-IT roles",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: Users,
      title: "1-on-1 Mentorship",
      description: "Personal guidance from industry experts",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: BookOpen,
      title: "Industry Curriculum",
      description: "Updated content matching current standards",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: TrendingUp,
      title: "Placement Focus",
      description: "Training designed to maximize employability",
      color: "bg-orange-100 text-orange-600"
    },
    {
      icon: Award,
      title: "Job or Refund",
      description: "100% money-back guarantee",
      color: "bg-red-100 text-red-600"
    },
    {
      icon: Rocket,
      title: "Fast-Track Growth",
      description: "Accelerated career progression",
      color: "bg-indigo-100 text-indigo-600"
    }
  ];

  const paymentMethods = [
    {
      name: "UPI",
      icon: "📱",
      description: "Instant payments via any UPI app",
      gradient: "from-green-400 to-emerald-500"
    },
    {
      name: "Card",
      icon: "💳",
      description: "Secure credit/debit card payments",
      gradient: "from-blue-400 to-cyan-500"
    },
    {
      name: "Razorpay",
      icon: "💰",
      description: "Multiple payment options",
      gradient: "from-purple-400 to-pink-500"
    }
  ];

  const includedServices = [
    "Comprehensive Skill Assessment",
    "Resume & LinkedIn Optimization",
    "Communication & Soft Skills Training",
    "Domain-Specific Technical Training",
    "Weekly Progress Reviews with Experts",
    "Realistic Mock Interviews",
    "Direct Interview Opportunities",
    "Lifetime Career Support Network"
  ];

  const successMetrics = [
    {
      value: "5,000+",
      label: "Career Transformations",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      value: "85%",
      label: "Success Rate",
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      value: "24/7",
      label: "Expert Support",
      icon: Clock,
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      value: "100+",
      label: "Partner Companies",
      icon: Briefcase,
      color: "text-orange-600",
      bg: "bg-orange-50"
    }
  ];

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleBookAppointment = () => {
    navigate('/booking');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <Navbar />
      
      {/* Enhanced Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute top-10 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-10 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-4000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <Badge className="mb-6 bg-white/20 backdrop-blur-sm text-white border-0 hover:bg-white/30 text-sm font-semibold py-2 px-4 rounded-full transition-all duration-300">
              <Sparkles className="w-4 h-4 mr-2" />
              Trusted by 5,000+ Professionals
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent leading-tight">
              Launch Your
              <span className="block bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">
                Dream Career
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Choose your path: <span className="font-semibold text-white">flexible guidance</span> or 
              <span className="font-semibold text-white"> guaranteed placement</span> with 100% refund assurance
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
              <Button 
                onClick={handleGetStarted}
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-50 font-bold px-8 py-4 text-lg rounded-full shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Start Free Trial
              </Button>
              <Button 
                onClick={handleBookAppointment}
                size="lg"
                className="bg-amber-500 text-white hover:bg-amber-600 font-bold px-8 py-4 text-lg rounded-full shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 border-0"
              >
                <Lightbulb className="w-5 h-5 mr-2" />
                Book Expert Consultation
              </Button>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50/10 to-transparent"></div>
      </div>

      {/* Success Metrics */}
      <div className="py-16 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {successMetrics.map((metric, index) => (
              <div key={index} className="text-center group">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${metric.bg} ${metric.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <metric.icon className="w-8 h-8" />
                </div>
                <div className={`text-3xl font-bold ${metric.color} mb-2`}>{metric.value}</div>
                <div className="text-gray-600 font-medium text-sm">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Program Selection */}
      <div className="py-20 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-600 border-0 px-4 py-2 rounded-full font-semibold">
              <Crown className="w-4 h-4 mr-2" />
              Choose Your Success Path
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Two Powerful Ways to 
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Advance</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you need strategic guidance or comprehensive training with guaranteed results, 
              we have the perfect solution tailored for your career aspirations.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-2 mb-16 bg-gray-100 p-2 rounded-2xl">
              <TabsTrigger 
                value="assistance" 
                className="text-lg py-4 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
              >
                <Zap className="w-5 h-5 mr-3" />
                Job Assistance
                <Badge className="ml-2 bg-green-500 text-white">₹500</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="assurance" 
                className="text-lg py-4 data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
              >
                <Shield className="w-5 h-5 mr-3" />
                Job Assurance
                <Badge className="ml-2 bg-blue-500 text-white">Guaranteed</Badge>
              </TabsTrigger>
            </TabsList>

            {/* Job Assistance Tab */}
            <TabsContent value="assistance" className="space-y-20">
              {/* Main Pricing Card */}
              <div className="max-w-4xl mx-auto">
                <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white to-blue-50/50">
                  <div className="absolute top-6 right-6">
                    <Badge className="bg-green-500 text-white px-4 py-2 rounded-full font-bold text-sm">
                      💫 Most Popular
                    </Badge>
                  </div>
                  
                  <CardHeader className="text-center pb-8 pt-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl mb-6">
                      <Zap className="w-10 h-10 text-white" />
                    </div>
                    <CardTitle className="text-4xl font-bold text-gray-900">Job Assistance Program</CardTitle>
                    <p className="text-gray-600 text-lg mt-3 max-w-md mx-auto">
                      Lifetime career support with real-time opportunities and expert guidance
                    </p>
                    
                    <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 max-w-md mx-auto border border-green-100">
                      <div className="text-5xl font-bold text-green-600 mb-2">₹500</div>
                      <div className="text-xl font-semibold text-gray-700 mb-2">One-Time Payment • Lifetime Access</div>
                      <p className="text-gray-600 text-sm">No hidden fees, no recurring charges</p>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                      {benefits.map((benefit, index) => (
                        <div key={index} className="group">
                          <div className="flex items-start space-x-4 p-6 rounded-2xl bg-white border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                            <div className={`bg-gradient-to-r ${benefit.color} p-3 rounded-xl flex-shrink-0`}>
                              <benefit.icon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 mb-2 text-lg">{benefit.title}</h3>
                              <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="text-center">
                      <Button 
                        onClick={handleGetStarted}
                        size="lg"
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 font-bold px-12 py-6 text-lg rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300"
                      >
                        <Sparkles className="w-5 h-5 mr-3" />
                        Get Instant Access - ₹500 Only!
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Payment Methods */}
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">Flexible Payment Options</h3>
                  <p className="text-gray-600 text-lg">Secure, fast, and convenient payment methods</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {paymentMethods.map((method, index) => (
                    <div key={index} className="group">
                      <Card className="text-center border-0 bg-gradient-to-br from-white to-gray-50/50 hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                        <CardHeader>
                          <div className={`text-4xl mb-4 bg-gradient-to-r ${method.gradient} bg-clip-text text-transparent`}>
                            {method.icon}
                          </div>
                          <CardTitle className="text-xl font-bold">{method.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600">{method.description}</p>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Job Assurance Tab */}
            <TabsContent value="assurance" className="space-y-20">
              {/* Program Cards */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-7xl mx-auto">
                {/* IT Track */}
                <Card className="relative border-0 bg-gradient-to-br from-white to-blue-50/50 shadow-2xl hover:shadow-3xl transition-all duration-300 group">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 text-sm font-bold rounded-full shadow-lg">
                      🚀 Most Popular
                    </Badge>
                  </div>
                  
                  <CardHeader className="bg-gradient-to-r from-blue-50/80 to-cyan-50/80 pb-6 rounded-t-lg">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl text-blue-800 font-bold">IT Career Track</CardTitle>
                      <Star className="h-6 w-6 text-yellow-500 fill-current" />
                    </div>
                    <div className="flex items-center space-x-2 mt-3">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span className="text-blue-700 font-semibold">12-Month Comprehensive Program</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-8">
                    <div className="text-center mb-8">
                      <div className="text-5xl font-bold text-blue-600 mb-2">₹30,000</div>
                      <p className="text-gray-600 font-medium">Complete training & placement package</p>
                    </div>
                    
                    <div className="space-y-4 mb-8">
                      {[
                        "Full-stack development with modern frameworks",
                        "Cloud technologies & DevOps practices",
                        "Real-world project portfolio development",
                        "Industry certifications & career coaching",
                        "Guaranteed placement with 100+ partner companies"
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center space-x-4 p-3 rounded-xl bg-blue-50/50 group-hover:bg-blue-50 transition-colors">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700 font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      onClick={handleGetStarted}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 font-bold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                    >
                      <GraduationCap className="w-5 h-5 mr-3" />
                      Start IT Career Journey
                    </Button>
                  </CardContent>
                </Card>

                {/* Non-IT Track */}
                <Card className="relative border-0 bg-gradient-to-br from-white to-orange-50/50 shadow-2xl hover:shadow-3xl transition-all duration-300 group">
                  <CardHeader className="bg-gradient-to-r from-orange-50/80 to-amber-50/80 pb-6 rounded-t-lg">
                    <CardTitle className="text-2xl text-orange-800 font-bold">Non-IT Career Track</CardTitle>
                    <div className="flex items-center space-x-2 mt-3">
                      <Clock className="h-5 w-5 text-orange-600" />
                      <span className="text-orange-700 font-semibold">100-Day Intensive Program</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-8">
                    <div className="text-center mb-8">
                      <div className="text-5xl font-bold text-orange-600 mb-2">₹10,000</div>
                      <p className="text-gray-600 font-medium">Focused training & job assistance</p>
                    </div>
                    
                    <div className="space-y-4 mb-8">
                      {[
                        "Business communication & leadership skills",
                        "Digital marketing & analytics training",
                        "Corporate strategy & operations knowledge",
                        "Professional networking & personal branding",
                        "Guaranteed placement in top companies"
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center space-x-4 p-3 rounded-xl bg-orange-50/50 group-hover:bg-orange-50 transition-colors">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700 font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      onClick={handleGetStarted}
                      className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 font-bold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                    >
                      <Briefcase className="w-5 h-5 mr-3" />
                      Launch Business Career
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Why Choose Assurance */}
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                  <Badge className="mb-4 bg-green-100 text-green-600 border-0 px-4 py-2 rounded-full font-semibold">
                    <Shield className="w-4 h-4 mr-2" />
                    100% Placement Guarantee
                  </Badge>
                  <h3 className="text-4xl font-bold text-gray-900 mb-4">Why Job Assurance Works</h3>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Comprehensive support system designed for your guaranteed career success
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {whyChooseUs.map((item, index) => (
                    <Card key={index} className="border-0 bg-gradient-to-br from-white to-gray-50/50 hover:shadow-xl transition-all duration-300 group hover:scale-105">
                      <CardHeader>
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-xl ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                            <item.icon className="h-6 w-6" />
                          </div>
                          <CardTitle className="text-lg font-bold">{item.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 leading-relaxed">{item.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Comprehensive Services */}
              <div className="max-w-5xl mx-auto">
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-0 shadow-2xl">
                  <CardHeader className="text-center pb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-2xl mb-4">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-gray-900">Everything Included for Your Success</CardTitle>
                    <p className="text-gray-600 text-lg">Complete ecosystem for career transformation</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {includedServices.map((service, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 bg-white/50 rounded-xl hover:bg-white transition-colors duration-300">
                          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </div>
                          <span className="text-gray-700 font-semibold">{service}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Final Enhanced CTA */}
      <div className="relative py-24 bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-white/20 backdrop-blur-sm text-white border-0 px-4 py-2 rounded-full font-semibold">
            <Sparkles className="w-4 h-4 mr-2" />
            Limited Time Offer
          </Badge>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to
            <span className="block bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">
              Transform Your Career?
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands who've already launched successful careers with our proven programs
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              onClick={handleGetStarted}
              size="lg"
              className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-bold px-12 py-6 text-lg rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <Zap className="w-5 h-5 mr-3" />
              Start with Job Assistance
            </Button>
            
            <Button 
              onClick={handleBookAppointment}
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-12 py-6 text-lg rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <Lightbulb className="w-5 h-5 mr-3" />
              Book Expert Consultation
            </Button>
          </div>
          
          <p className="text-gray-400 mt-8 text-sm">
            ⚡ 7-day money-back guarantee • 🤝 24/7 support • 🎯 Proven results
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CareerServices;
