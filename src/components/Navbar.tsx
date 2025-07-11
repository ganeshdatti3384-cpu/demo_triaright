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

  const courseTypes = [
    { name: 'Live Courses', description: 'Interactive real-time learning', path: '/courses/live' },
    { name: 'Recorded Courses', description: 'Learn at your own pace', path: '/courses/recorded' },
    ...(user?.role === 'student' || user?.role === 'jobseeker'
      ? [{ name: 'Pack365', description: 'Complete annual learning program', path: '/pack365' }]
      : []),
  ];

  const jobTypes = [
    { name: 'Job Assurance', description: 'Guaranteed placement programs', path: '/jobs/assurance' },
    { name: 'Job Assistance', description: 'Career support and guidance', path: '/jobs/assistance' },
  ];

  const internshipTypes = [
    { name: 'Online Internships', description: 'Remote opportunities', path: '/internships/online' },
    { name: 'Offline Internships', description: 'On-site experiences', path: '/internships/offline' },
  ];

  const trainingTypes = [
    { name: 'CRT Training', description: 'Campus Recruitment Training', path: '#' },
    { name: 'Technical Training', description: 'Skill-specific programs', path: '#' },
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

          {/* Desktop Navigation */}
          {!isAuthenticated && (
          <div className="hidden md:flex items-center space-x-8">
            {/* Menu Dropdowns */}
            {[
              { label: 'Courses', items: courseTypes },
              { label: 'Jobs', items: jobTypes },
              { label: 'Internships', items: internshipTypes },
              { label: 'Training', items: trainingTypes }
            ].map((menu) => (
              <DropdownMenu key={menu.label}>
                <DropdownMenuTrigger className="flex items-center space-x-1 text-gray-700 hover:text-brand-primary transition-colors">
                  <span>{menu.label}</span>
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white border shadow-lg">
                  {menu.items.map((item) => (
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
            ))}
          </div>
        )}

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

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4">
            <div className="space-y-4">
              {[{ title: 'Courses', items: courseTypes },
                { title: 'Jobs', items: jobTypes },
                { title: 'Internships', items: internshipTypes }].map((section) => (
                <div className="space-y-2" key={section.title}>
                  <h3 className="font-semibold text-gray-900">{section.title}</h3>
                  {section.items.map((item) => (
                    <div
                      key={item.name}
                      className="pl-4 text-sm text-gray-600 cursor-pointer hover:text-brand-primary"
                      onClick={() => handleMenuItemClick(item.path)}
                    >
                      {item.name}
                    </div>
                  ))}
                </div>
              ))}

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
