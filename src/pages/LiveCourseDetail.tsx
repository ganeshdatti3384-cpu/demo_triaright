import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, Users, MapPin, GraduationCap, Award, BookOpen, 
  FileText, Download, ArrowLeft, Loader2, CheckCircle2,
  Calendar, Languages, Target
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import axios from 'axios';

const API_BASE_URL = "https://triaright.com/api/livecourses";

const LiveCourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourseDetail();
  }, [courseId]);

  const fetchCourseDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/live-courses`);
      const courses = response.data.courses || [];
      const foundCourse = courses.find((c: any) => c.courseId === courseId);
      
      if (foundCourse) {
        setCourse(foundCourse);
      } else {
        setError('Course not found');
      }
    } catch (err) {
      console.error('Error fetching course details:', err);
      setError('Failed to load course details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getLocationType = (location: any) => {
    if (typeof location === 'string') {
      try {
        location = JSON.parse(location);
      } catch (e) {
        return { type: 'Online', details: '' };
      }
    }
    
    if (location?.type === 'online') return { type: 'Online', details: '' };
    if (location?.type === 'offline') return { 
      type: 'Offline', 
      details: `${location.venue || ''}, ${location.city || ''}, ${location.state || ''}`.replace(/, ,/g, ',').trim() 
    };
    if (location?.type === 'hybrid') return { 
      type: 'Hybrid', 
      details: `${location.venue || ''}, ${location.city || ''}, ${location.state || ''}`.replace(/, ,/g, ',').trim() 
    };
    return { type: 'Online', details: '' };
  };

  const handleEnrollClick = () => {
    navigate('/login', { 
      state: { 
        courseId: course.courseId,
        courseTitle: course.courseName,
        coursePrice: course.price 
      } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Course not found'}</p>
          <Button onClick={() => navigate('/courses/live')} variant="outline">
            Back to Courses
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const locationInfo = getLocationType(course.location);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Button 
          onClick={() => navigate('/live-courses')} 
          variant="ghost" 
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Button>
      </div>

      {/* Course Header */}
      <div className="bg-white shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Course Image */}
            <div className="lg:col-span-1">
              {course.courseImage ? (
                <img 
                  src={course.courseImage} 
                  alt={course.courseName}
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                />
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md flex items-center justify-center">
                  <BookOpen className="h-24 w-24 text-white" />
                </div>
              )}
            </div>

            {/* Right: Course Info */}
            <div className="lg:col-span-2">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{course.courseName}</h1>
                  <p className="text-lg text-gray-600">{course.description}</p>
                </div>
                {course.certificateProvided && (
                  <Badge className="bg-green-500 text-white">
                    <Award className="h-4 w-4 mr-1" />
                    Certificate Provided
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="font-semibold">{course.duration?.value} {course.duration?.unit}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-700">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Students</p>
                    <p className="font-semibold">{course.enrolledCount}/{course.maxStudents}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-700">
                  <Languages className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Language</p>
                    <p className="font-semibold">{course.language}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-700">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Category</p>
                    <p className="font-semibold">{course.category}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between bg-blue-50 p-6 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Course Price</p>
                  <p className="text-4xl font-bold text-blue-600">₹{course.price}</p>
                </div>
                <Button 
                  onClick={handleEnrollClick}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                >
                  Enroll for ₹{course.price}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Overview */}
            {course.courseOverview && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Course Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{course.courseOverview}</p>
                </CardContent>
              </Card>
            )}

            {/* Learning Outcomes */}
            {course.learningOutcomes && course.learningOutcomes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Learning Outcomes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {course.learningOutcomes.map((outcome: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Syllabus */}
            {course.syllabus && course.syllabus.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Course Syllabus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {course.syllabus.map((module: any, index: number) => (
                      <div key={index} className="border-l-4 border-blue-600 pl-4 py-2">
                        <h4 className="font-semibold text-gray-900 mb-2">{module.module}</h4>
                        <p className="text-sm text-gray-600 mb-2">Duration: {module.duration}</p>
                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                          {module.topics?.map((topic: string, topicIndex: number) => (
                            <li key={topicIndex}>{topic}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Course Documents */}
            {course.courseDocuments && course.courseDocuments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Course Syllabus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {course.courseDocuments.map((doc: string, index: number) => {
                      // Extract filename from URL and decode it
                      const urlParts = doc.split('/');
                      const fullFileName = urlParts[urlParts.length - 1];
                      // Remove ALL UUID prefixes (everything up to and including the last UUID pattern)
                      // UUID pattern: 8chars-4chars-4chars-4chars-12chars followed by dash
                      const fileNameWithoutUUID = fullFileName.replace(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}-/i, '');
                      // Decode URL encoding
                      const decodedFileName = decodeURIComponent(fileNameWithoutUUID);
                      
                      // Create embedded viewer URL for different file types
                      const getViewerUrl = (url: string) => {
                        const lowerUrl = url.toLowerCase();
                        if (lowerUrl.endsWith('.pdf')) {
                          // For PDF files, use inline viewing
                          return url;
                        } else if (lowerUrl.endsWith('.docx') || lowerUrl.endsWith('.doc') || 
                                   lowerUrl.endsWith('.xlsx') || lowerUrl.endsWith('.xls') || 
                                   lowerUrl.endsWith('.pptx') || lowerUrl.endsWith('.ppt')) {
                          // For Office documents, use Google Docs Viewer
                          return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
                        }
                        return url;
                      };
                      
                      return (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                            <span className="text-gray-700 truncate">{decodedFileName}</span>
                          </div>
                          <a
                            href={getViewerUrl(doc)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              View Syllabus
                            </Button>
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Trainer Info */}
            {course.trainer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    Your Instructor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {course.trainer.firstName?.[0]}{course.trainer.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{course.trainer.firstName} {course.trainer.lastName}</p>
                      <p className="text-sm text-gray-600">{course.trainer.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Location Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="mb-2">{locationInfo.type}</Badge>
                {locationInfo.details && (
                  <p className="text-sm text-gray-700 mt-2">{locationInfo.details}</p>
                )}
              </CardContent>
            </Card>

            {/* Enrollment CTA */}
            <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-2">Ready to Start?</h3>
                <p className="text-blue-100 mb-4 text-sm">
                  Join {course.enrolledCount} students already enrolled in this course.
                </p>
                <Button 
                  onClick={handleEnrollClick}
                  className="w-full bg-white text-blue-600 hover:bg-gray-100"
                  size="lg"
                >
                  Enroll Now for ₹{course.price}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LiveCourseDetail;