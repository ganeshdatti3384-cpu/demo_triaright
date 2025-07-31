import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import CollegeDashboard from './components/dashboards/CollegeDashboard';
import EmployerDashboard from './components/dashboards/EmployerDashboard';
import JobSeekerDashboard from './components/dashboards/JobSeekerDashboard';
import AdminDashboard from './components/dashboards/AdminDashboard';
import Navbar from './components/Navbar';
import { Button } from '@/components/ui/button';

const AppContent = () => {
  const { user, logout } = useAuth();
  const userRole = localStorage.getItem('userRole');

  const handleLogout = () => {
    logout();
  };

  return (
    
      <Routes>
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
        <Route path="/" element={user ? <HomePage /> : <Navigate to="/login" />} />

        {userRole === 'college' && (
          <CollegeDashboard onLogout={handleLogout} />
        )}
        {userRole === 'employer' && (
          <EmployerDashboard onLogout={handleLogout} />
        )}
        {userRole === 'jobseeker' && (
          <JobSeekerDashboard onLogout={handleLogout} />
        )}
        {userRole === 'admin' && (
          <AdminDashboard onLogout={handleLogout} />
        )}
      </Routes>
    
  );
};

const App = () => {
  return (
    
      <AppContent />
    
  );
};

export default App;
