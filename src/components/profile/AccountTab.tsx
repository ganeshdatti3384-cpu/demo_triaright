/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface AccountTabProps {
  form: any;
}

const AccountTab: React.FC<AccountTabProps> = ({ form }) => {
  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-t-lg">
        <CardTitle>Account Settings</CardTitle>
        <CardDescription className="text-white/90">
          Manage your login credentials
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <FormField name="username" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormControl><Input {...field} className="border-2 focus:border-gray-500" /></FormControl>
          </FormItem>
        )} />
      </CardContent>
    </Card>
  );
};

export default AccountTab;
