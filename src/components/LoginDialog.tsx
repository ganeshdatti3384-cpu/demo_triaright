
import React from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userName: string) => void;
  selectedRole: string;
}

interface LoginFormData {
  email: string;
  password: string;
  remember?: boolean;
}

const LoginDialog = ({ isOpen, onClose, onLoginSuccess, selectedRole }: LoginDialogProps) => {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    defaultValues: {
      email: 'aks@example.com',
      password: 'password123',
      remember: false
    }
  });

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'student': 'Student',
      'job-seeker': 'Job Seeker',
      'employee': 'Employee',
      'employer': 'Employer',
      'colleges': 'College',
      'admin': 'Admin',
      'super-admin': 'Super Admin'
    };
    return roleMap[role] || 'Student';
  };

  const onSubmit = (data: LoginFormData) => {
    // Accept "aks@example.com" with "password123" as valid login
    if (data.email === 'aks@example.com' && data.password === 'password123') {
      toast({
        title: "Success",
        description: `Logged in successfully as ${getRoleDisplayName(selectedRole)}!`,
      });
      onLoginSuccess('aks');
      onClose();
      return;
    }

    // For other attempts, show error
    toast({
      title: "Error",
      description: "Invalid credentials. Use aks@example.com with password123",
      variant: "destructive"
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-600">
            Sign In as {getRoleDisplayName(selectedRole)}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Welcome back! Sign in to your {getRoleDisplayName(selectedRole).toLowerCase()} account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="remember" {...register('remember')} />
            <Label htmlFor="remember" className="text-sm">Remember me</Label>
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            Sign In
          </Button>

          <div className="text-center">
            <a href="#" className="text-sm text-blue-600 hover:underline">
              Forgot your password?
            </a>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/register" className="text-blue-600 hover:underline font-semibold">
              Sign up
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
