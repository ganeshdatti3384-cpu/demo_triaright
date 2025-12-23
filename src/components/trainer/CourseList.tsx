import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  Star, 
  Calendar,
  BookOpen,
  Video,
  FileText,
  Award,
  DollarSign,
  Globe,
  Filter,
  Search,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Download,
  Share2,
  BarChart3,
  Lock,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
// import CreateCourse from "./CreateCourse";

interface Course {
  id: number;
  name: string;
  instructor: string;
  description: string;
  demoVideoLink: string;
  stream: string;
  provider: string;
  language: string;
  isPaid: boolean;
  hasCertification: boolean;
  hasFinalExam: boolean;
  courseImage?: string;
  curriculumDocName?: string;
  topics: any[];
  createdAt: string;
  students: number;
  rating: number;
  status: "draft" | "published" | "archived";
}

interface CoursesListProps {
  courses: Course[];
  onCourseUpdated: (course: Course) => void;
  onCourseDeleted: (id: number) => void;
  onCourseCreated: (course: Course) => void;
}

const CoursesList: React.FC<CoursesListProps> = ({
  courses,
  onCourseUpdated,
  onCourseDeleted,
  onCourseCreated,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStream, setFilterStream] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);
  const [showActionsMenu, setShowActionsMenu] = useState<number | null>(null);

  const streams = ["all", "IT", "Business", "Design", "Marketing", "Science", "Healthcare", "Engineering", "Arts"];
  const statuses = ["all", "draft", "published", "archived"];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStream = filterStream === "all" || course.stream === filterStream;
    const matchesStatus = filterStatus === "all" || course.status === filterStatus;
    
    return matchesSearch && matchesStream && matchesStatus;
  });

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setShowCreateModal(true);
    setShowActionsMenu(null);
  };

  const handleSaveEdit = (updatedCourse: Course) => {
    onCourseUpdated(updatedCourse);
    setEditingCourse(null);
    setShowCreateModal(false);
  };

  const handleDelete = (id: number) => {
    onCourseDeleted(id);
    setDeleteConfirm(null);
    setShowActionsMenu(null);
  };

  const handleCancelEdit = () => {
    setEditingCourse(null);
    setShowCreateModal(false);
  };

  const handleCreateNew = (course: Course) => {
    onCourseCreated(course);
    setShowCreateModal(false);
  };

  const toggleCourseExpansion = (courseId: number) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
    } else {
      setExpandedCourse(courseId);
    }
  };

  const toggleActionsMenu = (courseId: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (showActionsMenu === courseId) {
      setShowActionsMenu(null);
    } else {
      setShowActionsMenu(courseId);
    }
  };

  const closeActionsMenu = () => {
    setShowActionsMenu(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200"><CheckCircle className="h-3 w-3 mr-1" /> Published</Badge>;
      case "draft":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200"><Clock className="h-3 w-3 mr-1" /> Draft</Badge>;
      case "archived":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200"><AlertCircle className="h-3 w-3 mr-1" /> Archived</Badge>;
      default:
        return null;
    }
  };

  const getStreamColor = (stream: string) => {
    const colors: Record<string, string> = {
      "IT": "from-blue-500 to-cyan-400",
      "Business": "from-green-500 to-emerald-400",
      "Design": "from-purple-500 to-pink-400",
      "Marketing": "from-orange-500 to-red-400",
      "Science": "from-indigo-500 to-blue-400",
      "Healthcare": "from-rose-500 to-pink-400",
      "Engineering": "from-gray-500 to-gray-400",
      "Arts": "from-yellow-500 to-amber-400",
    };
    return colors[stream] || "from-gray-500 to-gray-400";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Courses Management</h2>
          {/* <p className="text-gray-600">Create, edit, and manage your training courses</p> */}
        </div>
        {/* <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Create New Course
        </Button> */}
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStream}
              onChange={(e) => setFilterStream(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {streams.map(stream => (
                <option key={stream} value={stream}>
                  {stream === "all" ? "All Streams" : stream}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === "all" ? "All Status" : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => {
              setShowCreateModal(false);
              setEditingCourse(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white z-10 border-b px-6 py-4 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingCourse ? "Edit Course" : "Create New Course"}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingCourse(null);
                  }}
                  className="hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-6">
                {/* <CreateCourse
                  onCourseCreated={editingCourse ? handleSaveEdit : handleCreateNew}
                  onCancel={() => {
                    setShowCreateModal(false);
                    setEditingCourse(null);
                  }}
                  initialData={editingCourse}
                /> */}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Delete Course</h3>
                <p className="text-gray-600">
                  Are you sure you want to delete this course? This action cannot be undone.
                </p>
                <div className="flex justify-center gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(deleteConfirm)}
                    className="flex-1"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Courses Grid */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                {/* Course Image/Header */}
                <div className={`h-40 relative bg-gradient-to-br ${getStreamColor(course.stream)}`}>
                  {course.courseImage ? (
                    <img
                      src={course.courseImage}
                      alt={course.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-white/80" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(course.status)}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                    <Badge className="bg-white/90 backdrop-blur-sm text-gray-800">
                      {course.stream}
                    </Badge>
                    {course.isPaid && (
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                        <DollarSign className="h-3 w-3 mr-1" />
                        Paid
                      </Badge>
                    )}
                  </div>
                </div>

                <CardContent className="p-5">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{course.name}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {course.instructor}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{course.rating}</span>
                      </div>
                    </div>

                    <p className="text-gray-700 text-sm line-clamp-2">{course.description}</p>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <Badge variant="outline" className="gap-1">
                        <Globe className="h-3 w-3" />
                        {course.language}
                      </Badge>
                      {course.hasCertification && (
                        <Badge variant="outline" className="gap-1">
                          <Award className="h-3 w-3" />
                          Certificate
                        </Badge>
                      )}
                      {course.hasFinalExam && (
                        <Badge variant="outline" className="gap-1">
                          <FileText className="h-3 w-3" />
                          Final Exam
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{course.students}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCourseExpansion(course.id)}
                        >
                          {expandedCourse === course.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                        
                        {/* Actions Menu */}
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => toggleActionsMenu(course.id, e)}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                          
                          <AnimatePresence>
                            {showActionsMenu === course.id && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border p-2 z-20"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => {
                                    handleEdit(course);
                                    closeActionsMenu();
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded transition-colors"
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit Course
                                </button>
                                <button
                                  onClick={() => {
                                    window.open(course.demoVideoLink, '_blank');
                                    closeActionsMenu();
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded transition-colors"
                                >
                                  <PlayCircle className="h-4 w-4" />
                                  View Demo
                                </button>
                                {course.curriculumDocName && (
                                  <button
                                    onClick={() => {
                                      // In a real app, this would download the file
                                      closeActionsMenu();
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded transition-colors"
                                  >
                                    <Download className="h-4 w-4" />
                                    Download Curriculum
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setDeleteConfirm(course.id);
                                    closeActionsMenu();
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete Course
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedCourse === course.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="pt-4 mt-4 border-t"
                      >
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Course Details</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-gray-600">Provider:</div>
                              <div className="font-medium">{course.provider}</div>
                              <div className="text-gray-600">Topics:</div>
                              <div className="font-medium">{course.topics.length}</div>
                              <div className="text-gray-600">Created:</div>
                              <div className="font-medium">
                                {new Date(course.createdAt).toLocaleDateString()}
                              </div>
                              <div className="text-gray-600">Status:</div>
                              <div>{getStatusBadge(course.status)}</div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Topics</h4>
                            <div className="space-y-2">
                              {course.topics.slice(0, 3).map((topic, idx) => (
                                <div key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  <span>{topic.name || `Topic ${idx + 1}`}</span>
                                  {topic.subTopics && topic.subTopics.length > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      {topic.subTopics.length} sub
                                    </Badge>
                                  )}
                                </div>
                              ))}
                              {course.topics.length > 3 && (
                                <div className="text-sm text-blue-600">
                                  +{course.topics.length - 3} more topics
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button size="sm" variant="outline" className="gap-2">
                              <Eye className="h-4 w-4" />
                              Preview
                            </Button>
                            <Button size="sm" variant="outline" className="gap-2">
                              <BarChart3 className="h-4 w-4" />
                              Analytics
                            </Button>
                            <Button size="sm" variant="outline" className="gap-2">
                              <Share2 className="h-4 w-4" />
                              Share
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty State */}
      <AnimatePresence>
        {filteredCourses.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
              <BookOpen className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchQuery || filterStream !== "all" || filterStatus !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by creating your first course"}
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Create Your First Course
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoursesList;