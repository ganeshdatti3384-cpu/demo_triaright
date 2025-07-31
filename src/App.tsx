
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Forgotpassword from '@/pages/Forgotpassword';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Index from '@/pages/Index';
import ContactUs from '@/pages/ContactUs';
import AboutUs from '@/pages/AboutUs';
import { EnhancedStudentDashboard } from '@/components/dashboards/EnhancedStudentDashboard';
import { CollegeDashboard } from '@/components/dashboards/CollegeDashboard';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard';
import CoursesPage from '@/pages/Index';
import CourseEnrollment from '@/pages/CourseEnrollment';
import CoursePayment from '@/pages/CoursePayment';
import PaymentSuccess from '@/pages/PaymentSuccess';
import PaymentFailed from '@/pages/PaymentFailed';
import CouponCode from '@/pages/CouponCode';
import PaymentSelection from '@/pages/PaymentSelection';
import RazorpayPayment from '@/pages/RazorpayPayment';
import Pack365 from '@/pages/Pack365';
import Pack365Payment from '@/pages/Pack365Payment';
import PaidCourseEnrollment from '@/pages/PaidCourseEnrollment';
import RecordedCourses from '@/pages/RecordedCourses';
import LiveCourses from '@/pages/LiveCourses';
import NotFound from '@/pages/NotFound';

const App = () => {
  const { user, token, login, logout, updateUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('currentUser');
    
    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        login(userData, storedToken);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        logout();
      }
    }
    setLoading(false);
  }, [login, logout]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) => {
    if (!token) {
      return <Navigate to="/login" replace />;
    }

    if (requiredRole && user?.role !== requiredRole) {
      toast({
        title: 'Unauthorized',
        description: 'You do not have permission to access this page.',
        variant: 'destructive',
      });
      return <Navigate to="/" replace />;
    }

    return <>{children}</>;
  };

  return (
    <Router>
      <Toaster />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<Forgotpassword />} />

        <Route path="/" element={<><Navbar /><Index /><Footer /></>} />
        <Route path="/contact" element={<><Navbar /><ContactUs /><Footer /></>} />
        <Route path="/about" element={<><Navbar /><AboutUs /><Footer /></>} />
        <Route path="/courses" element={<><Navbar /><CoursesPage /><Footer /></>} />
        <Route path="/course-enrollment/:courseId" element={<><Navbar /><CourseEnrollment /><Footer /></>} />
        <Route path="/course-payment/:courseId" element={<><Navbar /><CoursePayment /><Footer /></>} />
        <Route path="/payment-success" element={<><Navbar /><PaymentSuccess /><Footer /></>} />
        <Route path="/payment-failed" element={<><Navbar /><PaymentFailed /><Footer /></>} />
        <Route path="/coupon-code" element={<><Navbar /><CouponCode /><Footer /></>} />
        <Route path="/payment-selection" element={<><Navbar /><PaymentSelection /><Footer /></>} />
        <Route path="/razorpay-payment" element={<><Navbar /><RazorpayPayment /><Footer /></>} />
        <Route path="/pack365" element={<><Navbar /><Pack365 /><Footer /></>} />
        <Route path="/pack365-payment" element={<><Navbar /><Pack365Payment /><Footer /></>} />
        <Route path="/paid-course-enrollment/:courseId" element={<><Navbar /><PaidCourseEnrollment /><Footer /></>} />
        <Route path="/courses/recorded" element={<><Navbar /><RecordedCourses /><Footer /></>} />
        <Route path="/courses/live" element={<><Navbar /><LiveCourses /><Footer /></>} />

        <Route
          path="/student"
          element={
            <ProtectedRoute requiredRole="student">
              <><Navbar /><EnhancedStudentDashboard /><Footer /></>
            </ProtectedRoute>
          }
        />
        
        <Route path="/college" element={
            <ProtectedRoute requiredRole="college">
              <CollegeDashboard user={user} onLogout={logout} />
            </ProtectedRoute>
          } />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard user={user} onLogout={logout} />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<><Navbar /><NotFound /><Footer /></>} />
      </Routes>
    </Router>
  );
};

export default App;
