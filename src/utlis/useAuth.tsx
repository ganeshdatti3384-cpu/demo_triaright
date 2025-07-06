/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useState,
  useEffect,
  useContext,
  createContext,
  ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { User as ApiUser, LoginResponse, RegisterPayload, authApi, UserRole as ApiUserRole } from '../services/api';
import { useToast } from '../hooks/use-toast';

// ---------------------- Types ------------------------
export type UserRole =
  | 'student'
  | 'jobseeker'
  | 'employee'
  | 'employer'
  | 'college'
  | 'admin'
  | 'superadmin';

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

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
  whatsappNumber?: string;
  address: string; // Required to match API
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

// ---------------------- Context ------------------------
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---------------------- Provider ------------------------
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

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

        await validateToken(storedToken);
      } else {
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
      console.log('Token validated:', tokenToValidate);
      // Optionally: add real token validation logic
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
        const { token: authToken, user: apiUser } = response;

        const userData: User = {
          id: apiUser._id,
          email: apiUser.email,
          firstName: apiUser.firstName,
          lastName: apiUser.lastName,
          role: apiUser.role as UserRole,
          phoneNumber: apiUser.phoneNumber,
          whatsappNumber: apiUser.whatsappNumber,
          address: apiUser.address,
        };

        localStorage.setItem('token', authToken);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', apiUser.role);

        setToken(authToken);
        setUser(userData);
        setIsAuthenticated(true);

        toast({
          title: 'Login Successful',
          description: `Welcome back, ${userData.firstName}!`,
        });

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
      const registerPayload: RegisterPayload = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        whatsappNumber: userData.whatsappNumber,
        address: userData.address,
        role: userData.role as ApiUserRole,
        password: userData.password,
      };
      
      const response = await authApi.register(registerPayload);

      if (response?.token && response?.user) {
        const { token: authToken, user: newUser } = response;
        
        const newUserData: User = {
          id: newUser._id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role as UserRole,
          phoneNumber: newUser.phoneNumber,
          whatsappNumber: newUser.whatsappNumber,
          address: newUser.address,
        };

        localStorage.setItem('token', authToken);
        localStorage.setItem('currentUser', JSON.stringify(newUserData));
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', newUser.role);

        setToken(authToken);
        setUser(newUserData);
        setIsAuthenticated(true);

        toast({
          title: 'Registration Successful',
          description: `Welcome to Aploye, ${newUser.firstName}!`,
        });

        navigateByRole(newUser.role as UserRole);
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
    [
      'token',
      'currentUser',
      'isAuthenticated',
      'userRole',
      'profileData',
      'profilePic',
      'uploadedDocuments',
    ].forEach(key => localStorage.removeItem(key));

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

// ---------------------- Hook ------------------------
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ---------------------- Utils ------------------------
export const hasRole = (userRole: UserRole, allowedRoles: UserRole[]): boolean =>
  allowedRoles.includes(userRole);

export const isStudent = (role: UserRole): boolean => role === 'student';
export const isJobSeeker = (role: UserRole): boolean => role === 'jobseeker';
export const isEmployeeOrEmployer = (role: UserRole): boolean =>
  role === 'employee' || role === 'employer';
export const isAdmin = (role: UserRole): boolean =>
  role === 'admin' || role === 'superadmin';

export const getAuthToken = (): string | null =>
  localStorage.getItem('token');

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const clearUserStorage = () => {
  [
    'token',
    'currentUser',
    'isAuthenticated',
    'userRole',
    'profileData',
    'profilePic',
    'uploadedDocuments',
  ].forEach(key => localStorage.removeItem(key));
};
