/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

import {
  Users, UserPlus, Download, Upload, Search,
  Mail, Phone, MapPin, User as UserIcon, Lock,
  Eye as EyeIcon, EyeOff, GraduationCap, Trash2,
} from 'lucide-react';

import { authApi, RegisterPayload } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

// Registration validation schema - same as Register.tsx with refinements
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
  role: z.enum(['trainer', 'jobseeker', 'student', 'employer', 'college']),
  collegeName: z.string().optional(),
  collegeCode: z.string().optional(),
  acceptTerms: z.boolean().refine((v) => v === true, {
    message: 'You must accept terms and conditions',
  }),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})
.refine((data) => (data.role === 'student' ? !!data.collegeName : true), {
  message: 'College selection is required for students',
  path: ['collegeName'],
})
.refine((data) => (data.role === 'college' ? !!data.collegeCode : true), {
  message: 'College code is required for colleges',
  path: ['collegeCode'],
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface College {
  _id: string;
  collegeName?: string;
  userId: string;
  university: string;
  city: string;
  state: string;
}

interface AppUser {
  _id: string;
  id?: string; // sometimes used as key in older code
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
}

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loadingColleges, setLoadingColleges] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5003/api';

  // Indian states list - same as Register.tsx
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  ];

  // Form setup - same as Register.tsx
  const { register, handleSubmit, control, watch, formState: { errors }, reset } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { acceptTerms: false },
  });

  const selectedRole = watch('role');

  useEffect(() => {
    fetchUsers();
    fetchColleges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch colleges - same as Register.tsx
  const fetchColleges = async () => {
    try {
      setLoadingColleges(true);
      const res = await fetch(`${API_BASE_URL}/users/statistics/count/colleges`);
      const data = await res.json();
      setColleges(data.colleges || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load colleges list',
        variant: 'destructive',
      });
    } finally {
      setLoadingColleges(false);
    }
  };

  // Fetch users (robust to shape)
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: 'Authentication Error',
          description: 'Authentication token not found.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
      const response = await authApi.getAllUsers(token);
      const list: AppUser[] = response?.users || [];
      setUsers(list);
      toast({
        title: 'Success',
        description: `Loaded ${list.length} users successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while fetching users.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle registration - same API call as Register.tsx
  const handleRegister = async (formData: RegistrationFormData) => {
    try {
      setLoading(true);
      const registerPayload: RegisterPayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        whatsappNumber: formData.whatsappNumber,
        address: formData.address,
        role: formData.role === 'trainer' ? 'admin' : formData.role,
        password: formData.password,
        ...(formData.role === 'student' && formData.collegeName ? { collegeName: formData.collegeName } : {}),
        ...(formData.role === 'college' && formData.collegeCode ? { collegeCode: formData.collegeCode } : {}),
      };
      await authApi.register(registerPayload);

      toast({
        title: 'Success',
        description: 'User registered successfully!',
      });

      setCreateUserOpen(false);
      reset();
      await fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error?.response?.data?.error || error?.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete user (fixed): optimistic UI + server call + rollback on failure
  const handleDeleteUser = async (userId: string) => {
    const yes = window.confirm('Are you sure you want to delete this user?');
    if (!yes) return;

    const prev = users;
    setUsers((u) => u.filter((x) => (x._id || x.id) !== userId));

    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      if (!token) throw new Error('No auth token');

      // Prefer authApi if it exists
      if ((authApi as any)?.deleteUser) {
        await (authApi as any).deleteUser(userId, token);
      } else {
        await axios.delete(`${API_BASE_URL}/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      toast({
        title: 'Success',
        description: 'User deleted successfully!',
      });
    } catch (error: any) {
      // rollback
      setUsers(prev);
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  // Derived filtered users (memoized)
  const filteredUsers = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();
    return (users || []).filter((user) => {
      if (!user) return false;
      const role = (user.role || '').toLowerCase();
      const matchesRole = selectedRoleFilter === 'all' || role === selectedRoleFilter.toLowerCase();
      if (!matchesRole) return false;
      if (!search) return true;

      const fields = [
        user.firstName || '',
        user.lastName || '',
        user.email || '',
        user.phoneNumber || '',
      ].map((v) => v.toLowerCase());

      return fields.some((f) => f.includes(search));
    });
  }, [users, searchTerm, selectedRoleFilter]);

  // Bulk upload sample
  const downloadSampleExcel = () => {
    const sampleData = [
      ['firstname', 'lastname', 'email', 'role', 'phoneNumber', 'whatsappNumber', 'address', 'state', 'password', 'collegeName'],
      ['John', 'Doe', 'john@example.com', 'student', '9876543210', '9876543210', '123 Main St', 'Andhra Pradesh', 'password123', 'ABC College'],
      ['Jane', 'Smith', 'jane@example.com', 'jobseeker', '9876543211', '9876543211', '456 Business Ave', 'Telangana', 'password123', ''],
      ['Mark', 'Johnson', 'mark@example.com', 'college', '9876543212', '9876543212', '789 College St', 'Karnataka', 'password123', ''],
    ];
    const csvContent = sampleData.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_users_sample.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: 'Sample file downloaded! You can open it in Excel and save as .xlsx',
    });
  };

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      toast({
        title: 'Error',
        description: 'Please upload an Excel file (.xlsx or .xls) or CSV file',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');

      const response = await axios.post(`${API_BASE_URL}/users/bulk-register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.data && response.data.results) {
        const results = response.data.results;
        const successCount = results.filter((r: any) => r.status === 'success').length;
        const failCount = results.filter((r: any) => r.status === 'failed').length;

        if (successCount > 0) {
          toast({
            title: 'Upload Success',
            description: `${successCount} users uploaded successfully!`,
          });
        }
        if (failCount > 0) {
          toast({
            title: 'Upload Warning',
            description: `${failCount} users failed to upload. Check console for details.`,
            variant: 'destructive',
          });
          // eslint-disable-next-line no-console
          console.error('Failed uploads:', results.filter((r: any) => r.status === 'failed'));
        }
      } else {
        toast({
          title: 'Upload Success',
          description: 'Bulk upload completed successfully!',
        });
      }

      await fetchUsers();
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast({
          title: 'Upload Failed',
          description: error.response.data.message,
          variant: 'destructive',
        });
      } else if (error.response?.status === 401) {
        toast({
          title: 'Unauthorized',
          description: 'Please check your admin credentials.',
          variant: 'destructive',
        });
      } else if (error.response?.status === 400) {
        toast({
          title: 'Bad Request',
          description: 'Please check your Excel file format.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Upload Failed',
          description: 'Failed to upload users. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
      if (event.target) event.target.value = '';
    }
  };

  // Lightweight row component inline (Edit removed)
  const Row = ({ user }: { user: AppUser }) => {
    const id = user._id || user.id || '';
    return (
      <tr className="border-b last:border-none">
        <td className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold">
              {(user.firstName?.[0] || '?').toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="font-medium truncate">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-xs text-gray-500 truncate">{user.email}</div>
            </div>
          </div>
        </td>
        <td className="p-4">
          <div className="text-sm">{user.phoneNumber || '-'}</div>
        </td>
        <td className="p-4">
          <div className="inline-flex px-2 py-1 rounded-full text-xs bg-gray-100 capitalize">
            {user.role || '-'}
          </div>
        </td>
        <td className="p-4">
          <div className="flex justify-end">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteUser(id)}
              aria-label="Delete user"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-gray-600">Manage all platform users</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={downloadSampleExcel}>
            <Download className="h-4 w-4 mr-2" />
            Sample Excel
          </Button>
          <label className="cursor-pointer">
            <Button variant="outline" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Bulk Upload
              </span>
            </Button>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleBulkUpload}
              className="hidden"
            />
          </label>

          <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Register New User
                </DialogTitle>
                <DialogDescription>
                  Register a new user with complete details using the same form as the registration page.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit(handleRegister)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName" className="text-gray-700 font-medium">First Name *</Label>
                    <div className="relative mt-1">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="firstName"
                        {...register('firstName')}
                        placeholder="Enter first name"
                        className="pl-10 h-11"
                      />
                    </div>
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="lastName" className="text-gray-700 font-medium">Last Name *</Label>
                    <div className="relative mt-1">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="lastName"
                        {...register('lastName')}
                        placeholder="Enter last name"
                        className="pl-10 h-11"
                      />
                    </div>
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-gray-700 font-medium">Email Address *</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        placeholder="Enter email address"
                        className="pl-10 h-11"
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="phoneNumber" className="text-gray-700 font-medium">Phone Number *</Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phoneNumber"
                        {...register('phoneNumber')}
                        placeholder="Enter phone number"
                        className="pl-10 h-11"
                      />
                    </div>
                    {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="whatsappNumber" className="text-gray-700 font-medium">WhatsApp Number *</Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="whatsappNumber"
                        {...register('whatsappNumber')}
                        placeholder="Enter WhatsApp number"
                        className="pl-10 h-11"
                      />
                    </div>
                    {errors.whatsappNumber && <p className="text-red-500 text-sm mt-1">{errors.whatsappNumber.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-gray-700 font-medium">Password *</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        {...register('password')}
                        placeholder="Enter password"
                        className="pl-10 pr-10 h-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password *</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        {...register('confirmPassword')}
                        placeholder="Confirm password"
                        className="pl-10 h-11"
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="address" className="text-gray-700 font-medium">Address *</Label>
                    <div className="relative mt-1">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="address"
                        {...register('address')}
                        placeholder="Enter complete address"
                        className="pl-10 h-11"
                      />
                    </div>
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="state" className="text-gray-700 font-medium">State *</Label>
                    <Controller
                      name="state"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className="h-11 mt-1">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {indianStates.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="role" className="text-gray-700 font-medium">Role *</Label>
                    <Controller
                      name="role"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className="h-11 mt-1">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="jobseeker">Job Seeker</SelectItem>
                            <SelectItem value="employer">Employer</SelectItem>
                            <SelectItem value="trainer">Trainer</SelectItem>
                            <SelectItem value="college">College</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
                  </div>

                  {selectedRole === 'student' && (
                    <div className="md:col-span-2">
                      <Label htmlFor="collegeName" className="text-gray-700 font-medium">Select College *</Label>
                      <Controller
                        name="collegeName"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingColleges}>
                            <SelectTrigger className="h-11 mt-1">
                              <div className="flex items-center">
                                <GraduationCap className="h-4 w-4 mr-2 text-gray-400" />
                                <SelectValue placeholder={loadingColleges ? 'Loading colleges...' : 'Select college'} />
                              </div>
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                              {(colleges || []).map((college) => (
                                <SelectItem key={college._id} value={college.collegeName || ''}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{college.collegeName}</span>
                                    <span className="text-sm text-gray-500">{college.university} - {college.city}, {college.state}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.collegeName && <p className="text-red-500 text-sm mt-1">{errors.collegeName.message}</p>}
                    </div>
                  )}

                  {selectedRole === 'college' && (
                    <div className="md:col-span-2">
                      <Label htmlFor="collegeCode" className="text-gray-700 font-medium">College Code *</Label>
                      <div className="relative mt-1">
                        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="collegeCode"
                          {...register('collegeCode')}
                          placeholder="Enter college code"
                          className="pl-10 h-11"
                        />
                      </div>
                      {errors.collegeCode && <p className="text-red-500 text-sm mt-1">{errors.collegeCode.message}</p>}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Controller
                    name="acceptTerms"
                    control={control}
                    render={({ field }) => (
                      <Checkbox id="acceptTerms" checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                  <Label htmlFor="acceptTerms" className="text-sm text-gray-600">
                    I agree to the Terms and Conditions and Privacy Policy *
                  </Label>
                </div>
                {errors.acceptTerms && <p className="text-red-500 text-sm">{errors.acceptTerms.message}</p>}

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCreateUserOpen(false);
                      reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Registering...' : 'Register User'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Unified filter bar: search + role filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-56">
              <Select value={selectedRoleFilter} onValueChange={setSelectedRoleFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="jobseeker">Job Seekers</SelectItem>
                  <SelectItem value="employer">Employers</SelectItem>
                  <SelectItem value="trainer">Trainers</SelectItem>
                  <SelectItem value="college">Colleges</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            All Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-32" />
                    </div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20" />
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800">No Users Found</h3>
              <p className="text-gray-500">Try adjusting your search or role filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-xs text-gray-600 uppercase">
                  <tr>
                    <th className="p-4 font-semibold">User</th>
                    <th className="p-4 font-semibold">Contact</th>
                    <th className="p-4 font-semibold">Role</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <Row key={user._id || user.id} user={user} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
