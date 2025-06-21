import React, { useState } from 'react';
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

const AuthModal = ({ isOpen, type, userType, onClose, onAuthSuccess }: AuthModalProps) => {
  const [currentType, setCurrentType] = useState<'login' | 'register'>(type);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    college: '',
    course: '',
    year: '',
    skills: '',
    experience: '',
    companyName: '',
    designation: '',
    collegeName: '',
    address: '',
    website: ''
  });

  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (currentType === 'register' && formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive"
      });
      return;
    }

    // Simulate authentication
    const userName = currentType === 'login' ? 
      formData.email.split('@')[0] : 
      `${formData.firstName} ${formData.lastName}`;

    toast({
      title: "Success",
      description: `${currentType === 'login' ? 'Logged in' : 'Registered'} successfully!`,
    });

    onAuthSuccess(userType, userName);
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="remember" />
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            placeholder="First name"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            placeholder="Last name"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          placeholder="Enter your phone number"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="college">College/University</Label>
        <Input
          id="college"
          placeholder="Enter your college name"
          value={formData.college}
          onChange={(e) => handleInputChange('college', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="course">Course/Major</Label>
          <Input
            id="course"
            placeholder="e.g., Computer Science"
            value={formData.course}
            onChange={(e) => handleInputChange('course', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="year">Academic Year</Label>
          <Select onValueChange={(value) => handleInputChange('year', value)}>
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
          value={formData.skills}
          onChange={(e) => handleInputChange('skills', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="terms" />
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            placeholder="First name"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            placeholder="Last name"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Work Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your work email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="companyName">Company Name</Label>
        <Input
          id="companyName"
          placeholder="Enter company name"
          value={formData.companyName}
          onChange={(e) => handleInputChange('companyName', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="designation">Job Title/Designation</Label>
        <Input
          id="designation"
          placeholder="e.g., HR Manager, Recruiter"
          value={formData.designation}
          onChange={(e) => handleInputChange('designation', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          placeholder="Enter your phone number"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="website">Company Website (Optional)</Label>
        <Input
          id="website"
          placeholder="https://yourcompany.com"
          value={formData.website}
          onChange={(e) => handleInputChange('website', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="terms" />
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="collegeName">Institution Name</Label>
        <Input
          id="collegeName"
          placeholder="Enter institution name"
          value={formData.collegeName}
          onChange={(e) => handleInputChange('collegeName', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">Contact Person First Name</Label>
          <Input
            id="firstName"
            placeholder="First name"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Contact Person Last Name</Label>
          <Input
            id="lastName"
            placeholder="Last name"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Official Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter official email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="phone">Contact Number</Label>
        <Input
          id="phone"
          placeholder="Enter contact number"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="address">Institution Address</Label>
        <Textarea
          id="address"
          placeholder="Enter complete address"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="website">Institution Website</Label>
        <Input
          id="website"
          placeholder="https://yourinstitution.edu"
          value={formData.website}
          onChange={(e) => handleInputChange('website', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="terms" />
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
              onClick={() => setCurrentType(currentType === 'login' ? 'register' : 'login')}
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
