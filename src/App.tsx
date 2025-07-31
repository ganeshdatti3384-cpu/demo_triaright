import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import Contact from '@/pages/Contact';
import About from '@/pages/About';
import StudentDashboard from '@/pages/StudentDashboard';
import CollegeDashboard from '@/pages/CollegeDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import CoursesPage from '@/pages/CoursesPage';
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
import LiveClass from '@/pages/LiveClass';
import RecordedCourses from '@/pages/RecordedCourses';
import LiveCourses from '@/pages/LiveCourses';
import AllUsers from '@/pages/AllUsers';
import AllPayments from '@/pages/AllPayments';
import AllColleges from '@/pages/AllColleges';
import AddCourse from '@/pages/AddCourse';
import EditCourse from '@/pages/EditCourse';
import AddCollege from '@/pages/AddCollege';
import EditCollege from '@/pages/EditCollege';
import AddLiveCourse from '@/pages/AddLiveCourse';
import EditLiveCourse from '@/pages/EditLiveCourse';
import StreamDetails from '@/pages/StreamDetails';
import NotFound from '@/pages/NotFound';

const App = () => {
  const { user, setUser, token, setToken, setRole, handleLogout } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      authApi
        .getUserDetails(storedToken)
        .then((response) => {
          if (response.success && response.user) {
            setUser(response.user);
            setRole(response.user.role);
          } else {
            toast({
              title: 'Error',
              description: 'Failed to fetch user details. Please login again.',
              variant: 'destructive',
            });
            handleLogout();
          }
        })
        .catch(() => {
          toast({
            title: 'Error',
            description: 'Failed to fetch user details. Please login again.',
            variant: 'destructive',
          });
          handleLogout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [setToken, setUser, setRole, handleLogout, toast]);

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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
        <Route path="/contact" element={<><Navbar /><Contact /><Footer /></>} />
        <Route path="/about" element={<><Navbar /><About /><Footer /></>} />
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
        <Route path="/live-class" element={<><Navbar /><LiveClass /><Footer /></>} />
        <Route path="/courses/recorded" element={<><Navbar /><RecordedCourses /><Footer /></>} />
        <Route path="/courses/live" element={<><Navbar /><LiveCourses /><Footer /></>} />
        <Route path="/stream/:streamId" element={<><Navbar /><StreamDetails /><Footer /></>} />

        <Route
          path="/student"
          element={
            <ProtectedRoute requiredRole="student">
              <><Navbar /><StudentDashboard /><Footer /></>
            </ProtectedRoute>
          }
        />
        
        <Route path="/college" element={
            <ProtectedRoute requiredRole="college">
              <CollegeDashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="all-users" />} />
          <Route path="all-users" element={<AllUsers />} />
          <Route path="all-payments" element={<AllPayments />} />
          <Route path="all-colleges" element={<AllColleges />} />
          <Route path="add-course" element={<AddCourse />} />
          <Route path="edit-course/:courseId" element={<EditCourse />} />
          <Route path="add-college" element={<AddCollege />} />
          <Route path="edit-college/:collegeId" element={<EditCollege />} />
          <Route path="add-live-course" element={<AddLiveCourse />} />
          <Route path="edit-live-course/:courseId" element={<EditLiveCourse />} />
        </Route>

        <Route path="*" element={<><Navbar /><NotFound /><Footer /></>} />
      </Routes>
    </Router>
  );
};

export default App;
