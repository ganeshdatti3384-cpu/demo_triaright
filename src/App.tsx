
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./utlis/useAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RecordedCourses from "./pages/RecordedCourses";
import OnlineInternships from "./pages/OnlineInternships";
import OfflineInternships from "./pages/OfflineInternships";
import JobAssurance from "./pages/JobAssurance";
import JobAssistance from "./pages/JobAssistance";
import NotFound from "./pages/NotFound";
import LiveCourses from "./pages/LiveCourses";
import CourseDetail from "./pages/CourseDetail";
import Pack365 from "./pages/Pack365";
import Pack365Payment from "./pages/Pack365Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import FreeCourseEnrollment from "./pages/FreeCourseEnrollment";
import PaidCourseEnrollment from "./pages/PaidCourseEnrollment";
import SimplifiedStudentDashboard from "./components/dashboards/SimplifiedStudentDashboard";
import JobSeekerDashboard from "./components/dashboards/JobSeekerDashboard";
import EmployeeDashboard from "./components/dashboards/EmployeeDashboard";
import EmployerDashboard from "./components/dashboards/EmployerDashboard";
import CollegeDashboard from "./components/dashboards/CollegeDashboard";
import AdminDashboard from "./components/dashboards/AdminDashboard";
import SuperAdminDashboard from "./components/dashboards/SuperAdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import EnhancedProfile from "./components/EnhancedProfile";
import ForgotPassword from "./pages/Forgotpassword";
import StudentDashboard from "./components/dashboards/StudentDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />          
            <Route path="/courses/recorded" element={<RecordedCourses />} />
            <Route path="/courses/live" element={<LiveCourses />} />
            <Route path="/courses/recorded/:courseId" element={<CourseDetail />} />
            <Route path="/courses/live/:courseId" element={<CourseDetail />} />
            <Route path="/internships/online" element={<OnlineInternships />} />
            <Route path="/internships/offline" element={<OfflineInternships />} />
            <Route path="/jobs/assurance" element={<JobAssurance />} />
            <Route path="/jobs/assistance" element={<JobAssistance />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-failed" element={<PaymentFailed />} />
            <Route path="/course-enrollment/free/:courseId" element={<FreeCourseEnrollment />} />
            <Route path="/course-enrollment/paid/:courseId" element={<PaidCourseEnrollment />} />
            
            {/* Protected Pack365 Routes */}
            <Route path="/pack365" element={
              <ProtectedRoute allowedRoles={['student', 'jobseeker']}>
                <Pack365 />
              </ProtectedRoute>
            } />
            <Route path="/pack365/payment/:courseId" element={
              <ProtectedRoute allowedRoles={['student', 'jobseeker']}>
                <Pack365Payment />
              </ProtectedRoute>
            } />
            
            {/* Student Dashboard Routes */}
            <Route path="/student" element={
              <ProtectedRoute allowedRoles={['student']}>
                <SimplifiedStudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/student/profile" element={
              <ProtectedRoute allowedRoles={['student']}>
                <EnhancedProfile />
              </ProtectedRoute>
            } />
            <Route path="/student/courses" element={
              <ProtectedRoute allowedRoles={['student']}>
                <RecordedCourses />
              </ProtectedRoute>
            } />
            
            {/* Job Seeker Dashboard Routes */}
            <Route path="/jobseeker" element={
              <ProtectedRoute allowedRoles={['jobseeker']}>
                <JobSeekerDashboard user={{ role: 'jobseeker', name: 'Job Seeker' }} onLogout={() => window.location.href = '/'} />
              </ProtectedRoute>
            } />
            <Route path="/jobseeker/profile" element={
              <ProtectedRoute allowedRoles={['jobseeker']}>
                <EnhancedProfile />
              </ProtectedRoute>
            } />
            
            {/* Employee Dashboard Routes */}
            <Route path="/employee" element={
              <ProtectedRoute allowedRoles={['employee']}>
                <EmployeeDashboard user={{ role: 'employee', name: 'Employee' }} onLogout={() => window.location.href = '/'} />
              </ProtectedRoute>
            } />
            <Route path="/employee/profile" element={
              <ProtectedRoute allowedRoles={['employee']}>
                <EnhancedProfile />
              </ProtectedRoute>
            } />
            
            {/* Employer Dashboard Routes */}
            <Route path="/employer" element={
              <ProtectedRoute allowedRoles={['employer']}>
                <EmployerDashboard user={{ role: 'employer', name: 'Employer' }} onLogout={() => window.location.href = '/'} />
              </ProtectedRoute>
            } />
            <Route path="/employer/profile" element={
              <ProtectedRoute allowedRoles={['employer']}>
                <EnhancedProfile />
              </ProtectedRoute>
            } />
            
            {/* College Dashboard Routes */}
            <Route path="/college" element={
              <ProtectedRoute allowedRoles={['college']}>
                <CollegeDashboard user={{ role: 'college', name: 'College' }} onLogout={() => window.location.href = '/'} />
              </ProtectedRoute>
            } />
            <Route path="/college/profile" element={
              <ProtectedRoute allowedRoles={['college']}>
                <EnhancedProfile />
              </ProtectedRoute>
            } />
            
            {/* Admin Dashboard Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard user={{ role: 'admin', name: 'Admin' }} onLogout={() => window.location.href = '/'} />
              </ProtectedRoute>
            } />
            
            {/* Super Admin Dashboard Routes */}
            <Route path="/super-admin" element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <SuperAdminDashboard user={{ role: 'superadmin', name: 'Super Admin' }} onLogout={() => window.location.href = '/'} />
              </ProtectedRoute>
            } />
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
