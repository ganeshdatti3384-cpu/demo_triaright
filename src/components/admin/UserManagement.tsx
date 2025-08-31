/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, UserPlus, Download, Upload, Search, Filter, Eye, Edit, Trash2, Mail, Phone, MapPin, User, Lock, Eye as EyeIcon, EyeOff, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { authApi, RegisterPayload } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

// Registration validation schema - same as Register.tsx
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
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept terms and conditions'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.role === 'student' && !data.collegeName) {
    return false;
  }
  return true;
}, {
  message: "College selection is required for students",
  path: ["collegeName"],
}).refine((data) => {
  if (data.role === 'college' && !data.collegeCode) {
    return false;
  }
  return true;
}, {
  message: "College code is required for colleges",
  path: ["collegeCode"],
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

const UserManagement = () => {
  const { toast: hookToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loadingColleges, setLoadingColleges] = useState(false);

  // Indian states list - same as Register.tsx
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  // Form setup - same as Register.tsx
  const { register, handleSubmit, setValue, control, watch, formState: { errors }, reset } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      acceptTerms: false
    }
  });

  const selectedRole = watch('role');

  useEffect(() => {
    fetchUsers();
    fetchColleges();
  }, []);

  // Fetch colleges - same as Register.tsx
  const fetchColleges = async () => {
    try {
      setLoadingColleges(true);
      const response = await fetch('https://triaright.com/api/colleges/collegedata');
      const data = await response.json();
      setColleges(data.colleges || []);
    } catch (error) {
      console.error('Error fetching colleges:', error);
      hookToast({
        title: "Error",
        description: "Failed to load colleges list",
        variant: "destructive",
      });
    } finally {
      setLoadingColleges(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockUsers = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          role: 'student',
          phoneNumber: '+91-9876543210',
          status: 'active',
          createdAt: '2024-01-15',
          collegeName: 'ABC University',
        },
        {
          id: 2,
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@company.com',
          role: 'jobseeker',
          phoneNumber: '+91-9876543211',
          status: 'active',
          createdAt: '2024-01-14',
        }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
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
        ...(formData.role === 'student' && formData.collegeName && { collegeName: formData.collegeName }),
        ...(formData.role === 'college' && formData.collegeCode && { collegeCode: formData.collegeCode })
      };
      
      const response = await authApi.register(registerPayload);
      hookToast({ title: "Success", description: "User registered successfully!" });
      
      setCreateUserOpen(false);
      reset();
      fetchUsers(); // Refresh user list
    } catch (error: any) {
      hookToast({
        title: "Registration Failed",
        description: error?.response?.data?.error || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      toast.success('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRoleFilter === 'all' || user.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Bulk upload functionality
  const downloadSampleExcel = () => {
    const sampleData = [
      ['firstname', 'lastname', 'email', 'role', 'phoneNumber', 'whatsappNumber', 'address', 'password', 'collegeName'],
      ['John', 'Doe', 'john@example.com', 'student', '9876543210', '9876543210', '123 Main St', 'password123', 'ABC College'],
      ['Jane', 'Smith', 'jane@example.com', 'jobseeker', '9876543211', '9876543211', '456 Business Ave', 'password123', 'XYZ College'],
      ['Mark', 'Johnson', 'mark@example.com', 'college', '9876543212', '9876543212', '789 College St', 'password123', 'College123']
    ];
    
    const csvContent = sampleData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_users_sample.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Sample file downloaded! You can open it in Excel and save as .xlsx');
  };

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      const response = await axios.post('https://triaright.com/api/users/bulk-register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (response.data && response.data.results) {
        const results = response.data.results;
        const successCount = results.filter((r: any) => r.status === 'success').length;
        const failCount = results.filter((r: any) => r.status === 'failed').length;

        if (successCount > 0) {
          toast.success(`${successCount} users uploaded successfully!`);
        }
        if (failCount > 0) {
          toast.error(`${failCount} users failed to upload. Check console for details.`);
          console.error('Failed uploads:', results.filter((r: any) => r.status === 'failed'));
        }
      } else {
        toast.success('Bulk upload completed successfully!');
      }

      fetchUsers();

    } catch (error: any) {
      console.error('Error during bulk upload:', error);
      
      if (error.response?.data?.message) {
        toast.error(`Upload failed: ${error.response.data.message}`);
      } else if (error.response?.status === 401) {
        toast.error('Unauthorized. Please check your admin credentials.');
      } else if (error.response?.status === 400) {
        toast.error('Bad request. Please check your Excel file format.');
      } else {
        toast.error('Failed to upload users. Please try again.');
      }
    } finally {
      setLoading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-gray-600">Manage all platform users</p>
        </div>
        <div className="flex space-x-2">
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
              accept=".csv,.xlsx"
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
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        id="firstName" 
                        {...register('firstName')} 
                        placeholder="Enter first name" 
                        className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="lastName" className="text-gray-700 font-medium">Last Name *</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        id="lastName" 
                        {...register('lastName')} 
                        placeholder="Enter last name" 
                        className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-gray-700 font-medium">Email Address *</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        id="email" 
                        type="email" 
                        {...register('email')} 
                        placeholder="Enter email address" 
                        className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="phoneNumber" className="text-gray-700 font-medium">Phone Number *</Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        id="phoneNumber" 
                        {...register('phoneNumber')} 
                        placeholder="Enter phone number" 
                        className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="whatsappNumber" className="text-gray-700 font-medium">WhatsApp Number *</Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        id="whatsappNumber" 
                        {...register('whatsappNumber')} 
                        placeholder="Enter WhatsApp number" 
                        className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    {errors.whatsappNumber && <p className="text-red-500 text-sm mt-1">{errors.whatsappNumber.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-gray-700 font-medium">Password *</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        {...register("password")}
                        placeholder="Enter password"
                        className="pl-10 pr-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-400"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password *</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        id="confirmPassword" 
                        type="password" 
                        {...register('confirmPassword')} 
                        placeholder="Confirm password" 
                        className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
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
                        className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
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
                          <SelectTrigger className="h-11 mt-1 border-gray-200 focus:border-blue-500">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                            {indianStates.map((state) => (
                              <SelectItem key={state} value={state} className="hover:bg-gray-100">
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
                          <SelectTrigger className="h-11 mt-1 border-gray-200 focus:border-blue-500">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                            <SelectItem value="student" className="hover:bg-gray-100">Student</SelectItem>
                            <SelectItem value="jobseeker" className="hover:bg-gray-100">Job Seeker</SelectItem>
                            <SelectItem value="employer" className="hover:bg-gray-100">Employer</SelectItem>
                            <SelectItem value="trainer" className="hover:bg-gray-100">Trainer</SelectItem>
                            <SelectItem value="college" className="hover:bg-gray-100">College</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
                  </div>

                  {/* College Dropdown - Only show when student role is selected */}
                  {selectedRole === 'student' && (
                    <div className="md:col-span-2">
                      <Label htmlFor="collegeName" className="text-gray-700 font-medium">Select College *</Label>
                      <Controller
                        name="collegeName"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingColleges}>
                            <SelectTrigger className="h-11 mt-1 border-gray-200 focus:border-blue-500">
                              <div className="flex items-center">
                                <GraduationCap className="h-4 w-4 mr-2 text-gray-400" />
                                <SelectValue placeholder={loadingColleges ? "Loading colleges..." : "Select college"} />
                              </div>
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                              {colleges.map((college) => (
                                <SelectItem key={college._id} value={college.collegeName} className="hover:bg-gray-100">
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

                  {/* College Code - Only show when college role is selected */}
                  {selectedRole === 'college' && (
                    <div className="md:col-span-2">
                      <Label htmlFor="collegeCode" className="text-gray-700 font-medium">College Code *</Label>
                      <div className="relative mt-1">
                        <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                          id="collegeCode" 
                          {...register('collegeCode')} 
                          placeholder="Enter college code" 
                          className="pl-10 h-11 border-gray-200 focus:border-blue-500 transition-colors"
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
                      <Checkbox
                        id="acceptTerms"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="acceptTerms" className="text-sm text-gray-600">
                    I agree to the Terms and Conditions and Privacy Policy *
                  </Label>
                </div>
                {errors.acceptTerms && <p className="text-red-500 text-sm">{errors.acceptTerms.message}</p>}

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => {
                    setCreateUserOpen(false);
                    reset();
                  }}>
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

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedRoleFilter} onValueChange={setSelectedRoleFilter}>
              <SelectTrigger className="w-[180px]">
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
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </span>
                        <span className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {user.phoneNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteUser(user.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;