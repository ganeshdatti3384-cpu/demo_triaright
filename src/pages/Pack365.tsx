import React from 'react';
import Pack365Courses from '../components/Pack365Courses';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Stars, Rocket, Brain, Target, Zap, Crown, Shield, Globe } from 'lucide-react';

const Pack365 = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/');
  };

  const handleAuthClick = (type: 'login' | 'register', userType: string) => {
    if (type === 'login') {
      navigate('/login');
    } else {
      navigate('/register');
    }
  };

  const features = [
    {
      icon: <Crown className="h-8 w-8" />,
      title: "Premium Content",
      description: "Industry-expert curated courses with cutting-edge curriculum",
      color: "from-yellow-500 to-amber-500"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Lifetime Access",
      description: "365-day access with lifetime updates to all course materials",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Career Focused",
      description: "Designed to get you job-ready with real-world projects",
      color: "from-red-500 to-pink-500"
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Global Recognition",
      description: "Industry-recognized certificates valued by top companies",
      color: "from-green-500 to-emerald-500"
    }
  ];

  const stats = [
    { number: "10K+", label: "Students Enrolled" },
    { number: "4.9/5", label: "Average Rating" },
    { number: "95%", label: "Completion Rate" },
    { number: "50+", label: "Expert Instructors" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <Navbar />
      
      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-lg rounded-full px-6 py-3 border border-white/20 mb-8">
              <Rocket className="h-5 w-5 text-blue-400 animate-bounce" />
              <span className="text-blue-100 font-medium text-sm">
                🚀 Transform Your Career in 365 Days
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                Pack365
              </span>
              <br />
              <span className="text-3xl md:text-5xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Master Bundle
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto mb-8 leading-relaxed">
              Complete learning ecosystem with <span className="text-yellow-400 font-semibold">premium courses</span>, 
              {' '}<span className="text-green-400 font-semibold">expert mentorship</span>, and{' '}
              <span className="text-cyan-400 font-semibold">industry recognition</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-2xl flex items-center space-x-2 transition-all duration-300"
                onClick={() => document.getElementById('bundles-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Zap className="h-5 w-5" />
                <span>Explore Bundles</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white/30 hover:border-white/50 text-white font-bold text-lg px-8 py-4 rounded-2xl backdrop-blur-lg bg-white/10 hover:bg-white/15 transition-all duration-300 flex items-center space-x-2"
              >
                <Brain className="h-5 w-5" />
                <span>View Curriculum</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                <div className="text-2xl md:text-3xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-blue-100 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Choose <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Pack365</span>?
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Experience learning redefined with our comprehensive approach to skill development
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all duration-500 group"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-blue-100 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bundles Section */}
      <section id="bundles-section" className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full px-6 py-3 border border-blue-400/30 mb-4">
              <Stars className="h-5 w-5 text-yellow-400" />
              <span className="text-blue-100 font-medium text-sm">
                Premium Learning Bundles
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Master <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">In-Demand</span> Skills
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Choose from our carefully crafted bundles designed to make you industry-ready
            </p>
          </motion.div>

          {/* Pack365Courses Component */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <Pack365Courses />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-2xl rounded-3xl p-12 border border-white/20 shadow-2xl"
          >
            <div className="inline-flex p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-6">
              <Rocket className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Launch Your Career?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of successful students who transformed their careers with Pack365. 
              Your journey to mastery starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-2xl flex items-center justify-center space-x-2 transition-all duration-300"
              >
                <Zap className="h-5 w-5" />
                <span>Start Learning Today</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white/30 hover:border-white/50 text-white font-bold text-lg px-8 py-4 rounded-2xl backdrop-blur-lg bg-white/10 hover:bg-white/15 transition-all duration-300"
              >
                Schedule Demo
              </motion.button>
            </div>
            <div className="mt-8 flex items-center justify-center space-x-6 text-blue-100 text-sm">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-400" />
                <span>30-Day Money Back Guarantee</span>
              </div>
              <div className="flex items-center space-x-2">
                <Crown className="h-4 w-4 text-yellow-400" />
                <span>Lifetime Access</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pack365;
