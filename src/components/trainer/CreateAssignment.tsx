// /* eslint-disable @typescript-eslint/no-explicit-any */
// import React, { useState } from "react";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import { useToast } from "@/components/ui/use-toast";

// interface CreateAssignmentProps {
//   onCreated: (data: any) => void;
//   onOpenChange?: (open: boolean) => void;
// }

// const CreateAssignment: React.FC<CreateAssignmentProps> = ({
//   onCreated,
//   onOpenChange,
// }) => {
//   const { toast } = useToast();

//   const [title, setTitle] = useState("");
//   const [batch, setBatch] = useState("");
//   const [description, setDescription] = useState("");
//   const [maxMarks, setMaxMarks] = useState("");
//   const [dueDate, setDueDate] = useState("");
//   const [attachment, setAttachment] = useState<File | null>(null);
//   const [submissionType, setSubmissionType] = useState("file");

//   // Validation
//   const validateForm = () => {
//     if (!title.trim()) return "Title is required";
//     if (!batch.trim()) return "Batch selection is required";
//     if (!dueDate) return "Due date is required";

//     if (!maxMarks || isNaN(Number(maxMarks))) {
//       return "Max marks must be a valid number";
//     }

//     return null;
//   };

//   const handleSubmit = () => {
//     const error = validateForm();
//     if (error) {
//       toast({
//         title: "Validation Error",
//         description: error,
//         variant: "destructive",
//       });
//       return;
//     }

//     const newAssignment = {
//       id: Date.now(),
//       title,
//       batch,
//       description,
//       status: "active",
//       dueDate,
//       maxMarks: Number(maxMarks),
//       submissionType,
//       attachments: attachment ? 1 : 0,
//       submissions: 0,
//       totalStudents: 25,
//     };

//     onCreated(newAssignment);

//     toast({
//       title: "Assignment Created!",
//       description: "Your assignment has been successfully created.",
//     });

//     onOpenChange?.(false);

//     setTitle("");
//     setBatch("");
//     setDescription("");
//     setMaxMarks("");
//     setDueDate("");
//     setAttachment(null);
//     setSubmissionType("file");
//   };

//   return (
//     <div className="space-y-4">
//       {/* Title */}
//       <div>
//         <label className="block mb-1 text-sm font-medium">Assignment Title</label>
//         <Input
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           placeholder="Enter assignment title"
//         />
//       </div>

//       {/* Batch */}
//       <div>
//         <label className="block mb-1 text-sm font-medium">Select Batch</label>
//         <select
//           value={batch}
//           onChange={(e) => setBatch(e.target.value)}
//           className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500"
//         >
//           <option value="">Select Batch</option>
//           <option value="MERN-A">MERN-A</option>
//           <option value="Python-B">Python-B</option>
//         </select>
//       </div>

//       {/* Max Marks */}
//       <div>
//         <label className="block mb-1 text-sm font-medium">Max Marks</label>
//         <Input
//           value={maxMarks}
//           onChange={(e) => setMaxMarks(e.target.value)}
//           placeholder="Enter marks (e.g., 100)"
//           type="number"
//         />
//       </div>

//       {/* Due Date */}
//       <div>
//         <label className="block mb-1 text-sm font-medium">Due Date</label>
//         <Input
//           type="datetime-local"
//           value={dueDate}
//           onChange={(e) => setDueDate(e.target.value)}
//         />
//       </div>

//       {/* Submission Type */}
//       <div>
//         <label className="block mb-1 text-sm font-medium">Submission Type</label>
//         <select
//           value={submissionType}
//           onChange={(e) => setSubmissionType(e.target.value)}
//           className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500"
//         >
//           <option value="file">File Upload</option>
//           <option value="text">Text Submission</option>
//           <option value="link">Submit Link</option>
//         </select>
//       </div>

//       {/* Description */}
//       <div>
//         <label className="block mb-1 text-sm font-medium">Description</label>
//         <Textarea
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
//           placeholder="Enter assignment description"
//           className="min-h-[100px]"
//         />
//       </div>

//       {/* Attachments */}
//       <div>
//         <label className="block mb-1 text-sm font-medium">Attachment (Optional)</label>
//         <Input
//           type="file"
//           onChange={(e) => setAttachment(e.target.files?.[0] || null)}
//         />
//       </div>

//       {/* Actions */}
//       <div className="flex justify-end gap-2 pt-4">
//         <Button variant="outline" onClick={() => onOpenChange?.(false)}>
//           Cancel
//         </Button>

//         <Button
//           className="bg-blue-600 text-white hover:bg-blue-700"
//           onClick={handleSubmit}
//         >
//           Create Assignment
//         </Button>
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