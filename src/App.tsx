import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider, User } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminDashboard from './components/dashboards/AdminDashboard';
import CollegeDashboard from './components/dashboards/CollegeDashboard';
import StudentDashboard from './components/dashboards/StudentDashboard';
import Pack365Courses from './components/Pack365Courses';
import Pack365Courses2 from './components/Pack365Courses2';
import CouponCode from './pages/CouponCode';
import PaymentSelection from './pages/PaymentSelection';
import BundleDetails from './pages/BundleDetails';
import { Toaster } from '@/components/ui/toaster';
import { ScrollToTop } from './utils/utils';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <AppContent />
      </Router>
      <Toaster />
    </AuthProvider>
  );
};

const AppContent: React.FC = () => {
  const { authData, user, login, logout } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAuthData = localStorage.getItem('authData');
    if (storedAuthData) {
      try {
        const parsedAuthData = JSON.parse(storedAuthData);
        // Basic validation of the parsed data
        if (parsedAuthData && parsedAuthData.token && parsedAuthData.user) {
          login(parsedAuthData.user, parsedAuthData.token);
        }
      } catch (error) {
        console.error('Error parsing authData from localStorage:', error);
        // Handle the error, possibly by clearing the invalid data
        localStorage.removeItem('authData');
      }
    }
    setLoading(false);
  }, [login]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const determineDashboard = (): JSX.Element => {
    if (!authData) {
      return <Navigate to="/login" replace />;
    }

    switch (user?.role) {
      case 'admin':
        return (
          <AdminDashboard
            user={user}
            onLogout={logout}
          />
        );
      case 'student':
        return (
          <StudentDashboard
            user={user}
            onLogout={logout}
          />
        );
      case 'college':
        return (
          <CollegeDashboard 
            user={user} 
            onLogout={logout}
          />
        );
      default:
        return <Navigate to="/login" replace />;
    }
  };

  return (
    <Routes>
      <Route path="/login" element={authData ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={authData ? <Navigate to="/" replace /> : <RegistrationPage />} />
      <Route path="/forgot-password" element={authData ? <Navigate to="/" replace /> : <ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={authData ? <Navigate to="/" replace /> : <ResetPasswordPage />} />
      <Route path="/pack365" element={<Pack365Courses />} />
      <Route path="/pack365v2" element={<Pack365Courses2 />} />
      <Route path="/coupon-code" element={<CouponCode />} />
      <Route path="/payment-selection" element={<PaymentSelection />} />
      <Route path="/pack365/bundle/:bundleName" element={<BundleDetails />} />
      <Route path="/" element={determineDashboard()} />
    </Routes>
  );
};

export default App;
