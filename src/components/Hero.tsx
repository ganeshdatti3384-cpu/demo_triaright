
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Users, Briefcase, GraduationCap } from 'lucide-react';

interface HeroProps {
  onOpenAuth: (type: 'login' | 'register', userType: string) => void;
}

const Hero = ({ onOpenAuth }: HeroProps) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 pt-20 pb-16">
      <div className="absolute inset-0 bg-white/40"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Transform Your Career with{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Triaright Hub
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Your gateway to professional growth through expert training, skill development, 
            and career opportunities. Join thousands who have transformed their careers with us.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              onClick={() => onOpenAuth('login', 'student')}
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              onClick={() => onOpenAuth('login', 'employer')}
              variant="outline" 
              size="lg" 
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3"
            >
              For Employers
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Expert Training</h3>
              <p className="text-sm text-gray-600">Industry-leading courses and certifications</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Community</h3>
              <p className="text-sm text-gray-600">Connect with peers and mentors</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Briefcase className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Job Placement</h3>
              <p className="text-sm text-gray-600">Direct placement opportunities</p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Certification</h3>
              <p className="text-sm text-gray-600">Recognized industry certificates</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
