
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  GraduationCap,
  Building2,
  Briefcase,
  TrendingUp,
  Eye,
  Plus,
  Edit,
  Trash,
  Download,
  Upload,
  Calendar,
  DollarSign,
  BookOpen,
  Award,
  UserCheck,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { authApi, pack365Api, collegeApi } from '@/services/api';
import { Pack365Course } from '@/types/api';

interface SuperAdminDashboardProps {
  user: any;
  onLogout: () => void;
}

const SuperAdminDashboard = ({ user, onLogout }: SuperAdminDashboardProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    jobseekers: 0,
    employers: 0,
    colleges: 0
  });

  // Pack365 Management State
  const [courses, setCourses] = useState<Pack365Course[]>([]);
  const [enrollmentCodes, setEnrollmentCodes] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [showCreateCodeDialog, setShowCreateCodeDialog] = useState(false);
  const [showCreateCouponDialog, setShowCreateCouponDialog] = useState(false);
  const [newCodeForm, setNewCodeForm] = useState({
    code: '',
    courseId: '',
    usageLimit: 100,
    expiresAt: '',
    description: ''
  });
  const [newCouponForm, setNewCouponForm] = useState({
    code: '',
    courseId: '',
    discount: 0,
    expiryDate: '',
    description: ''
  });

  // College Service Requests State
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  const [showServiceRequestDialog, setShowServiceRequestDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  // Add missing stream state
  const [stream, setStream] = useState<'it' | 'nonit' | 'pharma' | 'marketing' | 'hr' | 'finance'>('it');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      
      // Fetch user statistics
      const userStats = await authApi.getStatistics(token);
      setStats(userStats);

      // Fetch Pack365 courses
      const coursesResponse = await pack365Api.getAllCourses();
      if (coursesResponse.success) {
        setCourses(coursesResponse.data);
      }

      // Fetch enrollment codes and coupons
      const codesResponse = await pack365Api.getAllEnrollmentCodes(token);
      if (codesResponse.success) {
        setEnrollmentCodes(codesResponse.codes || []);
        setCoupons(codesResponse.coupons || []);
      }

      // Fetch service requests
      const requestsResponse = await collegeApi.getAllServiceRequests(token);
      if (requestsResponse.success) {
        setServiceRequests(requestsResponse.requests);
      }

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEnrollmentCode = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await pack365Api.createEnrollmentCode(token, {
        ...newCodeForm,
        courseId: newCodeForm.courseId || undefined
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Enrollment code created successfully!'
        });
        setShowCreateCodeDialog(false);
        setNewCodeForm({
          code: '',
          courseId: '',
          usageLimit: 100,
          expiresAt: '',
          description: ''
        });
        fetchDashboardData();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create enrollment code',
        variant: 'destructive'
      });
    }
  };

  const handleCreateCoupon = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await pack365Api.createCoupon(token, newCouponForm);

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Coupon created successfully!'
        });
        setShowCreateCouponDialog(false);
        setNewCouponForm({
          code: '',
          courseId: '',
          discount: 0,
          expiryDate: '',
          description: ''
        });
        fetchDashboardData();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create coupon',
        variant: 'destructive'
      });
    }
  };

  const handleDeactivateCode = async (codeId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await pack365Api.deactivateEnrollmentCode(token, codeId);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Code deactivated successfully!'
        });
        fetchDashboardData();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to deactivate code',
        variant: 'destructive'
      });
    }
  };

  const handleServiceRequestAction = async (requestId: string, action: 'accept' | 'reject') => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = action === 'accept' 
        ? await collegeApi.acceptServiceRequest(token, requestId)
        : await collegeApi.rejectServiceRequest(token, requestId);

      if (response.success) {
        toast({
          title: 'Success',
          description: `Service request ${action}ed successfully!`
        });
        setShowServiceRequestDialog(false);
        fetchDashboardData();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to ${action} service request`,
        variant: 'destructive'
      });
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Students</p>
                <p className="text-3xl font-bold">{stats.students}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Job Seekers</p>
                <p className="text-3xl font-bold">{stats.jobseekers}</p>
              </div>
              <UserCheck className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Employers</p>
                <p className="text-3xl font-bold">{stats.employers}</p>
              </div>
              <Briefcase className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Colleges</p>
                <p className="text-3xl font-bold">{stats.colleges}</p>
              </div>
              <Building2 className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Platform Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">User Registration Rate</span>
                <span className="text-sm font-medium text-green-600">+12%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Course Completions</span>
                <span className="text-sm font-medium text-blue-600">+8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="text-sm font-medium text-purple-600">+15%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Service Requests</span>
                <Badge variant="outline">{serviceRequests.filter(req => req.status === 'pending').length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Course Reviews</span>
                <Badge variant="outline">3</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Payment Issues</span>
                <Badge variant="destructive">1</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderPack365Management = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Pack365 Course Management</h3>
        <div className="flex space-x-2">
          <Button onClick={() => setShowCreateCodeDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Enrollment Code
          </Button>
          <Button onClick={() => setShowCreateCouponDialog(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Create Coupon
          </Button>
        </div>
      </div>

      {/* Courses Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Available Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <Card key={course._id} className="border">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">{course.courseName}</h4>
                  <Badge variant="outline" className="capitalize mb-2">
                    {course.stream}
                  </Badge>
                  <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{course.totalDuration || 0} hours</span>
                    <span>{course.topics?.length || 0} topics</span>
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="font-bold text-green-600">₹{course.price || 'Free'}</span>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enrollment Codes */}
      <Card>
        <CardHeader>
          <CardTitle>Enrollment Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollmentCodes.map((code) => (
                <TableRow key={code._id}>
                  <TableCell className="font-mono">{code.code}</TableCell>
                  <TableCell>{code.courseName || 'All Courses'}</TableCell>
                  <TableCell>{code.usedCount}/{code.usageLimit}</TableCell>
                  <TableCell>{new Date(code.expiresAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={code.isActive ? 'default' : 'secondary'}>
                      {code.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeactivateCode(code._id)}
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

      {/* Coupons */}
      <Card>
        <CardHeader>
          <CardTitle>Discount Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon._id}>
                  <TableCell className="font-mono">{coupon.code}</TableCell>
                  <TableCell>{coupon.courseName || 'All Courses'}</TableCell>
                  <TableCell>{coupon.discount}%</TableCell>
                  <TableCell>{new Date(coupon.expiryDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={coupon.isActive ? 'default' : 'secondary'}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderServiceRequests = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">College Service Requests</h3>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Institution</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Service Category</TableHead>
                <TableHead>Expected Students</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceRequests.map((request) => (
                <TableRow key={request._id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{request.institutionName}</p>
                      <p className="text-sm text-gray-500">{request.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{request.contactPerson}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {request.serviceCategory.map((category: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{request.expectedStudents}</TableCell>
                  <TableCell>{new Date(request.preferredDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        request.status === 'pending' ? 'secondary' : 
                        request.status === 'accepted' ? 'default' : 'destructive'
                      }
                    >
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowServiceRequestDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {request.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleServiceRequestAction(request._id, 'accept')}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleServiceRequestAction(request._id, 'reject')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name || 'Admin'}</p>
            </div>
            <Button variant="outline" onClick={onLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: TrendingUp },
              { id: 'pack365', name: 'Pack365 Management', icon: BookOpen },
              { id: 'service-requests', name: 'Service Requests', icon: Building2 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'pack365' && renderPack365Management()}
        {activeTab === 'service-requests' && renderServiceRequests()}
      </div>

      {/* Create Enrollment Code Dialog */}
      <Dialog open={showCreateCodeDialog} onOpenChange={setShowCreateCodeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Enrollment Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={newCodeForm.code}
                onChange={(e) => setNewCodeForm(prev => ({ ...prev, code: e.target.value }))}
                placeholder="Enter unique code"
              />
            </div>

            <div>
              <Label htmlFor="courseId">Course (Optional)</Label>
              <Select
                value={newCodeForm.courseId}
                onValueChange={(value) => setNewCodeForm(prev => ({ ...prev, courseId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course or leave blank for all" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Courses</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.courseName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="usageLimit">Usage Limit</Label>
              <Input
                id="usageLimit"
                type="number"
                value={newCodeForm.usageLimit}
                onChange={(e) => setNewCodeForm(prev => ({ ...prev, usageLimit: parseInt(e.target.value) }))}
                min="1"
              />
            </div>

            <div>
              <Label htmlFor="expiresAt">Expiry Date</Label>
              <Input
                id="expiresAt"
                type="date"
                value={newCodeForm.expiresAt}
                onChange={(e) => setNewCodeForm(prev => ({ ...prev, expiresAt: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newCodeForm.description}
                onChange={(e) => setNewCodeForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleCreateEnrollmentCode} className="flex-1">
                Create Code
              </Button>
              <Button variant="outline" onClick={() => setShowCreateCodeDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Coupon Dialog */}
      <Dialog open={showCreateCouponDialog} onOpenChange={setShowCreateCouponDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Discount Coupon</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="couponCode">Coupon Code</Label>
              <Input
                id="couponCode"
                value={newCouponForm.code}
                onChange={(e) => setNewCouponForm(prev => ({ ...prev, code: e.target.value }))}
                placeholder="Enter unique coupon code"
              />
            </div>

            <div>
              <Label htmlFor="couponCourseId">Course</Label>
              <Select
                value={newCouponForm.courseId}
                onValueChange={(value) => setNewCouponForm(prev => ({ ...prev, courseId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.courseName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="discount">Discount Percentage</Label>
              <Input
                id="discount"
                type="number"
                value={newCouponForm.discount}
                onChange={(e) => setNewCouponForm(prev => ({ ...prev, discount: parseInt(e.target.value) }))}
                min="1"
                max="100"
                placeholder="e.g., 20"
              />
            </div>

            <div>
              <Label htmlFor="couponExpiryDate">Expiry Date</Label>
              <Input
                id="couponExpiryDate"
                type="date"
                value={newCouponForm.expiryDate}
                onChange={(e) => setNewCouponForm(prev => ({ ...prev, expiryDate: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="couponDescription">Description</Label>
              <Textarea
                id="couponDescription"
                value={newCouponForm.description}
                onChange={(e) => setNewCouponForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleCreateCoupon} className="flex-1">
                Create Coupon
              </Button>
              <Button variant="outline" onClick={() => setShowCreateCouponDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Service Request Details Dialog */}
      <Dialog open={showServiceRequestDialog} onOpenChange={setShowServiceRequestDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Service Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Institution Name</Label>
                  <p className="text-sm">{selectedRequest.institutionName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Contact Person</Label>
                  <p className="text-sm">{selectedRequest.contactPerson}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm">{selectedRequest.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm">{selectedRequest.phoneNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Expected Students</Label>
                  <p className="text-sm">{selectedRequest.expectedStudents}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Preferred Date</Label>
                  <p className="text-sm">{new Date(selectedRequest.preferredDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Service Categories</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedRequest.serviceCategory.map((category: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Service Description</Label>
                <p className="text-sm mt-1">{selectedRequest.serviceDescription}</p>
              </div>

              {selectedRequest.additionalRequirements && (
                <div>
                  <Label className="text-sm font-medium">Additional Requirements</Label>
                  <p className="text-sm mt-1">{selectedRequest.additionalRequirements}</p>
                </div>
              )}

              {selectedRequest.status === 'pending' && (
                <div className="flex space-x-2 pt-4">
                  <Button
                    onClick={() => handleServiceRequestAction(selectedRequest._id, 'accept')}
                    className="flex-1"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Accept Request
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleServiceRequestAction(selectedRequest._id, 'reject')}
                    className="flex-1"
                  >
                    Reject Request
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminDashboard;
