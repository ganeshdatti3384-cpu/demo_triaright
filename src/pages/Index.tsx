
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FeaturesSection from '../components/FeaturesSection';
import AboutSection from '../components/AboutSection';
import PartnersSection from '../components/PartnersSection';
import Footer from '../components/Footer';
import LoginDialog from '../components/LoginDialog';
import StudentDashboard from '../components/dashboards/StudentDashboard';
import JobSeekerDashboard from '../components/dashboards/JobSeekerDashboard';
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
  const [selectedRole, setSelectedRole] = useState<string>('student');
  const [user, setUser] = useState<{ role: string; name: string } | null>(null);
  const [showSuccessStories, setShowSuccessStories] = useState(false);

  const openLoginDialog = (type: 'login' | 'register', userType: string) => {
    setSelectedRole(userType);
    setShowLoginDialog(true);
  };

  const closeLoginDialog = () => {
    setShowLoginDialog(false);
  };

  const handleLoginSuccess = (userName: string) => {
    setUser({ role: selectedRole, name: userName });
    closeLoginDialog();
  };

  const handleLogout = () => {
    setUser(null);
    setShowSuccessStories(false);
  };

  if (user) {
    switch (user.role) {
      case 'student':
        return <StudentDashboard />;
      case 'job-seeker':
        return <JobSeekerDashboard />;
      case 'employee':
        return <EmployeeDashboard />;
      case 'employer':
        return <EmployerDashboard />;
      case 'colleges':
        return <CollegeDashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'super-admin':
        return <SuperAdminDashboard />;
      default:
        return <StudentDashboard />;
    }
  }

  if (showSuccessStories) {
    return <SuccessStories onBack={() => setShowSuccessStories(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar onOpenAuth={openLoginDialog} />
      <Hero onOpenAuth={openLoginDialog} />
      
      <ImageSlider />
      
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Courses</h2>
            <p className="text-lg text-gray-600">Choose from our top-rated courses to accelerate your career</p>
          </div>
          <CourseCards />
          
          <div className="text-center mt-12">
            <Button 
              onClick={() => setShowSuccessStories(true)}
              className="bg-brand-primary hover:bg-blue-700 text-white px-8 py-3 text-lg"
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
    </div>
  );
};

export default Index;
