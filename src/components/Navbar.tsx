// In Navbar.tsx, replace the Jobs button with this dropdown
import React, { useState, useEffect } from 'react';
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

  // Prevent back navigation for students
  useEffect(() => {
    if (isAuthenticated && user?.role === 'student') {
      const preventBackNavigation = () => {
        window.history.pushState(null, '', window.location.href);
      };

      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', preventBackNavigation);

      return () => {
        window.removeEventListener('popstate', preventBackNavigation);
      };
    }
  }, [isAuthenticated, user?.role]);

  const courseTypes = [
    { name: 'Live Courses', description: 'Interactive real-time learning', path: '/live-courses' },
    { name: 'Recorded Courses', description: 'Learn at your own pace', path: '/recorded-courses' },
    ...(user?.role === 'student' || user?.role === 'jobseeker'
      ? [{ name: 'Pack365', description: 'Complete annual learning program', path: '/pack365' }]
      : []),
  ];

  // Jobs dropdown items
  const jobsItems = [
    { 
      name: 'Browse Jobs', 
      description: 'Find opportunities', 
      path: '/jobs',
      icon: Briefcase
    },
    { 
      name: 'Job Assistance', 
      description: 'Career support', 
      path: '/jobs/assistance',
      icon: Users
    }
  ];

  const handleRegisterClick = () => {
    navigate('/register', { replace: true });
  };

  const handleMenuItemClick = (path: string) => {
    if (path !== '#') {
      navigate(path);
    }
    // Close mobile menu after navigation
    setIsMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    if (!isAuthenticated || user?.role !== 'student') {
      navigate('/');
    }
  };

  const handleDashboardClick = () => {
    if (isAuthenticated && user?.role) {
      navigate(`/${user.role}`, { replace: true });
    }
  };

  const handleProfileClick = () => {
    if (user?.role) {
      navigate(`/${user.role}/profile`, { replace: true });
    }
  };

  const handleAdminDashboardClick = () => {
    navigate('/admin', { replace: true });
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const getWelcomeMessage = () => {
    if (!user) return '';
    const name = user.firstName || user.name || 'User';
    return `Welcome, ${name}!`;
  };

  const getStudentName = () => {
    if (!user) return 'Student';
    return user.firstName || user.name || 'Student';
  };

  // Direct navigation to internships page
  const handleInternshipsClick = () => {
    navigate('/internships');
    setIsMobileMenuOpen(false);
  };

  // Direct navigation to Pack365 page
  const handlePack365Click = () => {
    navigate('/pack365');
    setIsMobileMenuOpen(false);
  };

  // Check if user is admin or super-admin
  const isAdminUser = user?.role === 'admin' || user?.role === 'superadmin';

  // Check if user is student - hide all navigation
  const isStudent = user?.role === 'student';

  return (
    <nav className="bg-white/90 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Only show if not student */}
          {!isStudent ? (
            <div className="flex-shrink-0">
              <button onClick={handleLogoClick} className="flex items-center hover:opacity-80 transition-opacity">
                <img
                  src="/lovable-uploads/LOGO.png"
                  alt="TriaRight - The New Era Of Learning"
                  className="h-10 w-auto"
                />
              </button>
            </div>
          ) : (
            // Student view - Show only student name as title
            <div className="flex-shrink-0">
              <div className="flex items-center">
                <span className="text-xl font-semibold text-gray-900">
                  {getStudentName()}
                </span>
              </div>
            </div>
          )}

          {/* Desktop Navigation - HIDDEN FOR STUDENTS */}
          {!isStudent && (
            <div className="hidden md:flex items-center space-x-8">
              {/* Courses Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-1 text-gray-700 hover:text-brand-primary transition-colors">
                  <span>Courses</span>
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white border shadow-lg">
                  {courseTypes.map((item) => (
                    <DropdownMenuItem
                      key={item.name}
                      className="p-3 cursor-pointer"
                      onClick={() => handleMenuItemClick(item.path)}
                    >
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.description}</div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Jobs Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-1 text-gray-700 hover:text-brand-primary transition-colors">
                  <span>Jobs</span>
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-white border shadow-lg">
                  {jobsItems.map((item) => (
                    <DropdownMenuItem
                      key={item.name}
                      className="p-3 cursor-pointer"
                      onClick={() => handleMenuItemClick(item.path)}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="h-4 w-4 text-gray-600" />
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.description}</div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Direct Internships Link */}
              <Button
                variant="ghost"
                onClick={handleInternshipsClick}
                className="text-gray-700 hover:text-brand-primary transition-colors"
              >
                Internships
              </Button>

              {/* Direct Pack365 Link */}
              <Button
                variant="ghost"
                onClick={handlePack365Click}
                className="text-gray-700 hover:text-brand-primary transition-colors"
              >
                Pack365
              </Button>
            </div>
          )}

          {/* Desktop Auth/Profile Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                {/* Student View - Minimal dropdown with only Dashboard and Logout */}
                {isStudent ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center space-x-2">
                        <User className="h-5 w-5 text-brand-primary" />
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-40 bg-white border shadow-lg">
                      <DropdownMenuItem
                        className="cursor-pointer flex items-center space-x-2"
                        onClick={handleDashboardClick}
                      >
                        <LayoutDashboard className="h-4 w-4 text-gray-600" />
                        <span>Dashboard</span>
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
                  /* Regular user view */
                  ['student', 'jobseeker', 'employee', 'employer'].includes(user.role) ? (
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
                          onClick={handleDashboardClick}
                        >
                          <LayoutDashboard className="h-4 w-4 text-gray-600" />
                          <span>Dashboard</span>
                        </DropdownMenuItem>
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
                    /* Admin Dashboard link for admin/super-admin */
                    <div className="flex items-center space-x-4">
                      <Button
                        onClick={handleAdminDashboardClick}
                        variant="outline"
                        className="flex items-center space-x-2 border-brand-primary text-brand-primary hover:bg-blue-50"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </Button>
                      <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="flex items-center space-x-2 border-red-500 text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </Button>
                    </div>
                  )
                )}
              </>
            ) : (
              /* Login/Register buttons for non-authenticated users */
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

          {/* Mobile menu button - Hidden for students */}
          {!isStudent && (
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          )}

          {/* Student mobile menu button - Only dropdown trigger */}
          {isStudent && (
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40 bg-white border shadow-lg">
                  <DropdownMenuItem
                    className="cursor-pointer flex items-center space-x-2"
                    onClick={handleDashboardClick}
                  >
                    <LayoutDashboard className="h-4 w-4 text-gray-600" />
                    <span>Dashboard</span>
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
            </div>
          )}
        </div>

        {/* Mobile Navigation - HIDDEN FOR STUDENTS */}
        {!isStudent && isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4">
            <div className="space-y-4">
              {/* Courses Section */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Courses</h3>
                {courseTypes.map((item) => (
                  <div
                    key={item.name}
                    className="pl-4 text-sm text-gray-600 cursor-pointer hover:text-brand-primary"
                    onClick={() => handleMenuItemClick(item.path)}
                  >
                    {item.name}
                  </div>
                ))}
              </div>

              {/* Jobs Section */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Jobs</h3>
                {jobsItems.map((item) => (
                  <div
                    key={item.name}
                    className="pl-4 text-sm text-gray-600 cursor-pointer hover:text-brand-primary flex items-center space-x-2"
                    onClick={() => handleMenuItemClick(item.path)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>

              {/* Direct Links Section */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Quick Links</h3>
                <div
                  className="pl-4 text-sm text-gray-600 cursor-pointer hover:text-brand-primary"
                  onClick={handleInternshipsClick}
                >
                  Internships
                </div>
                <div
                  className="pl-4 text-sm text-gray-600 cursor-pointer hover:text-brand-primary"
                  onClick={handlePack365Click}
                >
                  Pack365
                </div>
              </div>

              {/* Dashboard Link - Mobile */}
              {isAuthenticated && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">Navigation</h3>
                  <div
                    className="pl-4 text-sm text-gray-600 cursor-pointer hover:text-brand-primary flex items-center space-x-2"
                    onClick={handleDashboardClick}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Account</h3>
                <div className="flex flex-col space-y-2 pl-4">
                  {isAuthenticated && user ? (
                    <>
                      <span className="text-sm text-gray-700">{getWelcomeMessage()}</span>
                      {['student', 'jobseeker', 'employee', 'employer'].includes(user.role) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleProfileClick}
                          className="border-brand-primary text-brand-primary"
                        >
                          Profile
                        </Button>
                      )}
                      {(user.role === 'admin' || user.role === 'superadmin') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAdminDashboardClick}
                          className="border-brand-primary text-brand-primary flex items-center space-x-2"
                        >
                          <Settings className="h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleLogout}
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/login')}
                        className="border-brand-primary text-brand-primary"
                      >
                        Login
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleRegisterClick}
                        className="bg-brand-primary hover:bg-blue-700"
                      >
                        Register
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
