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
import { Shield, Database, Settings, Users, CreditCard, LogOut, Eye, Lock, Package, Plus, Ticket, Calendar, Building2, Monitor, Pill, TrendingUp, UserCheck, Banknote } from 'lucide-react';
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
  
  const streamData = [
    { name: 'IT', icon: Monitor, color: 'bg-blue-500', description: 'Information Technology Courses' },
    { name: 'PHARMA', icon: Pill, color: 'bg-green-500', description: 'Pharmaceutical Courses' },
    { name: 'MARKETING', icon: TrendingUp, color: 'bg-purple-500', description: 'Marketing & Sales Courses' },
    { name: 'HR', icon: UserCheck, color: 'bg-orange-500', description: 'Human Resources Courses' },
    { name: 'FINANCE', icon: Banknote, color: 'bg-emerald-500', description: 'Finance & Accounting Courses' }
  ];

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
    fetchCoupons();
    fetchCollegeRequests();
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

  const adminUsers = [
    { id: 1, name: 'John Admin', role: 'Admin', lastLogin: '2024-01-15', status: 'active' },
    { id: 2, name: 'Sarah Manager', role: 'Content Admin', lastLogin: '2024-01-14', status: 'active' },
    { id: 3, name: 'Mike Support', role: 'Support Admin', lastLogin: '2024-01-13', status: 'inactive' },
  ];

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
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View All Users
                </Button>
                <Button>Create Admin</Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Admin Users</CardTitle>
                <CardDescription>Manage admin accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminUsers.map((admin) => (
                    <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{admin.name}</p>
                        <p className="text-sm text-gray-500">{admin.role} • Last login: {admin.lastLogin}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={admin.status === 'active' ? 'default' : 'secondary'}>
                          {admin.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Impersonate
                        </Button>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Platform Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">15,234</div>
                  <Button variant="outline" className="w-full mt-4">Manage All Users</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Banned Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">23</div>
                  <Button variant="outline" className="w-full mt-4">Review Bans</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Suspicious Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">5</div>
                  <Button variant="outline" className="w-full mt-4">Investigate</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pack365" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Pack365 Management</h2>
              <div className="flex space-x-2">
                <Dialog open={createEnrollmentOpen} onOpenChange={setCreateEnrollmentOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Enrollment Code
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create Enrollment Code</DialogTitle>
                      <DialogDescription>
                        Create a new enrollment code for a specific stream.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="stream" className="text-right">Stream</Label>
                        <div className="col-span-3">
                          <Select value={selectedStream} onValueChange={setSelectedStream}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a stream" />
                            </SelectTrigger>
                            <SelectContent>
                              {streamData.map((stream) => (
                                <SelectItem key={stream.name} value={stream.name}>
                                  {stream.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="enrollmentCode" className="text-right">Code</Label>
                        <Input
                          id="enrollmentCode"
                          value={enrollmentCode}
                          onChange={(e) => setEnrollmentCode(e.target.value)}
                          placeholder="e.g., ENROLL2024"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="usageLimit" className="text-right">Usage Limit</Label>
                        <Input
                          id="usageLimit"
                          type="number"
                          value={usageLimit}
                          onChange={(e) => setUsageLimit(e.target.value)}
                          placeholder="e.g., 100"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="expiresAt" className="text-right">Expires At</Label>
                        <Input
                          id="expiresAt"
                          type="date"
                          value={expiresAt}
                          onChange={(e) => setExpiresAt(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">Description</Label>
                        <Input
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Optional description"
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setCreateEnrollmentOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="button" onClick={handleCreateEnrollmentCode} disabled={isLoading}>
                        {isLoading ? 'Creating...' : 'Create Code'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={createCouponOpen} onOpenChange={setCreateCouponOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Coupon
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create New Coupon</DialogTitle>
                      <DialogDescription>
                        Create a new coupon code for streams. Fill in all the details below.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="stream" className="text-right">Stream</Label>
                        <div className="col-span-3">
                          <Select value={selectedStream} onValueChange={setSelectedStream}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a stream" />
                            </SelectTrigger>
                            <SelectContent>
                              {streamData.map((stream) => (
                                <SelectItem key={stream.name} value={stream.name}>
                                  {stream.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="couponCode" className="text-right">Coupon Code</Label>
                        <Input
                          id="couponCode"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="e.g., SAVE20"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="discount" className="text-right">Discount Amount (₹)</Label>
                        <Input
                          id="discount"
                          type="number"
                          value={discount}
                          onChange={(e) => setDiscount(e.target.value)}
                          placeholder="e.g., 200"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="usageLimit" className="text-right">Usage Limit</Label>
                        <Input
                          id="usageLimit"
                          type="number"
                          value={usageLimit}
                          onChange={(e) => setUsageLimit(e.target.value)}
                          placeholder="e.g., 50"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="expiryDate" className="text-right">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          type="date"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">Description</Label>
                        <Input
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Optional description"
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setCreateCouponOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="button" onClick={handleCreateCoupon} disabled={isLoading}>
                        {isLoading ? 'Creating...' : 'Create Coupon'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Tabs value={pack365Tab} onValueChange={setPack365Tab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="management">Course Management</TabsTrigger>
                <TabsTrigger value="coupons">Coupons</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Package className="h-5 w-5 mr-2 text-blue-600" />
                        Total Courses
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-600">{courses.length}</div>
                      <p className="text-sm text-gray-500">Available courses</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Ticket className="h-5 w-5 mr-2 text-green-600" />
                        Active Coupons
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600">{coupons.filter(c => c.isActive).length}</div>
                      <p className="text-sm text-gray-500">Currently available</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
                        Monthly Revenue
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-purple-600">₹5,67,890</div>
                      <p className="text-sm text-gray-500">From Pack365</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Pack365 Courses</CardTitle>
                    <CardDescription>All available Pack365 courses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!selectedStream ? (
                      <div>
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-2xl font-bold">Course Bundels</h2>
                          <p className="text-sm text-gray-600">Select a Bundel to view courses</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {streamData.map((stream) => {
                            const IconComponent = stream.icon;
                            const streamCourseCount = courses.filter(course => course.stream.toUpperCase() === stream.name.toUpperCase()
                            ).length;

                            return (
                              <Card
                                key={stream.name}
                                className="hover:shadow-lg transition-shadow cursor-pointer transform hover:scale-105"
                                onClick={() => handleStreamSelect(stream.name)}
                              >
                                <CardContent className="p-6">
                                  <div className="flex items-center space-x-4">
                                    <div className={`${stream.color} p-3 rounded-lg text-white`}>
                                      <IconComponent className="h-6 w-6" />
                                    </div>
                                    <div>
                                      <h3 className="text-lg font-semibold">{stream.name}</h3>
                                      <p className="text-sm text-gray-600">{stream.description}</p>
                                      <p className="text-xs text-gray-500 mt-2">
                                        {streamCourseCount} course{streamCourseCount !== 1 ? 's' : ''} available
                                      </p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-4">
                            <Button variant="outline" onClick={handleBackToStreams}>
                              ← Back to Streams
                            </Button>
                            <h2 className="text-2xl font-bold">{selectedStream} Courses</h2>
                          </div>
                          <Badge variant="outline">
                            {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>

                        <div className="space-y-4">
                          {filteredCourses.map((course) => (
                            <Card key={course._id} className="hover:shadow-md transition-shadow">
                              <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h3 className="text-lg font-semibold mb-2">{course.courseName}</h3>
                                    <p className="text-gray-600 mb-3">{course.description}</p>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                      <span>Duration: {course.totalDuration} hours</span>
                                      <span>Topics: {course.topics?.length || 0}</span>
                                      <Badge variant="secondary">{course.stream.toUpperCase()}</Badge>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-2xl font-bold text-green-600">₹{course.price}</p>
                                    <Button className="mt-2">
                                      Request Access
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                          {filteredCourses.length === 0 && (
                            <Card>
                              <CardContent className="p-8 text-center">
                                <p className="text-gray-500">No courses available for {selectedStream} stream</p>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="management" className="space-y-6">
                <Pack365Management />
              </TabsContent>

              <TabsContent value="coupons" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>All Coupons</CardTitle>
                    <CardDescription>Manage all coupon codes and their status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {coupons.map((coupon) => (
                        <div key={coupon._id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <Ticket className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium">{coupon.code}</p>
                              <p className="text-sm text-gray-500">{coupon.stream}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="font-medium">
                                {coupon.discountAmount ? `₹${coupon.discountAmount} off` : 'FREE'}
                              </p>
                              <p className="text-sm text-gray-500 flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'No expiry'}
                              </p>
                            </div>
                            <Badge variant={coupon.isActive ? 'default' : 'secondary'}>
                              {coupon.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">Edit</Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleCouponStatus(coupon._id, coupon.isActive)}
                              >
                                {coupon.isActive ? 'Deactivate' : 'Activate'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="college-approvals" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">College Service Approvals</h2>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{pendingRequests.length} Pending Approvals</Badge>
                <Button onClick={fetchCollegeRequests} disabled={isLoading}>
                  {isLoading ? 'Loading...' : 'Refresh'}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {collegeRequests.map((request) => (
                <Card key={request._id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Building2 className="h-5 w-5 text-blue-600" />
                          <h3 className="font-semibold text-lg">{request.institutionName}</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p><span className="font-medium">Contact:</span> {request.contactPerson}</p>
                            <p><span className="font-medium">Email:</span> {request.email}</p>
                            <p><span className="font-medium">Phone:</span> {request.phoneNumber}</p>
                          </div>
                          <div>
                            <p><span className="font-medium">Expected Students:</span> {request.expectedStudents}</p>
                            <p><span className="font-medium">Preferred Date:</span> {request.preferredDate}</p>
                            <p><span className="font-medium">Type:</span> {request.serviceCategory?.join(', ') || 'College Service Request'}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="text-sm"><span className="font-medium">Description:</span> {request.serviceDescription}</p>
                          {request.additionalRequirements && (
                            <p className="text-sm"><span className="font-medium">Additional Requirements:</span> {request.additionalRequirements}</p>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          Requested on: {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge
                          variant={request.status === 'Accepted' ? 'default' :
                            request.status === 'Rejected' ? 'destructive' : 'outline'}
                        >
                          {request.status}
                        </Badge>
                        {request.status === 'Pending' && (
                          <div className="flex space-x-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRejectRequest(request._id)}
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleAcceptRequest(request._id)}
                            >
                              Accept
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {collegeRequests.length === 0 && !isLoading && (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-gray-500">No college service requests found</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default SuperAdminDashboard;
