// Index.tsx (updated with ServicesOverview component)
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
import ServicesOverview from '../components/ServicesOverview'; // New import
import { courseApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

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

const Index = () => {
  const navigate = useNavigate();
  const [showSuccessStories, setShowSuccessStories] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      {/* --- Services Overview Section --- */}
      <ServicesOverview />

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
      <Footer />
    </div>
  );
};

export default Index;
