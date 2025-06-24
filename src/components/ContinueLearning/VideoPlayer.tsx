
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Volume2, Maximize, CheckCircle, Clock } from 'lucide-react';
import { Lesson } from '@/data/continueLearningData';

interface VideoPlayerProps {
  lesson: Lesson;
  onComplete: () => void;
  isCompleted: boolean;
}

const VideoPlayer = ({ lesson, onComplete, isCompleted }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <Card>
      <CardContent className="p-0">
        {/* Video Player Area */}
        <div className="relative aspect-video bg-gray-900 rounded-t-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            {!isPlaying ? (
              <Button
                onClick={handlePlayPause}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                size="lg"
              >
                <Play className="h-8 w-8 ml-1" />
              </Button>
            ) : (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <p className="text-white text-lg">Playing: {lesson.title}</p>
                <Button
                  onClick={handlePlayPause}
                  className="absolute bottom-4 left-4 bg-white/20 hover:bg-white/30 text-white"
                  size="sm"
                >
                  <Pause className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          {/* Video Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-white">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{lesson.duration}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  <Volume2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Lesson Info and Actions */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{lesson.title}</h2>
              <p className="text-gray-600">{lesson.description}</p>
            </div>
            <div className="ml-4 flex items-center space-x-2">
              {isCompleted ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Completed
                </Badge>
              ) : (
                <Button onClick={onComplete} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Complete
                </Button>
              )}
            </div>
          </div>

          {/* Transcript Toggle */}
          {lesson.transcript && (
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => setShowTranscript(!showTranscript)}
                className="mb-4"
              >
                {showTranscript ? 'Hide' : 'Show'} Transcript
              </Button>
              
              {showTranscript && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Video Transcript</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{lesson.transcript}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoPlayer;
