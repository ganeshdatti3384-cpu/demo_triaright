
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import StudentDashboard from "./components/dashboards/StudentDashboard";
import JobSeekerDashboard from "./components/dashboards/JobSeekerDashboard";
import EmployeeDashboard from "./components/dashboards/EmployeeDashboard";
import EmployerDashboard from "./components/dashboards/EmployerDashboard";
import CollegeDashboard from "./components/dashboards/CollegeDashboard";
import AdminDashboard from "./components/dashboards/AdminDashboard";
import SuperAdminDashboard from "./components/dashboards/SuperAdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
          
          {/* Protected Routes */}
          <Route path="/pack365" element={
            <ProtectedRoute allowedRoles={['student', 'job-seeker']}>
              <Pack365 />
            </ProtectedRoute>
          } />
          <Route path="/pack365/payment/:courseId" element={
            <ProtectedRoute allowedRoles={['student', 'job-seeker']}>
              <Pack365Payment />
            </ProtectedRoute>
          } />
          
          {/* Dashboard Routes */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard user={{ role: 'student', name: 'Student' }} onLogout={() => window.location.href = '/'} />
            </ProtectedRoute>
          } />
          <Route path="/job-seeker" element={
            <ProtectedRoute allowedRoles={['job-seeker']}>
              <JobSeekerDashboard user={{ role: 'job-seeker', name: 'Job Seeker' }} onLogout={() => window.location.href = '/'} />
            </ProtectedRoute>
          } />
          <Route path="/employee" element={
            <ProtectedRoute allowedRoles={['employee']}>
              <EmployeeDashboard user={{ role: 'employee', name: 'Employee' }} onLogout={() => window.location.href = '/'} />
            </ProtectedRoute>
          } />
          <Route path="/employer" element={
            <ProtectedRoute allowedRoles={['employer']}>
              <EmployerDashboard user={{ role: 'employer', name: 'Employer' }} onLogout={() => window.location.href = '/'} />
            </ProtectedRoute>
          } />
          <Route path="/college" element={
            <ProtectedRoute allowedRoles={['colleges']}>
              <CollegeDashboard user={{ role: 'colleges', name: 'College' }} onLogout={() => window.location.href = '/'} />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard user={{ role: 'admin', name: 'Admin' }} onLogout={() => window.location.href = '/'} />
            </ProtectedRoute>
          } />
          <Route path="/super-admin" element={
            <ProtectedRoute allowedRoles={['super-admin']}>
              <SuperAdminDashboard user={{ role: 'super-admin', name: 'Super Admin' }} onLogout={() => window.location.href = '/'} />
            </ProtectedRoute>
          } />
          
          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
