/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize, CheckCircle, BookOpen, Clock, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { pack365Api, Pack365Course, TopicProgress } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import YouTube from 'react-youtube';

const CourseLearningInterface = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const playerRef = useRef<any>(null);
  
  const [course, setCourse] = useState<Pack365Course | null>(null);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [watchedDuration, setWatchedDuration] = useState(0);
  const [topicProgress, setTopicProgress] = useState<TopicProgress[]>([]);
  const [videoProgress, setVideoProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [totalCourseDuration, setTotalCourseDuration] = useState(0);
  const [totalWatchedPercentage, setTotalWatchedPercentage] = useState(0);

  const player = playerRef.current;
  const currentTopic = course?.topics[currentTopicIndex];
  const currentTopicProgress = topicProgress.find(tp => tp.topicName === currentTopic?.title);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) {
        toast({
          title: "Error",
          description: "Course ID is missing.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access this course.",
          variant: "destructive",
        });
        navigate('/login');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await pack365Api.getCourseById(courseId, token);
        if (response.success && response.data) {
          setCourse(response.data);

          // Calculate total course duration
          const totalDuration = response.data.topics.reduce((acc, topic) => {
            const duration = parseInt(topic.duration, 10) || 0;
            return acc + duration;
          }, 0);
          setTotalCourseDuration(totalDuration * 60); // Store in seconds

          // Fetch initial topic progress
          const initialTopicProgress = response.data.topics.map(topic => ({
            topicName: topic.title,
            watched: false,
            watchedDuration: 0,
          }));
          setTopicProgress(initialTopicProgress);
        } else {
          toast({
            title: "Error",
            description: "Failed to load course details.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error('Error fetching course details:', error);
        toast({
          title: "Error",
          description: "Failed to load course. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, navigate, toast]);

  useEffect(() => {
    if (!isPlaying || !player) return;

    const interval = setInterval(() => {
      if (player && typeof player.getCurrentTime === 'function') {
        const time = player.getCurrentTime();
        setCurrentTime(time);
        
        if (time > watchedDuration) {
          setWatchedDuration(time);
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [isPlaying, player, watchedDuration]);

  const calculateTotalWatchedPercentage = (updatedTopicProgress: TopicProgress[]) => {
    if (!course || !course.topics || course.topics.length === 0) return 0;
    
    const totalTopics = course.topics.length;
    const completedTopics = updatedTopicProgress.filter(tp => tp.watched).length;
    
    return Math.round((completedTopics / totalTopics) * 100);
  };

  const updateProgress = async (
    topicName: string,
    duration: number,
    totalCourseDuration?: number,
    totalWatchedPercentage?: number
  ) => {
    const token = localStorage.getItem('token');
    if (!token || !courseId) return;

    try {
      console.log('Updating progress:', {
        courseId,
        topicName,
        watchedDuration: Math.floor(duration),
        totalCourseDuration,
        totalWatchedPercentage
      });

      const response = await pack365Api.updateTopicProgress(token, {
        courseId,
        topicName,
        watchedDuration: Math.floor(duration),
        totalCourseDuration,
        totalWatchedPercentage,
      });

      if (response.success) {
        console.log('Progress update response:', response);
        setTopicProgress(response.topicProgress);
        setVideoProgress(response.videoProgress);
        
        // Update total watched percentage from response or calculate it
        const newTotalWatchedPercentage = response.totalWatchedPercentage || calculateTotalWatchedPercentage(response.topicProgress);
        setTotalWatchedPercentage(newTotalWatchedPercentage);

        const updatedTopic = response.topicProgress.find(tp => tp.topicName === topicName);
        if (updatedTopic?.watched) {
          toast({
            title: 'Topic Completed!',
            description: `You've successfully completed: ${topicName}`,
          });
        }
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleTopicSelect = (index: number) => {
    // Save current progress before switching
    if (currentTopic && watchedDuration > 0) {
      const calculatedTotalWatchedPercentage = calculateTotalWatchedPercentage(topicProgress);
      updateProgress(currentTopic.title, watchedDuration, totalCourseDuration, calculatedTotalWatchedPercentage);
    }
    
    setCurrentTopicIndex(index);
    setCurrentTime(0);
    setWatchedDuration(0);
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    if (player) {
      if (isPlaying) {
        player.pauseVideo();
        setIsPlaying(false);
      } else {
        player.playVideo();
        setIsPlaying(true);
      }
    }
  };

  const handleSkipBack = () => {
    if (player) {
      const newTime = Math.max(0, currentTime - 10);
      player.seekTo(newTime);
      setCurrentTime(newTime);
      setWatchedDuration(newTime);
    }
  };

  const handleSkipForward = () => {
    if (player) {
      const newTime = Math.min(videoDuration, currentTime + 10);
      player.seekTo(newTime);
      setCurrentTime(newTime);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const actualVideoDuration = videoDuration || (currentTopic?.duration ? parseInt(currentTopic.duration) * 60 : 0);
  const topicWatchPercentage = actualVideoDuration > 0 ? Math.min((Math.max(watchedDuration, currentTopicProgress?.watchedDuration || 0) / actualVideoDuration) * 100, 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">{course.courseName}</h1>
            <p className="text-gray-600">Overall Progress: {totalWatchedPercentage}%</p>
          </div>
          <div className="w-24" /> {/* Spacer for alignment */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Video Player Section */}
          <div className="lg:col-span-3">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{currentTopic?.title}</span>
                  <Badge variant={currentTopicProgress?.watched ? "default" : "secondary"}>
                    {currentTopicProgress?.watched ? "Completed" : "In Progress"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentTopic?.videoUrl && (
                  <div className="space-y-4">
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <YouTube
                        videoId={currentTopic.videoUrl}
                        onReady={(event) => {
                          playerRef.current = event.target;
                          setVideoDuration(event.target.getDuration());
                        }}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnd={() => {
                          const calculatedTotalWatchedPercentage = calculateTotalWatchedPercentage(topicProgress);
                          updateProgress(currentTopic.title, actualVideoDuration, totalCourseDuration, calculatedTotalWatchedPercentage);
                          setIsPlaying(false);
                        }}
                        opts={{
                          width: '100%',
                          height: '100%',
                          playerVars: {
                            autoplay: 0,
                            controls: 1,
                            modestbranding: 1,
                            rel: 0,
                          },
                        }}
                        className="w-full h-full"
                      />
                    </div>

                    {/* Video Controls Info */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      {formatTime(currentTime)} / {formatTime(actualVideoDuration)}
                    </div>
                    
                    {/* Topic Navigation */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTopicSelect(Math.max(0, currentTopicIndex - 1))}
                        disabled={currentTopicIndex === 0}
                      >
                        <SkipBack className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTopicSelect(Math.min(course.topics.length - 1, currentTopicIndex + 1))}
                        disabled={currentTopicIndex === course.topics.length - 1}
                      >
                        Next
                        <SkipForward className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Course Content Tabs */}
            <Tabs defaultValue="description" className="space-y-4">
              <TabsList>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="description">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-gray-700">{currentTopic?.description || course.description}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="resources">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-gray-500">Resources will be available here.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-gray-500">Take notes while learning.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Course Topics Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Topics</CardTitle>
                <div className="text-sm text-gray-600">
                  {topicProgress.filter(tp => tp.watched).length} / {course.topics.length} completed
                </div>
                <Progress 
                  value={totalWatchedPercentage} 
                  className="mt-2" 
                />
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {course.topics.map((topic, index) => {
                    const progress = topicProgress.find(tp => tp.topicName === topic.title);
                    const isCompleted = progress?.watched || false;
                    const isCurrent = index === currentTopicIndex;

                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          isCurrent 
                            ? 'bg-blue-100 border-blue-300 border' 
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                        onClick={() => handleTopicSelect(index)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`mt-1 ${isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${isCurrent ? 'text-blue-900' : 'text-gray-900'}`}>
                              {topic.title}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">{topic.duration} min</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLearningInterface;
