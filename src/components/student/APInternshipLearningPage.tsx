// components/student/APInternshipLearningPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Video, Award, Clock, Play, CheckCircle, FileText, ChevronRight, Home, BarChart3, Zap, Star, Download, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface APCourse {
  _id: string;
  title: string;
  stream: string;
  totalDuration: number;
  providerName: string;
  instructorName: string;
  courseLanguage: string;
  certificationProvided: string;
  hasFinalExam: boolean;
  internshipRef: {
    _id: string;
    title: string;
    companyName: string;
  };
  curriculum: Topic[];
  createdAt: string;
}

interface Topic {
  topicName: string;
  topicCount: number;
  subtopics: Subtopic[];
  directLink?: string;
  examExcelLink?: string;
}

interface Subtopic {
  name: string;
  link: string;
  duration: number;
}

interface APEnrollment {
  _id: string;
  userId: string;
  internshipId: string;
  courseId: {
    _id: string;
    title: string;
    stream: string;
    totalDuration: number;
    curriculum: Topic[];
  };
  enrollmentDate: string;
  isPaid: boolean;
  progress: TopicProgress[];
  totalWatchedDuration: number;
  totalVideoDuration: number;
  finalExamEligible: boolean;
  finalExamAttempted: boolean;
  courseCompleted: boolean;
  completedAt?: string;
  certificateIssued?: boolean;
  certificateUrl?: string;
}

interface TopicProgress {
  topicName: string;
  subtopics: SubtopicProgress[];
  topicWatchedDuration: number;
  topicTotalDuration: number;
  examAttempted: boolean;
  examScore: number;
  passed: boolean;
}

interface SubtopicProgress {
  subTopicName: string;
  subTopicLink: string;
  watchedDuration: number;
  totalDuration: number;
}

interface ExamResult {
  _id: string;
  topicName?: string;
  isFinalExam: boolean;
  score: number;
  passed: boolean;
  attemptNumber: number;
  attemptedAt: string;
}

const APInternshipLearningPage = () => {
  const { enrollmentId } = useParams<{ enrollmentId: string }>();
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState<APEnrollment | null>(null);
  const [course, setCourse] = useState<APCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('curriculum');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<Subtopic | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (enrollmentId) {
      fetchEnrollmentData();
    }
  }, [enrollmentId]);

  const fetchEnrollmentData = async () => {
    if (!enrollmentId) return;

    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to access learning content',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      
      // ✅ CORRECTED: Use the application details endpoint which is accessible to students
      const applicationResponse = await fetch(`/api/internships/apinternshipapplications/${enrollmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!applicationResponse.ok) {
        throw new Error('Failed to fetch application data');
      }

      const applicationData = await applicationResponse.json();
      
      if (applicationData.success && applicationData.application.enrollmentId) {
        // ✅ Use the enrollment data from the application response
        const enrollmentData = applicationData.application.enrollmentId;
        setEnrollment(enrollmentData);
        
        // ✅ Course details are already populated in enrollment data
        if (enrollmentData.courseId) {
          setCourse(enrollmentData.courseId);
        }

        // ✅ Fetch exam results using course ID from enrollment
        await fetchExamResults(enrollmentData.courseId._id, token);
      } else {
        throw new Error('No enrollment found for this application');
      }
    } catch (error) {
      console.error('Error fetching enrollment data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load learning content',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchExamResults = async (courseId: string, token: string) => {
    try {
      const response = await fetch(`/api/internships/exams/history/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setExamResults([...data.history.topicExams, ...data.history.finalExams]);
        }
      }
    } catch (error) {
      console.error('Error fetching exam results:', error);
    }
  };

  const updateProgress = async (topicName: string, subTopicName: string, watchedDuration: number) => {
    if (!enrollment) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/internships/apinternshipenrollment-progress', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          enrollmentId: enrollment._id,
          topicName,
          subTopicName,
          watchedDuration
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update local state with new progress
          setEnrollment(prev => prev ? {
            ...prev,
            totalWatchedDuration: data.data.totalWatchedDuration,
            finalExamEligible: data.data.finalExamEligible,
            progress: prev.progress.map(topic => 
              topic.topicName === topicName 
                ? { 
                    ...topic, 
                    topicWatchedDuration: data.data.updatedTopic.topicWatchedDuration,
                    subtopics: topic.subtopics.map(st => 
                      st.subTopicName === subTopicName 
                        ? { ...st, watchedDuration }
                        : st
                    )
                  }
                : topic
            )
          } : null);
        }
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleVideoProgress = (topicName: string, subTopic: Subtopic, progress: number) => {
    setVideoProgress(progress);
    
    // Update progress when video reaches significant milestones (every 10%)
    if (progress % 10 === 0) {
      const watchedDuration = Math.floor((progress / 100) * subTopic.duration);
      updateProgress(topicName, subTopic.name, watchedDuration);
    }
  };

  const handleVideoEnd = (topicName: string, subTopic: Subtopic) => {
    // Mark as fully watched
    updateProgress(topicName, subTopic.name, subTopic.duration);
    setVideoProgress(100);
  };

  const getTopicProgress = (topicName: string) => {
    if (!enrollment) return 0;
    
    const topic = enrollment.progress.find(t => t.topicName === topicName);
    return topic ? (topic.topicWatchedDuration / topic.topicTotalDuration) * 100 : 0;
  };

  const getOverallProgress = () => {
    if (!enrollment || !enrollment.totalVideoDuration) return 0;
    return (enrollment.totalWatchedDuration / enrollment.totalVideoDuration) * 100;
  };

  const getExamResult = (topicName: string) => {
    return examResults.find(result => result.topicName === topicName && !result.isFinalExam);
  };

  const getFinalExamResult = () => {
    return examResults.find(result => result.isFinalExam);
  };

  const handleTakeExam = (topicName: string) => {
    if (!enrollment) return;

    // Check if topic content is completed
    const topicProgress = getTopicProgress(topicName);
    if (topicProgress < 100) {
      toast({
        title: 'Complete Topic First',
        description: 'Please complete all videos in this topic before taking the exam',
        variant: 'destructive'
      });
      return;
    }

    navigate(`/ap-internship-exam/${enrollment.courseId._id}/topic/${encodeURIComponent(topicName)}`);
  };

  const handleTakeFinalExam = () => {
    if (!enrollment || !enrollment.finalExamEligible) {
      toast({
        title: 'Not Eligible',
        description: 'Complete all topic exams and 80% of course content to take final exam',
        variant: 'destructive'
      });
      return;
    }

    navigate(`/ap-internship-exam/${enrollment.courseId._id}/final`);
  };

  const handleDownloadCertificate = async () => {
    if (!enrollment) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/internships/apinternshipcertificate/${enrollment._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Handle certificate download/generation
          toast({
            title: 'Certificate Available',
            description: 'Your certificate is ready for download',
            variant: 'default'
          });
          // You can implement certificate download logic here
        }
      } else {
        toast({
          title: 'Certificate Not Available',
          description: 'Complete the course to generate certificate',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching certificate:', error);
    }
  };

  const renderVideoPlayer = () => {
    if (!selectedSubtopic) {
      return (
        <Card className="flex-1">
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center text-gray-500">
              <Video className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Select a video to start learning</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="text-xl">{selectedSubtopic.name}</CardTitle>
          <CardDescription>
            Duration: {Math.floor(selectedSubtopic.duration / 60)}min {selectedSubtopic.duration % 60}sec
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-black rounded-lg mb-4 flex items-center justify-center">
            {selectedSubtopic.link ? (
              <iframe
                src={selectedSubtopic.link}
                className="w-full h-full rounded-lg"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : (
              <div className="text-white text-center">
                <Video className="h-16 w-16 mx-auto mb-4" />
                <p>Video content not available</p>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{videoProgress}%</span>
            </div>
            <Progress value={videoProgress} className="h-2" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedSubtopic(null);
              setVideoProgress(0);
            }}
          >
            Back to Curriculum
          </Button>
          <Button
            onClick={() => {
              if (selectedTopic) {
                handleVideoEnd(selectedTopic, selectedSubtopic);
              }
            }}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark as Completed
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const renderCurriculum = () => {
    if (!enrollment || !enrollment.progress || enrollment.progress.length === 0) {
      return (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center text-gray-500">
              <BookOpen className="h-8 w-8 mx-auto mb-2" />
              <p>No curriculum available</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {enrollment.progress.map((topic, topicIndex) => {
          const topicProgress = getTopicProgress(topic.topicName);
          const examResult = getExamResult(topic.topicName);

          return (
            <Card key={topicIndex} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {topic.topicName}
                      {topicProgress >= 100 && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </CardTitle>
                    <CardDescription>
                      {topic.subtopics.length} videos • {Math.floor(topic.topicTotalDuration / 60)} minutes
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <Badge variant={topicProgress >= 100 ? "default" : "secondary"}>
                      {Math.round(topicProgress)}% Complete
                    </Badge>
                    {examResult && (
                      <div className="mt-2">
                        <Badge variant={examResult.passed ? "default" : "destructive"}>
                          Exam: {examResult.score}%
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
                
                <Progress value={topicProgress} className="h-2" />
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  {topic.subtopics.map((subtopic, subtopicIndex) => {
                    const subtopicProgress = subtopic.watchedDuration || 0;
                    const progressPercent = subtopic.totalDuration > 0 
                      ? (subtopicProgress / subtopic.totalDuration) * 100 
                      : 0;

                    return (
                      <div
                        key={subtopicIndex}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedSubtopic?.subTopicName === subtopic.subTopicName 
                            ? 'bg-blue-50 border-blue-200' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setSelectedTopic(topic.topicName);
                          setSelectedSubtopic({
                            name: subtopic.subTopicName,
                            link: subtopic.subTopicLink,
                            duration: subtopic.totalDuration
                          });
                          setVideoProgress(progressPercent);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            progressPercent >= 100 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-blue-100 text-blue-600'
                          }`}>
                            {progressPercent >= 100 ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{subtopic.subTopicName}</p>
                            <p className="text-sm text-gray-500">
                              {Math.floor(subtopic.totalDuration / 60)}min {subtopic.totalDuration % 60}sec
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress value={progressPercent} className="w-20 h-2" />
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
              
              <CardFooter>
                <Button
                  onClick={() => handleTakeExam(topic.topicName)}
                  disabled={topicProgress < 100}
                  variant={examResult ? "outline" : "default"}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {examResult ? 'Retake Exam' : 'Take Topic Exam'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderProgress = () => {
    if (!enrollment) return null;

    const overallProgress = getOverallProgress();
    const completedTopics = enrollment.progress.filter(topic => 
      topic.topicWatchedDuration >= topic.topicTotalDuration
    ).length;
    const totalTopics = enrollment.progress.length;

    return (
      <div className="space-y-6">
        {/* Overall Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Course Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Overall Completion</span>
                <span className="font-bold text-blue-600">{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{completedTopics}</p>
                <p className="text-sm text-gray-600">Topics Completed</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {enrollment.progress.filter(t => t.passed).length}
                </p>
                <p className="text-sm text-gray-600">Exams Passed</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Final Exam Eligibility</span>
                <Badge variant={enrollment.finalExamEligible ? "default" : "secondary"}>
                  {enrollment.finalExamEligible ? 'Eligible' : 'Not Eligible'}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Course Status</span>
                <Badge variant={enrollment.courseCompleted ? "default" : "secondary"}>
                  {enrollment.courseCompleted ? 'Completed' : 'In Progress'}
                </Badge>
              </div>

              {enrollment.finalExamEligible && !enrollment.courseCompleted && (
                <Button onClick={handleTakeFinalExam} className="w-full">
                  <Zap className="h-4 w-4 mr-2" />
                  Take Final Exam
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Certificate Section */}
        {enrollment.courseCompleted && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Award className="h-5 w-5" />
                Certificate Available
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-600 mb-4">
                Congratulations! You have successfully completed this course and earned your certificate.
              </p>
              <Button onClick={handleDownloadCertificate} className="bg-green-600 hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                Download Certificate
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Final Exam Results */}
        {getFinalExamResult() && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Final Exam Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">Final Exam Score</p>
                  <p className="text-sm text-gray-600">
                    Attempt {getFinalExamResult()?.attemptNumber} •{' '}
                    {new Date(getFinalExamResult()?.attemptedAt || '').toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={getFinalExamResult()?.passed ? "default" : "destructive"}>
                  {getFinalExamResult()?.score}% - {getFinalExamResult()?.passed ? 'Passed' : 'Failed'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <div className="text-center text-gray-600">Loading your learning content...</div>
        </div>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center py-16">
            <CardContent>
              <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Enrollment Not Found</h3>
              <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
                We couldn't find the requested enrollment. Please check the URL or contact support.
              </p>
              <Button onClick={() => navigate('/student-dashboard')}>
                <Home className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/student-dashboard')}
            className="mb-4"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {enrollment.courseId?.title || 'Course Title Not Available'}
                </h1>
                <p className="text-lg text-gray-600 mb-4">
                  {enrollment.internshipId?.title || 'Internship'} • {enrollment.internshipId?.companyName || 'Company'}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    <BookOpen className="h-3 w-3 mr-1" />
                    {enrollment.courseId?.stream || 'Stream'}
                  </Badge>
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {enrollment.totalVideoDuration ? Math.floor(enrollment.totalVideoDuration / 60) : 0} hours
                  </Badge>
                  <Badge variant="outline">
                    <Video className="h-3 w-3 mr-1" />
                    {enrollment.progress?.reduce((total, topic) => total + topic.subtopics.length, 0) || 0} videos
                  </Badge>
                  {enrollment.isPaid && (
                    <Badge variant="default" className="bg-green-600">
                      Paid Program
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="mt-4 lg:mt-0 lg:text-right">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {Math.round(getOverallProgress())}%
                </div>
                <p className="text-gray-600">Overall Progress</p>
                <Progress value={getOverallProgress()} className="w-32 h-2 mt-2" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Video Player */}
          <div className="lg:w-2/3">
            {renderVideoPlayer()}
          </div>

          {/* Right Sidebar - Navigation & Progress */}
          <div className="lg:w-1/3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="curriculum">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Curriculum
                </TabsTrigger>
                <TabsTrigger value="progress">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Progress
                </TabsTrigger>
              </TabsList>

              <TabsContent value="curriculum" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Content</CardTitle>
                    <CardDescription>
                      {enrollment.progress?.length || 0} topics • {enrollment.progress?.reduce((total, topic) => total + topic.subtopics.length, 0) || 0} videos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderCurriculum()}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="progress">
                {renderProgress()}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APInternshipLearningPage;
