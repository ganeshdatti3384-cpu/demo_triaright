import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Settings, Users, BookOpen, Briefcase, GraduationCap, LogOut, BarChart3, Eye, CheckCircle, XCircle } from 'lucide-react';
import CourseManagement from '../admin/CourseManagement';
import UserManagement from '../admin/UserManagement';
import JobManagement from '../admin/JobManagement';

interface AdminDashboardProps {
  user: { role: string; name: string };
  onLogout: () => void;
}

interface PendingApproval {
  id: number;
  type: string;
  name: string;
  requestDate: string;
  status: string;
  details?: {
    description?: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    companySize?: string;
    industry?: string;
  };
}

const AdminDashboard = ({ user, onLogout }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);

  const platformStats = {
    totalUsers: 15234,
    activeStudents: 8967,
    registeredEmployers: 456,
    liveCourses: 89,
    completedPlacements: 1234
  };

  const pendingApprovals: PendingApproval[] = [
    { 
      id: 1, 
      type: 'Employer', 
      name: 'TechCorp Solutions', 
      requestDate: '2024-01-15', 
      status: 'pending',
      details: {
        description: 'Leading technology solutions company',
        contactPerson: 'John Smith',
        email: 'john@techcorp.com',
        phone: '+1-555-0123',
        address: '123 Tech Street, Silicon Valley, CA',
        website: 'www.techcorp.com',
        companySize: '500-1000 employees',
        industry: 'Technology'
      }
    },
    { 
      id: 2, 
      type: 'College', 
      name: 'ABC Engineering College', 
      requestDate: '2024-01-14', 
      status: 'pending',
      details: {
        description: 'Premier engineering institution',
        contactPerson: 'Dr. Sarah Johnson',
        email: 'admin@abc.edu',
        phone: '+1-555-0456',
        address: '456 College Ave, Education City, NY',
        website: 'www.abc.edu'
      }
    },
    { 
      id: 3, 
      type: 'Course', 
      name: 'Advanced React Development', 
      requestDate: '2024-01-13', 
      status: 'pending',
      details: {
        description: 'Comprehensive React course covering advanced concepts',
        contactPerson: 'Mike Wilson',
        email: 'mike@reactcourse.com'
      }
    },
  ];

  const recentActivity = [
    { id: 1, action: 'New employer registration', entity: 'TechStart Inc', time: '2 hours ago' },
    { id: 2, action: 'Course completion', entity: 'React Fundamentals', time: '4 hours ago' },
    { id: 3, action: 'Job posting created', entity: 'Senior Developer Role', time: '6 hours ago' },
  ];

  const handleViewApproval = (approval: PendingApproval) => {
    setSelectedApproval(approval);
    setIsApprovalDialogOpen(true);
  };

  const handleApproveRequest = (approvalId: number) => {
    console.log(`Approving request ${approvalId}`);
    setIsApprovalDialogOpen(false);
  };

  const handleRejectRequest = (approvalId: number) => {
    console.log(`Rejecting request ${approvalId}`);
    setIsApprovalDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
           <div className="flex items-center">
              <img 
                src="/lovable-uploads/93e33449-ffbe-4c83-9fcf-6012873a863c.png" 
                alt="TriaRight Logo" 
                className="h-10 w-auto"
              />
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
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

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Placements</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{platformStats.completedPlacements.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Successfully placed</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>Items requiring admin approval</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingApprovals.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.type} - Requested on {item.requestDate}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">Pending</Badge>
                        <Button variant="outline" size="sm" onClick={() => handleViewApproval(item)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                        <Button size="sm" onClick={() => handleApproveRequest(item.id)}>Approve</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Platform Activity</CardTitle>
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
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <CourseManagement />
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <JobManagement />
          </TabsContent>

          <TabsContent value="approvals" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Approval Management</h2>
              <Badge variant="outline">{pendingApprovals.length} Pending</Badge>
            </div>

            <div className="space-y-4">
              {pendingApprovals.map((item) => (
                <Card key={item.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <p className="text-gray-600">Type: {item.type}</p>
                        <p className="text-sm text-gray-500">Requested on: {item.requestDate}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewApproval(item)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleRejectRequest(item.id)}>
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button size="sm" onClick={() => handleApproveRequest(item.id)}>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
                <CardDescription>Comprehensive platform insights and metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">User Growth</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
                        <p className="text-gray-500">User growth chart would go here</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Course Engagement</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
                        <p className="text-gray-500">Engagement metrics chart</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Approval Request Details</DialogTitle>
          </DialogHeader>
          {selectedApproval && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Request Type</label>
                  <p className="text-sm font-medium">{selectedApproval.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-sm font-medium">{selectedApproval.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Request Date</label>
                  <p className="text-sm font-medium">{selectedApproval.requestDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <Badge variant="outline">{selectedApproval.status}</Badge>
                </div>
              </div>
              
              {selectedApproval.details && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Additional Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedApproval.details.description && (
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-500">Description</label>
                        <p className="text-sm">{selectedApproval.details.description}</p>
                      </div>
                    )}
                    {selectedApproval.details.contactPerson && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Contact Person</label>
                        <p className="text-sm">{selectedApproval.details.contactPerson}</p>
                      </div>
                    )}
                    {selectedApproval.details.email && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-sm">{selectedApproval.details.email}</p>
                      </div>
                    )}
                    {selectedApproval.details.phone && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Phone</label>
                        <p className="text-sm">{selectedApproval.details.phone}</p>
                      </div>
                    )}
                    {selectedApproval.details.website && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Website</label>
                        <p className="text-sm">{selectedApproval.details.website}</p>
                      </div>
                    )}
                    {selectedApproval.details.address && (
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-500">Address</label>
                        <p className="text-sm">{selectedApproval.details.address}</p>
                      </div>
                    )}
                    {selectedApproval.details.companySize && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Company Size</label>
                        <p className="text-sm">{selectedApproval.details.companySize}</p>
                      </div>
                    )}
                    {selectedApproval.details.industry && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Industry</label>
                        <p className="text-sm">{selectedApproval.details.industry}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex space-x-2 pt-4 border-t">
                <Button onClick={() => handleApproveRequest(selectedApproval.id)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Request
                </Button>
                <Button variant="destructive" onClick={() => handleRejectRequest(selectedApproval.id)}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Request
                </Button>
                <Button variant="outline" onClick={() => setIsApprovalDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
