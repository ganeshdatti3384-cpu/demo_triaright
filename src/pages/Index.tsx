
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FeaturesSection from '../components/FeaturesSection';
import AboutSection from '../components/AboutSection';
import PartnersSection from '../components/PartnersSection';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';
import StudentDashboard from '../components/dashboards/StudentDashboard';
import JobSeekerDashboard from '../components/dashboards/JobSeekerDashboard';
import EmployeeDashboard from '../components/dashboards/EmployeeDashboard';
import EmployerDashboard from '../components/dashboards/EmployerDashboard';
import CollegeDashboard from '../components/dashboards/CollegeDashboard';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import SuperAdminDashboard from '../components/dashboards/SuperAdminDashboard';

const Index = () => {
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; type: 'login' | 'register'; userType: string }>({ 
    isOpen: false, 
    type: 'login', 
    userType: 'student' 
  });

  const [user, setUser] = useState<{ role: string; name: string } | null>(null);

  const openAuthModal = (type: 'login' | 'register', userType: string) => {
    setAuthModal({ isOpen: true, type, userType });
  };

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, type: 'login', userType: 'student' });
  };

  const handleAuthSuccess = (userRole: string, userName: string) => {
    setUser({ role: userRole, name: userName });
    closeAuthModal();
  };

  const handleLogout = () => {
    setUser(null);
  };

  // If user is logged in, show appropriate dashboard
  if (user) {
    switch (user.role) {
      case 'student':
        return <StudentDashboard user={user} onLogout={handleLogout} />;
      case 'job-seeker':
        return <JobSeekerDashboard user={user} onLogout={handleLogout} />;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar onOpenAuth={openAuthModal} />
      <Hero onOpenAuth={openAuthModal} />
      <FeaturesSection />
      <AboutSection />
      <PartnersSection />
      <Footer />
      
      <AuthModal 
        isOpen={authModal.isOpen}
        type={authModal.type}
        userType={authModal.userType}
        onClose={closeAuthModal}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default Index;
