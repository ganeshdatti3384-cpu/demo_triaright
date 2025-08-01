import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import CollegeDashboard from './components/dashboards/CollegeDashboard';
import EmployerDashboard from './components/dashboards/EmployerDashboard';
import AdminDashboard from './components/dashboards/AdminDashboard';
import StudentDashboard from './components/dashboards/StudentDashboard';
import { AuthResponse } from './types/api';

const App: React.FC = () => {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData: AuthResponse['user']) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const ProtectedRoute = ({ allowedRoles, children }: { allowedRoles: string[], children: React.ReactNode }) => {
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
        <Route path="/login" element={<LoginPage onLogin={login} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<div>Unauthorized</div>} />

        <Route 
          path="/college-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['College']}>
              <CollegeDashboard user={user} onLogout={logout} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/employer-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['Employer']}>
              <EmployerDashboard user={user} onLogout={logout} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminDashboard user={user} onLogout={logout} />
            </ProtectedRoute>
          } 
        />

         <Route 
          path="/student-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['Student']}>
              <StudentDashboard user={user} onLogout={logout} />
            </ProtectedRoute>
          } 
        />

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
