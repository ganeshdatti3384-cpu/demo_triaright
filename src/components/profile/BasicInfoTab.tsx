/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { User } from 'lucide-react';
import { authApi, profileApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface BasicInfoTabProps {
  form: any;
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({ form }) => {
  const { token } = useAuth();
  const { toast } = useToast();
  const loadProfile = async () => {
    try {
      const profile = await profileApi.getStudentProfile(token);
      form.reset({
        firstname: profile.fullName.split(" ")[0] || '',
        lastname: profile.fullName.split(" ")[1] || '',
        fatherName: profile.fatherName || '',
        gender: profile.gender || '',
        maritalStatus: profile.maritalStatus || '',
        nationality: profile.nationality || '',
        hobbies: profile.hobbies || '',
        email: profile.email || '',
        phone: profile.phone || '',
        whatsapp: profile.phone || '',
        address: profile.address || '',
      });
    } catch (err: any) {
      toast({ title: 'Error', description: 'Failed to load profile', variant: 'destructive' });
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const onSubmit = async (data: any) => {
    try {
      const fullName = `${data.firstname} ${data.lastname}`;
      await profileApi.updateStudentProfile(token, { ...data, fullName });
      toast({ title: 'Success', description: 'Profile updated successfully' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Update failed', variant: 'destructive' });
    }
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Personal Details */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-teal-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Personal Details
          </CardTitle>
          <CardDescription className="text-white/90">
            Your basic personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <FormField name="firstname" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl><Input {...field} className="border-2 focus:border-blue-500" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

           <FormField name="lastname" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl><Input {...field} className="border-2 focus:border-blue-500" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name="fatherName" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Father's Name</FormLabel>
              <FormControl><Input {...field} className="border-2 focus:border-blue-500" /></FormControl>
            </FormItem>
          )} />

          <FormField name="dob" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth</FormLabel>
              <FormControl><Input type="date" {...field} className="border-2 focus:border-blue-500" /></FormControl>
            </FormItem>
          )} />

          <FormField name="gender" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <FormControl><Input placeholder="Male / Female / Other" {...field} className="border-2 focus:border-blue-500" /></FormControl>
            </FormItem>
          )} />

          <FormField name="maritalStatus" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Marital Status</FormLabel>
              <FormControl><Input placeholder="Single / Married / Other" {...field} className="border-2 focus:border-blue-500" /></FormControl>
            </FormItem>
          )} />

          <FormField name="nationality" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Nationality</FormLabel>
              <FormControl><Input {...field} className="border-2 focus:border-blue-500" /></FormControl>
            </FormItem>
          )} />

          <FormField name="hobbies" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Hobbies</FormLabel>
              <FormControl><Textarea placeholder="e.g., Reading, Coding, Music" {...field} className="border-2 focus:border-blue-500" /></FormControl>
            </FormItem>
          )} />
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-teal-500 text-white rounded-t-lg">
          <CardTitle>Contact Information</CardTitle>
          <CardDescription className="text-white/90">
            How to reach you
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <FormField name="email" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl><Input type="email" {...field} className="border-2 focus:border-green-500" /></FormControl>
            </FormItem>
          )} />

          <FormField name="phone" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl><Input {...field} className="border-2 focus:border-green-500" /></FormControl>
            </FormItem>
          )} />

          <FormField name="whatsapp" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Whatsapp Number</FormLabel>
              <FormControl><Input {...field} className="border-2 focus:border-green-500" /></FormControl>
            </FormItem>
          )} />

          <FormField name="address" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl><Textarea {...field} className="border-2 focus:border-green-500" /></FormControl>
            </FormItem>
          )} />
        </CardContent>
      </Card>
    </div>
  );
};

export default BasicInfoTab;
