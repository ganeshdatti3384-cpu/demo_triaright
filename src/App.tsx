import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Courses from './pages/Courses';
import Contact from './pages/Contact';
import About from './pages/About';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import ChangePassword from './pages/ChangePassword';
import AdminDashboard from './pages/AdminDashboard';
import CollegeDashboard from './pages/CollegeDashboard';
import TrainerDashboard from './pages/TrainerDashboard';
import CourseDetails from './pages/CourseDetails';
import Pack365 from './pages/Pack365';
import Pack365Details from './pages/Pack365Details';
import StreamPage from './pages/StreamPage';
import StreamDetails from './pages/StreamDetails';
import ExamPage from './pages/ExamPage';
import ExamDetails from './pages/ExamDetails';
import MockTests from './pages/MockTests';
import MockTestDetails from './pages/MockTestDetails';
import EnrollmentCodes from './pages/EnrollmentCodes';
import CreateEnrollmentCode from './pages/CreateEnrollmentCode';
import EditEnrollmentCode from './pages/EditEnrollmentCode';
import Colleges from './pages/Colleges';
import Employers from './pages/Employers';
import Students from './pages/Students';
import JobSeekers from './pages/JobSeekers';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import { AuthResponse } from './types/api';

interface DecodedToken {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

const App: React.FC = () => {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    try {
      if (token) {
        const decodedToken = jwtDecode<DecodedToken>(token);
        if (decodedToken.exp * 1000 < Date.now()) {
          logout();
        } else {
          setUserFromToken(token);
        }
      }
    } catch (error) {
      console.error('JWT Decode Error:', error);
      logout();
    }
  }, [token]);

  const setUserFromToken = (jwtToken: string) => {
    try {
      const decodedToken = jwtDecode<DecodedToken>(jwtToken);
      setUser({
        userId: decodedToken.userId,
        email: decodedToken.email,
        role: decodedToken.role,
      });
      localStorage.setItem('token', jwtToken);
      setToken(jwtToken);
    } catch (error) {
      console.error('Error decoding or setting user from token:', error);
      logout();
    }
  };

  const login = (authResponse: AuthResponse) => {
    setUserFromToken(authResponse.token!);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  interface ProtectedRouteProps {
    allowedRoles: string[];
    children: React.ReactNode;
  }

  const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
    if (!user) {
      return <Navigate to="/login" />;
    }

    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/unauthorized" />;
    }

    return <>{children}</>;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={login} />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:courseId" element={<CourseDetails />} />
        <Route path="/pack365" element={<Pack365 />} />
        <Route path="/pack365/:bundleId" element={<Pack365Details />} />
        <Route path="/stream" element={<StreamPage />} />
        <Route path="/stream/:streamId" element={<StreamDetails />} />
        <Route path="/exams" element={<ExamPage />} />
        <Route path="/exams/:examId" element={<ExamDetails />} />
        <Route path="/mock-tests" element={<MockTests />} />
        <Route path="/mock-tests/:mockTestId" element={<MockTestDetails />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={['admin', 'student', 'jobseeker', 'employer', 'college', 'trainer']}>
            <Profile user={user} />
          </ProtectedRoute>
        } />
        <Route path="/edit-profile" element={
          <ProtectedRoute allowedRoles={['admin', 'student', 'jobseeker', 'employer', 'college', 'trainer']}>
            <EditProfile user={user} />
          </ProtectedRoute>
        } />
        <Route path="/change-password" element={
          <ProtectedRoute allowedRoles={['admin', 'student', 'jobseeker', 'employer', 'college', 'trainer']}>
            <ChangePassword user={user} onLogout={logout} />
          </ProtectedRoute>
        } />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super-admin']}>
              <AdminDashboard user={user} onLogout={logout} />
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
          path="/trainer-dashboard"
          element={
            <ProtectedRoute allowedRoles={['trainer']}>
              <TrainerDashboard user={user} onLogout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/enrollment-codes"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super-admin']}>
              <EnrollmentCodes user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/enrollment-codes/create"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super-admin']}>
              <CreateEnrollmentCode user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/enrollment-codes/edit/:codeId"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super-admin']}>
              <EditEnrollmentCode user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/colleges"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super-admin']}>
              <Colleges user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employers"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super-admin']}>
              <Employers user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super-admin']}>
              <Students user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/job-seekers"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super-admin']}>
              <JobSeekers user={user} />
            </ProtectedRoute>
          }
        />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
