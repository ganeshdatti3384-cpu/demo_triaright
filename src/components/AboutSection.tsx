
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Shield, Zap, Heart, Globe } from 'lucide-react';

const AboutSection = () => {
  const values = [
    {
      icon: Shield,
      title: 'Trusted Platform',
      description: 'Secure, reliable, and trusted by thousands of students and employers worldwide.'
    },
    {
      icon: Zap,
      title: 'Fast Results',
      description: 'Quick placements and rapid skill development with our proven methodologies.'
    },
    {
      icon: Heart,
      title: 'Student-Centric',
      description: 'Every feature designed with student success and career growth in mind.'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Connect with opportunities worldwide through our extensive network.'
    }
  ];

  const achievements = [
    'Industry-leading placement rates',
    'Partnerships with top companies',
    'Expert-designed curriculum',
    'Personalized career guidance',
    'Comprehensive skill assessment',
    '24/7 support and assistance'
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-6">
              About EduCareer Hub
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Empowering Careers Through 
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}Comprehensive Education
              </span>
            </h2>
            
            <p className="text-lg text-gray-600 mb-8">
              We are more than just an education platform. We're your career partners, 
              committed to bridging the gap between learning and earning. Our comprehensive 
              ecosystem connects students, job seekers, employers, and educational institutions 
              in one unified platform.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{achievement}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4"
              >
                Learn More About Us
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-4 border-2"
              >
                View Success Stories
              </Button>
            </div>
          </div>

          {/* Right Content - Values Cards */}
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white group">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <value.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mission Statement */}
        <div className="mt-20 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12 max-w-4xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Our Mission</h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              To democratize quality education and career opportunities by creating a 
              seamless ecosystem where learning meets opportunity. We believe every 
              individual deserves access to world-class education and meaningful career 
              paths, regardless of their background or location.
            </p>
            
            <div className="mt-8 grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">6K+</div>
                <div className="text-gray-600">Lives Transformed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">20+</div>
                <div className="text-gray-600">Partner Companies</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">97%</div>
                <div className="text-gray-600">Placement Success</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
