
import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const token = localStorage.getItem('token');
  const currentUser = localStorage.getItem('currentUser');
  
  // If no authentication data, redirect to login
  if (!isAuthenticated || !token || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(currentUser);
    const userRole = user.role;

    // If user role is not allowed for this route, redirect to their dashboard
    if (userRole && !allowedRoles.includes(userRole)) {
      // Redirect to user's role-specific dashboard
      switch (userRole) {
        case 'student':
          return <Navigate to="/student" replace />;
        case 'jobseeker':
          return <Navigate to="/job-seeker" replace />;
        case 'employee':
          return <Navigate to="/employee" replace />;
        case 'employer':
          return <Navigate to="/employer" replace />;
        case 'college':
          return <Navigate to="/college" replace />;
        case 'admin':
          return <Navigate to="/admin" replace />;
        case 'superadmin':
          return <Navigate to="/super-admin" replace />;
        default:
          return <Navigate to="/" replace />;
      }
    }

    return <>{children}</>;
  } catch (error) {
    // If user data is corrupted, clear it and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
