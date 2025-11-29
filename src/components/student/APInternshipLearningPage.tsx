// components/student/APInternshipLearningPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  BookOpen, 
  Video, 
  Play, 
  CheckCircle, 
  Clock, 
  FileText, 
  Award,
  ArrowLeft,
  ChevronRight,
  BarChart3,
  Zap
} from 'lucide-react';

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

interface Enrollment {
  _id: string;
  courseId: {
    _id: string;
    title: string;
    curriculum: Topic[];
    totalDuration: number;
    stream: string;
    providerName: string;
    instructorName: string;
  };
  progress: {
    topicName: string;
    subtopics: {
      subTopicName: string;
      subTopicLink: string;
      watchedDuration: number;
      totalDuration: number;
    }[];
    topicWatchedDuration: number;
    topicTotalDuration: number;
    examAttempted: boolean;
    examScore: number;
    passed: boolean;
  }[];
  totalWatchedDuration: number;
  totalVideoDuration: number;
  finalExamEligible: boolean;
  courseCompleted: boolean;
}

const APInternshipLearningPage = () => {
  const { enrollmentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTopic, setActiveTopic] = useState<string>('');
  const [activeSubtopic, setActiveSubtopic] = useState<string>('');
  const [videoProgress, setVideoProgress] = useState(0);

  useEffect(() => {
    fetchEnrollmentData();
  }, [enrollmentId]);

  const fetchEnrollmentData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/internships/apinternshipmy-enrollments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        const currentEnrollment = data.enrollments.find((e: any) => e._id === enrollmentId);
        setEnrollment(currentEnrollment);
        
        // Set first topic and subtopic as active
        if (currentEnrollment?.courseId?.curriculum?.length > 0) {
          const firstTopic = currentEnrollment.courseId.curriculum[0];
          setActiveTopic(firstTopic.topicName);
          if (firstTopic.subtopics.length > 0) {
            setActiveSubtopic(firstTopic.subtopics[0].name);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching enrollment:', error);
      toast({
        title: 'Error',
        description: 'Failed to load course content',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (subtopicName: string, watchedDuration: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/internships/apinternshipenrollment-progress', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          enrollmentId,
          topicName: activeTopic,
          subTopicName: subtopicName,
          watchedDuration
        })
      });
      
      // Refresh enrollment data
      fetchEnrollmentData();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const getTopicProgress = (topicName: string) => {
    if (!enrollment) return 0;
    const topic = enrollment.progress.find(p => p.topicName === topicName);
    return topic ? (topic.topicWatchedDuration / topic.topicTotalDuration) * 100 : 0;
  };

  const getSubtopicProgress = (topicName: string, subtopicName: string) => {
    if (!enrollment) return 0;
    const topic = enrollment.progress.find(p => p.topicName === topicName);
    if (!topic) return 0;
    const subtopic = topic.subtopics.find(s => s.subTopicName === subtopicName);
    return subtopic ? (subtopic.watchedDuration / subtopic.totalDuration) * 100 : 0;
  };

  const handleVideoProgress = (subtopicName: string, currentTime: number, duration: number) => {
    const progress = (currentTime / duration) * 100;
    setVideoProgress(progress);
    
    // Update progress every 10 seconds or when significant progress is made
    if (progress % 10 === 0 || progress > 95) {
      updateProgress(subtopicName, currentTime);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course content...</p>
        </div>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Enrollment Not Found</h2>
          <Button onClick={() => navigate('/student/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const currentTopic = enrollment.courseId.curriculum.find(t => t.topicName === activeTopic);
  const currentSubtopic = currentTopic?.subtopics.find(s => s.name === activeSubtopic);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => navigate('/student/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="ml-6">
                <h1 className="text-xl font-bold text-gray-900">{enrollment.courseId.title}</h1>
                <p className="text-sm text-gray-600">
                  {enrollment.courseId.stream} • {enrollment.courseId.providerName}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">Overall Progress</p>
                <Progress 
                  value={(enrollment.totalWatchedDuration / enrollment.totalVideoDuration) * 100} 
                  className="w-32 h-2"
                />
                <p className="text-xs text-gray-600 mt-1">
                  {Math.round((enrollment.totalWatchedDuration / enrollment.totalVideoDuration) * 100)}% Complete
                </p>
              </div>
              
              {enrollment.finalExamEligible && (
                <Button 
                  onClick={() => navigate(`/exams/final/${enrollment.courseId._id}`)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Take Final Exam
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Course Content */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Course Content
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                  {enrollment.courseId.curriculum.map((topic, topicIndex) => (
                    <div key={topic.topicName} className="border-b last:border-b-0">
                      <div
                        className={`p-4 cursor-pointer hover:bg-gray-50 ${
                          activeTopic === topic.topicName ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                        }`}
                        onClick={() => setActiveTopic(topic.topicName)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                              getTopicProgress(topic.topicName) === 100 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {getTopicProgress(topic.topicName) === 100 ? '✓' : topicIndex + 1}
                            </div>
                            <span className="ml-3 font-medium">{topic.topicName}</span>
                          </div>
                          <ChevronRight className={`h-4 w-4 transition-transform ${
                            activeTopic === topic.topicName ? 'rotate-90' : ''
                          }`} />
                        </div>
                        
                        <div className="mt-2 ml-9">
                          <Progress 
                            value={getTopicProgress(topic.topicName)} 
                            className="h-1"
                          />
                          <div className="flex justify-between text-xs text-gray-600 mt-1">
                            <span>{Math.round(getTopicProgress(topic.topicName))}% complete</span>
                            <span>{topic.subtopics.length} lessons</span>
                          </div>
                        </div>
                      </div>

                      {/* Subtopic List */}
                      {activeTopic === topic.topicName && (
                        <div className="bg-gray-50">
                          {topic.subtopics.map((subtopic, subtopicIndex) => {
                            const progress = getSubtopicProgress(topic.topicName, subtopic.name);
                            return (
                              <div
                                key={subtopic.name}
                                className={`p-3 pl-12 border-t cursor-pointer hover:bg-white ${
                                  activeSubtopic === subtopic.name ? 'bg-white' : ''
                                }`}
                                onClick={() => setActiveSubtopic(subtopic.name)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div className="w-2 h-2 rounded-full bg-gray-400 mr-3"></div>
                                    <span className="text-sm">{subtopic.name}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {progress === 100 && (
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    )}
                                    <span className="text-xs text-gray-500">
                                      {Math.round(subtopic.duration / 60)} min
                                    </span>
                                  </div>
                                </div>
                                {progress > 0 && progress < 100 && (
                                  <Progress value={progress} className="h-1 mt-2" />
                                )}
                              </div>
                            );
                          })}
                          
                          {/* Topic Exam Button */}
                          <div className="p-3 pl-12 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => navigate(`/exams/topic/${enrollment.courseId._id}/${topic.topicName}`)}
                              disabled={getTopicProgress(topic.topicName) < 100}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Take Topic Exam
                              {getTopicProgress(topic.topicName) < 100 && (
                                <Badge variant="secondary" className="ml-2">
                                  Complete videos first
                                </Badge>
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {currentSubtopic ? (
              <Card>
                <CardHeader>
                  <CardTitle>{currentSubtopic.name}</CardTitle>
                  <CardDescription>
                    {currentTopic?.topicName} • {Math.round(currentSubtopic.duration / 60)} minutes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-black rounded-lg mb-4">
                    {/* Video Player Component */}
                    <VideoPlayer
                      videoUrl={currentSubtopic.link}
                      subtopicName={currentSubtopic.name}
                      onProgressUpdate={handleVideoProgress}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <Badge variant={videoProgress === 100 ? "default" : "secondary"}>
                        {videoProgress === 100 ? 'Completed' : 'In Progress'}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        Progress: {Math.round(videoProgress)}%
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          // Navigate to previous subtopic
                          const topic = enrollment.courseId.curriculum.find(t => t.topicName === activeTopic);
                          if (topic) {
                            const currentIndex = topic.subtopics.findIndex(s => s.name === activeSubtopic);
                            if (currentIndex > 0) {
                              setActiveSubtopic(topic.subtopics[currentIndex - 1].name);
                            }
                          }
                        }}
                      >
                        Previous
                      </Button>
                      <Button
                        onClick={() => {
                          // Navigate to next subtopic
                          const topic = enrollment.courseId.curriculum.find(t => t.topicName === activeTopic);
                          if (topic) {
                            const currentIndex = topic.subtopics.findIndex(s => s.name === activeSubtopic);
                            if (currentIndex < topic.subtopics.length - 1) {
                              setActiveSubtopic(topic.subtopics[currentIndex + 1].name);
                            }
                          }
                        }}
                      >
                        Next Lesson
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Lesson</h3>
                  <p className="text-gray-600">
                    Choose a topic and lesson from the sidebar to start learning
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Video Player Component
const VideoPlayer = ({ 
  videoUrl, 
  subtopicName, 
  onProgressUpdate 
}: { 
  videoUrl: string; 
  subtopicName: string;
  onProgressUpdate: (subtopicName: string, currentTime: number, duration: number) => void;
}) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      onProgressUpdate(subtopicName, currentTime, duration);
    }
  };

  return (
    <video
      ref={videoRef}
      className="w-full h-full rounded-lg"
      controls
      onTimeUpdate={handleTimeUpdate}
      onEnded={() => {
        if (videoRef.current) {
          onProgressUpdate(subtopicName, videoRef.current.duration, videoRef.current.duration);
        }
      }}
    >
      <source src={videoUrl} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
};

export default APInternshipLearningPage;
