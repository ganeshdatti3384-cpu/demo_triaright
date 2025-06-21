import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface AuthModalProps {
  isOpen: boolean;
  type: 'login' | 'register';
  userType: string;
  onClose: () => void;
  onAuthSuccess: (userRole: string, userName: string) => void;
}

interface LoginFormData {
  email: string;
  password: string;
  remember?: boolean;
}

interface StudentRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  college: string;
  course: string;
  year: string;
  skills: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

interface EmployerRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  designation: string;
  phone: string;
  website: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

interface CollegeRegistrationData {
  collegeName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  password: string;
  terms: boolean;
}

const AuthModal = ({ isOpen, type, userType, onClose, onAuthSuccess }: AuthModalProps) => {
  const [currentType, setCurrentType] = useState<'login' | 'register'>(type);
  const { toast } = useToast();

  const loginForm = useForm<LoginFormData>({
    defaultValues: {
      email: currentType === 'login' ? 'aks@example.com' : '',
      password: currentType === 'login' ? 'password123' : '',
      remember: false
    }
  });

  const studentForm = useForm<StudentRegistrationData>();
  const employerForm = useForm<EmployerRegistrationData>();
  const collegeForm = useForm<CollegeRegistrationData>();

  const handleLoginSubmit = (data: LoginFormData) => {
    // Accept "aks@example.com" with "password123" as valid login
    if (data.email === 'aks@example.com' && data.password === 'password123') {
      toast({
        title: "Success",
        description: "Logged in successfully as aks!",
      });
      onAuthSuccess(userType, 'aks');
      return;
    }

    // For other attempts, show error
    toast({
      title: "Error",
      description: "Invalid credentials. Use aks@example.com with password123",
      variant: "destructive"
    });
  };

  const handleStudentRegistration = (data: StudentRegistrationData) => {
    if (data.password !== data.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive"
      });
      return;
    }

    if (!data.terms) {
      toast({
        title: "Error",
        description: "Please agree to the terms and conditions.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Student account created successfully!",
    });

    onAuthSuccess(userType, `${data.firstName} ${data.lastName}`);
  };

  const handleEmployerRegistration = (data: EmployerRegistrationData) => {
    if (data.password !== data.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive"
      });
      return;
    }

    if (!data.terms) {
      toast({
        title: "Error",
        description: "Please agree to the terms and conditions.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Employer account created successfully!",
    });

    onAuthSuccess(userType, `${data.firstName} ${data.lastName}`);
  };

  const handleCollegeRegistration = (data: CollegeRegistrationData) => {
    if (!data.terms) {
      toast({
        title: "Error",
        description: "Please agree to the terms and conditions.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Institution account created successfully!",
    });

    onAuthSuccess(userType, data.collegeName);
  };

  const getUserTypeTitle = () => {
    const titles: { [key: string]: string } = {
      'student': 'Student',
      'job-seeker': 'Job Seeker',
      'employee': 'Employee',
      'employer': 'Employer',
      'colleges': 'College',
      'admin': 'Admin',
      'super-admin': 'Super Admin'
    };
    return titles[userType] || 'User';
  };

  const renderLoginForm = () => (
    <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          {...loginForm.register('email', { required: 'Email is required' })}
        />
        {loginForm.formState.errors.email && (
          <p className="text-red-500 text-sm">{loginForm.formState.errors.email.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          {...loginForm.register('password', { required: 'Password is required' })}
        />
        {loginForm.formState.errors.password && (
          <p className="text-red-500 text-sm">{loginForm.formState.errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="remember" {...loginForm.register('remember')} />
        <Label htmlFor="remember" className="text-sm">Remember me</Label>
      </div>

      <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
        Sign In as {getUserTypeTitle()}
      </Button>

      <div className="text-center">
        <a href="#" className="text-sm text-blue-600 hover:underline">
          Forgot your password?
        </a>
      </div>
    </form>
  );

  const renderStudentRegistration = () => (
    <form onSubmit={studentForm.handleSubmit(handleStudentRegistration)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            placeholder="First name"
            {...studentForm.register('firstName', { required: 'First name is required' })}
          />
          {studentForm.formState.errors.firstName && (
            <p className="text-red-500 text-sm">{studentForm.formState.errors.firstName.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            placeholder="Last name"
            {...studentForm.register('lastName', { required: 'Last name is required' })}
          />
          {studentForm.formState.errors.lastName && (
            <p className="text-red-500 text-sm">{studentForm.formState.errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          {...studentForm.register('email', { 
            required: 'Email is required',
            pattern: {
              value: /^\S+@\S+$/i,
              message: 'Invalid email address'
            }
          })}
        />
        {studentForm.formState.errors.email && (
          <p className="text-red-500 text-sm">{studentForm.formState.errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          placeholder="Enter your phone number"
          {...studentForm.register('phone')}
        />
      </div>

      <div>
        <Label htmlFor="college">College/University</Label>
        <Input
          id="college"
          placeholder="Enter your college name"
          {...studentForm.register('college')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="course">Course/Major</Label>
          <Input
            id="course"
            placeholder="e.g., Computer Science"
            {...studentForm.register('course')}
          />
        </div>
        <div>
          <Label htmlFor="year">Academic Year</Label>
          <Select onValueChange={(value) => studentForm.setValue('year', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1st">1st Year</SelectItem>
              <SelectItem value="2nd">2nd Year</SelectItem>
              <SelectItem value="3rd">3rd Year</SelectItem>
              <SelectItem value="4th">4th Year</SelectItem>
              <SelectItem value="graduate">Graduate</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="skills">Skills & Interests</Label>
        <Textarea
          id="skills"
          placeholder="List your technical skills, programming languages, interests..."
          {...studentForm.register('skills')}
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a password"
          {...studentForm.register('password', { 
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters'
            }
          })}
        />
        {studentForm.formState.errors.password && (
          <p className="text-red-500 text-sm">{studentForm.formState.errors.password.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          {...studentForm.register('confirmPassword', { required: 'Please confirm your password' })}
        />
        {studentForm.formState.errors.confirmPassword && (
          <p className="text-red-500 text-sm">{studentForm.formState.errors.confirmPassword.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="terms" {...studentForm.register('terms')} />
        <Label htmlFor="terms" className="text-sm">
          I agree to the Terms of Service and Privacy Policy
        </Label>
      </div>

      <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
        Create Student Account
      </Button>
    </form>
  );

  const renderEmployerRegistration = () => (
    <form onSubmit={employerForm.handleSubmit(handleEmployerRegistration)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            placeholder="First name"
            {...employerForm.register('firstName', { required: 'First name is required' })}
          />
          {employerForm.formState.errors.firstName && (
            <p className="text-red-500 text-sm">{employerForm.formState.errors.firstName.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            placeholder="Last name"
            {...employerForm.register('lastName', { required: 'Last name is required' })}
          />
          {employerForm.formState.errors.lastName && (
            <p className="text-red-500 text-sm">{employerForm.formState.errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="email">Work Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your work email"
          {...employerForm.register('email', { 
            required: 'Email is required',
            pattern: {
              value: /^\S+@\S+$/i,
              message: 'Invalid email address'
            }
          })}
        />
        {employerForm.formState.errors.email && (
          <p className="text-red-500 text-sm">{employerForm.formState.errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="companyName">Company Name</Label>
        <Input
          id="companyName"
          placeholder="Enter company name"
          {...employerForm.register('companyName')}
        />
      </div>

      <div>
        <Label htmlFor="designation">Job Title/Designation</Label>
        <Input
          id="designation"
          placeholder="e.g., HR Manager, Recruiter"
          {...employerForm.register('designation')}
        />
      </div>

      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          placeholder="Enter your phone number"
          {...employerForm.register('phone')}
        />
      </div>

      <div>
        <Label htmlFor="website">Company Website (Optional)</Label>
        <Input
          id="website"
          placeholder="https://yourcompany.com"
          {...employerForm.register('website')}
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a password"
          {...employerForm.register('password', { 
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters'
            }
          })}
        />
        {employerForm.formState.errors.password && (
          <p className="text-red-500 text-sm">{employerForm.formState.errors.password.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          {...employerForm.register('confirmPassword', { required: 'Please confirm your password' })}
        />
        {employerForm.formState.errors.confirmPassword && (
          <p className="text-red-500 text-sm">{employerForm.formState.errors.confirmPassword.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="terms" {...employerForm.register('terms')} />
        <Label htmlFor="terms" className="text-sm">
          I agree to the Terms of Service and Privacy Policy
        </Label>
      </div>

      <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
        Create Employer Account
      </Button>
    </form>
  );

  const renderCollegeRegistration = () => (
    <form onSubmit={collegeForm.handleSubmit(handleCollegeRegistration)} className="space-y-4">
      <div>
        <Label htmlFor="collegeName">Institution Name</Label>
        <Input
          id="collegeName"
          placeholder="Enter institution name"
          {...collegeForm.register('collegeName', { required: 'Institution name is required' })}
        />
        {collegeForm.formState.errors.collegeName && (
          <p className="text-red-500 text-sm">{collegeForm.formState.errors.collegeName.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">Contact Person First Name</Label>
          <Input
            id="firstName"
            placeholder="First name"
            {...collegeForm.register('firstName', { required: 'First name is required' })}
          />
          {collegeForm.formState.errors.firstName && (
            <p className="text-red-500 text-sm">{collegeForm.formState.errors.firstName.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="lastName">Contact Person Last Name</Label>
          <Input
            id="lastName"
            placeholder="Last name"
            {...collegeForm.register('lastName', { required: 'Last name is required' })}
          />
          {collegeForm.formState.errors.lastName && (
            <p className="text-red-500 text-sm">{collegeForm.formState.errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="email">Official Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter official email"
          {...collegeForm.register('email', { 
            required: 'Email is required',
            pattern: {
              value: /^\S+@\S+$/i,
              message: 'Invalid email address'
            }
          })}
        />
        {collegeForm.formState.errors.email && (
          <p className="text-red-500 text-sm">{collegeForm.formState.errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="phone">Contact Number</Label>
        <Input
          id="phone"
          placeholder="Enter contact number"
          {...collegeForm.register('phone')}
        />
      </div>

      <div>
        <Label htmlFor="address">Institution Address</Label>
        <Textarea
          id="address"
          placeholder="Enter complete address"
          {...collegeForm.register('address')}
        />
      </div>

      <div>
        <Label htmlFor="website">Institution Website</Label>
        <Input
          id="website"
          placeholder="https://yourinstitution.edu"
          {...collegeForm.register('website')}
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a password"
          {...collegeForm.register('password', { 
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters'
            }
          })}
        />
        {collegeForm.formState.errors.password && (
          <p className="text-red-500 text-sm">{collegeForm.formState.errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="terms" {...collegeForm.register('terms')} />
        <Label htmlFor="terms" className="text-sm">
          I agree to the Terms of Service and Privacy Policy
        </Label>
      </div>

      <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
        Register Institution
      </Button>
    </form>
  );

  const renderRegistrationForm = () => {
    switch (userType) {
      case 'student':
        return renderStudentRegistration();
      case 'employer':
        return renderEmployerRegistration();
      case 'colleges':
        return renderCollegeRegistration();
      default:
        return renderStudentRegistration();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {currentType === 'login' ? 'Sign In' : 'Create Account'}
          </DialogTitle>
          <p className="text-gray-600">
            {currentType === 'login' 
              ? `Welcome back! Sign in to your ${getUserTypeTitle().toLowerCase()} account.`
              : `Join our platform as a ${getUserTypeTitle().toLowerCase()}.`
            }
          </p>
        </DialogHeader>

        <div className="mt-6">
          {currentType === 'login' ? renderLoginForm() : renderRegistrationForm()}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {currentType === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button 
              className="text-blue-600 hover:underline font-semibold"
              onClick={() => {
                setCurrentType(currentType === 'login' ? 'register' : 'login');
                // Reset forms when switching
                loginForm.reset({
                  email: currentType === 'register' ? 'aks@example.com' : '',
                  password: currentType === 'register' ? 'password123' : '',
                  remember: false
                });
                studentForm.reset();
                employerForm.reset();
                collegeForm.reset();
              }}
            >
              {currentType === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
