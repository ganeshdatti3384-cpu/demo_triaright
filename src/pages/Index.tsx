
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FeaturesSection from '../components/FeaturesSection';
import AboutSection from '../components/AboutSection';
import PartnersSection from '../components/PartnersSection';
import Footer from '../components/Footer';
import DynamicRegistrationForm from '../components/DynamicRegistrationForm';
import StudentDashboard from '../components/dashboards/StudentDashboard';
import JobSeekerDashboard from '../components/dashboards/JobSeekerDashboard';
import EmployeeDashboard from '../components/dashboards/EmployeeDashboard';
import EmployerDashboard from '../components/dashboards/EmployerDashboard';
import CollegeDashboard from '../components/dashboards/CollegeDashboard';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import SuperAdminDashboard from '../components/dashboards/SuperAdminDashboard';

const Index = () => {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [user, setUser] = useState<{ role: string; name: string } | null>(null);

  const openRegistrationForm = () => {
    setShowRegistrationForm(true);
  };

  const closeRegistrationForm = () => {
    setShowRegistrationForm(false);
  };

  const handleRegistrationSuccess = (data: any) => {
    setUser({ role: data.role, name: data.fullName });
    closeRegistrationForm();
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
      <Navbar onOpenAuth={openRegistrationForm} />
      <Hero onOpenAuth={openRegistrationForm} />
      <FeaturesSection />
      <AboutSection />
      <PartnersSection />
      <Footer />
      
      <DynamicRegistrationForm 
        isOpen={showRegistrationForm}
        onClose={closeRegistrationForm}
        onSuccess={handleRegistrationSuccess}
      />
    </div>
  );
};

export default Index;
