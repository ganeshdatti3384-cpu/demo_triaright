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
import { Shield, Database, Settings, Users, CreditCard, LogOut, Eye, Lock, Package, Plus, Ticket, Calendar } from 'lucide-react';
import { pack365Api } from '@/services/api';
import { toast } from 'sonner';
import type { Pack365Course } from '@/types/api';

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
  
  // State for API data
  const [courses, setCourses] = useState<Pack365Course[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
    fetchCoupons();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await pack365Api.getAllCourses();
      if (response.success) {
        setCourses(response.data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch courses');
    }
  };

  const fetchCoupons = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await pack365Api.getAllCoupons(token);
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

  const handleCreateCoupon = async () => {
    if (!selectedCourse || !couponCode || !expiryDate || !discount) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No authentication token found');
        return;
      }

      const selectedCourseData = courses.find(c => c._id === selectedCourse);

      if (!selectedCourseData?.courseId) {
        toast.error('Invalid course selection');
        return;
      }

      await pack365Api.createCoupon(token, {
        code: couponCode,
        courseId: selectedCourseData.courseId,
        discount: parseInt(discount),
        expiryDate: expiryDate,
        description: `Coupon for ${selectedCourseData.courseName || 'course'}`
      });

      toast.success('Coupon created successfully!');
      setCreateCouponOpen(false);
      setSelectedCourse('');
      setCouponCode('');
      setExpiryDate('');
      setDiscount('');
      
      fetchCoupons();
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast.error('Failed to create coupon');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCouponStatus = async (couponId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No authentication token found');
        return;
      }

      await pack365Api.updateCouponStatus(token, couponId, !currentStatus);
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

  const systemLogs = [
    { id: 1, action: 'User login spike detected', severity: 'info', time: '2024-01-15 14:30' },
    { id: 2, action: 'Database backup completed', severity: 'success', time: '2024-01-15 02:00' },
    { id: 3, action: 'Failed payment attempt', severity: 'warning', time: '2024-01-14 23:45' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-red-600" />
              <h1 className="text-2xl font-bold text-red-600">
                Super Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Control</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="pack365">Pack365</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="logs">System Logs</TabsTrigger>
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

            {/* Critical Alerts */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">System Alerts</CardTitle>
                <CardDescription>Critical system notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">High API usage detected - consider scaling</span>
                    <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">All systems operational</span>
                    <span className="text-xs text-gray-500 ml-auto">5 minutes ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent System Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent System Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {systemLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          log.severity === 'success' ? 'bg-green-500' :
                          log.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}></div>
                        <span className="text-sm">{log.action}</span>
                      </div>
                      <span className="text-xs text-gray-500">{log.time}</span>
                    </div>
                  ))}
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

          <TabsContent value="system" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">System Configuration</h2>
              <Button variant="destructive">Emergency Shutdown</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Database Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full">Run Database Backup</Button>
                  <Button variant="outline" className="w-full">View Performance Metrics</Button>
                  <Button variant="outline" className="w-full">Optimize Database</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Server Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full">Server Health Check</Button>
                  <Button variant="outline" className="w-full">View Server Logs</Button>
                  <Button variant="outline" className="w-full">Restart Services</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full">Manage API Keys</Button>
                  <Button variant="outline" className="w-full">Rate Limit Settings</Button>
                  <Button variant="outline" className="w-full">API Documentation</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full">Global Configuration</Button>
                  <Button variant="outline" className="w-full">Feature Flags</Button>
                  <Button variant="outline" className="w-full">Maintenance Mode</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pack365" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Pack365 Management</h2>
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
                      Create a new coupon code for courses. Fill in all the details below.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="course" className="text-right">
                        Course
                      </Label>
                      <div className="col-span-3">
                        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a course" />
                          </SelectTrigger>
                          <SelectContent>
                            {courses.map((course) => (
                              <SelectItem key={course._id} value={course._id || ''}>
                                {course.courseName} ({course.stream})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="couponCode" className="text-right">
                        Coupon Code
                      </Label>
                      <Input
                        id="couponCode"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="e.g., SAVE20"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="discount" className="text-right">
                        Users count
                      </Label>
                      <Input
                        id="discount"
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        placeholder="e.g., 20"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="expiryDate" className="text-right">
                        Expiry Date
                      </Label>
                      <Input
                        id="expiryDate"
                        type="date"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
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

            <Tabs value={pack365Tab} onValueChange={setPack365Tab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
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
                    <div className="space-y-4">
                      {courses.map((course) => (
                        <div key={course._id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{course.courseName}</p>
                            <p className="text-sm text-gray-500">{course.stream} • ₹{course.price}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{course.stream}</Badge>
                            <span className="text-sm text-gray-500">{course.totalDuration} hrs</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
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
                              <p className="text-sm text-gray-500">{coupon.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="font-medium">{coupon.discount}% off</p>
                              <p className="text-sm text-gray-500 flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(coupon.expiryDate).toLocaleDateString()}
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

          <TabsContent value="billing" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Billing & Revenue</h2>
              <Button>Generate Report</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">₹12,34,567</div>
                  <p className="text-sm text-gray-500">+15% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Failed Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">23</div>
                  <Button variant="outline" className="w-full mt-2">Review Failed Payments</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Refund Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">7</div>
                  <Button variant="outline" className="w-full mt-2">Process Refunds</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Security Center</h2>
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">All systems secure</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Monitoring</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full">View Security Logs</Button>
                  <Button variant="outline" className="w-full">Failed Login Attempts</Button>
                  <Button variant="outline" className="w-full">IP Blacklist</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Access Control</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full">Manage Permissions</Button>
                  <Button variant="outline" className="w-full">2FA Settings</Button>
                  <Button variant="outline" className="w-full">Session Management</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">System Logs</h2>
              <div className="flex space-x-2">
                <Button variant="outline">Export Logs</Button>
                <Button variant="outline">Clear Old Logs</Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent System Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {systemLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          log.severity === 'success' ? 'bg-green-500' :
                          log.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}></div>
                        <span className="text-sm">{log.action}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{log.severity}</Badge>
                        <span className="text-xs text-gray-500">{log.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
