import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Download, Briefcase, LogOut, Filter, BookOpen, Video, Users, Shield, Star, Clock, Code, Database, Calculator, TrendingUp } from 'lucide-react';
import CourseLearningInterface from '@/components/CourseLearningInterface';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StudentDashboardProps {
  user: { role: string; name: string };
  onLogout: () => void;
}

const StudentDashboard = ({ user, onLogout }: StudentDashboardProps) => {
  const [activeTab, setActiveTab] = useState('courses');
  const [showCourseInterface, setShowCourseInterface] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);

  // Course data from live/recorded pages
  const allCourses = [
    {
      id: 'web-development',
      title: 'Web Development',
      description: 'Master HTML, CSS, JavaScript, React and build modern web applications',
      duration: '12 weeks',
      students: '2,500+',
      rating: 4.8,
      color: 'bg-blue-500',
      icon: Code,
      price: "₹2,999",
      originalPrice: "₹4,999",
      lessons: 45,
      level: "Beginner to Advanced",
      type: "Live"
    },
    {
      id: 'data-science',
      title: 'Data Science',
      description: 'Learn Python, Machine Learning, Statistics and Data Analysis',
      duration: '16 weeks',
      students: '1,800+',
      rating: 4.9,
      color: 'bg-orange-500',
      icon: Database,
      price: "₹2,499",
      originalPrice: "₹3,999",
      lessons: 38,
      level: "Beginner",
      type: "Recorded"
    },
    {
      id: 'aptitude-training',
      title: 'Aptitude Training',
      description: 'Quantitative aptitude, logical reasoning, and verbal ability',
      duration: '8 weeks',
      students: '3,200+',
      rating: 4.7,
      color: 'bg-green-500',
      icon: Calculator,
      price: "₹1,999",
      originalPrice: "₹2,999",
      lessons: 30,
      level: "Beginner to Intermediate",
      type: "Live"
    },
    {
      id: 'business-analytics',
      title: 'Business Analytics',
      description: 'Excel, Power BI, Tableau and business intelligence tools',
      duration: '10 weeks',
      students: '1,500+',
      rating: 4.6,
      color: 'bg-purple-500',
      icon: TrendingUp,
      price: "₹3,499",
      originalPrice: "₹5,499",
      lessons: 55,
      level: "Beginner to Advanced",
      type: "Recorded"
    },
    {
      id: 'soft-skills',
      title: 'Soft Skills',
      description: 'Communication, leadership and professional development',
      duration: '6 weeks',
      students: '4,000+',
      rating: 4.8,
      color: 'bg-pink-500',
      icon: Users,
      price: "₹2,299",
      originalPrice: "₹3,499",
      lessons: 35,
      level: "Beginner",
      type: "Live"
    },
    {
      id: 'job-readiness',
      title: 'Job Readiness',
      description: 'Resume building, interview preparation and placement support',
      duration: '4 weeks',
      students: '2,800+',
      rating: 4.9,
      color: 'bg-indigo-500',
      icon: Briefcase,
      price: "₹3,299",
      originalPrice: "₹4,799",
      lessons: 42,
      level: "Intermediate",
      type: "Recorded"
    }
  ];

  const enrolledCourses = allCourses.filter(course => ['web-development', 'data-science'].includes(course.id));

  const handleCourseClick = (course: any) => {
    setSelectedCourse(course);
    setShowCourseInterface(true);
  };

  if (showCourseInterface && selectedCourse) {
    return <CourseLearningInterface course={selectedCourse} onBack={() => setShowCourseInterface(false)} />;
  }

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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="courses">Browse Courses</TabsTrigger>
            <TabsTrigger value="my-courses">My Courses</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="assistance">Job Assistance</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Browse All Courses</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Video className="h-4 w-4 mr-2" />
                  Live Courses
                </Button>
                <Button variant="outline" size="sm">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Recorded Courses
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleCourseClick(course)}>
                  <div className="relative flex items-center justify-center h-48">
                    <div className={`h-24 w-24 ${course.color} rounded-full flex items-center justify-center`}>
                      <course.icon className="h-12 w-12 text-white" />
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="bg-white/90">
                        {course.level}
                      </Badge>
                    </div>
                    <div className="absolute top-4 left-4">
                      <Badge variant={course.type === 'Live' ? 'default' : 'secondary'}>
                        {course.type}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{course.title}</CardTitle>
                        <CardDescription className="text-sm">{course.description}</CardDescription>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-4">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {course.duration}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {course.students}
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                        {course.rating}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-blue-600">{course.price}</span>
                        <span className="text-lg text-gray-500 line-through">{course.originalPrice}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {course.lessons} lessons
                      </div>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      {enrolledCourses.find(c => c.id === course.id) ? 'Continue Learning' : 'Enroll Now'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-courses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Enrolled Courses</h2>
              <div className="text-sm text-gray-600">
                {enrolledCourses.length} courses enrolled
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <Card key={course.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleCourseClick(course)}>
                  <CardHeader>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription>By Expert Instructor</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: course.id === 'web-development' ? '25%' : '60%' }}></div>
                      </div>
                      <p className="text-sm text-gray-600">Progress: {course.id === 'web-development' ? '25%' : '60%'}</p>
                      <Button variant="outline" className="w-full">
                        Continue Learning
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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

          <TabsContent value="assistance">
            <Card>
              <CardHeader>
                <CardTitle>Job Assistance</CardTitle>
              </CardHeader>
              <CardContent>
                Explore job assistance programs and resources.
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;
