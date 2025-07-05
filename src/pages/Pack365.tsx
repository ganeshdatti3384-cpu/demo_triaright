
import React from 'react';
import Pack365Courses from '../components/Pack365Courses';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';

const Pack365 = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/');
  };

  const handleAuthClick = (type: 'login' | 'register', userType: string) => {
    if (type === 'login') {
      navigate('/login');
    } else {
      navigate('/register');
    }
  };

  return (
    <>
      <Navbar onOpenAuth={handleAuthClick} />
      <Pack365Courses />
      <Footer />
    </>
  );
};

export default Pack365;
