// components/student/APStudentDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Video, Award, Clock, Play, CheckCircle, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface APEnrollment {
  _id: string;
  courseId: {
    _id: string;
    title: string;
    stream: string;
    totalDuration: number;
    curriculum: Topic[];
    instructorName: string;
  };
  internshipId: {
    _id: string;
    title: string;
    companyName: string;
    duration: string;
    mode: string;
  };
  progress: TopicProgress[];
  totalWatchedDuration: number;
  totalVideoDuration: number;
  finalExamEligible: boolean;
  finalExamAttempted: boolean;
  courseCompleted: boolean;
  enrollmentDate: string;
}

interface Topic {
  topicName: string;
  subtopics: Subtopic[];
}

interface Subtopic {
  name: string;
  link: string;
  duration: number;
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

const APStudentDashboard = () => {
  const [enrollments, setEnrollments] = useState<APEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnrollment, setSelectedEnrollment] = useState<APEnrollment | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<{ link: string; title: string } | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch('/api/internships/ap-enrollments/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setEnrollments(data.enrollments);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your enrollments',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (enrollmentId: string, topicName: string, subTopicName: string, watchedDuration: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/internships/ap-enrollments/progress', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          enrollmentId,
          topicName,
          subTopicName,
          watchedDuration
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchEnrollments(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const playVideo = (enrollment: APEnrollment, topicName: string, subtopic: Subtopic) => {
    setSelectedEnrollment(enrollment);
    setCurrentVideo({
      link: subtopic.link,
      title: `${topicName} - ${subtopic.name}`
    });
    setShowVideoPlayer(true);

    // Start tracking progress
    const interval = setInterval(() => {
      if (selectedEnrollment) {
        updateProgress(enrollment._id, topicName, subtopic.name, subtopic.duration);
      }
    }, 30000); // Update every 30 seconds

    // Clear interval when component unmounts
    return () => clearInterval(interval);
  };

  const getCompletionPercentage = (enrollment: APEnrollment) => {
    if (enrollment.totalVideoDuration === 0) return 0;
    return (enrollment.totalWatchedDuration / enrollment.totalVideoDuration) * 100;
  };

  const getTopicProgress = (enrollment: APEnrollment, topicName: string) => {
    const topic = enrollment.progress.find(t => t.topicName === topicName);
    if (!topic) return 0;
    if (topic.topicTotalDuration === 0) return 0;
    return (topic.topicWatchedDuration / topic.topicTotalDuration) * 100;
  };

  const isSubtopicCompleted = (enrollment: APEnrollment, topicName: string, subtopicName: string) => {
    const topic = enrollment.progress.find(t => t.topicName === topicName);
    if (!topic) return false;
    const subtopic = topic.subtopics.find(s => s.subTopicName === subtopicName);
    if (!subtopic) return false;
    return subtopic.watchedDuration >= subtopic.totalDuration * 0.9; // 90% watched
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <div className="text-center text-gray-600">Loading your courses...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My AP Internships</h1>
          <p className="text-gray-600">Track your progress in AP exclusive internship programs</p>
        </div>

        {enrollments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No enrollments yet</h3>
              <p className="text-gray-600 mb-4">You haven't enrolled in any AP internship programs.</p>
              <Button onClick={() => window.location.href = '/ap-internships'}>
                Browse AP Internships
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {enrollments.map((enrollment) => (
              <Card key={enrollment._id} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{enrollment.courseId.title}</CardTitle>
                      <CardDescription>
                        {enrollment.internshipId.companyName} • {enrollment.internshipId.duration}
                        {enrollment.internshipId.mode === 'Paid' && ' • Paid Program'}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={
                          enrollment.courseCompleted ? "default" : 
                          getCompletionPercentage(enrollment) >= 80 ? "secondary" : "outline"
                        }
                      >
                        {enrollment.courseCompleted ? 'Completed' : 
                         getCompletionPercentage(enrollment) >= 80 ? 'Exam Ready' : 'In Progress'}
                      </Badge>
                      <div className="text-sm text-gray-600 mt-1">
                        Instructor: {enrollment.courseId.instructorName}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Overall Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Overall Progress</span>
                        <span>{getCompletionPercentage(enrollment).toFixed(1)}%</span>
                      </div>
                      <Progress value={getCompletionPercentage(enrollment)} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>{enrollment.totalWatchedDuration} mins watched</span>
                        <span>{enrollment.totalVideoDuration} mins total</span>
                      </div>
                    </div>

                    {/* Topics */}
                    <div className="space-y-3">
                      <h4 className="font-semibold">Course Content</h4>
                      {enrollment.courseId.curriculum.map((topic) => (
                        <div key={topic.topicName} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-3">
                            <h5 className="font-medium">{topic.topicName}</h5>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {getTopicProgress(enrollment, topic.topicName).toFixed(0)}%
                              </Badge>
                              {enrollment.progress.find(t => t.topicName === topic.topicName)?.passed && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {topic.subtopics.map((subtopic) => (
                              <div
                                key={subtopic.name}
                                className={`flex justify-between items-center p-2 rounded ${
                                  isSubtopicCompleted(enrollment, topic.topicName, subtopic.name)
                                    ? 'bg-green-50 border border-green-200'
                                    : 'bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center space-x-3">
                                  {isSubtopicCompleted(enrollment, topic.topicName, subtopic.name) ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Play className="h-4 w-4 text-gray-400" />
                                  )}
                                  <span className="text-sm">{subtopic.name}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <span className="text-xs text-gray-600">{subtopic.duration} mins</span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => playVideo(enrollment, topic.topicName, subtopic)}
                                  >
                                    <Video className="h-3 w-3 mr-1" />
                                    Watch
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Topic Exam */}
                          {enrollment.progress.find(t => t.topicName === topic.topicName)?.examAttempted && (
                            <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="text-sm font-medium">Topic Exam: </span>
                                  <span className={`text-sm ${
                                    enrollment.progress.find(t => t.topicName === topic.topicName)?.passed
                                      ? 'text-green-600'
                                      : 'text-red-600'
                                  }`}>
                                    {enrollment.progress.find(t => t.topicName === topic.topicName)?.score}%
                                    {enrollment.progress.find(t => t.topicName === topic.topicName)?.passed ? ' (Passed)' : ' (Failed)'}
                                  </span>
                                </div>
                                <Button size="sm" variant="outline">
                                  <FileText className="h-3 w-3 mr-1" />
                                  Retake Exam
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex space-x-2">
                    {enrollment.finalExamEligible && !enrollment.finalExamAttempted && (
                      <Button>
                        <Award className="h-4 w-4 mr-2" />
                        Take Final Exam
                      </Button>
                    )}
                    {enrollment.finalExamAttempted && (
                      <Badge variant={enrollment.courseCompleted ? "default" : "secondary"}>
                        {enrollment.courseCompleted ? 'Course Completed' : 'Final Exam Attempted'}
                      </Badge>
                    )}
                  </div>
                  {enrollment.courseCompleted && (
                    <Button variant="outline">
                      <Award className="h-4 w-4 mr-2" />
                      Download Certificate
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Video Player Dialog */}
        {showVideoPlayer && currentVideo && (
          <Dialog open={showVideoPlayer} onOpenChange={setShowVideoPlayer}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{currentVideo.title}</DialogTitle>
              </DialogHeader>
              <div className="aspect-video bg-black rounded-lg">
                {/* You can integrate with a proper video player here */}
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <Video className="h-16 w-16 mx-auto mb-4" />
                    <p>Video Player</p>
                    <p className="text-sm text-gray-400 mt-2">{currentVideo.link}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setShowVideoPlayer(false)}>Close</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default APStudentDashboard;