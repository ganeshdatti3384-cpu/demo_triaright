
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import CourseHeader from '@/components/CourseDetail/CourseHeader';
import CourseVideoPlayer from '@/components/CourseDetail/CourseVideoPlayer';
import WhatYoullLearn from '@/components/CourseDetail/WhatYoullLearn';
import CourseCurriculum from '@/components/CourseDetail/CourseCurriculum';
import CourseInstructor from '@/components/CourseDetail/CourseInstructor';
import StudentReviews from '@/components/CourseDetail/StudentReviews';
import PricingCard from '@/components/CourseDetail/PricingCard';
import CourseFeatures from '@/components/CourseDetail/CourseFeatures';
import MobileCTA from '@/components/CourseDetail/MobileCTA';
import { courseData } from '@/data/courseData';
import { courseApi } from '@/services/api';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [authModal, setAuthModal] = useState({ isOpen: false, type: 'login' as 'login' | 'register', userType: 'student' });
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      
      try {
        setLoading(true);
        const response = await courseApi.getCourseById(courseId);
        setCourse(response.course);
      } catch (err: any) {
        console.error('Error fetching course:', err);
        // Fallback to static data if API fails
        const fallbackCourse = courseData[courseId] || courseData['web-development'];
        setCourse(fallbackCourse);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Course not found</p>
        </div>
      </div>
    );
  }
  const IconComponent = course.icon;

  const handleEnrollClick = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      
      <CourseHeader course={course} IconComponent={IconComponent} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <CourseVideoPlayer courseTitle={course.title} />
            <WhatYoullLearn learningOutcomes={course.whatYoullLearn} />
            <CourseCurriculum curriculum={course.curriculum} totalLessons={course.lessons} />
            <CourseInstructor instructor={course.instructor} />
            <StudentReviews reviews={course.reviews} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <PricingCard course={course} onEnrollClick={handleEnrollClick} />
              <CourseFeatures />
            </div>
          </div>
        </div>
      </div>

      <MobileCTA course={course} onEnrollClick={handleEnrollClick} />
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

export default CourseDetail;
