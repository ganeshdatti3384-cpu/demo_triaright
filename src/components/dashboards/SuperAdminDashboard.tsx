/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, Database, Settings, Users, CreditCard, LogOut, Eye, Lock, Package, Plus, Ticket, Calendar, Building2, Monitor, Pill, TrendingUp, UserCheck, Banknote, Edit, Trash2, Key, Mail, Phone, MapPin } from 'lucide-react';
import { pack365Api, collegeApi } from '@/services/api';
import Pack365Management from '../admin/Pack365Management';
import { toast } from 'sonner';
import { useToast } from '@/hooks/use-toast';
import type { Pack365Course } from '@/types/api';
import Navbar from '../Navbar';
import Footer from '../Footer';

interface SuperAdminDashboardProps {
  user: { role: string; name: string };
  onLogout: () => void;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  whatsappNumber: string;
  address: string;
  role: 'student' | 'jobseeker' | 'college' | 'employer' | 'admin' | 'superadmin';
  isActive: boolean;
  createdAt: string;
  collegeName?: string;
  companyName?: string;
}

const SuperAdminDashboard = ({ user, onLogout }: SuperAdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [pack365Tab, setPack365Tab] = useState('overview');
  const [createCouponOpen, setCreateCouponOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [discount, setDiscount] = useState('');
  const [selectedStream, setSelectedStream] = useState('');
  const [description, setDescription] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const { toast: useToastHook } = useToast();
  const [filteredCourses, setFilteredCourses] = useState<Pack365Course[]>([]);
  const [enrollmentCode, setEnrollmentCode] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createEnrollmentOpen, setCreateEnrollmentOpen] = useState(false);

  // State for User Management
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    whatsappNumber: '',
    address: '',
    role: '',
    collegeName: '',
    companyName: '',
    companyType: ''
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // State for API data
  const [courses, setCourses] = useState<Pack365Course[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [collegeRequests, setCollegeRequests] = useState<any[]>([]);
  
  const streamData = [
    { name: 'IT', icon: Monitor, color: 'bg-blue-500', description: 'Information Technology Courses' },
    { name: 'PHARMA', icon: Pill, color: 'bg-green-500', description: 'Pharmaceutical Courses' },
    { name: 'MARKETING', icon: TrendingUp, color: 'bg-purple-500', description: 'Marketing & Sales Courses' },
    { name: 'HR', icon: UserCheck, color: 'bg-orange-500', description: 'Human Resources Courses' },
    { name: 'FINANCE', icon: Banknote, color: 'bg-emerald-500', description: 'Finance & Accounting Courses' }
  ];

  // Fetch data on component mount
  useEffect(() => {
    fetchCourses();
    fetchCoupons();
    fetchCollegeRequests();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedStream && courses.length > 0) {
      const filtered = courses.filter(course => 
        course.stream.toUpperCase() === selectedStream.toUpperCase()
      );
      setFilteredCourses(filtered);
    }
  }, [selectedStream, courses]);

  // Filter users based on role and search term
  useEffect(() => {
    let filtered = users;
    
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.firstName.toLowerCase().includes(term) ||
        user.lastName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term)
      );
    }
    
    setFilteredUsers(filtered);
  }, [users, selectedRole, searchTerm]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/users/allusers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await pack365Api.getAllCourses();
      if (response.success) {
        setCourses(response.data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleStreamSelect = (streamName: string) => {
    setSelectedStream(streamName);
  };

  const handleBackToStreams = () => {
    setSelectedStream('');
    setFilteredCourses([]);
  };

  const fetchCoupons = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await pack365Api.getAllEnrollmentCodes(token);
      if (response.success) {
        setCoupons(Array.isArray(response.codes) ? response.codes : []);
      } else {
        setCoupons([]);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to fetch coupons');
    }
  };

  const fetchCollegeRequests = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await collegeApi.getCollegeRequests(token);
      if (response.success) {
        setCollegeRequests(response.requests);
      }
    } catch (error) {
      console.error('Error fetching college requests:', error);
      useToastHook({
        title: 'Error',
        description: 'Failed to load college requests',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      whatsappNumber: user.whatsappNumber || '',
      address: user.address || '',
      role: user.role || '',
      collegeName: user.collegeName || '',
      companyName: user.companyName || '',
      companyType: ''
    });
    setEditUserOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/users/admin/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...editFormData,
          userId: selectedUser._id
        })
      });

      if (response.ok) {
        toast.success('User updated successfully');
        setEditUserOpen(false);
        fetchUsers();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const handleUpdatePassword = async () => {
    if (!selectedUser) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/users/update-password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: selectedUser._id,
          newPassword: passwordData.newPassword
        })
      });

      if (response.ok) {
        toast.success('Password updated successfully');
        setPasswordDialogOpen(false);
        setPasswordData({ newPassword: '', confirmPassword: '' });
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password');
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/users/${user._id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: !user.isActive
        })
      });

      if (response.ok) {
        toast.success(`User ${!user.isActive ? 'activated' : 'deactivated'} successfully`);
        fetchUsers();
      } else {
        toast.error('Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleCreateEnrollmentCode = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      if (!enrollmentCode || !selectedStream || !usageLimit) {
        toast.error('Please fill all required fields');
        return;
      }

      const response = await pack365Api.createEnrollmentCode(token, {
        code: enrollmentCode,
        stream: selectedStream,
        usageLimit: parseInt(usageLimit),
        expiresAt: expiresAt || undefined,
        description: description
      });

      if (response.success) {
        toast.success('Enrollment code created successfully!');
        fetchCoupons();
        setEnrollmentCode('');
        setSelectedStream('');
        setUsageLimit('');
        setExpiresAt('');
        setDescription('');
        setCreateEnrollmentOpen(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create enrollment code');
    }
  };

  const handleCreateCoupon = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      if (!couponCode || !selectedStream || !discount || !usageLimit) {
        toast.error('Please fill all required fields');
        return;
      }

      const response = await pack365Api.createEnrollmentCode(token, {
        code: couponCode,
        stream: selectedStream,
        discountAmount: parseInt(discount),
        usageLimit: parseInt(usageLimit),
        expiresAt: expiryDate || undefined,
        description: description
      });

      if (response.success) {
        toast.success('Coupon created successfully!');
        fetchCoupons();
        setCouponCode('');
        setSelectedStream('');
        setDiscount('');
        setUsageLimit('');
        setExpiryDate('');
        setDescription('');
        setCreateCouponOpen(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create coupon');
    }
  };

  const handleToggleCouponStatus = async (couponId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No authentication token found');
        return;
      }

      await pack365Api.deactivateEnrollmentCode(token, couponId);
      toast.success(`Coupon ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      
      // Refresh coupons list
      fetchCoupons();
    } catch (error) {
      console.error('Error updating coupon status:', error);
      toast.error('Failed to update coupon status');
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'superadmin': return 'destructive';
      case 'admin': return 'default';
      case 'college': return 'secondary';
      case 'employer': return 'outline';
      case 'student': return 'secondary';
      case 'jobseeker': return 'outline';
      default: return 'outline';
    }
  };

  const systemStats = {
    totalRevenue: '₹12,34,567',
    activeSubscriptions: 456,
    serverUptime: '99.9%',
    dataStorage: '2.4 TB',
    apiCalls: '1.2M'
  };

  const systemLogs = [
    { id: 1, action: 'User login spike detected', severity: 'info', time: '2024-01-15 14:30' },
    { id: 2, action: 'Database backup completed', severity: 'success', time: '2024-01-15 02:00' },
    { id: 3, action: 'Failed payment attempt', severity: 'warning', time: '2024-01-14 23:45' },
  ];

  const pendingRequests = collegeRequests.filter(request => request.status === 'Pending');

  return (
    <><Navbar />
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Control</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="pack365">Pack365</TabsTrigger>
            <TabsTrigger value="college-approvals">College Approvals</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="logs">System Logs</TabsTrigger>
          </TabsList>

          {/* Overview Tab - Keep existing content */}
          <TabsContent value="overview" className="space-y-6">
            {/* ... existing overview content ... */}
          </TabsContent>

          {/* Updated User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">User Management</h2>
              <div className="flex space-x-2">
                <Button onClick={fetchUsers} variant="outline">
                  Refresh Users
                </Button>
              </div>
            </div>

            {/* Filters and Search */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search users by name, email, or role..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="superadmin">Super Admin</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="college">College</SelectItem>
                      <SelectItem value="employer">Employer</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="jobseeker">Job Seeker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Users List */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Users ({filteredUsers.length})</CardTitle>
                <CardDescription>
                  Manage all users across the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="font-medium text-sm truncate">
                              {user.firstName} {user.lastName}
                            </p>
                            <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                              {user.role}
                            </Badge>
                            <Badge variant={user.isActive ? 'default' : 'secondary'} className="text-xs">
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {user.email}
                            </span>
                            <span className="flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {user.phoneNumber}
                            </span>
                            {user.collegeName && (
                              <span className="flex items-center">
                                <Building2 className="h-3 w-3 mr-1" />
                                {user.collegeName}
                              </span>
                            )}
                            {user.companyName && (
                              <span className="flex items-center">
                                <Building2 className="h-3 w-3 mr-1" />
                                {user.companyName}
                              </span>
                            )}
                          </div>
                          {user.address && (
                            <p className="text-xs text-gray-500 mt-1 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {user.address}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setPasswordDialogOpen(true);
                          }}
                        >
                          <Key className="h-4 w-4 mr-1" />
                          Password
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant={user.isActive ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleToggleUserStatus(user)}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No users found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-rows-2 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                  <p className="text-xs text-muted-foreground">All platform users</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {users.filter(u => u.isActive).length}
                  </div>
                  <p className="text-xs text-muted-foreground">Currently active</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {users.filter(u => !u.isActive).length}
                  </div>
                  <p className="text-xs text-muted-foreground">Deactivated accounts</p>
                </CardContent>
              </Card>

              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle>User Distribution by Role</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    {['superadmin', 'admin', 'college', 'employer', 'student', 'jobseeker'].map((role) => {
                      const count = users.filter(u => u.role === role).length;
                      return (
                        <div key={role} className="flex items-center space-x-2">
                          <Badge variant={getRoleBadgeVariant(role)}>
                            {role}
                          </Badge>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Edit User Dialog */}
          <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>
                  Update user information for {selectedUser?.firstName} {selectedUser?.lastName}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={editFormData.firstName}
                      onChange={(e) => setEditFormData({...editFormData, firstName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={editFormData.lastName}
                      onChange={(e) => setEditFormData({...editFormData, lastName: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={editFormData.phoneNumber}
                      onChange={(e) => setEditFormData({...editFormData, phoneNumber: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                    <Input
                      id="whatsappNumber"
                      value={editFormData.whatsappNumber}
                      onChange={(e) => setEditFormData({...editFormData, whatsappNumber: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={editFormData.role} onValueChange={(value) => setEditFormData({...editFormData, role: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="jobseeker">Job Seeker</SelectItem>
                      <SelectItem value="college">College</SelectItem>
                      <SelectItem value="employer">Employer</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="superadmin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {editFormData.role === 'college' && (
                  <div className="space-y-2">
                    <Label htmlFor="collegeName">College Name</Label>
                    <Input
                      id="collegeName"
                      value={editFormData.collegeName}
                      onChange={(e) => setEditFormData({...editFormData, collegeName: e.target.value})}
                    />
                  </div>
                )}
                {editFormData.role === 'employer' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={editFormData.companyName}
                        onChange={(e) => setEditFormData({...editFormData, companyName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyType">Company Type</Label>
                      <Input
                        id="companyType"
                        value={editFormData.companyType}
                        onChange={(e) => setEditFormData({...editFormData, companyType: e.target.value})}
                      />
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditUserOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateUser}>
                  Update User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Update Password Dialog */}
          <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Update Password</DialogTitle>
                <DialogDescription>
                  Set a new password for {selectedUser?.firstName} {selectedUser?.lastName}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdatePassword}>
                  Update Password
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Other tabs remain the same */}
          <TabsContent value="system" className="space-y-6">
            {/* ... existing system content ... */}
          </TabsContent>

          <TabsContent value="pack365" className="space-y-6">
            {/* ... existing pack365 content ... */}
          </TabsContent>

          <TabsContent value="college-approvals" className="space-y-6">
            {/* ... existing college approvals content ... */}
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            {/* ... existing billing content ... */}
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            {/* ... existing security content ... */}
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            {/* ... existing logs content ... */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default SuperAdminDashboard;
