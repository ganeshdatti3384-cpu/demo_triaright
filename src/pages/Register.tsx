/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Briefcase,
  FileUp,
  Building2,
  Award
} from 'lucide-react';
import { authApi, RegisterPayload } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';


// Base fields for both roles
const baseSchema = z.object({
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  whatsappNumber: z.string().min(10, 'WhatsApp number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  address: z.string().min(1, 'Address is required'),
  state: z.string().min(1, 'State is required'),
  role: z.enum(['student', 'college', 'jobseeker', 'employer', 'trainer']),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept terms and conditions'
  })
});


// Student-only fields
const studentSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  collegeName: z.string().min(1, 'College selection is required for students')
});


// College-only fields
const collegeSchema = z.object({
  collegeDisplayName: z.string().min(1, 'College name is required'),
  collegeCode: z.string().min(1, 'College code is required'),
  // File is handled outside Zod; keep as optional any
  logoFile: z.any().optional()
});


// Job Seeker-only fields
const jobSeekerSchema = z.object({
  jsFullName: z.string().min(1, 'Full name is required'),
  jsEmail: z.string().email('Invalid email address'),
  jsPhone: z.string().min(10, 'Phone must be at least 10 digits'),
  jsQualification: z.string().min(1, 'Qualification is required'),
  jsSkills: z.string().min(1, 'Skills are required'),
  jsExperience: z.string().min(1, 'Experience is required'),
  jsResume: z.any().optional()
});

// Employer-only fields
const employerSchema = z.object({
  empCompanyName: z.string().min(1, 'Company name is required'),
  empOrgType: z.enum([
    'Private Limited',
    'LLP',
    'One Person Company',
    'Public Limited',
    'NGO',
    'Proprietorship',
    'Partnership'
  ], { required_error: 'Type of Organization is required' })
});

// Trainer-only fields
const trainerSchema = z.object({
  trFullName: z.string().min(1, 'Full name is required'),
  trEmail: z.string().email('Invalid email address'),
  trPhone: z.string().min(10, 'Phone must be at least 10 digits'),
  trExpertise: z.string().min(1, 'Area of expertise is required'),
  trExperience: z.string().min(1, 'Experience is required'),
  trCertificate: z.any().optional()
});


const registrationSchema = z
  .intersection(
    baseSchema,
    z.union([
      z.object({ role: z.literal('student') }).and(studentSchema),
      z.object({ role: z.literal('college') }).and(collegeSchema),
      z.object({ role: z.literal('jobseeker') }).and(jobSeekerSchema),
      z.object({ role: z.literal('employer') }).and(employerSchema),
      z.object({ role: z.literal('trainer') }).and(trainerSchema),
    ])
  )
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: "Passwords don't match"
  });


type RegistrationFormData = z.infer<typeof registrationSchema>;


interface College {
  _id: string;
  collegeName?: string;
  userId: string;
  university: string;
  city: string;
  state: string;
}


const Register = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'register' | 'terms' | 'privacy'>('register');
  const [showPassword, setShowPassword] = useState(false);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loadingColleges, setLoadingColleges] = useState(false);


  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors }
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      acceptTerms: false
    }
  });


  const selectedRole = watch('role');


  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoadingColleges(true);
        const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5003/api';
        const response = await fetch(`${API_BASE_URL}/colleges/collegedata`);
        const data = await response.json();
        setColleges(data.colleges || []);
      } catch (error) {
        console.error('Error fetching colleges:', error);
        toast({
          title: 'Error',
          description: 'Failed to load colleges list',
          variant: 'destructive'
        });
      } finally {
        setLoadingColleges(false);
      }
    };
    fetchColleges();
  }, [toast]);


  const handleRegister = async (formData: RegistrationFormData) => {
    try {
      const common: Omit<RegisterPayload, 'role'> & { role: RegisterPayload['role'] } = {
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        whatsappNumber: formData.whatsappNumber,
        address: formData.address,
        role: formData.role,
        password: formData.password
      };


      let registerPayload: RegisterPayload;


      if (formData.role === 'student') {
        registerPayload = {
          ...common,
          firstName: (formData as any).firstName,
          lastName: (formData as any).lastName,
          collegeName: (formData as any).collegeName
        } as RegisterPayload;
        await authApi.register(registerPayload);
      } else if (formData.role === 'college') {
        // College: send name + code; send logo via FormData if present
        const fd = new FormData();
        fd.append('role', common.role);
        fd.append('email', common.email);
        fd.append('phoneNumber', common.phoneNumber);
        fd.append('whatsappNumber', common.whatsappNumber);
        fd.append('address', common.address);
        fd.append('password', common.password);
        fd.append('collegeCode', (formData as any).collegeCode);
        // Some backends expect first/last; map display name to firstName, keep lastName empty
        fd.append('firstName', (formData as any).collegeDisplayName);
        fd.append('lastName', '');
        const logo = (formData as any).logoFile;
        if (logo instanceof File) {
          fd.append('logo', logo);
        }
        await authApi.register(fd as any);
      } else if (formData.role === 'jobseeker') {
        // Job Seeker: send via FormData to include resume if provided
        const fd = new FormData();
        fd.append('role', common.role);
        fd.append('email', common.email);
        fd.append('phoneNumber', common.phoneNumber);
        fd.append('whatsappNumber', common.whatsappNumber);
        fd.append('address', common.address);
        fd.append('password', common.password);
        // map author-wise fields
        fd.append('fullName', (formData as any).jsFullName || '');
        fd.append('jobSeekerEmail', (formData as any).jsEmail || '');
        fd.append('jobSeekerPhone', (formData as any).jsPhone || '');
        fd.append('qualification', (formData as any).jsQualification || '');
        fd.append('skills', (formData as any).jsSkills || '');
        fd.append('experience', (formData as any).jsExperience || '');
        const resume = (formData as any).jsResume;
        if (resume instanceof File) {
          fd.append('resume', resume);
        }
        await authApi.register(fd as any);
      } else if (formData.role === 'employer') {
        // Employer: simple JSON payload
        registerPayload = {
          ...common,
          companyName: (formData as any).empCompanyName,
          organizationType: (formData as any).empOrgType
        } as RegisterPayload;
        await authApi.register(registerPayload);
      } else if (formData.role === 'trainer') {
        // Trainer: use FormData to include certificate upload
        const fd = new FormData();
        fd.append('role', common.role);
        fd.append('email', common.email);
        fd.append('phoneNumber', common.phoneNumber);
        fd.append('whatsappNumber', common.whatsappNumber);
        fd.append('address', common.address);
        fd.append('password', common.password);
        fd.append('fullName', (formData as any).trFullName || '');
        fd.append('trainerEmail', (formData as any).trEmail || '');
        fd.append('trainerPhone', (formData as any).trPhone || '');
        fd.append('expertise', (formData as any).trExpertise || '');
        fd.append('experience', (formData as any).trExperience || '');
        const cert = (formData as any).trCertificate;
        if (cert instanceof File) {
          fd.append('certificate', cert);
        }
        await authApi.register(fd as any);
      }


      toast({ title: 'Success', description: 'Registration successful! Please login.' });
      navigate('/login');
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error?.response?.data?.error || 'Something went wrong',
        variant: 'destructive'
      });
    }
  };


  const indianStates = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal'
  ];


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
          <div
            className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full animate-bounce"
            style={{ animationDelay: '0s', animationDuration: '3s' }}
          />
          <div
            className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rotate-45 animate-pulse"
            style={{ animationDelay: '1s' }}
          />
          <div
            className="absolute bottom-40 left-20 w-12 h-12 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full animate-bounce"
            style={{ animationDelay: '2s', animationDuration: '4s' }}
          />
          <div
            className="absolute bottom-20 right-40 w-24 h-24 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rotate-12 animate-pulse"
            style={{ animationDelay: '0.5s' }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-blue-500/10 to-transparent rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-radial from-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '2s' }}
          />
        </div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-indigo-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-gradient-to-br from-purple-400/5 to-pink-400/5 rounded-full blur-3xl" />
        </div>


        <div className="relative container mx-auto px-4 py-12 max-w-7xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-6">
              <Sparkles className="h-8 w-8 text-black" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Join TriaRight Today
            </h1>
            <p className="text-xl text-black max-w-2xl mx-auto">
              Start your journey to success with personalized learning and career advancement
            </p>
          </div>


          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="lg:col-span-1 space-y-6">
              <Card className="backdrop-blur-xl bg-white/10 border-0 shadow-xl">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 text-black">Why Choose TriaRight?</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Star className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-black">Expert-Led Courses</h4>
                        <p className="text-sm text-gray-400">Learn from industry professionals</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Shield className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-black">Certified Learning</h4>
                        <p className="text-sm text-gray-400">Get recognized certifications</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-black">Community Support</h4>
                        <p className="text-sm text-gray-400">Connect with learners worldwide</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>


            <div className="lg:col-span-2">
              <Card className="backdrop-blur-xl bg-white/10 border-0 shadow-2xl">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold text-black">Create Your Account</CardTitle>
                  <p className="text-gray-400">Fill in the details to get started</p>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit(handleRegister)} className="space-y-6">
                    {/* Top role selector: Student | College | Job Seeker | Employer | Trainer */}
                    <div>
                      <Label htmlFor="role" className="text-black-700 font-medium">
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
                              <SelectItem value="student" className="hover:bg-gray-100">Student</SelectItem>
                              <SelectItem value="college" className="hover:bg-gray-100">College</SelectItem>
                              <SelectItem value="jobseeker" className="hover:bg-gray-100">Job Seeker</SelectItem>
                              <SelectItem value="employer" className="hover:bg-gray-100">Employer</SelectItem>
                              <SelectItem value="trainer" className="hover:bg-gray-100">Trainer</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message as any}</p>}
                    </div>


                    {/* Show selected form */}
                    {selectedRole && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {selectedRole === 'student' && (
                            <>
                              <div>
                                <Label htmlFor="firstName" className="text-black-700 font-medium">First Name *</Label>
                                <div className="relative mt-1">
                                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black-400" />
                                  <Input
                                    id="firstName"
                                    {...register('firstName' as any)}
                                    placeholder="Enter first name"
                                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                                  />
                                </div>
                                {(errors as any).firstName && <p className="text-red-500 text-sm mt-1">{(errors as any).firstName.message}</p>}
                              </div>

                              <div>
                                <Label htmlFor="lastName" className="text-black-700 font-medium">Last Name *</Label>
                                <div className="relative mt-1">
                                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black-400" />
                                  <Input
                                    id="lastName"
                                    {...register('lastName' as any)}
                                    placeholder="Enter last name"
                                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                                  />
                                </div>
                                {(errors as any).lastName && <p className="text-red-500 text-sm mt-1">{(errors as any).lastName.message}</p>}
                              </div>

                              <div className="md:col-span-2">
                                <Label htmlFor="collegeName" className="text-black-700 font-medium mb-1 block">Select College *</Label>
                                <Controller
                                  name="collegeName" as any
                                  control={control}
                                  render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={(field.value as any) || ''} disabled={loadingColleges}>
                                      <SelectTrigger className="h-11 border border-gray-200 rounded-md focus:border-blue-500">
                                        <div className="flex items-center gap-2 px-2 w-full">
                                          <GraduationCap className="h-4 w-4 text-black-400" />
                                          <SelectValue placeholder={loadingColleges ? 'Loading colleges...' : 'Select your college'} />
                                        </div>
                                      </SelectTrigger>
                                      <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto z-50">
                                        {colleges.length > 0 ? (
                                          colleges
                                            .filter((c) => c && c.collegeName)
                                            .map((c) => (
                                              <SelectItem key={c._id} value={c.collegeName!} className="hover:bg-gray-100">
                                                <div className="flex flex-col px-2 py-1">
                                                  <span className="font-medium">{c.collegeName}</span>
                                                  <span className="text-sm text-gray-500">
                                                    {c.university} - {c.city}, {c.state}
                                                  </span>
                                                </div>
                                              </SelectItem>
                                            ))
                                        ) : (
                                          <div className="p-2 text-gray-500 text-sm">No colleges available</div>
                                        )}
                                      </SelectContent>
                                    </Select>
                                  )}
                                />
                                {(errors as any).collegeName && <p className="text-red-500 text-sm mt-1">{(errors as any).collegeName.message}</p>}
                              </div>
                            </>
                          )}

                          {selectedRole === 'college' && (
                            <>
                              <div className="md:col-span-1">
                                <Label htmlFor="collegeDisplayName" className="text-black-700 font-medium">College Name *</Label>
                                <div className="relative mt-1">
                                  <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black-400" />
                                  <Input
                                    id="collegeDisplayName"
                                    {...register('collegeDisplayName' as any)}
                                    placeholder="Enter college name"
                                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                                  />
                                </div>
                                {'collegeDisplayName' in errors && (errors as any).collegeDisplayName && (
                                  <p className="text-red-500 text-sm mt-1">{(errors as any).collegeDisplayName.message}</p>
                                )}
                              </div>

                              <div className="md:col-span-1">
                                <Label htmlFor="collegeCode" className="text-black-700 font-medium">College Code *</Label>
                                <div className="relative mt-1">
                                  <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black-400" />
                                  <Input
                                    id="collegeCode"
                                    {...register('collegeCode' as any)}
                                    placeholder="Enter college code"
                                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                                  />
                                </div>
                                {(errors as any).collegeCode && <p className="text-red-500 text-sm mt-1">{(errors as any).collegeCode.message}</p>}
                              </div>

                              <div className="md:col-span-2">
                                <Label htmlFor="logoFile" className="text-black-700 font-medium">College Logo (optional)</Label>
                                <div className="relative mt-1">
                                  <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black-400" />
                                  <Input
                                    id="logoFile"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      setValue('logoFile' as any, file as any, { shouldValidate: false });
                                    }}
                                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                                  />
                                </div>
                              </div>
                            </>
                          )}

                          {selectedRole === 'jobseeker' && (
                            <>
                              <div>
                                <Label htmlFor="jsFullName" className="text-black-700 font-medium">Full Name *</Label>
                                <div className="relative mt-1">
                                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black-400" />
                                  <Input
                                    id="jsFullName"
                                    {...register('jsFullName' as any)}
                                    placeholder="Enter full name"
                                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                                  />
                                </div>
                                {(errors as any).jsFullName && <p className="text-red-500 text-sm mt-1">{(errors as any).jsFullName.message}</p>}
                              </div>

                              <div>
                                <Label htmlFor="jsEmail" className="text-black-700 font-medium">Email *</Label>
                                <div className="relative mt-1">
                                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black-400" />
                                  <Input
                                    id="jsEmail"
                                    type="email"
                                    {...register('jsEmail' as any)}
                                    placeholder="Enter email"
                                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                                  />
                                </div>
                                {(errors as any).jsEmail && <p className="text-red-500 text-sm mt-1">{(errors as any).jsEmail.message}</p>}
                              </div>

                              <div>
                                <Label htmlFor="jsPhone" className="text-black-700 font-medium">Phone *</Label>
                                <div className="relative mt-1">
                                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black-400" />
                                  <Input
                                    id="jsPhone"
                                    {...register('jsPhone' as any)}
                                    placeholder="Enter phone"
                                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                                  />
                                </div>
                                {(errors as any).jsPhone && <p className="text-red-500 text-sm mt-1">{(errors as any).jsPhone.message}</p>}
                              </div>

                              <div>
                                <Label htmlFor="jsQualification" className="text-black-700 font-medium">Qualification *</Label>
                                <div className="relative mt-1">
                                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black-400" />
                                  <Input
                                    id="jsQualification"
                                    {...register('jsQualification' as any)}
                                    placeholder="Enter qualification"
                                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                                  />
                                </div>
                                {(errors as any).jsQualification && <p className="text-red-500 text-sm mt-1">{(errors as any).jsQualification.message}</p>}
                              </div>

                              <div>
                                <Label htmlFor="jsSkills" className="text-black-700 font-medium">Skills *</Label>
                                <div className="relative mt-1">
                                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black-400" />
                                  <Input
                                    id="jsSkills"
                                    {...register('jsSkills' as any)}
                                    placeholder="e.g., React, Node, SQL"
                                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                                  />
                                </div>
                                {(errors as any).jsSkills && <p className="text-red-500 text-sm mt-1">{(errors as any).jsSkills.message}</p>}
                              </div>

                              <div>
                                <Label htmlFor="jsExperience" className="text-black-700 font-medium">Experience *</Label>
                                <div className="relative mt-1">
                                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black-400" />
                                  <Input
                                    id="jsExperience"
                                    {...register('jsExperience' as any)}
                                    placeholder="e.g., 2 years"
                                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                                  />
                                </div>
                                {(errors as any).jsExperience && <p className="text-red-500 text-sm mt-1">{(errors as any).jsExperience.message}</p>}
                              </div>

                              <div className="md:col-span-2">
                                <Label htmlFor="jsResume" className="text-black-700 font-medium">Resume Upload (optional)</Label>
                                <div className="relative mt-1">
                                  <FileUp className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black-400" />
                                  <Input
                                    id="jsResume"
                                    type="file"
                                    accept=".pdf,.doc,.docx,.rtf"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      setValue('jsResume' as any, file as any, { shouldValidate: false });
                                    }}
                                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                                  />
                                </div>
                              </div>
                            </>
                          )}

                          {selectedRole === 'employer' && (
                            <>
                              <div className="md:col-span-1">
                                <Label htmlFor="empCompanyName" className="text-black-700 font-medium">Company Name *</Label>
                                <div className="relative mt-1">
                                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black-400" />
                                  <Input
                                    id="empCompanyName"
                                    {...register('empCompanyName' as any)}
                                    placeholder="Enter company name"
                                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                                  />
                                </div>
                                {(errors as any).empCompanyName && <p className="text-red-500 text-sm mt-1">{(errors as any).empCompanyName.message}</p>}
                              </div>

                              <div className="md:col-span-1">
                                <Label htmlFor="empOrgType" className="text-black-700 font-medium">Type of Organization *</Label>
                                <Controller
                                  name="empOrgType" as any
                                  control={control}
                                  render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <SelectTrigger className="h-11 mt-1 border-gray-200 focus:border-blue-500">
                                        <SelectValue placeholder="Select organization type" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                        <SelectItem value="Private Limited" className="hover:bg-gray-100">Private Limited</SelectItem>
                                        <SelectItem value="LLP" className="hover:bg-gray-100">LLP</SelectItem>
                                        <SelectItem value="One Person Company" className="hover:bg-gray-100">One Person Company</SelectItem>
                                        <SelectItem value="Public Limited" className="hover:bg-gray-100">Public Limited</SelectItem>
                                        <SelectItem value="NGO" className="hover:bg-gray-100">NGO</SelectItem>
                                        <SelectItem value="Proprietorship" className="hover:bg-gray-100">Proprietorship</SelectItem>
                                        <SelectItem value="Partnership" className="hover:bg-gray-100">Partnership</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  )}
                                />
                                {(errors as any).empOrgType && <p className="text-red-500 text-sm mt-1">{(errors as any).empOrgType.message}</p>}
                              </div>
                            </>
                          )}

                          {selectedRole === 'trainer' && (
                            <>
                              <div>
                                <Label htmlFor="trFullName" className="text-black-700 font-medium">Full Name *</Label>
                                <div className="relative mt-1">
                                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black-400" />
                                  <Input
                                    id="trFullName"
                                    {...register('trFullName' as any)}
                                    placeholder="Enter full name"
                                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                                  />
                                </div>
                                {(errors as any).trFullName && <p className="text-red-500 text-sm mt-1">{(errors as any).trFullName.message}</p>}
                              </div>

                              <div>
                                <Label htmlFor="trEmail" className="text-black-700 font-medium">Email *</Label>
                                <div className="relative mt-1">
                                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black-400" />
                                  <Input
                                    id="trEmail"
                                    type="email"
                                    {...register('trEmail' as any)}
                                    placeholder="Enter email"
                                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                                  />
                                </div>
                                {(errors as any).trEmail && <p className="text-red-500 text-sm mt-1">{(errors as any).trEmail.message}</p>}
                              </div>

                              <div>
                                <Label htmlFor="trPhone" className="text-black-700 font-medium">Phone *</Label>
                                <div className="relative mt-1">
                                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black-400" />
                                  <Input
                                    id="trPhone"
                                    {...register('trPhone' as any)}
                                    placeholder="Enter phone"
                                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                                  />
                                </div>
                                {(errors as any).trPhone && <p className="text-red-500 text-sm mt-1">{(errors as any).trPhone.message}</p>}
                              </div>

                              <div>
                                <Label htmlFor="trExpertise" className="text-black-700 font-medium">Area of Expertise *</Label>
                                <div className="relative mt-1">
                                  <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black-400" />
                                  <Input
                                    id="trExpertise"
                                    {...register('trExpertise' as any)}
                                    placeholder="e.g., Data Science, Soft Skills"
                                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                                  />
                                </div>
                                {(errors as any).trExpertise && <p className="text-red-500 text-sm mt-1">{(errors as any).trExpertise.message}</p>}
                              </div>

                              <div>
                                <Label htmlFor="trExperience" className="text-black-700 font-medium">Experience *</Label>
                                <div className="relative mt-1">
                                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black-400" />
                                  <Input
                                    id="trExperience"
                                    {...register('trExperience' as any)}
                                    placeholder="e.g., 5 years"
                                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                                  />
                                </div>
                                {(errors as any).trExperience && <p className="text-red-500 text-sm mt-1">{(errors as any).trExperience.message}</p>}
                              </div>

                              <div className="md:col-span-2">
                                <Label htmlFor="trCertificate" className="text-black-700 font-medium">Certification Upload (optional)</Label>
                                <div className="relative mt-1">
                                  <FileUp className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black-400" />
                                  <Input
                                    id="trCertificate"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      setValue('trCertificate' as any, file as any, { shouldValidate: false });
                                    }}
                                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                                  />
                                </div>
                              </div>
                            </>
                          )}

                          {/* Shared fields */}
                          <div>
                            <Label htmlFor="email" className="text-black-700 font-medium">Email Address *</Label>
                            <div className="relative mt-1">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black-400" />
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
                            <Label htmlFor="phoneNumber" className="text-black-700 font-medium">Phone Number *</Label>
                            <div className="relative mt-1">
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black-400" />
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
                            <Label htmlFor="whatsappNumber" className="text-black-700 font-medium">WhatsApp Number *</Label>
                            <div className="relative mt-1">
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black-400" />
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
                            <Label htmlFor="password" className="text-black-700 font-medium">Password *</Label>
                            <div className="relative mt-1">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black-400" />
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
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black-400 hover:text-gray-400"
                                aria-label="Toggle password visibility"
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                          </div>


                          <div>
                            <Label htmlFor="confirmPassword" className="text-black-700 font-medium">Confirm Password *</Label>
                            <div className="relative mt-1">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black-400" />
                              <Input
                                id="confirmPassword"
                                type="password"
                                {...register('confirmPassword')}
                                placeholder="Confirm your password"
                                className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                              />
                            </div>
                            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
                          </div>


                          <div className="md:col-span-2">
                            <Label htmlFor="address" className="text-black-700 font-medium">Address *</Label>
                            <div className="relative mt-1">
                              <MapPin className="absolute left-3 top-3 h-4 w-4 text-black-400" />
                              <Input
                                id="address"
                                {...register('address')}
                                placeholder="Enter your complete address"
                                className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                              />
                            </div>
                            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
                          </div>


                          <div>
                            <Label htmlFor="state" className="text-black-700 font-medium">State *</Label>
                            <Controller
                              name="state"
                              control={control}
                              render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger className="h-11 mt-1 border-gray-200 focus:border-blue-500">
                                    <SelectValue placeholder="Select your state" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                                    {indianStates.map((state) => (
                                      <SelectItem key={state} value={state} className="hover:bg-gray-100">
                                        {state}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                            {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
                          </div>
                      </div>
                    )}


                    <div className="flex items-center space-x-2">
                      <Controller
                        name="acceptTerms"
                        control={control}
                        render={({ field }) => (
                          <Checkbox id="acceptTerms" checked={field.value} onCheckedChange={field.onChange} />
                        )}
                      />
                      <Label htmlFor="acceptTerms" className="text-sm text-black-600">
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
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
                    >
                      Create Account
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>


                    <div className="text-center">
                      <p className="text-sm text-black-600">
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
