/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Settings, Users, BookOpen, Briefcase, GraduationCap, LogOut, BarChart3, Package, Building2, BriefcaseIcon } from 'lucide-react';
import CourseManagement from '../admin/CourseManagement';
import UserManagement from '../admin/UserManagement';
import JobManagement from '../admin/JobManagement';
import Pack365Management from '../admin/Pack365Management';
import PaymentAnalytics from '../admin/PaymentAnalytics';
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

  const recentActivity = [
    { id: 1, action: 'New employer registration', entity: 'TechStart Inc', time: '2 hours ago' },
    { id: 2, action: 'Course completion', entity: 'React Fundamentals', time: '4 hours ago' },
    { id: 3, action: 'Job posting created', entity: 'Senior Developer Role', time: '6 hours ago' },
    { id: 4, action: 'Internship application', entity: 'Web Development Intern', time: '1 hour ago' },
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
      // Fetch regular internships
      const internshipsResponse = await fetch('/api/internships', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const internships = await internshipsResponse.json();

      // Fetch AP internships
      const apInternshipsResponse = await fetch('/api/internships/ap-internships', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const apInternshipsData = await apInternshipsResponse.json();

      // Fetch applications
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-10 lg:grid-cols-10 md:grid-cols-8 sm:grid-cols-6 gap-1 overflow-x-auto">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="users" className="text-xs">Users</TabsTrigger>
            <TabsTrigger value="courses" className="text-xs">Courses</TabsTrigger>
            <TabsTrigger value="internships" className="text-xs">Internships</TabsTrigger>
            <TabsTrigger value="applications" className="text-xs">Applications</TabsTrigger>
            <TabsTrigger value="pack365" className="text-xs">Pack365</TabsTrigger>
            <TabsTrigger value="jobs" className="text-xs">Jobs</TabsTrigger>
            <TabsTrigger value="payments" className="text-xs">Payments</TabsTrigger>
            <TabsTrigger value="colleges" className="text-xs">Colleges</TabsTrigger>
            <TabsTrigger value="college-requests" className="text-xs">College Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{platformStats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{platformStats.activeStudents.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Currently enrolled</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Employers</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{platformStats.registeredEmployers}</div>
                  <p className="text-xs text-muted-foreground">Registered companies</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Live Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{platformStats.liveCourses}</div>
                  <p className="text-xs text-muted-foreground">Active programs</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Internships</CardTitle>
                  <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{internshipStats.totalInternships}</div>
                  <p className="text-xs text-muted-foreground">Regular & AP Internships</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Internships</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{internshipStats.activeInternships}</div>
                  <p className="text-xs text-muted-foreground">Currently accepting applications</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{internshipStats.pendingApplications}</div>
                  <p className="text-xs text-muted-foreground">Requiring review</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Approvals</CardTitle>
                  <CardDescription>College service requests requiring admin approval</CardDescription>
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
                          <Button variant="outline" size="sm" onClick={() => setActiveTab('college-requests')}>Review</Button>
                        </div>
                      </div>
                    ))}
                    {pendingRequests.length === 0 && (
                      <p className="text-center text-gray-500 py-4">No pending approvals</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Platform Activity</CardTitle>
                  <CardDescription>Latest activities across the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-sm text-gray-500">{activity.entity}</p>
                        </div>
                        <span className="text-xs text-gray-400">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Frequently used administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col"
                    onClick={() => setActiveTab('internships')}
                  >
                    <BriefcaseIcon className="h-6 w-6 mb-2" />
                    <span>Manage Internships</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col"
                    onClick={() => setActiveTab('applications')}
                  >
                    <Users className="h-6 w-6 mb-2" />
                    <span>Review Applications</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col"
                    onClick={() => setActiveTab('courses')}
                  >
                    <BookOpen className="h-6 w-6 mb-2" />
                    <span>Manage Courses</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col"
                    onClick={() => setActiveTab('users')}
                  >
                    <Users className="h-6 w-6 mb-2" />
                    <span>User Management</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
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

          <TabsContent value="payments" className="space-y-6">
            <PaymentAnalytics />
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
