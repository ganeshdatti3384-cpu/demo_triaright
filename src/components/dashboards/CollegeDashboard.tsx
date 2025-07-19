
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { profileApi, pack365Api, collegeApi } from '@/services/api';
import { Building2, Users, Calendar, TrendingUp, Plus, FileText, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface CollegeDashboardProps {
  user: any;
  onLogout: () => void;
}

const CollegeDashboard: React.FC<CollegeDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const { toast } = useToast();

  // Service request form state
  const [serviceRequest, setServiceRequest] = useState({
    institutionName: '',
    contactPerson: '',
    email: user?.email || '',
    phoneNumber: '',
    expectedStudents: '',
    preferredDate: '',
    serviceCategory: [] as string[],
    serviceDescription: '',
    additionalRequirements: ''
  });

  const serviceCategories = [
    'Campus Recruitment Drive',
    'Industry Training Programs',
    'Placement Assistance',
    'Skill Development Workshops',
    'Career Guidance Sessions',
    'Mock Interview Sessions',
    'Resume Building Workshops',
    'Industry Expert Sessions'
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      const [statsResult, requestsResult] = await Promise.allSettled([
        collegeApi.getDashboardStats(token),
        collegeApi.getMyServiceRequests(token)
      ]);

      if (statsResult.status === 'fulfilled') {
        setStats(statsResult.value.stats || statsResult.value.data);
      } else {
        console.error('Failed to fetch stats:', (statsResult as PromiseRejectedResult).reason);
      }

      if (requestsResult.status === 'fulfilled') {
        setRequests(requestsResult.value.data || []);
      } else {
        console.error('Failed to fetch requests:', (requestsResult as PromiseRejectedResult).reason);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceCategoryChange = (category: string, checked: boolean) => {
    setServiceRequest(prev => ({
      ...prev,
      serviceCategory: checked 
        ? [...prev.serviceCategory, category]
        : prev.serviceCategory.filter(c => c !== category)
    }));
  };

  const handleServiceRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      await collegeApi.createServiceRequest(token, {
        ...serviceRequest,
        expectedStudents: parseInt(serviceRequest.expectedStudents) || 0
      });

      toast({
        title: 'Success',
        description: 'Service request submitted successfully!'
      });

      setShowServiceForm(false);
      setServiceRequest({
        institutionName: '',
        contactPerson: '',
        email: user?.email || '',
        phoneNumber: '',
        expectedStudents: '',
        preferredDate: '',
        serviceCategory: [],
        serviceDescription: '',
        additionalRequirements: ''
      });

      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit service request',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'accepted': return <CheckCircle2 className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">College Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome back, {user?.firstName} {user?.lastName}
              </p>
            </div>
            <Button onClick={onLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'overview', label: 'Overview', icon: TrendingUp },
              { key: 'services', label: 'Service Requests', icon: FileText },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Building2 className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Requests</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {stats?.totalRequests || requests.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Accepted</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {stats?.acceptedRequests || requests.filter(r => r.status === 'accepted').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Pending</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {stats?.pendingRequests || requests.filter(r => r.status === 'pending').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Students Served</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {stats?.studentsServed || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Service Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? (
                  <div className="text-center py-6">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No service requests found</p>
                    <Button 
                      onClick={() => setActiveTab('services')} 
                      className="mt-4"
                    >
                      Create Your First Request
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.slice(0, 5).map((request) => (
                      <div key={request._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{request.institutionName}</h4>
                          <p className="text-sm text-gray-600">{request.serviceDescription}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Expected Students: {request.expectedStudents}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(request.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(request.status)}
                              <span className="capitalize">{request.status}</span>
                            </div>
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-6">
            {/* Service Requests Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Service Requests</h2>
              <Button onClick={() => setShowServiceForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </div>

            {/* Service Request Form Modal */}
            {showServiceForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Create Service Request</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleServiceRequestSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="institutionName">Institution Name</Label>
                        <Input
                          id="institutionName"
                          value={serviceRequest.institutionName}
                          onChange={(e) => setServiceRequest(prev => ({ ...prev, institutionName: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="contactPerson">Contact Person</Label>
                        <Input
                          id="contactPerson"
                          value={serviceRequest.contactPerson}
                          onChange={(e) => setServiceRequest(prev => ({ ...prev, contactPerson: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={serviceRequest.email}
                          onChange={(e) => setServiceRequest(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                          id="phoneNumber"
                          value={serviceRequest.phoneNumber}
                          onChange={(e) => setServiceRequest(prev => ({ ...prev, phoneNumber: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="expectedStudents">Expected Students</Label>
                        <Input
                          id="expectedStudents"
                          type="number"
                          value={serviceRequest.expectedStudents}
                          onChange={(e) => setServiceRequest(prev => ({ ...prev, expectedStudents: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="preferredDate">Preferred Date</Label>
                        <Input
                          id="preferredDate"
                          type="date"
                          value={serviceRequest.preferredDate}
                          onChange={(e) => setServiceRequest(prev => ({ ...prev, preferredDate: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Service Categories</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                        {serviceCategories.map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox
                              id={category}
                              checked={serviceRequest.serviceCategory.includes(category)}
                              onCheckedChange={(checked) => handleServiceCategoryChange(category, checked as boolean)}
                            />
                            <Label htmlFor={category} className="text-sm">{category}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="serviceDescription">Service Description</Label>
                      <Textarea
                        id="serviceDescription"
                        value={serviceRequest.serviceDescription}
                        onChange={(e) => setServiceRequest(prev => ({ ...prev, serviceDescription: e.target.value }))}
                        required
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="additionalRequirements">Additional Requirements (Optional)</Label>
                      <Textarea
                        id="additionalRequirements"
                        value={serviceRequest.additionalRequirements}
                        onChange={(e) => setServiceRequest(prev => ({ ...prev, additionalRequirements: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    <div className="flex space-x-4">
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Request'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowServiceForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Service Requests List */}
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request._id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold">{request.institutionName}</h3>
                          <Badge className={getStatusColor(request.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(request.status)}
                              <span className="capitalize">{request.status}</span>
                            </div>
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-500">Contact Person:</span>
                            <p>{request.contactPerson}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500">Expected Students:</span>
                            <p>{request.expectedStudents}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500">Preferred Date:</span>
                            <p>{new Date(request.preferredDate).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <span className="font-medium text-gray-500">Service Categories:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {request.serviceCategory.map((category: string, index: number) => (
                              <Badge key={index} variant="outline">{category}</Badge>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4">
                          <span className="font-medium text-gray-500">Description:</span>
                          <p className="text-gray-700 mt-1">{request.serviceDescription}</p>
                        </div>

                        {request.additionalRequirements && (
                          <div className="mt-4">
                            <span className="font-medium text-gray-500">Additional Requirements:</span>
                            <p className="text-gray-700 mt-1">{request.additionalRequirements}</p>
                          </div>
                        )}
                      </div>

                      <div className="text-right text-sm text-gray-500">
                        <p>Created: {new Date(request.createdAt).toLocaleDateString()}</p>
                        {request.updatedAt !== request.createdAt && (
                          <p>Updated: {new Date(request.updatedAt).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollegeDashboard;
