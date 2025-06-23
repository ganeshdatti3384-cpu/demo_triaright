
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FeaturesSection from '../components/FeaturesSection';
import AboutSection from '../components/AboutSection';
import PartnersSection from '../components/PartnersSection';
import Footer from '../components/Footer';
import LoginDialog from '../components/LoginDialog';
import EnhancedRegistrationDialog from '../components/EnhancedRegistrationDialog';
import StudentDashboard from '../components/dashboards/StudentDashboard';
import EnhancedJobSeekerDashboard from '../components/dashboards/EnhancedJobSeekerDashboard';
import EmployeeDashboard from '../components/dashboards/EmployeeDashboard';
import EmployerDashboard from '../components/dashboards/EmployerDashboard';
import CollegeDashboard from '../components/dashboards/CollegeDashboard';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import SuperAdminDashboard from '../components/dashboards/SuperAdminDashboard';
import ImageSlider from '../components/ImageSlider';
import CourseCards from '../components/CourseCards';
import SuccessStories from '../components/SuccessStories';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('student');
  const [user, setUser] = useState<{ role: string; name: string } | null>(null);
  const [showSuccessStories, setShowSuccessStories] = useState(false);

  const openLoginDialog = (type: 'login' | 'register', userType: string) => {
    setSelectedRole(userType);
    if (type === 'register') {
      setShowRegistrationDialog(true);
    } else {
      setShowLoginDialog(true);
    }
  };

  const closeLoginDialog = () => {
    setShowLoginDialog(false);
  };

  const closeRegistrationDialog = () => {
    setShowRegistrationDialog(false);
  };

  const handleLoginSuccess = (userName: string) => {
    setUser({ role: selectedRole, name: userName });
    closeLoginDialog();
  };

  const handleRegistrationSuccess = (userData: any) => {
    setUser({ role: userData.role, name: userData.fullName });
    closeRegistrationDialog();
  };

  const handleLogout = () => {
    setUser(null);
    setShowSuccessStories(false);
  };

  // If user is logged in, show appropriate dashboard
  if (user) {
    switch (user.role) {
      case 'student':
        return <StudentDashboard user={user} onLogout={handleLogout} />;
      case 'job-seeker':
        return <EnhancedJobSeekerDashboard user={user} onLogout={handleLogout} />;
      case 'employee':
        return <EmployeeDashboard user={user} onLogout={handleLogout} />;
      case 'employer':
        return <EmployerDashboard user={user} onLogout={handleLogout} />;
      case 'colleges':
        return <CollegeDashboard user={user} onLogout={handleLogout} />;
      case 'admin':
        return <AdminDashboard user={user} onLogout={handleLogout} />;
      case 'super-admin':
        return <SuperAdminDashboard user={user} onLogout={handleLogout} />;
      default:
        return <StudentDashboard user={user} onLogout={handleLogout} />;
    }
  }

  if (showSuccessStories) {
    return <SuccessStories onBack={() => setShowSuccessStories(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar onOpenAuth={openLoginDialog} />
      <Hero onOpenAuth={openLoginDialog} />
      
      {/* Image Slider Section */}
      <ImageSlider />
      
      {/* Course Cards Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Courses</h2>
            <p className="text-lg text-gray-600">Choose from our top-rated courses to accelerate your career</p>
          </div>
          <CourseCards onCourseClick={() => openLoginDialog('login', 'student')} />
          
          <div className="text-center mt-12">
            <Button 
              onClick={() => setShowSuccessStories(true)}
              className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white px-8 py-3 text-lg"
            >
              View Success Stories
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <FeaturesSection />
      <AboutSection />
      <PartnersSection />
      <Footer />
      
      <LoginDialog 
        isOpen={showLoginDialog}
        onClose={closeLoginDialog}
        onLoginSuccess={handleLoginSuccess}
        selectedRole={selectedRole}
      />

      <EnhancedRegistrationDialog
        isOpen={showRegistrationDialog}
        onClose={closeRegistrationDialog}
        onRegisterSuccess={handleRegistrationSuccess}
      />
    </div>
  );
};

export default Index;
