
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, CheckCircle, Download, FileText } from 'lucide-react';

interface CourseVideoPlayerProps {
  courseTitle: string;
  currentLesson: number;
  onMarkComplete: () => void;
  isCompleted: boolean;
}

const lessons = [
  {
    id: 0,
    title: 'HTML Basics',
    description: 'Learn the fundamental building blocks of web pages with HTML. This lesson covers essential HTML tags, document structure, and semantic markup.',
    videoUrl: 'https://youtu.be/5IEMnRHl05Y',
    duration: '15:30'
  },
  {
    id: 1,
    title: 'CSS Styling',
    description: 'Master the art of styling web pages with CSS. Learn selectors, properties, and how to create beautiful layouts.',
    videoUrl: 'https://youtu.be/example',
    duration: '18:45'
  },
  {
    id: 2,
    title: 'JavaScript Basics',
    description: 'Introduction to JavaScript programming. Variables, functions, and DOM manipulation fundamentals.',
    videoUrl: 'https://youtu.be/example',
    duration: '22:15'
  }
];

const CourseVideoPlayer = ({ courseTitle, currentLesson, onMarkComplete, isCompleted }: CourseVideoPlayerProps) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const lesson = lessons[currentLesson] || lessons[0];

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const videoId = extractVideoId(lesson.videoUrl);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">{lesson.title}</CardTitle>
            <p className="text-gray-600 mt-1">{lesson.description}</p>
            <div className="flex items-center space-x-4 mt-2">
              <Badge variant="outline">
                <PlayCircle className="h-3 w-3 mr-1" />
                {lesson.duration}
              </Badge>
              {isCompleted && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Video Player */}
        <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
          {!isVideoPlaying ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="text-center">
                <Button
                  onClick={() => setIsVideoPlaying(true)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 mb-4"
                  size="lg"
                >
                  <PlayCircle className="h-8 w-8 mr-2" />
                  Watch Lesson
                </Button>
                <p className="text-white/80 text-sm">Click to start: {lesson.title}</p>
              </div>
            </div>
          ) : videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title={lesson.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
              <div className="text-center">
                <PlayCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Video Player</p>
                <p className="text-sm opacity-75">{lesson.title} - {lesson.duration}</p>
              </div>
            </div>
          )}
        </div>

        {/* Video Controls */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-3">
            <Button
              onClick={() => setShowTranscript(!showTranscript)}
              variant="outline"
              size="sm"
            >
              <FileText className="h-4 w-4 mr-2" />
              {showTranscript ? 'Hide' : 'Show'} Transcript
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download Notes
            </Button>
          </div>
          
          <Button 
            onClick={onMarkComplete}
            disabled={isCompleted}
            className={isCompleted ? 'bg-green-600' : ''}
          >
            {isCompleted ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Completed
              </>
            ) : (
              'Mark as Complete'
            )}
          </Button>
        </div>

        {/* Transcript */}
        {showTranscript && (
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Video Transcript</h4>
              <div className="text-sm text-gray-700 space-y-2">
                <p><strong>[00:00]</strong> Welcome to HTML Basics! In this lesson, we'll cover the fundamental building blocks of web development.</p>
                <p><strong>[01:30]</strong> HTML stands for HyperText Markup Language. It's the standard markup language for creating web pages.</p>
                <p><strong>[03:15]</strong> Let's start with the basic structure of an HTML document. Every HTML document begins with a DOCTYPE declaration...</p>
                <p><strong>[05:45]</strong> Now let's look at some essential HTML tags like headings, paragraphs, and links...</p>
                <p className="text-gray-500 italic">Transcript continues...</p>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseVideoPlayer;
