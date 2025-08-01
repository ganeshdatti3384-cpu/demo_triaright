
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { GraduationCap, Users, BookOpen, LogOut, Send, User, Building, MapPin, Phone, Mail, Globe, Calendar, Monitor, Pill, TrendingUp, UserCheck, Banknote, Edit, Save, X, Sparkles } from 'lucide-react';
import { collegeApi, profileApi, pack365Api } from '@/services/api';
import { College, Pack365Course, StudentProfile } from '@/types/api';
import Navbar from '../Navbar';
import ProfileCompletion from '../ProfileCompletion';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface CollegeDashboardProps {
  user: { role: string; name: string };
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

const streamData = [
  { name: 'IT', icon: Monitor, color: 'bg-blue-500', description: 'Information Technology Courses' },
  { name: 'PHARMA', icon: Pill, color: 'bg-green-500', description: 'Pharmaceutical Courses' },
  { name: 'MARKETING', icon: TrendingUp, color: 'bg-purple-500', description: 'Marketing & Sales Courses' },
  { name: 'HR', icon: UserCheck, color: 'bg-orange-500', description: 'Human Resources Courses' },
  { name: 'FINANCE', icon: Banknote, color: 'bg-emerald-500', description: 'Finance & Accounting Courses' }
];

const CollegeDashboardContent = ({ user, onLogout }: CollegeDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [collegeProfile, setCollegeProfile] = useState<College | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<College>>({});
  const [courses, setCourses] = useState<Pack365Course[]>([]);
  const [selectedStream, setSelectedStream] = useState<string | null>(null);
  const [filteredCourses, setFilteredCourses] = useState<Pack365Course[]>([]);
  const [tabValue, setTabValue] = useState('overview'); // default
  const navigate = useNavigate();
  const [count, setCount] = useState<number | null>(null);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    institutionName: '',
    contactPerson: '',
    email: '',
    phoneNumber: '',
    expectedStudents: '',
    preferredDate: '',
    serviceCategory: '',
    serviceDescription: '',
    additionalRequirements: ''
  });
useEffect(() => {
  const tabFromUrl = 'courses' 
  if (tabFromUrl) setTabValue(tabFromUrl);
}, []);
  useEffect(() => {
    fetchDashboardData();
    fetchCollegeProfile();
    fetchCourses();
  }, []);

 useEffect(() => {
  const fetchCount = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await collegeApi.getStudentCountByInstitution(
        token!,
        editFormData.collegeName
      );
      if (res.success) {
        setCount(res.count);
        setStudents(res.students);
      } else {
        setError(res.message ?? 'Failed to fetch.');
      }
    } catch (err: any) {
      setError(err.message ?? 'Error occurred.');
    } finally {
      setLoading(false);
    }
  };

  fetchCount();
}, []);


  useEffect(() => {
    if (selectedStream && courses.length > 0) {
      const filtered = courses.filter(course => 
        course.stream.toUpperCase() === selectedStream.toUpperCase()
      );
      setFilteredCourses(filtered);
    }
  }, [selectedStream, courses]);

  const fetchCourses = async () => {
    try {
      const response = await pack365Api.getAllCourses();
      if (response.success) {
        setCourses(response.data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);

    try {
      const statsPromise = collegeApi.getDashboardStats(token);
      const requestsPromise = collegeApi.getAllServiceRequests(token);

      const [statsResult, requestsResult] = await Promise.allSettled([statsPromise, requestsPromise]);

      // Handle stats response
      if (statsResult.status === 'fulfilled' && statsResult.value.success) {
        setDashboardStats(statsResult.value.stats || statsResult.value);
      } else {
        console.error('Failed to fetch stats:', statsResult.status === 'rejected' ? statsResult.reason : 'Unknown error');
      }

      // Handle requests response
      if (requestsResult.status === 'fulfilled' && requestsResult.value.success) {
        console.log('Service requests response:', requestsResult.value);
        setRequests(requestsResult.value.requests || []);
      } else {
        console.error('Failed to fetch requests:', requestsResult.status === 'rejected' ? requestsResult.reason : 'Unknown error');
        toast({
          title: 'Error',
          description: 'Failed to load service requests',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCollegeProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setProfileLoading(true);
      const profile = await profileApi.getCollegeProfile(token);
      setCollegeProfile(profile);
      setEditFormData(profile);
    } catch (error) {
      console.error('Error fetching college profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load college profile',
        variant: 'destructive'
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditProfile = () => {
    setEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setEditingProfile(false);
    setEditFormData(collegeProfile || {});
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setProfileLoading(true);
      await profileApi.updateCollegeProfile(token, editFormData);
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      setEditingProfile(false);
      fetchCollegeProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const response = await collegeApi.createServiceRequest(token, {
        institutionName: formData.institutionName,
        contactPerson: formData.contactPerson,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        expectedStudents: parseInt(formData.expectedStudents),
        preferredDate: formData.preferredDate,
        serviceCategory: [formData.serviceCategory],
        serviceDescription: formData.serviceDescription,
        additionalRequirements: formData.additionalRequirements
      });

      if (response.status === 201 || response.success) {

        setFormData({
          institutionName: '',
          contactPerson: '',
          email: '',
          phoneNumber: '',
          expectedStudents: '',
          preferredDate: '',
          serviceCategory: '',
          serviceDescription: '',
          additionalRequirements: ''
        });
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit request',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
          toast({
          title: 'Success',
          description: 'Service request submitted successfully',
        });
    }
  };

  const handleStreamSelect = (streamName: string) => {
    setSelectedStream(streamName);
    setActiveTab('courses');
  };

  const handleBackToStreams = () => {
    setSelectedStream(null);
    setFilteredCourses([]);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm shadow-lg">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="courses">Pack 365</TabsTrigger>
              <TabsTrigger value="requests">My Requests</TabsTrigger>
              <TabsTrigger value="custom">Custom Request</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
                    <Send className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{requests.filter(r => r.status === 'Pending').length}</div>
                    <p className="text-xs text-muted-foreground">Pending approval</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{count || 0 } </div>
                    <p className="text-xs text-muted-foreground">From your requests</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Accepted Requests</CardTitle>
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{requests.filter(r => r.status === 'Accepted').length}</div>
                    <p className="text-xs text-muted-foreground">This academic year</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{requests.length}</div>
                    <p className="text-xs text-muted-foreground">All time</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Service Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {requests.slice(0, 3).map((request) => (
                      <div key={request._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{request.serviceCategory?.join(', ') || 'Service Request'}</p>
                          <p className="text-sm text-gray-500">Requested on {new Date(request.createdAt).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-500">{request.expectedStudents} students</p>
                          <p className="text-sm text-gray-500">Institution: {request.institutionName}</p>
                        </div>
                        <Badge
                          variant={request.status === 'Accepted' ? 'default' :
                            request.status === 'Rejected' ? 'destructive' : 'outline'}
                        >
                          {request.status}
                        </Badge>
                      </div>
                    ))}
                    {requests.length === 0 && (
                      <p className="text-center text-gray-500 py-8">No service requests found</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="courses" className="space-y-6">
              {!selectedStream ? (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Course Bundles</h2>
                    <p className="text-sm text-gray-600">Select a Bundle to view courses</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {streamData.map((stream) => {
                      const IconComponent = stream.icon;
                      const streamCourseCount = courses.filter(course => course.stream.toUpperCase() === stream.name.toUpperCase()
                      ).length;

                      return (
                        <Card
                          key={stream.name}
                          className="hover:shadow-lg transition-shadow cursor-pointer transform hover:scale-105"
                          onClick={() => handleStreamSelect(stream.name)}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                              <div className={`${stream.color} p-3 rounded-lg text-white`}>
                                <IconComponent className="h-6 w-6" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold">{stream.name}</h3>
                                <p className="text-sm text-gray-600">{stream.description}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                  {streamCourseCount} course{streamCourseCount !== 1 ? 's' : ''} available
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <Button variant="outline" onClick={handleBackToStreams}>
                        ← Back to Streams
                      </Button>
                      <h2 className="text-2xl font-bold">{selectedStream} Courses</h2>
                    </div>
                    <Badge variant="outline">
                      {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    {filteredCourses.map((course) => (
                      <Card key={course._id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold mb-2">{course.courseName}</h3>
                              <p className="text-gray-600 mb-3">{course.description}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>Duration: {course.totalDuration} hours</span>
                                <span>Topics: {course.topics?.length || 0}</span>
                                <Badge variant="secondary">{course.stream.toUpperCase()}</Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-green-600">₹{course.price}</p>
                              <Button className="mt-2"  onClick={() => setActiveTab("custom")}>
                                Request Access
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {filteredCourses.length === 0 && (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <p className="text-gray-500">No courses available for {selectedStream} stream</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="requests" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">My Service Requests</h2>
                <Badge variant="outline">
                  {requests.length} Total Requests
                </Badge>
              </div>

              <div className="space-y-4">
                {requests.map((request) => (
                  <Card key={request._id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{request.serviceCategory?.join(', ') || 'Service Request'}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <p><span className="font-medium">Institution:</span> {request.institutionName}</p>
                              <p><span className="font-medium">Contact Person:</span> {request.contactPerson}</p>
                              <p><span className="font-medium">Email:</span> {request.email}</p>
                              <p><span className="font-medium">Phone:</span> {request.phoneNumber}</p>
                            </div>
                            <div>
                              <p><span className="font-medium">Expected Students:</span> {request.expectedStudents}</p>
                              <p><span className="font-medium">Preferred Date:</span> {new Date(request.preferredDate).toLocaleDateString()}</p>
                              <p><span className="font-medium">Requested On:</span> {new Date(request.createdAt).toLocaleDateString()}</p>
                              <p><span className="font-medium">Request ID:</span> {request.requestedBy}</p>
                            </div>
                          </div>
                          <div className="mt-3">
                            <p className="text-sm"><span className="font-medium">Description:</span> {request.serviceDescription}</p>
                            {request.additionalRequirements && (
                              <p className="text-sm mt-2"><span className="font-medium">Additional Requirements:</span> {request.additionalRequirements}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={request.status === 'Accepted' ? 'default' :
                              request.status === 'Rejected' ? 'destructive' : 'outline'}
                          >
                            {request.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {requests.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No service requests found</p>
                    <p className="text-gray-400 text-sm mt-2">Submit your first request using the Custom Request tab</p>
                  </div>
                )}
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
                  <form onSubmit={handleSubmitRequest} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Institution Name</label>
                        <Input
                          name="institutionName"
                          value={formData.institutionName}
                          onChange={handleInputChange}
                          placeholder="Your institution name"
                          required />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Contact Person</label>
                        <Input
                          name="contactPerson"
                          value={formData.contactPerson}
                          onChange={handleInputChange}
                          placeholder="Your name"
                          required />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="contact@institution.edu"
                          required />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Phone Number</label>
                        <Input
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          placeholder="Contact number"
                          required />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Expected Students</label>
                        <Input
                          name="expectedStudents"
                          type="number"
                          value={formData.expectedStudents}
                          onChange={handleInputChange}
                          placeholder="Number of students"
                          required />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Preferred Date</label>
                        <Input
                          name="preferredDate"
                          type="date"
                          value={formData.preferredDate}
                          onChange={handleInputChange}
                          required />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Service Category</label>
                      <select
                        name="serviceCategory"
                        value={formData.serviceCategory}
                        onChange={handleInputChange}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                        required
                      >
                        <option value="">Select a category</option>
                        <option value="Training Program">Training Program</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Placement Drive">Placement Drive</option>
                        <option value="Seminar/Webinar">Seminar/Webinar</option>
                        <option value="Academic Projects">Academic Projects</option>
                        <option value="Faculty Development">Faculty Development</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Service Description</label>
                      <Textarea
                        name="serviceDescription"
                        value={formData.serviceDescription}
                        onChange={handleInputChange}
                        placeholder="Please describe your requirements in detail..."
                        className="mt-1 h-32"
                        required />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Additional Requirements</label>
                      <Textarea
                        name="additionalRequirements"
                        value={formData.additionalRequirements}
                        onChange={handleInputChange}
                        placeholder="Any specific requirements or constraints..."
                        className="mt-1 h-24" 
                        required />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      <Send className="h-4 w-4 mr-2" />
                      {loading ? 'Submitting...' : 'Submit Request'}

                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  College Profile
                </h2>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-gradient-to-r from-blue-100 to-purple-100">
                    Institution Details
                  </Badge>
                  {!editingProfile ? (
                    <Button 
                      onClick={handleEditProfile}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transform hover:scale-105 transition-all duration-300"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleSaveProfile}
                        disabled={profileLoading}
                        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg transform hover:scale-105 transition-all duration-300"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {profileLoading ? 'Saving...' : 'Save'}
                      </Button>
                      <Button 
                        onClick={handleCancelEdit}
                        variant="outline"
                        className="shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {profileLoading ? (
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 shadow-2xl">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="ml-3 text-blue-600">Loading profile...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : collegeProfile ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-gradient-to-br from-blue-50/50 to-white shadow-2xl transform hover:scale-[1.02] transition-all duration-300 border-0">
                    <CardHeader className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-sm">
                      <CardTitle className="flex items-center gap-3 text-blue-800">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg">
                          <Building className="h-5 w-5 text-white" />
                        </div>
                        Basic Information
                        <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">College Name</Label>
                        {editingProfile ? (
                          <Input
                            name="collegeName"
                            value={editFormData.collegeName || ''}
                            onChange={handleEditFormChange}
                            className="mt-1"
                          />
                        ) : (
                          <p className="text-lg font-semibold text-blue-800">{collegeProfile.collegeName || 'Not specified'}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">University</Label>
                        {editingProfile ? (
                          <Input
                            name="university"
                            value={editFormData.university || ''}
                            onChange={handleEditFormChange}
                            className="mt-1"
                          />
                        ) : (
                          <p className="text-base">{collegeProfile.university || 'Not specified'}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">College Code</Label>
                        {editingProfile ? (
                          <Input
                            name="collegeCode"
                            value={editFormData.collegeCode || ''}
                            onChange={handleEditFormChange}
                            className="mt-1"
                          />
                        ) : (
                          <p className="text-base font-mono bg-gray-100 px-2 py-1 rounded">{collegeProfile.collegeCode || 'Not specified'}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Established Year
                        </Label>
                        {editingProfile ? (
                          <Input
                            name="establishedYear"
                            type="number"
                            value={editFormData.establishedYear || ''}
                            onChange={handleEditFormChange}
                            className="mt-1"
                          />
                        ) : (
                          <p className="text-base">{collegeProfile.establishedYear || 'Not specified'}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Accreditation</Label>
                        {editingProfile ? (
                          <Input
                            name="accreditation"
                            value={editFormData.accreditation || ''}
                            onChange={handleEditFormChange}
                            className="mt-1"
                          />
                        ) : (
                          <p className="text-base">{collegeProfile.accreditation || 'Not specified'}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50/50 to-white shadow-2xl transform hover:scale-[1.02] transition-all duration-300 border-0">
                    <CardHeader className="bg-gradient-to-r from-green-600/10 to-blue-600/10 backdrop-blur-sm">
                      <CardTitle className="flex items-center gap-3 text-green-800">
                        <div className="bg-gradient-to-r from-green-500 to-blue-600 p-2 rounded-lg shadow-lg">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        Principal Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Principal Name</Label>
                        {editingProfile ? (
                          <Input
                            name="principalName"
                            value={editFormData.principalName || ''}
                            onChange={handleEditFormChange}
                            className="mt-1"
                          />
                        ) : (
                          <p className="text-base">{collegeProfile.principalName || 'Not specified'}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          Principal Email
                        </Label>
                        {editingProfile ? (
                          <Input
                            name="principalEmail"
                            type="email"
                            value={editFormData.principalEmail || ''}
                            onChange={handleEditFormChange}
                            className="mt-1"
                          />
                        ) : (
                          <p className="text-base">{collegeProfile.principalEmail || 'Not specified'}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          Principal Phone
                        </Label>
                        {editingProfile ? (
                          <Input
                            name="principalPhone"
                            value={editFormData.principalPhone || ''}
                            onChange={handleEditFormChange}
                            className="mt-1"
                          />
                        ) : (
                          <p className="text-base">{collegeProfile.principalPhone || 'Not specified'}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50/50 to-white shadow-2xl transform hover:scale-[1.02] transition-all duration-300 border-0">
                    <CardHeader className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 backdrop-blur-sm">
                      <CardTitle className="flex items-center gap-3 text-purple-800">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-2 rounded-lg shadow-lg">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        Coordinator Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Coordinator Name</Label>
                        {editingProfile ? (
                          <Input
                            name="coordinatorName"
                            value={editFormData.coordinatorName || ''}
                            onChange={handleEditFormChange}
                            className="mt-1"
                          />
                        ) : (
                          <p className="text-base">{collegeProfile.coordinatorName || 'Not specified'}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          Coordinator Email
                        </Label>
                        {editingProfile ? (
                          <Input
                            name="coordinatorEmail"
                            type="email"
                            value={editFormData.coordinatorEmail || ''}
                            onChange={handleEditFormChange}
                            className="mt-1"
                          />
                        ) : (
                          <p className="text-base">{collegeProfile.coordinatorEmail || 'Not specified'}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          Coordinator Phone
                        </Label>
                        {editingProfile ? (
                          <Input
                            name="coordinatorPhone"
                            value={editFormData.coordinatorPhone || ''}
                            onChange={handleEditFormChange}
                            className="mt-1"
                          />
                        ) : (
                          <p className="text-base">{collegeProfile.coordinatorPhone || 'Not specified'}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-50/50 to-white shadow-2xl transform hover:scale-[1.02] transition-all duration-300 border-0">
                    <CardHeader className="bg-gradient-to-r from-orange-600/10 to-red-600/10 backdrop-blur-sm">
                      <CardTitle className="flex items-center gap-3 text-orange-800">
                        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-2 rounded-lg shadow-lg">
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                      <div>
                        <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          Email
                        </Label>
                        {editingProfile ? (
                          <Input
                            name="email"
                            type="email"
                            value={editFormData.email || ''}
                            onChange={handleEditFormChange}
                            className="mt-1"
                          />
                        ) : (
                          <p className="text-base">{collegeProfile.email || 'Not specified'}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          Phone
                        </Label>
                        {editingProfile ? (
                          <Input
                            name="phone"
                            value={editFormData.phone || ''}
                            onChange={handleEditFormChange}
                            className="mt-1"
                          />
                        ) : (
                          <p className="text-base">{collegeProfile.phone || 'Not specified'}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                          <Globe className="h-4 w-4" />
                          Website
                        </Label>
                        {editingProfile ? (
                          <Input
                            name="website"
                            value={editFormData.website || ''}
                            onChange={handleEditFormChange}
                            className="mt-1"
                          />
                        ) : (
                          <p className="text-base">{collegeProfile.website || 'Not specified'}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Address</Label>
                        {editingProfile ? (
                          <Textarea
                            name="address"
                            value={editFormData.address || ''}
                            onChange={handleEditFormChange}
                            className="mt-1"
                          />
                        ) : (
                          <div>
                            <p className="text-base">{collegeProfile.address || 'Not specified'}</p>
                            {collegeProfile.city && (
                              <p className="text-sm text-gray-500 mt-1">
                                {collegeProfile.city}, {collegeProfile.state} - {collegeProfile.pincode}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      {editingProfile && (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-sm font-medium text-gray-600">City</Label>
                              <Input
                                name="city"
                                value={editFormData.city || ''}
                                onChange={handleEditFormChange}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-600">State</Label>
                              <Input
                                name="state"
                                value={editFormData.state || ''}
                                onChange={handleEditFormChange}
                                className="mt-1"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Pincode</Label>
                            <Input
                              name="pincode"
                              value={editFormData.pincode || ''}
                              onChange={handleEditFormChange}
                              className="mt-1"
                            />
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="bg-gradient-to-r from-gray-50 to-blue-50 shadow-2xl">
                  <CardContent className="pt-6">
                    <p className="text-center text-gray-500 py-8">No profile data available</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

const CollegeDashboard = ({ user, onLogout }: CollegeDashboardProps) => {
  return (
    <ProfileCompletion userRole={user?.role}>
      <CollegeDashboardContent user={user} onLogout={onLogout} />
    </ProfileCompletion>
  );
};

export default CollegeDashboard;
