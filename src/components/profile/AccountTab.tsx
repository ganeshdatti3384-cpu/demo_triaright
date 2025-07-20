/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
  FormControl, FormField, FormItem, FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/services/api';

interface AccountTabProps {
  form: any;
}

const AccountTab: React.FC<AccountTabProps> = ({ form }) => {
  const { toast } = useToast();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Error',
        description: 'You are not logged in.',
        variant: 'destructive',
      });
      return;
    }

    if (!oldPassword || !newPassword) {
      toast({
        title: 'Missing Fields',
        description: 'Please enter both old and new passwords.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.updatePassword(token, oldPassword, newPassword);
      toast({
        title: 'Success',
        description: response.message || 'Password updated successfully.',
      });
      setOldPassword('');
      setNewPassword('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to update password.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-t-lg">
        <CardTitle>Account Settings</CardTitle>
        <CardDescription className="text-white/90">
          Update your password here
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <FormField name="username" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Email / Username</FormLabel>
            <FormControl>
              <Input {...field} className="border-2" disabled />
            </FormControl>
          </FormItem>
        )} />

        <div className="space-y-4">
          <FormItem>
            <FormLabel>Old Password</FormLabel>
            <FormControl>
              <Input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="border-2"
              />
            </FormControl>
          </FormItem>

          <FormItem>
            <FormLabel>New Password</FormLabel>
            <FormControl>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="border-2"
              />
            </FormControl>
          </FormItem>

          <Button
            onClick={handleUpdatePassword}
            disabled={loading}
            className="mt-2 bg-blue-600 text-white hover:bg-blue-800"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountTab;
