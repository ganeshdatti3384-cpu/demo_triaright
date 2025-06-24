
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import Footer from '../components/Footer';
import Navbar from '@/components/Navbar';

const registrationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  whatsappNumber: z.string().min(10, 'WhatsApp number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  address: z.string().min(1, 'Address is required'),
  state: z.string().min(1, 'State is required'),
  userType: z.enum(['trainer', 'jobseeker', 'student', 'employer', 'college']),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept terms and conditions' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

const Register = () => {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  const onSubmit = (data: RegistrationFormData) => {
    console.log('Registration data:', data);
    toast({
      title: "Registration Successful!",
      description: "Your account has been created successfully.",
    });
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
      <Navbar onOpenAuth={function (type: 'login' | 'register', userType: string): void {
        throw new Error('Function not implemented.');
      }} />
      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center text-blue-600">
                Register
              </CardTitle>
              <p className="text-center text-gray-600">Create your account to get started</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" {...register('name')} placeholder="Enter your full name" />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input id="email" type="email" {...register('email')} placeholder="Enter your email address" />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input id="phoneNumber" {...register('phoneNumber')} placeholder="Enter your phone number" />
                  {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>}
                </div>

                <div>
                  <Label htmlFor="whatsappNumber">WhatsApp Number *</Label>
                  <Input id="whatsappNumber" {...register('whatsappNumber')} placeholder="Enter your WhatsApp number" />
                  {errors.whatsappNumber && <p className="text-red-500 text-sm mt-1">{errors.whatsappNumber.message}</p>}
                </div>

                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input id="password" type="password" {...register('password')} placeholder="Enter your password" />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input id="confirmPassword" type="password" {...register('confirmPassword')} placeholder="Confirm your password" />
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input id="address" {...register('address')} placeholder="Enter your address" />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
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
                  {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
                </div>

                <div>
                  <Label htmlFor="userType">I am registering as *</Label>
                  <Select onValueChange={(value) => setValue('userType', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="jobseeker">Job Seeker</SelectItem>
                      <SelectItem value="trainer">Trainer</SelectItem>
                      <SelectItem value="employer">Employer</SelectItem>
                      <SelectItem value="college">College</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.userType && <p className="text-red-500 text-sm mt-1">{errors.userType.message}</p>}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" {...register('acceptTerms')} />
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
                {errors.acceptTerms && (
                  <p className="text-red-500 text-sm mt-1">{errors.acceptTerms.message}</p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Register
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <a href="/" className="text-blue-600 hover:underline font-semibold">
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
