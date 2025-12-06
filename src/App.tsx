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
import Pack365BundleDetail from '@/pages/Pack365BundleDetail';
import JobAssurance from '@/pages/JobAssurance';
import JobAssistance from '@/pages/JobAssistance';
import TermsConditions from '@/pages/TermsConditions';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import RefundPolicy from '@/pages/RefundPolicy';
import CourseDetail from '@/pages/CourseDetail';
import CourseEnrollment from '@/pages/CourseEnrollment';
import CoursePayment from '@/pages/CoursePayment';
import Pack365Payment from '@/pages/Pack365Payment';
import PaymentSuccess from '@/pages/PaymentSuccess';
import PaymentFailed from '@/pages/PaymentFailed';
import AboutUs from '@/pages/AboutUs';
import Services from '@/pages/Services';
import ContactUs from '@/pages/ContactUs';
import StudentDashboard from '@/components/dashboards/StudentDashboard';
import JobSeekerDashboard from '@/components/dashboards/JobSeekerDashboard';
import EmployeeDashboard from '@/components/dashboards/EmployeeDashboard';
import EmployerDashboard from '@/components/dashboards/EmployerDashboard';
import CollegeDashboard from '@/components/dashboards/CollegeDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import SuperAdminDashboard from '@/components/dashboards/SuperAdminDashboard';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProfileCompletion from '@/components/ProfileCompletion';
import EnhancedProfile from '@/components/EnhancedProfile';
import CourseLearning from '@/pages/CourseLearning';
import ExamList from '@/pages/ExamList';
import ExamInterface from '@/components/pack365/ExamInterface';
import ExamResult from '@/components/pack365/ExamResult';
import NotFound from '@/pages/NotFound';
import CouponCode from '@/pages/CouponCode';
import PaymentSelection from '@/pages/PaymentSelection';
import RazorpayPayment from '@/pages/RazorpayPayment';
import StudentProfilePage from '@/components/profile/StudentProfilePage';
import JobSeekerProfilePage from '@/components/profile/JobSeekerProfilePage';
import EmployerProfilePage from '@/components/profile/EmployerProfilePage';
import Pack365Dashboard from '@/components/Pack365Dashboard';
import Pack365StreamLearning from '@/pages/Pack365StreamLearning';
import LearningInterface from '@/components/CourseLearningInterface2';
import Learning from '@/pages/CourseLearning2';
import InternshipDetailsPage from '@/components/internships/InternshipDetailsPage';
import RegularInternshipsPage from '@/components/internships/RegularInternshipsPage';
import APExclusiveInternshipsPage from '@/components/internships/APExclusiveInternshipsPage';
import JobsPage from '@/pages/JobsPage';
import CommunityPage from '@/components/community/CommunityPage';

import APStudentDashboard from '@/components/student/APStudentDashboard';
import APInternshipLearningPage from '@/components/student/APInternshipLearningPage';
import APTopicExamPage from './components/student/APTopicExamPage';
import APFinalExamPage from './components/student/APFinalExamPage';
import APCertificatePage from './components/student/APCertificatePage';
import StreamLearningInterface from '@/components/pack365/StreamLearningInterface';
import Pack365CertificatePage from '@/components/pack365/Pack365CertificatePage';
import CourseLearningInterface from '@/components/CourseLearningInterface'; // Add this import

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
          <Route path="/pack365/bundle/:streamName" element={<Pack365BundleDetail />} />
          <Route path="/community" element={<CommunityPage />} />
          
          {/* Jobs Routes */}
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/assistance" element={<JobAssistance />} />
          <Route path="/jobs/assurance" element={<JobAssurance />} />
          
          {/* Internship Routes */}
          <Route path="/internships/regular" element={<RegularInternshipsPage />} />
          <Route path="/internships/ap-exclusive" element={<APExclusiveInternshipsPage />} />
          <Route path="/internships/:id" element={<InternshipDetailsPage />} />
          
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/course-enrollment/:id" element={<CourseEnrollment />} />
          <Route path="/course-payment/:id" element={<CoursePayment />} />
          <Route path="/pack365/payment/:courseId" element={<Pack365Payment />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          <Route path="/pack365-stream/:streamName" element={<Pack365BundleDetail />} />
          <Route path="/ap-internship-exam/:courseId/:topicName" element={<APTopicExamPage />} />
          <Route path="/ap-internship-final-exam/:courseId" element={<APFinalExamPage />} />
          
          {/* AP Internship Certificate Route */}
          <Route
            path="/ap-internship-certificate/:enrollmentId"
            element={
              <ProtectedRoute allowedRoles={['student', 'jobseeker']}>
                <APCertificatePage />
              </ProtectedRoute>
            }
          />
          
          {/* Pack365 Certificate Route */}
          <Route
            path="/pack365-certificate/:enrollmentId?"
            element={
              <ProtectedRoute allowedRoles={['student', 'jobseeker']}>
                <Pack365CertificatePage />
              </ProtectedRoute>
            }
          />
          
          {/* Protected Payment Routes */}
          <Route
            path="/payment-selection"
            element={
              <ProtectedRoute allowedRoles={['student', 'jobseeker']}>
                <PaymentSelection />
              </ProtectedRoute>
            }
          />

          <Route
            path="/razorpay-payment"
            element={
              <ProtectedRoute allowedRoles={['student', 'jobseeker']}>
                <RazorpayPayment />
              </ProtectedRoute>
            }
          />
         
          <Route
            path="/coupon-code"
            element={
              <ProtectedRoute allowedRoles={['student', 'jobseeker']}>
                <CouponCode />
              </ProtectedRoute>
            }
          />
          
          {/* Pack365 Learning Routes - UNCHANGED */}
          <Route 
            path="/pack365-learning/:stream" 
            element={
              <ProtectedRoute allowedRoles={['student', 'jobseeker']}>
                <Pack365StreamLearning />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pack365-learning/:stream/course" 
            element={
              <ProtectedRoute allowedRoles={['student', 'jobseeker']}>
                <StreamLearningInterface />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pack365-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['student', 'jobseeker']}>
                <Pack365Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Regular Course Learning Route - UPDATED: Use CourseLearningInterface */}
          <Route
            path="/learning/:id"
            element={
              <ProtectedRoute allowedRoles={['student', 'jobseeker']}>
                <CourseLearningInterface />
              </ProtectedRoute>
            }
          />
          
          {/* Keep old route for backward compatibility */}
          <Route
            path="/course-learning/:id"
            element={
              <ProtectedRoute allowedRoles={['student', 'jobseeker']}>
                <CourseLearning />
              </ProtectedRoute>
            }
          />
          
          {/* Exam Routes */}
          <Route
            path="/exam/:examId"
            element={
              <ProtectedRoute allowedRoles={['student', 'jobseeker']}>
                <ExamInterface />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exam-result/:examId"
            element={
              <ProtectedRoute allowedRoles={['student', 'jobseeker']}>
                <ExamResult />
              </ProtectedRoute>
            }
          />
          
          {/* Protected Routes with Profile Completion */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <ProfileCompletion userRole="student">
                  <StudentDashboard />
                </ProfileCompletion>
              </ProtectedRoute>
            }
          />
          <Route
            path="/job-seeker"
            element={
              <ProtectedRoute allowedRoles={['jobseeker']}>
                <ProfileCompletion userRole="jobseeker">
                  <JobSeekerDashboard />
                </ProfileCompletion>
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
          
          {/* AP Internship Dashboard Route */}
          <Route
            path="/ap-internships/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student', 'jobseeker']}>
                <APStudentDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* AP Internship Learning Routes */}
          <Route
            path="/ap-internship-learning/:enrollmentId"
            element={
              <ProtectedRoute allowedRoles={['student', 'jobseeker']}>
                <APInternshipLearningPage />
              </ProtectedRoute>
            }
          />
          
          {/* Profile Routes */}
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/job-seeker/profile"
            element={
              <ProtectedRoute allowedRoles={['jobseeker']}>
                <JobSeekerProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/profile"
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <EmployerProfilePage />
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
          
          {/* Exam List Route */}
          <Route
            path="/exams"
            element={
              <ProtectedRoute allowedRoles={['student', 'jobseeker']}>
                <ExamList />
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
