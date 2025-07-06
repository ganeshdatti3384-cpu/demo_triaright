/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Briefcase, FileText, Users, TrendingUp, MapPin, Clock, DollarSign, Star, Building, Calendar, Code, FolderOpen, Settings } from 'lucide-react';
import Navbar from '../Navbar';
import Pack365Card from '../Pack365Card';
import CodeCompiler from '../CodeCompiler';

interface JobSeekerDashboardProps {
  user: {
    role: string;
    name: string;
  };
  onLogout: () => void;
}

const JobSeekerDashboard = ({ user, onLogout }: JobSeekerDashboardProps) => {
  const [applications, setApplications] = useState<any[]>([]);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);

  const stats = [
    {
      title: 'Applications Sent',
      value: applications.length.toString(),
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Saved Jobs',
      value: savedJobs.length.toString(),
      icon: Briefcase,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Profile Views',
      value: '24',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Skill Score',
      value: '85%',
      icon: TrendingUp,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ];

  // Mock job recommendations
  const jobRecommendations = [
    {
      id: 1,
      title: 'Frontend Developer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      salary: '$80,000 - $120,000',
      type: 'Full-time',
      posted: '2 days ago',
      match: 92
    },
    {
      id: 2,
      title: 'React Developer',
      company: 'StartupXYZ',
      location: 'Remote',
      salary: '$70,000 - $100,000',
      type: 'Full-time',
      posted: '1 week ago',
      match: 88
    },
    {
      id: 3,
      title: 'UI/UX Designer',
      company: 'Design Studio',
      location: 'New York, NY',
      salary: '$60,000 - $90,000',
      type: 'Contract',
      posted: '3 days ago',
      match: 85
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Navbar onOpenAuth={() => { } } userRole="jobseeker" user={{
        role: '',
        name: ''
      }} onLogout={function (): void {
        throw new Error('Function not implemented.');
      } } />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.name}!</h1>
            <p className="text-gray-600 mt-2">Find your dream job and advance your career</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-full`}>
                      <IconComponent className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="jobs">Job Search</TabsTrigger>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
            <TabsTrigger value="compiler">Compiler</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            {/* Job Search Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Job Recommendations</CardTitle>
                <CardDescription>Jobs matched to your skills and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobRecommendations.map((job) => (
                    <div key={job.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                          <div className="flex items-center space-x-2 text-gray-600 mt-1">
                            <Building className="h-4 w-4" />
                            <span>{job.company}</span>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          {job.match}% Match
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>{job.salary}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Briefcase className="h-4 w-4" />
                          <span>{job.type}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{job.posted}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Apply Now
                        </Button>
                        <Button size="sm" variant="outline">
                          Save Job
                        </Button>
                        <Button size="sm" variant="ghost">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
                <CardDescription>Track your job applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No applications yet.</p>
                  <Button>Start Applying to Jobs</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compiler" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Code className="h-5 w-5" />
                  <span>Code Compiler</span>
                </CardTitle>
                <CardDescription>Practice coding to improve your technical skills</CardDescription>
              </CardHeader>
              <CardContent>
                <CodeCompiler />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FolderOpen className="h-5 w-5" />
                  <span>Portfolio Projects</span>
                </CardTitle>
                <CardDescription>Showcase your projects to potential employers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="border-dashed border-2 border-gray-300">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                      <FolderOpen className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="font-semibold text-gray-900 mb-2">Add New Project</h3>
                      <p className="text-sm text-gray-500 mb-4">Build your portfolio</p>
                      <Button>Add Project</Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">E-commerce Website</h3>
                        <Badge variant="outline">Full Stack</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">Complete e-commerce solution with payment integration</p>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">View</Button>
                        <Button size="sm">Edit</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Weather App</h3>
                        <Badge variant="outline">React</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">Weather forecast app with geolocation</p>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">View</Button>
                        <Button size="sm">Edit</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Account Settings</span>
                </CardTitle>
                <CardDescription>Manage your job search preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Profile Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input type="text" className="w-full p-2 border rounded-md" defaultValue={user.name} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input type="email" className="w-full p-2 border rounded-md" defaultValue="jobseeker@example.com" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Job Preferences</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Location</label>
                        <input type="text" className="w-full p-2 border rounded-md" defaultValue="Remote" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Salary Expectation</label>
                        <input type="text" className="w-full p-2 border rounded-md" defaultValue="$80,000 - $120,000" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Notifications</h3>
                    <div className="space-y-3 mt-4">
                      <div className="flex items-center justify-between">
                        <span>Job recommendations</span>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Application updates</span>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Email notifications</span>
                        <input type="checkbox" className="rounded" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Skills Assessment</CardTitle>
                <CardDescription>Track and improve your professional skills</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">JavaScript</span>
                      <span className="text-sm text-gray-500">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">React</span>
                      <span className="text-sm text-gray-500">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Communication</span>
                      <span className="text-sm text-gray-500">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                </div>
                <Button className="w-full mt-6">Take Skills Assessment</Button>
              </CardContent>
            </Card>

            {/* Skill Enhancement */}
            <Card>
              <CardHeader>
                <CardTitle>Skill Enhancement</CardTitle>
                <CardDescription>Improve your skills to get better job opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <Pack365Card />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default JobSeekerDashboard;
