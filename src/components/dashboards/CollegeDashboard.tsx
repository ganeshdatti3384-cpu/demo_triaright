import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, GraduationCap, Users, UserPlus, FileText, Settings } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useToast } from '@/hooks/use-toast';
import { collegeApi } from '@/services/api';

interface CollegeDashboardProps {
  user: {
    role: string;
    name: string;
  };
  onLogout: () => void;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  institutionName: string;
}

const CollegeDashboard = ({ user, onLogout }: CollegeDashboardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tabValue, setTabValue] = useState('overview');
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [formData, setFormData] = useState({
    institutionName: localStorage.getItem('institutionName') || '',
    contactPersonName: localStorage.getItem('contactPersonName') || '',
    contactPersonEmail: localStorage.getItem('contactPersonEmail') || '',
    contactPersonPhone: localStorage.getItem('contactPersonPhone') || '',
    address: localStorage.getItem('address') || '',
    description: localStorage.getItem('description') || '',
    coursesOffered: localStorage.getItem('coursesOffered') || '',
    studentCount: 0,
  });
  const [studentCount, setStudentCount] = useState(0);
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const token = localStorage.getItem('token');
        const institutionName = formData.institutionName || 'Default Institution';
        
        if (token && institutionName) {
          const response = await collegeApi.getStudentCountByInstitution(institutionName, token);
          
          if (response.success) {
            setStudentCount(response.count);
            setStudentsList(response.students || []);
          }
        }
      } catch (error) {
        console.error('Error fetching student count:', error);
      }
    };

    fetchCount();
  }, [formData.institutionName]);

  useEffect(() => {
    const checkProfileCompletion = () => {
      const requiredFields = [
        'institutionName',
        'contactPersonName',
        'contactPersonEmail',
        'contactPersonPhone',
        'address',
        'description',
        'coursesOffered',
      ];
      const completed = requiredFields.every(field => !!formData[field]);
      setIsProfileComplete(completed);
    };

    checkProfileCompletion();
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save to localStorage
      localStorage.setItem('institutionName', formData.institutionName);
      localStorage.setItem('contactPersonName', formData.contactPersonName);
      localStorage.setItem('contactPersonEmail', formData.contactPersonEmail);
      localStorage.setItem('contactPersonPhone', formData.contactPersonPhone);
      localStorage.setItem('address', formData.address);
      localStorage.setItem('description', formData.description);
      localStorage.setItem('coursesOffered', formData.coursesOffered);

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user.name}!
          </h1>
          <p className="text-gray-500">
            Manage your college profile and student requests here.
          </p>
        </div>

        {/* Profile Completion Alert */}
        {!isProfileComplete && (
          <Card className="mb-6 bg-yellow-50 border-yellow-200">
            <CardContent className="py-4 px-6">
              <div className="flex items-center space-x-3">
                <Settings className="h-5 w-5 text-yellow-600" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">
                    Profile Incomplete
                  </h3>
                  <p className="text-xs text-yellow-600">
                    Please complete your profile to unlock all features.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="requests">My Requests</TabsTrigger>
            <TabsTrigger value="pack365">Pack365</TabsTrigger>
            <TabsTrigger value="custom">Custom Requests</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Institution Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Institution Name:</span>
                    <span className="font-medium">{formData.institutionName || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Contact Person:</span>
                    <span className="font-medium">{formData.contactPersonName || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Total Students:</span>
                    <span className="font-medium">{studentCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Recent Student Registrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {studentsList.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {studentsList.map(student => (
                          <tr key={student._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{student.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{student.email}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <UserPlus className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No recent student registrations.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Courses Offered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  List of courses offered by your institution:
                </p>
                <div className="mt-4">
                  {formData.coursesOffered ? (
                    <ul className="list-disc list-inside text-gray-700">
                      {formData.coursesOffered.split(',').map((course, index) => (
                        <li key={index} className="py-1">{course.trim()}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No courses listed.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  My Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  List of requests by your institution:
                </p>
                <div className="mt-4">
                  <p className="text-gray-500">No requests listed.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pack365 Tab */}
          <TabsContent value="pack365" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Pack365
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Pack365
                </p>
                <div className="mt-4">
                  <Button onClick={() => navigate('/pack365')}>Go to Pack365</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Custom Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Sparkles className="h-12 w-12 mx-auto text-blue-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Custom Request Submitted</h3>
                  <p className="text-gray-600 mb-4">
                    Your custom request has been noted. Our team will review and get back to you soon.
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Custom requests are processed within 24-48 hours. You'll receive an email confirmation once reviewed.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  College Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="institutionName">Institution Name</Label>
                    <Input
                      type="text"
                      id="institutionName"
                      name="institutionName"
                      value={formData.institutionName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPersonName">Contact Person Name</Label>
                    <Input
                      type="text"
                      id="contactPersonName"
                      name="contactPersonName"
                      value={formData.contactPersonName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPersonEmail">Contact Person Email</Label>
                    <Input
                      type="email"
                      id="contactPersonEmail"
                      name="contactPersonEmail"
                      value={formData.contactPersonEmail}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPersonPhone">Contact Person Phone</Label>
                    <Input
                      type="tel"
                      id="contactPersonPhone"
                      name="contactPersonPhone"
                      value={formData.contactPersonPhone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="coursesOffered">Courses Offered (comma-separated)</Label>
                    <Input
                      type="text"
                      id="coursesOffered"
                      name="coursesOffered"
                      value={formData.coursesOffered}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? 'Updating...' : 'Update Profile'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CollegeDashboard;
