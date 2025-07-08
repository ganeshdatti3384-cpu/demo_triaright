/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
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
import Navbar from './Navbar';

const profileSchema = z.object({
  fullName: z.string().min(2),
  dob: z.string(),
  gender: z.string(),
  email: z.string().email(),
  phone: z.string(),
  altPhone: z.string().optional(),
  address: z.string(),
  fatherName: z.string().optional(),
  maritalStatus: z.string(),
  nationality: z.string(),
  languages: z.string(),
  hobbies: z.string().optional(),
  education: z.array(
    z.object({
      institute: z.string(),
      course: z.string(),
      year: z.string(),
    })
  ),
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
  username: z.string(),
  password: z.string(),
});

const ProfileSection: React.FC = () => {
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
    const stored = localStorage.getItem('profileData');
    if (stored) {
      form.reset(JSON.parse(stored));
    }
  }, []);

  const onSubmit = (data: any) => {
    localStorage.setItem('profileData', JSON.stringify(data));
    alert('Profile saved to localStorage.');
  };

  return (
    <>
      <Navbar />

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
            <Button type="submit">Save Profile</Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default ProfileSection;
