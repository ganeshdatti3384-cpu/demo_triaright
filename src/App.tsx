import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/hooks/useAuth';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Forgotpassword from '@/pages/Forgotpassword';
import ChangePassword from '@/pages/ChangePassword';
import AboutUs from '@/pages/AboutUs';
import ContactUs from '@/pages/ContactUs';
import Services from '@/pages/Services';
import EnhancedStudentDashboard from '@/components/dashboards/EnhancedStudentDashboard';
import CollegeDashboard from '@/components/dashboards/CollegeDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import SuperAdminDashboard from '@/components/dashboards/SuperAdminDashboard';
import JobSeekerDashboard from '@/components/dashboards/JobSeekerDashboard';
import EmployerDashboard from '@/components/dashboards/EmployerDashboard';
import ProtectedRoute from '@/components/ProtectedRoute';
import RecordedCourses from '@/pages/RecordedCourses';
import LiveCourses from '@/pages/LiveCourses';
import OfflineInternships from '@/pages/OfflineInternships';
import OnlineInternships from '@/pages/OnlineInternships';
import JobAssurance from '@/pages/JobAssurance';
import JobAssistance from '@/pages/JobAssistance';
import CourseDetail from '@/pages/CourseDetail';
import CourseEnrollment from '@/pages/CourseEnrollment';
import FreeCourseEnrollment from '@/pages/FreeCourseEnrollment';
import PaidCourseEnrollment from '@/pages/PaidCourseEnrollment';
import CoursePayment from '@/pages/CoursePayment';
import Pack365 from '@/pages/Pack365';
import Pack365Payment from '@/pages/Pack365Payment';
import Pack365BundleDetail from '@/pages/Pack365BundleDetail';
import CourseLearning from '@/pages/CourseLearning';
import Pack365StreamLearning from '@/pages/Pack365StreamLearning';
import PaymentSelection from '@/pages/PaymentSelection';
import RazorpayPayment from '@/pages/RazorpayPayment';
import PaymentSuccess from '@/pages/PaymentSuccess';
import PaymentFailed from '@/pages/PaymentFailed';
import TermsConditions from '@/pages/TermsConditions';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import RefundPolicy from '@/pages/RefundPolicy';
import ExamInterface from '@/pages/ExamInterface';
import ExamList from '@/pages/ExamList';
import CouponCode from '@/pages/CouponCode';
import ScrollToTop from '@/components/ScrollToTop';

interface DashboardWrapperProps {
  component: React.ComponentType<{ user: any; onLogout: () => void }>;
}

const DashboardWrapper: React.FC<DashboardWrapperProps> = ({ component: Component }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

  return <Component user={user} onLogout={handleLogout} />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<Forgotpassword />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/services" element={<Services />} />
          <Route path="/courses/recorded" element={<RecordedCourses />} />
          <Route path="/courses/live" element={<LiveCourses />} />
          <Route path="/internships/offline" element={<OfflineInternships />} />
          <Route path="/internships/online" element={<OnlineInternships />} />
          <Route path="/job-assurance" element={<JobAssurance />} />
          <Route path="/job-assistance" element={<JobAssistance />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/enroll/:id" element={<CourseEnrollment />} />
          <Route path="/enroll/free/:id" element={<FreeCourseEnrollment />} />
          <Route path="/enroll/paid/:id" element={<PaidCourseEnrollment />} />
          <Route path="/payment/:id" element={<CoursePayment />} />
          <Route path="/pack365" element={<Pack365 />} />
          <Route path="/pack365/payment" element={<Pack365Payment />} />
          <Route path="/pack365/bundle/:id" element={<Pack365BundleDetail />} />
          <Route path="/learn/:id" element={<CourseLearning />} />
          <Route path="/pack365/learn/:stream" element={<Pack365StreamLearning />} />
          <Route path="/payment-selection" element={<PaymentSelection />} />
          <Route path="/payment/razorpay" element={<RazorpayPayment />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/refund" element={<RefundPolicy />} />
          <Route path="/exam/:examId" element={<ExamInterface />} />
          <Route path="/exams" element={<ExamList />} />
          <Route path="/coupon" element={<CouponCode />} />
          
          {/* Protected Dashboard Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardWrapper component={EnhancedStudentDashboard} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/college/dashboard"
            element={
              <ProtectedRoute allowedRoles={['college']}>
                <DashboardWrapper component={CollegeDashboard} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardWrapper component={AdminDashboard} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['super-admin']}>
                <DashboardWrapper component={SuperAdminDashboard} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobseeker/dashboard"
            element={
              <ProtectedRoute allowedRoles={['jobseeker']}>
                <DashboardWrapper component={JobSeekerDashboard} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <DashboardWrapper component={EmployerDashboard} />
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
