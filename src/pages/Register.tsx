
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
import { User, Mail, Phone,  MapPin, ArrowRight, Sparkles, Star, Shield, ArrowLeft, Users, GraduationCap } from 'lucide-react';
import { authApi, RegisterPayload } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from "lucide-react";

const registrationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  whatsappNumber: z.string().min(10, 'WhatsApp number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  address: z.string().min(1, 'Address is required'),
  state: z.string().min(1, 'State is required'),
  role: z.enum(['trainer', 'jobseeker', 'student', 'employer', 'college']),
  collegeName: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept terms and conditions'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.role === 'student' && data.collegeName) {
    return false;
  }
  return true;
}, {
  message: "College selection is required for students",
  path: ["collegeName"],
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

  const { register, handleSubmit, setValue, control, watch, formState: { errors } } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      acceptTerms: false
    }
  });

  const selectedRole = watch('role');

  // Fetch colleges when component mounts
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoadingColleges(true);
        const response = await fetch('https://triaright.com/api/colleges/collegedata');
        const data = await response.json();
        setColleges(data.colleges || []);
      } catch (error) {
        console.error('Error fetching colleges:', error);
        toast({
          title: "Error",
          description: "Failed to load colleges list",
          variant: "destructive",
        });
      } finally {
        setLoadingColleges(false);
      }
    };

    fetchColleges();
  }, [toast]);

  const handleRegister = async (formData: RegistrationFormData) => {
    try {
      const registerPayload: RegisterPayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        whatsappNumber: formData.whatsappNumber,
        address: formData.address,
        role: formData.role === 'trainer' ? 'admin' : formData.role,
        password: formData.password,
        ...(formData.role === 'student' && formData.collegeName && { collegeName: formData.collegeName })
      };
      const response = await authApi.register(registerPayload);
      toast({ title: "Success", description: "Registration successful! Please login." });
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error?.response?.data?.error || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
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
              <p>Permission is granted to temporarily download one copy of the materials on TriaRight's website for personal, non-commercial transitory viewing only.</p>
              
              <h2>3. Disclaimer</h2>
              <p>The materials on TriaRight's website are provided on an 'as is' basis. TriaRight makes no warranties, expressed or implied.</p>
              
              <h2>4. Limitations</h2>
              <p>In no event shall TriaRight or its suppliers be liable for any damages arising out of the use or inability to use the materials on TriaRight's website.</p>
              
              <h2>5. Account Responsibilities</h2>
              <p>You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer.</p>
              
              <h2>6. Privacy Policy</h2>
              <p>Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service.</p>
              
              <h2>7. Modifications</h2>
              <p>TriaRight may revise these terms of service at any time without notice. By using this web site you are agreeing to be bound by the then current version of these terms of service.</p>
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
              <p>We collect information you provide directly to us, such as when you create an account, update your profile, or contact us for support.</p>
              
              <h2>2. How We Use Your Information</h2>
              <p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
              
              <h2>3. Information Sharing</h2>
              <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
              
              <h2>4. Data Security</h2>
              <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
              
              <h2>5. Cookies and Tracking</h2>
              <p>We use cookies and similar technologies to enhance your experience, analyze usage patterns, and personalize content.</p>
              
              <h2>6. Your Rights</h2>
              <p>You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us.</p>
              
              <h2>7. Changes to This Policy</h2>
              <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );

  if (currentView === 'terms') {
    return renderTermsAndConditions();
  }

  if (currentView === 'privacy') {
    return renderPrivacyPolicy();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1  relative overflow-hidden">
        <div className="absolute inset-0">
          {/* Floating geometric shapes */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rotate-45 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-40 left-20 w-12 h-12 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '4s' }}></div>
          <div className="absolute bottom-20 right-40 w-24 h-24 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rotate-12 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
          
          {/* Radial gradients */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-blue-500/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-radial from-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-gradient-to-br from-purple-400/5 to-pink-400/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto px-4 py-12 max-w-7xl">
          {/* Header Section */}
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
            {/* Left side - Benefits */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="backdrop-blur-xl bg-white/10  border-0 shadow-xl">
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

            {/* Right side - Registration Form */}
            <div className="lg:col-span-2">
              <Card className="backdrop-blur-xl bg-white/10  border-0 shadow-2xl">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold text-black">Create Your Account</CardTitle>
                  <p className="text-gray-400">Fill in your details to get started</p>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit(handleRegister)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="firstName" className="text-black-700 font-medium">First Name *</Label>
                        <div className="relative mt-1">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black-400" />
                          <Input 
                            id="firstName" 
                            {...register('firstName')} 
                            placeholder="Enter your first name" 
                            className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                          />
                        </div>
                        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
                      </div>

                      <div>
                        <Label htmlFor="lastName" className="text-black-700 font-medium">Last Name *</Label>
                        <div className="relative mt-1">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black-400" />
                          <Input 
                            id="lastName" 
                            {...register('lastName')} 
                            placeholder="Enter your last name" 
                            className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                          />
                        </div>
                        {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
                      </div>

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
                        <Label htmlFor="password" className="text-black-700 font-medium">
                          Password *
                        </Label>
                        <div className="relative mt-1">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black-400" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            {...register("password")}
                            placeholder="Enter your password"
                            className="pl-10 pr-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black-400 hover:text-gray-400"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.password.message}
                          </p>
                        )}
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
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                      <div>
                        <Label htmlFor="role" className="text-black-700 font-medium">I am a *</Label>
                        <Controller
                          name="role"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger className="h-11 mt-1 border-gray-200 focus:border-blue-500">
                                <SelectValue placeholder="Select your role" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                <SelectItem value="student" className="hover:bg-gray-100">Student</SelectItem>
                                <SelectItem value="jobseeker" className="hover:bg-gray-100">Job Seeker</SelectItem>
                                <SelectItem value="employer" className="hover:bg-gray-100">Employer</SelectItem>
                                <SelectItem value="trainer" className="hover:bg-gray-100">Trainer</SelectItem>
                                <SelectItem value="college" className="hover:bg-gray-100">College</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
                      </div>

                      {/* College Dropdown - Only show when student role is selected */}
                      {selectedRole === 'student' && (
                        <div className="md:col-span-2">
                          <Label htmlFor="collegeName" className="text-black-700 font-medium">Select College *</Label>
                          <Controller
                            name="collegeName"
                            control={control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingColleges}>
                                <SelectTrigger className="h-11 mt-1 border-gray-200 focus:border-blue-500">
                                  <div className="flex items-center">
                                    <GraduationCap className="h-4 w-4 mr-2 text-black-400" />
                                    <SelectValue placeholder={loadingColleges ? "Loading colleges..." : "Select your college"} />
                                  </div>
                                </SelectTrigger>
                                <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                                  {colleges.map((college) => (
                                    <SelectItem key={college._id} value={college.collegeName} className="hover:bg-gray-100">
                                      <div className="flex flex-col">
                                        <span className="font-medium">{college.collegeName}</span>
                                        <span className="text-sm text-gray-500">{college.university} - {college.city}, {college.state}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                          {errors.collegeName && <p className="text-red-500 text-sm mt-1">{errors.collegeName.message}</p>}
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
                      <Label htmlFor="acceptTerms" className="text-sm text-black-600">
                        I agree to the{' '}
                        <button
                          type="button"
                          onClick={() => setCurrentView('terms')}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Terms and Conditions
                        </button>
                        {' '}and{' '}
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
