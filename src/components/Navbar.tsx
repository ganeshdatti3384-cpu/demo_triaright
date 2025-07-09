
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate('/register', { replace: true });
  };

  const handleMenuItemClick = (path: string) => {
    if (path !== '#') {
      navigate(path);
    }
  };

  const handleLogoClick = () => {
    if (isAuthenticated && user?.role) {
      navigate(`/${user.role}`);
    } else {
      navigate('/');
    }
  };

  const handleDashboardClick = () => {
    if (isAuthenticated && user?.role) {
      navigate(`/${user.role}`);
    }
  };

  const handleProfileClick = () => {
    if (user?.role) {
      navigate(`/${user.role}/profile`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getWelcomeMessage = () => {
    if (!user) return '';
    const name = user.firstName || user.name || 'User';
    return `Welcome, ${name}!`;
  };

  return (
    <nav className="bg-white/90 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button onClick={handleLogoClick} className="flex items-center hover:opacity-80 transition-opacity">
              <img
                src="/lovable-uploads/cdf8ab47-8b3d-4445-820a-e1e1baca31e0.png"
                alt="TriaRight - The New Era Of Learning"
                className="h-10 w-auto"
              />
            </button>
          </div>


          {/* Desktop Auth/Profile Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                {/* Welcome message for students, job seekers, employees, employers */}
                {['student', 'jobseeker', 'employee', 'employer'].includes(user.role) ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center space-x-2">
                        <User className="h-5 w-5 text-brand-primary" />
                        <span className="text-sm font-medium text-gray-700">
                          {getWelcomeMessage()}
                        </span>
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-40 bg-white border shadow-lg">
                      <DropdownMenuItem
                        className="cursor-pointer flex items-center space-x-2"
                        onClick={handleProfileClick}
                      >
                        <User className="h-4 w-4 text-gray-600" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer flex items-center space-x-2 text-red-600"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  /* Welcome message and logout button for admin/super-admin */
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700">
                      {getWelcomeMessage()}
                    </span>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="flex items-center space-x-2 border-red-500 text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <>
                <Button
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="border-brand-primary text-brand-primary hover:bg-blue-50"
                >
                  Login
                </Button>

                <Button
                  onClick={handleRegisterClick}
                  className="bg-brand-primary hover:bg-blue-700 text-white"
                >
                  Register
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
