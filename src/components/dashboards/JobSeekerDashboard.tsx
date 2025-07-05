
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Briefcase, FileText, Users, TrendingUp, MapPin, Clock, DollarSign, Star, Building, Calendar } from 'lucide-react';
import Navbar from '../Navbar';
import Pack365Card from '../Pack365Card';

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
      <Navbar onOpenAuth={() => {}} userRole="job-seeker" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.name}!</h1>
            <p className="text-gray-600 mt-2">Find your dream job and advance your career</p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            Logout
          </Button>
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="jobs">Job Search</TabsTrigger>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="pack365">Pack365</TabsTrigger>
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

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Completion</CardTitle>
                <CardDescription>Complete your profile to get better job matches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Profile Completion</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>✅ Basic Information</span>
                      <span className="text-green-600">Complete</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>✅ Work Experience</span>
                      <span className="text-green-600">Complete</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>⚠️ Skills & Certifications</span>
                      <span className="text-yellow-600">Incomplete</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>❌ Portfolio Projects</span>
                      <span className="text-red-600">Missing</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4">Complete Profile</Button>
                </div>
              </CardContent>
            </Card>

            {/* Skills Enhancement */}
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

          <TabsContent value="pack365" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Boost Your Career with Pack365</h2>
              <p className="text-lg text-gray-600">Comprehensive training program designed for job seekers</p>
            </div>
            
            <Pack365Card />
            
            <Card>
              <CardHeader>
                <CardTitle>How Pack365 Helps Job Seekers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <Briefcase className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold">Job-Ready Skills</h3>
                    <p className="text-sm text-gray-600">Learn in-demand skills that employers are looking for</p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold">Resume & Interview Prep</h3>
                    <p className="text-sm text-gray-600">Professional guidance for applications and interviews</p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold">Networking Opportunities</h3>
                    <p className="text-sm text-gray-600">Connect with industry professionals and peers</p>
                  </div>
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
