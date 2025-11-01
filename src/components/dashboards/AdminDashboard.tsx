import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Settings, 
  Users, 
  BookOpen, 
  Briefcase, 
  GraduationCap, 
  LogOut, 
  BarChart3, 
  Package, 
  Building2, 
  BriefcaseIcon,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  DollarSign,
  Calendar,
  FileText,
  Bookmark,
  Certificate,
  FolderOpen
} from 'lucide-react';
import CourseManagement from '../admin/CourseManagement';
import UserManagement from '../admin/UserManagement';
import JobManagement from '../admin/JobManagement';
import Pack365Management from '../admin/Pack365Management';
import CollegeManagement from '../admin/CollegeManagement';
import InternshipManagement from '../admin/InternshipsManagement';
import ApplicationManagement from '../admin/ApplicationManagement';
import Navbar from '../Navbar';
import { collegeApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface AdminDashboardProps {
  user: { role: string; name: string };
  onLogout: () => void;
}

const AdminDashboard = ({ user, onLogout }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [collegeRequests, setCollegeRequests] = useState<any[]>([]);
  const [internshipStats, setInternshipStats] = useState({
    totalInternships: 0,
    activeInternships: 0,
    totalApplications: 0,
    pendingApplications: 0
  });
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  const platformStats = {
    totalUsers: 15234,
    activeStudents: 8967,
    registeredEmployers: 456,
    liveCourses: 89,
    completedPlacements: 1234,
    totalInternships: internshipStats.totalInternships,
    activeInternships: internshipStats.activeInternships
  };

  const quickActions = [
    { id: 1, name: 'Rename Last Course', icon: FileText, description: 'Update course names' },
    { id: 2, name: 'Browse New Courses', icon: FolderOpen, description: 'Explore course catalog' },
    { id: 3, name: 'View Certificates', icon: Certificate, description: 'Manage certificates' }
  ];

  const dailyNotices = [
    { id: 1, title: 'Prelim Payment Due', content: 'Sorem ipsum dolor sit amet, consectetur adipiscing elit.', time: '2 hours ago' },
    { id: 2, title: 'System Maintenance', content: 'Norem ipsum dolor sit amet, consectetur adipiscing elit.', time: '5 hours ago' },
    { id: 3, title: 'New Features', content: 'Nine vulputate libero et velit interdum, ac aliquet odio mattis.', time: '1 day ago' }
  ];

  useEffect(() => {
    if (activeTab === 'college-requests' || activeTab === 'approvals') {
      fetchCollegeRequests();
    }
    if (activeTab === 'overview') {
      fetchInternshipStats();
    }
  }, [activeTab]);

  const fetchCollegeRequests = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const response = await collegeApi.getCollegeRequests(token);
      if (response.success) {
        setCollegeRequests(response.requests);
      }
    } catch (error) {
      console.error('Error fetching college requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load college requests',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInternshipStats = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const internshipsResponse = await fetch('/api/internships', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const internships = await internshipsResponse.json();

      const apInternshipsResponse = await fetch('/api/internships/ap-internships', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const apInternshipsData = await apInternshipsResponse.json();

      const applicationsResponse = await fetch('/api/internships/ap-internshipsapplication/applications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const applicationsData = await applicationsResponse.json();

      const totalInternships = Array.isArray(internships) ? internships.length : 0;
      const apInternships = apInternshipsData.success ? apInternshipsData.internships.length : 0;
      const applications = applicationsData.success ? applicationsData.applications : [];

      const activeInternships = [
        ...(Array.isArray(internships) ? internships.filter((i: any) => i.status === 'Open') : []),
        ...(apInternshipsData.success ? apInternshipsData.internships.filter((i: any) => i.status === 'Open') : [])
      ].length;

      const pendingApplications = applications.filter((app: any) => 
        app.status === 'Applied' || app.status === 'Pending'
      ).length;

      setInternshipStats({
        totalInternships: totalInternships + apInternships,
        activeInternships,
        totalApplications: applications.length,
        pendingApplications
      });
    } catch (error) {
      console.error('Error fetching internship stats:', error);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await collegeApi.acceptServiceRequest(token, requestId);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Request accepted successfully',
        });
        fetchCollegeRequests();
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      toast({
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
        toast({
          title: 'Success',
          description: 'Request rejected successfully',
        });
        fetchCollegeRequests();
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject request',
        variant: 'destructive'
      });
    }
  };

  const pendingRequests = collegeRequests.filter(request => request.status === 'Pending');

  // Mobile sidebar component
  const MobileSidebar = () => (
    <div className={`fixed inset-0 z-50 lg:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)} />
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Admin Menu</h2>
          <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4 space-y-2">
          {[
            { value: 'overview', label: 'Overview' },
            { value: 'users', label: 'Users' },
            { value: 'courses', label: 'Courses' },
            { value: 'internships', label: 'Internships' },
            { value: 'applications', label: 'Applications' },
            { value: 'pack365', label: 'Pack365' },
            { value: 'jobs', label: 'Jobs' },
            { value: 'colleges', label: 'Colleges' },
            { value: 'college-requests', label: 'Requests' }
          ].map((tab) => (
            <Button
              key={tab.value}
              variant={activeTab === tab.value ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => {
                setActiveTab(tab.value);
                setMobileMenuOpen(false);
              }}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">September 4, 2023</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <MobileSidebar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Welcome back, {user.name}!
              </h1>
              <p className="text-gray-600 mt-2">
                Always stay updated in your admin portal
              </p>
            </div>
            <div className="mt-4 lg:mt-0 flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  className="pl-10 w-full lg:w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Desktop Tabs */}
          <TabsList className="hidden lg:grid w-full grid-cols-9 gap-1 mb-6">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="users" className="text-xs">Users</TabsTrigger>
            <TabsTrigger value="courses" className="text-xs">Courses</TabsTrigger>
            <TabsTrigger value="internships" className="text-xs">Internships</TabsTrigger>
            <TabsTrigger value="applications" className="text-xs">Applications</TabsTrigger>
            <TabsTrigger value="pack365" className="text-xs">Pack365</TabsTrigger>
            <TabsTrigger value="jobs" className="text-xs">Jobs</TabsTrigger>
            <TabsTrigger value="colleges" className="text-xs">Colleges</TabsTrigger>
            <TabsTrigger value="college-requests" className="text-xs">Requests</TabsTrigger>
          </TabsList>

          {/* Mobile Tab Selector */}
          <div className="lg:hidden mb-6">
            <select 
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white"
            >
              <option value="overview">Overview</option>
              <option value="users">Users</option>
              <option value="courses">Courses</option>
              <option value="internships">Internships</option>
              <option value="applications">Applications</option>
              <option value="pack365">Pack365</option>
              <option value="jobs">Jobs</option>
              <option value="colleges">Colleges</option>
              <option value="college-requests">Requests</option>
            </select>
          </div>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Actions Section */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Jump back into your administration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {quickActions.map((action) => (
                    <Button
                      key={action.id}
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center p-4"
                    >
                      <action.icon className="h-6 w-6 mb-2" />
                      <span className="text-sm text-center">{action.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Finance Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Finance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Total Payable</span>
                      <span className="text-lg font-bold">$ 10,000</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Total Paid</span>
                      <span className="text-lg font-bold">$ 5,000</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Others</span>
                      <span className="text-lg font-bold">$ 300</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enrolled Courses Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Platform Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                      <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Manage platform courses</p>
                      <Button className="mt-3" onClick={() => setActiveTab('courses')}>
                        View Courses
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                    <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No recent activity</p>
                    <p className="text-sm text-gray-400 mt-1">Start managing your platform today!</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Students</p>
                      <p className="text-2xl font-bold">{platformStats.activeStudents.toLocaleString()}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Colleges</p>
                      <p className="text-2xl font-bold">45</p>
                    </div>
                    <Building2 className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Courses</p>
                      <p className="text-2xl font-bold">{platformStats.liveCourses}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Internships</p>
                      <p className="text-2xl font-bold">{platformStats.totalInternships}</p>
                    </div>
                    <BriefcaseIcon className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <CourseManagement />
          </TabsContent>

          <TabsContent value="internships" className="space-y-6">
            <InternshipManagement />
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <ApplicationManagement />
          </TabsContent>

          <TabsContent value="pack365" className="space-y-6">
            <Pack365Management />
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <JobManagement />
          </TabsContent>

          <TabsContent value="colleges" className="space-y-6">
            <CollegeManagement />
          </TabsContent>

          <TabsContent value="college-requests" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">College Service Requests</h2>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{collegeRequests.length} Total Requests</Badge>
                <Button onClick={fetchCollegeRequests} disabled={loading}>
                  {loading ? 'Loading...' : 'Refresh'}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p><span className="font-medium">Contact:</span> {request.contactPerson}</p>
                            <p><span className="font-medium">Email:</span> {request.email}</p>
                            <p><span className="font-medium">Phone:</span> {request.phoneNumber}</p>
                          </div>
                          <div>
                            <p><span className="font-medium">Expected Students:</span> {request.expectedStudents}</p>
                            <p><span className="font-medium">Preferred Date:</span> {request.preferredDate}</p>
                            <p><span className="font-medium">Requested by:</span> {request.requestedBy}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="text-sm"><span className="font-medium">Service Category:</span> {request.serviceCategory?.join(', ') || 'Not specified'}</p>
                          <p className="text-sm"><span className="font-medium">Description:</span> {request.serviceDescription}</p>
                          {request.additionalRequirements && (
                            <p className="text-sm"><span className="font-medium">Additional Requirements:</span> {request.additionalRequirements}</p>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          Requested on: {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-2 ml-4">
                        <Badge
                          variant={
                            request.status === 'Accepted' ? 'default' :
                            request.status === 'Rejected' ? 'destructive' : 'outline'
                          }
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
              {collegeRequests.length === 0 && !loading && (
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
  );
};

export default AdminDashboard;
