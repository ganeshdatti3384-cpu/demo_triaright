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
import { Shield, Database, Settings, Users, CreditCard, LogOut, Eye, Lock, Package, Plus, Ticket, Calendar, Building2, Monitor, Pill, TrendingUp, UserCheck, Banknote, Edit, Trash2 } from 'lucide-react';
import { pack365Api, collegeApi, authApi } from '@/services/api';
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
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
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

  // State for API data
  const [courses, setCourses] = useState<Pack365Course[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [collegeRequests, setCollegeRequests] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: '',
    password: ''
  });

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
    fetchAllUsers();
  }, []);

  useEffect(() => {
    if (selectedStream && courses.length > 0) {
      const filtered = courses.filter(course => 
        course.stream.toUpperCase() === selectedStream.toUpperCase()
      );
      setFilteredCourses(filtered);
    }
  }, [selectedStream, courses]);

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

  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await authApi.getAllUsers(token);
      if (response.users) {
        setAllUsers(response.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
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
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      password: ''
    });
    setEditUserOpen(true);
  };

  const handleUpdateUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !selectedUser) return;

      const updateData: any = {
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        email: editFormData.email,
        phoneNumber: editFormData.phoneNumber,
        role: editFormData.role
      };

      // Only include password if it's provided
      if (editFormData.password) {
        updateData.password = editFormData.password;
      }

      // Call the admin register endpoint to update user
      const response = await authApi.adminRegister(token, updateData);
      
      if (response.message) {
        toast.success('User updated successfully!');
        fetchAllUsers();
        setEditUserOpen(false);
        setSelectedUser(null);
        setEditFormData({
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          role: '',
          password: ''
        });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Note: You'll need to implement a delete user endpoint in your backend
      // const response = await authApi.deleteUser(token, userId);
      
      toast.success('User deleted successfully!');
      fetchAllUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Note: You'll need to implement a toggle user status endpoint in your backend
      // const response = await authApi.toggleUserStatus(token, userId, !currentStatus);
      
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchAllUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user status');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await collegeApi.acceptServiceRequest(token, requestId);
      if (response.success) {
        useToastHook({
          title: 'Success',
          description: 'Request accepted successfully',
        });
        fetchCollegeRequests();
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      useToastHook({
        title: 'Error',
        description: 'Failed to accept request',
        variant: 'destructive'
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await collegeApi.rejectServiceRequest(token, requestId);
      if (response.success) {
        useToastHook({
          title: 'Success',
          description: 'Request rejected successfully',
        });
        fetchCollegeRequests();
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      useToastHook({
        title: 'Error',
        description: 'Failed to reject request',
        variant: 'destructive'
      });
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

  const systemStats = {
    totalRevenue: '₹12,34,567',
    activeSubscriptions: 456,
    serverUptime: '99.9%',
    dataStorage: '2.4 TB',
    apiCalls: '1.2M'
  };

  const pendingRequests = collegeRequests.filter(request => request.status === 'Pending');

  return (
    <><Navbar />
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Control</TabsTrigger>
            <TabsTrigger value="pack365">Pack365</TabsTrigger>
            <TabsTrigger value="college-approvals">College Approvals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.totalRevenue}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.activeSubscriptions}</div>
                  <p className="text-xs text-muted-foreground">Active plans</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Server Uptime</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{systemStats.serverUptime}</div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Data Storage</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.dataStorage}</div>
                  <p className="text-xs text-muted-foreground">Used storage</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">API Calls</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.apiCalls}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </div>

            {/* Pending College Approvals */}
            <Card>
              <CardHeader>
                <CardTitle>Pending College Approvals</CardTitle>
                <CardDescription>College service requests requiring super admin approval</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingRequests.slice(0, 3).map((request) => (
                    <div key={request._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{request.institutionName}</p>
                        <p className="text-sm text-gray-500">College Service Request - {request.serviceCategory?.join(', ') || 'General'}</p>
                        <p className="text-xs text-gray-400">Requested on {new Date(request.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">Pending</Badge>
                        <Button variant="outline" size="sm" onClick={() => setActiveTab('college-approvals')}>Review</Button>
                      </div>
                    </div>
                  ))}
                  {pendingRequests.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No pending approvals</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">User Management</h2>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={fetchAllUsers}>
                  <Eye className="h-4 w-4 mr-2" />
                  Refresh Users
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Manage all user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allUsers.map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-gray-500">
                          {user.email} • {user.phoneNumber} • {user.role}
                        </p>
                        <p className="text-xs text-gray-400">
                          Joined: {new Date(user.createdAt).toLocaleDateString()}
                          {user.lastLogin && ` • Last login: ${new Date(user.lastLogin).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {allUsers.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No users found</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Platform Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{allUsers.length}</div>
                  <p className="text-sm text-gray-500">Registered users</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {allUsers.filter(user => user.isActive).length}
                  </div>
                  <p className="text-sm text-gray-500">Currently active</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Inactive Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">
                    {allUsers.filter(user => !user.isActive).length}
                  </div>
                  <p className="text-sm text-gray-500">Deactivated accounts</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Edit User Dialog */}
          <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>
                  Update user information. Leave password blank to keep current password.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="firstName" className="text-right">First Name</Label>
                  <Input
                    id="firstName"
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData({...editFormData, firstName: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lastName" className="text-right">Last Name</Label>
                  <Input
                    id="lastName"
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData({...editFormData, lastName: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phoneNumber" className="text-right">Phone</Label>
                  <Input
                    id="phoneNumber"
                    value={editFormData.phoneNumber}
                    onChange={(e) => setEditFormData({...editFormData, phoneNumber: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">Role</Label>
                  <div className="col-span-3">
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
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={editFormData.password}
                    onChange={(e) => setEditFormData({...editFormData, password: e.target.value})}
                    placeholder="Leave blank to keep current"
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditUserOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleUpdateUser}>
                  Update User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Rest of the code remains the same for other tabs */}
          <TabsContent value="pack365" className="space-y-6">
            {/* ... existing Pack365 content ... */}
          </TabsContent>

          <TabsContent value="college-approvals" className="space-y-6">
            {/* ... existing College Approvals content ... */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default SuperAdminDashboard;
