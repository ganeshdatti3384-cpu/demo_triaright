
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { collegeApi, pack365Api } from '@/services/api';
import { User } from '@/hooks/useAuth';

interface CollegeDashboardProps {
  user: User | null;
  onLogout: () => void;
}

interface ServiceRequest {
  _id: string;
  institutionName: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  expectedStudents: number;
  preferredDate: string;
  additionalRequirements?: string;
  serviceDescription: string;
  serviceCategory: string[];
  requestedBy: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Student {
  fullName: string;
  email: string;
}

const CollegeDashboard = ({ user }: CollegeDashboardProps) => {
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [streams, setStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to view your dashboard.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      
      // Fetch service requests
      const requestsResponse = await collegeApi.getAllServiceRequests(token);
      if (requestsResponse.success) {
        setServiceRequests(requestsResponse.requests || []);
      }

      // Fetch student count if user has college profile
      if (user && user.name) {
        try {
          const studentsResponse = await collegeApi.getStudentCountByInstitution(token, user.name);
          if (studentsResponse.success) {
            setStudentCount(studentsResponse.count);
            setStudents(studentsResponse.students || []);
          }
        } catch (error) {
          console.log('Could not fetch student data:', error);
          // This is optional data, so we don't show error toast
        }
      }

      // Fetch streams for Pack365
      try {
        const streamsResponse = await pack365Api.getAllStreams();
        if (streamsResponse.success && streamsResponse.streams) {
          setStreams(streamsResponse.streams);
        }
      } catch (error) {
        console.log('Could not fetch streams:', error);
      }

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading your dashboard...</h2>
        </div>
      </div>
    );
  }

  const overviewStats = [
    {
      title: 'Total Requests',
      value: serviceRequests.length,
      icon: FileText,
      color: 'bg-blue-500'
    },
    {
      title: 'Accepted Requests',
      value: serviceRequests.filter(req => req.status === 'Accepted').length,
      icon: CheckCircle2,
      color: 'bg-green-500'
    },
    {
      title: 'Pending Requests',
      value: serviceRequests.filter(req => req.status === 'Pending').length,
      icon: Clock,
      color: 'bg-yellow-500'
    },
    {
      title: 'Our Students',
      value: studentCount,
      icon: GraduationCap,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">College Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name || 'College Admin'}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="requests">My Requests</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="pack365">Pack365 Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {overviewStats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-full ${stat.color} text-white`}>
                        <stat.icon className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Service Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {serviceRequests.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No service requests found.</p>
                ) : (
                  <div className="space-y-4">
                    {serviceRequests.slice(0, 5).map((request) => (
                      <div key={request._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{request.institutionName}</h4>
                          <p className="text-sm text-gray-600">{request.serviceDescription}</p>
                          <p className="text-xs text-gray-500">{formatDate(request.createdAt)}</p>
                        </div>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-6 w-6 mr-2" />
                  All Service Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {serviceRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Service Requests</h3>
                    <p className="text-gray-500">Your service requests will appear here when available.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {serviceRequests.map((request) => (
                      <Card key={request._id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                {request.institutionName}
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="space-y-2">
                                  <div className="flex items-center text-gray-600">
                                    <Users className="h-4 w-4 mr-2" />
                                    Contact: {request.contactPerson}
                                  </div>
                                  <div className="flex items-center text-gray-600">
                                    <Mail className="h-4 w-4 mr-2" />
                                    {request.email}
                                  </div>
                                  <div className="flex items-center text-gray-600">
                                    <Phone className="h-4 w-4 mr-2" />
                                    {request.phoneNumber}
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center text-gray-600">
                                    <GraduationCap className="h-4 w-4 mr-2" />
                                    Expected Students: {request.expectedStudents}
                                  </div>
                                  <div className="flex items-center text-gray-600">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Preferred Date: {formatDate(request.preferredDate)}
                                  </div>
                                </div>
                              </div>
                              <div className="mt-4">
                                <p className="text-sm text-gray-700">
                                  <strong>Service Description:</strong> {request.serviceDescription}
                                </p>
                                {request.additionalRequirements && (
                                  <p className="text-sm text-gray-700 mt-2">
                                    <strong>Additional Requirements:</strong> {request.additionalRequirements}
                                  </p>
                                )}
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {request.serviceCategory.map((category, idx) => (
                                  <Badge key={idx} variant="outline">
                                    {category}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="ml-4 text-right">
                              <Badge className={getStatusColor(request.status)}>
                                {request.status}
                              </Badge>
                              <p className="text-xs text-gray-500 mt-2">
                                {formatDate(request.createdAt)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="h-6 w-6 mr-2" />
                  Students from Our Institution ({studentCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <div className="text-center py-12">
                    <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Students Found</h3>
                    <p className="text-gray-500">No students from your institution are registered yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {students.map((student, index) => (
                      <Card key={index} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <GraduationCap className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{student.fullName}</h4>
                              <p className="text-sm text-gray-600">{student.email}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pack365" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-6 w-6 mr-2" />
                  Pack365 Custom Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {streams.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Streams Available</h3>
                    <p className="text-gray-500">Pack365 streams will appear here when available.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {streams.map((stream) => (
                      <Card key={stream._id} className="border hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            {stream.imageUrl && (
                              <div className="w-full h-32 bg-gray-200 rounded-lg overflow-hidden">
                                <img 
                                  src={stream.imageUrl} 
                                  alt={stream.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {stream.name} Stream
                              </h3>
                              <p className="text-2xl font-bold text-blue-600 mb-4">
                                ₹{stream.price}
                              </p>
                              <p className="text-sm text-gray-600 mb-4">
                                {stream.courses?.length || 0} courses available
                              </p>
                              <Button 
                                className="w-full" 
                                onClick={() => {
                                  toast({
                                    title: 'Custom Request',
                                    description: `Request access for ${stream.name} stream. Contact support for custom pricing.`,
                                  });
                                }}
                              >
                                Request Access
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CollegeDashboard;
