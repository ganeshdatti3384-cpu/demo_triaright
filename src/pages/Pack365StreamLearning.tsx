// Pack365StreamLearning.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  AppBar,
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  PlayArrow,
  CheckCircle,
  RadioButtonUnchecked,
  Quiz,
  VideoLibrary,
  Assessment,
  Schedule
} from '@mui/icons-material';
import axios from 'axios';
import YouTube from 'react-youtube';

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

interface Enrollment {
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
}

interface Exam {
  _id: string;
  examId: string;
  courseId: string;
  maxAttempts: number;
  passingScore: number;
  timeLimit: number;
  isActive: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab Panel Component
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`stream-tabpanel-${index}`}
      aria-labelledby={`stream-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Pack365StreamLearning: React.FC = () => {
  // State
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedStream, setSelectedStream] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [currentVideoTime, setCurrentVideoTime] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [progressInterval, setProgressInterval] = useState<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [examDialogOpen, setExamDialogOpen] = useState<boolean>(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [tabValue, setTabValue] = useState<number>(0);

  const playerRef = useRef<any>(null);

  // Fetch user enrollments and courses
  useEffect(() => {
    fetchEnrollmentsAndCourses();
  }, []);

  const fetchEnrollmentsAndCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch enrollments
      const enrollmentsResponse = await axios.get('/api/pack365/enrollments', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (enrollmentsResponse.data.success) {
        setEnrollments(enrollmentsResponse.data.enrollments);
        
        // Select first stream by default
        if (enrollmentsResponse.data.enrollments.length > 0) {
          const firstStream = enrollmentsResponse.data.enrollments[0].stream;
          setSelectedStream(firstStream);
          await fetchCoursesByStream(firstStream);
        }
      }

      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch data');
      setLoading(false);
    }
  };

  const fetchCoursesByStream = async (stream: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/pack365/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const streamCourses = response.data.courses.filter(
          (course: Course) => course.stream === stream
        );
        setCourses(streamCourses);
        
        // Select first course by default
        if (streamCourses.length > 0) {
          setSelectedCourse(streamCourses[0]);
          setSelectedTopic(streamCourses[0].topics[0]);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch courses');
    }
  };

  const fetchExamsForCourse = async (courseId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/pack365/exams/available`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Filter exams for the current course
      const courseExams = response.data.filter((exam: Exam) => 
        exam.courseId === courseId
      );
      setExams(courseExams);
    } catch (err: any) {
      console.error('Failed to fetch exams:', err);
    }
  };

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : '';
  };

  // Video player options
  const videoOptions = {
    height: '400',
    width: '100%',
    playerVars: {
      autoplay: 1,
      controls: 1,
      rel: 0,
      showinfo: 0,
      modestbranding: 1,
    },
  };

  // Start tracking video progress
  const startProgressTracking = (player: any) => {
    if (progressInterval) {
      clearInterval(progressInterval);
    }

    const interval = setInterval(async () => {
      if (player && selectedTopic && selectedCourse) {
        const currentTime = Math.floor(player.getCurrentTime());
        setCurrentVideoTime(currentTime);

        // Update progress every 10 seconds or when significant progress is made
        if (currentTime % 10 === 0 || currentTime > selectedTopic.duration * 0.9) {
          await updateTopicProgress(currentTime);
        }

        // Mark as watched if 90% of video is completed
        if (currentTime > selectedTopic.duration * 0.9) {
          await updateTopicProgress(currentTime, true);
        }
      }
    }, 1000);

    setProgressInterval(interval);
  };

  // Update topic progress in backend
  const updateTopicProgress = async (watchedDuration: number, markAsWatched: boolean = false) => {
    if (!selectedTopic || !selectedCourse) return;

    try {
      const token = localStorage.getItem('token');
      const enrollment = enrollments.find(e => e.stream === selectedCourse.stream);
      
      if (!enrollment) return;

      const totalCourseDuration = selectedCourse.totalDuration;
      const totalWatchedPercentage = calculateTotalWatchedPercentage();

      await axios.put(
        '/api/pack365/topic/progress',
        {
          courseId: selectedCourse._id,
          topicName: selectedTopic.name,
          watchedDuration: watchedDuration,
          totalCourseDuration: totalCourseDuration,
          totalWatchedPercentage: totalWatchedPercentage,
          watched: markAsWatched
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update local state
      const updatedEnrollments = enrollments.map(enrollment => {
        if (enrollment.stream === selectedCourse.stream) {
          const updatedProgress = enrollment.topicProgress.map(progress =>
            progress.courseId === selectedCourse._id && progress.topicName === selectedTopic.name
              ? { ...progress, watchedDuration, watched: markAsWatched || progress.watched }
              : progress
          );

          // Add new progress entry if not exists
          const progressExists = updatedProgress.some(
            p => p.courseId === selectedCourse._id && p.topicName === selectedTopic.name
          );

          if (!progressExists) {
            updatedProgress.push({
              courseId: selectedCourse._id,
              topicName: selectedTopic.name,
              watchedDuration,
              watched: markAsWatched
            });
          }

          return {
            ...enrollment,
            topicProgress: updatedProgress,
            totalWatchedPercentage
          };
        }
        return enrollment;
      });

      setEnrollments(updatedEnrollments);
    } catch (err: any) {
      console.error('Failed to update progress:', err);
    }
  };

  // Calculate total watched percentage across all courses in stream
  const calculateTotalWatchedPercentage = (): number => {
    const enrollment = enrollments.find(e => e.stream === selectedStream);
    if (!enrollment) return 0;

    const totalDuration = courses.reduce((sum, course) => sum + course.totalDuration, 0);
    const watchedDuration = enrollment.topicProgress.reduce((sum, progress) => {
      const course = courses.find(c => c._id === progress.courseId);
      if (course) {
        const topic = course.topics.find(t => t.name === progress.topicName);
        if (topic) {
          return sum + Math.min(progress.watchedDuration, topic.duration);
        }
      }
      return sum;
    }, 0);

    return totalDuration > 0 ? Math.round((watchedDuration / totalDuration) * 100) : 0;
  };

  // Check if topic is watched
  const isTopicWatched = (courseId: string, topicName: string): boolean => {
    const enrollment = enrollments.find(e => e.stream === selectedStream);
    if (!enrollment) return false;

    const progress = enrollment.topicProgress.find(
      p => p.courseId === courseId && p.topicName === topicName
    );
    return progress?.watched || false;
  };

  // Get topic progress
  const getTopicProgress = (courseId: string, topicName: string): number => {
    const enrollment = enrollments.find(e => e.stream === selectedStream);
    if (!enrollment) return 0;

    const progress = enrollment.topicProgress.find(
      p => p.courseId === courseId && p.topicName === topicName
    );
    return progress?.watchedDuration || 0;
  };

  // Handle video ready event
  const onVideoReady = (event: any) => {
    playerRef.current = event.target;
    setVideoDuration(Math.floor(event.target.getDuration()));
    startProgressTracking(event.target);
  };

  // Handle video state changes
  const onVideoStateChange = (event: any) => {
    // If video ended, mark as watched
    if (event.data === 0) { // 0 = ended
      updateTopicProgress(videoDuration, true);
      if (progressInterval) {
        clearInterval(progressInterval);
        setProgressInterval(null);
      }
    }
  };

  // Handle stream change
  const handleStreamChange = (stream: string) => {
    setSelectedStream(stream);
    fetchCoursesByStream(stream);
    setTabValue(0);
  };

  // Handle course selection
  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setSelectedTopic(course.topics[0]);
    fetchExamsForCourse(course._id);
  };

  // Handle topic selection
  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
    setCurrentVideoTime(0);
  };

  // Check if course is completed
  const isCourseCompleted = (course: Course): boolean => {
    const enrollment = enrollments.find(e => e.stream === selectedStream);
    if (!enrollment) return false;

    return course.topics.every(topic =>
      isTopicWatched(course._id, topic.name)
    );
  };

  // Check exam eligibility
  const isExamEligible = (course: Course): boolean => {
    const enrollment = enrollments.find(e => e.stream === selectedStream);
    if (!enrollment) return false;

    const watchedTopics = course.topics.filter(topic =>
      isTopicWatched(course._id, topic.name)
    ).length;
    
    return (watchedTopics / course.topics.length) >= 0.8; // 80% completion required
  };

  // Handle exam start
  const handleStartExam = () => {
    if (selectedCourse && isExamEligible(selectedCourse)) {
      setExamDialogOpen(true);
    }
  };

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [progressInterval]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (enrollments.length === 0) {
    return (
      <Box textAlign="center" p={4}>
        <Typography variant="h6" color="textSecondary">
          No enrollments found. Please enroll in a stream to access learning content.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Stream Selection */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Typography variant="h5" gutterBottom>
          My Learning Streams
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {enrollments.map((enrollment) => (
            <Chip
              key={enrollment._id}
              label={`${enrollment.stream} - ${enrollment.totalWatchedPercentage}% Complete`}
              onClick={() => handleStreamChange(enrollment.stream)}
              color={selectedStream === enrollment.stream ? 'primary' : 'default'}
              variant={selectedStream === enrollment.stream ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      </Paper>

      {selectedStream && (
        <>
          {/* Progress Overview */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  {selectedStream} Stream Progress
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {calculateTotalWatchedPercentage()}% Complete
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={calculateTotalWatchedPercentage()}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </CardContent>
          </Card>

          {/* Main Content Tabs */}
          <AppBar position="static" color="default" sx={{ mb: 2 }}>
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab icon={<VideoLibrary />} label="Courses" />
              <Tab icon={<Assessment />} label="Progress" />
            </Tabs>
          </AppBar>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {/* Course List */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, maxHeight: '600px', overflow: 'auto' }}>
                  <Typography variant="h6" gutterBottom>
                    Courses in {selectedStream}
                  </Typography>
                  <List>
                    {courses.map((course) => {
                      const completed = isCourseCompleted(course);
                      const examReady = isExamEligible(course);
                      const enrollment = enrollments.find(e => e.stream === selectedStream);
                      const examCompleted = enrollment?.isExamCompleted || false;

                      return (
                        <ListItem
                          key={course._id}
                          button
                          selected={selectedCourse?._id === course._id}
                          onClick={() => handleCourseSelect(course)}
                          sx={{ mb: 1, borderRadius: 1 }}
                        >
                          <ListItemIcon>
                            {completed ? (
                              <CheckCircle color="success" />
                            ) : (
                              <RadioButtonUnchecked />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={course.courseName}
                            secondary={
                              <Box>
                                <Typography variant="body2" color="textSecondary">
                                  {course.topics.length} topics • {formatTime(course.totalDuration)}
                                </Typography>
                                {examReady && !examCompleted && (
                                  <Chip
                                    label="Exam Ready"
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                    sx={{ mt: 0.5 }}
                                  />
                                )}
                                {examCompleted && (
                                  <Chip
                                    label={`Exam: ${enrollment?.examScore}%`}
                                    size="small"
                                    color="primary"
                                    sx={{ mt: 0.5 }}
                                  />
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                </Paper>
              </Grid>

              {/* Course Content */}
              <Grid item xs={12} md={8}>
                {selectedCourse && (
                  <Paper sx={{ p: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box>
                        <Typography variant="h5" gutterBottom>
                          {selectedCourse.courseName}
                        </Typography>
                        <Typography variant="body1" color="textSecondary" paragraph>
                          {selectedCourse.description}
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        startIcon={<Quiz />}
                        onClick={handleStartExam}
                        disabled={!isExamEligible(selectedCourse)}
                        color={isExamEligible(selectedCourse) ? "primary" : "inherit"}
                      >
                        {isExamEligible(selectedCourse) ? "Take Exam" : "Complete Topics to Unlock Exam"}
                      </Button>
                    </Box>

                    {/* Video Player */}
                    {selectedTopic && (
                      <Box mb={3}>
                        <Typography variant="h6" gutterBottom>
                          {selectedTopic.name}
                        </Typography>
                        <YouTube
                          videoId={getYouTubeVideoId(selectedTopic.link)}
                          opts={videoOptions}
                          onReady={onVideoReady}
                          onStateChange={onVideoStateChange}
                        />
                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                          <Typography variant="body2">
                            Progress: {formatTime(currentVideoTime)} / {formatTime(selectedTopic.duration)}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {isTopicWatched(selectedCourse._id, selectedTopic.name) ? 'Completed' : 'In Progress'}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(currentVideoTime / selectedTopic.duration) * 100}
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    )}

                    {/* Topics List */}
                    <Typography variant="h6" gutterBottom>
                      Course Topics
                    </Typography>
                    <List>
                      {selectedCourse.topics.map((topic, index) => {
                        const watched = isTopicWatched(selectedCourse._id, topic.name);
                        const progress = getTopicProgress(selectedCourse._id, topic.name);
                        
                        return (
                          <ListItem
                            key={index}
                            button
                            selected={selectedTopic?.name === topic.name}
                            onClick={() => handleTopicSelect(topic)}
                            sx={{ mb: 1, borderRadius: 1 }}
                          >
                            <ListItemIcon>
                              {watched ? (
                                <CheckCircle color="success" />
                              ) : (
                                <PlayArrow color="action" />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={topic.name}
                              secondary={
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                  <Typography variant="body2" color="textSecondary">
                                    {formatTime(topic.duration)}
                                  </Typography>
                                  {progress > 0 && !watched && (
                                    <Typography variant="body2" color="primary">
                                      {Math.round((progress / topic.duration) * 100)}% watched
                                    </Typography>
                                  )}
                                </Box>
                              }
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  </Paper>
                )}
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {/* Progress Dashboard */}
            <Grid container spacing={3}>
              {courses.map((course) => {
                const completedTopics = course.topics.filter(topic =>
                  isTopicWatched(course._id, topic.name)
                ).length;
                const progressPercentage = Math.round((completedTopics / course.topics.length) * 100);
                const enrollment = enrollments.find(e => e.stream === selectedStream);

                return (
                  <Grid item xs={12} md={6} key={course._id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {course.courseName}
                        </Typography>
                        
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="body2" color="textSecondary">
                            Progress
                          </Typography>
                          <Typography variant="body2">
                            {completedTopics} / {course.topics.length} topics
                          </Typography>
                        </Box>
                        
                        <LinearProgress
                          variant="determinate"
                          value={progressPercentage}
                          sx={{ mb: 2, height: 8, borderRadius: 4 }}
                        />

                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Chip
                            label={`${progressPercentage}% Complete`}
                            color={progressPercentage === 100 ? 'success' : 'primary'}
                            size="small"
                          />
                          
                          {enrollment?.isExamCompleted && (
                            <Chip
                              label={`Exam: ${enrollment.examScore}%`}
                              color={enrollment.examScore >= 50 ? 'success' : 'error'}
                              variant="outlined"
                              size="small"
                            />
                          )}
                        </Box>

                        {/* Topic Progress Details */}
                        <Box mt={2}>
                          {course.topics.map((topic, index) => {
                            const watched = isTopicWatched(course._id, topic.name);
                            const progress = getTopicProgress(course._id, topic.name);
                            
                            return (
                              <Box key={index} display="flex" alignItems="center" mb={1}>
                                {watched ? (
                                  <CheckCircle color="success" fontSize="small" />
                                ) : (
                                  <RadioButtonUnchecked fontSize="small" />
                                )}
                                <Typography variant="body2" sx={{ ml: 1, flexGrow: 1 }}>
                                  {topic.name}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  {watched ? 'Completed' : `${Math.round((progress / topic.duration) * 100)}%`}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </TabPanel>
        </>
      )}

      {/* Exam Dialog */}
      <Dialog
        open={examDialogOpen}
        onClose={() => setExamDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Quiz sx={{ mr: 1 }} />
            Course Exam - {selectedCourse?.courseName}
          </Box>
        </DialogTitle>
        <DialogContent>
          {exams.length > 0 ? (
            <Box>
              <Typography variant="body1" paragraph>
                You are about to start the exam for {selectedCourse?.courseName}. Please review the exam details:
              </Typography>
              
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                {exams.map((exam, index) => (
                  <Box key={exam._id} mb={2}>
                    <Typography variant="h6">Exam {index + 1}</Typography>
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Typography variant="body2">
                        <strong>Time Limit:</strong> {exam.timeLimit} minutes
                      </Typography>
                      <Typography variant="body2">
                        <strong>Passing Score:</strong> {exam.passingScore}%
                      </Typography>
                      <Typography variant="body2">
                        <strong>Max Attempts:</strong> {exam.maxAttempts}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

              <Alert severity="info" sx={{ mt: 2 }}>
                Make sure you have stable internet connection and enough time to complete the exam.
                You cannot pause the exam once started.
              </Alert>
            </Box>
          ) : (
            <Typography>No exams available for this course yet.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExamDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              // Navigate to exam page or start exam
              window.open(`/exam/${exams[0]?.examId}`, '_blank');
              setExamDialogOpen(false);
            }}
            disabled={exams.length === 0}
          >
            Start Exam
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Pack365StreamLearning;
