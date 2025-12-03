/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, CheckCircle, Play, Award, Trophy, Clock, 
  Calendar, Users, IndianRupee, PlayCircle, GraduationCap, 
  Zap, Target, CalendarDays, FileText 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { courseApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import CourseCards from '../CourseCards';
import { EnhancedCourse } from '@/types/api';

interface StudentCourseManagementProps {
  user: any;
  myEnrollments: any[];
  completedCourses: any[];
  loadingCourses: boolean;
  setLoadingCourses: (loading: boolean) => void;
  courseFilter: string;
  setCourseFilter: (filter: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  streams: string[];
}

const StudentCourseManagement: React.FC<StudentCourseManagementProps> = ({
  user,
  myEnrollments,
  completedCourses,
  loadingCourses,
  setLoadingCourses,
  courseFilter,
  setCourseFilter,
  searchTerm,
  setSearchTerm,
  streams
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [allCourses, setAllCourses] = useState<EnhancedCourse[]>([]);
  const [freeCourses, setFreeCourses] = useState<EnhancedCourse[]>([]);
  const [paidCourses, setPaidCourses] = useState<EnhancedCourse[]>([]);

  useEffect(() => {
    loadAllCourses();
  }, []);

  const loadAllCourses = async () => {
    try {
      setLoadingCourses(true);
      console.log('🔄 Loading all courses...');
      
      const [allCoursesData, freeCoursesData, paidCoursesData] = await Promise.all([
        courseApi.getAllCourses(),
        courseApi.getFreeCourses(),
        courseApi.getPaidCourses()
      ]);
      
      console.log('📊 All courses data:', allCoursesData);
      console.log('🆓 Free courses data:', freeCoursesData);
      console.log('💰 Paid courses data:', paidCoursesData);
      
      setAllCourses(allCoursesData.courses || []);
      setFreeCourses(freeCoursesData || []);
      setPaidCourses(paidCoursesData || []);
      
      console.log('✅ Courses loaded successfully');
    } catch (error: any) {
      console.error('❌ Error loading courses:', error);
      
      setAllCourses([]);
      setFreeCourses([]);
      setPaidCourses([]);
      
      toast({
        title: "Error",
        description: `Failed to load courses: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setLoadingCourses(false);
      console.log('🏁 Course loading completed');
    }
  };

  // Filter courses based on stream and search term
  const filteredFreeCourses = freeCourses.filter(course => {
    const matchesFilter = courseFilter === 'all' || course.stream.toLowerCase() === courseFilter.toLowerCase();
    const matchesSearch = course.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredPaidCourses = paidCourses.filter(course => {
    const matchesFilter = courseFilter === 'all' || course.stream.toLowerCase() === courseFilter.toLowerCase();
    const matchesSearch = course.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="my-courses" className="space-y-4">
        <TabsList className="bg-white">
          <TabsTrigger value="my-courses">My Courses</TabsTrigger>
          <TabsTrigger value="browse-courses">Browse Courses</TabsTrigger>
        </TabsList>

        <TabsContent value="my-courses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Enrolled Courses</CardTitle>
              <CardDescription>Continue your learning journey</CardDescription>
            </CardHeader>
            <CardContent>
              {myEnrollments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myEnrollments.map((enrollment, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow border-blue-200">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Badge className="bg-blue-500 text-white">
                              {enrollment.isPaid ? 'Paid' : 'Free'}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {formatDate(enrollment.enrollmentDate)}
                            </span>
                          </div>
                          <h3 className="font-semibold text-lg">{enrollment.courseName}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {enrollment.courseDescription || 'No description available'}
                          </p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-medium">{enrollment.videoProgressPercent || 0}%</span>
                            </div>
                            <Progress value={enrollment.videoProgressPercent || 0} className="h-2" />
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{enrollment.totalDuration || 'N/A'}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              <span>{enrollment.totalEnrollments || 0} enrolled</span>
                            </div>
                          </div>
                          <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={() => navigate(`/learning/${enrollment.courseId}`)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Continue Learning
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Enrollments Yet</h3>
                  <p className="text-gray-500 mb-6">You haven't enrolled in any courses yet.</p>
                  <Button 
                    onClick={() => navigate('/courses/recorded')} 
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Browse Available Courses
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {completedCourses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Completed Courses</CardTitle>
                <CardDescription>Your learning achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedCourses.map((course, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow border-green-200">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Badge className="bg-green-500 text-white">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                            <Award className="h-5 w-5 text-yellow-500" />
                          </div>
                          <h3 className="font-semibold text-lg">{course.courseName}</h3>
                          <p className="text-sm text-gray-600">
                            Completed on {formatDate(course.completionDate)}
                          </p>
                          <div className="pt-2">
                            <Button 
                              variant="outline" 
                              className="w-full border-green-500 text-green-600 hover:bg-green-50"
                              onClick={() => {
                                if (course.certificateUrl) {
                                  window.open(course.certificateUrl, '_blank');
                                } else {
                                  toast({
                                    title: "Certificate Not Available",
                                    description: "Certificate will be available soon.",
                                    variant: "default",
                                  });
                                }
                              }}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              View Certificate
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Statistics Section */}
          {myEnrollments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Learning Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {myEnrollments.length}
                    </div>
                    <p className="text-sm text-gray-600">Total Enrolled Courses</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {completedCourses.length}
                    </div>
                    <p className="text-sm text-gray-600">Completed Courses</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 mb-2">
                      {Math.round(
                        myEnrollments.reduce((sum, enrollment) => 
                          sum + (enrollment.videoProgressPercent || 0), 0
                        ) / myEnrollments.length
                      ) || 0}%
                    </div>
                    <p className="text-sm text-gray-600">Average Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="browse-courses" className="space-y-6">
          {/* Course Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search courses by name, description, or instructor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={courseFilter} onValueChange={setCourseFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by stream" />
                  </SelectTrigger>
                  <SelectContent>
                    {streams.map((stream) => (
                      <SelectItem key={stream} value={stream}>
                        {stream === 'all' ? 'All Streams' : stream.charAt(0).toUpperCase() + stream.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  onClick={loadAllCourses}
                  className="whitespace-nowrap"
                >
                  Refresh Courses
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="free" className="space-y-4">
            <TabsList className="bg-white">
              <TabsTrigger value="free">Free Courses</TabsTrigger>
              <TabsTrigger value="paid">Paid Courses</TabsTrigger>
              <TabsTrigger value="featured">Featured</TabsTrigger>
            </TabsList>

            <TabsContent value="free" className="space-y-6">
              {loadingCourses ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading free courses...</p>
                  <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the latest courses</p>
                </div>
              ) : filteredFreeCourses.length > 0 ? (
                <>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Free Courses ({filteredFreeCourses.length})
                    </h3>
                    <p className="text-gray-600">
                      Start learning without any cost
                    </p>
                  </div>
                  <CourseCards courses={filteredFreeCourses as any} type="recorded" />
                </>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Free Courses Found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm ? 'No courses match your search criteria.' : 'No free courses are currently available.'}
                  </p>
                  <div className="space-x-4">
                    <Button onClick={() => setSearchTerm('')} variant="outline">
                      Clear Search
                    </Button>
                    <Button onClick={loadAllCourses}>
                      Refresh Courses
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="paid" className="space-y-6">
              {loadingCourses ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading paid courses...</p>
                  <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the latest courses</p>
                </div>
              ) : filteredPaidCourses.length > 0 ? (
                <>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Paid Courses ({filteredPaidCourses.length})
                    </h3>
                    <p className="text-gray-600">
                      Premium courses with certification
                    </p>
                  </div>
                  <CourseCards courses={filteredPaidCourses as any} type="recorded" />
                </>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Paid Courses Found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm ? 'No courses match your search criteria.' : 'No paid courses are currently available.'}
                  </p>
                  <div className="space-x-4">
                    <Button onClick={() => setSearchTerm('')} variant="outline">
                      Clear Search
                    </Button>
                    <Button onClick={loadAllCourses}>
                      Refresh Courses
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="featured" className="space-y-6">
              {loadingCourses ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading featured courses...</p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Featured Courses</h3>
                    <p className="text-gray-600">
                      Handpicked courses recommended for you
                    </p>
                  </div>
                  {allCourses.filter(course => course.isFeatured).length > 0 ? (
                    <CourseCards 
                      courses={allCourses.filter(course => course.isFeatured) as any} 
                      type="recorded" 
                    />
                  ) : (
                    <div className="text-center py-12">
                      <Award className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Featured Courses</h3>
                      <p className="text-gray-600 mb-6">
                        Check back later for featured course recommendations.
                      </p>
                      <Button onClick={() => navigate('/courses/recorded')}>
                        Browse All Courses
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Courses</p>
                    <p className="text-2xl font-bold text-gray-900">{allCourses.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Free Courses</p>
                    <p className="text-2xl font-bold text-gray-900">{freeCourses.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Trophy className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Paid Courses</p>
                    <p className="text-2xl font-bold text-gray-900">{paidCourses.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentCourseManagement;
