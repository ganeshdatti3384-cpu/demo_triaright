import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Download, Briefcase, LogOut, Filter, BookOpen, Video, Users, Shield, Star } from 'lucide-react';

interface JobSeekerDashboardProps {
  user: { role: string; name: string };
  onLogout: () => void;
}

const JobSeekerDashboard = ({ user, onLogout }: JobSeekerDashboardProps) => {
  const [activeTab, setActiveTab] = useState('jobs');
  const [showEditProfile, setShowEditProfile] = useState(false);

  const jobs = [
    { id: 1, title: 'Frontend Developer', company: 'Tech Solutions', location: 'Remote', salary: '₹8-12 LPA', type: 'Full-time', applied: false },
    { id: 2, title: 'Backend Developer', company: 'Innovation Labs', location: 'Bangalore', salary: '₹10-15 LPA', type: 'Full-time', applied: true },
    { id: 3, title: 'Full Stack Developer', company: 'Startup Inc', location: 'Mumbai', salary: '₹12-18 LPA', type: 'Full-time', applied: false },
  ];

  const applications = [
    { id: 1, title: 'Backend Developer', company: 'Innovation Labs', appliedDate: '2024-01-15', status: 'Interview Scheduled' },
    { id: 2, title: 'React Developer', company: 'WebTech Co', appliedDate: '2024-01-10', status: 'Under Review' },
    { id: 3, title: 'Software Engineer', company: 'Global Tech', appliedDate: '2024-01-05', status: 'Rejected' },
  ];

  const courses = [
    { id: 1, title: 'React Masterclass', type: 'Live', instructor: 'John Doe', duration: '8 weeks', price: '₹15,000', enrolled: false },
    { id: 2, title: 'Node.js Fundamentals', type: 'Recorded', instructor: 'Jane Smith', duration: '6 weeks', price: '₹8,000', enrolled: true },
    { id: 3, title: 'Full Stack Development', type: 'Live', instructor: 'Mike Johnson', duration: '12 weeks', price: '₹25,000', enrolled: false },
  ];

  const myCourses = courses.filter(course => course.enrolled);

  const internships = [
    { id: 1, title: 'Frontend Developer Intern', company: 'Tech Corp', duration: '3 months', stipend: '₹15,000/month', type: 'Remote', applied: false },
    { id: 2, title: 'Backend Developer Intern', company: 'StartupXYZ', duration: '6 months', stipend: '₹20,000/month', type: 'On-site', applied: true },
    { id: 3, title: 'Full Stack Intern', company: 'WebTech', duration: '4 months', stipend: '₹18,000/month', type: 'Hybrid', applied: false },
  ];

  const myInternships = internships.filter(internship => internship.applied);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/cdf8ab47-8b3d-4445-820a-e1e1baca31e0.png" 
                alt="TriaRight Logo" 
                className="h-10 w-auto"
              />
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="jobs">Browse Jobs</TabsTrigger>
            <TabsTrigger value="my-jobs">My Jobs</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="internships">Internships</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="assistance">Job Assistance</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search jobs by title, company, or skills..."
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {jobs.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                        <p className="text-gray-600 mb-2">{job.company}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="outline">{job.location}</Badge>
                          <Badge variant="outline">{job.type}</Badge>
                          <Badge variant="secondary">{job.salary}</Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          Great opportunity for experienced developers to join our growing team...
                        </p>
                      </div>
                      <div className="ml-4">
                        <Button
                          className={job.applied ? "bg-green-600 hover:bg-green-700" : ""}
                          disabled={job.applied}
                        >
                          {job.applied ? 'Applied' : 'Apply Now'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-jobs" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Job Applications</h2>
              <div className="text-sm text-gray-600">
                Total Applications: {applications.length}
              </div>
            </div>

            <div className="space-y-4">
              {applications.map((app) => (
                <Card key={app.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{app.title}</h3>
                        <p className="text-gray-600">{app.company}</p>
                        <p className="text-sm text-gray-500 mt-1">Applied on: {app.appliedDate}</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            app.status === 'Interview Scheduled' ? 'default' :
                            app.status === 'Under Review' ? 'secondary' : 'destructive'
                          }
                        >
                          {app.status}
                        </Badge>
                        <Button variant="outline" size="sm" className="mt-2 block">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <Tabs defaultValue="browse" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="browse">Browse Courses</TabsTrigger>
                <TabsTrigger value="my-courses">My Courses</TabsTrigger>
              </TabsList>

              <TabsContent value="browse" className="space-y-4">
                <div className="flex gap-4 mb-6">
                  <Button variant="outline" size="sm">
                    <Video className="h-4 w-4 mr-2" />
                    Live Courses
                  </Button>
                  <Button variant="outline" size="sm">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Recorded Courses
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <Card key={course.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{course.title}</CardTitle>
                          <Badge variant={course.type === 'Live' ? 'default' : 'secondary'}>
                            {course.type}
                          </Badge>
                        </div>
                        <CardDescription>By {course.instructor}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Duration: {course.duration}</p>
                          <p className="text-lg font-semibold text-blue-600">{course.price}</p>
                          <Button 
                            className="w-full"
                            disabled={course.enrolled}
                          >
                            {course.enrolled ? 'Enrolled' : 'Enroll Now'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="my-courses" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myCourses.map((course) => (
                    <Card key={course.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        <CardDescription>By {course.instructor}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                          </div>
                          <p className="text-sm text-gray-600">Progress: 45%</p>
                          <Button variant="outline" className="w-full">
                            Continue Learning
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="internships" className="space-y-6">
            <Tabs defaultValue="browse" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="browse">Browse Internships</TabsTrigger>
                <TabsTrigger value="my-internships">My Internships</TabsTrigger>
              </TabsList>

              <TabsContent value="browse" className="space-y-4">
                <div className="grid grid-cols-1 gap-6">
                  {internships.map((internship) => (
                    <Card key={internship.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-2">{internship.title}</h3>
                            <p className="text-gray-600 mb-2">{internship.company}</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                              <Badge variant="outline">{internship.duration}</Badge>
                              <Badge variant="outline">{internship.type}</Badge>
                              <Badge variant="secondary">{internship.stipend}</Badge>
                            </div>
                          </div>
                          <div className="ml-4">
                            <Button
                              className={internship.applied ? "bg-green-600 hover:bg-green-700" : ""}
                              disabled={internship.applied}
                            >
                              {internship.applied ? 'Applied' : 'Apply Now'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="my-internships" className="space-y-4">
                <div className="space-y-4">
                  {myInternships.map((internship) => (
                    <Card key={internship.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{internship.title}</h3>
                            <p className="text-gray-600">{internship.company}</p>
                            <p className="text-sm text-gray-500 mt-1">Duration: {internship.duration}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="default">Applied</Badge>
                            <Button variant="outline" size="sm" className="mt-2 block">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Management</CardTitle>
                <CardDescription>Manage your profile and personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button onClick={() => setShowEditProfile(true)} className="w-full">
                    Edit Profile
                  </Button>

                  {showEditProfile && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                          <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Edit Profile</h2>
                            <Button variant="outline" onClick={() => setShowEditProfile(false)}>
                              Close
                            </Button>
                          </div>

                          <form className="space-y-8">
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold flex items-center">
                                📂 Profile Picture Upload
                              </h3>
                              <div className="flex items-center space-x-4">
                                <Avatar className="h-20 w-20">
                                  <AvatarImage src="" />
                                  <AvatarFallback>JS</AvatarFallback>
                                </Avatar>
                                <Button variant="outline">Choose File</Button>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold flex items-center">
                                🧑 Personal Details
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="fullName">Full Name *</Label>
                                  <Input id="fullName" placeholder="Enter full name" />
                                </div>
                                <div>
                                  <Label htmlFor="dob">Date of Birth *</Label>
                                  <Input id="dob" type="date" />
                                </div>
                                <div>
                                  <Label htmlFor="gender">Gender *</Label>
                                  <Select>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="male">Male</SelectItem>
                                      <SelectItem value="female">Female</SelectItem>
                                      <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="maritalStatus">Marital Status</Label>
                                  <Select>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="single">Single</SelectItem>
                                      <SelectItem value="married">Married</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="md:col-span-2">
                                  <Label htmlFor="address">Address *</Label>
                                  <Input id="address" placeholder="Enter address" />
                                </div>
                                <div>
                                  <Label htmlFor="nationality">Nationality</Label>
                                  <Input id="nationality" placeholder="Enter nationality" />
                                </div>
                                <div>
                                  <Label htmlFor="languages">Languages Known</Label>
                                  <Input id="languages" placeholder="E.g., English, Hindi" />
                                </div>
                                <div className="md:col-span-2">
                                  <Label htmlFor="hobbies">Hobbies</Label>
                                  <Input id="hobbies" placeholder="Enter hobbies" />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold flex items-center">
                                🎓 Education Details
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="instituteName">Institute Name *</Label>
                                  <Input id="instituteName" placeholder="College/University name" />
                                </div>
                                <div>
                                  <Label htmlFor="stream">Stream/Course *</Label>
                                  <Input id="stream" placeholder="Enter stream/course" />
                                </div>
                                <div>
                                  <Label htmlFor="yearOfPass">Year of Pass *</Label>
                                  <Input id="yearOfPass" placeholder="E.g., 2023" />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold flex items-center">
                                💻 Project Section
                              </h3>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="projectName">Project Name</Label>
                                  <Input id="projectName" placeholder="Name of your project" />
                                </div>
                                <div>
                                  <Label htmlFor="githubLink">GitHub Link</Label>
                                  <Input id="githubLink" placeholder="https://github.com/..." />
                                </div>
                                <div>
                                  <Label htmlFor="projectDescription">Description</Label>
                                  <textarea
                                    id="projectDescription"
                                    className="w-full p-2 border border-gray-300 rounded-md h-24"
                                    placeholder="Brief description of your project"
                                  ></textarea>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold flex items-center">
                                📜 Certifications
                              </h3>
                              <div>
                                <Label htmlFor="certifications">List of Certifications and Credentials</Label>
                                <textarea
                                  id="certifications"
                                  className="w-full p-2 border border-gray-300 rounded-md h-24"
                                  placeholder="List your certifications and credentials"
                                ></textarea>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold flex items-center">
                                🧳 Internships
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="companyName">Company Name</Label>
                                  <Input id="companyName" placeholder="Company where you interned" />
                                </div>
                                <div>
                                  <Label htmlFor="internshipRole">Role</Label>
                                  <Input id="internshipRole" placeholder="Your position/role" />
                                </div>
                                <div className="md:col-span-2">
                                  <Label htmlFor="responsibilities">Responsibilities</Label>
                                  <textarea
                                    id="responsibilities"
                                    className="w-full p-2 border border-gray-300 rounded-md h-24"
                                    placeholder="Brief description of your responsibilities"
                                  ></textarea>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold flex items-center">
                                👤 Account Credentials
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="username">Username</Label>
                                  <Input id="username" placeholder="Choose a username" />
                                </div>
                                <div>
                                  <Label htmlFor="newPassword">New Password</Label>
                                  <Input id="newPassword" type="password" placeholder="Enter new password" />
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-end space-x-4">
                              <Button variant="outline" onClick={() => setShowEditProfile(false)}>
                                Cancel
                              </Button>
                              <Button type="submit">
                                Save Changes
                              </Button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assistance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-700">
                    <Users className="h-6 w-6 mr-2" />
                    Job Assistance
                  </CardTitle>
                  <CardDescription>₹500 Lifetime Access – Personalized Job Search Support</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Resume Review & Optimization</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Career Counseling</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Job Matching Services</span>
                    </div>
                    <Button className="w-full mt-4">
                      Request Assistance – ₹500
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-700">
                    <Shield className="h-6 w-6 mr-2" />
                    Job Assurance Program
                  </CardTitle>
                  <CardDescription>Guaranteed placement with tailored tracks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-green-700">IT Track – 1 Year Program</h4>
                      <p className="text-sm text-gray-600 mb-2">Fee: ₹30,000 (one-time)</p>
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        <li>Intensive Training</li>
                        <li>Placement Support</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-green-700">Non‑IT Track – 100‑Day Program</h4>
                      <p className="text-sm text-gray-600 mb-2">Fee: ₹10,000 (one-time)</p>
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        <li>Targeted Training</li>
                        <li>Job Assistance</li>
                      </ul>
                    </div>

                    <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                      Join Assurance Program
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>How Our Job Assistance Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <span className="text-blue-600 font-bold">1</span>
                    </div>
                    <h3 className="font-semibold mb-2">Profile Assessment</h3>
                    <p className="text-sm text-gray-600">We analyze your skills and career goals</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <span className="text-purple-600 font-bold">2</span>
                    </div>
                    <h3 className="font-semibold mb-2">Skill Enhancement</h3>
                    <p className="text-sm text-gray-600">Personalized training recommendations</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <span className="text-green-600 font-bold">3</span>
                    </div>
                    <h3 className="font-semibold mb-2">Job Matching</h3>
                    <p className="text-sm text-gray-600">Connect with relevant opportunities</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <span className="text-orange-600 font-bold">4</span>
                    </div>
                    <h3 className="font-semibold mb-2">Placement</h3>
                    <p className="text-sm text-gray-600">Secure your dream job</p>
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
