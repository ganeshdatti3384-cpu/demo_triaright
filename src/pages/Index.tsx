
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FeaturesSection from '../components/FeaturesSection';
import AboutSection from '../components/AboutSection';
import PartnersSection from '../components/PartnersSection';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';

const Index = () => {
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; type: 'login' | 'register'; userType: string }>({ 
    isOpen: false, 
    type: 'login', 
    userType: 'student' 
  });

  const openAuthModal = (type: 'login' | 'register', userType: string) => {
    setAuthModal({ isOpen: true, type, userType });
  };

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, type: 'login', userType: 'student' });
  };

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
      />
    </div>
  );
};

export default Index;
