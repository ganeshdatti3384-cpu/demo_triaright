
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, PlayCircle, Users, BookOpen, Briefcase } from 'lucide-react';

interface HeroProps {
  onOpenAuth: (type: 'login' | 'register', userType: string) => void;
}

const Hero = ({ onOpenAuth }: HeroProps) => {
  const stats = [
    { icon: Users, value: '50K+', label: 'Active Students' },
    { icon: BookOpen, value: '500+', label: 'Courses Available' },
    { icon: Briefcase, value: '1000+', label: 'Job Placements' }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[size:75px_75px]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Your Career Journey
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Starts Here
              </span>
            </h1>
            
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
              A comprehensive platform offering live courses, job placements, internships, 
              and career training. Connect with top employers and accelerate your professional growth.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                onClick={() => onOpenAuth('register', 'student')}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-4 text-lg font-semibold border-2 hover:bg-gray-50 transition-all duration-300 group"
              >
                <PlayCircle className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <stat.icon className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Visual Element */}
          <div className="relative">
            <div className="relative mx-auto w-full max-w-lg">
              {/* Main Card */}
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Web Development</h3>
                      <p className="text-sm text-gray-600">42 lessons • 8 weeks</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="text-sm font-semibold text-gray-900">68%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{width: '68%'}}></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {[1,2,3].map((i) => (
                        <div key={i} className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white"></div>
                      ))}
                      <div className="w-8 h-8 bg-blue-100 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-xs font-semibold text-blue-600">+12</span>
                      </div>
                    </div>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Continue
                    </Button>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-semibold shadow-lg animate-pulse">
                Live Now
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                Job Ready
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
