
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index from '@/pages/Index';
import Register from '@/pages/Register';
import Login from '@/pages/Login';
import RecordedCourses from '@/pages/RecordedCourses';
import LiveCourses from '@/pages/LiveCourses';
import CourseDetail from '@/pages/CourseDetail';
import CourseEnrollment from '@/pages/CourseEnrollment';
import FreeCourseEnrollment from '@/pages/FreeCourseEnrollment';
import PaidCourseEnrollment from '@/pages/PaidCourseEnrollment';
import CourseLearning from '@/pages/CourseLearning';
import CoursePayment from '@/pages/CoursePayment';
import Pack365 from '@/pages/Pack365';
import Pack365Payment from '@/pages/Pack365Payment';
import Pack365BundleDetail from '@/pages/Pack365BundleDetail';
import Pack365StreamLearning from '@/pages/Pack365StreamLearning';
import RazorpayPayment from '@/pages/RazorpayPayment';
import PaymentSelection from '@/pages/PaymentSelection';
import PaymentSuccess from '@/pages/PaymentSuccess';
import PaymentFailed from '@/pages/PaymentFailed';
import CouponCode from '@/pages/CouponCode';
import ExamInterface from '@/pages/ExamInterface';
import ExamList from '@/pages/ExamList';
import Services from '@/pages/Services';
import AboutUs from '@/pages/AboutUs';
import ContactUs from '@/pages/ContactUs';
import JobAssurance from '@/pages/JobAssurance';
import JobAssistance from '@/pages/JobAssistance';
import OnlineInternships from '@/pages/OnlineInternships';
import OfflineInternships from '@/pages/OfflineInternships';
import TermsConditions from '@/pages/TermsConditions';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import RefundPolicy from '@/pages/RefundPolicy';
import Forgotpassword from '@/pages/Forgotpassword';
import ChangePassword from '@/pages/ChangePassword';
import NotFound from '@/pages/NotFound';
import ProtectedRoute from '@/components/ProtectedRoute';
import EnhancedProfile from '@/components/EnhancedProfile';
import EnhancedStudentDashboard from '@/components/dashboards/EnhancedStudentDashboard';
import SimplifiedStudentDashboard from '@/components/dashboards/SimplifiedStudentDashboard';
import JobSeekerDashboard from '@/components/dashboards/JobSeekerDashboard';
import EmployerDashboard from '@/components/dashboards/EmployerDashboard';
import EmployeeDashboard from '@/components/dashboards/EmployeeDashboard';
import CollegeDashboard from '@/components/dashboards/CollegeDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import SuperAdminDashboard from '@/components/dashboards/SuperAdminDashboard';
import ScrollToTop from '@/components/ScrollToTop';
import { useAuth } from '@/hooks/useAuth';

const queryClient = new QueryClient();

function App() {
  const { user, logout } = useAuth();

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ScrollToTop />
        <div className="App">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<Forgotpassword />} />
            <Route path="/change-password" element={<ChangePassword />} />
            
            <Route path="/courses/recorded" element={<RecordedCourses />} />
            <Route path="/courses/live" element={<LiveCourses />} />
            <Route path="/course/:courseId" element={<CourseDetail />} />
            <Route path="/course-enrollment/:courseId" element={<CourseEnrollment />} />
            <Route path="/free-course-enrollment/:courseId" element={<FreeCourseEnrollment />} />
            <Route path="/paid-course-enrollment/:courseId" element={<PaidCourseEnrollment />} />
            <Route path="/course-learning/:courseId" element={<CourseLearning />} />
            <Route path="/course-payment/:courseId" element={<CoursePayment />} />
            
            <Route path="/pack365" element={<Pack365 />} />
            <Route path="/pack365-payment" element={<Pack365Payment />} />
            <Route path="/pack365/bundle/:streamName" element={<Pack365BundleDetail />} />
            <Route path="/pack365/stream/:streamName" element={<Pack365StreamLearning />} />
            <Route path="/razorpay-payment" element={<RazorpayPayment />} />
            <Route path="/payment-selection" element={<PaymentSelection />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-failed" element={<PaymentFailed />} />
            <Route path="/coupon-code" element={<CouponCode />} />
            
            <Route path="/exam/:examId" element={<ExamInterface />} />
            <Route path="/exams" element={<ExamList />} />
            
            <Route path="/services" element={<Services />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/job-assurance" element={<JobAssurance />} />
            <Route path="/job-assistance" element={<JobAssistance />} />
            <Route path="/online-internships" element={<OnlineInternships />} />
            <Route path="/offline-internships" element={<OfflineInternships />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />

            <Route 
              path="/profile" 
              element={
                <ProtectedRoute allowedRoles={['student', 'jobseeker', 'employer', 'employee', 'college', 'admin', 'superadmin']}>
                  <EnhancedProfile />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/student-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <EnhancedStudentDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/simplified-student-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <SimplifiedStudentDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/jobseeker-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['jobseeker']}>
                  <JobSeekerDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/employer-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['employer']}>
                  <EmployerDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/employee-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/college-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['college']}>
                  <CollegeDashboard user={user} onLogout={logout} />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard user={user} onLogout={logout} />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/superadmin-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
