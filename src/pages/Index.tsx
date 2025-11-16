// Index.tsx (updated - with animated TrustBadges section)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FeaturesSection from '../components/FeaturesSection';
import AboutSection from '../components/AboutSection';
import PartnersSection from '../components/PartnersSection';
import Footer from '../components/Footer';
import CourseCards from '../components/CourseCards';
import SuccessStories from '../components/SuccessStories';
import Pack365Courses from '../components/Pack365Courses';
import RecordedCoursesList, { Course } from '../components/RecordedCoursesList';
import ServicesOverview from '../components/ServicesOverview';
import { courseApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Award, CheckCircle, Users } from 'lucide-react';

// Import CubeAnimation component
import CubeAnimation from '../components/CubeAnimation';

// Data for cube animations
const coursesCubeData = [
  { icon: "fas fa-laptop-code", title: "Web Development", description: "Learn modern web technologies" },
  { icon: "fas fa-mobile-alt", title: "Mobile Apps", description: "Build cross-platform applications" },
  { icon: "fas fa-database", title: "Data Science", description: "Master data analysis & ML" },
  { icon: "fas fa-cloud", title: "Cloud Computing", description: "AWS, Azure & GCP" },
  { icon: "fas fa-shield-alt", title: "Cyber Security", description: "Protect digital assets" },
  { icon: "fas fa-robot", title: "AI & ML", description: "Artificial Intelligence" }
];

const jobsCubeData = [
  { icon: "fas fa-briefcase", title: "Full-time", description: "Permanent positions" },
  { icon: "fas fa-user-tie", title: "Professional", description: "Career opportunities" },
  { icon: "fas fa-home", title: "Remote", description: "Work from anywhere" },
  { icon: "fas fa-building", title: "On-site", description: "Office positions" },
  { icon: "fas fa-globe", title: "Global", description: "International roles" },
  { icon: "fas fa-chart-line", title: "Growth", description: "Career progression" }
];

const internshipsCubeData = [
  { icon: "fas fa-graduation-cap", title: "Learning", description: "Gain experience" },
  { icon: "fas fa-handshake", title: "Mentorship", description: "Expert guidance" },
  { icon: "fas fa-network-wired", title: "Networking", description: "Industry connections" },
  { icon: "fas fa-certificate", title: "Certificate", description: "Get certified" },
  { icon: "fas fa-money-bill-wave", title: "Stipend", description: "Earn while learning" },
  { icon: "fas fa-briefcase", title: "Placement", description: "Job opportunities" }
];

// Trust badges data
const trustBadges = [
  {
    name: "Skill India",
    image: "/lovable-uploads/skill-india-badge.png",
    alt: "Skill India - Government of India"
  },
  {
    name: "Startup India",
    image: "/lovable-uploads/startup-india-badge.png",
    alt: "Startup India - Government of India"
  },
  {
    name: "AICTE",
    image: "/lovable-uploads/aicte-badge.png",
    alt: "AICTE Approved"
  },
  {
    name: "APSSDC",
    image: "/lovable-uploads/apssdc-badge.png",
    alt: "APSSDC Partner"
  },
  {
    name: "ISO 9001:2015",
    image: "/lovable-uploads/iso-badge.png",
    alt: "ISO 9001:2015 Certified"
  },
  {
    name: "MSME",
    image: "/lovable-uploads/msme-badge.png",
    alt: "MSME Registered"
  },
  {
    name: "NASSCOM",
    image: "/lovable-uploads/nasscom-badge.gif",
    alt: "NASSCOM Partner"
  },
  {
    name: "NSDC",
    image: "/lovable-uploads/nsdc-badge.png",
    alt: "NSDC Partner"
  },
  {
    name: "APSCHE",
    image: "/lovable-uploads/apsche-badge.png",
    alt: "APSCHE Affiliated"
  }
];

const Index = () => {
  const navigate = useNavigate();
  const [showSuccessStories, setShowSuccessStories] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Intersection Observer for animation trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('trust-badges');
    if (section) {
      observer.observe(section);
    }

    return () => {
      if (section) {
        observer.unobserve(section);
      }
    };
  }, []);

  // Fetch courses for the RecordedCoursesList component
  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        setLoading(true);
        const response = await courseApi.getAllCourses();

        const coursesData = response.courses;
        if (Array.isArray(coursesData)) {
          setCourses(coursesData);
        } else {
          throw new Error("Received invalid data format from the server.");
        }

      } catch (err: any) {
        console.error("Error fetching all courses:", err);
        setError("Could not load courses at this time. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllCourses();
  }, []);

  const openLoginDialog = (type: 'login' | 'register', userType: string) => {
    if (type === 'login') {
      navigate('/login');
    } else {
      navigate('/register');
    }
  };

  if (showSuccessStories) return <SuccessStories onBack={() => setShowSuccessStories(false)} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      <Hero onOpenAuth={openLoginDialog} />

      {/* --- Animated Trust Badges Section --- */}
      <section id="trust-badges" className="py-16 bg-gradient-to-br from-white to-blue-50/30 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -left-10 w-20 h-20 bg-blue-100 rounded-full opacity-50 animate-pulse"></div>
          <div className="absolute top-1/4 -right-10 w-16 h-16 bg-purple-100 rounded-full opacity-40 animate-bounce delay-300"></div>
          <div className="absolute bottom-10 left-1/4 w-12 h-12 bg-indigo-100 rounded-full opacity-60 animate-ping delay-700"></div>
          <div className="absolute bottom-1/3 right-1/4 w-14 h-14 bg-cyan-100 rounded-full opacity-50 animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header with Animation */}
          <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center justify-center mb-4">
              <div className="relative">
                <Shield className="h-8 w-8 text-blue-600" />
                <CheckCircle className="h-4 w-4 text-green-500 absolute -top-1 -right-1 bg-white rounded-full" />
              </div>
              <span className="ml-2 text-sm font-semibold text-blue-600 uppercase tracking-wide">Trust & Recognition</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Trusted & Recognized By
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our commitment to quality education and skill development is recognized by leading 
              <span className="font-semibold text-blue-600"> government bodies</span> and 
              <span className="font-semibold text-purple-600"> industry organizations</span>
            </p>
          </div>
          
          {/* Animated Badges Grid */}
          <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 items-center justify-items-center transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            {trustBadges.map((badge, index) => (
              <div 
                key={index}
                className="relative flex flex-col items-center justify-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl hover:bg-white hover:shadow-2xl transition-all duration-500 border border-gray-100/80 hover:border-blue-200/50 group cursor-pointer transform hover:-translate-y-2 hover:scale-105"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: isVisible ? `fadeInUp 0.6s ease-out ${index * 100}ms both` : 'none'
                }}
              >
                {/* Hover effect background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Animated border effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm group-hover:blur-md"></div>
                
                <div className="relative h-20 w-20 flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <img 
                    src={badge.image} 
                    alt={badge.alt}
                    className="relative z-10 max-h-full max-w-full object-contain filter group-hover:brightness-110 group-hover:contrast-110 transition-all duration-300 drop-shadow-sm"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden absolute z-10 text-xl font-bold text-gray-600 bg-gray-200 rounded-2xl h-20 w-20 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-blue-200 group-hover:to-purple-200 group-hover:text-gray-800 transition-all duration-300">
                    {badge.name.split(' ').map(word => word.charAt(0)).join('')}
                  </div>
                </div>
                
                <span className="relative z-10 text-sm font-semibold text-gray-700 text-center group-hover:text-gray-900 transition-colors duration-300 px-2">
                  {badge.name}
                </span>
                
                {/* Verified badge on hover */}
                <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-0 group-hover:scale-100">
                  <CheckCircle className="h-3 w-3" />
                </div>
              </div>
            ))}
          </div>

          {/* Additional recognition with enhanced animation */}
          <div className={`mt-12 text-center transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center bg-gradient-to-r from-blue-50 to-purple-50 px-8 py-4 rounded-2xl border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105">
              <Award className="h-6 w-6 text-yellow-500 mr-3 animate-pulse" />
              <span className="text-base font-semibold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                🏆 Transforming the skill landscape with certified quality education
              </span>
            </div>
            
            {/* Stats row */}
            <div className="flex justify-center items-center space-x-8 mt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">50K+</div>
                <div className="text-sm text-gray-600">Students Trained</div>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">9+</div>
                <div className="text-sm text-gray-600">Recognitions</div>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">95%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>

            {/* Community CTA Button */}
            <div className="mt-8">
              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                onClick={() => navigate('/community')}
              >
                <Users className="mr-2 h-5 w-5" />
                Join Our Community
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* CSS for keyframe animations */}
        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </section>

      {/* --- Cube Animation Sections --- */}
      
      {/* Courses Cube Section */}
      <section className="py-16 bg-gradient-to-br from-slate-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl font-bold mb-6">Explore Our Courses</h2>
              <p className="text-xl text-gray-300 mb-8">
                Discover a wide range of courses designed to boost your career. 
                From web development to data science, we have everything you need to succeed.
              </p>
              <Button 
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-full font-semibold"
                onClick={() => navigate('/courses')}
              >
                Browse All Courses <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <div className="flex justify-center">
              <CubeAnimation items={coursesCubeData} theme="primary" />
            </div>
          </div>
        </div>
      </section>

      {/* --- Pack365 Courses Section --- */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pack365 - Premium Learning Program</h2>
            <p className="text-lg text-gray-600">Annual learning packages with complete course access, mentorship, and career support</p>
          </div>
          <Pack365Courses showLoginRequired={true} onLoginRequired={() => navigate('/login')} />
        </div>
      </section>

      {/* Jobs Cube Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center order-2 lg:order-1">
              <CubeAnimation items={jobsCubeData} theme="secondary" />
            </div>
            <div className="text-center lg:text-left order-1 lg:order-2">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Find Your Dream Job</h2>
              <p className="text-xl text-gray-600 mb-8">
                Connect with top employers and discover opportunities that match your skills and aspirations.
              </p>
              <Button 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-3 rounded-full font-semibold"
                onClick={() => navigate('/jobs')}
              >
                Explore Jobs <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Internships Cube Section */}
      <section className="py-16 bg-gradient-to-br from-purple-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl font-bold mb-6">Start Your Career with Internships</h2>
              <p className="text-xl text-gray-300 mb-8">
                Gain real-world experience, learn from industry experts, and kickstart your professional journey.
              </p>
              <Button 
                className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-8 py-3 rounded-full font-semibold"
                onClick={() => navigate('/internships')}
              >
                View Internships <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <div className="flex justify-center">
              <CubeAnimation items={internshipsCubeData} theme="primary" />
            </div>
          </div>
        </div>
      </section>

      {/* --- Featured Courses Section (Updated with RecordedCoursesList) --- */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Courses</h2>
            <p className="text-lg text-gray-600">Choose from our top-rated courses to accelerate your career</p>
          </div>
          <RecordedCoursesList 
            courses={courses} 
            loading={loading} 
            error={error} 
          />
        </div>
      </section>

      <FeaturesSection />
      <AboutSection />
      <PartnersSection />

      {/* --- Services Overview Section (Moved after Partners) --- */}
      <ServicesOverview />

      <Footer />
    </div>
  );
};

export default Index;
