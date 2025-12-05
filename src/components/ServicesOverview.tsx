// components/ServicesOverview.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, GraduationCap, Building, Star, Shield, Zap } from 'lucide-react';

const ServicesOverview = () => {
  const navigate = useNavigate();

  const servicesData = [
    {
      id: 1,
      title: "For Students",
      icon: <Users className="h-16 w-16 text-blue-600" />,
      badge: "Most Popular",
      features: [
        "Courses",
        "Internships", 
        "Jobs"
      ],
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 via-white to-cyan-50",
      description: "Kickstart your career with our comprehensive learning and placement programs",
      stats: "10,000+ Success Stories"
    },
    {
      id: 2,
      title: "For Colleges",
      icon: <GraduationCap className="h-16 w-16 text-purple-600" />,
      badge: "Enterprise",
      features: [
        "LMS",
        "Community Portal",
        "CRT",
        "Academic Projects", 
        "Technical Trainings",
        "Faculty Development Program",
        "Human Resources Management",
        "College Management Tools",
        "Incubation Centre",
        "Centre for Abroad Education"
      ],
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 via-white to-pink-50",
      description: "Transform your institution with our complete educational ecosystem",
      stats: "500+ Partner Colleges"
    },
    {
      id: 3,
      title: "For Companies",
      icon: <Building className="h-16 w-16 text-green-600" />,
      badge: "Business",
      features: [
        "Job Portal",
        "ERP Tools", 
        "Software Development",
        "IT Maintenance",
        "Business Solutions & Outsourcing"
      ],
      gradient: "from-green-500 to-teal-500",
      bgGradient: "from-green-50 via-white to-teal-50",
      description: "Scale your business with our cutting-edge technology solutions",
      stats: "1,000+ Business Clients"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 border border-gray-200 shadow-sm mb-6">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-semibold text-gray-700">Comprehensive Solutions</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Tailored Solutions for <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Every Need</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our complete ecosystem designed to empower students, transform educational institutions, and drive business growth.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {servicesData.map((service, index) => (
            <div 
              key={service.id}
              className={`relative bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group flex flex-col h-full`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {/* Header with Gradient */}
              <div className={`relative bg-gradient-to-r ${service.gradient} p-8 text-white overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold">{service.title}</h3>
                      <p className="text-blue-100 mt-2 opacity-90">{service.description}</p>
                    </div>
                    <div className="transform group-hover:scale-110 transition-transform duration-300">
                      {service.icon}
                    </div>
                  </div>
                  
                  {/* Badge */}
                  <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 border border-white/30">
                    <Shield className="h-3 w-3" />
                    <span className="text-xs font-semibold">{service.badge}</span>
                  </div>
                </div>
              </div>
              
              {/* Features List */}
              <div className="p-8 flex-grow">
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-4">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>Featured Services</span>
                  </div>
                  <ul className="space-y-3">
                    {service.features.map((feature, featureIndex) => (
                      <li 
                        key={featureIndex} 
                        className="flex items-center text-gray-700 group/item hover:text-gray-900 transition-colors duration-200"
                      >
                        <div className={`w-2 h-2 bg-gradient-to-r ${service.gradient} rounded-full mr-3 group-hover/item:scale-125 transition-transform duration-200`}></div>
                        <span className="font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Stats */}
                <div className="border-t border-gray-100 pt-4 mb-6 mt-auto">
                  <p className="text-sm font-semibold text-gray-600">{service.stats}</p>
                </div>
              </div>

              {/* CTA Button - Sticky at bottom */}
              <div className="p-6 pt-0 mt-auto">
                <Button 
                  className={`w-full bg-gradient-to-r ${service.gradient} hover:shadow-lg hover:scale-105 transform transition-all duration-300 text-white font-semibold py-4 rounded-xl`}
                  onClick={() => navigate('/register')}
                >
                  Get Started Now
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </div>

              {/* Hover Effect Border */}
              <div className={`absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}>
                <div className="absolute inset-[2px] rounded-3xl bg-white z-10"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of students, colleges, and companies already transforming their future with our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline"
                className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-xl font-semibold"
                onClick={() => navigate('/contact')}
              >
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
};

export default ServicesOverview;
