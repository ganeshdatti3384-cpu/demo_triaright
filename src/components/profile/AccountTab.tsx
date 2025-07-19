/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { authApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface AccountTabProps {
  form: any;
}
const handlePasswordUpdate = async (values: {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  const token = localStorage.getItem('token');
  const { oldPassword, newPassword, confirmPassword } = values;
  const toast = useToast();

  if (!token) {
    toast({
      title: 'Authentication Required',
      description: 'Please login to update password.',
      variant: 'destructive'
    });
    return;
  }

  if (newPassword !== confirmPassword) {
    toast({
      title: 'Password Mismatch',
      description: 'New and confirm passwords must match.',
      variant: 'destructive'
    });
    return;
  }

  try {
    const response = await authApi.updatePassword(token, { oldPassword, newPassword });

    toast({
      title: 'Success',
      description: response.message || 'Password updated successfully.',
      variant: 'default'
    });

    // Optionally reset form or logout user
  } catch (err: any) {
    toast({
      title: 'Error',
      description: err.response?.data?.message || 'Failed to update password.',
      variant: 'destructive'
    });
  }
};
const AccountTab: React.FC<AccountTabProps> = ({ form }) => {
  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-t-lg">
        <CardTitle>Update Password</CardTitle>
        <CardDescription className="text-white/90">
          Change your login credentials
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {/* Current Password */}
        <FormField
          name="oldPassword"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter current password"
                  className="border-2 focus:border-gray-500"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* New Password */}
        <FormField
          name="newPassword"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  className="border-2 focus:border-gray-500"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Confirm New Password */}
        <FormField
          name="confirmPassword"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  className="border-2 focus:border-gray-500"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};

export default AccountTab;
