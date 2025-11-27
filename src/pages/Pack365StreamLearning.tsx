// Pack365StreamLearning.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  LinearProgress, 
  Chip,
  Container,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress as MuiCircularProgress
} from '@mui/material';
import {
  PlayArrow,
  CheckCircle,
  RadioButtonUnchecked,
  Quiz,
  Schedule,
  Book,
  Star,
  BarChart,
  People,
  CalendarToday,
  ArrowBack,
  VideoLibrary,
  EmojiEvents
} from '@mui/icons-material';
import { useToast } from '@/hooks/use-toast';
import { pack365Api } from '@/services/api';

// Types
interface Topic {
  name: string;
  link: string;
  duration: number;
}

interface Course {
  _id: string;
  courseId: string;
  courseName: string;
  description: string;
  stream: string;
  documentLink: string;
  totalDuration: number;
  topics: Topic[];
}

interface TopicProgress {
  courseId: string;
  topicName: string;
  watched: boolean;
  watchedDuration: number;
}

interface StreamEnrollment {
  _id: string;
  stream: string;
  amountPaid: number;
  enrollmentDate: string;
  expiresAt: string;
  paymentStatus: string;
  totalWatchedPercentage: number;
  topicProgress: TopicProgress[];
  isExamCompleted: boolean;
  examScore: number;
  bestExamScore: number;
  coursesCount: number;
  totalTopics: number;
  watchedTopics: number;
  courses: Course[];
}

// Circular Progress Component
const CircularProgressWithLabel = ({ value, size = 120 }: { value: number; size?: number }) => {
  return (
    <Box position="relative" display="inline-flex">
      <MuiCircularProgress
        variant="determinate"
        value={100}
        size={size}
        thickness={4}
        sx={{ color: 'grey.200' }}
      />
      <MuiCircularProgress
        variant="determinate"
        value={value}
        size={size}
        thickness={4}
        sx={{
          position: 'absolute',
          left: 0,
          color: value === 100 ? 'success.main' : 'primary.main',
        }}
      />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="h6" component="div" color="text.secondary">
          {`${Math.round(value)}%`}
        </Typography>
      </Box>
    </Box>
  );
};

// Skeleton Loader
const SkeletonLoader = () => (
  <Container maxWidth="xl" sx={{ py: 4 }}>
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card sx={{ p: 3, mb: 2 }}>
          <Box display="flex" justifyContent="center" mb={2}>
            <MuiCircularProgress />
          </Box>
        </Card>
        <Card sx={{ p: 3 }}>
          {[1, 2, 3, 4].map((item) => (
            <Box key={item} sx={{ mb: 2 }}>
              <Box sx={{ width: '100%', height: 20, bgcolor: 'grey.200', borderRadius: 1 }} />
            </Box>
          ))}
        </Card>
      </Grid>
      <Grid item xs={12} md={8}>
        {[1, 2, 3].map((item) => (
          <Card key={item} sx={{ p: 3, mb: 2 }}>
            <Box sx={{ width: '60%', height: 24, bgcolor: 'grey.200', borderRadius: 1, mb: 2 }} />
            <Box sx={{ width: '80%', height: 16, bgcolor: 'grey.200', borderRadius: 1, mb: 2 }} />
            <Box sx={{ width: '100%', height: 4, bgcolor: 'grey.200', borderRadius: 1 }} />
          </Card>
        ))}
      </Grid>
    </Grid>
  </Container>
);

const Pack365StreamLearning: React.FC = () => {
  const { stream } = useParams<{ stream: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [enrollment, setEnrollment] = useState<StreamEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStreamData();
  }, [stream]);

  const fetchStreamData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast({ title: 'Authentication Required', variant: 'destructive' });
        navigate('/login');
        return;
      }

      // Fetch enrollments
      const response = await pack365Api.getMyEnrollments(token);
      
      if (response.success && response.enrollments) {
        const streamEnrollments = response.enrollments as unknown as StreamEnrollment[];
        const currentEnrollment = streamEnrollments.find(
          (e) => e.stream.toLowerCase() === stream?.toLowerCase()
        );

        if (currentEnrollment) {
          // Fetch all courses for accurate progress calculation
          const coursesResponse = await pack365Api.getAllCourses();
          if (coursesResponse.success && coursesResponse.data) {
            const streamCourses = coursesResponse.data.filter(
              (course: Course) => course.stream.toLowerCase() === stream?.toLowerCase()
            );

            // Calculate accurate progress
            const enhancedEnrollment = enhanceEnrollmentData(currentEnrollment, streamCourses);
            setEnrollment(enhancedEnrollment);
          } else {
            setEnrollment(currentEnrollment);
          }
        } else {
          setError('You are not enrolled in this stream');
          toast({ title: 'Access Denied', variant: 'destructive' });
        }
      }
    } catch (err: any) {
      console.error('Error fetching stream data:', err);
      setError('Failed to load stream data');
      toast({ title: 'Error', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const enhanceEnrollmentData = (enrollment: StreamEnrollment, courses: Course[]): StreamEnrollment => {
    let totalWatchedTopics = 0;
    let totalTopicsInStream = 0;

    courses.forEach(course => {
      const courseTopics = course.topics?.length || 0;
      totalTopicsInStream += courseTopics;
      
      // Count watched topics for this course
      const watchedInCourse = enrollment.topicProgress?.filter(tp => 
        tp.courseId.toString() === course._id.toString() && tp.watched
      ).length || 0;
      
      totalWatchedTopics += watchedInCourse;
    });

    const accurateProgress = totalTopicsInStream > 0 ? 
      (totalWatchedTopics / totalTopicsInStream) * 100 : 0;

    return {
      ...enrollment,
      courses,
      totalTopics: totalTopicsInStream,
      watchedTopics: totalWatchedTopics,
      totalWatchedPercentage: accurateProgress,
      coursesCount: courses.length
    };
  };

  const handleCourseSelect = (course: Course) => {
    navigate(`/pack365/course/${course.courseId}`, {
      state: {
        course,
        enrollment,
        stream
      }
    });
  };

  const handleTakeExam = (examType: 'stream' | 'final') => {
    const requiredProgress = examType === 'stream' ? 80 : 100;
    
    if (enrollment && enrollment.totalWatchedPercentage >= requiredProgress) {
      navigate(`/exam/${stream}/${examType}`);
    } else {
      toast({
        title: 'Not Eligible',
        description: `You need ${requiredProgress}% completion to take this exam.`,
        variant: 'destructive'
      });
    }
  };

  const getCourseProgress = (courseId: string): number => {
    if (!enrollment?.topicProgress) return 0;
    
    const courseTopics = enrollment.courses
      .find(c => c._id === courseId)?.topics || [];
    
    if (courseTopics.length === 0) return 0;
    
    const watchedTopics = enrollment.topicProgress.filter(tp => 
      tp.courseId === courseId && tp.watched
    ).length;
    
    return (watchedTopics / courseTopics.length) * 100;
  };

  const isTopicWatched = (courseId: string, topicName: string): boolean => {
    return enrollment?.topicProgress?.some(
      tp => tp.courseId === courseId && tp.topicName === topicName && tp.watched
    ) || false;
  };

  const formatDuration = (minutes: number): string => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error || !enrollment) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Paper sx={{ p: 6 }}>
          <Typography variant="h5" gutterBottom color="error">
            {error || 'Enrollment not found'}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            We couldn't find your enrollment details for the {stream} stream.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/pack365')}
            startIcon={<ArrowBack />}
          >
            Browse Streams
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/pack365-dashboard')}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          {stream} Stream Learning
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Continue your learning journey and track your progress
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Sidebar - Progress & Info */}
        <Grid item xs={12} md={4}>
          {/* Progress Card */}
          <Card sx={{ mb: 3, p: 3 }}>
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
              <CircularProgressWithLabel value={enrollment.totalWatchedPercentage} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Overall Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {enrollment.watchedTopics} of {enrollment.totalTopics} topics completed
              </Typography>
            </Box>

            <LinearProgress 
              variant="determinate" 
              value={enrollment.totalWatchedPercentage}
              sx={{ height: 8, borderRadius: 4, mb: 2 }}
            />
            
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Topics Completed
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {enrollment.watchedTopics} / {enrollment.totalTopics}
              </Typography>
            </Box>
          </Card>

          {/* Stream Information */}
          <Card sx={{ mb: 3, p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Book fontSize="small" />
              Stream Information
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CalendarToday fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Enrollment Date" 
                  secondary={formatDate(enrollment.enrollmentDate)}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Schedule fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Access Until" 
                  secondary={formatDate(enrollment.expiresAt)}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <VideoLibrary fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Total Courses" 
                  secondary={enrollment.coursesCount}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <People fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Exam Status" 
                  secondary={
                    enrollment.isExamCompleted 
                      ? `Completed (${enrollment.examScore}%)` 
                      : 'Not taken'
                  }
                />
              </ListItem>
            </List>
          </Card>

          {/* Exam Eligibility Cards */}
          {enrollment.totalWatchedPercentage >= 80 && (
            <Card sx={{ bgcolor: 'success.light', color: 'white', mb: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <EmojiEvents sx={{ mr: 1 }} />
                  <Typography variant="h6">Ready for Exam!</Typography>
                </Box>
                <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                  You've completed enough content to take the stream exam.
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ bgcolor: 'white', color: 'success.main', '&:hover': { bgcolor: 'grey.100' } }}
                  onClick={() => handleTakeExam('stream')}
                >
                  Take Stream Exam
                </Button>
              </CardContent>
            </Card>
          )}

          {enrollment.totalWatchedPercentage >= 100 && (
            <Card sx={{ bgcolor: 'secondary.main', color: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <Star sx={{ mr: 1 }} />
                  <Typography variant="h6">Final Exam Available</Typography>
                </Box>
                <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                  Complete all courses to unlock the final comprehensive exam.
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ bgcolor: 'white', color: 'secondary.main', '&:hover': { bgcolor: 'grey.100' } }}
                  onClick={() => handleTakeExam('final')}
                >
                  Take Final Exam
                </Button>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Main Content - Courses */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VideoLibrary />
                Courses in {stream} Stream
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Select a course to start learning and track your progress
              </Typography>

              {enrollment.courses && enrollment.courses.length > 0 ? (
                <Box sx={{ spaceY: 2 }}>
                  {enrollment.courses.map((course) => {
                    const courseProgress = getCourseProgress(course._id);
                    const isCompleted = courseProgress === 100;

                    return (
                      <Paper 
                        key={course.courseId}
                        sx={{ 
                          p: 3, 
                          mb: 2, 
                          border: 1, 
                          borderColor: 'grey.200',
                          '&:hover': {
                            borderColor: 'primary.main',
                            boxShadow: 2
                          },
                          transition: 'all 0.2s'
                        }}
                      >
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={8}>
                            <Box display="flex" alignItems="flex-start" mb={1}>
                              <Typography variant="h6" sx={{ flex: 1 }}>
                                {course.courseName}
                              </Typography>
                              <Chip 
                                label={isCompleted ? 'Completed' : `${Math.round(courseProgress)}%`}
                                color={isCompleted ? 'success' : 'primary'}
                                size="small"
                              />
                            </Box>

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {course.description}
                            </Typography>

                            <Box display="flex" gap={3} mb={2}>
                              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Schedule fontSize="small" />
                                {formatDuration(course.totalDuration)}
                              </Typography>
                              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <VideoLibrary fontSize="small" />
                                {course.topics?.length || 0} topics
                              </Typography>
                            </Box>

                            {/* Progress Bar */}
                            <Box sx={{ width: '100%' }}>
                              <Box display="flex" justifyContent="space-between" mb={0.5}>
                                <Typography variant="body2" color="text.secondary">
                                  Course Progress
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {Math.round(courseProgress)}%
                                </Typography>
                              </Box>
                              <LinearProgress 
                                variant="determinate" 
                                value={courseProgress}
                                sx={{ height: 6, borderRadius: 3 }}
                              />
                            </Box>
                          </Grid>

                          <Grid item xs={12} sm={4}>
                            <Button
                              fullWidth
                              variant={isCompleted ? "outlined" : "contained"}
                              startIcon={isCompleted ? <CheckCircle /> : <PlayArrow />}
                              onClick={() => handleCourseSelect(course)}
                              size="large"
                            >
                              {isCompleted ? 'Review' : courseProgress > 0 ? 'Continue' : 'Start'}
                            </Button>
                          </Grid>
                        </Grid>
                      </Paper>
                    );
                  })}
                </Box>
              ) : (
                <Box textAlign="center" py={6}>
                  <VideoLibrary sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Courses Available
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Courses for this stream are being prepared. Check back soon!
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Requirements Card */}
          <Card sx={{ mt: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BarChart fontSize="small" />
                Completion Requirements
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body2">Stream Exam Eligibility:</Typography>
                    <Chip 
                      label={enrollment.totalWatchedPercentage >= 80 ? 'Eligible' : '80% Required'} 
                      color={enrollment.totalWatchedPercentage >= 80 ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Current Progress:</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {Math.round(enrollment.totalWatchedPercentage)}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body2">Final Exam Eligibility:</Typography>
                    <Chip 
                      label={enrollment.totalWatchedPercentage >= 100 ? 'Eligible' : '100% Required'} 
                      color={enrollment.totalWatchedPercentage >= 100 ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Exam Score:</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {enrollment.isExamCompleted ? `${enrollment.examScore}%` : 'Not taken'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Pack365StreamLearning;
