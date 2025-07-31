import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Index from '@/pages/Index';
import AboutUs from '@/pages/AboutUs';
import Services from '@/pages/Services';
import ContactUs from '@/pages/ContactUs';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Forgotpassword from '@/pages/Forgotpassword';
import ChangePassword from '@/pages/ChangePassword';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsConditions from '@/pages/TermsConditions';
import RefundPolicy from '@/pages/RefundPolicy';
import JobAssistance from '@/pages/JobAssistance';
import JobAssurance from '@/pages/JobAssurance';
import LiveCourses from '@/pages/LiveCourses';
import RecordedCourses from '@/pages/RecordedCourses';
import OnlineInternships from '@/pages/OnlineInternships';
import OfflineInternships from '@/pages/OfflineInternships';
import Pack365 from '@/pages/Pack365';
import Pack365BundleDetail from '@/pages/Pack365BundleDetail';
import Pack365StreamLearning from '@/pages/Pack365StreamLearning';
import Pack365Payment from '@/pages/Pack365Payment';
import CourseDetail from '@/pages/CourseDetail';
import CourseLearning from '@/pages/CourseLearning';
import CoursePayment from '@/pages/CoursePayment';
import CourseEnrollment from '@/pages/CourseEnrollment';
import FreeCourseEnrollment from '@/pages/FreeCourseEnrollment';
import PaidCourseEnrollment from '@/pages/PaidCourseEnrollment';
import PaymentSelection from '@/pages/PaymentSelection';
import RazorpayPayment from '@/pages/RazorpayPayment';
import PaymentSuccess from '@/pages/PaymentSuccess';
import PaymentFailed from '@/pages/PaymentFailed';
import CouponCode from '@/pages/CouponCode';
import ExamList from '@/pages/ExamList';
import ExamInterface from '@/pages/ExamInterface';

import EnhancedProfile from '@/pages/profile/EnhancedProfile';
import EnhancedStudentDashboard from '@/pages/student/EnhancedStudentDashboard';
import JobSeekerDashboard from '@/pages/jobseeker/JobSeekerDashboard';
import EmployerDashboard from '@/pages/employer/EmployerDashboard';
import EmployeeDashboard from '@/pages/employee/EmployeeDashboard';
import CollegeDashboard from '@/pages/college/CollegeDashboard';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import SuperAdminDashboard from '@/pages/superadmin/SuperAdminDashboard';

import NotFound from '@/pages/NotFound';
import ProtectedRoute from '@/components/ProtectedRoute';
import { LoginResponse } from '@/types/api';

const App = () => {
  const [user, setUser] = useState<LoginResponse['user'] | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <>
      <Toaster />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<Forgotpassword />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/job-assistance" element={<JobAssistance />} />
          <Route path="/job-assurance" element={<JobAssurance />} />
          <Route path="/live-courses" element={<LiveCourses />} />
          <Route path="/recorded-courses" element={<RecordedCourses />} />
          <Route path="/online-internships" element={<OnlineInternships />} />
          <Route path="/offline-internships" element={<OfflineInternships />} />
          <Route path="/pack365" element={<Pack365 />} />
          <Route path="/pack365/:bundleId" element={<Pack365BundleDetail />} />
          <Route path="/pack365-stream-learning/:streamId" element={<Pack365StreamLearning />} />
          <Route path="/pack365-payment/:streamId" element={<Pack365Payment />} />
          <Route path="/course/:courseId" element={<CourseDetail />} />
          <Route path="/course-learning/:courseId" element={<CourseLearning />} />
          <Route path="/course-payment/:courseId" element={<CoursePayment />} />
          <Route path="/course-enrollment/:courseId" element={<CourseEnrollment />} />
          <Route path="/free-course-enrollment/:courseId" element={<FreeCourseEnrollment />} />
          <Route path="/paid-course-enrollment/:courseId" element={<PaidCourseEnrollment />} />
          <Route path="/payment-selection/:courseId" element={<PaymentSelection />} />
          <Route path="/razorpay-payment/:courseId" element={<RazorpayPayment />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          <Route path="/coupon-code" element={<CouponCode />} />
          <Route path="/exam-list" element={<ExamList />} />
          <Route path="/exam/:examId" element={<ExamInterface />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<EnhancedProfile />} />
            <Route
              path="/student-dashboard"
              element={<EnhancedStudentDashboard user={user} onLogout={handleLogout} />}
            />
            <Route
              path="/jobseeker-dashboard"
              element={<JobSeekerDashboard user={user} onLogout={handleLogout} />}
            />
            <Route
              path="/employer-dashboard"
              element={<EmployerDashboard user={user} onLogout={handleLogout} />}
            />
            <Route
              path="/employee-dashboard"
              element={<EmployeeDashboard user={user} onLogout={handleLogout} />}
            />
            <Route
              path="/college-dashboard"
              element={<CollegeDashboard user={user} onLogout={handleLogout} />}
            />
            <Route
              path="/admin-dashboard"
              element={<AdminDashboard user={user} onLogout={handleLogout} />}
            />
            <Route
              path="/superadmin-dashboard"
              element={<SuperAdminDashboard user={user} onLogout={handleLogout} />}
            />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
    </>
  );
};

export default App;
