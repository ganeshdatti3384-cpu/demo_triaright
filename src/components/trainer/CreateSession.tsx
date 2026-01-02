// /* eslint-disable @typescript-eslint/no-explicit-any */
// import React, { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { useToast } from "@/components/ui/use-toast";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { X, Calendar, Clock, Link, BookOpen, Users } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";

// interface CreateSessionProps {
//   onCreated: (data: any) => void;
//   onOpenChange?: (open: boolean) => void;
//   open?: boolean;
// }

// const CreateSession: React.FC<CreateSessionProps> = ({ onCreated, onOpenChange, open = false }) => {
//   const { toast } = useToast();

//   const [title, setTitle] = useState("");
//   const [date, setDate] = useState("");
//   const [time, setTime] = useState("");
//   const [duration, setDuration] = useState("");
//   const [meetingLink, setMeetingLink] = useState("");
//   const [course, setCourse] = useState("");
//   const [batch, setBatch] = useState("");

//   const validate = (): string | null => {
//     if (!title.trim()) return "Title is required";
//     if (!date) return "Date is required";
//     if (!time) return "Start time is required";
//     if (!meetingLink.trim()) return "Meeting link is required";
//     if (duration && isNaN(Number(duration))) return "Duration must be a number (minutes)";
//     return null;
//   };

//   const handleSubmit = () => {
//     const error = validate();
//     if (error) {
//       toast({
//         title: "Validation error",
//         description: error,
//         variant: "destructive",
//       });
//       return;
//     }

//     const newSession = {
//       id: Date.now(),
//       title,
//       date,
//       time,
//       duration: duration ? Number(duration) : undefined,
//       meetingLink,
//       course,
//       batch,
//       createdAt: new Date().toISOString(),
//     };

//     onCreated(newSession);

//     toast({
//       title: "Session Created Successfully! 🎉",
//       description: "Your live session has been scheduled.",
//     });

//     onOpenChange?.(false);

//     // reset
//     setTitle("");
//     setDate("");
//     setTime("");
//     setDuration("");
//     setMeetingLink("");
//     setCourse("");
//     setBatch("");
//   };

//   // Set default date to today
//   useEffect(() => {
//     if (open && !date) {
//       const today = new Date();
//       const formattedDate = today.toISOString().split('T')[0];
//       setDate(formattedDate);
      
//       // Set default time to next hour
//       const nextHour = new Date(today.getTime() + 60 * 60 * 1000);
//       const hours = nextHour.getHours().toString().padStart(2, '0');
//       const minutes = nextHour.getMinutes().toString().padStart(2, '0');
//       setTime(`${hours}:${minutes}`);
//     }
//   }, [open, date]);

//   // Handle escape key
//   useEffect(() => {
//     const handleEscape = (e: KeyboardEvent) => {
//       if (e.key === 'Escape' && open && onOpenChange) {
//         onOpenChange(false);
//       }
//     };
    
//     document.addEventListener('keydown', handleEscape);
//     return () => document.removeEventListener('keydown', handleEscape);
//   }, [open, onOpenChange]);

//   // If this component is being used as a standalone modal (controlled by parent)
//   if (onOpenChange && open !== undefined) {
//     return (
//       <AnimatePresence>
//         {open && (
//           <motion.div
//             className="fixed inset-0 z-50 flex items-center justify-center p-4"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.2 }}
//           >
//             {/* Backdrop with animation */}
//             <motion.div 
//               className="absolute inset-0 bg-black/40 backdrop-blur-sm"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={() => onOpenChange(false)}
//             />
            
//             {/* Modal Container with popup animation */}
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0, y: 20 }}
//               animate={{ scale: 1, opacity: 1, y: 0 }}
//               exit={{ scale: 0.9, opacity: 0, y: 20 }}
//               transition={{ 
//                 type: "spring", 
//                 damping: 20,
//                 stiffness: 300
//               }}
//               className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <Card className="w-full shadow-2xl bg-white border border-gray-200">
//                 <CardHeader className="flex flex-row items-center justify-between pb-4 border-b bg-gradient-to-r from-blue-50 to-white">
//                   <div className="flex items-center gap-3">
//                     <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
//                       <Calendar className="h-5 w-5" />
//                     </div>
//                     <CardTitle className="text-xl font-bold text-gray-900">Create Live Session</CardTitle>
//                   </div>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => onOpenChange(false)}
//                     className="h-8 w-8 p-0 hover:bg-gray-100"
//                   >
//                     <X className="h-4 w-4" />
//                   </Button>
//                 </CardHeader>
                
//                 <CardContent className="p-6">
//                   {/* Form content with animations */}
//                   <motion.div 
//                     className="space-y-5"
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ delay: 0.1 }}
//                   >
//                     {/* Title */}
//                     <motion.div
//                       initial={{ x: -20, opacity: 0 }}
//                       animate={{ x: 0, opacity: 1 }}
//                       transition={{ delay: 0.1 }}
//                     >
//                       <label className="block mb-2 text-sm font-medium text-gray-700">
//                         <span className="flex items-center gap-2">
//                           <Calendar className="h-4 w-4 text-blue-500" />
//                           Session Title <span className="text-red-500">*</span>
//                         </span>
//                       </label>
//                       <Input 
//                         value={title} 
//                         onChange={(e: any) => setTitle(e.target.value)} 
//                         placeholder="Enter session title"
//                         className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
//                       />
//                     </motion.div>

//                     {/* Date & Time */}
//                     <motion.div 
//                       className="grid grid-cols-1 md:grid-cols-2 gap-4"
//                       initial={{ x: -20, opacity: 0 }}
//                       animate={{ x: 0, opacity: 1 }}
//                       transition={{ delay: 0.15 }}
//                     >
//                       <div>
//                         <label className="block mb-2 text-sm font-medium text-gray-700">
//                           <span className="flex items-center gap-2">
//                             <Calendar className="h-4 w-4 text-blue-500" />
//                             Session Date <span className="text-red-500">*</span>
//                           </span>
//                         </label>
//                         <Input 
//                           type="date" 
//                           value={date} 
//                           onChange={(e: any) => setDate(e.target.value)} 
//                           className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
//                         />
//                       </div>
//                       <div>
//                         <label className="block mb-2 text-sm font-medium text-gray-700">
//                           <span className="flex items-center gap-2">
//                             <Clock className="h-4 w-4 text-blue-500" />
//                             Session Time <span className="text-red-500">*</span>
//                           </span>
//                         </label>
//                         <Input 
//                           type="time" 
//                           value={time} 
//                           onChange={(e: any) => setTime(e.target.value)} 
//                           className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
//                         />
//                       </div>
//                     </motion.div>

//                     {/* Duration & Meeting Link */}
//                     <motion.div 
//                       className="grid grid-cols-1 md:grid-cols-2 gap-4"
//                       initial={{ x: -20, opacity: 0 }}
//                       animate={{ x: 0, opacity: 1 }}
//                       transition={{ delay: 0.2 }}
//                     >
//                       <div>
//                         <label className="block mb-2 text-sm font-medium text-gray-700">
//                           <span className="flex items-center gap-2">
//                             <Clock className="h-4 w-4 text-blue-500" />
//                             Duration (minutes)
//                           </span>
//                         </label>
//                         <Input 
//                           type="number" 
//                           placeholder="e.g., 60" 
//                           value={duration} 
//                           onChange={(e: any) => setDuration(e.target.value)} 
//                           min={1}
//                           className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
//                         />
//                       </div>
//                       <div>
//                         <label className="block mb-2 text-sm font-medium text-gray-700">
//                           <span className="flex items-center gap-2">
//                             <Link className="h-4 w-4 text-blue-500" />
//                             Meeting Link <span className="text-red-500">*</span>
//                           </span>
//                         </label>
//                         <Input 
//                           value={meetingLink} 
//                           onChange={(e: any) => setMeetingLink(e.target.value)} 
//                           placeholder="Zoom / Google Meet link"
//                           className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
//                         />
//                       </div>
//                     </motion.div>

//                     {/* Course & Batch */}
//                     <motion.div 
//                       className="grid grid-cols-1 md:grid-cols-2 gap-4"
//                       initial={{ x: -20, opacity: 0 }}
//                       animate={{ x: 0, opacity: 1 }}
//                       transition={{ delay: 0.25 }}
//                     >
//                       <div>
//                         <label className="block mb-2 text-sm font-medium text-gray-700">
//                           <span className="flex items-center gap-2">
//                             <BookOpen className="h-4 w-4 text-blue-500" />
//                             Select Course
//                           </span>
//                         </label>
//                         <select 
//                           value={course} 
//                           onChange={(e) => setCourse(e.target.value)} 
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
//                         >
//                           <option value="">-- Select Course --</option>
//                           <option value="MERN">MERN Full Stack</option>
//                           <option value="Python">Python</option>
//                           <option value="Java">Java</option>
//                           <option value="UI/UX">UI/UX Design</option>
//                           <option value="Data Science">Data Science</option>
//                         </select>
//                       </div>

//                       <div>
//                         <label className="block mb-2 text-sm font-medium text-gray-700">
//                           <span className="flex items-center gap-2">
//                             <Users className="h-4 w-4 text-blue-500" />
//                             Select Batch
//                           </span>
//                         </label>
//                         <select 
//                           value={batch} 
//                           onChange={(e) => setBatch(e.target.value)} 
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
//                         >
//                           <option value="">-- Select Batch --</option>
//                           <option value="Batch A">Batch A</option>
//                           <option value="Batch B">Batch B</option>
//                           <option value="Batch C">Batch C</option>
//                           <option value="Batch D">Batch D</option>
//                           <option value="Batch E">Batch E</option>
//                         </select>
//                       </div>
//                     </motion.div>

//                     {/* Actions */}
//                     <motion.div 
//                       className="flex justify-end gap-3 pt-4 border-t"
//                       initial={{ y: 20, opacity: 0 }}
//                       animate={{ y: 0, opacity: 1 }}
//                       transition={{ delay: 0.3 }}
//                     >
//                       <Button 
//                         variant="outline" 
//                         onClick={() => onOpenChange?.(false)}
//                         className="hover:bg-gray-50 transition-colors"
//                       >
//                         Cancel
//                       </Button>
//                       <motion.div
//                         whileHover={{ scale: 1.02 }}
//                         whileTap={{ scale: 0.98 }}
//                       >
//                         <Button 
//                           className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all"
//                           onClick={handleSubmit}
//                         >
//                           Create Session
//                         </Button>
//                       </motion.div>
//                     </motion.div>
//                   </motion.div>
//                 </CardContent>
//               </Card>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     );
//   }

//   // If this component is being used as just the form (inside a dialog/modal)
//   return (
//     <div className="space-y-4">
//       {/* Title */}
//       <div>
//         <label className="block mb-1 text-sm font-medium">Session Title <span className="text-red-500">*</span></label>
//         <Input value={title} onChange={(e: any) => setTitle(e.target.value)} placeholder="Enter session title" />
//       </div>

//       {/* Date & Time */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div>
//           <label className="block mb-1 text-sm font-medium">Session Date <span className="text-red-500">*</span></label>
//           <Input type="date" value={date} onChange={(e: any) => setDate(e.target.value)} />
//         </div>
//         <div>
//           <label className="block mb-1 text-sm font-medium">Session Time <span className="text-red-500">*</span></label>
//           <Input type="time" value={time} onChange={(e: any) => setTime(e.target.value)} />
//         </div>
//       </div>

//       {/* Duration & Meeting Link */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div>
//           <label className="block mb-1 text-sm font-medium">Duration (minutes)</label>
//           <Input type="number" placeholder="e.g., 60" value={duration} onChange={(e: any) => setDuration(e.target.value)} min={1} />
//         </div>
//         <div>
//           <label className="block mb-1 text-sm font-medium">Meeting Link <span className="text-red-500">*</span></label>
//           <Input value={meetingLink} onChange={(e: any) => setMeetingLink(e.target.value)} placeholder="Zoom / Google Meet link" />
//         </div>
//       </div>

//       {/* Course & Batch */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div>
//           <label className="block mb-1 text-sm font-medium">Select Course</label>
//           <select value={course} onChange={(e) => setCourse(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white">
//             <option value="">-- Select Course --</option>
//             <option value="MERN">MERN Full Stack</option>
//             <option value="Python">Python</option>
//             <option value="Java">Java</option>
//             <option value="UI/UX">UI/UX Design</option>
//             <option value="Data Science">Data Science</option>
//           </select>
//         </div>

//         <div>
//           <label className="block mb-1 text-sm font-medium">Select Batch</label>
//           <select value={batch} onChange={(e) => setBatch(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white">
//             <option value="">-- Select Batch --</option>
//             <option value="Batch A">Batch A</option>
//             <option value="Batch B">Batch B</option>
//             <option value="Batch C">Batch C</option>
//             <option value="Batch D">Batch D</option>
//             <option value="Batch E">Batch E</option>
//           </select>
//         </div>
//       </div>

//       {/* Actions */}
//       <div className="flex justify-end gap-3 pt-4 border-t">
//         <Button variant="outline" onClick={() => onOpenChange?.(false)}>
//           Cancel
//         </Button>
//         <Button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white" onClick={handleSubmit}>
//           Create Session
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default CreateSession;


import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { X, Calendar, Clock, Link, BookOpen, Users, Upload, Loader2, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CreateLiveSessionProps {
  onCreated?: (data: any) => void;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  apiBaseUrl?: string;
  trainerId?: string; // Custom trainer ID like TRCTRA_12000
}

const CreateLiveSession: React.FC<CreateLiveSessionProps> = ({ 
  onCreated, 
  onOpenChange, 
  open = false,
  apiBaseUrl = "https://triaright.com/api/livecourses",
  trainerId // Pass trainer ID from parent or get from user context
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

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("token") || localStorage.getItem("authToken");
  };

  // Fetch trainer's assigned courses
  const fetchCourses = async () => {
    setFetchingCourses(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${apiBaseUrl}/trainer/assigned/courses`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) throw new Error("Failed to fetch courses");
      
      const data = await response.json();
      setCourses(data.courses || data);
    } catch (error: any) {
      toast({
        title: "Error",
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
      console.log(courseId);
      // http://localhost:5007/api/livecourses/admin/courses/6948f5038703c1d21226819f/batches
      const response = await fetch(`${apiBaseUrl}/admin/courses/${courseId}/batches`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) throw new Error("Failed to fetch batches");
      
      const data = await response.json();
      setBatches(data.batches || data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch batches for this course",
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
      setSelectedBatchId(""); // Reset batch selection
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

  const validate = (): string | null => {
    if (!sessionTitle.trim()) return "Session title is required";
    if (!selectedCourseId) return "Please select a course";
    if (!selectedBatchId) return "Please select a batch";
    if (!scheduledDate) return "Scheduled date is required";
    if (!scheduledStartTime) return "Start time is required";
    if (!scheduledEndTime) return "End time is required";
    if (!meetingLink.trim()) return "Meeting link is required";
    
    // Validate time
    if (scheduledStartTime >= scheduledEndTime) {
      return "End time must be after start time";
    }
    
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      toast({
        title: "Validation Error",
        description: error,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const token = getAuthToken();
      
      // Create FormData for file upload
      const formData = new FormData();
      
      // Required fields
      formData.append("sessionTitle", sessionTitle);
      formData.append("courseId", selectedCourseId);
      formData.append("batchId", selectedBatchId);
      
      // If trainerId is provided, use it; otherwise backend will use req.user.userId
      if (trainerId) {
        formData.append("trainerUserId", trainerId);
      }
      
      formData.append("scheduledDate", scheduledDate);
      formData.append("scheduledStartTime", scheduledStartTime);
      formData.append("scheduledEndTime", scheduledEndTime);
      formData.append("meetingLink", meetingLink);
      
      // Optional fields
      if (sessionNumber) formData.append("sessionNumber", sessionNumber);
      if (description) formData.append("description", description);
      
      // Append files
      if (files) {
        Array.from(files).forEach((file) => {
          formData.append("files", file);
        });
      }

      const response = await fetch(`${apiBaseUrl}/trainer/live-sessions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create session");
      }

      const data = await response.json();

      toast({
        title: "Session Created Successfully! 🎉",
        description: `Session scheduled for ${scheduledDate} at ${scheduledStartTime}`
      });

      // Call onCreated callback
      if (onCreated) {
        onCreated(data.session);
      }

      // Reset form
      resetForm();
      
      // Close modal
      if (onOpenChange) {
        onOpenChange(false);
      }

    } catch (error: any) {
      toast({
        title: "Error Creating Session",
        description: error.message || "Something went wrong",
        variant: "destructive"
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
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  if (!open) return null;

  return (
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
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      disabled={fetchingCourses}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  </motion.div>

                  {/* Batch Selection - Only shows after course is selected */}
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
                      onChange={(e) => setSelectedBatchId(e.target.value)}
                      disabled={!selectedCourseId || fetchingBatches}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {!selectedCourseId 
                          ? "Select a course first" 
                          : fetchingBatches 
                          ? "Loading batches..." 
                          : batches.length === 0 
                          ? "No batches available for this course"
                          : "-- Select Batch --"}
                      </option>
                      {batches.map((batch) => (
                        <option key={batch._id} value={batch._id}>
                          {batch.batchName || batch.name}
                        </option>
                      ))}
                    </select>
                    {selectedCourseId && batches.length === 0 && !fetchingBatches && (
                      <p className="text-xs text-amber-600 mt-1">
                        No batches found for the selected course
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
                        onChange={(e) => setSessionTitle(e.target.value)} 
                        placeholder="e.g., React Hooks Deep Dive"
                        className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
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
                    />
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
                        onChange={(e) => setScheduledDate(e.target.value)} 
                        className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
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
                        onChange={(e) => setScheduledStartTime(e.target.value)} 
                        className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
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
                        onChange={(e) => setScheduledEndTime(e.target.value)} 
                        className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
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
                      onChange={(e) => setMeetingLink(e.target.value)} 
                      placeholder="https://zoom.us/j/... or Google Meet link"
                      className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
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
                        Session Materials (Optional)
                      </span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                      <Input 
                        type="file" 
                        multiple
                        onChange={handleFileChange}
                        className="cursor-pointer"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.mp4,.avi"
                      />
                      {files && files.length > 0 && (
                        <p className="text-sm text-gray-600 mt-2">
                          {files.length} file(s) selected: {Array.from(files).map(f => f.name).join(", ")}
                        </p>
                      )}
                    </div>
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
                      onClick={() => onOpenChange?.(false)}
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
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create Session"
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
  );
};

export default CreateLiveSession;