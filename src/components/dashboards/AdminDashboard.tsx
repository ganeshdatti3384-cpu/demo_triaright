import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LiveCourseManagement from "@/components/admin/live-courses/LiveCourseManagement";
import LiveCourseCouponsManagement from "@/components/admin/live-courses/LiveCourseCouponsManagement";
import LiveCourseBatchesManagement from "@/components/admin/live-courses/LiveCourseBatchesManagement";

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
  MessageSquare,
  User
} from 'lucide-react';
import CourseManagement from '@/components/admin/CourseManagement';
import UserManagement from '@/components/admin/UserManagement';
import JobManagement from '@/components/admin/JobManagement';
import Pack365Management from '@/components/admin/Pack365Management';
import CollegeManagement from '@/components/admin/CollegeManagement';
import RegularInternshipManagement from '@/components/admin/RegularInternshipManagement';
import APInternshipManagement from '@/components/admin/APInternshipManagement';
import FeedbackManagement from '@/components/admin/FeedbackManagement';
import PlacementManagement from '@/components/admin/PlacementManagement';
import UpdateManagement from '@/components/admin/UpdateManagement';
import Navbar from '@/components/Navbar';
import { collegeApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface AdminDashboardProps {
  user: { role: string; name: string };
  onLogout: () => void;
}

const AdminDashboard = ({ user, onLogout }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState('users');
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

  useEffect(() => {
    if (activeTab === 'college-requests' || activeTab === 'approvals') {
      fetchCollegeRequests();
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
            { value: 'users', label: 'Users' },
            { value: 'courses', label: 'Courses' },
            { value: 'live-courses', label: 'Live Courses' },
            { value: 'live-course-coupons', label: 'Live Coupons' },
            { value: 'live-course-batches', label: 'Live Batches' },
            { value: 'regular-internships', label: 'Internships' },
            { value: 'ap-internships', label: 'AP Exclusive' },
            { value: 'pack365', label: 'Pack365' },
            { value: 'jobs', label: 'Jobs' },
            { value: 'colleges', label: 'Colleges' },
            { value: 'placements', label: 'Placements' },
            { value: 'feedbacks', label: 'Feedbacks' },
            { value: 'updates', label: 'Updates' },
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
          <TabsList className="hidden lg:flex w-full gap-1 mb-6 overflow-x-auto">
            <TabsTrigger value="users" className="text-xs whitespace-nowrap">Users</TabsTrigger>
            <TabsTrigger value="courses" className="text-xs whitespace-nowrap">Courses</TabsTrigger>
            <TabsTrigger value="live-courses" className="text-xs whitespace-nowrap">Live Courses</TabsTrigger>
            <TabsTrigger value="live-course-coupons" className="text-xs whitespace-nowrap">Live Coupons</TabsTrigger>
            <TabsTrigger value="live-course-batches" className="text-xs whitespace-nowrap">Live Batches</TabsTrigger>
            <TabsTrigger value="regular-internships" className="text-xs whitespace-nowrap">Internships</TabsTrigger>
            <TabsTrigger value="ap-internships" className="text-xs whitespace-nowrap">AP Exclusive</TabsTrigger>
            <TabsTrigger value="pack365" className="text-xs whitespace-nowrap">Pack365</TabsTrigger>
            <TabsTrigger value="jobs" className="text-xs whitespace-nowrap">Jobs</TabsTrigger>
            <TabsTrigger value="colleges" className="text-xs whitespace-nowrap">Colleges</TabsTrigger>
            <TabsTrigger value="placements" className="text-xs whitespace-nowrap">Placements</TabsTrigger>
            <TabsTrigger value="feedbacks" className="text-xs whitespace-nowrap">Feedbacks</TabsTrigger>
            <TabsTrigger value="updates" className="text-xs whitespace-nowrap">Updates</TabsTrigger>
            <TabsTrigger value="college-requests" className="text-xs whitespace-nowrap">Requests</TabsTrigger>
          </TabsList>

          {/* Mobile Tab Selector */}
          <div className="lg:hidden mb-6">
            <select 
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white"
            >
              <option value="users">Users</option>
              <option value="courses">Courses</option>
              <option value="live-courses">Live Courses</option>
              <option value="live-course-coupons">Live Coupons</option>
              <option value="live-course-batches">Live Batches</option>
              <option value="regular-internships">Internships</option>
              <option value="ap-internships">AP Exclusive</option>
              <option value="pack365">Pack365</option>
              <option value="jobs">Jobs</option>
              <option value="colleges">Colleges</option>
              <option value="placements">Placements</option>
              <option value="feedbacks">Feedbacks</option>
              <option value="updates">Updates</option>
              <option value="college-requests">Requests</option>
            </select>
          </div>

          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <CourseManagement />
          </TabsContent>

          <TabsContent value="live-courses" className="space-y-6">
            <LiveCourseManagement />
          </TabsContent>

          <TabsContent value="live-course-coupons" className="space-y-6">
            <LiveCourseCouponsManagement />
          </TabsContent>

          <TabsContent value="live-course-batches" className="space-y-6">
            <LiveCourseBatchesManagement />
          </TabsContent>

          <TabsContent value="regular-internships" className="space-y-6">
            <RegularInternshipManagement />
          </TabsContent>

          <TabsContent value="ap-internships" className="space-y-6">
            <APInternshipManagement />
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

          <TabsContent value="placements" className="space-y-6">
            <PlacementManagement />
          </TabsContent>

          <TabsContent value="feedbacks" className="space-y-6">
            <FeedbackManagement />
          </TabsContent>

          <TabsContent value="updates" className="space-y-6">
            <UpdateManagement />
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
