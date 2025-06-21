
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Users, Trophy, PlayCircle, CheckCircle, AlertCircle } from 'lucide-react';

const ExamsSection = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const exams = [
    {
      id: 1,
      title: 'Data Structures & Algorithms',
      category: 'Technical',
      duration: '90 minutes',
      questions: 50,
      difficulty: 'Medium',
      status: 'available',
      attempts: 0,
      maxAttempts: 3,
      description: 'Test your knowledge of fundamental data structures and algorithms'
    },
    {
      id: 2,
      title: 'React.js Fundamentals',
      category: 'Technical',
      duration: '60 minutes',
      questions: 30,
      difficulty: 'Easy',
      status: 'completed',
      attempts: 1,
      maxAttempts: 2,
      score: 85,
      description: 'Basic concepts of React.js framework'
    },
    {
      id: 3,
      title: 'Campus Recruitment Aptitude',
      category: 'CRT',
      duration: '120 minutes',
      questions: 100,
      difficulty: 'Medium',
      status: 'in-progress',
      attempts: 1,
      maxAttempts: 1,
      timeRemaining: '45 minutes',
      description: 'Quantitative aptitude for campus placements'
    },
    {
      id: 4,
      title: 'Python Programming',
      category: 'Technical',
      duration: '75 minutes',
      questions: 40,
      difficulty: 'Medium',
      status: 'available',
      attempts: 0,
      maxAttempts: 2,
      description: 'Comprehensive Python programming assessment'
    },
    {
      id: 5,
      title: 'Logical Reasoning',
      category: 'CRT',
      duration: '45 minutes',
      questions: 25,
      difficulty: 'Easy',
      status: 'available',
      attempts: 0,
      maxAttempts: 3,
      description: 'Test your logical and analytical thinking skills'
    }
  ];

  const filteredExams = selectedCategory === 'all' 
    ? exams 
    : exams.filter(exam => exam.category.toLowerCase() === selectedCategory);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case 'available':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'available':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exams.length}</div>
            <p className="text-xs text-muted-foreground">Available for you</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exams.filter(e => e.status === 'completed').length}</div>
            <p className="text-xs text-muted-foreground">Exams completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exams.filter(e => e.status === 'in-progress').length}</div>
            <p className="text-xs text-muted-foreground">Currently taking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">Across all exams</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList>
          <TabsTrigger value="all">All Exams</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="crt">CRT</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          {filteredExams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(exam.status)}
                      <h3 className="font-semibold text-lg">{exam.title}</h3>
                      <Badge className={getStatusColor(exam.status)}>
                        {exam.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{exam.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {exam.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {exam.questions} questions
                      </div>
                      <Badge variant="outline" className={getDifficultyColor(exam.difficulty)}>
                        {exam.difficulty}
                      </Badge>
                      <span>Attempts: {exam.attempts}/{exam.maxAttempts}</span>
                    </div>

                    {exam.status === 'completed' && exam.score && (
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Score</span>
                          <span>{exam.score}%</span>
                        </div>
                        <Progress value={exam.score} className="h-2" />
                      </div>
                    )}

                    {exam.status === 'in-progress' && exam.timeRemaining && (
                      <div className="mt-3">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          Time Remaining: {exam.timeRemaining}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    {exam.status === 'available' && (
                      <Button>Start Exam</Button>
                    )}
                    {exam.status === 'in-progress' && (
                      <Button variant="outline">Resume Exam</Button>
                    )}
                    {exam.status === 'completed' && (
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full">
                          View Results
                        </Button>
                        {exam.attempts < exam.maxAttempts && (
                          <Button size="sm" className="w-full">
                            Retake Exam
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExamsSection;
