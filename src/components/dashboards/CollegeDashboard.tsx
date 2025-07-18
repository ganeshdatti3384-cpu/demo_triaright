/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckboxField } from '@/components/ui/CheckboxField';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays, Users, Building, CheckCircle, Clock, XCircle } from 'lucide-react';
import { collegeApi } from '@/services/api';

interface CollegeStats {
  totalColleges: number;
  activeColleges: number;
  pendingRequests: number;
  resolvedRequests: number;
}

interface ServiceRequest {
  _id: string;
  institutionName: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  expectedStudents: number;
  preferredDate: string;
  additionalRequirements: string;
  serviceDescription: string;
  serviceCategory: string[];
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

const CollegeDashboard = () => {
  const [stats, setStats] = useState<CollegeStats | null>(null);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestData, setRequestData] = useState({
    institutionName: '',
    contactPerson: '',
    email: '',
    phoneNumber: '',
    expectedStudents: 0,
    preferredDate: '',
    additionalRequirements: '',
    serviceDescription: '',
    serviceCategory: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const serviceCategories = [
    'Career Counseling',
    'Skill Development Workshops',
    'Placement Assistance',
    'Industry Expert Sessions',
    'Mock Interviews',
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const statsResponse = await collegeApi.getCollegeStats(token);
      setStats(statsResponse.data);

      const requestsResponse = await collegeApi.getMyServiceRequests(token);
      setServiceRequests(requestsResponse.data);

    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      setError(error.message || 'Failed to load data');
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRequestData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    setRequestData(prevData => {
      let updatedCategories = [...prevData.serviceCategory];
      if (checked) {
        updatedCategories.push(category);
      } else {
        updatedCategories = updatedCategories.filter(c => c !== category);
      }
      return { ...prevData, serviceCategory: updatedCategories };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      await collegeApi.createServiceRequest(token, {
        ...requestData,
        expectedStudents: Number(requestData.expectedStudents),
      });

      toast({
        title: "Success",
        description: "Service request created successfully!",
      });

      setShowForm(false);
      loadDashboardData();
      setRequestData({
        institutionName: '',
        contactPerson: '',
        email: '',
        phoneNumber: '',
        expectedStudents: 0,
        preferredDate: '',
        additionalRequirements: '',
        serviceDescription: '',
        serviceCategory: [],
      });
    } catch (error: any) {
      console.error('Error creating service request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create service request.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Error: {error}</h2>
          <Button onClick={loadDashboardData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">College Dashboard</h1>

        {/* College Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><Building className="h-4 w-4 mr-2" /> Total Colleges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalColleges || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><CheckCircle className="h-4 w-4 mr-2" /> Active Colleges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.activeColleges || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><Clock className="h-4 w-4 mr-2" /> Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.pendingRequests || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><XCircle className="h-4 w-4 mr-2" /> Resolved Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.resolvedRequests || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Service Request Form */}
        {!showForm ? (
          <div className="text-right mb-6">
            <Button onClick={() => setShowForm(true)}>Create Service Request</Button>
          </div>
        ) : (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Service Request</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div>
                  <Label htmlFor="institutionName">Institution Name</Label>
                  <Input
                    type="text"
                    id="institutionName"
                    name="institutionName"
                    value={requestData.institutionName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    type="text"
                    id="contactPerson"
                    name="contactPerson"
                    value={requestData.contactPerson}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={requestData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={requestData.phoneNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="expectedStudents">Expected Number of Students</Label>
                  <Input
                    type="number"
                    id="expectedStudents"
                    name="expectedStudents"
                    value={requestData.expectedStudents}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="preferredDate">Preferred Date</Label>
                  <Input
                    type="date"
                    id="preferredDate"
                    name="preferredDate"
                    value={requestData.preferredDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="serviceDescription">Service Description</Label>
                  <Textarea
                    id="serviceDescription"
                    name="serviceDescription"
                    value={requestData.serviceDescription}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label>Service Category</Label>
                  <div className="flex flex-wrap gap-2">
                    {serviceCategories.map((category) => (
                      <CheckboxField
                        key={category}
                        id={category}
                        label={category}
                        checked={requestData.serviceCategory.includes(category)}
                        onChange={(checked) => handleCategoryChange(category, checked)}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="additionalRequirements">Additional Requirements</Label>
                  <Textarea
                    id="additionalRequirements"
                    name="additionalRequirements"
                    value={requestData.additionalRequirements}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex justify-between">
                  <Button variant="ghost" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      'Submit Request'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Service Requests List */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Service Requests</h2>
          {serviceRequests.length === 0 ? (
            <div className="text-gray-500 italic">No service requests found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {serviceRequests.map((request) => (
                <Card key={request._id}>
                  <CardHeader>
                    <CardTitle>{request.institutionName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p>
                      <span className="font-semibold">Contact:</span> {request.contactPerson}
                    </p>
                    <p>
                      <span className="font-semibold">Email:</span> {request.email}
                    </p>
                    <p>
                      <span className="font-semibold">Phone:</span> {request.phoneNumber}
                    </p>
                    <p>
                      <span className="font-semibold">Expected Students:</span> {request.expectedStudents}
                    </p>
                    <p>
                      <span className="font-semibold">Preferred Date:</span> {new Date(request.preferredDate).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-semibold">Description:</span> {request.serviceDescription}
                    </p>
                    <p>
                      <span className="font-semibold">Categories:</span> {request.serviceCategory.join(', ')}
                    </p>
                    <Badge variant="secondary">{request.status}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollegeDashboard;
