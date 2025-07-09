/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { User } from 'lucide-react';

interface BasicInfoTabProps {
  form: any;
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({ form }) => {
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
          <FormField name="fullName" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
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
              <FormLabel>Phone</FormLabel>
              <FormControl><Input {...field} className="border-2 focus:border-green-500" /></FormControl>
            </FormItem>
          )} />

          <FormField name="altPhone" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Alternate Phone</FormLabel>
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
