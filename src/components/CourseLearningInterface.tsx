/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  Play,
  Pause,
  Square,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  ArrowLeft,
} from 'lucide-react';
import { pack365Api } from '@/services/api';
import { Pack365Course, EnhancedPack365Enrollment, TopicProgress } from '@/types/api';
import { useNavigate } from 'react-router-dom';

interface CourseLearningInterfaceProps {
  courseId: string;
  course: Pack365Course;
  enrollment: EnhancedPack365Enrollment;
}

const CourseLearningInterface = ({ courseId, course, enrollment }: CourseLearningInterfaceProps) => {
  const [currentTopic, setCurrentTopic] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [watchedDuration, setWatchedDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [topicProgress, setTopicProgress] = useState<TopicProgress[]>(enrollment.topicProgress || []);
  const [videoProgress, setVideoProgress] = useState(enrollment.totalWatchedPercentage || 0);
  const [player, setPlayer] = useState<any>(null);
  const [progressInterval, setProgressInterval] = useState<NodeJS.Timeout | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Calculate total course duration and watched duration
  const calculateProgressMetrics = () => {
    const totalCourseDurationSeconds = course.topics.reduce((sum, topic) => sum + (topic.duration * 60), 0);
    const totalWatchedSeconds = topicProgress.reduce((sum, tp) => sum + tp.watchedDuration, 0);
    const totalWatchedPercentage = totalCourseDurationSeconds > 0 ? Math.round((totalWatchedSeconds / totalCourseDurationSeconds) * 100) : 0;
    
    return {
      totalCourseDurationSeconds,
      totalWatchedSeconds,
      totalWatchedPercentage
    };
  };

  useEffect(() => {
    if (topicProgress.length === 0) {
      const initialProgress = course.topics.map(topic => ({
        topicName: topic.name,
        watched: false,
        watchedDuration: 0,
      }));
      setTopicProgress(initialProgress);
    } else {
      // Update video progress based on current topic progress
      const { totalWatchedPercentage } = calculateProgressMetrics();
      setVideoProgress(totalWatchedPercentage);
    }
  }, [course.topics, topicProgress.length]);

  useEffect(() => {
    // Set initial watched duration from topic progress when switching topics
    const currentTopicData = course.topics[currentTopic];
    const progress = topicProgress.find(tp => tp.topicName === currentTopicData?.name);
    if (progress) {
      setWatchedDuration(progress.watchedDuration);
      setCurrentTime(progress.watchedDuration);
    }
  }, [currentTopic, course.topics, topicProgress]);

  useEffect(() => {
    // Start progress tracking when playing
    if (isPlaying && player) {
      const interval = setInterval(() => {
        const youtubeCurrentTime = player.getCurrentTime();
        setCurrentTime(youtubeCurrentTime);
        setWatchedDuration(Math.max(watchedDuration, youtubeCurrentTime));
      }, 1000);
      setProgressInterval(interval);
    } else {
      if (progressInterval) {
        clearInterval(progressInterval);
        setProgressInterval(null);
      }
    }

    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [isPlaying, player, watchedDuration]);

  const updateProgress = async (
    topicName: string,
    duration: number
  ) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Calculate metrics before API call
      const { totalCourseDurationSeconds } = calculateProgressMetrics();
      
      // Update local topic progress first
      const updatedTopicProgress = topicProgress.map(tp => 
        tp.topicName === topicName 
          ? { ...tp, watchedDuration: Math.floor(duration) }
          : tp
      );
      
      // Calculate new total watched duration and percentage
      const newTotalWatchedSeconds = updatedTopicProgress.reduce((sum, tp) => sum + tp.watchedDuration, 0);
      const newTotalWatchedPercentage = totalCourseDurationSeconds > 0 ? Math.round((newTotalWatchedSeconds / totalCourseDurationSeconds) * 100) : 0;

      const response = await pack365Api.updateTopicProgress(token, {
        courseId,
        topicName,
        watchedDuration: Math.floor(duration),
        totalCourseDuration: totalCourseDurationSeconds,
        totalWatchedPercentage: newTotalWatchedPercentage,
      });

      if (response.success) {
        setTopicProgress(response.topicProgress);
        
        // Use the calculated percentage or fallback to response
        const updatedPercentage = newTotalWatchedPercentage || response.videoProgress || 0;
        setVideoProgress(updatedPercentage);

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
    if (player && watchedDuration > 0) {
      const currentTopicData = course.topics[currentTopic];
      updateProgress(currentTopicData.name, watchedDuration);
    }

    setCurrentTopic(index);
    setWatchedDuration(0);
    setCurrentTime(0);
    setIsPlaying(false);
    if (player) player.stopVideo();
  };

  const handlePlayPause = () => {
    if (!player) return;

    if (isPlaying) {
      player.pauseVideo();
    } else {
      // Seek to the last watched position when playing
      if (watchedDuration > 0) {
        player.seekTo(watchedDuration, true);
      }
      player.playVideo();
    }

    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    if (!player) return;

    player.stopVideo();
    setIsPlaying(false);

    // Get current YouTube time and update progress
    const youtubeCurrentTime = player.getCurrentTime();
    const currentTopicData = course.topics[currentTopic];
    
    if (youtubeCurrentTime > 0) {
      updateProgress(currentTopicData.name, youtubeCurrentTime);
      toast({
        title: 'Progress Saved',
        description: `Your progress has been saved at ${Math.floor(youtubeCurrentTime / 60)}:${(Math.floor(youtubeCurrentTime) % 60).toString().padStart(2, '0')}`,
      });
    }
  };

  const onReady = (event: any) => {
    const playerInstance = event.target;
    setPlayer(playerInstance);
    
    // Get video duration from YouTube
    const duration = playerInstance.getDuration();
    setVideoDuration(duration);
    
    // Seek to last watched position on ready
    const currentTopicData = course.topics[currentTopic];
    const progress = topicProgress.find(tp => tp.topicName === currentTopicData?.name);
    if (progress && progress.watchedDuration > 0) {
      playerInstance.seekTo(progress.watchedDuration, true);
    }
  };

  const onStateChange = (event: any) => {
    const playerState = event.data;
    // YouTube player states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
    setIsPlaying(playerState === 1);
  };

  const onEnd = () => {
    const currentTopicData = course.topics[currentTopic];
    const totalDuration = videoDuration || currentTopicData.duration * 60; // Use YouTube duration or fallback
    updateProgress(currentTopicData.name, totalDuration);
    setIsPlaying(false);
  };

  const getYouTubeId = (url: string): string | null => {
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=|v\/|shorts\/))([\w-]{11})/
    );
    return match ? match[1] : null;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTopicData = course.topics[currentTopic];
  const currentTopicProgress = topicProgress.find(tp => tp.topicName === currentTopicData?.name);
  const completedTopics = topicProgress.filter(tp => tp.watched).length;
  
  // Use YouTube duration if available, otherwise fallback to database duration
  const actualVideoDuration = videoDuration || (currentTopicData ? currentTopicData.duration * 60 : 0);
  const topicWatchPercentage = actualVideoDuration > 0 ? (Math.max(watchedDuration, currentTopicProgress?.watchedDuration || 0) / actualVideoDuration) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate('/pack365')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{currentTopicData?.name}</span>
                  <Badge variant={currentTopicProgress?.watched ? 'default' : 'outline'}>
                    {currentTopicProgress?.watched ? 'Completed' : 'In Progress'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentTopicData?.link && getYouTubeId(currentTopicData.link) ? (
                  <div
                    className="aspect-video mb-4 rounded-lg overflow-hidden relative"
                    id="video-container"
                  >
                    <YouTube
                      videoId={getYouTubeId(currentTopicData.link)}
                      onReady={onReady}
                      onEnd={onEnd}
                      onStateChange={onStateChange}
                      opts={{
                        width: '100%',
                        height: '100%',
                        playerVars: {
                          rel: 0,
                          modestbranding: 1,
                          showinfo: 0,
                        },
                        host: "https://www.youtube-nocookie.com",
                      }}
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="bg-black rounded-lg aspect-video flex items-center justify-center mb-4 text-white text-lg">
                    Video not available
                  </div>
                )}

                {/* Video Controls */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-2">
                    <Button onClick={handlePlayPause} className="flex items-center space-x-2">
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      <span>{isPlaying ? 'Pause' : 'Play'}</span>
                    </Button>

                    <Button onClick={handleStop} variant="outline" className="flex items-center space-x-2">
                      <Square className="h-4 w-4" />
                      <span>Stop</span>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => {
                        const container = document.getElementById('video-container');
                        if (container) {
                          if (document.fullscreenElement) {
                            document.exitFullscreen();
                          } else {
                            container.requestFullscreen().catch(err => {
                              console.error('Fullscreen error:', err);
                            });
                          }
                        }
                      }}
                    >
                      Fullscreen
                    </Button>
                  </div>

                  <div className="text-sm text-gray-600">
                    {formatTime(currentTime)} / {formatTime(actualVideoDuration)}
                  </div>
                </div>
                {/* Topic Navigation */}
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => currentTopic > 0 && handleTopicSelect(currentTopic - 1)}
                    disabled={currentTopic === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => currentTopic < course.topics.length - 1 && handleTopicSelect(currentTopic + 1)}
                    disabled={currentTopic === course.topics.length - 1}
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Course Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-blue-600">{Math.round(videoProgress)}%</div>
                  <p className="text-sm text-gray-600">Complete</p>
                </div>
                <Progress value={Math.round(videoProgress)} className="mb-4" />
                <div className="text-sm text-gray-600">
                  {completedTopics} of {course.topics.length} topics completed
                </div>
              </CardContent>
            </Card>

            {/* Topic List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Course Topics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {course.topics.map((topic, index) => {
                  const progress = topicProgress.find(tp => tp.topicName === topic.name);
                  const topicVideoDuration = index === currentTopic ? actualVideoDuration : (topic.duration * 60);
                  const progressPercentage = progress && topicVideoDuration > 0 ? (progress.watchedDuration / topicVideoDuration) * 100 : 0;
                  
                  return (
                    <div
                      key={index}
                      onClick={() => handleTopicSelect(index)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        currentTopic === index
                          ? 'bg-blue-50 border-2 border-blue-200'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {progress?.watched ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                          )}
                          <span className="text-sm font-medium">{topic.name}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{topic.duration}m</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Progress value={Math.min(progressPercentage, 100)} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{Math.round(Math.min(progressPercentage, 100))}% watched</span>
                          <span>{formatTime(progress?.watchedDuration || 0)} / {formatTime(topicVideoDuration)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Exam Section */}
            {videoProgress >= 80 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Final Exam
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Complete the final exam to get your certificate!
                  </p>
                  <Button className="w-full" onClick={() => navigate(`/exam/${courseId}`)}>
                    Take Exam
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLearningInterface;
