import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

import ScrollToTop from './components/ScrollToTop';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import ContactUs from './pages/ContactUs';
import AboutUs from './pages/AboutUs';
import TermsConditions from './pages/TermsConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';
import FAQ from './pages/FAQ';
import NotFound from './pages/NotFound';
import EnhancedStudentDashboard from './pages/StudentDashboard';
import JobSeekerDashboard from './pages/JobSeekerDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import CollegeDashboard from './pages/CollegeDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Pack365 from './pages/Pack365';
import Pack365BundleDetail from './pages/Pack365BundleDetail';
import PaymentSelection from './pages/PaymentSelection';
import RazorpayPayment from './pages/RazorpayPayment';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import CouponCode from './pages/CouponCode';
import StreamPage from './pages/StreamPage';
import CoursePage from './pages/CoursePage';

const queryClient = new QueryClient();

function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
              <Route path="/contact-us" element={<ContactUs />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/terms-conditions" element={<TermsConditions />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/pack365" element={<Pack365 />} />
              <Route path="/pack365/bundle/:streamName" element={<Pack365BundleDetail />} />
              <Route path="/payment-selection" element={<ProtectedRoute><PaymentSelection /></ProtectedRoute>} />
              <Route path="/razorpay-payment" element={<ProtectedRoute><RazorpayPayment /></ProtectedRoute>} />
              <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
              <Route path="/payment-failed" element={<ProtectedRoute><PaymentFailure /></ProtectedRoute>} />
              <Route path="/Coupon-code" element={<ProtectedRoute><CouponCode /></ProtectedRoute>} />
              <Route path="/pack365/stream/:streamName" element={<ProtectedRoute><StreamPage /></ProtectedRoute>} />
              <Route path="/pack365/course/:courseId" element={<ProtectedRoute><CoursePage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard 
                      user={user} 
                      onLogout={() => {
                        logout();
                        navigate('/');
                      }}
                    />
                  </ProtectedRoute>
                } 
              />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const Dashboard = ({ user, onLogout }: { user: any; onLogout: () => void }) => {
  const navigate = useNavigate();

  if (!user) {
    return <div>Loading...</div>;
  }

  switch (user.role) {
    case 'student':
      return <EnhancedStudentDashboard user={user} onLogout={onLogout} />;
    case 'job_seeker':
      return <JobSeekerDashboard user={user} onLogout={onLogout} />;
    case 'employer':
      return <EmployerDashboard user={user} onLogout={onLogout} />;
    case 'college':
      return <CollegeDashboard user={user} onLogout={onLogout} />;
    case 'employee':
      return <EmployeeDashboard user={user} onLogout={onLogout} />;
    case 'admin':
      return <AdminDashboard user={user} onLogout={onLogout} />;
    case 'super_admin':
      return <SuperAdminDashboard user={user} onLogout={onLogout} />;
    default:
      return <div>Invalid user role</div>;
  }
};

export default App;
