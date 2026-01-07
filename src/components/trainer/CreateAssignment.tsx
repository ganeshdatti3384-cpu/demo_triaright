// import React, { useState, useEffect } from "react";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import { useToast } from "@/components/ui/use-toast";
// import { Loader2, Upload, X, Calendar, BookOpen, Users, AlertCircle, CheckCircle } from "lucide-react";

// const API_BASE_URL = "http://localhost:5007/api/livecourses";
// // https://triaright.com/api/livecourses

// interface Course {
//   _id: string;
//   courseName: string;
//   courseCode?: string;
// }

// interface Batch {
//   _id: string;
//   batchName: string;
//   students?: number;
// }

// const CreateAssignment: React.FC = () => {
//   const { toast } = useToast();

//   // State Management
//   const [step, setStep] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [submitting, setSubmitting] = useState(false);

//   // Courses & Batches
//   const [courses, setCourses] = useState<Course[]>([]);
//   const [batches, setBatches] = useState<Batch[]>([]);
//   const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
//   const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

//   // Assignment Form Data
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [instructions, setInstructions] = useState("");
//   const [maxMarks, setMaxMarks] = useState("100");
//   const [dueDate, setDueDate] = useState("");
//   const [submissionType, setSubmissionType] = useState("file");
//   const [allowLateSubmission, setAllowLateSubmission] = useState(false);
//   const [status, setStatus] = useState("published");
//   const [attachments, setAttachments] = useState<File[]>([]);

//   // Form Errors
//   const [errors, setErrors] = useState<{ [key: string]: string }>({});

//   // Fetch assigned courses on mount
//   useEffect(() => {
//     fetchAssignedCourses();
//   }, []);

//   const fetchAssignedCourses = async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         toast({
//           title: "Authentication Error",
//           description: "Please login to continue",
//           variant: "destructive",
//         });
//         return;
//       }

//       const response = await fetch(`${API_BASE_URL}/trainer/assigned/courses`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!response.ok) throw new Error("Failed to fetch courses");

//       const data = await response.json();
//       setCourses(data.courses || data);

//       if ((data.courses || data).length > 0) {
//         toast({
//           title: "Courses Loaded",
//           description: `Found ${(data.courses || data).length} course(s)`,
//         });
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to load courses. Please try again.",
//         variant: "destructive",
//       });
//       console.error("Fetch courses error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchBatchesForCourse = async (courseId: string) => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       const response = await fetch(
//         `${API_BASE_URL}/admin/courses/${courseId}/batches`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (!response.ok) throw new Error("Failed to fetch batches");

//       const data = await response.json();
//       setBatches(data.batches || data);

//       if ((data.batches || data).length > 0) {
//         toast({
//           title: "Batches Loaded",
//           description: `Found ${(data.batches || data).length} batch(es)`,
//         });
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to load batches. Please try again.",
//         variant: "destructive",
//       });
//       console.error("Fetch batches error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCourseSelect = (course: Course) => {
//     setSelectedCourse(course);
//     setSelectedBatch(null);
//     setBatches([]);
//     fetchBatchesForCourse(course._id);
//     setStep(2);
    
//     toast({
//       title: "Course Selected",
//       description: `Selected: ${course.courseName}`,
//     });
//   };

//   const handleBatchSelect = (batch: Batch) => {
//     setSelectedBatch(batch);
//     setStep(3);
    
//     toast({
//       title: "Batch Selected",
//       description: `Selected: ${batch.batchName}`,
//     });
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       const files = Array.from(e.target.files);
      
//       // Validate file count
//       if (files.length + attachments.length > 5) {
//         toast({
//           title: "Too Many Files",
//           description: "Maximum 5 files allowed",
//           variant: "destructive",
//         });
//         return;
//       }

//       // Validate file size (10MB per file)
//       const maxSize = 10 * 1024 * 1024;
//       const invalidFiles = files.filter(file => file.size > maxSize);
      
//       if (invalidFiles.length > 0) {
//         toast({
//           title: "File Too Large",
//           description: `${invalidFiles[0].name} exceeds 10MB limit`,
//           variant: "destructive",
//         });
//         return;
//       }

//       setAttachments([...attachments, ...files]);
      
//       toast({
//         title: "Files Added",
//         description: `${files.length} file(s) uploaded successfully`,
//       });
//     }
//   };

//   const removeAttachment = (index: number) => {
//     const fileName = attachments[index].name;
//     setAttachments(attachments.filter((_, i) => i !== index));
    
//     toast({
//       title: "File Removed",
//       description: `${fileName} has been removed`,
//     });
//   };

//   const validateForm = () => {
//     const newErrors: { [key: string]: string } = {};

//     // Title validation
//     if (!title.trim()) {
//       newErrors.title = "Title is required";
//     } else if (title.trim().length < 5) {
//       newErrors.title = "Title must be at least 5 characters";
//     } else if (title.trim().length > 200) {
//       newErrors.title = "Title must not exceed 200 characters";
//     }

//     // Description validation
//     if (!description.trim()) {
//       newErrors.description = "Description is required";
//     } else if (description.trim().length < 10) {
//       newErrors.description = "Description must be at least 10 characters";
//     } else if (description.trim().length > 1000) {
//       newErrors.description = "Description must not exceed 1000 characters";
//     }

//     // Instructions validation (optional but if provided, must be valid)
//     if (instructions.trim() && instructions.trim().length > 2000) {
//       newErrors.instructions = "Instructions must not exceed 2000 characters";
//     }

//     // Max marks validation
//     if (!maxMarks) {
//       newErrors.maxMarks = "Max marks is required";
//     } else if (isNaN(Number(maxMarks))) {
//       newErrors.maxMarks = "Max marks must be a number";
//     } else if (Number(maxMarks) <= 0) {
//       newErrors.maxMarks = "Max marks must be greater than 0";
//     } else if (Number(maxMarks) > 1000) {
//       newErrors.maxMarks = "Max marks must not exceed 1000";
//     } else if (!Number.isInteger(Number(maxMarks))) {
//       newErrors.maxMarks = "Max marks must be a whole number";
//     }

//     // Due date validation
//     if (!dueDate) {
//       newErrors.dueDate = "Due date is required";
//     } else {
//       const selectedDate = new Date(dueDate);
//       const now = new Date();
      
//       if (selectedDate <= now) {
//         newErrors.dueDate = "Due date must be in the future";
//       }
      
//       // Check if due date is too far in future (e.g., more than 1 year)
//       const oneYearFromNow = new Date();
//       oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      
//       if (selectedDate > oneYearFromNow) {
//         newErrors.dueDate = "Due date cannot be more than 1 year in the future";
//       }
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async () => {
//     // Clear previous errors
//     setErrors({});

//     // Validate form
//     if (!validateForm()) {
//       toast({
//         title: "Validation Failed",
//         description: "Please fix the errors before submitting",
//         variant: "destructive",
//       });
//       return;
//     }

//     // Validate course and batch selection
//     if (!selectedCourse || !selectedBatch) {
//       toast({
//         title: "Selection Required",
//         description: "Please select course and batch",
//         variant: "destructive",
//       });
//       return;
//     }

//     setSubmitting(true);

//     // Show creating toast
//     toast({
//       title: "Creating Assignment...",
//       description: "Please wait while we create your assignment",
//     });

//     try {
//       const token = localStorage.getItem("token");
      
//       if (!token) {
//         throw new Error("Authentication token not found");
//       }

//       const formData = new FormData();
//       formData.append("courseId", selectedCourse._id);
//       formData.append("batchId", selectedBatch._id);
//       formData.append("title", title.trim());
//       formData.append("description", description.trim());
//       formData.append("instructions", instructions.trim());
//       formData.append("dueDate", dueDate);
//       formData.append("maxMarks", maxMarks);
//       formData.append("submissionType", submissionType);
//       formData.append("allowLateSubmission", String(allowLateSubmission));
//       formData.append("status", status);

//       attachments.forEach((file) => {
//         formData.append("attachments", file);
//       });

//       const response = await fetch(`${API_BASE_URL}/assignments`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         body: formData,
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Failed to create assignment");
//       }

//       const data = await response.json();

//       // Success toast with detailed information
//       toast({
//         title: "✅ Assignment Created Successfully!",
//         description: (
//           <div className="mt-2 space-y-1">
//             <p className="font-semibold">{title}</p>
//             <p className="text-sm">Course: {selectedCourse.courseName}</p>
//             <p className="text-sm">Batch: {selectedBatch.batchName}</p>
//             <p className="text-sm">Status: {status === "published" ? "Published" : "Draft"}</p>
//             {attachments.length > 0 && (
//               <p className="text-sm">{attachments.length} file(s) attached</p>
//             )}
//           </div>
//         ),
//         duration: 5000,
//       });

//       // Reset form after short delay to show success message
//       setTimeout(() => {
//         resetForm();
//         toast({
//           title: "Ready for Next Assignment",
//           description: "You can now create another assignment",
//         });
//       }, 2000);
      
//     } catch (error: any) {
//       toast({
//         title: "❌ Creation Failed",
//         description: error.message || "Failed to create assignment. Please try again.",
//         variant: "destructive",
//         duration: 5000,
//       });
//       console.error("Create assignment error:", error);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const resetForm = () => {
//     setStep(1);
//     setSelectedCourse(null);
//     setSelectedBatch(null);
//     setBatches([]);
//     setTitle("");
//     setDescription("");
//     setInstructions("");
//     setMaxMarks("100");
//     setDueDate("");
//     setSubmissionType("file");
//     setAllowLateSubmission(false);
//     setStatus("published");
//     setAttachments([]);
//     setErrors({});
//   };

//   const goBack = () => {
//     if (step === 3) {
//       setStep(2);
//       setErrors({});
//       toast({
//         title: "Returned to Batch Selection",
//         description: "Select a batch to continue",
//       });
//     } else if (step === 2) {
//       setStep(1);
//       setSelectedCourse(null);
//       setBatches([]);
//       toast({
//         title: "Returned to Course Selection",
//         description: "Select a course to continue",
//       });
//     }
//   };

//   const formatFileSize = (bytes: number) => {
//     if (bytes === 0) return "0 Bytes";
//     const k = 1024;
//     const sizes = ["Bytes", "KB", "MB"];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
//       <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
//           <h1 className="text-3xl font-bold mb-2">Create Assignment</h1>
//           <p className="text-blue-100">
//             Step {step} of 3:{" "}
//             {step === 1
//               ? "Select Course"
//               : step === 2
//               ? "Select Batch"
//               : "Assignment Details"}
//           </p>
//         </div>

//         {/* Progress Steps */}
//         <div className="flex items-center justify-between px-6 py-4 bg-gray-50">
//           {[1, 2, 3].map((s) => (
//             <React.Fragment key={s}>
//               <div className="flex items-center">
//                 <div
//                   className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
//                     step >= s
//                       ? "bg-blue-600 text-white"
//                       : "bg-gray-300 text-gray-600"
//                   }`}
//                 >
//                   {s}
//                 </div>
//                 <span
//                   className={`ml-2 text-sm font-medium hidden md:inline ${
//                     step >= s ? "text-blue-600" : "text-gray-500"
//                   }`}
//                 >
//                   {s === 1 ? "Course" : s === 2 ? "Batch" : "Details"}
//                 </span>
//               </div>
//               {s < 3 && (
//                 <div
//                   className={`flex-1 h-1 mx-2 rounded ${
//                     step > s ? "bg-blue-600" : "bg-gray-300"
//                   }`}
//                 />
//               )}
//             </React.Fragment>
//           ))}
//         </div>

//         <div className="p-6">
//           {/* Step 1: Select Course */}
//           {step === 1 && (
//             <div>
//               <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
//                 <BookOpen className="w-6 h-6 text-blue-600" />
//                 Select a Course
//               </h2>

//               {loading ? (
//                 <div className="flex justify-center items-center py-12">
//                   <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
//                 </div>
//               ) : courses.length === 0 ? (
//                 <div className="text-center py-12">
//                   <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
//                   <p className="text-gray-600">No courses assigned to you yet.</p>
//                 </div>
//               ) : (
//                 <div className="grid gap-4 md:grid-cols-2">
//                   {courses.map((course) => (
//                     <div
//                       key={course._id}
//                       onClick={() => handleCourseSelect(course)}
//                       className="border-2 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all hover:shadow-md"
//                     >
//                       <h3 className="font-semibold text-lg text-gray-800 mb-1">
//                         {course.courseName}
//                       </h3>
//                       {course.courseCode && (
//                         <p className="text-sm text-gray-600">{course.courseCode}</p>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Step 2: Select Batch */}
//           {step === 2 && (
//             <div>
//               <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
//                 <p className="text-sm text-gray-700">
//                   <span className="font-semibold">Selected Course:</span>{" "}
//                   {selectedCourse?.courseName}
//                 </p>
//               </div>

//               <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
//                 <Users className="w-6 h-6 text-blue-600" />
//                 Select a Batch
//               </h2>

//               {loading ? (
//                 <div className="flex justify-center items-center py-12">
//                   <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
//                 </div>
//               ) : batches.length === 0 ? (
//                 <div className="text-center py-12">
//                   <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
//                   <p className="text-gray-600">No batches found for this course.</p>
//                 </div>
//               ) : (
//                 <div className="grid gap-4 md:grid-cols-2">
//                   {batches.map((batch) => (
//                     <div
//                       key={batch._id}
//                       onClick={() => handleBatchSelect(batch)}
//                       className="border-2 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all hover:shadow-md"
//                     >
//                       <h3 className="font-semibold text-lg text-gray-800 mb-1">
//                         {batch.batchName}
//                       </h3>
//                       {batch.students !== undefined && (
//                         <p className="text-sm text-gray-600 flex items-center gap-1">
//                           <Users className="w-4 h-4" />
//                           {batch.students} students
//                         </p>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               )}

//               <div className="mt-6">
//                 <Button
//                   variant="outline"
//                   onClick={goBack}
//                   className="border-gray-300 hover:bg-gray-100"
//                 >
//                   Back to Courses
//                 </Button>
//               </div>
//             </div>
//           )}

//           {/* Step 3: Assignment Details */}
//           {step === 3 && (
//             <div className="space-y-6">
//               {/* Selected Info */}
//               <div className="grid md:grid-cols-2 gap-3">
//                 <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
//                   <p className="text-sm text-gray-600">Course</p>
//                   <p className="font-semibold text-gray-800">
//                     {selectedCourse?.courseName}
//                   </p>
//                 </div>
//                 <div className="p-3 bg-green-50 rounded-lg border border-green-200">
//                   <p className="text-sm text-gray-600">Batch</p>
//                   <p className="font-semibold text-gray-800">
//                     {selectedBatch?.batchName}
//                   </p>
//                 </div>
//               </div>

//               {/* Title */}
//               <div>
//                 <label className="block mb-1 text-sm font-medium text-gray-700">
//                   Assignment Title <span className="text-red-500">*</span>
//                 </label>
//                 <Input
//                   value={title}
//                   onChange={(e) => {
//                     setTitle(e.target.value);
//                     if (errors.title) {
//                       setErrors({ ...errors, title: "" });
//                     }
//                   }}
//                   placeholder="e.g., React Hooks Assignment"
//                   className={errors.title ? "border-red-500" : ""}
//                   maxLength={200}
//                 />
//                 {errors.title && (
//                   <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
//                     <AlertCircle className="w-3 h-3" />
//                     {errors.title}
//                   </p>
//                 )}
//                 <p className="text-xs text-gray-500 mt-1">
//                   {title.length}/200 characters
//                 </p>
//               </div>

//               {/* Description */}
//               <div>
//                 <label className="block mb-1 text-sm font-medium text-gray-700">
//                   Description <span className="text-red-500">*</span>
//                 </label>
//                 <Textarea
//                   value={description}
//                   onChange={(e) => {
//                     setDescription(e.target.value);
//                     if (errors.description) {
//                       setErrors({ ...errors, description: "" });
//                     }
//                   }}
//                   placeholder="Brief overview of the assignment"
//                   className={`min-h-[80px] ${errors.description ? "border-red-500" : ""}`}
//                   maxLength={1000}
//                 />
//                 {errors.description && (
//                   <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
//                     <AlertCircle className="w-3 h-3" />
//                     {errors.description}
//                   </p>
//                 )}
//                 <p className="text-xs text-gray-500 mt-1">
//                   {description.length}/1000 characters
//                 </p>
//               </div>

//               {/* Instructions */}
//               <div>
//                 <label className="block mb-1 text-sm font-medium text-gray-700">
//                   Instructions (Optional)
//                 </label>
//                 <Textarea
//                   value={instructions}
//                   onChange={(e) => {
//                     setInstructions(e.target.value);
//                     if (errors.instructions) {
//                       setErrors({ ...errors, instructions: "" });
//                     }
//                   }}
//                   placeholder="Detailed instructions for students"
//                   className={`min-h-[100px] ${errors.instructions ? "border-red-500" : ""}`}
//                   maxLength={2000}
//                 />
//                 {errors.instructions && (
//                   <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
//                     <AlertCircle className="w-3 h-3" />
//                     {errors.instructions}
//                   </p>
//                 )}
//                 <p className="text-xs text-gray-500 mt-1">
//                   {instructions.length}/2000 characters
//                 </p>
//               </div>

//               {/* Max Marks & Due Date */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block mb-1 text-sm font-medium text-gray-700">
//                     Max Marks <span className="text-red-500">*</span>
//                   </label>
//                   <Input
//                     type="number"
//                     value={maxMarks}
//                     onChange={(e) => {
//                       setMaxMarks(e.target.value);
//                       if (errors.maxMarks) {
//                         setErrors({ ...errors, maxMarks: "" });
//                       }
//                     }}
//                     placeholder="100"
//                     min="1"
//                     max="1000"
//                     className={errors.maxMarks ? "border-red-500" : ""}
//                   />
//                   {errors.maxMarks && (
//                     <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
//                       <AlertCircle className="w-3 h-3" />
//                       {errors.maxMarks}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block mb-1 text-sm font-medium text-gray-700 flex items-center gap-1">
//                     <Calendar className="w-4 h-4" />
//                     Due Date <span className="text-red-500">*</span>
//                   </label>
//                   <Input
//                     type="datetime-local"
//                     value={dueDate}
//                     onChange={(e) => {
//                       setDueDate(e.target.value);
//                       if (errors.dueDate) {
//                         setErrors({ ...errors, dueDate: "" });
//                       }
//                     }}
//                     className={errors.dueDate ? "border-red-500" : ""}
//                   />
//                   {errors.dueDate && (
//                     <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
//                       <AlertCircle className="w-3 h-3" />
//                       {errors.dueDate}
//                     </p>
//                   )}
//                 </div>
//               </div>

//               {/* Submission Type */}
//               <div>
//                 <label className="block mb-1 text-sm font-medium text-gray-700">
//                   Submission Type
//                 </label>
//                 <select
//                   value={submissionType}
//                   onChange={(e) => setSubmissionType(e.target.value)}
//                   className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 >
//                   <option value="file">File Upload</option>
//                   <option value="text">Text Submission</option>
//                   <option value="link">Link Submission</option>
//                   <option value="multiple">Multiple Types</option>
//                 </select>
//               </div>

//               {/* Checkboxes and Status */}
//               <div className="space-y-3">
//                 <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
//                   <input
//                     type="checkbox"
//                     checked={allowLateSubmission}
//                     onChange={(e) => setAllowLateSubmission(e.target.checked)}
//                     className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                   />
//                   <span className="text-sm text-gray-700">
//                     Allow late submissions
//                   </span>
//                 </label>

//                 <div>
//                   <label className="block mb-1 text-sm font-medium text-gray-700">
//                     Status
//                   </label>
//                   <select
//                     value={status}
//                     onChange={(e) => setStatus(e.target.value)}
//                     className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   >
//                     <option value="draft">Draft (Save without publishing)</option>
//                     <option value="published">
//                       Published (Students can see)
//                     </option>
//                   </select>
//                 </div>
//               </div>

//               {/* Attachments */}
//               <div>
//                 <label className="block mb-1 text-sm font-medium text-gray-700">
//                   Attachments (Max 5 files, 10MB each)
//                 </label>
//                 <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
//                   <input
//                     type="file"
//                     multiple
//                     onChange={handleFileChange}
//                     className="hidden"
//                     id="file-upload"
//                     disabled={attachments.length >= 5}
//                   />
//                   <label
//                     htmlFor="file-upload"
//                     className={`flex flex-col items-center justify-center cursor-pointer ${
//                       attachments.length >= 5
//                         ? "opacity-50 cursor-not-allowed"
//                         : ""
//                     }`}
//                   >
//                     <Upload className="w-8 h-8 text-gray-400 mb-2" />
//                     <span className="text-sm text-gray-600 text-center">
//                       Click to upload files
//                     </span>
//                     <span className="text-xs text-gray-500 mt-1">
//                       {attachments.length}/5 files uploaded
//                     </span>
//                   </label>

//                   {attachments.length > 0 && (
//                     <div className="mt-4 space-y-2">
//                       {attachments.map((file, index) => (
//                         <div
//                           key={index}
//                           className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-200"
//                         >
//                           <div className="flex-1 min-w-0">
//                             <p className="text-sm text-gray-700 truncate font-medium">
//                               {file.name}
//                             </p>
//                             <p className="text-xs text-gray-500">
//                               {formatFileSize(file.size)}
//                             </p>
//                           </div>
//                           <button
//                             onClick={() => removeAttachment(index)}
//                             className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
//                             type="button"
//                           >
//                             <X className="w-5 h-5" />
//                           </button>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex justify-between pt-6 border-t">
//                 <Button
//                   variant="outline"
//                   onClick={goBack}
//                   disabled={submitting}
//                   className="border-gray-300 hover:bg-gray-100"
//                 >
//                   Back to Batches
//                 </Button>

//                 <Button
//                   onClick={handleSubmit}
//                   disabled={submitting}
//                   className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
//                 >
//                   {submitting ? (
//                     <>
//                       <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                       Creating...
//                     </>
//                   ) : (
//                     "Create Assignment"
//                   )}
//                 </Button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreateAssignment;

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Upload, X, Calendar, BookOpen, Users } from "lucide-react";

const API_BASE_URL = "https://triaright.com/api/livecourses"; // Replace with your actual API base URL

interface Course {
  _id: string;
  courseName: string;
  courseCode?: string;
}

interface Batch {
  _id: string;
  batchName: string;
  students?: number;
}

const CreateAssignment: React.FC = () => {
  const { toast } = useToast();

  // State Management
  const [step, setStep] = useState(1); // 1: Select Course, 2: Select Batch, 3: Assignment Details
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Courses & Batches
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  // Assignment Form Data
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [maxMarks, setMaxMarks] = useState("100");
  const [dueDate, setDueDate] = useState("");
  const [submissionType, setSubmissionType] = useState("file");
  const [allowLateSubmission, setAllowLateSubmission] = useState(false);
  const [status, setStatus] = useState("published");
  const [attachments, setAttachments] = useState<File[]>([]);

  // Fetch assigned courses on mount
  useEffect(() => {
    fetchAssignedCourses();
  }, []);

  const fetchAssignedCourses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token"); // Adjust based on your auth storage
      const response = await fetch(`${API_BASE_URL}/trainer/assigned/courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch courses");

      const data = await response.json();
      setCourses(data.courses || data); // Adjust based on your API response structure
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load courses. Please try again.",
        variant: "destructive",
      });
      console.error("Fetch courses error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBatchesForCourse = async (courseId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/admin/courses/${courseId}/batches`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch batches");

      const data = await response.json();
      setBatches(data.batches || data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load batches. Please try again.",
        variant: "destructive",
      });
      console.error("Fetch batches error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setSelectedBatch(null);
    setBatches([]);
    fetchBatchesForCourse(course._id);
    setStep(2);
  };

  const handleBatchSelect = (batch: Batch) => {
    setSelectedBatch(batch);
    setStep(3);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length + attachments.length > 5) {
        toast({
          title: "Too many files",
          description: "Maximum 5 files allowed",
          variant: "destructive",
        });
        return;
      }
      setAttachments([...attachments, ...files]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!title.trim()) return "Title is required";
    if (!description.trim()) return "Description is required";
    if (!dueDate) return "Due date is required";
    if (!maxMarks || isNaN(Number(maxMarks)) || Number(maxMarks) <= 0) {
      return "Max marks must be a valid positive number";
    }
    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      toast({
        title: "Validation Error",
        description: error,
        variant: "destructive",
      });
      return;
    }

    if (!selectedCourse || !selectedBatch) {
      toast({
        title: "Error",
        description: "Please select course and batch",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("courseId", selectedCourse._id);
      formData.append("batchId", selectedBatch._id);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("instructions", instructions);
      formData.append("dueDate", dueDate);
      formData.append("maxMarks", maxMarks);
      formData.append("submissionType", submissionType);
      formData.append("allowLateSubmission", String(allowLateSubmission));
      formData.append("status", status);

      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      const response = await fetch(`${API_BASE_URL}/assignments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create assignment");
      }

      const data = await response.json();

      toast({
        title: "Success!",
        description: "Assignment created successfully",
      });

      // Reset form
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create assignment",
        variant: "destructive",
      });
      console.error("Create assignment error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedCourse(null);
    setSelectedBatch(null);
    setBatches([]);
    setTitle("");
    setDescription("");
    setInstructions("");
    setMaxMarks("100");
    setDueDate("");
    setSubmissionType("file");
    setAllowLateSubmission(false);
    setStatus("published");
    setAttachments([]);
  };

  const goBack = () => {
    if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setStep(1);
      setSelectedCourse(null);
      setBatches([]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create Assignment</h2>
          <p className="text-sm text-gray-500 mt-1">
            Step {step} of 3: {step === 1 ? "Select Course" : step === 2 ? "Select Batch" : "Assignment Details"}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  s <= step ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    s < step ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Course */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Select a Course
            </h3>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No courses assigned to you yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course) => (
                  <div
                    key={course._id}
                    onClick={() => handleCourseSelect(course)}
                    className="border rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all"
                  >
                    <h4 className="font-semibold text-gray-900">{course.courseName}</h4>
                    {course.courseCode && (
                      <p className="text-sm text-gray-500 mt-1">{course.courseCode}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Select Batch */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Selected Course:</strong> {selectedCourse?.courseName}
              </p>
            </div>

            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Select a Batch
            </h3>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : batches.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No batches found for this course.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {batches.map((batch) => (
                  <div
                    key={batch._id}
                    onClick={() => handleBatchSelect(batch)}
                    className="border rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all"
                  >
                    <h4 className="font-semibold text-gray-900">{batch.batchName}</h4>
                    {batch.students && (
                      <p className="text-sm text-gray-500 mt-1">
                        {batch.students} students
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-start pt-4">
              <Button variant="outline" onClick={goBack}>
                Back to Courses
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Assignment Details */}
        {step === 3 && (
          <div className="space-y-4">
            {/* Selected Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 space-y-1">
              <p className="text-sm text-blue-800">
                <strong>Course:</strong> {selectedCourse?.courseName}
              </p>
              <p className="text-sm text-blue-800">
                <strong>Batch:</strong> {selectedBatch?.batchName}
              </p>
            </div>

            {/* Title */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Assignment Title *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., React Hooks Assignment"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Description *
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief overview of the assignment"
                className="min-h-[80px]"
              />
            </div>

            {/* Instructions */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Instructions (Optional)
              </label>
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Detailed instructions for students"
                className="min-h-[100px]"
              />
            </div>

            {/* Max Marks & Due Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Max Marks *
                </label>
                <Input
                  type="number"
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(e.target.value)}
                  placeholder="100"
                  min="1"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Due Date *
                </label>
                <Input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            {/* Submission Type */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Submission Type
              </label>
              <select
                value={submissionType}
                onChange={(e) => setSubmissionType(e.target.value)}
                className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="file">File Upload</option>
                <option value="text">Text Submission</option>
                <option value="link">Link Submission</option>
                <option value="multiple">Multiple Types</option>
              </select>
            </div>

            {/* Checkboxes */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowLateSubmission}
                  onChange={(e) => setAllowLateSubmission(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Allow late submissions</span>
              </label>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft (Save without publishing)</option>
                  <option value="published">Published (Students can see)</option>
                </select>
              </div>
            </div>

            {/* Attachments */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Attachments (Max 5 files)
              </label>
              <div className="border-2 border-dashed rounded-lg p-4">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  disabled={attachments.length >= 5}
                />
                <label
                  htmlFor="file-upload"
                  className={`flex flex-col items-center justify-center cursor-pointer ${
                    attachments.length >= 5 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    Click to upload files
                  </span>
                </label>

                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded"
                      >
                        <span className="text-sm text-gray-700 truncate">
                          {file.name}
                        </span>
                        <button
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button variant="outline" onClick={goBack} disabled={submitting}>
                Back to Batches
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Assignment"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateAssignment;