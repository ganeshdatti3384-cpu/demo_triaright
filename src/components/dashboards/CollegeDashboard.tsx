
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckboxField } from '@/components/ui/checkbox';
import { Calendar, Users, BookOpen, TrendingUp, Building2, Send, Clock, CheckCircle, XCircle } from 'lucide-react';
import { collegeApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import Navbar from '../Navbar';

interface CollegeDashboardProps {
  user: { role: string; name: string; email: string };
  onLogout: () => void;
}

const CollegeDashboard = ({ user, onLogout }: CollegeDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  const { toast } = useToast();

  // Form state for service request
  const [formData, setFormData] = useState({
    institutionName: '',
    contactPerson: '',
    email: user.email,
    phoneNumber: '',
    expectedStudents: '',
    preferredDate: '',
    additionalRequirements: '',
    serviceDescription: '',
    serviceCategory: [] as string[]
  });

  const serviceCategories = [
    'Workshop',
    'Placement Drive',
    'Training Program',
    'Seminar',
    'Career Guidance',
    'Technical Session',
    'Industry Connect',
    'Other'
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const results = await Promise.allSettled([
        collegeApi.getCollegeStats(token),
        collegeApi.getMyServiceRequests(token)
      ]);

      // Handle stats result
      const statsResult = results[0];
      if (statsResult.status === 'fulfilled' && statsResult.value.success) {
        setStats(statsResult.value.stats);
      } else {
        console.error('Error fetching stats:', statsResult.status === 'rejected' ? statsResult.reason : 'Failed to fetch stats');
      }

      // Handle service requests result
      const requestsResult = results[1];
      if (requestsResult.status === 'fulfilled' && requestsResult.value.success) {
        const allRequests = requestsResult.value.requests;
        // Filter requests by current user's email
        const userRequests = allRequests.filter((request: any) => request.email === user.email);
        setServiceRequests(userRequests);
      } else {
        console.error('Error fetching requests:', requestsResult.status === 'rejected' ? requestsResult.reason : 'Failed to fetch requests');
        setServiceRequests([]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      serviceCategory: checked
        ? [...prev.serviceCategory, category]
        : prev.serviceCategory.filter(cat => cat !== category)
    }));
  };

  const handleSubmitRequest = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Error',
        description: 'Authentication required',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.institutionName || !formData.contactPerson || !formData.phoneNumber || !formData.serviceDescription) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      const response = await collegeApi.createServiceRequest(token, {
        ...formData,
        expectedStudents: parseInt(formData.expectedStudents) || 0,
        email: user.email // Ensure we use the logged-in user's email
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Service request submitted successfully',
        });
        
        // Reset form
        setFormData({
          institutionName: '',
          contactPerson: '',
          email: user.email,
          phoneNumber: '',
          expectedStudents: '',
          preferredDate: '',
          additionalRequirements: '',
          serviceDescription: '',
          serviceCategory: []
        });

        // Refresh data
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit service request',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Accepted':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>;
      case 'Rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">College Dashboard</h1>
          <p className="text-gray-600">Manage your college services and requests</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="request-service">Request Service</TabsTrigger>
            <TabsTrigger value="my-requests">My Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
                  <p className="text-xs text-muted-foreground">Enrolled students</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.activeCourses || 0}</div>
                  <p className="text-xs text-muted-foreground">Running programs</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Service Requests</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{serviceRequests.length}</div>
                  <p className="text-xs text-muted-foreground">Total requests</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Placement Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.placementRate || 0}%</div>
                  <p className="text-xs text-muted-foreground">Success rate</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest updates from your college</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {serviceRequests.slice(0, 3).map((request) => (
                    <div key={request._id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium">{request.serviceDescription}</p>
                        <p className="text-sm text-gray-500">
                          {request.serviceCategory?.join(', ') || 'Service Request'} • {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  ))}
                  {serviceRequests.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No recent activities</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="request-service" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Request College Service</CardTitle>
                <CardDescription>Submit a request for college services like workshops, placement drives, etc.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="institutionName">Institution Name *</Label>
                    <Input
                      id="institutionName"
                      value={formData.institutionName}
                      onChange={(e) => handleInputChange('institutionName', e.target.value)}
                      placeholder="Enter institution name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="contactPerson">Contact Person *</Label>
                    <Input
                      id="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                      placeholder="Enter contact person name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={formData.email}
                      disabled
                      className="bg-gray-100"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="expectedStudents">Expected Students</Label>
                    <Input
                      id="expectedStudents"
                      type="number"
                      value={formData.expectedStudents}
                      onChange={(e) => handleInputChange('expectedStudents', e.target.value)}
                      placeholder="Number of students"
                    />
                  </div>

                  <div>
                    <Label htmlFor="preferredDate">Preferred Date</Label>
                    <Input
                      id="preferredDate"
                      value={formData.preferredDate}
                      onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                      placeholder="DD-MM-YYYY"
                    />
                  </div>
                </div>

                <div>
                  <Label>Service Category</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                    {serviceCategories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <CheckboxField
                          id={category}
                          checked={formData.serviceCategory.includes(category)}
                          onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                        />
                        <Label htmlFor={category} className="text-sm">{category}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="serviceDescription">Service Description *</Label>
                  <Textarea
                    id="serviceDescription"
                    value={formData.serviceDescription}
                    onChange={(e) => handleInputChange('serviceDescription', e.target.value)}
                    placeholder="Describe the service you need..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="additionalRequirements">Additional Requirements</Label>
                  <Textarea
                    id="additionalRequirements"
                    value={formData.additionalRequirements}
                    onChange={(e) => handleInputChange('additionalRequirements', e.target.value)}
                    placeholder="Any additional requirements or notes..."
                    rows={2}
                  />
                </div>

                <Button 
                  onClick={handleSubmitRequest} 
                  disabled={loading}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-requests" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Service Requests</h2>
              <Badge variant="outline">{serviceRequests.length} Total Requests</Badge>
            </div>

            <div className="space-y-4">
              {serviceRequests.map((request) => (
                <Card key={request._id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Building2 className="h-5 w-5 text-blue-600" />
                          <h3 className="font-semibold text-lg">{request.institutionName}</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p><span className="font-medium">Contact:</span> {request.contactPerson}</p>
                            <p><span className="font-medium">Phone:</span> {request.phoneNumber}</p>
                            <p><span className="font-medium">Expected Students:</span> {request.expectedStudents}</p>
                          </div>
                          <div>
                            <p><span className="font-medium">Preferred Date:</span> {request.preferredDate}</p>
                            <p><span className="font-medium">Category:</span> {request.serviceCategory?.join(', ') || 'Not specified'}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="text-sm"><span className="font-medium">Description:</span> {request.serviceDescription}</p>
                          {request.additionalRequirements && (
                            <p className="text-sm"><span className="font-medium">Additional Requirements:</span> {request.additionalRequirements}</p>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          Submitted on: {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {serviceRequests.length === 0 && !loading && (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-gray-500">No service requests found</p>
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

export default CollegeDashboard;
