
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { profileApi } from '@/services/api';
import Navbar from './Navbar';

const profileSchema = z.object({
  fullName: z.string().min(2).optional(),
  dob: z.string().optional(),
  gender: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  altPhone: z.string().optional(),
  address: z.string().optional(),
  fatherName: z.string().optional(),
  maritalStatus: z.string().optional(),
  nationality: z.string().optional(),
  languages: z.string().optional(),
  hobbies: z.string().optional(),
  education: z.array(
    z.object({
      institute: z.string(),
      course: z.string(),
      year: z.string(),
    })
  ).optional(),
  projects: z
    .array(
      z.object({
        name: z.string(),
        github: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .optional(),
  certifications: z.string().optional(),
  internships: z
    .array(
      z.object({
        company: z.string(),
        role: z.string(),
        responsibilities: z.string(),
      })
    )
    .optional(),
  username: z.string().optional(),
  password: z.string().optional(),
}).passthrough();

const ProfileSection: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<any>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      dob: '',
      gender: '',
      email: '',
      phone: '',
      altPhone: '',
      address: '',
      fatherName: '',
      maritalStatus: '',
      nationality: '',
      languages: '',
      hobbies: '',
      education: [{ institute: '', course: '', year: '' }],
      projects: [{ name: '', github: '', description: '' }],
      internships: [{ company: '', role: '', responsibilities: '' }],
      username: '',
      password: '',
    },
  });

  const { fields: eduFields, append: appendEdu } = useFieldArray({
    control: form.control,
    name: 'education',
  });

  const { fields: projFields, append: appendProj } = useFieldArray({
    control: form.control,
    name: 'projects',
  });

  const { fields: internFields, append: appendIntern } = useFieldArray({
    control: form.control,
    name: 'internships',
  });

  useEffect(() => {
    initializeProfile();
  }, []);

  const initializeProfile = async () => {
    const currentUser = localStorage.getItem('currentUser');
    const token = localStorage.getItem('token');
    
    if (currentUser && token) {
      const userData = JSON.parse(currentUser);
      setUser(userData);
      await fetchUserProfile(userData.role, token);
    } else {
      toast({
        title: 'Error',
        description: 'Please login to access profile',
        variant: 'destructive'
      });
    }
  };

  const fetchUserProfile = async (role: string, token: string) => {
    setIsLoading(true);
    try {
      let profileData;
      
      switch (role) {
        case 'student':
          profileData = await profileApi.getStudentProfile(token);
          break;
        case 'jobseeker':
          profileData = await profileApi.getJobSeekerProfile(token);
          break;
        case 'employer':
          profileData = await profileApi.getEmployerProfile(token);
          break;
        case 'college':
          profileData = await profileApi.getCollegeProfile(token);
          break;
        default:
          console.log('No profile API available for this role');
          return;
      }

      if (profileData) {
        const formData = {
          fullName: profileData.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`,
          dob: profileData.dateOfBirth || profileData.dob || '',
          gender: profileData.gender || '',
          email: profileData.email || user?.email || '',
          phone: profileData.phone || user?.phoneNumber || '',
          altPhone: profileData.alternatePhone || profileData.altPhone || user?.whatsappNumber || '',
          address: profileData.address || user?.address || '',
          fatherName: profileData.fatherName || '',
          maritalStatus: profileData.maritalStatus || '',
          nationality: profileData.nationality || '',
          languages: profileData.languagesKnown || profileData.languages || '',
          hobbies: profileData.hobbies || '',
          education: profileData.qualifications || profileData.education || [{ institute: '', course: '', year: '' }],
          projects: profileData.projects || [{ name: '', github: '', description: '' }],
          internships: profileData.internships || [{ company: '', role: '', responsibilities: '' }],
          username: profileData.username || user?.email || '',
          certifications: profileData.certifications || '',
          ...profileData
        };
        
        form.reset(formData);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    const token = localStorage.getItem('token');
    if (!token || !user) {
      toast({
        title: 'Error',
        description: 'Please login to update profile',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      let response;
      
      switch (user.role) {
        case 'student':
          response = await profileApi.updateStudentProfile(token, data);
          break;
        case 'jobseeker':
          response = await profileApi.updateJobSeekerProfile(token, data);
          break;
        case 'employer':
          response = await profileApi.updateEmployerProfile(token, data);
          break;
        case 'college':
          response = await profileApi.updateCollegeProfile(token, data);
          break;
        default:
          throw new Error('No update API available for this role');
      }

      toast({
        title: 'Success',
        description: response.message || 'Profile updated successfully!',
      });

      // Refresh profile data
      await fetchUserProfile(user.role, token);
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Navbar />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading profile...</span>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card className="hover:shadow-md transition border">
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Enter your personal and contact details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField name="fullName" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="dob" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField name="gender" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <FormControl><Input placeholder="Male / Female / Other" {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField name="email" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField name="phone" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField name="altPhone" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alternate Phone</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField name="address" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl><Textarea {...field} /></FormControl>
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              {/* Family Info */}
              <Card className="hover:shadow-md transition border">
                <CardHeader>
                  <CardTitle>Family & Personal Info</CardTitle>
                  <CardDescription>Details about your family and preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField name="fatherName" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Father's Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField name="maritalStatus" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marital Status</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField name="nationality" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nationality</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField name="languages" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Languages Known</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField name="hobbies" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hobbies</FormLabel>
                      <FormControl><Textarea {...field} /></FormControl>
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              {/* Education */}
              <Card className="hover:shadow-md transition border col-span-1 md:col-span-2">
                <CardHeader>
                  <CardTitle>Education</CardTitle>
                  <CardDescription>Your academic qualifications.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {eduFields.map((field, index) => (
                    <div key={field.id} className="space-y-2">
                      <FormField name={`education.${index}.institute`} control={form.control} render={({ field }) => (
                        <FormItem>
                          <FormLabel>Institute</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                        </FormItem>
                      )} />
                      <FormField name={`education.${index}.course`} control={form.control} render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                        </FormItem>
                      )} />
                      <FormField name={`education.${index}.year`} control={form.control} render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                        </FormItem>
                      )} />
                    </div>
                  ))}
                  <Button type="button" onClick={() => appendEdu({ institute: '', course: '', year: '' })}>
                    + Add Another Qualification
                  </Button>
                </CardContent>
              </Card>

              {/* Account Setup */}
              <Card className="hover:shadow-md transition border">
                <CardHeader>
                  <CardTitle>Account Setup</CardTitle>
                  <CardDescription>Login credentials</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField name="username" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField name="password" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl><Input type="password" {...field} /></FormControl>
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
            </div>

            {/* Submit Button */}
            <div className="mt-8">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-900 text-white px-12 py-3 text-lg shadow-lg transform transition-all duration-300 hover:scale-105"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Updating Profile...
                  </>
                ) : (
                  'Save Profile'
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </>
  );
};

export default ProfileSection;
