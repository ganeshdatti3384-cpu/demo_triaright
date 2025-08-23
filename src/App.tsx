
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import ScrollToTop from '@/components/ScrollToTop';

// Import pages
import Index from '@/pages/Index';
import AboutUs from '@/pages/AboutUs';
import ContactUs from '@/pages/ContactUs';
import Services from '@/pages/Services';
import Register from '@/pages/Register';
import Login from '@/pages/Login';
import RecordedCourses from '@/pages/RecordedCourses';
import LiveCourses from '@/pages/LiveCourses';
import CourseDetail from '@/pages/CourseDetail';
import CourseEnrollment from '@/pages/CourseEnrollment';
import PaidCourseEnrollment from '@/pages/PaidCourseEnrollment';
import FreeCourseEnrollment from '@/pages/FreeCourseEnrollment';
import CoursePayment from '@/pages/CoursePayment';
import PaymentSuccess from '@/pages/PaymentSuccess';
import PaymentFailed from '@/pages/PaymentFailed';
import Pack365 from '@/pages/Pack365';
import Pack365BundleDetail from '@/pages/Pack365BundleDetail';
import Pack365Payment from '@/pages/Pack365Payment';
import CouponCode from '@/pages/CouponCode';
import RazorpayPayment from '@/pages/RazorpayPayment';
import Pack365StreamLearning from '@/pages/Pack365StreamLearning';
import CourseLearning from '@/pages/CourseLearning';
import OnlineInternships from '@/pages/OnlineInternships';
import OfflineInternships from '@/pages/OfflineInternships';
import JobAssistance from '@/pages/JobAssistance';
import JobAssurance from '@/pages/JobAssurance';
import ExamList from '@/pages/ExamList';
import ExamInterface from '@/pages/ExamInterface';
import TermsConditions from '@/pages/TermsConditions';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import RefundPolicy from '@/pages/RefundPolicy';
import NotFound from '@/pages/NotFound';
import Forgotpassword from '@/pages/Forgotpassword';
import ChangePassword from '@/pages/ChangePassword';
import PaymentSelection from '@/pages/PaymentSelection';

// Import dashboards
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import SuperAdminDashboard from '@/components/dashboards/SuperAdminDashboard';
import StudentDashboard from '@/components/dashboards/StudentDashboard';
import EnhancedStudentDashboard from '@/components/dashboards/EnhancedStudentDashboard';
import SimplifiedStudentDashboard from '@/components/dashboards/SimplifiedStudentDashboard';
import JobSeekerDashboard from '@/components/dashboards/JobSeekerDashboard';
import EmployerDashboard from '@/components/dashboards/EmployerDashboard';
import EmployeeDashboard from '@/components/dashboards/EmployeeDashboard';
import CollegeDashboard from '@/components/dashboards/CollegeDashboard';

// Import profile components
import StudentProfilePage from '@/components/profile/StudentProfilePage';
import JobSeekerProfilePage from '@/components/profile/JobSeekerProfilePage';
import EmployerProfilePage from '@/components/profile/EmployerProfilePage';

// Create a query client
const queryClient = new QueryClient();

const App = () => {
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ScrollToTop />
        <div className="App">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/services" element={<Services />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/courses/recorded" element={<RecordedCourses />} />
            <Route path="/courses/live" element={<LiveCourses />} />
            <Route path="/course/:courseId" element={<CourseDetail />} />
            <Route path="/course-enrollment/:courseId" element={<CourseEnrollment />} />
            <Route path="/paid-course-enrollment/:courseId" element={<PaidCourseEnrollment />} />
            <Route path="/free-course-enrollment/:courseId" element={<FreeCourseEnrollment />} />
            <Route path="/course-payment/:courseId" element={<CoursePayment />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-failed" element={<PaymentFailed />} />
            <Route path="/pack365" element={<Pack365 />} />
            <Route path="/pack365/:streamName" element={<Pack365BundleDetail />} />
            <Route path="/pack365-payment" element={<Pack365Payment />} />
            <Route path="/coupon-code" element={<CouponCode />} />
            <Route path="/razorpay-payment" element={<RazorpayPayment />} />
            <Route path="/pack365-learning/:streamName" element={<Pack365StreamLearning />} />
            <Route path="/course-learning/:courseId" element={<CourseLearning />} />
            <Route path="/internships/online" element={<OnlineInternships />} />
            <Route path="/internships/offline" element={<OfflineInternships />} />
            <Route path="/job-assistance" element={<JobAssistance />} />
            <Route path="/job-assurance" element={<JobAssurance />} />
            <Route path="/exams" element={<ExamList />} />
            <Route path="/exam/:examId" element={<ExamInterface />} />
            <Route path="/terms" element={<TermsConditions />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/refund" element={<RefundPolicy />} />
            <Route path="/forgot-password" element={<Forgotpassword />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/payment-selection" element={<PaymentSelection />} />

            {/* Dashboard Routes */}
            <Route path="/admin" element={<AdminDashboard user={{ role: 'admin', name: 'Admin' }} onLogout={handleLogout} />} />
            <Route path="/superadmin" element={<SuperAdminDashboard user={{ role: 'superadmin', name: 'Super Admin' }} onLogout={handleLogout} />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student-dashboard" element={<EnhancedStudentDashboard user={{ role: 'student', name: 'Student' }} onLogout={handleLogout} />} />
            <Route path="/student-simple" element={<SimplifiedStudentDashboard user={{ role: 'student', name: 'Student' }} onLogout={handleLogout} />} />
            <Route path="/jobseeker" element={<JobSeekerDashboard user={{ role: 'jobseeker', name: 'Job Seeker' }} onLogout={handleLogout} />} />
            <Route path="/employer" element={<EmployerDashboard user={{ role: 'employer', name: 'Employer' }} onLogout={handleLogout} />} />
            <Route path="/employee" element={<EmployeeDashboard user={{ role: 'employee', name: 'Employee' }} onLogout={handleLogout} />} />
            <Route path="/college" element={<CollegeDashboard user={{ role: 'college', name: 'College' }} onLogout={handleLogout} />} />

            {/* Profile Routes */}
            <Route path="/profile/student" element={<StudentProfilePage />} />
            <Route path="/profile/jobseeker" element={<JobSeekerProfilePage />} />
            <Route path="/profile/employer" element={<EmployerProfilePage />} />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
};

export default App;
