

import React from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Routes, Route } from 'react-router-dom';
import ScrollToTop from '@/components/ScrollToTop';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/Forgotpassword';
import ChangePassword from '@/pages/ChangePassword';
import LiveCourses from '@/pages/LiveCourses';
import RecordedCourses from '@/pages/RecordedCourses';
import Pack365 from '@/pages/Pack365';
import JobAssurance from '@/pages/JobAssurance';
import JobAssistance from '@/pages/JobAssistance';
import OnlineInternships from '@/pages/OnlineInternships';
import OfflineInternships from '@/pages/OfflineInternships';
import TermsConditions from '@/pages/TermsConditions';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import RefundPolicy from '@/pages/RefundPolicy';
import CourseDetail from '@/pages/CourseDetail';
import CourseEnrollment from '@/pages/CourseEnrollment';
import CoursePayment from '@/pages/CoursePayment';
import Pack365Payment from '@/pages/Pack365Payment';
import PaymentSuccess from '@/pages/PaymentSuccess';
import PaymentFailed from '@/pages/PaymentFailed';
import StudentDashboard from '@/components/dashboards/StudentDashboard';
import JobSeekerDashboard from '@/components/dashboards/JobSeekerDashboard';
import EmployeeDashboard from '@/components/dashboards/EmployeeDashboard';
import EmployerDashboard from '@/components/dashboards/EmployerDashboard';
import CollegeDashboard from '@/components/dashboards/CollegeDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import SuperAdminDashboard from '@/components/dashboards/SuperAdminDashboard';
import ProtectedRoute from '@/components/ProtectedRoute';
import EnhancedProfile from '@/components/EnhancedProfile';
import CourseLearning from '@/pages/CourseLearning';
import ExamList from '@/pages/ExamList';
import ExamInterface from '@/pages/ExamInterface';
import NotFound from '@/pages/NotFound';
import CouponCode from './pages/CouponCode';

const queryClient = new QueryClient();

const App = () => {
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    window.location.href = '/';
  };

  const getCurrentUser = () => {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser) : null;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/live-courses" element={<LiveCourses />} />
          <Route path="/recorded-courses" element={<RecordedCourses />} />
          <Route path="/pack365" element={<Pack365 />} />
          <Route path="/jobs/assurance" element={<JobAssurance />} />
          <Route path="/jobs/assistance" element={<JobAssistance />} />
          <Route path="/internships/online" element={<OnlineInternships />} />
          <Route path="/internships/offline" element={<OfflineInternships />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/course-enrollment/:id" element={<CourseEnrollment />} />
          <Route path="/course-payment/:id" element={<CoursePayment />} />
          <Route path="/pack365/payment/:courseId" element={<Pack365Payment />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          <Route path="/paymentgateway" element={<Pack365Payment />} />
          <Route path="/Coupon-code" element={<CouponCode />} />
          
          {/* Protected Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobseeker"
            element={
              <ProtectedRoute allowedRoles={['jobseeker']}>
                <JobSeekerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee"
            element={
              <ProtectedRoute allowedRoles={['employee']}>
                <EmployeeDashboard user={getCurrentUser()} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer"
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <EmployerDashboard user={getCurrentUser()} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/college"
            element={
              <ProtectedRoute allowedRoles={['college']}>
                <CollegeDashboard user={getCurrentUser()} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard user={getCurrentUser()} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin"
            element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <SuperAdminDashboard user={getCurrentUser()} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <EnhancedProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobseeker/profile"
            element={
              <ProtectedRoute allowedRoles={['jobseeker']}>
                <EnhancedProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/profile"
            element={
              <ProtectedRoute allowedRoles={['employee']}>
                <EnhancedProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/profile"
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <EnhancedProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/course-learning/:courseId"
            element={
              <ProtectedRoute allowedRoles={['student', 'jobseeker']}>
                <CourseLearning />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exams"
            element={
              <ProtectedRoute allowedRoles={['student', 'jobseeker']}>
                <ExamList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exam/:examId"
            element={
              <ProtectedRoute allowedRoles={['student', 'jobseeker']}>
                <ExamInterface />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

