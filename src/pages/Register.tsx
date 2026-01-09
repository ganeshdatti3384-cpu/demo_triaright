import React, { useState, useEffect  } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchColleges } from '@/services/collegeApi';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import Footer from '../components/Footer';
import Navbar from '@/components/Navbar';
import {
  User,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Sparkles,
  Star,
  Shield,
  ArrowLeft,
  Users,
  GraduationCap,
  Image as ImageIcon,
  Building2,
  Lock,
  Eye,
  EyeOff,
  Briefcase,
} from 'lucide-react';
import { authApi } from '@/services/api';
import { useNavigate } from 'react-router-dom';

// Base schema for all roles
const baseSchema = z.object({
  firstName: z.string().min(1, 'First name is required').trim(),
  lastName: z.string().min(1, 'Last name is required').trim(),
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  phoneNumber: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[0-9+\-\s()]*$/, 'Invalid phone number format')
    .trim(),
  whatsappNumber: z.string()
    .min(10, 'WhatsApp number must be at least 10 digits')
    .regex(/^[0-9+\-\s()]*$/, 'Invalid WhatsApp number format')
    .trim(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  address: z.string().min(1, 'Address is required').trim(),
  role: z.enum(['student', 'college', 'jobseeker', 'employer', 'Trainer']),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept terms and conditions'
  })
});

// Refine for password match
const registrationSchema = baseSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }
);

type RegistrationFormData = z.infer<typeof registrationSchema>;

const Register = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'register' | 'terms' | 'privacy'>('register');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [collegeSearch, setCollegeSearch] = useState("");
const [colleges, setColleges] = useState<any[]>([]);
const [selectedCollege, setSelectedCollege] = useState("");


  // File states
  const [collegeLogo, setCollegeLogo] = useState<File | null>(null);
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);

  // College fields
  const [collegeName, setCollegeName] = useState('');
  const [collegeCode, setCollegeCode] = useState('');

  // Employer fields
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('');

  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    formState: { errors }
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      acceptTerms: false,
      role: 'student'
    }
  });

  const selectedRole = watch('role');





  useEffect(() => {
  if (collegeSearch.trim() === "") {
    setColleges([]);
    return;
  }

  const delayDebounce = setTimeout(async () => {
    try {
      const data = await fetchColleges(collegeSearch);
      setColleges(data);
    } catch (error) {
      console.error("Failed to fetch colleges", error);
    }
  }, 400); // debounce

  return () => clearTimeout(delayDebounce);
}, [collegeSearch]);




  const handleRegister = async (formData: RegistrationFormData) => {
    try {
      setIsLoading(true);

      // Validate role-specific required fields before submission
      if (formData.role === 'college') {
        if (!collegeName.trim()) {
          toast({
            title: 'Validation Error',
            description: 'College name is required',
            variant: 'destructive'
          });
          setIsLoading(false);
          return;
        }
        if (!collegeCode.trim()) {
          toast({
            title: 'Validation Error',
            description: 'College code is required',
            variant: 'destructive'
          });
          setIsLoading(false);
          return;
        }
      } else if (formData.role === 'employer') {
        if (!companyName.trim()) {
          toast({
            title: 'Validation Error',
            description: 'Company name is required',
            variant: 'destructive'
          });
          setIsLoading(false);
          return;
        }
        if (!companyType) {
          toast({
            title: 'Validation Error',
            description: 'Company type is required',
            variant: 'destructive'
          });
          setIsLoading(false);
          return;
        }
      }

      // Create FormData for file uploads
      const formDataToSend = new FormData();

      // Add common fields with trimming
      formDataToSend.append('firstName', formData.firstName.trim());
      formDataToSend.append('lastName', formData.lastName.trim());
      formDataToSend.append('email', formData.email.trim().toLowerCase());
      formDataToSend.append('phoneNumber', formData.phoneNumber.trim());
      formDataToSend.append('whatsappNumber', formData.whatsappNumber.trim());
      formDataToSend.append('address', formData.address.trim());
      formDataToSend.append('password', formData.password);
      formDataToSend.append('role', formData.role);

      // Add role-specific fields
      if (formData.role === 'college') {
        formDataToSend.append('collegeName', collegeName.trim());
        formDataToSend.append('collegeCode', collegeCode.trim());
        if (collegeLogo) {
          formDataToSend.append('collegeLogo', collegeLogo);
        }
      } else if (formData.role === 'employer') {
        formDataToSend.append('companyName', companyName.trim());
        formDataToSend.append('companyType', companyType);
        if (companyLogo) {
          formDataToSend.append('companyLogo', companyLogo);
        }
      } else if (formData.role === 'student') {
        if (collegeName.trim()) {
          formDataToSend.append('collegeName', collegeName.trim());
        }
      }

      // Log FormData contents for debugging
      console.log('Form data being sent:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }

      // Call the register API with FormData
      const response = await authApi.register(formDataToSend as any);

      toast({
        title: 'Success',
        description: `Registration successful! Please login.`
      });
      
      navigate('/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      console.error('Error response:', error?.response);

      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.message || 
                          error?.message ||
                          'Something went wrong';

      // Handle specific error cases
      if (errorMessage.toLowerCase().includes('email') && 
          (errorMessage.toLowerCase().includes('duplicate') || 
           errorMessage.toLowerCase().includes('exists') ||
           errorMessage.toLowerCase().includes('already'))) {
        setError('email', {
          type: 'manual',
          message: 'This email is already registered. Please use a different email or login.'
        });
        toast({
          title: 'Email Already Exists',
          description: 'This email address is already registered. Please use a different email or try logging in.',
          variant: 'destructive'
        });
      } else if (errorMessage.toLowerCase().includes('phone') && 
                 (errorMessage.toLowerCase().includes('duplicate') || 
                  errorMessage.toLowerCase().includes('exists') ||
                  errorMessage.toLowerCase().includes('already'))) {
        setError('phoneNumber', {
          type: 'manual',
          message: 'This phone number is already registered.'
        });
        toast({
          title: 'Phone Number Already Exists',
          description: 'This phone number is already registered. Please use a different phone number.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Registration Failed',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCollegeLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Logo must be less than 5MB',
          variant: 'destructive'
        });
        return;
      }
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload an image file',
          variant: 'destructive'
        });
        return;
      }
      setCollegeLogo(file);
    }
  };

  const handleCompanyLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Logo must be less than 5MB',
          variant: 'destructive'
        });
        return;
      }
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload an image file',
          variant: 'destructive'
        });
        return;
      }
      setCompanyLogo(file);
    }
  };

  const renderTermsAndConditions = () => (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden">
        <div className="relative container mx-auto px-4 py-12 max-w-4xl">
          <div className="flex items-center mb-8">
            <Button
              variant="outline"
              onClick={() => setCurrentView('register')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Registration</span>
            </Button>
          </div>
          <Card className="backdrop-blur-xl bg-white/80 border-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Terms and Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none p-8">
              <h2>1. Acceptance of Terms</h2>
              <p>By accessing and using TriaRight, you accept and agree to be bound by the terms and provision of this agreement.</p>
              <h2>2. Use License</h2>
              <p>Permission is granted to temporarily download one copy of the materials on TriaRight&apos;s website for personal, non-commercial transitory viewing only.</p>
              <h2>3. Disclaimer</h2>
              <p>The materials on TriaRight&apos;s website are provided on an &apos;as is&apos; basis. TriaRight makes no warranties, expressed or implied.</p>
              <h2>4. Limitations</h2>
              <p>In no event shall TriaRight or its suppliers be liable for any damages arising out of the use or inability to use the materials on TriaRight&apos;s website.</p>
              <h2>5. Account Responsibilities</h2>
              <p>Users are responsible for maintaining the confidentiality of accounts and passwords and for restricting access to devices.</p>
              <h2>6. Privacy Policy</h2>
              <p>Please review the Privacy Policy, which also governs the use of the service.</p>
              <h2>7. Modifications</h2>
              <p>Terms may be revised at any time without notice; continued use constitutes acceptance of the then-current terms.</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );

  const renderPrivacyPolicy = () => (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden">
        <div className="relative container mx-auto px-4 py-12 max-w-4xl">
          <div className="flex items-center mb-8">
            <Button
              variant="outline"
              onClick={() => setCurrentView('register')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Registration</span>
            </Button>
          </div>
          <Card className="backdrop-blur-xl bg-white/80 border-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Privacy Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none p-8">
              <h2>1. Information We Collect</h2>
              <p>Information provided directly during account creation, profile updates, and support requests.</p>
              <h2>2. How We Use Your Information</h2>
              <p>To provide, maintain, and improve services, process transactions, and communicate updates.</p>
              <h2>3. Information Sharing</h2>
              <p>No selling or trading of personal information without consent, except as described by policy.</p>
              <h2>4. Data Security</h2>
              <p>Appropriate security measures are implemented against unauthorized access and disclosure.</p>
              <h2>5. Cookies and Tracking</h2>
              <p>Cookies and similar technologies may be used to enhance experience and analyze usage.</p>
              <h2>6. Your Rights</h2>
              <p>Rights to access, update, or delete personal information, and to opt out of certain communications.</p>
              <h2>7. Changes to This Policy</h2>
              <p>Policy updates may be posted periodically; continued use indicates acceptance of changes.</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );

  if (currentView === 'terms') return renderTermsAndConditions();
  if (currentView === 'privacy') return renderPrivacyPolicy();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 relative overflow-hidden">
        {/* Background visuals */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full animate-bounce" />
          <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rotate-45 animate-pulse" />
          <div className="absolute bottom-40 left-20 w-12 h-12 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full animate-bounce" />
          <div className="absolute bottom-20 right-40 w-24 h-24 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rotate-12 animate-pulse" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
        </div>

        <div className="relative container mx-auto px-4 py-12 max-w-7xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-6">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Join TriaRight Today
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start your journey to success with personalized learning and career advancement
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="lg:col-span-1 space-y-6">
              <Card className="backdrop-blur-xl bg-white/80 border-0 shadow-xl">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">Why Choose TriaRight?</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Star className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">Expert-Led Courses</h4>
                        <p className="text-sm text-gray-600">Learn from industry professionals</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Shield className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">Certified Learning</h4>
                        <p className="text-sm text-gray-600">Get recognized certifications</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">Community Support</h4>
                        <p className="text-sm text-gray-600">Connect with learners worldwide</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="backdrop-blur-xl bg-white/80 border-0 shadow-2xl">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold text-gray-800">Create Your Account</CardTitle>
                  <p className="text-gray-600">Fill in the details to get started</p>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit(handleRegister)} className="space-y-6">
                    {/* Role selector */}
                    <div>
                      <Label htmlFor="role" className="text-gray-700 font-medium">
                        I am a *
                      </Label>
                      <Controller
                        name="role"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="h-11 mt-1 border-gray-200 focus:border-blue-500">
                              <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="college">College</SelectItem>
                              <SelectItem value="jobseeker">Job Seeker</SelectItem>
                              <SelectItem value="employer">Employer</SelectItem>
                              <SelectItem value="Trainer">Trainer</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
                    </div>

                    {/* Common fields for all roles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="firstName" className="text-gray-700 font-medium">First Name *</Label>
                        <div className="relative mt-1">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="firstName"
                            {...register('firstName')}
                            placeholder="Enter first name"
                            className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                          />
                        </div>
                        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
                      </div>

                      <div>
                        <Label htmlFor="lastName" className="text-gray-700 font-medium">Last Name *</Label>
                        <div className="relative mt-1">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="lastName"
                            {...register('lastName')}
                            placeholder="Enter last name"
                            className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                          />
                        </div>
                        {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-gray-700 font-medium">Email Address *</Label>
                        <div className="relative mt-1">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            {...register('email')}
                            placeholder="Enter your email address"
                            className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                          />
                        </div>
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                      </div>

                      <div>
                        <Label htmlFor="phoneNumber" className="text-gray-700 font-medium">Phone Number *</Label>
                        <div className="relative mt-1">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="phoneNumber"
                            {...register('phoneNumber')}
                            placeholder="Enter your phone number"
                            className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                          />
                        </div>
                        {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>}
                      </div>

                      <div>
                        <Label htmlFor="whatsappNumber" className="text-gray-700 font-medium">WhatsApp Number *</Label>
                        <div className="relative mt-1">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="whatsappNumber"
                            {...register('whatsappNumber')}
                            placeholder="Enter your WhatsApp number"
                            className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                          />
                        </div>
                        {errors.whatsappNumber && <p className="text-red-500 text-sm mt-1">{errors.whatsappNumber.message}</p>}
                      </div>

                      <div>
                        <Label htmlFor="password" className="text-gray-700 font-medium">Password *</Label>
                        <div className="relative mt-1">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            {...register('password')}
                            placeholder="Enter your password"
                            className="pl-10 pr-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            aria-label="Toggle password visibility"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                      </div>

                      <div>
                        <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password *</Label>
                        <div className="relative mt-1">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            {...register('confirmPassword')}
                            placeholder="Confirm your password"
                            className="pl-10 pr-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            aria-label="Toggle password visibility"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="address" className="text-gray-700 font-medium">Address *</Label>
                        <div className="relative mt-1">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="address"
                            {...register('address')}
                            placeholder="Enter your complete address"
                            className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                          />
                        </div>
                        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
                      </div>

                      {/* Student-specific fields */}
                      {selectedRole === 'student' && (
  <div className="md:col-span-2 relative">
    <Label className="text-gray-700 font-medium">
      College / Institute Name (Optional)
    </Label>

    <Input
      value={collegeSearch}
      onChange={(e) => {
        setCollegeSearch(e.target.value);
        setCollegeName(e.target.value);
      }}
      placeholder="Type your college name"
      className="pl-10 h-11 border-gray-200 focus:border-blue-500"
    />

    {colleges.length > 0 && (
      <ul className="absolute z-50 bg-white border w-full mt-1 rounded shadow max-h-48 overflow-y-auto">
        {colleges.map((college) => (
          <li
            key={college._id}
            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              setCollegeName(college.collegeName);
              setCollegeSearch(college.collegeName);
              setSelectedCollege(college.collegeCode);
              setColleges([]);
            }}
          >
            {college.collegeName} ({college.collegeCode})
          </li>
        ))}
      </ul>
    )}
  </div>
)}


                      {/* College-specific fields */}
                      {selectedRole === 'college' && (
                        <>
                          <div>
                            <Label htmlFor="collegeName" className="text-gray-700 font-medium">College Name *</Label>
                            <div className="relative mt-1">
                              <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                id="collegeName"
                                value={collegeName}
                                onChange={(e) => setCollegeName(e.target.value)}
                                placeholder="Enter college name"
                                className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="collegeCode" className="text-gray-700 font-medium">College Code *</Label>
                            <div className="relative mt-1">
                              <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                id="collegeCode"
                                value={collegeCode}
                                onChange={(e) => setCollegeCode(e.target.value)}
                                placeholder="Enter college code"
                                className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                              />
                            </div>
                          </div>

                          <div className="md:col-span-2">
                            <Label htmlFor="collegeLogo" className="text-gray-700 font-medium">College Logo (optional)</Label>
                            <div className="relative mt-1">
                              <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                id="collegeLogo"
                                type="file"
                                accept="image/*"
                                onChange={handleCollegeLogoChange}
                                className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                              />
                            </div>
                            {collegeLogo && (
                              <p className="text-sm text-green-600 mt-1">
                                Selected: {collegeLogo.name}
                              </p>
                            )}
                          </div>
                        </>
                      )}

                      {/* Employer-specific fields */}
                      {selectedRole === 'employer' && (
                        <>
                          <div>
                            <Label htmlFor="companyName" className="text-gray-700 font-medium">Company Name *</Label>
                            <div className="relative mt-1">
                              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                id="companyName"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="Enter company name"
                                className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="companyType" className="text-gray-700 font-medium">Company Type *</Label>
                            <Select onValueChange={setCompanyType} value={companyType}>
                              <SelectTrigger className="h-11 mt-1 border-gray-200 focus:border-blue-500">
                                <SelectValue placeholder="Select company type" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                <SelectItem value="Private Limited">Private Limited</SelectItem>
                                <SelectItem value="LLP">LLP</SelectItem>
                                <SelectItem value="One Person Company">One Person Company</SelectItem>
                                <SelectItem value="Public Limited">Public Limited</SelectItem>
                                <SelectItem value="NGO">NGO</SelectItem>
                                <SelectItem value="Proprietorship">Proprietorship</SelectItem>
                                <SelectItem value="Partnership">Partnership</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="md:col-span-2">
                            <Label htmlFor="companyLogo" className="text-gray-700 font-medium">Company Logo (optional)</Label>
                            <div className="relative mt-1">
                              <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                id="companyLogo"
                                type="file"
                                accept="image/*"
                                onChange={handleCompanyLogoChange}
                                className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                              />
                            </div>
                            {companyLogo && (
                              <p className="text-sm text-green-600 mt-1">
                                Selected: {companyLogo.name}
                              </p>
                            )}
                          </div>
                        </>
                      )}

                      {/* Jobseeker-specific info */}
                      {selectedRole === 'jobseeker' && (
                        <div className="md:col-span-2">
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-start space-x-3">
                              <Briefcase className="h-5 w-5 text-blue-600 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-blue-800">Job Seeker Account</h4>
                                <p className="text-sm text-blue-700 mt-1">
                                  Your basic profile will be created. You can add your qualifications,
                                  work experience, skills, and upload your resume after registration.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Trainer-specific info */}
                      {selectedRole === 'Trainer' && (
                        <div className="md:col-span-2">
                          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <div className="flex items-start space-x-3">
                              <GraduationCap className="h-5 w-5 text-purple-600 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-purple-800">Trainer Account</h4>
                                <p className="text-sm text-purple-700 mt-1">
                                  Your basic profile will be created. You can add your specialization,
                                  experience, qualifications, and other details after registration.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Controller
                        name="acceptTerms"
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            id="acceptTerms"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                      <Label htmlFor="acceptTerms" className="text-sm text-gray-600">
                        I agree to the{' '}
                        <button
                          type="button"
                          onClick={() => setCurrentView('terms')}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Terms and Conditions
                        </button>{' '}
                        and{' '}
                        <button
                          type="button"
                          onClick={() => setCurrentView('privacy')}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Privacy Policy
                        </button>
                      </Label>
                    </div>
                    {errors.acceptTerms && <p className="text-red-500 text-sm">{errors.acceptTerms.message}</p>}

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>

                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => navigate('/login')}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Sign in here
                        </button>
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Register;