
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onOpenAuth: (type: 'login' | 'register', userType: string) => void;
}

const Navbar = ({ onOpenAuth }: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const courseTypes = [
    { name: 'Live Courses', description: 'Interactive real-time learning' },
    { name: 'Recorded Courses', description: 'Learn at your own pace' }
  ];

  const jobTypes = [
    { name: 'Job Assurance', description: 'Guaranteed placement programs' },
    { name: 'Job Assistance', description: 'Career support and guidance' }
  ];

  const internshipTypes = [
    { name: 'Online Internships', description: 'Remote opportunities' },
    { name: 'Offline Internships', description: 'On-site experiences' }
  ];

  const trainingTypes = [
    { name: 'CRT Training', description: 'Campus Recruitment Training' },
    { name: 'Technical Training', description: 'Skill-specific programs' }
  ];

  const loginOptions = [
    'Job Seeker', 'Student', 'Admin', 'Super Admin', 'Employee', 'Employer', 'Colleges'
  ];
const handleRegisterClick = () => {
    navigate('/register', { replace: true });
  };
  return (
    <nav className="bg-white/90 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Triaright Hub
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
                <span>Courses</span>
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white border shadow-lg">
                {courseTypes.map((course) => (
                  <DropdownMenuItem key={course.name} className="p-3">
                    <div>
                      <div className="font-medium">{course.name}</div>
                      <div className="text-sm text-gray-500">{course.description}</div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
                <span>Jobs</span>
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white border shadow-lg">
                {jobTypes.map((job) => (
                  <DropdownMenuItem key={job.name} className="p-3">
                    <div>
                      <div className="font-medium">{job.name}</div>
                      <div className="text-sm text-gray-500">{job.description}</div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
                <span>Internships</span>
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white border shadow-lg">
                {internshipTypes.map((internship) => (
                  <DropdownMenuItem key={internship.name} className="p-3">
                    <div>
                      <div className="font-medium">{internship.name}</div>
                      <div className="text-sm text-gray-500">{internship.description}</div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
                <span>Training</span>
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white border shadow-lg">
                {trainingTypes.map((training) => (
                  <DropdownMenuItem key={training.name} className="p-3">
                    <div>
                      <div className="font-medium">{training.name}</div>
                      <div className="text-sm text-gray-500">{training.description}</div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-1">
                  <span>Login</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-white border shadow-lg">
                {loginOptions.map((option) => (
                  <DropdownMenuItem 
                    key={option} 
                    onClick={() => onOpenAuth('login', option.toLowerCase().replace(' ', '-'))}
                    className="cursor-pointer"
                  >
                    {option}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              onClick={handleRegisterClick}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Register
            </Button>
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
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Courses</h3>
                {courseTypes.map((course) => (
                  <div key={course.name} className="pl-4 text-sm text-gray-600">
                    {course.name}
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Jobs</h3>
                {jobTypes.map((job) => (
                  <div key={job.name} className="pl-4 text-sm text-gray-600">
                    {job.name}
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Auth</h3>
                <div className="flex flex-col space-y-2 pl-4">
                  <Button variant="outline" size="sm" onClick={() => onOpenAuth('login', 'student')}>
                    Login
                  </Button>
                  <Button size="sm" onClick={() => onOpenAuth('register', 'student')}>
                    Register
                  </Button>
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
