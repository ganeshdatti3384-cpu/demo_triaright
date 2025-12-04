import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Play,
  Clock,
  Home,
} from "lucide-react";

type Subtopic = {
  name: string;
  link?: string;
  duration?: number; // minutes
};

type Topic = {
  topicName: string;
  topicCount?: number;
  subtopics: Subtopic[];
  directLink?: string;
  examExcelLink?: string;
};

type CourseModel = {
  _id: string;
  courseId?: string;
  courseName: string;
  courseDescription?: string;
  curriculum: Topic[];
  demoVideoLink?: string;
  totalDuration?: number;
  courseImageLink?: string;
  price?: number;
  courseType?: string;
  stream?: string;
  hasFinalExam?: boolean;
};

type EnrollmentModel = {
  _id?: string;
  courseId: string | { _id?: string };
  courseName?: string;
  courseImageLink?: string;
};

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "https://dev.triaright.com/api";

const extractYouTubeId = (url?: string) => {
  if (!url) return null;
  const reg =
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/))([a-zA-Z0-9_-]{10,})/;
  const m = url.match(reg);
  return m ? m[1] : null;
};

const CourseLearningInterface: React.FC = () => {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { toast } = useToast();

  const [course, setCourse] = useState<CourseModel | null>(null);
  const [enrollment, setEnrollment] = useState<EnrollmentModel | null>(null);
  const [loading, setLoading] = useState(true);

  // playing location
  const [playingSubtopic, setPlayingSubtopic] = useState<{ topicIndex: number; subIndex: number } | null>(null);

  // YouTube player refs & state
  const ytPlayerRef = useRef<any | null>(null);
  const ytContainerRef = useRef<HTMLDivElement | null>(null);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);

  // fetch course and enrollment from backend
  const fetchCourseAndEnrollment = async () => {
    setLoading(true);
    try {
      if (!courseId) {
        toast({ title: "Error", description: "Course not specified", variant: "destructive" });
        navigate("/student");
        return;
      }

      const courseResp = await axios.get(`${API_BASE_URL}/courses/${courseId}`);
      if (courseResp.data && courseResp.data.course) {
        setCourse(courseResp.data.course);
      } else {
        toast({ title: "Course not found", description: "This course doesn't exist", variant: "destructive" });
        navigate("/student");
        return;
      }

      if (token) {
        try {
          const enrollResp = await axios.get(`${API_BASE_URL}/courses/enrollment/check/${courseId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (enrollResp.data && enrollResp.data.enrolled) {
            setEnrollment({
              _id: enrollResp.data.enrollmentId,
              courseId: courseId,
              courseName: courseResp.data.course?.courseName,
              courseImageLink: courseResp.data.course?.courseImageLink,
            });
          } else {
            setEnrollment(null);
          }
        } catch (err: any) {
          // if not enrolled or error, set null but keep showing course
          setEnrollment(null);
        }
      } else {
        setEnrollment(null);
      }
    } catch (err: any) {
      console.error("Failed to load course:", err);
      toast({ title: "Error", description: "Failed to load course details", variant: "destructive" });
      navigate("/student");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseAndEnrollment();
    return () => {
      destroyYTPlayer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, token]);

  // YT player lifecycle
  const loadYouTubeIframeAPI = (): Promise<void> => {
    return new Promise((resolve) => {
      if ((window as any).YT && (window as any).YT.Player) {
        resolve();
        return;
      }
      const existing = document.getElementById("youtube-iframe-api");
      if (existing) {
        (window as any).onYouTubeIframeAPIReady = () => resolve();
        return;
      }
      const tag = document.createElement("script");
      tag.id = "youtube-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      (window as any).onYouTubeIframeAPIReady = () => resolve();
    });
  };

  const createYTPlayer = async (videoId: string) => {
    await loadYouTubeIframeAPI();
    destroyYTPlayer();

    if (!ytContainerRef.current) return;

    ytPlayerRef.current = new (window as any).YT.Player(ytContainerRef.current, {
      height: "390",
      width: "100%",
      videoId,
      playerVars: {
        rel: 0,
        modestbranding: 1,
        origin: window.location.origin,
      },
    });
  };

  const destroyYTPlayer = () => {
    try {
      if (ytPlayerRef.current && ytPlayerRef.current.destroy) {
        ytPlayerRef.current.destroy();
      }
    } catch (e) {
      // ignore
    } finally {
      ytPlayerRef.current = null;
      setCurrentVideoId(null);
    }
  };

  // Open subtopic: create YT player for YouTube links, else destroy player (non-playable)
  const openSubtopic = (tIndex: number, sIndex: number) => {
    if (!course) return;
    const topic = course.curriculum[tIndex];
    if (!topic) return;
    const sub = topic.subtopics[sIndex];
    if (!sub) return;

    setPlayingSubtopic({ topicIndex: tIndex, subIndex: sIndex });

    const videoId = extractYouTubeId(sub.link);
    if (videoId) {
      setCurrentVideoId(videoId);
      createYTPlayer(videoId).catch((e) => {
        console.error("YT player create error:", e);
      });
    } else {
      // no YT - destroy any existing YT player
      destroyYTPlayer();
    }
  };

  // UI Subtopic row
  const SubtopicRow: React.FC<{ tIndex: number; sIndex: number; sub: Subtopic }> = ({ tIndex, sIndex, sub }) => {
    const isThisPlaying = playingSubtopic && playingSubtopic.topicIndex === tIndex && playingSubtopic.subIndex === sIndex;

    return (
      <div className="flex items-center justify-between gap-4 border-b py-3 hover:bg-gray-50 px-2 rounded">
        <div className="flex-1">
          <div className="font-medium">{sub.name}</div>
          <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
            <Clock className="h-3 w-3" />
            <span>Duration: {sub.duration || 0} min</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isThisPlaying ? "secondary" : "outline"}
            onClick={() => openSubtopic(tIndex, sIndex)}
            className="flex items-center gap-1"
          >
            <Play className="h-3 w-3" />
            {isThisPlaying ? "Playing" : "Play"}
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-10">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto" />
            <p className="mt-4 text-gray-600">Loading course...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-10">
          <Card>
            <CardHeader>
              <CardTitle>Course not found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">This course could not be found. It may have been removed.</p>
              <div className="flex gap-2">
                <Button onClick={() => navigate(-1)}>Go Back</Button>
                <Button variant="outline" onClick={() => navigate("/student")}>
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/student")}
                className="flex items-center gap-2"
              >
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{course.courseName}</h1>
                <p className="text-sm text-gray-600">Course Learning Interface</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Player + basic info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{course.courseName}</CardTitle>
                    <CardDescription className="mt-2">{course.courseDescription}</CardDescription>
                  </div>
                  <Badge variant={course.courseType === "paid" ? "default" : "secondary"}>
                    {course.courseType === "paid" ? "Paid Course" : "Free Course"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    {currentVideoId ? (
                      <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
                        <div ref={ytContainerRef} id="yt-player" className="w-full h-full" />
                      </div>
                    ) : playingSubtopic ? (
                      <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p>No playable video for this lesson</p>
                          <p className="text-sm mt-2">This lesson may be a document or external link</p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p>Select a lesson to start learning</p>
                          <p className="text-sm mt-2">Click on any lesson below to begin</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="space-y-4">
                          <div>
                            <div className="text-sm font-medium text-gray-500 mb-1">Total Duration</div>
                            <div className="text-lg font-medium">{course.totalDuration || 0} minutes</div>
                          </div>

                          <div>
                            {!enrollment ? (
                              <Button
                                onClick={() => {
                                  if (!token) {
                                    toast({ title: "Login required", description: "Please login to enroll", variant: "destructive" });
                                    navigate("/login");
                                    return;
                                  }
                                  navigate(`/course-enrollment/${courseId}`);
                                }}
                                className="w-full"
                                size="lg"
                              >
                                Start Learning
                              </Button>
                            ) : (
                              <Button
                                onClick={() => {
                                  if (!course.curriculum) return;
                                  openSubtopic(0, 0);
                                }}
                                className="w-full"
                                size="lg"
                              >
                                Continue Learning
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Curriculum */}
            <Card>
              <CardHeader>
                <CardTitle>Course Curriculum</CardTitle>
                <CardDescription>Topics and lessons to complete</CardDescription>
              </CardHeader>
              <CardContent>
                {course.curriculum && course.curriculum.length > 0 ? (
                  <div className="space-y-6">
                    {course.curriculum.map((topic, tIndex) => {
                      const topicTotal = topic.subtopics.reduce((s, st) => s + (st.duration || 0), 0);

                      return (
                        <div key={topic.topicName} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <div className="font-semibold text-lg">{topic.topicName}</div>
                              <div className="text-sm text-gray-500 mt-1">
                                {topic.subtopics.length} lessons • {topicTotal} minutes
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            {topic.subtopics.map((sub, sIndex) => (
                              <SubtopicRow key={`${sub.name}-${sIndex}`} tIndex={tIndex} sIndex={sIndex} sub={sub} />
                            ))}
                          </div>

                          <div className="flex gap-2 pt-3 border-t">
                            <Button
                              onClick={() => {
                                if (!enrollment) {
                                  navigate(`/course-enrollment/${courseId}`);
                                  return;
                                }
                                if (topic.subtopics && topic.subtopics.length > 0) {
                                  openSubtopic(tIndex, 0);
                                }
                              }}
                              className="flex-1"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Start Topic
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No curriculum available for this course.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Sidebar / Enrollment summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enrollment Status</CardTitle>
              </CardHeader>
              <CardContent>
                {!enrollment ? (
                  <>
                    <div className="text-sm text-gray-600 mb-4">
                      You are not enrolled in this course. Enroll now to start learning.
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          if (!token) {
                            toast({ title: "Login required", description: "Please login to enroll", variant: "destructive" });
                            navigate("/login");
                            return;
                          }
                          navigate(`/course-enrollment/${courseId}`);
                        }}
                        className="flex-1"
                      >
                        Enroll Now
                      </Button>
                      <Button variant="outline" onClick={() => navigate("/student")}>
                        Back to Dashboard
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Course Status</div>
                        <div className="font-medium">Enrolled</div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            if (!course.curriculum) return;
                            openSubtopic(0, 0);
                          }}
                          className="flex-1"
                        >
                          Start Learning
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {course.stream && (
                  <div>
                    <div className="text-xs text-gray-500">Stream</div>
                    <div className="font-medium capitalize">{course.stream}</div>
                  </div>
                )}
                {course.courseType && (
                  <div>
                    <div className="text-xs text-gray-500">Type</div>
                    <div className="font-medium">{course.courseType === "paid" ? "Paid" : "Free"}</div>
                  </div>
                )}
                {course.price !== undefined && course.courseType === "paid" && (
                  <div>
                    <div className="text-xs text-gray-500">Price</div>
                    <div className="font-medium">₹{course.price}</div>
                  </div>
                )}
                <div>
                  <div className="text-xs text-gray-500">Total Lessons</div>
                  <div className="font-medium">{course.curriculum?.reduce((total, topic) => total + topic.subtopics.length, 0) || 0}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Total Topics</div>
                  <div className="font-medium">{course.curriculum?.length || 0}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLearningInterface;
