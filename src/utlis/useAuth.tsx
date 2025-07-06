
import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

// Types
export type UserRole = 'student' | 'jobseeker' | 'employee' | 'employer' | 'college' | 'admin' | 'superadmin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
  whatsappNumber?: string;
  address?: string;
  isVerified?: boolean;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshAuth: () => Promise<void>;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
  whatsappNumber?: string;
  address?: string;
}

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Initialize auth state from localStorage
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('currentUser');
      const storedAuthStatus = localStorage.getItem('isAuthenticated');

      if (storedToken && storedUser && storedAuthStatus === 'true') {
        const userData = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Verify token is still valid
        await validateToken(storedToken);
      } else {
        // Clear any invalid stored data
        clearAuthData();
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const validateToken = async (tokenToValidate: string) => {
    try {
      // You can add a token validation API call here if available
      // For now, we'll assume the token is valid if it exists
      console.log('Token validated:', tokenToValidate);
    } catch (error) {
      console.error('Token validation failed:', error);
      clearAuthData();
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authApi.login({ email, password });

      if (response?.token && response?.user) {
        const { token: authToken, user: userData } = response;

        // Store in localStorage
        localStorage.setItem('token', authToken);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', userData.role);

        // Update state
        setToken(authToken);
        setUser(userData);
        setIsAuthenticated(true);

        toast({
          title: 'Login Successful',
          description: `Welcome back, ${userData.firstName}!`,
        });

        // Navigate based on role
        navigateByRole(userData.role);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: error?.response?.data?.message || 'Invalid credentials',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authApi.register(userData);

      if (response?.token && response?.user) {
        const { token: authToken, user: newUser } = response;

        // Store in localStorage
        localStorage.setItem('token', authToken);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', newUser.role);

        // Update state
        setToken(authToken);
        setUser(newUser);
        setIsAuthenticated(true);

        toast({
          title: 'Registration Successful',
          description: `Welcome to Aploye, ${newUser.firstName}!`,
        });

        // Navigate based on role
        navigateByRole(newUser.role);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration Failed',
        description: error?.response?.data?.message || 'Registration failed',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuthData();
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    navigate('/');
  };

  const clearAuthData = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('profileData');
    localStorage.removeItem('profilePic');
    localStorage.removeItem('uploadedDocuments');

    // Clear state
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  const refreshAuth = async () => {
    await initializeAuth();
  };

  const navigateByRole = (role: UserRole) => {
    switch (role) {
      case 'student':
        navigate('/student');
        break;
      case 'jobseeker':
        navigate('/jobseeker');
        break;
      case 'employee':
        navigate('/employee');
        break;
      case 'employer':
        navigate('/employer');
        break;
      case 'college':
        navigate('/college');
        break;
      case 'admin':
        navigate('/admin');
        break;
      case 'superadmin':
        navigate('/super-admin');
        break;
      default:
        navigate('/');
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper functions for role-based access
export const hasRole = (userRole: UserRole, allowedRoles: UserRole[]): boolean => {
  return allowedRoles.includes(userRole);
};

export const isStudent = (role: UserRole): boolean => {
  return role === 'student';
};

export const isJobSeeker = (role: UserRole): boolean => {
  return role === 'jobseeker';
};

export const isEmployeeOrEmployer = (role: UserRole): boolean => {
  return role === 'employee' || role === 'employer';
};

export const isAdmin = (role: UserRole): boolean => {
  return role === 'admin' || role === 'superadmin';
};

// Token utilities
export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Storage utilities
export const clearUserStorage = () => {
  const keysToRemove = [
    'token',
    'currentUser',
    'isAuthenticated',
    'userRole',
    'profileData',
    'profilePic',
    'uploadedDocuments'
  ];
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
};

export default useAuth;
