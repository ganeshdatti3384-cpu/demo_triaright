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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/courses/recorded" element={<RecordedCourses />} />
          <Route path="/courses/live" element={<LiveCourses />} />
          <Route path="/courses/recorded/:courseId" element={<CourseDetail />} />
          <Route path="/courses/live/:courseId" element={<CourseDetail />} />
          <Route path="/pack365" element={<Pack365 />} />
          <Route path="/pack365/payment/:courseId" element={<Pack365Payment />} />
          <Route path="/internships/online" element={<OnlineInternships />} />
          <Route path="/internships/offline" element={<OfflineInternships />} />
          <Route path="/jobs/assurance" element={<JobAssurance />} />
          <Route path="/jobs/assistance" element={<JobAssistance />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          <Route path="/course-enrollment/free/:courseId" element={<FreeCourseEnrollment />} />
          <Route path="/course-enrollment/paid/:courseId" element={<PaidCourseEnrollment />} />
          <Route path="/student" element={<StudentDashboard user={{ role: 'student', name: 'Student' }} onLogout={() => window.location.href = '/'} />} />
          <Route path="/job-seeker" element={<JobSeekerDashboard user={{ role: 'job-seeker', name: 'Job Seeker' }} onLogout={() => window.location.href = '/'} />} />
          <Route path="/employee" element={<EmployeeDashboard user={{ role: 'employee', name: 'Employee' }} onLogout={() => window.location.href = '/'} />} />
          <Route path="/employer" element={<EmployerDashboard user={{ role: 'employer', name: 'Employer' }} onLogout={() => window.location.href = '/'} />} />
          <Route path="/college" element={<CollegeDashboard user={{ role: 'colleges', name: 'College' }} onLogout={() => window.location.href = '/'} />} />
          <Route path="/admin" element={<AdminDashboard user={{ role: 'admin', name: 'Admin' }} onLogout={() => window.location.href = '/'} />} />
          <Route path="/super-admin" element={<SuperAdminDashboard user={{ role: 'super-admin', name: 'Super Admin' }} onLogout={() => window.location.href = '/'} />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
