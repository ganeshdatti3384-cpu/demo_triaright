
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, BookOpen, Clock, Users, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CourseCards from '@/components/CourseCards';
import { courseApi, Course } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const RecordedCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStream, setSelectedStream] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseApi.getAllCourses();
      
      if (response.success && response.courses) {
        setCourses(response.courses);
        setFilteredCourses(response.courses);
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to load courses',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load courses',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = courses;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.courseDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructorName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by stream
    if (selectedStream !== 'all') {
      filtered = filtered.filter(course => course.stream === selectedStream);
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(course => course.courseType === selectedType);
    }

    setFilteredCourses(filtered);
  }, [courses, searchTerm, selectedStream, selectedType]);

  const streams = [...new Set(courses.map(course => course.stream))];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Recorded Courses
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8">
                Learn at your own pace with our comprehensive course library
              </p>
              <div className="flex items-center justify-center space-x-8 text-blue-100">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>{courses.length}+ Courses</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Expert Instructors</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Lifetime Access</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filter Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedStream} onValueChange={setSelectedStream}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Stream" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Streams</SelectItem>
                    {streams.map((stream) => (
                      <SelectItem key={stream} value={stream}>
                        {stream}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Course Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="free">Free Courses</SelectItem>
                    <SelectItem value="paid">Paid Courses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Course Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Courses ({filteredCourses.length})</TabsTrigger>
              <TabsTrigger value="free">
                Free Courses ({filteredCourses.filter(c => c.courseType === 'unpaid').length})
              </TabsTrigger>
              <TabsTrigger value="paid">
                Paid Courses ({filteredCourses.filter(c => c.courseType === 'paid').length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-8">
              <CourseCards courses={filteredCourses} type="recorded" />
            </TabsContent>
            
            <TabsContent value="free" className="mt-8">
              <CourseCards 
                courses={filteredCourses.filter(c => c.courseType === 'unpaid')} 
                type="free" 
              />
            </TabsContent>
            
            <TabsContent value="paid" className="mt-8">
              <CourseCards 
                courses={filteredCourses.filter(c => c.courseType === 'paid')} 
                type="paid" 
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RecordedCourses;
