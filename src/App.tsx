/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Register } from '@/pages/Register';
import { Login } from '@/pages/Login';
import { Profile } from '@/pages/Profile';
import { UpdatePassword } from '@/pages/UpdatePassword';
import { ForgotPassword } from '@/pages/ForgotPassword';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { Pack365 } from '@/pages/Pack365';
import Pack365CourseDetails from '@/pages/Pack365CourseDetails';
import Pack365Learning from '@/pages/Pack365Learning';
import Pack365Dashboard from '@/components/Pack365Dashboard';
import { CollegeDashboard } from '@/components/dashboards/CollegeDashboard';
import { JobSeekerDashboard } from '@/components/dashboards/JobSeekerDashboard';
import { EmployerDashboard } from '@/components/dashboards/EmployerDashboard';
import { StudentProfileForm } from '@/components/profile-forms/StudentProfileForm';
import { CollegeProfileForm } from '@/components/profile-forms/CollegeProfileForm';
import { JobSeekerProfileForm } from '@/components/profile-forms/JobSeekerProfileForm';
import { EmployerProfileForm } from '@/components/profile-forms/EmployerProfileForm';
import { CreateEnrollmentCode } from '@/pages/CreateEnrollmentCode';
import { ManageEnrollmentCodes } from '@/pages/ManageEnrollmentCodes';
import { ExamUpload } from '@/pages/ExamUpload';
import { Exam } from '@/pages/Exam';
import { ExamHistory } from '@/pages/ExamHistory';
import { ExamStatistics } from '@/pages/ExamStatistics';
import { AvailableExams } from '@/pages/AvailableExams';
import { CollegeServiceRequest } from '@/pages/CollegeServiceRequest';
import { MyServiceRequests } from '@/pages/MyServiceRequests';
import { AllServiceRequests } from '@/pages/AllServiceRequests';

function App() {
  const { user, isAuthenticated, logout } = useAuth();
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    document.title = 'TriARight';
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/profile" />} />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/profile" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/update-password" element={isAuthenticated ? <UpdatePassword /> : <Navigate to="/login" />} />
        <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/student-profile-form" element={isAuthenticated ? <StudentProfileForm /> : <Navigate to="/login" />} />
        <Route path="/college-profile-form" element={isAuthenticated ? <CollegeProfileForm /> : <Navigate to="/login" />} />
        <Route path="/jobseeker-profile-form" element={isAuthenticated ? <JobSeekerProfileForm /> : <Navigate to="/login" />} />
        <Route path="/employer-profile-form" element={isAuthenticated ? <EmployerProfileForm /> : <Navigate to="/login" />} />
        <Route path="/pack365" element={<Pack365 />} />
        <Route path="/pack365-course/:courseId" element={<Pack365CourseDetails />} />
        <Route path="/pack365-learning/:courseId" element={isAuthenticated ? <Pack365Learning /> : <Navigate to="/login" />} />
        <Route path="/pack365-dashboard" element={isAuthenticated ? <Pack365Dashboard /> : <Navigate to="/login" />} />
        <Route path="/create-enrollment-code" element={isAuthenticated ? <CreateEnrollmentCode /> : <Navigate to="/login" />} />
        <Route path="/manage-enrollment-codes" element={isAuthenticated ? <ManageEnrollmentCodes /> : <Navigate to="/login" />} />
        <Route path="/exam-upload" element={isAuthenticated ? <ExamUpload /> : <Navigate to="/login" />} />
        <Route path="/exam/:examId" element={isAuthenticated ? <Exam /> : <Navigate to="/login" />} />
        <Route path="/exam-history/:courseId" element={isAuthenticated ? <ExamHistory /> : <Navigate to="/login" />} />
        <Route path="/exam-statistics/:courseId" element={isAuthenticated ? <ExamStatistics /> : <Navigate to="/login" />} />
        <Route path="/available-exams" element={isAuthenticated ? <AvailableExams /> : <Navigate to="/login" />} />
        <Route path="/college-service-request" element={isAuthenticated ? <CollegeServiceRequest /> : <Navigate to="/login" />} />
        <Route path="/my-service-requests" element={isAuthenticated ? <MyServiceRequests /> : <Navigate to="/login" />} />
        <Route path="/all-service-requests" element={isAuthenticated ? <AllServiceRequests /> : <Navigate to="/login" />} />
        <Route
          path="/admin-dashboard"
          element={
            isAuthenticated && userRole === 'superadmin' ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              userRole === 'jobseeker' ? (
                <JobSeekerDashboard user={user} onLogout={logout} />
              ) : userRole === 'employer' ? (
                <EmployerDashboard user={user} onLogout={logout} />
              ) : userRole === 'college' ? (
                <CollegeDashboard user={user} onLogout={logout} />
              ) : (
                <Profile />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
