import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { X, Calendar, Clock, Link, BookOpen, Users, Upload, Loader2, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CreateLiveSessionProps {
  onCreated?: (data: any) => void;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  apiBaseUrl?: string;
  trainerId?: string;
}

const CreateLiveSession: React.FC<CreateLiveSessionProps> = ({ 
  onCreated, 
  onOpenChange, 
  open = false,
  apiBaseUrl = "https://triaright.com/api/livecourses",
  trainerId
}) => {
  const { toast } = useToast();

  // Form state
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionNumber, setSessionNumber] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledStartTime, setScheduledStartTime] = useState("");
  const [scheduledEndTime, setScheduledEndTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);

  // Data state
  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [fetchingCourses, setFetchingCourses] = useState(false);
  const [fetchingBatches, setFetchingBatches] = useState(false);

  // Error states
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("token") || localStorage.getItem("authToken");
  };

  // Fetch trainer's assigned courses
  const fetchCourses = async () => {
    setFetchingCourses(true);
    try {
      const token = getAuthToken();
      
      if (!token) {
        toast({
          title: "❌ Authentication Error",
          description: "Please login to continue",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch(`${apiBaseUrl}/trainer/assigned/courses`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }
      
      const data = await response.json();
      const courseList = data.courses || data;
      setCourses(courseList);

      if (courseList.length > 0) {
        toast({
          title: "✅ Courses Loaded",
          description: `Found ${courseList.length} course(s)`,
        });
      } else {
        toast({
          title: "ℹ️ No Courses",
          description: "No courses assigned to you",
        });
      }
    } catch (error: any) {
      console.error("Fetch courses error:", error);
      toast({
        title: "❌ Error",
        description: error.message || "Failed to fetch courses",
        variant: "destructive"
      });
    } finally {
      setFetchingCourses(false);
    }
  };

  // Fetch batches for selected course
  const fetchBatchesForCourse = async (courseId: string) => {
    if (!courseId) {
      setBatches([]);
      return;
    }

    setFetchingBatches(true);
    try {
      const token = getAuthToken();
      console.log("Fetching batches for course:", courseId);
      
      const response = await fetch(`${apiBaseUrl}/admin/courses/${courseId}/batches`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch batches");
      }
      
      const data = await response.json();
      const batchList = data.batches || data;
      setBatches(batchList);

      if (batchList.length > 0) {
        toast({
          title: "✅ Batches Loaded",
          description: `Found ${batchList.length} batch(es) for this course`,
        });
      } else {
        toast({
          title: "ℹ️ No Batches",
          description: "No batches found for this course",
        });
      }
    } catch (error: any) {
      console.error("Fetch batches error:", error);
      toast({
        title: "❌ Error",
        description: error.message || "Failed to fetch batches",
        variant: "destructive"
      });
      setBatches([]);
    } finally {
      setFetchingBatches(false);
    }
  };

  // When course changes, fetch its batches
  useEffect(() => {
    if (selectedCourseId) {
      fetchBatchesForCourse(selectedCourseId);
      setSelectedBatchId("");
    } else {
      setBatches([]);
      setSelectedBatchId("");
    }
  }, [selectedCourseId]);

  // Fetch data when modal opens
  useEffect(() => {
    if (open) {
      fetchCourses();
      
      // Set default date and time
      if (!scheduledDate) {
        const today = new Date();
        setScheduledDate(today.toISOString().split('T')[0]);
        
        const nextHour = new Date(today.getTime() + 60 * 60 * 1000);
        const hours = nextHour.getHours().toString().padStart(2, '0');
        const minutes = nextHour.getMinutes().toString().padStart(2, '0');
        setScheduledStartTime(`${hours}:${minutes}`);
        
        const endHour = new Date(nextHour.getTime() + 60 * 60 * 1000);
        const endHours = endHour.getHours().toString().padStart(2, '0');
        const endMinutes = endHour.getMinutes().toString().padStart(2, '0');
        setScheduledEndTime(`${endHours}:${endMinutes}`);
      }
    }
  }, [open]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && onOpenChange) {
        onOpenChange(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onOpenChange]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Session Title validation
    if (!sessionTitle.trim()) {
      newErrors.sessionTitle = "Session title is required";
    } else if (sessionTitle.trim().length < 5) {
      newErrors.sessionTitle = "Title must be at least 5 characters";
    } else if (sessionTitle.trim().length > 200) {
      newErrors.sessionTitle = "Title must not exceed 200 characters";
    }

    // Course validation
    if (!selectedCourseId) {
      newErrors.course = "Please select a course";
    }

    // Batch validation
    if (!selectedBatchId) {
      newErrors.batch = "Please select a batch";
    }

    // Date validation
    if (!scheduledDate) {
      newErrors.date = "Scheduled date is required";
    } else {
      const selectedDateObj = new Date(scheduledDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDateObj < today) {
        newErrors.date = "Date cannot be in the past";
      }
    }

    // Start time validation
    if (!scheduledStartTime) {
      newErrors.startTime = "Start time is required";
    }

    // End time validation
    if (!scheduledEndTime) {
      newErrors.endTime = "End time is required";
    }

    // Time comparison validation
    if (scheduledStartTime && scheduledEndTime) {
      if (scheduledStartTime >= scheduledEndTime) {
        newErrors.endTime = "End time must be after start time";
      }

      // Check if session is too long (more than 8 hours)
      const start = new Date(`2000-01-01T${scheduledStartTime}`);
      const end = new Date(`2000-01-01T${scheduledEndTime}`);
      const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      
      if (diffHours > 8) {
        newErrors.endTime = "Session duration cannot exceed 8 hours";
      }
    }

    // Meeting link validation
    if (!meetingLink.trim()) {
      newErrors.meetingLink = "Meeting link is required";
    } else {
      // Basic URL validation
      try {
        new URL(meetingLink.trim());
      } catch {
        newErrors.meetingLink = "Please enter a valid URL (e.g., https://zoom.us/...)";
      }
    }

    // File validation
    if (files && files.length > 0) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const maxFiles = 5;

      if (files.length > maxFiles) {
        newErrors.files = `Maximum ${maxFiles} files allowed`;
      }

      for (let i = 0; i < files.length; i++) {
        if (files[i].size > maxSize) {
          newErrors.files = `File "${files[i].name}" exceeds 10MB limit`;
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log("Submit button clicked");
    
    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validate()) {
      toast({
        title: "❌ Validation Failed",
        description: "Please fix all errors before submitting",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    toast({
      title: "⏳ Creating Session...",
      description: "Please wait while we create your live session",
    });

    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }
      
      // Create FormData for file upload
      const formData = new FormData();
      
      // Required fields
      formData.append("sessionTitle", sessionTitle.trim());
      formData.append("courseId", selectedCourseId);
      formData.append("batchId", selectedBatchId);
      
      // If trainerId is provided, use it
      if (trainerId) {
        formData.append("trainerUserId", trainerId);
      }
      
      formData.append("scheduledDate", scheduledDate);
      formData.append("scheduledStartTime", scheduledStartTime);
      formData.append("scheduledEndTime", scheduledEndTime);
      formData.append("meetingLink", meetingLink.trim());
      
      // Optional fields
      if (sessionNumber.trim()) {
        formData.append("sessionNumber", sessionNumber.trim());
      }
      if (description.trim()) {
        formData.append("description", description.trim());
      }
      
      // Append files
      if (files && files.length > 0) {
        Array.from(files).forEach((file) => {
          formData.append("files", file);
        });
      }

      console.log("Sending request to:", `${apiBaseUrl}/trainer/live-sessions`);

      const response = await fetch(`${apiBaseUrl}/trainer/live-sessions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Success response:", data);

      toast({
        title: "✅ Session Created Successfully!",
        description: `${sessionTitle} scheduled for ${scheduledDate} at ${scheduledStartTime}`,
        duration: 5000
      });

      // Call onCreated callback
      if (onCreated) {
        onCreated(data.session || data);
      }

      // Reset form
      resetForm();
      
      // Close modal after a short delay
      setTimeout(() => {
        if (onOpenChange) {
          onOpenChange(false);
        }
      }, 1500);

    } catch (error: any) {
      console.error("Error creating session:", error);
      toast({
        title: "❌ Error Creating Session",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSessionTitle("");
    setSessionNumber("");
    setDescription("");
    setScheduledDate("");
    setScheduledStartTime("");
    setScheduledEndTime("");
    setMeetingLink("");
    setSelectedCourseId("");
    setSelectedBatchId("");
    setFiles(null);
    setBatches([]);
    setErrors({});
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
      toast({
        title: "✅ Files Selected",
        description: `${e.target.files.length} file(s) selected`,
      });
    }
  };

  const removeFiles = () => {
    setFiles(null);
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    toast({
      title: "Files Removed",
      description: "All files have been cleared",
    });
  };

  if (!open) return null;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <motion.div 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onOpenChange?.(false)}
            />
            
            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ 
                type: "spring", 
                damping: 20,
                stiffness: 300
              }}
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="w-full shadow-2xl bg-white border border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between pb-4 border-b bg-gradient-to-r from-blue-50 to-white sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">Create Live Session</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onOpenChange?.(false)}
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                
                <CardContent className="p-6">
                  <motion.div 
                    className="space-y-5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {/* Course Selection */}
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        <span className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-blue-500" />
                          Select Course <span className="text-red-500">*</span>
                        </span>
                      </label>
                      <select 
                        value={selectedCourseId} 
                        onChange={(e) => {
                          setSelectedCourseId(e.target.value);
                          if (errors.course) {
                            setErrors({ ...errors, course: "" });
                          }
                        }}
                        disabled={fetchingCourses}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.course ? 'border-red-500' : 'border-gray-300'}`}
                      >
                        <option value="">
                          {fetchingCourses ? "Loading courses..." : "-- Select Course --"}
                        </option>
                        {courses.map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.courseName || course.title || course.name}
                          </option>
                        ))}
                      </select>
                      {errors.course && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.course}
                        </p>
                      )}
                    </motion.div>

                    {/* Batch Selection */}
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.15 }}
                    >
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        <span className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-500" />
                          Select Batch <span className="text-red-500">*</span>
                        </span>
                      </label>
                      <select 
                        value={selectedBatchId} 
                        onChange={(e) => {
                          setSelectedBatchId(e.target.value);
                          if (errors.batch) {
                            setErrors({ ...errors, batch: "" });
                          }
                        }}
                        disabled={!selectedCourseId || fetchingBatches}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.batch ? 'border-red-500' : 'border-gray-300'}`}
                      >
                        <option value="">
                          {!selectedCourseId 
                            ? "Select a course first" 
                            : fetchingBatches 
                            ? "Loading batches..." 
                            : batches.length === 0 
                            ? "No batches available"
                            : "-- Select Batch --"}
                        </option>
                        {batches.map((batch) => (
                          <option key={batch._id} value={batch._id}>
                            {batch.batchName || batch.name}
                          </option>
                        ))}
                      </select>
                      {errors.batch && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.batch}
                        </p>
                      )}
                    </motion.div>

                    {/* Session Title & Number */}
                    <motion.div 
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="md:col-span-2">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          <span className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            Session Title <span className="text-red-500">*</span>
                          </span>
                        </label>
                        <Input 
                          value={sessionTitle} 
                          onChange={(e) => {
                            setSessionTitle(e.target.value);
                            if (errors.sessionTitle) {
                              setErrors({ ...errors, sessionTitle: "" });
                            }
                          }}
                          placeholder="e.g., React Hooks Deep Dive"
                          className={`focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.sessionTitle ? 'border-red-500' : ''}`}
                          maxLength={200}
                        />
                        {errors.sessionTitle && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.sessionTitle}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Session Number
                        </label>
                        <Input 
                          type="number" 
                          value={sessionNumber} 
                          onChange={(e) => setSessionNumber(e.target.value)}
                          placeholder="e.g., 5"
                          min={1}
                          className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                      </div>
                    </motion.div>

                    {/* Description */}
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.25 }}
                    >
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <Textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Brief description of the session topics..."
                        className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[80px]"
                        maxLength={1000}
                      />
                      <p className="text-xs text-gray-500 mt-1">{description.length}/1000 characters</p>
                    </motion.div>

                    {/* Date & Times */}
                    <motion.div 
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          <span className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            Date <span className="text-red-500">*</span>
                          </span>
                        </label>
                        <Input 
                          type="date" 
                          value={scheduledDate} 
                          onChange={(e) => {
                            setScheduledDate(e.target.value);
                            if (errors.date) {
                              setErrors({ ...errors, date: "" });
                            }
                          }}
                          className={`focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.date ? 'border-red-500' : ''}`}
                        />
                        {errors.date && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.date}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          <span className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            Start Time <span className="text-red-500">*</span>
                          </span>
                        </label>
                        <Input 
                          type="time" 
                          value={scheduledStartTime} 
                          onChange={(e) => {
                            setScheduledStartTime(e.target.value);
                            if (errors.startTime) {
                              setErrors({ ...errors, startTime: "" });
                            }
                          }}
                          className={`focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.startTime ? 'border-red-500' : ''}`}
                        />
                        {errors.startTime && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.startTime}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          <span className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            End Time <span className="text-red-500">*</span>
                          </span>
                        </label>
                        <Input 
                          type="time" 
                          value={scheduledEndTime} 
                          onChange={(e) => {
                            setScheduledEndTime(e.target.value);
                            if (errors.endTime) {
                              setErrors({ ...errors, endTime: "" });
                            }
                          }}
                          className={`focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.endTime ? 'border-red-500' : ''}`}
                        />
                        {errors.endTime && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.endTime}
                          </p>
                        )}
                      </div>
                    </motion.div>

                    {/* Meeting Link */}
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.35 }}
                    >
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        <span className="flex items-center gap-2">
                          <Link className="h-4 w-4 text-blue-500" />
                          Meeting Link <span className="text-red-500">*</span>
                        </span>
                      </label>
                      <Input 
                        value={meetingLink} 
                        onChange={(e) => {
                          setMeetingLink(e.target.value);
                          if (errors.meetingLink) {
                            setErrors({ ...errors, meetingLink: "" });
                          }
                        }}
                        placeholder="https://zoom.us/j/... or Google Meet link"
                        className={`focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.meetingLink ? 'border-red-500' : ''}`}
                      />
                      {errors.meetingLink && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.meetingLink}
                        </p>
                      )}
                    </motion.div>

                    {/* File Upload */}
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        <span className="flex items-center gap-2">
                          <Upload className="h-4 w-4 text-blue-500" />
                          Session Materials (Optional - Max 5 files, 10MB each)
                        </span>
                      </label>
                      <div className={`border-2 border-dashed rounded-lg p-4 hover:border-blue-500 transition-colors ${errors.files ? 'border-red-500' : 'border-gray-300'}`}>
                        <Input 
                          type="file" 
                          multiple
                          onChange={handleFileChange}
                          id="file-upload"
                          className="cursor-pointer"
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.mp4,.avi"
                        />
                        {files && files.length > 0 && (
                          <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                {files.length} file(s) selected
                              </p>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={removeFiles}
                                className="h-6 text-xs hover:bg-red-50 hover:text-red-600"
                              >
                                <X className="w-3 h-3 mr-1" />
                                Clear
                              </Button>
                            </div>
                            <div className="space-y-1">
                              {Array.from(files).map((file, idx) => (
                                <p key={idx} className="text-xs text-gray-600 truncate">
                                  • {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      {errors.files && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.files}
                        </p>
                      )}
                    </motion.div>

                    {/* Actions */}
                    <motion.div 
                      className="flex justify-end gap-3 pt-4 border-t"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.45 }}
                    >
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          resetForm();
                          onOpenChange?.(false);
                        }}
                        disabled={loading}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </Button>
                      <motion.div
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                      >
                        <Button 
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={handleSubmit}
                          disabled={loading}
                          type="button"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Create Session
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Toaster />
    </>
  );
};

export default CreateLiveSession;