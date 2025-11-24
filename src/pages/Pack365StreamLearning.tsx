import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  PlayArrow as PlayIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Assignment as ExamIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ExamInterface from '../components/ExamInterface';

interface Topic {
  courseId: string;
  topicName: string;
  watched: boolean;
  watchedDuration: number;
}

interface Course {
  _id: string;
  courseId: string;
  courseName: string;
  description: string;
  totalDuration: number;
  topics: Array<{
    name: string;
    link: string;
    duration: number;
  }>;
  documentLink?: string;
}

interface Enrollment {
  stream: string;
  topicProgress: Topic[];
  totalCourseDuration: number;
  totalWatchedPercentage: number;
  courses: Course[];
  isExamCompleted: boolean;
  examScore: number | null;
}

interface Exam {
  examId: string;
  courseId?: string;
  attemptInfo: {
    totalAttempts: number;
    maxAttempts: number;
    remainingAttempts: number;
    bestScore: number;
    currentScore: number;
    canRetake: boolean;
    isPassed: boolean;
  };
}

const Pack365StreamLearning: React.FC = () => {
  const { stream } = useParams<{ stream: string }>();
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [availableExams, setAvailableExams] = useState<Exam[]>([]);
  const [examDialogOpen, setExamDialogOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<{ examId: string; courseId?: string } | null>(null);
  const [progressUpdating, setProgressUpdating] = useState(false);

  useEffect(() => {
    fetchEnrollmentData();
    fetchAvailableExams();
  }, [stream]);

  const fetchEnrollmentData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/pack365/stream/check/${stream}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && response.data.isStreamEnrolled) {
        // Fetch detailed enrollment data
        const enrollmentsResponse = await axios.get('/api/pack365/enrollments', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const streamEnrollment = enrollmentsResponse.data.enrollments.find(
          (e: any) => e.stream === stream
        );
        
        if (streamEnrollment) {
          setEnrollment(streamEnrollment);
        }
      } else {
        setError('You are not enrolled in this stream');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch enrollment data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableExams = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/pack365/exams/available', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableExams(response.data.exams || []);
    } catch (err) {
      console.error('Failed to fetch available exams:', err);
    }
  };

  const handleVideoPlay = async (courseId: string, topicName: string, videoUrl: string) => {
    setSelectedVideo({ url: videoUrl, title: topicName });
    setVideoDialogOpen(true);

    // Update progress when video is played
    await updateTopicProgress(courseId, topicName);
  };

  const updateTopicProgress = async (courseId: string, topicName: string) => {
    try {
      setProgressUpdating(true);
      const token = localStorage.getItem('token');
      
      // Find the course and topic to get duration
      const course = enrollment?.courses.find(c => c.courseId === courseId);
      const topic = course?.topics.find(t => t.name === topicName);
      
      if (!topic) return;

      // Calculate watched duration (assuming full video watched for simplicity)
      const watchedDuration = topic.duration;

      await axios.put('/api/pack365/topic/progress', 
        {
          courseId,
          topicName,
          watchedDuration,
          totalCourseDuration: enrollment?.totalCourseDuration,
          totalWatchedPercentage: enrollment?.totalWatchedPercentage
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Refresh enrollment data
      await fetchEnrollmentData();
    } catch (err) {
      console.error('Failed to update progress:', err);
    } finally {
      setProgressUpdating(false);
    }
  };

  const getCourseProgress = (courseId: string) => {
    if (!enrollment) return 0;
    
    const courseTopics = enrollment.topicProgress.filter(tp => tp.courseId === courseId);
    const watchedTopics = courseTopics.filter(tp => tp.watched);
    
    return courseTopics.length > 0 ? (watchedTopics.length / courseTopics.length) * 100 : 0;
  };

  const isCourseEligibleForExam = (courseId: string) => {
    return getCourseProgress(courseId) >= 80;
  };

  const isStreamEligibleForFinalExam = () => {
    if (!enrollment?.courses) return false;
    
    // Check if all courses are at least 80% complete
    return enrollment.courses.every(course => getCourseProgress(course.courseId) >= 80);
  };

  const handleStartExam = (exam: Exam) => {
    setSelectedExam({ examId: exam.examId, courseId: exam.courseId });
    setExamDialogOpen(true);
  };

  const handleExamComplete = () => {
    setExamDialogOpen(false);
    setSelectedExam(null);
    fetchEnrollmentData(); // Refresh data to update exam status
    fetchAvailableExams(); // Refresh available exams
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/pack365')}>
          Back to Pack365
        </Button>
      </Container>
    );
  }

  if (!enrollment) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning">No enrollment data found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {stream} Stream - Learning Portal
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Typography variant="h6" color="textSecondary">
            Overall Progress: {enrollment.totalWatchedPercentage?.toFixed(1) || 0}%
          </Typography>
          <Chip 
            label={enrollment.isExamCompleted ? `Exam Passed: ${enrollment.examScore}%` : 'Exam Pending'} 
            color={enrollment.isExamCompleted ? 'success' : 'default'}
          />
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={enrollment.totalWatchedPercentage || 0} 
          sx={{ mt: 2, height: 8, borderRadius: 4 }}
        />
      </Paper>

      {/* Progress Updating Indicator */}
      {progressUpdating && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Updating your progress...
        </Alert>
      )}

      {/* Available Exams Section */}
      {availableExams.length > 0 && (
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Available Exams
          </Typography>
          <Grid container spacing={2}>
            {availableExams.map((exam, index) => (
              <Grid item xs={12} md={6} key={exam.examId}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {exam.courseId ? 'Course Exam' : 'Stream Final Exam'}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="body2">
                        Attempts: {exam.attemptInfo.totalAttempts}/{exam.attemptInfo.maxAttempts}
                      </Typography>
                      {exam.attemptInfo.bestScore > 0 && (
                        <Typography variant="body2">
                          Best Score: {exam.attemptInfo.bestScore}%
                        </Typography>
                      )}
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={<ExamIcon />}
                      fullWidth
                      onClick={() => handleStartExam(exam)}
                      disabled={!exam.attemptInfo.canRetake}
                    >
                      {exam.attemptInfo.canRetake ? 'Start Exam' : 'No Attempts Left'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Courses List */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Courses in {stream} Stream
      </Typography>
      
      {enrollment.courses?.map((course) => {
        const courseProgress = getCourseProgress(course.courseId);
        const isEligibleForExam = isCourseEligibleForExam(course.courseId);
        const courseExam = availableExams.find(exam => exam.courseId === course._id);

        return (
          <Accordion key={course.courseId} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ width: '100%' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                  <Typography variant="h6">{course.courseName}</Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" color="textSecondary">
                      {courseProgress.toFixed(1)}%
                    </Typography>
                    {isEligibleForExam && (
                      <Chip 
                        label="Exam Available" 
                        color="primary" 
                        size="small"
                      />
                    )}
                  </Box>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={courseProgress} 
                  sx={{ mt: 1 }}
                />
                <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                  {course.description}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {/* Course Exam Button */}
              {isEligibleForExam && courseExam && (
                <Box sx={{ mb: 3 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ExamIcon />}
                    onClick={() => handleStartExam(courseExam)}
                    disabled={!courseExam.attemptInfo.canRetake}
                  >
                    Take Course Exam ({courseExam.attemptInfo.remainingAttempts} attempts left)
                  </Button>
                </Box>
              )}

              {/* Topics List */}
              <Typography variant="h6" gutterBottom>
                Topics
              </Typography>
              <List>
                {course.topics?.map((topic, index) => {
                  const topicProgress = enrollment.topicProgress.find(
                    tp => tp.courseId === course.courseId && tp.topicName === topic.name
                  );
                  const isWatched = topicProgress?.watched || false;

                  return (
                    <ListItem 
                      key={index}
                      button
                      onClick={() => handleVideoPlay(course.courseId, topic.name, topic.link)}
                    >
                      <ListItemIcon>
                        {isWatched ? (
                          <CheckIcon color="success" />
                        ) : (
                          <UncheckedIcon />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={topic.name}
                        secondary={`Duration: ${Math.round(topic.duration / 60)} minutes`}
                      />
                      <PlayIcon color="primary" />
                    </ListItem>
                  );
                })}
              </List>

              {/* Course Document */}
              {course.documentLink && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    component="a"
                    href={course.documentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download Course Materials
                  </Button>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        );
      })}

      {/* Stream Final Exam */}
      {isStreamEligibleForFinalExam() && (
        <Paper elevation={3} sx={{ p: 3, mt: 4, bgcolor: 'success.light', color: 'white' }}>
          <Typography variant="h5" gutterBottom>
            🎉 Stream Completion Achieved!
          </Typography>
          <Typography variant="body1" paragraph>
            You have completed all courses in the {stream} stream. You are now eligible to take the final stream exam.
            Upon passing, you will receive your certificate.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<ExamIcon />}
            onClick={() => {
              const streamExam = availableExams.find(exam => !exam.courseId);
              if (streamExam) {
                handleStartExam(streamExam);
              }
            }}
            sx={{ bgcolor: 'white', color: 'success.main', '&:hover': { bgcolor: 'grey.100' } }}
          >
            Take Final Stream Exam
          </Button>
        </Paper>
      )}

      {/* Video Dialog */}
      <Dialog 
        open={videoDialogOpen} 
        onClose={() => setVideoDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {selectedVideo?.title}
        </DialogTitle>
        <DialogContent>
          {selectedVideo && (
            <Box sx={{ width: '100%', height: '400px' }}>
              <video
                controls
                style={{ width: '100%', height: '100%' }}
                onEnded={() => {
                  // Mark as fully watched when video ends
                  if (selectedVideo) {
                    // Progress update is already handled when video starts
                  }
                }}
              >
                <source src={selectedVideo.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVideoDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Exam Dialog */}
      <Dialog 
        open={examDialogOpen} 
        onClose={() => setExamDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedExam ? 'Exam' : 'Loading...'}
        </DialogTitle>
        <DialogContent>
          {selectedExam && (
            <ExamInterface
              examId={selectedExam.examId}
              onExamComplete={handleExamComplete}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Pack365StreamLearning;
