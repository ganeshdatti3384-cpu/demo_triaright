
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Users, UserPlus, Download, Upload, Search, Filter, Eye, Edit, Trash2, Mail, Phone, MapPin, Calendar, Building, GraduationCap, Briefcase, ChevronDown, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { RegisterPayload } from '@/types/api';
import { authApi } from '@/services/api';
import { useNavigate } from 'react-router-dom';
 
 const registrationSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phoneNumber: z.string().min(10),
  whatsappNumber: z.string().min(10),
  address: z.string().min(1),
  password: z.string().min(6),
  confirmPassword: z.string(),
  role: z.enum(['trainer', 'jobseeker', 'student', 'employer', 'college']),
  acceptTerms: z.literal(true)
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const navigate = useNavigate();
 
  // Form states matching registration form
   const [formData, setFormData] = useState<any>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    whatsappNumber: '',
    address: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    acceptTerms: true,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockUsers = [
        {
          id: 1,
          fullName: 'John Doe',
          email: 'john@example.com',
          role: 'student',
          phone: '+91-9876543210',
          status: 'active',
          createdAt: '2024-01-15',
          collegeName: 'ABC University',
          course: 'Computer Science',
          year: '3rd'
        },
        {
          id: 2,
          fullName: 'Jane Smith',
          email: 'jane@company.com',
          role: 'job-seeker',
          phone: '+91-9876543211',
          status: 'active',
          createdAt: '2024-01-14',
          companyName: 'Tech Corp',
          designation: 'HR Manager'
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
type RegistrationFormData = z.infer<typeof registrationSchema>;

 const handleCreateUser = async () => {
    try {
      const parsed = registrationSchema.parse(formData);
      const payload: RegisterPayload = {
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        email: parsed.email,
        phoneNumber: parsed.phoneNumber,
        whatsappNumber: parsed.whatsappNumber,
        address: parsed.address,
        role: parsed.role === 'trainer' ? 'admin' : parsed.role,
        password: parsed.password,
      };
      await authApi.register(payload);
      toast.success("User registered successfully");
      setCreateUserOpen(false);
      fetchUsers();
    } catch (error: any) {
      if (error.errors) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Registration failed");
      }
    }
  };
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];
  const handleUpdateUser = async () => {
    if (!selectedUser || !validateForm()) return;

    setLoading(true);
    try {
      // Simulate API call - replace with actual implementation
      const updatedUsers = users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, ...formData }
          : user
      );
      
      setUsers(updatedUsers);
      toast.success('User updated successfully!');
      setEditUserOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
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

  const resetForm = () => {
    setFormData({
      role: 'student',
      fullName: '',
      email: '',
      phone: '',
      address: '',
      password: '',
      confirmPassword: '',
    })
  };

  const openEditModal = (user: any) => {
    setSelectedUser(user);
    setFormData({
      role: user.role || 'student',
      profilePicture: user.profilePicture || null,
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      password: '',
      confirmPassword: ''
    });
    setEditUserOpen(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const downloadSampleExcel = () => {
    const sampleData = `fullName,email,role,phone,address,dateOfBirth,gender,nationality,languagesKnown,maritalStatus,username,password
John Doe,john@example.com,student,+91-9876543210,123 Main St,1999-01-01,male,Indian,English Hindi,single,johndoe,password123
Jane Smith,jane@company.com,job-seeker,+91-9876543211,456 Business Ave,1985-05-15,female,Indian,English Tamil,married,janesmith,password123`;
    
    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_sample.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      console.log('Uploading file:', file.name);
      toast.success('Users uploaded successfully!');
      fetchUsers();
    } catch (error) {
      console.error('Error uploading users:', error);
      toast.error('Failed to upload users');
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
              
          <div className="flex justify-between items-center">
            <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
              <DialogTrigger asChild>
                <Button><UserPlus className="h-4 w-4 mr-2" /> Add User</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create User</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>First Name</Label>
                      <Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} />
                    </div>
                    <div>
                      <Label>WhatsApp</Label>
                      <Input value={formData.whatsappNumber} onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })} />
                    </div>
                    <div>
                      <Label>Address</Label>
                      <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                    </div>
                    <div>
                      <Label>Password</Label>
                      <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                    </div>
                    <div>
                      <Label>Confirm Password</Label>
                      <Input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} />
                    </div>
                    <div>
                      <Label>Role</Label>
                      <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="jobseeker">Job Seeker</SelectItem>
                          <SelectItem value="trainer">Trainer</SelectItem>
                          <SelectItem value="employer">Employer</SelectItem>
                          <SelectItem value="college">College</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateUser} disabled={loading}>{loading ? 'Submitting...' : 'Create User'}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
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
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="job-seeker">Job Seekers</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
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
                      {user.role === 'student' && <GraduationCap className="h-5 w-5 text-blue-600" />}
                      {user.role === 'job-seeker' && <Briefcase className="h-5 w-5 text-blue-600" />}
                      {user.role === 'admin' && <Users className="h-5 w-5 text-blue-600" />}
                    </div>
                    <div>
                      <p className="font-medium">{user.fullName}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </span>
                        <span className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {user.phone}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {user.createdAt}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={user.role === 'admin' ? 'secondary' : 'outline'}>
                      {user.role}
                    </Badge>
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                      {user.status}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => openEditModal(user)}>
                      <Edit className="h-3 w-3" />
                    </Button>
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

      {/* Edit User Dialog */}
      <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information below.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => {
              setEditUserOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button type="button" onClick={handleUpdateUser} disabled={loading}>
              {loading ? 'Updating...' : 'Update User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
