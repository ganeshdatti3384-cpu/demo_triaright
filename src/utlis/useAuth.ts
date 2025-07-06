
import React, { createContext, useContext, useState, useEffect } from 'react';

// User Roles
export type UserRole = 'student' | 'jobseeker' | 'employee' | 'employer' | 'college' | 'admin' | 'superadmin';

// User Interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Auth Context Interface
interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: { fullName: string; email: string; password: string; mobileNumber?: string }) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  canAccessAdmin: boolean;
  loading: boolean;
  profileCompletion: number;
  setProfileCompletion: React.Dispatch<React.SetStateAction<number>>;
  userRole: UserRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [canAccessAdmin, setCanAccessAdmin] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileCompletion, setProfileCompletion] = useState<number>(0);

  // Restore user from localStorage on load
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("currentUser");

    if (storedToken && storedUser) {
      try {
        const user = JSON.parse(storedUser) as User;
        setToken(storedToken);
        setCurrentUser(user);
        setIsAuthenticated(true);
        setUserRole(user.role);
        setCanAccessAdmin(['admin', 'superadmin'].includes(user.role));
      } catch (err) {
        console.error("Failed to parse stored user:", err);
      }
    }

    setLoading(false);
  }, []);

  // Login API
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.token || !data.user) {
        console.error('Login failed:', data.message);
        return false;
      }

      const user: User = {
        id: data.user._id,
        name: `${data.user.firstName} ${data.user.lastName}`,
        email: data.user.email,
        role: data.user.role,
      };

      localStorage.setItem('token', data.token);
      localStorage.setItem('currentUser', JSON.stringify(user));

      setToken(data.token);
      setCurrentUser(user);
      setIsAuthenticated(true);
      setUserRole(user.role);
      setCanAccessAdmin(['admin', 'superadmin'].includes(user.role));
      return true;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  };

  // Register - You can extend this to call your API
  const register = async (userData: { fullName: string; email: string; password: string; mobileNumber?: string }): Promise<boolean> => {
    try {
      // Optional: Call register API
      // await fetch('/api/users/register', { method: 'POST', ... })

      // Simulate auto-login after register
      return await login(userData.email, userData.password);
    } catch (err) {
      console.error("Registration error:", err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    setToken(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
    setUserRole(null);
    setCanAccessAdmin(false);
    setProfileCompletion(0);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      login,
      register,
      logout,
      isAuthenticated,
      canAccessAdmin,
      loading,
      profileCompletion,
      setProfileCompletion,
      userRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
