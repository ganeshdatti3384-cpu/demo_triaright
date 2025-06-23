
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, 
  Download, 
  Users, 
  Trophy, 
  Calendar, 
  MessageCircle, 
  LogOut, 
  Code, 
  FileText,
  Search,
  Filter,
  Play,
  Clock,
  MapPin,
  DollarSign,
  Star,
  Send,
  Target,
  Award,
  Briefcase,
  Upload,
  User,
  Edit
} from 'lucide-react';
import CodeCompiler from '../CodeCompiler';
import ExamsSection from '../ExamsSection';

interface StudentDashboardProps {
  user: { role: string; name: string };
  onLogout: () => void;
}

const StudentDashboard = ({ user, onLogout }: StudentDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [courseFilter, setCourseFilter] = useState('all');
  const [internshipFilter, setInternshipFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditProfile, setShowEditProfile] = useState(false);

  // Sample data for enrolled courses
  const enrolledCourses = [
    { 
      id: 1, 
      title: 'React Development Masterclass', 
      description: 'Complete guide to modern React development with hooks and context',
      duration: '40 hours',
      type: 'recorded',
      progress: 75,
      enrolled: true
    },
    { 
      id: 2, 
      title: 'Data Structures & Algorithms', 
      description: 'Master DSA concepts with practical problem-solving approaches',
      duration: '60 hours',
      type: 'recorded',
      progress: 100,
      enrolled: true
    }
  ];

  // Sample data for available courses
  const availableCourses = [
    { 
      id: 3, 
      title: 'Python for Beginners', 
      description: 'Learn Python programming from scratch to advanced concepts',
      duration: '35 hours',
      type: 'recorded',
      progress: 0,
      enrolled: false
    },
    { 
      id: 4, 
      title: 'Full Stack Web Development', 
      description: 'Live interactive sessions on modern web development',
      duration: '3 months',
      type: 'live',
      instructor: 'John Doe',
      enrolled: false
    }
  ];

  // Sample data for applied internships
  const appliedInternships = [
    {
      id: 1,
      title: 'Frontend Developer Intern',
      company: 'TechCorp Solutions',
      duration: '3 months',
      stipend: '₹15,000/month',
      type: 'Company-Paid',
      skills: ['React', 'JavaScript', 'CSS'],
      location: 'Hyderabad',
      status: 'Under Review',
      appliedDate: '2024-01-15'
    }
  ];

  // Sample data for available internships
  const availableInternships = [
    {
      id: 2,
      title: 'Data Science Internship',
      company: 'DataTech Labs',
      duration: '6 months',
      stipend: 'Pay ₹5,000',
      type: 'Student-Paid',
      skills: ['Python', 'SQL', 'Machine Learning'],
      location: 'Remote'
    }
  ];

  const trainingCategories = [
    {
      id: 1,
      title: 'Aptitude Training',
      description: 'Quantitative aptitude, logical reasoning, and verbal ability',
      modules: ['Arithmetic', 'Algebra', 'Geometry', 'Data Interpretation'],
      enrolled: true,
      type: 'crt'
    },
    {
      id: 2,
      title: 'Soft Skills Development',
      description: 'Communication, presentation, and interpersonal skills',
      modules: ['Communication', 'Leadership', 'Time Management', 'Team Work'],
      enrolled: false,
      type: 'crt'
    },
    {
      id: 3,
      title: 'Company-Specific Training',
      description: 'Targeted preparation for specific company requirements',
      modules: ['TCS', 'Infosys', 'Wipro', 'Accenture'],
      enrolled: false,
      type: 'crt'
    },
    {
      id: 4,
      title: 'Web Development',
      description: 'Frontend and backend development technologies',
      modules: ['HTML/CSS', 'JavaScript', 'React', 'Node.js'],
      enrolled: true,
      type: 'technical'
    },
    {
      id: 5,
      title: 'Data Science & Analytics',
      description: 'Data analysis, machine learning, and statistical modeling',
      modules: ['Python', 'SQL', 'Machine Learning', 'Data Visualization'],
      enrolled: false,
      type: 'technical'
    }
  ];

  const jobListings = [
    {
      id: 1,
      title: 'Software Developer',
      company: 'Tech Solutions Pvt Ltd',
      location: 'Hyderabad',
      type: 'Full-time',
      domain: 'Technology',
      salary: '₹4-6 LPA'
    },
    {
      id: 2,
      title: 'Data Analyst',
      company: 'Analytics Corp',
      location: 'Remote',
      type: 'Remote',
      domain: 'Data Science',
      salary: '₹5-8 LPA'
    }
  ];

  const appliedJobs = [
    {
      id: 1,
      title: 'Frontend Developer',
      company: 'StartupXYZ',
      appliedDate: '2024-01-10',
      status: 'Interview Scheduled',
      location: 'Bangalore',
      salary: '₹6-8 LPA'
    },
    {
      id: 2,
      title: 'UI/UX Designer',
      company: 'DesignPro',
      appliedDate: '2024-01-05',
      status: 'Application Submitted',
      location: 'Mumbai',
      salary: '₹5-7 LPA'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Triaright Hub
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
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="internships">Internships</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="compiler">Compiler</TabsTrigger>
            <TabsTrigger value="exams">Exams</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{enrolledCourses.length}</div>
                  <p className="text-xs text-muted-foreground">Active learning paths</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Certificates</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">9</div>
                  <p className="text-xs text-muted-foreground">Available for download</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Applications</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{appliedJobs.length + appliedInternships.length}</div>
                  <p className="text-xs text-muted-foreground">Internship & job applications</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Skills Gained</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">Technical & soft skills</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {enrolledCourses.slice(0, 3).map((course) => (
                    <div key={course.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{course.title}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Progress value={course.progress} className="w-32" />
                          <span className="text-sm text-gray-500">{course.progress}%</span>
                          <Badge variant={course.progress === 100 ? 'default' : 'secondary'}>
                            {course.progress === 100 ? 'completed' : 'ongoing'}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        {course.progress === 100 ? 'View Certificate' : 'Continue'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <Tabs defaultValue="browse" className="w-full">
              <TabsList>
                <TabsTrigger value="browse">Browse Courses</TabsTrigger>
                <TabsTrigger value="mycourses">My Courses</TabsTrigger>
              </TabsList>

              <TabsContent value="browse" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Browse Courses</h2>
                </div>
                
                {/* Filters */}
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <Input
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <Select value={courseFilter} onValueChange={setCourseFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Course Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      <SelectItem value="recorded">Recorded</SelectItem>
                      <SelectItem value="live">Live</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Available Courses */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableCourses.map((course) => (
                    <Card key={course.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        <CardDescription>{course.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            {course.duration}
                          </div>
                          {'instructor' in course && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Users className="h-4 w-4 mr-2" />
                              Instructor: {course.instructor}
                            </div>
                          )}
                          <Button className="w-full">
                            <Play className="h-4 w-4 mr-2" />
                            {course.type === 'live' ? 'Apply for Course' : 'Enroll Now'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="mycourses" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">My Courses</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledCourses.map((course) => (
                    <Card key={course.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        <CardDescription>{course.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            {course.duration}
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} />
                          </div>
                          <Button className="w-full">
                            <Play className="h-4 w-4 mr-2" />
                            {course.progress === 100 ? 'View Certificate' : 'Continue Learning'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Internships Tab */}
          <TabsContent value="internships" className="space-y-6">
            <Tabs defaultValue="browse" className="w-full">
              <TabsList>
                <TabsTrigger value="browse">Browse Internships</TabsTrigger>
                <TabsTrigger value="myinternships">My Internships</TabsTrigger>
              </TabsList>

              <TabsContent value="browse" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Browse Internships</h2>
                </div>

                {/* Filters */}
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <Input
                      placeholder="Search internships..."
                      className="max-w-sm"
                    />
                  </div>
                  <Select value={internshipFilter} onValueChange={setInternshipFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Internship Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="company-paid">Company-Paid</SelectItem>
                      <SelectItem value="student-paid">Student-Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {availableInternships.map((internship) => (
                    <Card key={internship.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{internship.title}</CardTitle>
                        <CardDescription>{internship.company}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 mr-2" />
                            Duration: {internship.duration}
                          </div>
                          <div className="flex items-center text-sm">
                            <DollarSign className="h-4 w-4 mr-2" />
                            {internship.stipend}
                          </div>
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 mr-2" />
                            {internship.location}
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-2">Skills Required:</p>
                            <div className="flex flex-wrap gap-1">
                              {internship.skills.map((skill, index) => (
                                <Badge key={index} variant="outline">{skill}</Badge>
                              ))}
                            </div>
                          </div>
                          <Badge variant={internship.type === 'Company-Paid' ? 'default' : 'secondary'}>
                            {internship.type}
                          </Badge>
                          <Button className="w-full">Apply Now</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="myinternships" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">My Internships</h2>
                </div>

                <div className="space-y-4">
                  {appliedInternships.map((internship) => (
                    <Card key={internship.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{internship.title}</h3>
                            <p className="text-gray-600">{internship.company}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                Applied: {internship.appliedDate}
                              </span>
                              <span className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {internship.location}
                              </span>
                            </div>
                            <div className="mt-2">
                              <Badge variant={internship.status === 'Under Review' ? 'secondary' : 'default'}>
                                {internship.status}
                              </Badge>
                            </div>
                          </div>
                          <Button variant="outline">View Details</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Training Programs</h2>
            </div>

            <Tabs defaultValue="crt" className="w-full">
              <TabsList>
                <TabsTrigger value="crt">CRT Training</TabsTrigger>
                <TabsTrigger value="technical">Technical Training</TabsTrigger>
              </TabsList>

              <TabsContent value="crt" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trainingCategories.filter(cat => cat.type === 'crt').map((category) => (
                    <Card key={category.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium mb-2">Modules:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {category.modules.map((module, index) => (
                                <li key={index}>• {module}</li>
                              ))}
                            </ul>
                          </div>
                          {category.enrolled ? (
                            <Badge className="w-full justify-center">Enrolled</Badge>
                          ) : (
                            <Button className="w-full">
                              <Target className="h-4 w-4 mr-2" />
                              Enroll Now
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="technical" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trainingCategories.filter(cat => cat.type === 'technical').map((category) => (
                    <Card key={category.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium mb-2">Modules:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {category.modules.map((module, index) => (
                                <li key={index}>• {module}</li>
                              ))}
                            </ul>
                          </div>
                          {category.enrolled ? (
                            <Badge className="w-full justify-center">Enrolled</Badge>
                          ) : (
                            <Button className="w-full">
                              <Target className="h-4 w-4 mr-2" />
                              Enroll Now
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Projects</h2>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Submit Project for Guidance</CardTitle>
                <CardDescription>Share your project idea and receive mentorship from our experts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="projectName">Project Name</Label>
                    <Input id="projectName" placeholder="Enter your project name" />
                  </div>
                  <div>
                    <Label htmlFor="projectDescription">Description</Label>
                    <Textarea id="projectDescription" placeholder="Describe your project idea..." />
                  </div>
                  <div>
                    <Label htmlFor="githubLink">GitHub Link (Optional)</Label>
                    <Input id="githubLink" placeholder="https://github.com/username/project" />
                  </div>
                  <div>
                    <Label htmlFor="technologies">Tools/Technologies</Label>
                    <Input id="technologies" placeholder="React, Node.js, MongoDB..." />
                  </div>
                  <Button className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Submit for Guidance
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Previous Submissions */}
            <Card>
              <CardHeader>
                <CardTitle>Previous Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No project submissions yet</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <Tabs defaultValue="browse" className="w-full">
              <TabsList>
                <TabsTrigger value="browse">Browse Jobs</TabsTrigger>
                <TabsTrigger value="myjobs">My Applications</TabsTrigger>
              </TabsList>

              <TabsContent value="browse" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Job Opportunities</h2>
                </div>

                {/* Job Filters */}
                <div className="flex gap-4">
                  <Input placeholder="Search jobs..." className="max-w-sm" />
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Domain" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="data-science">Data Science</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="in-office">In Office</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {jobListings.map((job) => (
                    <Card key={job.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{job.title}</h3>
                            <p className="text-gray-600">{job.company}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {job.location}
                              </span>
                              <span className="flex items-center">
                                <Briefcase className="h-4 w-4 mr-1" />
                                {job.type}
                              </span>
                              <span className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                {job.salary}
                              </span>
                            </div>
                            <Badge variant="outline" className="mt-2">{job.domain}</Badge>
                          </div>
                          <Button>Apply Now</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="myjobs" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">My Job Applications</h2>
                </div>

                <div className="space-y-4">
                  {appliedJobs.map((job) => (
                    <Card key={job.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{job.title}</h3>
                            <p className="text-gray-600">{job.company}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                Applied: {job.appliedDate}
                              </span>
                              <span className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {job.location}
                              </span>
                              <span className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                {job.salary}
                              </span>
                            </div>
                            <div className="mt-2">
                              <Badge variant={job.status === 'Interview Scheduled' ? 'default' : 'secondary'}>
                                {job.status}
                              </Badge>
                            </div>
                          </div>
                          <Button variant="outline">View Details</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Compiler Tab */}
          <TabsContent value="compiler">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Code Compiler
                </CardTitle>
                <CardDescription>Practice coding in multiple programming languages</CardDescription>
              </CardHeader>
              <CardContent>
                <CodeCompiler />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exams Tab */}
          <TabsContent value="exams">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Exams & Assessments
                </CardTitle>
                <CardDescription>Take exams and track your progress</CardDescription>
              </CardHeader>
              <CardContent>
                <ExamsSection />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Management</CardTitle>
                <CardDescription>Manage your personal information and resume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button 
                    onClick={() => setShowEditProfile(true)}
                    className="w-full"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Resume
                  </Button>
                  <Button variant="outline" className="w-full">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Career Guidance Chat
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Edit Profile Form */}
            {showEditProfile && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>Update your personal and academic information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Profile Picture Upload */}
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-12 w-12 text-gray-400" />
                      </div>
                      <div>
                        <Label htmlFor="profilePicture">Upload Profile Picture</Label>
                        <Input id="profilePicture" type="file" accept="image/*" className="mt-1" />
                      </div>
                    </div>

                    {/* Personal Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Full Name (as on SSC) *</Label>
                        <Input id="fullName" placeholder="Your full name" />
                      </div>
                      <div>
                        <Label htmlFor="dob">DOB *</Label>
                        <Input id="dob" type="date" />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input id="email" type="email" placeholder="Enter email" />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone *</Label>
                        <Input id="phone" placeholder="Primary number" />
                      </div>
                      <div>
                        <Label htmlFor="alternatePhone">Alternate Phone</Label>
                        <Input id="alternatePhone" placeholder="Secondary number" />
                      </div>
                      <div>
                        <Label htmlFor="fatherName">Father Name</Label>
                        <Input id="fatherName" placeholder="Father's full name" />
                      </div>
                      <div>
                        <Label htmlFor="gender">Gender *</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="maritalStatus">Marital Status *</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="E.g., Single, Married" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Single</SelectItem>
                            <SelectItem value="married">Married</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="nationality">Nationality *</Label>
                        <Input id="nationality" placeholder="Your nationality" defaultValue="Indian" />
                      </div>
                      <div>
                        <Label htmlFor="languages">Languages Known *</Label>
                        <Input id="languages" placeholder="E.g., English, Hindi" />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="address">Address *</Label>
                        <Textarea id="address" placeholder="Your address" />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="hobbies">Hobbies</Label>
                        <Input id="hobbies" placeholder="Your hobbies" />
                      </div>
                    </div>

                    {/* Educational Qualification */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4">Educational Qualification</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="instituteName">Institute Name *</Label>
                          <Input id="instituteName" placeholder="College/University name" />
                        </div>
                        <div>
                          <Label htmlFor="stream">Stream/Course *</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="btech">B.Tech</SelectItem>
                              <SelectItem value="bsc">B.Sc</SelectItem>
                              <SelectItem value="bcom">B.Com</SelectItem>
                              <SelectItem value="ba">B.A</SelectItem>
                              <SelectItem value="mtech">M.Tech</SelectItem>
                              <SelectItem value="msc">M.Sc</SelectItem>
                              <SelectItem value="mba">MBA</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="yearOfPass">Year of Pass *</Label>
                          <Input id="yearOfPass" placeholder="E.g., 2023" />
                        </div>
                      </div>
                    </div>

                    {/* Projects */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4">Projects</h3>
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
                          <Textarea id="projectDescription" placeholder="Brief description of your project" />
                        </div>
                      </div>
                    </div>

                    {/* Certifications */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4">Certifications</h3>
                      <div>
                        <Label htmlFor="certifications">Certification Details</Label>
                        <Textarea id="certifications" placeholder="List your certifications and credentials" />
                      </div>
                    </div>

                    {/* Internships */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4">Internships</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="companyName">Company Name</Label>
                          <Input id="companyName" placeholder="Company where you interned" />
                        </div>
                        <div>
                          <Label htmlFor="internshipRole">Internship Role</Label>
                          <Input id="internshipRole" placeholder="Your position/role" />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="responsibilities">Responsibilities</Label>
                          <Textarea id="responsibilities" placeholder="Brief description of your responsibilities" />
                        </div>
                      </div>
                    </div>

                    {/* Account Details */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4">Account Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="username">Username</Label>
                          <Input id="username" placeholder="Choose a username" />
                        </div>
                        <div>
                          <Label htmlFor="password">Password</Label>
                          <Input id="password" type="password" placeholder="Password" />
                        </div>
                        <div>
                          <Label htmlFor="confirmPassword">Re-enter Password</Label>
                          <Input id="confirmPassword" type="password" placeholder="Re-enter Password" />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-6">
                      <Button className="flex-1">Save Changes</Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setShowEditProfile(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;
