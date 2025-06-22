
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
  Briefcase
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
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data
  const recordedCourses = [
    { 
      id: 1, 
      title: 'React Development Masterclass', 
      description: 'Complete guide to modern React development with hooks and context',
      duration: '40 hours',
      type: 'recorded',
      progress: 75 
    },
    { 
      id: 2, 
      title: 'Data Structures & Algorithms', 
      description: 'Master DSA concepts with practical problem-solving approaches',
      duration: '60 hours',
      type: 'recorded',
      progress: 100 
    },
    { 
      id: 3, 
      title: 'Python for Beginners', 
      description: 'Learn Python programming from scratch to advanced concepts',
      duration: '35 hours',
      type: 'recorded',
      progress: 0 
    }
  ];

  const liveCourses = [
    { 
      id: 4, 
      title: 'Full Stack Web Development', 
      description: 'Live interactive sessions on modern web development',
      duration: '3 months',
      type: 'live',
      instructor: 'John Doe' 
    },
    { 
      id: 5, 
      title: 'Machine Learning Bootcamp', 
      description: 'Hands-on ML with real-world projects and mentorship',
      duration: '4 months',
      type: 'live',
      instructor: 'Jane Smith' 
    }
  ];

  const internships = [
    {
      id: 1,
      title: 'Frontend Developer Intern',
      company: 'TechCorp Solutions',
      duration: '3 months',
      stipend: '₹15,000/month',
      type: 'Company-Paid',
      skills: ['React', 'JavaScript', 'CSS'],
      location: 'Hyderabad'
    },
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

  const crtCategories = [
    {
      id: 1,
      title: 'Aptitude Training',
      description: 'Quantitative aptitude, logical reasoning, and verbal ability',
      modules: ['Arithmetic', 'Algebra', 'Geometry', 'Data Interpretation'],
      enrolled: true
    },
    {
      id: 2,
      title: 'Soft Skills Development',
      description: 'Communication, presentation, and interpersonal skills',
      modules: ['Communication', 'Leadership', 'Time Management', 'Team Work'],
      enrolled: false
    },
    {
      id: 3,
      title: 'Company-Specific Training',
      description: 'Targeted preparation for specific company requirements',
      modules: ['TCS', 'Infosys', 'Wipro', 'Accenture'],
      enrolled: false
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
            <TabsTrigger value="training">CRT Training</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="compiler">Compiler</TabsTrigger>
            <TabsTrigger value="exams">Exams</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">3 ongoing, 9 completed</p>
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
                  <div className="text-2xl font-bold">5</div>
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
                  {recordedCourses.slice(0, 3).map((course) => (
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

          <TabsContent value="courses" className="space-y-6">
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

            {/* Recorded Courses */}
            {(courseFilter === 'all' || courseFilter === 'recorded') && (
              <div>
                <h3 className="text-lg font-semibold mb-4">📘 Recorded Courses</h3>
                <p className="text-sm text-gray-600 mb-4">Evaluation: 80% Course Completion + 20% Final Exam</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recordedCourses.map((course) => (
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
                          {course.progress > 0 && (
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>{course.progress}%</span>
                              </div>
                              <Progress value={course.progress} />
                            </div>
                          )}
                          <Button className="w-full">
                            <Play className="h-4 w-4 mr-2" />
                            {course.progress > 0 ? 'Continue' : 'Start Course'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Live Courses */}
            {(courseFilter === 'all' || courseFilter === 'live') && (
              <div>
                <h3 className="text-lg font-semibold mb-4">📡 Live Courses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {liveCourses.map((course) => (
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
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-4 w-4 mr-2" />
                            Instructor: {course.instructor}
                          </div>
                          <Button className="w-full">Apply for Live Course</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="internships" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Browse Internships</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {internships.map((internship) => (
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

          <TabsContent value="training" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">CRT Training</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {crtCategories.map((category) => (
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

          <TabsContent value="jobs" className="space-y-6">
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

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Management</CardTitle>
                <CardDescription>Manage your personal information and resume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Resume
                  </Button>
                  <Button variant="outline" className="w-full">
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="w-full">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Career Guidance Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;
