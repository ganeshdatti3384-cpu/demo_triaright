import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { authApi, pack365Api, collegeApi } from '@/services/api';
import { Plus, Users, BookOpen, TrendingUp, IndianRupee, FileText, Eye, Edit, Trash, Download, Upload } from 'lucide-react';

const SuperAdminDashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    jobseekers: 0,
    employers: 0,
    colleges: 0
  });
  const [courses, setCourses] = useState([]);
  const [enrollmentCodes, setEnrollmentCodes] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [showCouponDialog, setShowCouponDialog] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [stream, setStream] = useState('');

  // Form states
  const [codeForm, setCodeForm] = useState({
    code: '',
    courseId: '',
    usageLimit: 1,
    expiresAt: '',
    description: ''
  });

  const [couponForm, setCouponForm] = useState({
    code: '',
    courseId: '',
    discount: 0,
    expiryDate: '',
    description: ''
  });

  useEffect(() => {
    fetchStats();
    fetchCourses();
    fetchEnrollmentCodes();
    fetchCoupons();
    fetchServiceRequests();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const statistics = await authApi.getStatistics(token);
      setStats(statistics);
    } catch (error) {
      console.error('Error fetching statistics:', error);
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

  const fetchEnrollmentCodes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await pack365Api.getAllEnrollmentCodes(token);
      if (response.success) {
        setEnrollmentCodes(response.codes || []);
      }
    } catch (error) {
      console.error('Error fetching enrollment codes:', error);
    }
  };

  const fetchCoupons = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await pack365Api.getAllCoupons(token);
      if (response.success) {
        setCoupons(response.coupons || []);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  };

  const fetchServiceRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await collegeApi.getAllServiceRequests(token);
      if (response.success) {
        setServiceRequests(response.requests || []);
      }
    } catch (error) {
      console.error('Error fetching service requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCode = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await pack365Api.createEnrollmentCode(token, {
        ...codeForm,
        stream
      });

      if (response.success) {
        toast({ title: 'Enrollment code created successfully!' });
        fetchEnrollmentCodes();
        setCodeForm({ code: '', courseId: '', usageLimit: 1, expiresAt: '', description: '' });
        setStream('');
        setShowCodeDialog(false);
      }
    } catch (error: any) {
      toast({
        title: 'Error creating code',
        description: error.message || 'Failed to create enrollment code',
        variant: 'destructive'
      });
    }
  };

  const handleCreateCoupon = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await pack365Api.createCoupon(token, couponForm);

      if (response.success) {
        toast({ title: 'Coupon created successfully!' });
        fetchCoupons();
        setCouponForm({ code: '', courseId: '', discount: 0, expiryDate: '', description: '' });
        setShowCouponDialog(false);
      }
    } catch (error: any) {
      toast({
        title: 'Error creating coupon',
        description: error.message || 'Failed to create coupon',
        variant: 'destructive'
      });
    }
  };

  const handleBulkUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select an Excel file to upload',
        variant: 'destructive'
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await authApi.bulkRegisterFromExcel(selectedFile, token);
      
      toast({
        title: 'Bulk upload completed',
        description: `${response.results.filter(r => r.success).length} users registered successfully`
      });

      setShowBulkUpload(false);
      setSelectedFile(null);
      fetchStats();
    } catch (error: any) {
      toast({
        title: 'Bulk upload failed',
        description: error.message || 'Failed to upload users',
        variant: 'destructive'
      });
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await collegeApi.acceptServiceRequest(token, requestId);
      if (response.success) {
        toast({ title: 'Service request accepted' });
        fetchServiceRequests();
      }
    } catch (error: any) {
      toast({
        title: 'Error accepting request',
        description: error.message || 'Failed to accept service request',
        variant: 'destructive'
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await collegeApi.rejectServiceRequest(token, requestId);
      if (response.success) {
        toast({ title: 'Service request rejected' });
        fetchServiceRequests();
      }
    } catch (error: any) {
      toast({
        title: 'Error rejecting request',
        description: error.message || 'Failed to reject service request',
        variant: 'destructive'
      });
    }
  };

  const toggleCouponStatus = async (couponId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await pack365Api.updateCouponStatus(token, couponId, isActive);
      if (response.success) {
        toast({ title: `Coupon ${isActive ? 'activated' : 'deactivated'} successfully` });
        fetchCoupons();
      }
    } catch (error: any) {
      toast({
        title: 'Error updating coupon',
        description: error.message || 'Failed to update coupon status',
        variant: 'destructive'
      });
    }
  };

  const deactivateCode = async (codeId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await pack365Api.deactivateEnrollmentCode(token, codeId);
      if (response.success) {
        toast({ title: 'Enrollment code deactivated' });
        fetchEnrollmentCodes();
      }
    } catch (error: any) {
      toast({
        title: 'Error deactivating code',
        description: error.message || 'Failed to deactivate enrollment code',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
          <p className="text-gray-600">Manage your platform and monitor performance</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowBulkUpload(true)} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload Users
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Active platform users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.students}</div>
            <p className="text-xs text-muted-foreground">Registered students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Seekers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.jobseekers}</div>
            <p className="text-xs text-muted-foreground">Active job seekers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.employers}</div>
            <p className="text-xs text-muted-foreground">Registered employers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Colleges</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.colleges}</div>
            <p className="text-xs text-muted-foreground">Partner colleges</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="codes">Enrollment Codes</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
          <TabsTrigger value="requests">Service Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pack365 Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Stream</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Topics</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course: any) => (
                    <TableRow key={course._id}>
                      <TableCell className="font-medium">{course.courseName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {course.stream}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{course.description || 'No description'}</TableCell>
                      <TableCell>{course.totalDuration ? `${course.totalDuration} min` : 'N/A'}</TableCell>
                      <TableCell>{course.topics?.length || 0} topics</TableCell>
                      <TableCell>{course.price ? `₹${course.price}` : 'Free'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="codes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Enrollment Codes</h3>
            <Button onClick={() => setShowCodeDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Code
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollmentCodes.map((code: any) => (
                    <TableRow key={code._id}>
                      <TableCell className="font-mono">{code.code}</TableCell>
                      <TableCell>{code.courseId}</TableCell>
                      <TableCell>{code.usedCount}/{code.usageLimit}</TableCell>
                      <TableCell>
                        <Badge variant={code.isActive ? "default" : "secondary"}>
                          {code.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(code.expiresAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deactivateCode(code._id)}
                          disabled={!code.isActive}
                        >
                          Deactivate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coupons" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Discount Coupons</h3>
            <Button onClick={() => setShowCouponDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Coupon
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon: any) => (
                    <TableRow key={coupon._id}>
                      <TableCell className="font-mono">{coupon.code}</TableCell>
                      <TableCell>{coupon.courseId}</TableCell>
                      <TableCell>{coupon.discount}%</TableCell>
                      <TableCell>
                        <Badge variant={coupon.isActive ? "default" : "secondary"}>
                          {coupon.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(coupon.expiryDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleCouponStatus(coupon._id, !coupon.isActive)}
                        >
                          {coupon.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>College Service Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Institution</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Services</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceRequests.map((request: any) => (
                    <TableRow key={request._id}>
                      <TableCell className="font-medium">{request.institutionName}</TableCell>
                      <TableCell>{request.contactPerson}</TableCell>
                      <TableCell>{request.email}</TableCell>
                      <TableCell>{request.expectedStudents}</TableCell>
                      <TableCell>{request.serviceCategory?.join(', ')}</TableCell>
                      <TableCell>
                        <Badge variant={
                          request.status === 'accepted' ? 'default' : 
                          request.status === 'rejected' ? 'destructive' : 'secondary'
                        }>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {request.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleAcceptRequest(request._id)}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectRequest(request._id)}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Enrollment Code Dialog */}
      <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Enrollment Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={codeForm.code}
                onChange={(e) => setCodeForm(prev => ({ ...prev, code: e.target.value }))}
                placeholder="Enter code"
              />
            </div>
            <div>
              <Label htmlFor="courseId">Course</Label>
              <Select
                value={codeForm.courseId}
                onValueChange={(value) => setCodeForm(prev => ({ ...prev, courseId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course: any) => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.courseName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="stream">Stream</Label>
              <Select value={stream} onValueChange={setStream}>
                <SelectTrigger>
                  <SelectValue placeholder="Select stream" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="it">IT</SelectItem>
                  <SelectItem value="nonit">Non-IT</SelectItem>
                  <SelectItem value="pharma">Pharma</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="usageLimit">Usage Limit</Label>
              <Input
                id="usageLimit"
                type="number"
                value={codeForm.usageLimit}
                onChange={(e) => setCodeForm(prev => ({ ...prev, usageLimit: parseInt(e.target.value) }))}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="expiresAt">Expires At</Label>
              <Input
                id="expiresAt"
                type="date"
                value={codeForm.expiresAt}
                onChange={(e) => setCodeForm(prev => ({ ...prev, expiresAt: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={codeForm.description}
                onChange={(e) => setCodeForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleCreateCode} className="flex-1">
                Create Code
              </Button>
              <Button variant="outline" onClick={() => setShowCodeDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Coupon Dialog */}
      <Dialog open={showCouponDialog} onOpenChange={setShowCouponDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Discount Coupon</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="couponCode">Coupon Code</Label>
              <Input
                id="couponCode"
                value={couponForm.code}
                onChange={(e) => setCouponForm(prev => ({ ...prev, code: e.target.value }))}
                placeholder="Enter coupon code"
              />
            </div>
            <div>
              <Label htmlFor="couponCourse">Course</Label>
              <Select
                value={couponForm.courseId}
                onValueChange={(value) => setCouponForm(prev => ({ ...prev, courseId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course: any) => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.courseName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="discount">Discount (%)</Label>
              <Input
                id="discount"
                type="number"
                value={couponForm.discount}
                onChange={(e) => setCouponForm(prev => ({ ...prev, discount: parseInt(e.target.value) }))}
                min="0"
                max="100"
              />
            </div>
            <div>
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={couponForm.expiryDate}
                onChange={(e) => setCouponForm(prev => ({ ...prev, expiryDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="couponDescription">Description</Label>
              <Input
                id="couponDescription"
                value={couponForm.description}
                onChange={(e) => setCouponForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleCreateCoupon} className="flex-1">
                Create Coupon
              </Button>
              <Button variant="outline" onClick={() => setShowCouponDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Upload Users</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file">Excel File</Label>
              <Input
                id="file"
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <p className="text-sm text-gray-500 mt-1">
                Upload an Excel file with user data
              </p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleBulkUpload} className="flex-1" disabled={!selectedFile}>
                Upload Users
              </Button>
              <Button variant="outline" onClick={() => setShowBulkUpload(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminDashboard;
