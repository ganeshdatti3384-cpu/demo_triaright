
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import Footer from '../components/Footer';
import Navbar from '@/components/Navbar';
import { User, Mail, Phone, Lock, MapPin, Briefcase, Users, ArrowRight, Sparkles, Star, Shield } from 'lucide-react';
import { authApi, RegisterPayload } from '@/services/api';
import { useNavigate } from 'react-router-dom';

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
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept terms and conditions'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

const Register = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      acceptTerms: false
    }
  });

  const handleRegister = async (formData: RegisterPayload) => {
    try {
      const response = await authApi.register(formData);
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onOpenAuth={function () {}} />
      
      <main className="flex-1 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden">
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
            {/* Left side - Benefits */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="backdrop-blur-xl bg-white/60 border-0 shadow-xl">
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

            {/* Right side - Registration Form */}
            <div className="lg:col-span-2">
              <Card className="backdrop-blur-xl bg-white/80 border-0 shadow-2xl">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold text-gray-800">Create Your Account</CardTitle>
                  <p className="text-gray-600">Fill in your details to get started</p>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit(handleRegister)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="firstName" className="text-gray-700 font-medium">First Name *</Label>
                        <div className="relative mt-1">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                        <Label htmlFor="lastName" className="text-gray-700 font-medium">Last Name *</Label>
                        <div className="relative mt-1">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                            type="password" 
                            {...register('password')} 
                            placeholder="Enter your password" 
                            className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                          />
                        </div>
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                      </div>

                      <div>
                        <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password *</Label>
                        <div className="relative mt-1">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                      <div>
                        <Label htmlFor="state" className="text-gray-700 font-medium">State *</Label>
                        <Select onValueChange={(value) => setValue('state', value)}>
                          <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 transition-colors">
                            <SelectValue placeholder="Select your state" />
                          </SelectTrigger>
                          <SelectContent>
                            {indianStates.map((state) => (
                              <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="address" className="text-gray-700 font-medium">Address *</Label>
                        <div className="relative mt-1">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input 
                            id="address" 
                            {...register('address')} 
                            placeholder="Enter your address" 
                            className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                          />
                        </div>
                        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
                      </div>

                      

                      <div className="md:col-span-2">
                        <Label htmlFor="role" className="text-gray-700 font-medium">Role*</Label>
                        <Select onValueChange={(value) => setValue('role', value as any)}>
                          <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 transition-colors">
                            <SelectValue placeholder="Select your user type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="jobseeker">Job Seeker</SelectItem>
                            <SelectItem value="trainer">Trainer</SelectItem>
                            <SelectItem value="employer">Employer</SelectItem>
                            <SelectItem value="college">College</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Controller
                        name="acceptTerms"
                        control={control}
                        render={({ field }) => (
                          <Checkbox 
                            id="terms" 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                            className="mt-1"
                          />
                        )}
                      />
                      <Label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                        I accept the{' '}
                        <Dialog>
                          <DialogTrigger className="text-blue-600 underline cursor-pointer hover:text-blue-700">
                            Terms and Conditions
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Terms and Conditions</DialogTitle>
                              <p className="text-sm text-gray-600 mt-2">
                                By registering, you agree to abide by our platform rules, respect others, and follow the guidelines provided by administrators.
                                Your data is securely handled in compliance with privacy policies.
                              </p>
                            </DialogHeader>
                          </DialogContent>
                        </Dialog>
                        {' '}and{' '}
                        <span className="text-blue-600 underline cursor-pointer hover:text-blue-700">Privacy Policy</span>
                      </Label>
                    </div>
                    {errors.acceptTerms && <p className="text-red-500 text-sm">{errors.acceptTerms.message}</p>}

                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      <div className="flex items-center space-x-2">
                        <span>Create Account</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </Button>
                  </form>

                  <div className="mt-8 text-center">
                    <p className="text-gray-600">
                      Already have an account?{' '}
                      <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                        Sign in
                      </a>
                    </p>
                  </div>
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
