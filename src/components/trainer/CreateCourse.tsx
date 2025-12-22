import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Trash2,
  Upload,
  Video,
  FileText,
  BookOpen,
  Globe,
  Users,
  DollarSign,
  Award,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  Link,
  FileSpreadsheet,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Topic {
  id: number;
  name: string;
  examFile: File | null;
  examFileName: string;
  subTopics: Subtopic[];
}

interface Subtopic {
  id: number;
  name: string;
  contentLink: string;
}

interface CreateCourseProps {
  onCourseCreated: (course: any) => void;
  onCancel?: () => void;
  initialData?: any;
}

const CreateCourse: React.FC<CreateCourseProps> = ({ 
  onCourseCreated, 
  onCancel,
  initialData 
}) => {
  // Initialize state with initialData if editing
  const [courseName, setCourseName] = useState(initialData?.name || "");
  const [instructorName, setInstructorName] = useState(initialData?.instructor || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [demoVideoLink, setDemoVideoLink] = useState(initialData?.demoVideoLink || "");
  const [stream, setStream] = useState(initialData?.stream || "IT");
  const [provider, setProvider] = useState(initialData?.provider || "Triaright");
  const [language, setLanguage] = useState(initialData?.language || "English");
  const [isPaid, setIsPaid] = useState(initialData?.isPaid || false);
  const [hasCertification, setHasCertification] = useState(initialData?.hasCertification || false);
  const [hasFinalExam, setHasFinalExam] = useState(initialData?.hasFinalExam || false);
  const [courseImage, setCourseImage] = useState<File | null>(null);
  const [courseImagePreview, setCourseImagePreview] = useState(initialData?.courseImage || "");
  const [curriculumDoc, setCurriculumDoc] = useState<File | null>(null);
  const [curriculumDocName, setCurriculumDocName] = useState(initialData?.curriculumDocName || "");
  const [additionalInfo, setAdditionalInfo] = useState(initialData?.additionalInfo || "");
  
  // Initialize topics with initialData if editing
  const [topics, setTopics] = useState<Topic[]>(
    initialData?.topics?.length > 0 
      ? initialData.topics.map((topic: any, index: number) => ({
          id: index + 1,
          name: topic.name || "",
          examFile: null,
          examFileName: topic.examFileName || "",
          subTopics: topic.subTopics?.map((sub: any, subIndex: number) => ({
            id: subIndex + 1,
            name: sub.name || "",
            contentLink: sub.contentLink || ""
          })) || []
        }))
      : [{ id: 1, name: "", examFile: null, examFileName: "", subTopics: [] }]
  );
  
  const [expandedTopics, setExpandedTopics] = useState<number[]>(
    initialData?.topics?.map((_: any, index: number) => index + 1) || [1]
  );

  const streams = ["IT", "Business", "Design", "Marketing", "Science", "Healthcare", "Engineering", "Arts"];
  const providers = ["Triaright", "Yakken", "External", "Partner"];
  const languages = ["English", "Hindi", "Spanish", "French", "German", "Japanese", "Chinese"];

  useEffect(() => {
    if (initialData) {
      // If editing, prefill all fields
      setCourseName(initialData.name || "");
      setInstructorName(initialData.instructor || "");
      setDescription(initialData.description || "");
      setDemoVideoLink(initialData.demoVideoLink || "");
      setStream(initialData.stream || "IT");
      setProvider(initialData.provider || "Triaright");
      setLanguage(initialData.language || "English");
      setIsPaid(initialData.isPaid || false);
      setHasCertification(initialData.hasCertification || false);
      setHasFinalExam(initialData.hasFinalExam || false);
      setCourseImagePreview(initialData.courseImage || "");
      setCurriculumDocName(initialData.curriculumDocName || "");
      setAdditionalInfo(initialData.additionalInfo || "");
      
      if (initialData.topics && initialData.topics.length > 0) {
        setTopics(initialData.topics.map((topic: any, index: number) => ({
          id: index + 1,
          name: topic.name || "",
          examFile: null,
          examFileName: topic.examFileName || "",
          subTopics: topic.subTopics?.map((sub: any, subIndex: number) => ({
            id: subIndex + 1,
            name: sub.name || "",
            contentLink: sub.contentLink || ""
          })) || []
        })));
        setExpandedTopics(initialData.topics.map((_: any, index: number) => index + 1));
      }
    }
  }, [initialData]);

  const handleAddTopic = () => {
    const newId = topics.length > 0 ? Math.max(...topics.map(t => t.id)) + 1 : 1;
    setTopics([...topics, { id: newId, name: "", examFile: null, examFileName: "", subTopics: [] }]);
    setExpandedTopics([...expandedTopics, newId]);
  };

  const handleRemoveTopic = (id: number) => {
    if (topics.length > 1) {
      setTopics(topics.filter(topic => topic.id !== id));
      setExpandedTopics(expandedTopics.filter(topicId => topicId !== id));
    }
  };

  const handleAddSubtopic = (topicId: number) => {
    setTopics(topics.map(topic => {
      if (topic.id === topicId) {
        const newSubId = topic.subTopics.length > 0 
          ? Math.max(...topic.subTopics.map(st => st.id)) + 1 
          : 1;
        return {
          ...topic,
          subTopics: [
            ...topic.subTopics,
            { id: newSubId, name: "", contentLink: "" }
          ]
        };
      }
      return topic;
    }));
  };

  const handleRemoveSubtopic = (topicId: number, subtopicId: number) => {
    setTopics(topics.map(topic => {
      if (topic.id === topicId) {
        return {
          ...topic,
          subTopics: topic.subTopics.filter(st => st.id !== subtopicId)
        };
      }
      return topic;
    }));
  };

  const handleTopicChange = (id: number, field: string, value: string | File) => {
    setTopics(topics.map(topic => {
      if (topic.id === id) {
        if (field === 'examFile') {
          return {
            ...topic,
            examFile: value as File,
            examFileName: value instanceof File ? value.name : ""
          };
        }
        return { ...topic, [field]: value };
      }
      return topic;
    }));
  };

  const handleSubtopicChange = (topicId: number, subtopicId: number, field: string, value: string) => {
    setTopics(topics.map(topic => {
      if (topic.id === topicId) {
        return {
          ...topic,
          subTopics: topic.subTopics.map(st => {
            if (st.id === subtopicId) {
              return { ...st, [field]: value };
            }
            return st;
          })
        };
      }
      return topic;
    }));
  };

  const toggleTopicExpansion = (topicId: number) => {
    if (expandedTopics.includes(topicId)) {
      setExpandedTopics(expandedTopics.filter(id => id !== topicId));
    } else {
      setExpandedTopics([...expandedTopics, topicId]);
    }
  };

  const handleCourseImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCourseImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCourseImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCurriculumDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCurriculumDoc(file);
      setCurriculumDocName(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newCourse = {
      id: initialData?.id || Date.now(),
      name: courseName,
      instructor: instructorName,
      description,
      demoVideoLink,
      stream,
      provider,
      language,
      isPaid,
      hasCertification,
      hasFinalExam,
      courseImage: courseImagePreview || initialData?.courseImage,
      curriculumDocName,
      additionalInfo,
      topics: topics.map(topic => ({
        name: topic.name,
        examFileName: topic.examFileName,
        subTopics: topic.subTopics.map(sub => ({
          name: sub.name,
          contentLink: sub.contentLink
        }))
      })),
      createdAt: initialData?.createdAt || new Date().toISOString(),
      students: initialData?.students || 0,
      rating: initialData?.rating || 0,
      status: initialData?.status || "draft"
    };

    onCourseCreated(newCourse);
    
    // Only reset if not editing
    if (!initialData) {
      // Reset form
      setCourseName("");
      setInstructorName("");
      setDescription("");
      setDemoVideoLink("");
      setStream("IT");
      setProvider("Triaright");
      setLanguage("English");
      setIsPaid(false);
      setHasCertification(false);
      setHasFinalExam(false);
      setCourseImage(null);
      setCourseImagePreview("");
      setCurriculumDoc(null);
      setCurriculumDocName("");
      setAdditionalInfo("");
      setTopics([{ id: 1, name: "", examFile: null, examFileName: "", subTopics: [] }]);
      setExpandedTopics([1]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-2xl border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {initialData ? "Edit Course" : "Create New Course"}
            </CardTitle>
            {onCancel && (
              <Button variant="ghost" size="sm" onClick={onCancel} className="text-white hover:bg-white/20">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                <BookOpen className="h-4 w-4" />
                Course Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="courseName" className="flex items-center gap-2">
                    <span>Course Name *</span>
                  </Label>
                  <Input
                    id="courseName"
                    placeholder="Enter course name"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    required
                    className="focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instructorName" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Instructor Name *</span>
                  </Label>
                  <Input
                    id="instructorName"
                    placeholder="Enter instructor name"
                    value={instructorName}
                    onChange={(e) => setInstructorName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Course Description *</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter course description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="demoVideoLink" className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  <span>Demo Video Link *</span>
                </Label>
                <Input
                  id="demoVideoLink"
                  type="url"
                  placeholder="Enter demo video URL (YouTube, Vimeo, etc.)"
                  value={demoVideoLink}
                  onChange={(e) => setDemoVideoLink(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stream" className="flex items-center gap-2">
                    <span>Stream *</span>
                  </Label>
                  <select
                    id="stream"
                    value={stream}
                    onChange={(e) => setStream(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {streams.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="provider" className="flex items-center gap-2">
                    <span>Provider *</span>
                  </Label>
                  <select
                    id="provider"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {providers.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>Language *</span>
                  </Label>
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {languages.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>

            <Separator />

            {/* Course Settings */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                <span>Course Settings</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 rounded-lg border bg-gray-50">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <Label htmlFor="paid" className="font-medium">Paid Course</Label>
                      <p className="text-sm text-gray-500">Charge students for this course</p>
                    </div>
                  </div>
                  <Switch
                    id="paid"
                    checked={isPaid}
                    onCheckedChange={setIsPaid}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-amber-600" />
                    <div>
                      <Label htmlFor="certification" className="font-medium">Certification Provided</Label>
                      <p className="text-sm text-gray-500">Issue certificate on completion</p>
                    </div>
                  </div>
                  <Switch
                    id="certification"
                    checked={hasCertification}
                    onCheckedChange={setHasCertification}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border bg-gray-50">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <Label htmlFor="finalExam" className="font-medium">Has Final Exam</Label>
                    <p className="text-sm text-gray-500">Include final assessment</p>
                  </div>
                </div>
                <Switch
                  id="finalExam"
                  checked={hasFinalExam}
                  onCheckedChange={setHasFinalExam}
                />
              </div>
            </motion.div>

            <Separator />

            {/* File Uploads */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                <Upload className="h-4 w-4" />
                File Uploads
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <span>Course Image *</span>
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                    {courseImagePreview ? (
                      <div className="space-y-2">
                        <div className="w-32 h-32 mx-auto rounded-lg overflow-hidden">
                          <img 
                            src={courseImagePreview} 
                            alt="Course preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-sm text-green-600">✓ Image uploaded</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <input
                          type="file"
                          id="courseImage"
                          accept="image/*"
                          onChange={handleCourseImageChange}
                          className="hidden"
                        />
                        <label htmlFor="courseImage" className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-800 font-medium">
                            Click to upload
                          </span>
                          <p className="text-sm text-gray-500">or drag and drop</p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 5MB</p>
                        </label>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <span>Curriculum Document</span>
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                    <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <input
                      type="file"
                      id="curriculumDoc"
                      accept=".pdf,.doc,.docx"
                      onChange={handleCurriculumDocChange}
                      className="hidden"
                    />
                    <label htmlFor="curriculumDoc" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-800 font-medium">
                        {curriculumDocName ? "Change file" : "Click to upload"}
                      </span>
                      <p className="text-sm text-gray-500">or drag and drop</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX up to 10MB</p>
                    </label>
                    {curriculumDocName && (
                      <p className="text-sm text-green-600 mt-2">✓ {curriculumDocName}</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            <Separator />

            {/* Curriculum */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                  <BookOpen className="h-4 w-4" />
                  Curriculum *
                </h3>
                <Button type="button" onClick={handleAddTopic} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Topic
                </Button>
              </div>

              <AnimatePresence>
                {topics.map((topic, index) => (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border rounded-lg overflow-hidden"
                  >
                    <div className="flex items-center justify-between p-4 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleTopicExpansion(topic.id)}
                        >
                          {expandedTopics.includes(topic.id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                        <span className="font-medium">Topic {index + 1}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {topics.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTopic(topic.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedTopics.includes(topic.id) && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="p-4 space-y-4"
                        >
                          <div className="space-y-2">
                            <Label>Topic Name *</Label>
                            <Input
                              value={topic.name}
                              onChange={(e) => handleTopicChange(topic.id, 'name', e.target.value)}
                              placeholder={`Enter topic ${index + 1} name`}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <FileSpreadsheet className="h-4 w-4" />
                              <span>Topic Exam Excel (10 questions) *</span>
                            </Label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                              <input
                                type="file"
                                id={`exam-${topic.id}`}
                                accept=".xlsx,.xls"
                                onChange={(e) => handleTopicChange(topic.id, 'examFile', e.target.files?.[0] || null)}
                                className="hidden"
                              />
                              <label htmlFor={`exam-${topic.id}`} className="cursor-pointer block">
                                <FileSpreadsheet className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                <span className="text-blue-600 hover:text-blue-800 font-medium">
                                  {topic.examFileName ? "Change Excel file" : "Click to upload Excel file"}
                                </span>
                                <p className="text-sm text-gray-500 mt-1">
                                  Excel format: Question | Option1 | Option2 | Option3 | Option4 | CorrectAnswer | Type | Description
                                </p>
                              </label>
                              {topic.examFileName && (
                                <p className="text-sm text-green-600 mt-2">✓ {topic.examFileName}</p>
                              )}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <Label className="font-medium">Subtopics</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddSubtopic(topic.id)}
                                className="gap-2"
                              >
                                <Plus className="h-3 w-3" />
                                Add Subtopic
                              </Button>
                            </div>

                            <AnimatePresence>
                              {topic.subTopics.map((subtopic, subIndex) => (
                                <motion.div
                                  key={subtopic.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 20 }}
                                  transition={{ duration: 0.2 }}
                                  className="border rounded-lg p-4 space-y-3"
                                >
                                  <div className="flex justify-between items-center">
                                    <Label className="font-medium">Subtopic {subIndex + 1}</Label>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveSubtopic(topic.id, subtopic.id)}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Subtopic Name *</Label>
                                    <Input
                                      value={subtopic.name}
                                      onChange={(e) => handleSubtopicChange(topic.id, subtopic.id, 'name', e.target.value)}
                                      placeholder="Enter subtopic name"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                      <Video className="h-4 w-4" />
                                      <span>Video/Content Link *</span>
                                    </Label>
                                    <Input
                                      value={subtopic.contentLink}
                                      onChange={(e) => handleSubtopicChange(topic.id, subtopic.id, 'contentLink', e.target.value)}
                                      placeholder="Enter video or content URL"
                                      type="url"
                                    />
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            <Separator />

            {/* Additional Information */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-800">Additional Information</h3>
              <Textarea
                placeholder="Any additional notes or requirements..."
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                rows={3}
              />
            </motion.div>

            {/* Form Actions */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex justify-end gap-3 pt-4 border-t"
            >
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                {initialData ? "Update Course" : "Create Course"}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CreateCourse;