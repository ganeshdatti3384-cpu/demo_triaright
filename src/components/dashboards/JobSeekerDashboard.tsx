
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Download, Briefcase, LogOut, Filter } from 'lucide-react';

interface JobSeekerDashboardProps {
  user: { role: string; name: string };
  onLogout: () => void;
}

const JobSeekerDashboard = ({ user, onLogout }: JobSeekerDashboardProps) => {
  const [activeTab, setActiveTab] = useState('jobs');

  const jobs = [
    { id: 1, title: 'Frontend Developer', company: 'Tech Solutions', location: 'Remote', salary: '₹8-12 LPA', type: 'Full-time', applied: false },
    { id: 2, title: 'Backend Developer', company: 'Innovation Labs', location: 'Bangalore', salary: '₹10-15 LPA', type: 'Full-time', applied: true },
    { id: 3, title: 'Full Stack Developer', company: 'Startup Inc', location: 'Mumbai', salary: '₹12-18 LPA', type: 'Full-time', applied: false },
  ];

  const applications = [
    { id: 1, title: 'Backend Developer', company: 'Innovation Labs', appliedDate: '2024-01-15', status: 'Interview Scheduled' },
    { id: 2, title: 'React Developer', company: 'WebTech Co', appliedDate: '2024-01-10', status: 'Under Review' },
    { id: 3, title: 'Software Engineer', company: 'Global Tech', appliedDate: '2024-01-05', status: 'Rejected' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EduCareer Hub
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="jobs">Browse Jobs</TabsTrigger>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search jobs by title, company, or skills..."
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {jobs.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                        <p className="text-gray-600 mb-2">{job.company}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="outline">{job.location}</Badge>
                          <Badge variant="outline">{job.type}</Badge>
                          <Badge variant="secondary">{job.salary}</Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          Great opportunity for experienced developers to join our growing team...
                        </p>
                      </div>
                      <div className="ml-4">
                        <Button
                          className={job.applied ? "bg-green-600 hover:bg-green-700" : ""}
                          disabled={job.applied}
                        >
                          {job.applied ? 'Applied' : 'Apply Now'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Applications</h2>
              <div className="text-sm text-gray-600">
                Total Applications: {applications.length}
              </div>
            </div>

            <div className="space-y-4">
              {applications.map((app) => (
                <Card key={app.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{app.title}</h3>
                        <p className="text-gray-600">{app.company}</p>
                        <p className="text-sm text-gray-500 mt-1">Applied on: {app.appliedDate}</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            app.status === 'Interview Scheduled' ? 'default' :
                            app.status === 'Under Review' ? 'secondary' : 'destructive'
                          }
                        >
                          {app.status}
                        </Badge>
                        <Button variant="outline" size="sm" className="mt-2 block">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Management</CardTitle>
                <CardDescription>Manage your resume and personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Resume</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Last updated: January 15, 2024</span>
                        <div className="space-x-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button size="sm">Update Resume</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Profile Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full">
                        Edit Profile
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle>Submit Feedback</CardTitle>
                <CardDescription>Help us improve our platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Feedback Type</label>
                    <select className="w-full mt-1 p-2 border border-gray-300 rounded-md">
                      <option>Platform Experience</option>
                      <option>Job Recommendations</option>
                      <option>Application Process</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Your Feedback</label>
                    <textarea
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md h-32"
                      placeholder="Please share your feedback..."
                    ></textarea>
                  </div>
                  <Button className="w-full">Submit Feedback</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default JobSeekerDashboard;
