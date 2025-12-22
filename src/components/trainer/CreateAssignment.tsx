/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface CreateAssignmentProps {
  onCreated: (data: any) => void;
  onOpenChange?: (open: boolean) => void;
}

const CreateAssignment: React.FC<CreateAssignmentProps> = ({
  onCreated,
  onOpenChange,
}) => {
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [batch, setBatch] = useState("");
  const [description, setDescription] = useState("");
  const [maxMarks, setMaxMarks] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [submissionType, setSubmissionType] = useState("file");

  // Validation
  const validateForm = () => {
    if (!title.trim()) return "Title is required";
    if (!batch.trim()) return "Batch selection is required";
    if (!dueDate) return "Due date is required";

    if (!maxMarks || isNaN(Number(maxMarks))) {
      return "Max marks must be a valid number";
    }

    return null;
  };

  const handleSubmit = () => {
    const error = validateForm();
    if (error) {
      toast({
        title: "Validation Error",
        description: error,
        variant: "destructive",
      });
      return;
    }

    const newAssignment = {
      id: Date.now(),
      title,
      batch,
      description,
      status: "active",
      dueDate,
      maxMarks: Number(maxMarks),
      submissionType,
      attachments: attachment ? 1 : 0,
      submissions: 0,
      totalStudents: 25,
    };

    onCreated(newAssignment);

    toast({
      title: "Assignment Created!",
      description: "Your assignment has been successfully created.",
    });

    onOpenChange?.(false);

    setTitle("");
    setBatch("");
    setDescription("");
    setMaxMarks("");
    setDueDate("");
    setAttachment(null);
    setSubmissionType("file");
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className="block mb-1 text-sm font-medium">Assignment Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter assignment title"
        />
      </div>

      {/* Batch */}
      <div>
        <label className="block mb-1 text-sm font-medium">Select Batch</label>
        <select
          value={batch}
          onChange={(e) => setBatch(e.target.value)}
          className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Batch</option>
          <option value="MERN-A">MERN-A</option>
          <option value="Python-B">Python-B</option>
        </select>
      </div>

      {/* Max Marks */}
      <div>
        <label className="block mb-1 text-sm font-medium">Max Marks</label>
        <Input
          value={maxMarks}
          onChange={(e) => setMaxMarks(e.target.value)}
          placeholder="Enter marks (e.g., 100)"
          type="number"
        />
      </div>

      {/* Due Date */}
      <div>
        <label className="block mb-1 text-sm font-medium">Due Date</label>
        <Input
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      {/* Submission Type */}
      <div>
        <label className="block mb-1 text-sm font-medium">Submission Type</label>
        <select
          value={submissionType}
          onChange={(e) => setSubmissionType(e.target.value)}
          className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="file">File Upload</option>
          <option value="text">Text Submission</option>
          <option value="link">Submit Link</option>
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block mb-1 text-sm font-medium">Description</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter assignment description"
          className="min-h-[100px]"
        />
      </div>

      {/* Attachments */}
      <div>
        <label className="block mb-1 text-sm font-medium">Attachment (Optional)</label>
        <Input
          type="file"
          onChange={(e) => setAttachment(e.target.files?.[0] || null)}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={() => onOpenChange?.(false)}>
          Cancel
        </Button>

        <Button
          className="bg-blue-600 text-white hover:bg-blue-700"
          onClick={handleSubmit}
        >
          Create Assignment
        </Button>
      </div>
    </div>
  );
};

export default CreateAssignment;
