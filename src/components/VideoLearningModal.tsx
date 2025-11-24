// components/VideoLearningModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle2, 
  Clock, 
  X,
  ExternalLink
} from 'lucide-react';
import { pack365Api } from '@/services/pack365Api';

interface Topic {
  name: string;
  link: string;
  duration: number;
}

interface Course {
  _id: string;
  courseId: string;
  courseName: string;
}

interface VideoLearningModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: Topic | null;
  course: Course | null;
  onProgressUpdate: (progress: any) => void;
}

const VideoLearningModal: React.FC<VideoLearningModalProps> = ({
  isOpen,
  onClose,
  topic,
  course,
  onProgressUpdate
}) => {
  const { toast } = useToast();
  const [videoProgress, setVideoProgress] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && topic) {
      startProgressTracking();
    } else {
      stopProgressTracking();
    }

    return () => {
      stopProgressTracking();
    };
  }, [isOpen, topic]);

  const extractYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const startProgressTracking = () => {
    if (!topic) return;

    startTimeRef.current = Date.now();
    setIsTracking(true);
    setIsCompleted(false);
    setVideoProgress(0);

    // Simulate progress tracking (in real app, use YouTube API)
    progressIntervalRef.current = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const totalSeconds = topic.duration * 60;
      const progress = Math.min((elapsedSeconds / totalSeconds) * 100, 100);

      setVideoProgress(progress);

      // Auto-complete at 80% watched
      if (progress >= 80 && !isCompleted) {
        handleAutoComplete();
      }
    }, 1000);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setIsTracking(false);
  };

  const handleAutoComplete = async () => {
    if (!topic || !course || isCompleted) return;

    setIsCompleted(true);
    stopProgressTracking();

    try {
      const watchedDuration = Math.floor(topic.duration * 60 * 0.8); // 80% of total duration

      const response = await pack365Api.updateTopicProgress({
        courseId: course._id,
        topicName: topic.name,
        watchedDuration: watchedDuration
      });

      if (response.success) {
        toast({
          title: 'Progress Updated',
          description: `"${topic.name}" marked as completed!`,
          variant: 'default'
        });

        // Notify parent component
        onProgressUpdate(response);
      }
    } catch (error: any) {
      console.error('Error updating progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to update progress',
        variant: 'destructive'
      });
    }
  };

  const handleManualComplete = async () => {
    if (!topic || !course) return;

    setIsCompleted(true);
    stopProgressTracking();

    try {
      const watchedDuration = topic.duration * 60; // Full duration

      const response = await pack365Api.updateTopicProgress({
        courseId: course._id,
        topicName: topic.name,
        watchedDuration: watchedDuration
      });

      if (response.success) {
        toast({
          title: 'Topic Completed!',
          description: `"${topic.name}" has been completed.`,
          variant: 'default'
        });

        onProgressUpdate(response);
        
        // Close modal after a delay
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error completing topic:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark topic as completed',
        variant: 'destructive'
      });
    }
  };

  const handleOpenInNewTab = () => {
    if (topic) {
      window.open(topic.link, '_blank');
    }
  };

  if (!topic || !course) return null;

  const videoId = extractYouTubeVideoId(topic.link);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-full h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{topic.name}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInNewTab}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Open in New Tab
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col">
          {/* Video Embed */}
          <div 
            ref={videoContainerRef}
            className="flex-1 bg-black rounded-lg mb-4"
          >
            {videoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title={topic.name}
                className="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center">
                  <p className="text-lg mb-4">Video not available</p>
                  <Button 
                    onClick={handleOpenInNewTab}
                    variant="default"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Video Link
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Progress Tracking */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Watching Progress</span>
              <span className="text-sm text-gray-600">{Math.round(videoProgress)}%</span>
            </div>
            <Progress value={videoProgress} className="h-2 mb-4" />
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {isCompleted ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                ) : isTracking ? (
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Tracking your progress...
                  </span>
                ) : (
                  <span>Ready to start</span>
                )}
              </div>
              
              <Button
                onClick={handleManualComplete}
                variant="default"
                size="sm"
                disabled={isCompleted}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {isCompleted ? 'Completed' : 'Mark as Completed'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoLearningModal;
