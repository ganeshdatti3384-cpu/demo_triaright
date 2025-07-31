import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

// Import components
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Forgotpassword from '@/pages/Forgotpassword';
import EnhancedStudentDashboard from '@/components/EnhancedStudentDashboard';
import CollegeDashboard from '@/components/CollegeDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import ScrollToTop from '@/components/ScrollToTop';

// Create a query client
const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  const { user, token, login, logout, role } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<Forgotpassword />} />
          
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                {role === 'student' ? (
                  <EnhancedStudentDashboard user={user} onLogout={handleLogout} />
                ) : role === 'college' ? (
                  <CollegeDashboard user={user} onLogout={handleLogout} />
                ) : role === 'admin' ? (
                  <AdminDashboard user={user} onLogout={handleLogout} />
                ) : (
                  <div>Unauthorized</div>
                )}
              </ProtectedRoute>
            }
          />
        </Routes>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
