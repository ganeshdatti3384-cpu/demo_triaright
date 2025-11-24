import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, X, ExternalLink } from 'lucide-react';
import { pack365Api } from '@/services/api';

interface VideoLearningModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: any;
  course: any;
  onProgressUpdate: () => void;
}

const VideoLearningModal = ({
  isOpen,
  onClose,
  topic,
  course,
  onProgressUpdate
}: VideoLearningModalProps) => {
  const { toast } = useToast();
  const [videoProgress, setVideoProgress] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isOpen && topic) {
      // Reset progress when modal opens
      setVideoProgress(0);
      setIsTracking(false);
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isOpen, topic]);

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const updateProgress = async (currentTime: number, duration: number) => {
    if (!topic || !course) return;

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
    setVideoProgress(progressPercent);

    // Update progress every 10 seconds or when significant progress is made
    if (progressPercent % 10 === 0 || progressPercent >= 95) {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        await pack365Api.updateTopicProgress(token, {
          courseId: course._id,
          topicName: topic.name,
          watchedDuration: Math.floor(currentTime),
          totalCourseDuration: course.totalDuration
        });

        // If video is 95% complete, mark as watched
        if (progressPercent >= 95 && !isSubmitting) {
          await markAsCompleted();
        }
      } catch (error) {
        console.error('Failed to update progress:', error);
      }
    }
  };

  const markAsCompleted = async () => {
    if (!topic || !course || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await pack365Api.updateTopicProgress(token, {
        courseId: course._id,
        topicName: topic.name,
        watchedDuration: topic.duration,
        totalCourseDuration: course.totalDuration
      });

      toast({
        title: 'Topic Completed!',
        description: `"${topic.name}" has been marked as completed.`,
        variant: 'default'
      });

      onProgressUpdate();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark topic as completed',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualComplete = async () => {
    await markAsCompleted();
  };

  const handleOpenInNewTab = () => {
    if (topic?.link) {
      window.open(topic.link, '_blank');
    }
  };

  const isYouTube = topic?.link?.includes('youtube.com') || topic?.link?.includes('youtu.be');
  const videoId = isYouTube ? extractVideoId(topic.link) : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-full h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{topic?.name}</span>
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
          {topic && (
            <>
              {/* Video Player */}
              <div className="flex-1 bg-black rounded-lg mb-4 flex items-center justify-center">
                {isYouTube && videoId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                    className="w-full h-full rounded-lg"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                ) : (
                  <div className="text-center text-white">
                    <p>Unsupported video platform</p>
                    <Button
                      variant="outline"
                      className="mt-4 text-white border-white"
                      onClick={handleOpenInNewTab}
                    >
                      Open Video
                    </Button>
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
                    {videoProgress >= 95 ? (
                      <span className="flex items-center text-green-600">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Ready to complete
                      </span>
                    ) : (
                      <span className="flex items-center">
                        Progress auto-saves every 10%
                      </span>
                    )}
                  </div>

                  <Button
                    onClick={handleManualComplete}
                    variant="default"
                    size="sm"
                    disabled={isSubmitting}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Marking...' : 'Mark as Completed'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoLearningModal;
