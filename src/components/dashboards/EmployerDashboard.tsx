
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Users, Eye, Calendar, LogOut, BarChart3 } from 'lucide-react';

interface EmployerDashboardProps {
  user: { role: string; name: string };
  onLogout: () => void;
}

const EmployerDashboard = ({ user, onLogout }: EmployerDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  const jobPostings = [
    { id: 1, title: 'Senior Frontend Developer', applications: 45, views: 234, status: 'Active', posted: '2024-01-10' },
    { id: 2, title: 'Backend Engineer', applications: 32, views: 189, status: 'Active', posted: '2024-01-08' },
    { id: 3, title: 'Full Stack Developer', applications: 67, views: 312, status: 'Closed', posted: '2024-01-05' },
  ];

  const candidates = [
    { id: 1, name: 'John Doe', position: 'Frontend Developer', status: 'Interview Scheduled', experience: '3 years' },
    { id: 2, name: 'Jane Smith', position: 'Backend Engineer', status: 'Under Review', experience: '5 years' },
    { id: 3, name: 'Mike Johnson', position: 'Full Stack Developer', status: 'Shortlisted', experience: '4 years' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">Job Postings</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                  <PlusCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">8 open positions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">387</div>
                  <p className="text-xs text-muted-foreground">+23% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                  <p className="text-xs text-muted-foreground">Company profile views</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Interviews</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">15</div>
                  <p className="text-xs text-muted-foreground">Scheduled this week</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Job Postings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobPostings.slice(0, 3).map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{job.title}</p>
                        <p className="text-sm text-gray-500">Posted on {job.posted}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm">
                          <span className="font-medium">{job.applications}</span> applications
                        </div>
                        <Badge variant={job.status === 'Active' ? 'default' : 'secondary'}>
                          {job.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Job Postings</h2>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Post New Job
              </Button>
            </div>

            <div className="space-y-4">
              {jobPostings.map((job) => (
                <Card key={job.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{job.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">Posted on {job.posted}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm">
                            <strong>{job.applications}</strong> applications
                          </span>
                          <span className="text-sm">
                            <strong>{job.views}</strong> views
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={job.status === 'Active' ? 'default' : 'secondary'}>
                          {job.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          View Applications
                        </Button>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Create Job Form */}
            <Card>
              <CardHeader>
                <CardTitle>Create New Job Posting</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Job Title</label>
                    <Input placeholder="e.g., Senior Frontend Developer" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Department</label>
                    <Input placeholder="e.g., Engineering" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <Input placeholder="e.g., Remote, Mumbai" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Salary Range</label>
                    <Input placeholder="e.g., ₹8-12 LPA" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Job Description</label>
                    <Textarea placeholder="Describe the role, responsibilities, and requirements..." className="mt-1" />
                  </div>
                  <div className="md:col-span-2">
                    <Button className="w-full">Post Job</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="candidates" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Candidate Management</h2>
              <Button variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>

            <div className="space-y-4">
              {candidates.map((candidate) => (
                <Card key={candidate.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{candidate.name}</h3>
                        <p className="text-gray-600">Applied for: {candidate.position}</p>
                        <p className="text-sm text-gray-500">Experience: {candidate.experience}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            candidate.status === 'Interview Scheduled' ? 'default' :
                            candidate.status === 'Shortlisted' ? 'secondary' : 'outline'
                          }
                        >
                          {candidate.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                        <Button size="sm">
                          Schedule Interview
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
                <CardTitle>Analytics & Insights</CardTitle>
                <CardDescription>Track your recruitment performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Application Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-40 bg-gray-100 rounded flex items-center justify-center">
                        <p className="text-gray-500">Chart visualization would go here</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Skill Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-40 bg-gray-100 rounded flex items-center justify-center">
                        <p className="text-gray-500">Skill analysis chart</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Company Settings</CardTitle>
                <CardDescription>Manage your company profile and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full">
                    Edit Company Profile
                  </Button>
                  <Button variant="outline" className="w-full">
                    Billing & Subscriptions
                  </Button>
                  <Button variant="outline" className="w-full">
                    Notification Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EmployerDashboard;
