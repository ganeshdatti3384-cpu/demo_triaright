
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GraduationCap, Users, BookOpen, LogOut, Send } from 'lucide-react';

interface CollegeDashboardProps {
  user: { role: string; name: string };
  onLogout: () => void;
}

const CollegeDashboard = ({ user, onLogout }: CollegeDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  const availableServices = [
    { id: 1, title: 'Campus Recruitment Training', description: 'Comprehensive CRT programs for final year students', category: 'Training' },
    { id: 2, title: 'Technical Skill Development', description: 'Industry-relevant technical courses', category: 'Courses' },
    { id: 3, title: 'Career Guidance Programs', description: 'Professional career counseling services', category: 'Guidance' },
    { id: 4, title: 'Placement Assistance', description: 'Job placement support for graduates', category: 'Placement' },
  ];

  const requestHistory = [
    { id: 1, service: 'Campus Recruitment Training', requestDate: '2024-01-15', status: 'Approved', students: 150 },
    { id: 2, service: 'Technical Workshop', requestDate: '2024-01-10', status: 'Pending', students: 80 },
    { id: 3, service: 'Career Guidance', requestDate: '2024-01-05', status: 'Completed', students: 200 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                College Partnership Portal
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
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Available Services</TabsTrigger>
            <TabsTrigger value="requests">My Requests</TabsTrigger>
            <TabsTrigger value="custom">Custom Request</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
                  <Send className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">Pending approval</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Students Enrolled</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">430</div>
                  <p className="text-xs text-muted-foreground">Across all programs</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Programs</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">This academic year</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Services</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">15</div>
                  <p className="text-xs text-muted-foreground">Educational programs</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Service Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requestHistory.slice(0, 3).map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{request.service}</p>
                        <p className="text-sm text-gray-500">Requested on {request.requestDate}</p>
                        <p className="text-sm text-gray-500">{request.students} students</p>
                      </div>
                      <Badge
                        variant={
                          request.status === 'Approved' ? 'default' :
                          request.status === 'Completed' ? 'secondary' : 'outline'
                        }
                      >
                        {request.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Available Services</h2>
              <p className="text-sm text-gray-600">Explore our educational offerings</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableServices.map((service) => (
                <Card key={service.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{service.title}</CardTitle>
                      <Badge variant="outline">{service.category}</Badge>
                    </div>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">Request This Service</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Service Requests</h2>
              <Badge variant="outline">{requestHistory.length} Total Requests</Badge>
            </div>

            <div className="space-y-4">
              {requestHistory.map((request) => (
                <Card key={request.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{request.service}</h3>
                        <p className="text-gray-600">Requested on: {request.requestDate}</p>
                        <p className="text-sm text-gray-500">Expected students: {request.students}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            request.status === 'Approved' ? 'default' :
                            request.status === 'Completed' ? 'secondary' : 'outline'
                          }
                        >
                          {request.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Request Custom Service</CardTitle>
                <CardDescription>
                  Need something specific? Submit a custom request and our team will reach out to you.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Institution Name</label>
                      <Input placeholder="Your institution name" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Contact Person</label>
                      <Input placeholder="Your name" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input type="email" placeholder="contact@institution.edu" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone Number</label>
                      <Input placeholder="Contact number" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Expected Students</label>
                      <Input type="number" placeholder="Number of students" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Preferred Date</label>
                      <Input type="date" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Service Category</label>
                    <select className="w-full mt-1 p-2 border border-gray-300 rounded-md">
                      <option value="">Select a category</option>
                      <option value="training">Training Program</option>
                      <option value="workshop">Workshop</option>
                      <option value="placement">Placement Drive</option>
                      <option value="seminar">Seminar/Webinar</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Service Description</label>
                    <Textarea
                      placeholder="Please describe your requirements in detail..."
                      className="mt-1 h-32"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Additional Requirements</label>
                    <Textarea
                      placeholder="Any specific requirements or constraints..."
                      className="mt-1 h-24"
                    />
                  </div>

                  <Button className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Submit Request
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

export default CollegeDashboard;
