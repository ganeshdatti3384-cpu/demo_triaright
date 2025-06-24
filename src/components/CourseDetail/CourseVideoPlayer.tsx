
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlayCircle } from 'lucide-react';

interface CourseVideoPlayerProps {
  courseTitle: string;
}

const CourseVideoPlayer = ({ courseTitle }: CourseVideoPlayerProps) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
          {!isVideoPlaying ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <Button
                onClick={() => setIsVideoPlaying(true)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                size="lg"
              >
                <PlayCircle className="h-8 w-8 mr-2" />
                Watch Preview
              </Button>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
              <p>Video Player Placeholder - {courseTitle} Course Preview</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseVideoPlayer;
