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
import { ArrowLeft } from 'lucide-react';
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
  role: z.string(),
  userType: z.enum(['trainer', 'jobseeker', 'student', 'employer', 'college']),
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
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-300 bg-clip-text text-transparent">
                Register
              </CardTitle>
              <p className="text-center text-gray-600">Create your account to get started</p>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleSubmit(handleRegister)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" {...register('firstName')} placeholder="Enter your first name" />
                    {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" {...register('lastName')} placeholder="Enter your last name" />
                    {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" type="email" {...register('email')} placeholder="Enter your email address" />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input id="phoneNumber" {...register('phoneNumber')} placeholder="Enter your phone number" />
                    {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="whatsappNumber">WhatsApp Number *</Label>
                    <Input id="whatsappNumber" {...register('whatsappNumber')} placeholder="Enter your WhatsApp number" />
                    {errors.whatsappNumber && <p className="text-red-500 text-sm">{errors.whatsappNumber.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input id="password" type="password" {...register('password')} placeholder="Enter your password" />
                    {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input id="confirmPassword" type="password" {...register('confirmPassword')} placeholder="Confirm your password" />
                    {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input id="address" {...register('address')} placeholder="Enter your address" />
                    {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Select onValueChange={(value) => setValue('state', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your state" />
                      </SelectTrigger>
                      <SelectContent>
                        {indianStates.map((state) => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.state && <p className="text-red-500 text-sm">{errors.state.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="role">Role *</Label>
                    <Input id="role" {...register('role')} placeholder="Enter your role" />
                    {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="userType">User Type *</Label>
                    <Select onValueChange={(value) => setValue('userType', value as any)}>
                      <SelectTrigger>
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
                    {errors.userType && <p className="text-red-500 text-sm">{errors.userType.message}</p>}
                  </div>
                </div>

                <div className="flex items-start space-x-2 mt-4">
                  <Controller
                    name="acceptTerms"
                    control={control}
                    render={({ field }) => (
                      <Checkbox id="terms" checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                  <Label htmlFor="terms">
                    I accept the{' '}
                    <Dialog>
                      <DialogTrigger className="text-blue-600 underline cursor-pointer">Terms and Conditions</DialogTrigger>
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
                  </Label>
                </div>
                {errors.acceptTerms && <p className="text-red-500 text-sm mt-1">{errors.acceptTerms.message}</p>}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  Register
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <a href="/login" className="text-blue-600 hover:underline font-semibold">
                    Sign in
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;
