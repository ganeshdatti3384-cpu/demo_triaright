/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

export interface User {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  name?: string;
  email: string;
  role: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (userData: any, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check localStorage for existing auth data
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setToken(savedToken);
        setIsAuthenticated(true);
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userRole');
      }
    }
  }, []);

  const login = (userData: any, authToken: string) => {
    // Transform the API user data to match our User interface
    const transformedUser: User = {
      id: userData.userId || userData._id || userData.id,
      userId: userData.userId,
      firstName: userData.firstName,
      lastName: userData.lastName,
      name: userData.name || `${userData.firstName} ${userData.lastName}`,
      email: userData.email,
      role: userData.role,
      phoneNumber: userData.phoneNumber,
      whatsappNumber: userData.whatsappNumber,
      address: userData.address
    };

    setUser(transformedUser);
    setToken(authToken);
    setIsAuthenticated(true);
    
    // Save to localStorage
    localStorage.setItem('token', authToken);
    localStorage.setItem('currentUser', JSON.stringify(transformedUser));
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', transformedUser.role);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      login,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
