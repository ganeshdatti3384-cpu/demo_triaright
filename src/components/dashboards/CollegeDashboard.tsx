import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { GraduationCap, Users, BookOpen, LogOut, Send, User, Building, MapPin, Phone, Mail, Globe, Calendar, Monitor, Pill, TrendingUp, UserCheck, Banknote } from 'lucide-react';
import { collegeApi, profileApi, pack365Api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { College, Pack365Course } from '@/types/api';

interface CollegeDashboardProps {
  user: { role: string; name: string };
  onLogout: () => void;
}

const streamData = [
  { name: 'IT', icon: Monitor, color: 'bg-blue-500', description: 'Information Technology Courses' },
  { name: 'PHARMA', icon: Pill, color: 'bg-green-500', description: 'Pharmaceutical Courses' },
  { name: 'MARKETING', icon: TrendingUp, color: 'bg-purple-500', description: 'Marketing & Sales Courses' },
  { name: 'HR', icon: UserCheck, color: 'bg-orange-500', description: 'Human Resources Courses' },
  { name: 'FINANCE', icon: Banknote, color: 'bg-emerald-500', description: 'Finance & Accounting Courses' }
];

const CollegeDashboard = ({ user, onLogout }: CollegeDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [collegeProfile, setCollegeProfile] = useState<College | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [courses, setCourses] = useState<Pack365Course[]>([]);
  const [selectedStream, setSelectedStream] = useState<string | null>(null);
  const [filteredCourses, setFilteredCourses] = useState<Pack365Course[]>([]);
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
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
    fetchCollegeProfile();
    fetchCourses();
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
    const requestsPromise = collegeApi.getMyServiceRequests(token);

    const [statsResult, requestsResult] = await Promise.allSettled([statsPromise, requestsPromise]);

    // Handle stats response
    if (statsResult.status === 'fulfilled' && statsResult.value.success) {
      setDashboardStats(statsResult.value.stats);
    } else {
      console.error('Failed to fetch stats:', statsResult.reason || statsResult);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard stats',
        variant: 'destructive'
      });
    }

    // Handle requests response
    if (requestsResult.status === 'fulfilled' && requestsResult.value.success) {
      setRequests(requestsResult.value.requests);
    } else {
      console.error('Failed to fetch requests:', requestsResult.reason || requestsResult);
      toast({
        title: 'Error',
        description: 'Failed to load college requests',
        variant: 'destructive'
      });
    }
  } catch (error) {
    // Shouldn't usually reach here unless something very unexpected happens
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

  const handleProfileUpdate = async (updatedProfile: Partial<College>) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setProfileLoading(true);
      await profileApi.updateCollegeProfile(token, updatedProfile);
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
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

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Service request submitted successfully',
        });
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
    }
  };

  const handleStreamSelect = (streamName: string) => {
    setSelectedStream(streamName);
    setActiveTab('courses'); // Switch to courses tab when stream is selected
  };

  const handleBackToStreams = () => {
    setSelectedStream(null);
    setFilteredCourses([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/93e33449-ffbe-4c83-9fcf-6012873a863c.png" 
                alt="TriaRight" 
                className="h-8 w-auto"
              />
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome</span>
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
            <TabsTrigger value="courses">Courses</TabsTrigger>
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
                  <div className="text-2xl font-bold">{dashboardStats?.pending || 0}</div>
                  <p className="text-xs text-muted-foreground">Pending approval</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats?.totalStudents || 0}</div>
                  <p className="text-xs text-muted-foreground">From your institution</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Accepted Requests</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats?.accepted || 0}</div>
                  <p className="text-xs text-muted-foreground">This academic year</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats?.totalRequests || 0}</div>
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
                        <p className="font-medium">{request.serviceCategory}</p>
                        <p className="text-sm text-gray-500">Requested on {new Date(request.createdAt).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-500">{request.expectedStudents} students</p>
                      </div>
                      <Badge
                        variant={
                          request.status === 'Accepted' ? 'default' :
                          request.status === 'Rejected' ? 'destructive' : 'outline'
                        }
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
                  <h2 className="text-2xl font-bold">Course Streams</h2>
                  <p className="text-sm text-gray-600">Select a stream to view courses</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {streamData.map((stream) => {
                    const IconComponent = stream.icon;
                    const streamCourseCount = courses.filter(course => 
                      course.stream.toUpperCase() === stream.name.toUpperCase()
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
                            <Button className="mt-2">
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
                {collegeProfile ? requests.filter(request => request.email === collegeProfile.email).length : requests.length} Total Requests
              </Badge>
            </div>

            <div className="space-y-4">
              {collegeProfile ? (
                requests
                  .filter(request => request.email === collegeProfile.email)
                  .map((request) => (
                    <Card key={request._id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{request.serviceCategory?.join(', ') || request.serviceDescription}</h3>
                            <p className="text-gray-600">Requested on: {new Date(request.createdAt).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-500">Expected students: {request.expectedStudents}</p>
                            <p className="text-sm text-gray-500">Contact: {request.contactPerson}</p>
                            <p className="text-sm text-gray-500">Preferred Date: {request.preferredDate}</p>
                            <p className="text-sm text-gray-500">Institution: {request.institutionName}</p>
                            {request.additionalRequirements && (
                              <p className="text-sm text-gray-500">Additional: {request.additionalRequirements}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                request.status === 'Accepted' ? 'default' :
                                request.status === 'Rejected' ? 'destructive' : 'outline'
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
                  ))
              ) : (
                <p className="text-center text-gray-500 py-8">Loading profile...</p>
              )}
              {collegeProfile && requests.filter(request => request.email === collegeProfile.email).length === 0 && (
                <p className="text-center text-gray-500 py-8">No service requests found for your email</p>
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
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Contact Person</label>
                      <Input 
                        name="contactPerson"
                        value={formData.contactPerson}
                        onChange={handleInputChange}
                        placeholder="Your name" 
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input 
                        name="email"
                        type="email" 
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="contact@institution.edu" 
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone Number</label>
                      <Input 
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="Contact number" 
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Expected Students</label>
                      <Input 
                        name="expectedStudents"
                        type="number" 
                        value={formData.expectedStudents}
                        onChange={handleInputChange}
                        placeholder="Number of students" 
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Preferred Date</label>
                      <Input 
                        name="preferredDate"
                        type="date" 
                        value={formData.preferredDate}
                        onChange={handleInputChange}
                        required
                      />
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
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Additional Requirements</label>
                    <Textarea
                      name="additionalRequirements"
                      value={formData.additionalRequirements}
                      onChange={handleInputChange}
                      placeholder="Any specific requirements or constraints..."
                      className="mt-1 h-24"
                    />
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
              <h2 className="text-2xl font-bold">College Profile</h2>
              <Badge variant="outline">Institution Details</Badge>
            </div>

            {profileLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">Loading profile...</p>
                </CardContent>
              </Card>
            ) : collegeProfile ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">College Name</Label>
                      <p className="text-lg font-semibold">{collegeProfile.collegeName || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">University</Label>
                      <p className="text-base">{collegeProfile.university || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">College Code</Label>
                      <p className="text-base font-mono">{collegeProfile.collegeCode || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Established Year</Label>
                      <p className="text-base">{collegeProfile.establishedYear || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Accreditation</Label>
                      <p className="text-base">{collegeProfile.accreditation || 'Not specified'}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Principal Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Principal Name</Label>
                      <p className="text-base">{collegeProfile.principalName || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        Principal Email
                      </Label>
                      <p className="text-base">{collegeProfile.principalEmail || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        Principal Phone
                      </Label>
                      <p className="text-base">{collegeProfile.principalPhone || 'Not specified'}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Coordinator Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Coordinator Name</Label>
                      <p className="text-base">{collegeProfile.coordinatorName || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        Coordinator Email
                      </Label>
                      <p className="text-base">{collegeProfile.coordinatorEmail || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        Coordinator Phone
                      </Label>
                      <p className="text-base">{collegeProfile.coordinatorPhone || 'Not specified'}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                      <p className="text-base">{collegeProfile.email || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        Phone
                      </Label>
                      <p className="text-base">{collegeProfile.phone || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                        <Globe className="h-4 w-4" />
                        Website
                      </Label>
                      <p className="text-base">{collegeProfile.website || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Address</Label>
                      <p className="text-base">{collegeProfile.address || 'Not specified'}</p>
                      {collegeProfile.city && (
                        <p className="text-sm text-gray-500">
                          {collegeProfile.city}, {collegeProfile.state} - {collegeProfile.pincode}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">No profile data available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CollegeDashboard;