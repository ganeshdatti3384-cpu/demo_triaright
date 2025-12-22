import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, Plus, Users, Clock, Video, DollarSign, Calendar, Zap, Sparkles, BookOpen, Target, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface LiveCourse {
  id: string;
  title: string;
  instructor: string;
  description: string;
  startTime: string;
  endTime: string;
  price: number;
  meetingPlatform: string;
  meetingLink: string;
}

const LiveCourseManagement: React.FC = () => {
  // Load courses from localStorage on initial render
  const [liveCourses, setLiveCourses] = useState<LiveCourse[]>(() => {
    const savedCourses = localStorage.getItem("liveCourses");
    if (savedCourses) {
      try {
        return JSON.parse(savedCourses);
      } catch (error) {
        console.error("Error parsing saved courses:", error);
        return [];
      }
    }
    // Default courses if none exist in localStorage
    return [
      {
        id: "1",
        title: "Advanced React Patterns",
        instructor: "Alex Johnson",
        description: "Learn advanced React patterns and best practices for building scalable applications.",
        startTime: "2024-12-20T14:00",
        endTime: "2024-12-20T16:00",
        price: 49,
        meetingPlatform: "Zoom",
        meetingLink: "https://zoom.us/j/123456789",
      },
      {
        id: "2",
        title: "UI/UX Design Masterclass",
        instructor: "Sarah Chen",
        description: "Master the art of creating beautiful and user-friendly interfaces.",
        startTime: "2024-12-22T10:00",
        endTime: "2024-12-22T12:30",
        price: 79,
        meetingPlatform: "Google Meet",
        meetingLink: "https://meet.google.com/abc-defg-hij",
      },
    ];
  });

  const [loading, setLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<LiveCourse | null>(null);
  const [editingCourse, setEditingCourse] = useState<LiveCourse | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    instructor: "",
    description: "",
    startTime: "",
    endTime: "",
    price: 0,
    meetingPlatform: "",
    meetingLink: "",
  });

  const { toast } = useToast();

  // Save courses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("liveCourses", JSON.stringify(liveCourses));
  }, [liveCourses]);

  const resetForm = () => {
    setFormData({
      title: "",
      instructor: "",
      description: "",
      startTime: "",
      endTime: "",
      price: 0,
      meetingPlatform: "",
      meetingLink: "",
    });
  };

  const handleAddLiveCourse = () => {
    if (!formData.title || !formData.instructor || !formData.startTime) {
      toast({
        title: "Error",
        description: "Title, Instructor and Start Time are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const newCourse: LiveCourse = {
      id: Date.now().toString(),
      title: formData.title,
      instructor: formData.instructor,
      description: formData.description,
      startTime: formData.startTime,
      endTime: formData.endTime,
      price: formData.price || 0,
      meetingPlatform: formData.meetingPlatform,
      meetingLink: formData.meetingLink,
    };

    setLiveCourses((prev) => [...prev, newCourse]);
    setLoading(false);
    setIsAddDialogOpen(false);
    resetForm();

    toast({
      title: "Success",
      description: "Live course added successfully",
    });
  };

  const openEditDialog = (course: LiveCourse) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      instructor: course.instructor,
      description: course.description,
      startTime: course.startTime,
      endTime: course.endTime,
      price: course.price,
      meetingPlatform: course.meetingPlatform,
      meetingLink: course.meetingLink,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditLiveCourse = () => {
    if (!editingCourse) return;

    if (!formData.title || !formData.instructor || !formData.startTime) {
      toast({
        title: "Error",
        description: "Title, Instructor and Start Time are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    setLiveCourses((prev) =>
      prev.map((course) =>
        course.id === editingCourse.id
          ? {
              ...course,
              title: formData.title,
              instructor: formData.instructor,
              description: formData.description,
              startTime: formData.startTime,
              endTime: formData.endTime,
              price: formData.price || 0,
              meetingPlatform: formData.meetingPlatform,
              meetingLink: formData.meetingLink,
            }
          : course
      )
    );

    setLoading(false);
    setIsEditDialogOpen(false);
    setEditingCourse(null);
    resetForm();

    toast({
      title: "Success",
      description: "Live course updated successfully",
    });
  };

  const handleDeleteLiveCourse = () => {
    if (!courseToDelete) return;

    setLiveCourses((prev) =>
      prev.filter((course) => course.id !== courseToDelete.id)
    );
    setCourseToDelete(null);

    toast({
      title: "Deleted",
      description: "Live course deleted successfully",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPlatformColor = (platform: string) => {
    switch(platform.toLowerCase()) {
      case 'zoom': return 'bg-gradient-to-r from-blue-500 to-cyan-400';
      case 'google meet': return 'bg-gradient-to-r from-emerald-500 to-green-400';
      case 'teams': return 'bg-gradient-to-r from-purple-500 to-pink-400';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50/50 to-gray-100 p-4 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-200 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-indigo-200 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="bg-gradient-to-r from-white to-gray-50/80 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-lg shadow-gray-100/50">
            <div className="flex items-center gap-4 mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-indigo-300 rounded-xl blur-md opacity-60"></div>
                <div className="relative p-3 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl shadow-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                {/* Smaller heading */}
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                    Live Course Management
                  </h1>
                  <Sparkles className="h-3 w-3 text-blue-400 animate-pulse" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse"></div>
                  <p className="text-xs font-medium text-gray-600">
                    Manage and schedule interactive live sessions
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-blue-500" />
                <span className="text-xs font-medium text-gray-600">Interactive Sessions</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-3 w-3 text-indigo-500" />
                <span className="text-xs font-medium text-gray-600">Expert Instructors</span>
              </div>
            </div>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-white font-semibold px-5 py-3 h-auto rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <Plus className="h-4 w-4 mr-2 relative z-10" />
                <span className="text-sm relative z-10">Add Course</span>
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-xl bg-gradient-to-b from-white to-gray-50/50 backdrop-blur-sm border border-white/50 shadow-2xl shadow-blue-200/30 rounded-2xl">
              <DialogHeader className="pb-4 border-b border-gray-100/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                      Create New Live Course
                    </DialogTitle>
                    <p className="text-sm text-gray-600 font-medium mt-0.5">
                      Design your interactive live session
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-5 max-h-[65vh] overflow-y-auto p-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2.5">
                    <Label className="text-sm font-semibold text-gray-700">
                      Title <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        value={formData.title}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, title: e.target.value }))
                        }
                        className="pl-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
                        placeholder="Course title"
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <Label className="text-sm font-semibold text-gray-700">
                      Instructor <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        value={formData.instructor}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            instructor: e.target.value,
                          }))
                        }
                        className="pl-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
                        placeholder="Instructor name"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-sm font-semibold text-gray-700">
                    Description
                  </Label>
                  <Textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl resize-none bg-white/80 shadow-sm"
                    placeholder="Describe what students will learn in this course..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2.5">
                    <Label className="text-sm font-semibold text-gray-700">
                      Start Time <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="datetime-local"
                        value={formData.startTime}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            startTime: e.target.value,
                          }))
                        }
                        className="pl-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <Label className="text-sm font-semibold text-gray-700">
                      End Time
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="datetime-local"
                        value={formData.endTime}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            endTime: e.target.value,
                          }))
                        }
                        className="pl-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2.5">
                    <Label className="text-sm font-semibold text-gray-700">
                      Meeting Platform
                    </Label>
                    <div className="relative">
                      <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Zoom / Google Meet / Teams"
                        value={formData.meetingPlatform}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            meetingPlatform: e.target.value,
                          }))
                        }
                        className="pl-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <Label className="text-sm font-semibold text-gray-700">
                      Price
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            price: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="pl-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
                        placeholder="0 (free)"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-sm font-semibold text-gray-700">
                    Meeting Link
                  </Label>
                  <div className="relative">
                    <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="https://..."
                      value={formData.meetingLink}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          meetingLink: e.target.value,
                        }))
                      }
                      className="pl-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAddLiveCourse}
                  className="w-full mt-3 group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                  disabled={loading}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  {loading ? (
                    <span className="relative z-10 flex items-center justify-center text-sm">
                      <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    <span className="relative z-10 flex items-center justify-center text-sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Live Course
                    </span>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="group bg-gradient-to-br from-white to-gray-50/80 backdrop-blur-sm border-2 border-white/50 shadow-lg hover:shadow-xl hover:border-gray-200/70 transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1.5">Total Courses</p>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                    {liveCourses.length}
                  </h3>
                </div>
                <div className="p-2.5 bg-gradient-to-br from-gray-100 to-gray-100 rounded-lg shadow group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-4 w-4 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-white to-gray-50/80 backdrop-blur-sm border-2 border-white/50 shadow-lg hover:shadow-xl hover:border-gray-200/70 transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1.5">Upcoming</p>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                    {liveCourses.filter(c => new Date(c.startTime) > new Date()).length}
                  </h3>
                </div>
                <div className="p-2.5 bg-gradient-to-br from-gray-100 to-gray-100 rounded-lg shadow group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-4 w-4 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-white to-gray-50/80 backdrop-blur-sm border-2 border-white/50 shadow-lg hover:shadow-xl hover:border-gray-200/70 transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1.5">Instructors</p>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                    {new Set(liveCourses.map(c => c.instructor)).size}
                  </h3>
                </div>
                <div className="p-2.5 bg-gradient-to-br from-gray-100 to-gray-100 rounded-lg shadow group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-4 w-4 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-white to-gray-50/80 backdrop-blur-sm border-2 border-white/50 shadow-lg hover:shadow-xl hover:border-gray-200/70 transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1.5">Platforms</p>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                    {new Set(liveCourses.map(c => c.meetingPlatform)).size}
                  </h3>
                </div>
                <div className="p-2.5 bg-gradient-to-br from-gray-100 to-gray-100 rounded-lg shadow group-hover:scale-110 transition-transform duration-300">
                  <Video className="h-4 w-4 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {liveCourses.map((course) => {
            const isUpcoming = new Date(course.startTime) > new Date();
            const isFree = course.price === 0;
            
            return (
              <Card
                key={course.id}
                className="group relative overflow-hidden bg-gradient-to-b from-white to-gray-50/60 backdrop-blur-sm border-2 border-gray-200/70 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200/5 via-gray-200/5 to-gray-200/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3 z-10">
                  <Badge className={`text-xs font-bold px-2.5 py-1 rounded-full shadow ${
                    isUpcoming 
                      ? 'bg-gradient-to-r from-emerald-500 to-green-400 text-white border-0' 
                      : 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white border-0'
                  }`}>
                    {isUpcoming ? 'UPCOMING' : 'COMPLETED'}
                  </Badge>
                </div>
                
                <CardHeader className="pt-6 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-400 rounded-lg shadow">
                          <BookOpen className="h-4 w-4 text-white" />
                        </div>
                        <CardTitle className="text-base font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent line-clamp-2">
                          {course.title}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2.5 mt-2">
                        <div className="p-1.5 bg-gradient-to-br from-gray-100 to-gray-100 rounded-lg shadow-sm">
                          <Users className="h-3.5 w-3.5 text-gray-700" />
                        </div>
                        <p className="text-sm font-semibold text-gray-800">
                          {course.instructor}
                        </p>
                      </div>
                    </div>
                    {!isFree && (
                      <Badge className="text-xs font-bold px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-400 text-white border-0 shadow">
                        ${course.price}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4 pt-0 pb-5">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-gray-50 to-gray-50 rounded-lg">
                      <div className="p-1.5 bg-white rounded-lg shadow-sm">
                        <Calendar className="h-3.5 w-3.5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">STARTS</p>
                        <p className="text-xs text-gray-700 font-medium">{formatDate(course.startTime)}</p>
                      </div>
                    </div>

                    {course.endTime && (
                      <div className="flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-gray-50 to-gray-50 rounded-lg">
                        <div className="p-1.5 bg-white rounded-lg shadow-sm">
                          <Clock className="h-3.5 w-3.5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900">ENDS</p>
                          <p className="text-xs text-gray-700 font-medium">{formatDate(course.endTime)}</p>
                        </div>
                      </div>
                    )}

                    {course.meetingPlatform && (
                      <div className="flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-gray-50 to-gray-50 rounded-lg">
                        <div className="p-1.5 bg-white rounded-lg shadow-sm">
                          <Video className="h-3.5 w-3.5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900">PLATFORM</p>
                          <Badge className={`text-xs font-medium px-2 py-0.5 text-white border-0 shadow ${getPlatformColor(course.meetingPlatform)}`}>
                            {course.meetingPlatform}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>

                  {course.description && (
                    <div className="pt-2 border-t border-gray-100/50">
                      <p className="text-xs text-gray-700 line-clamp-3">{course.description}</p>
                    </div>
                  )}

                  {course.meetingLink && (
                    <a
                      href={course.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-3 group/link relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium text-xs p-3 rounded-lg shadow hover:shadow-xl transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/link:translate-x-full transition-transform duration-700"></div>
                      <div className="flex items-center gap-2 relative z-10">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                        <span>Join Live Session</span>
                      </div>
                      <p className="text-xs text-white/80 truncate mt-1 relative z-10">{course.meetingLink}</p>
                    </a>
                  )}

                  <div className="flex justify-between pt-3 border-t border-gray-100/50">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(course)}
                        className="group relative overflow-hidden border-2 border-gray-200 hover:border-gray-400 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-50 text-gray-700 hover:text-gray-900 font-medium text-xs px-2.5 py-1.5 rounded-lg shadow-sm hover:shadow transition-all duration-300"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        <Edit className="h-3 w-3 mr-1.5 relative z-10" />
                        <span className="relative z-10">Edit</span>
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setCourseToDelete(course)}
                      className="group relative overflow-hidden bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium text-xs px-2.5 py-1.5 rounded-lg shadow-sm hover:shadow transition-all duration-300 hover:scale-105"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      <Trash2 className="h-3 w-3 mr-1.5 relative z-10" />
                      <span className="relative z-10">Delete</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* If no courses */}
        {liveCourses.length === 0 && (
          <Card className="bg-gradient-to-b from-white to-gray-50/60 backdrop-blur-sm border-2 border-dashed border-gray-300/50 shadow-lg">
            <CardContent className="py-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-300 rounded-full blur-md opacity-30"></div>
                  <div className="relative p-4 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full shadow-lg">
                    <Video className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent mb-2">
                  No Live Courses Yet
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  Start creating engaging live sessions to teach students!
                </p>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-white font-semibold px-5 py-3 h-auto rounded-xl text-sm">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      <Plus className="h-4 w-4 mr-2 relative z-10" />
                      <span className="relative z-10">Schedule First Course</span>
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-xl bg-gradient-to-b from-white to-gray-50/50 backdrop-blur-sm border border-white/50 shadow-2xl shadow-blue-200/30 rounded-2xl">
            <DialogHeader className="pb-4 border-b border-gray-100/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow">
                  <Edit className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                    Edit Live Course
                  </DialogTitle>
                  <p className="text-sm text-gray-600 font-medium mt-0.5">
                    Update your live course details
                  </p>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-5 max-h-[65vh] overflow-y-auto p-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2.5">
                  <Label className="text-sm font-semibold text-gray-700">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, title: e.target.value }))
                      }
                      className="pl-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-sm font-semibold text-gray-700">
                    Instructor <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      value={formData.instructor}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          instructor: e.target.value,
                        }))
                      }
                      className="pl-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <Label className="text-sm font-semibold text-gray-700">
                  Description
                </Label>
                <Textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl resize-none bg-white/80 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2.5">
                  <Label className="text-sm font-semibold text-gray-700">
                    Start Time <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          startTime: e.target.value,
                        }))
                      }
                      className="pl-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-sm font-semibold text-gray-700">
                    End Time
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          endTime: e.target.value,
                        }))
                      }
                      className="pl-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2.5">
                  <Label className="text-sm font-semibold text-gray-700">
                    Meeting Platform
                  </Label>
                  <div className="relative">
                    <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Zoom / Google Meet / Teams"
                      value={formData.meetingPlatform}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          meetingPlatform: e.target.value,
                        }))
                      }
                      className="pl-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-sm font-semibold text-gray-700">
                    Price
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          price: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="pl-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <Label className="text-sm font-semibold text-gray-700">
                  Meeting Link
                </Label>
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="https://..."
                    value={formData.meetingLink}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        meetingLink: e.target.value,
                      }))
                    }
                    className="pl-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
                  />
                </div>
              </div>

              <Button
                onClick={handleEditLiveCourse}
                className="w-full mt-3 group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                disabled={loading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                {loading ? (
                  <span className="relative z-10 flex items-center justify-center text-sm">
                    <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Updating...
                  </span>
                ) : (
                  <span className="relative z-10 flex items-center justify-center text-sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Update Live Course
                  </span>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog
          open={!!courseToDelete}
          onOpenChange={(open) => {
            if (!open) setCourseToDelete(null);
          }}
        >
          <AlertDialogContent className="bg-gradient-to-b from-white to-rose-50/80 backdrop-blur-sm border border-white/50 shadow-2xl shadow-rose-200/30 rounded-2xl max-w-md">
            <AlertDialogHeader className="p-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-400 rounded-lg shadow">
                  <Trash2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <AlertDialogTitle className="text-lg font-bold bg-gradient-to-r from-rose-800 to-pink-700 bg-clip-text text-transparent">
                    Delete Live Course
                  </AlertDialogTitle>
                  <p className="text-sm text-rose-600/80 font-medium mt-0.5">This action cannot be undone</p>
                </div>
              </div>
            </AlertDialogHeader>
            <div className="space-y-5 p-5 pt-0">
              <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border-2 border-rose-100">
                <p className="text-sm font-bold text-rose-900 mb-2">
                  "{courseToDelete?.title}"
                </p>
                <p className="text-xs text-rose-700">
                  Are you sure you want to delete this live course? This will permanently remove all course data.
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <AlertDialogCancel className="group relative overflow-hidden border-2 border-gray-200 hover:border-gray-400 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-50 text-gray-700 hover:text-gray-900 font-medium text-xs px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative z-10">Cancel</span>
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteLiveCourse}
                  className="group relative overflow-hidden bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium text-xs px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative z-10">Delete Course</span>
                </AlertDialogAction>
              </div>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default LiveCourseManagement;