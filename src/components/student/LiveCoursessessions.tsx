import React, { useState, useEffect, memo, useCallback } from 'react';
import { Calendar, Clock, FileText, Upload, CheckCircle, XCircle, AlertCircle, Video, Download, Trash2, RefreshCw, Award, Link2 } from 'lucide-react';

const API_BASE_URL = 'https://triaright.com/api/livecourses';

// Memoized Submit Modal to prevent re-renders on parent state changes
const SubmitModal = memo(({ 
  isOpen, 
  onClose, 
  selectedAssignment, 
  isResubmit, 
  onSubmit, 
  onResubmit 
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedAssignment: any;
  isResubmit: boolean;
  onSubmit: (assignmentId: string, data: { textContent: string; links: string; files: File[] }) => void;
  onResubmit: (assignmentId: string, data: { textContent: string; links: string; files: File[] }) => void;
}) => {
  const [localData, setLocalData] = useState({
    textContent: '',
    links: '',
    files: [] as File[]
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalData({ textContent: '', links: '', files: [] });
    }
  }, [isOpen]);

  const handleAddLink = useCallback(() => {
    if (localData.links && !localData.links.endsWith('\n')) {
      setLocalData(prev => ({...prev, links: prev.links + '\n'}));
    }
  }, [localData.links]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalData(prev => ({...prev, textContent: value}));
  }, []);

  const handleLinksChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalData(prev => ({...prev, links: value}));
  }, []);

  const handleFilesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalData(prev => ({...prev, files: Array.from(e.target.files || [])}));
  }, []);

  const handleSubmit = useCallback(() => {
    if (isResubmit) {
      onResubmit(selectedAssignment._id, localData);
    } else {
      onSubmit(selectedAssignment._id, localData);
    }
  }, [isResubmit, selectedAssignment, localData, onSubmit, onResubmit]);

  const handleClose = useCallback(() => {
    setLocalData({ textContent: '', links: '', files: [] });
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-4">
          {isResubmit ? 'Resubmit' : 'Submit'} Assignment
        </h2>
        <h3 className="text-lg text-gray-700 mb-4">{selectedAssignment?.title}</h3>

        <div className="space-y-4">
          {!isResubmit && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Content
                </label>
                <textarea
                  value={localData.textContent}
                  onChange={handleTextChange}
                  className="w-full border border-gray-300 rounded-lg p-3 min-h-[120px]"
                  placeholder="Enter your submission text..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Links (Press Enter to add new link)
                </label>
                <div className="relative">
                  <textarea
                    value={localData.links}
                    onChange={handleLinksChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddLink();
                      }
                    }}
                    className="w-full border border-gray-300 rounded-lg p-3 pr-10"
                    placeholder="https://example.com (Press Enter to add)"
                    rows={3}
                  />
                  <Link2 className="absolute right-3 top-3 text-gray-400" size={20} />
                </div>
                {localData.links && (
                  <p className="text-sm text-gray-600 mt-2">
                    {localData.links.split('\n').filter(l => l.trim()).length} link(s) added
                  </p>
                )}
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Files
            </label>
            <input
              type="file"
              multiple
              onChange={handleFilesChange}
              className="w-full border border-gray-300 rounded-lg p-3"
            />
            {localData.files.length > 0 && (
              <div className="mt-2 space-y-1">
                {Array.from(localData.files).map((file, idx) => (
                  <p key={idx} className="text-sm text-gray-600">
                    📎 {file.name}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            {isResubmit ? 'Resubmit' : 'Submit'}
          </button>
          <button
            onClick={handleClose}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
});

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [enrollments, setEnrollments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitModal, setSubmitModal] = useState(false);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/enrollments/my-enrollments`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setEnrollments(data.enrollments || []);
    } catch (err) {
      setError('Failed to fetch enrollments');
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/student/live-sessions`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err) {
      setError('Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingSessions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/student/live-sessions/upcoming`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setUpcomingSessions(data.sessions || []);
    } catch (err) {
      console.error('Failed to fetch upcoming sessions');
    }
  };

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/assignments/student/batch-assignments`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setAssignments(data.assignments || []);
    } catch (err) {
      setError('Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  const fetchMySubmissions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/assignments/my-submissions`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setMySubmissions(data.submissions || []);
    } catch (err) {
      console.error('Failed to fetch submissions');
    }
  };

  const handleSubmitAssignment = async (assignmentId: string, data: { textContent: string; links: string; files: File[] }) => {
    try {
      const formData = new FormData();
      formData.append('textContent', data.textContent);
      
      const linksArray = data.links.split('\n').filter(link => link.trim());
      linksArray.forEach(link => formData.append('links[]', link.trim()));
      
      data.files.forEach(file => formData.append('files', file));

      const response = await fetch(`${API_BASE_URL}/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        alert('Assignment submitted successfully!');
        setSubmitModal(false);
        fetchMySubmissions();
        fetchAssignments();
      } else {
        const res = await response.json();
        alert(res.message || 'Submission failed');
      }
    } catch (err) {
      alert('Error submitting assignment');
    }
  };

  const handleResubmit = async (assignmentId: string, data: { textContent: string; links: string; files: File[] }) => {
    try {
      const formData = new FormData();
      data.files.forEach(file => formData.append('files', file));

      const response = await fetch(`${API_BASE_URL}/assignments/${assignmentId}/resubmit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        alert('Assignment resubmitted successfully!');
        setSubmitModal(false);
        fetchMySubmissions();
      }
    } catch (err) {
      alert('Error resubmitting assignment');
    }
  };

  const handleDeleteSubmission = async (assignmentId) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/assignments/${assignmentId}/delete`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        alert('Submission deleted successfully!');
        fetchMySubmissions();
        fetchAssignments();
      }
    } catch (err) {
      alert('Error deleting submission');
    }
  };

  const isSessionJoinable = (session) => {
    const now = new Date();
    const scheduledDate = new Date(session.scheduledDate);
    const tenMinutesBefore = new Date(scheduledDate.getTime() - 10 * 60000);
    
    return session.status === 'live' || 
           (session.status === 'scheduled' && now >= tenMinutesBefore && now <= scheduledDate);
  };

  useEffect(() => {
    fetchEnrollments();
    fetchUpcomingSessions();
  }, []);

  const CourseCard = ({ enrollment }) => (
    <div 
      onClick={() => {
        setSelectedCourse(enrollment);
        setActiveTab('sessions');
        fetchSessions();
        fetchAssignments();
      }}
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
    >
      <img 
        src={enrollment.courseId?.courseImage || '/api/placeholder/400/200'} 
        alt={enrollment.courseId?.courseName}
        className="w-full h-40 object-cover rounded-lg mb-4"
      />
      <h3 className="text-xl font-bold text-gray-800 mb-2">
        {enrollment.courseId?.courseName}
      </h3>
      <div className="space-y-2 text-sm text-gray-600">
        <p><strong>Batch:</strong> {enrollment.batchId?.batchName}</p>
        {enrollment.courseId?.duration && (
          <p><strong>Duration:</strong> {
            typeof enrollment.courseId.duration === 'object' 
              ? `${enrollment.courseId.duration.value} ${enrollment.courseId.duration.unit}` 
              : enrollment.courseId.duration
          }</p>
        )}
        <p><strong>Category:</strong> {enrollment.courseId?.category}</p>
        {enrollment.batchId?.startDate && (
          <p><strong>Start Date:</strong> {new Date(enrollment.batchId.startDate).toLocaleDateString()}</p>
        )}
      </div>
    </div>
  );

  const SessionCard = ({ session }) => {
    const canJoin = isSessionJoinable(session);
    const isCompleted = session.status === 'completed';

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{session.sessionTitle}</h3>
            {session.sessionNumber && (
              <span className="text-sm text-gray-500">Session #{session.sessionNumber}</span>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            session.status === 'live' ? 'bg-red-100 text-red-800' :
            session.status === 'completed' ? 'bg-green-100 text-green-800' :
            session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {session.status.toUpperCase()}
          </span>
        </div>

        {session.description && (
          <p className="text-gray-600 mb-4">{session.description}</p>
        )}

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span>{new Date(session.scheduledDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>{session.scheduledStartTime} - {session.scheduledEndTime}</span>
          </div>
        </div>

        {canJoin && (
          <a 
            href={session.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Video size={18} />
            Join Session
          </a>
        )}

        {isCompleted && session.recordingUrl && (
          <a 
            href={session.recordingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
          >
            <Download size={18} />
            View Recording
          </a>
        )}
      </div>
    );
  };

  const AssignmentCard = ({ assignment }) => {
    const submission = mySubmissions.find(s => s.assignmentId._id === assignment._id);
    const isPastDue = assignment.isPastDue;
    const isSubmitted = !!submission;

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800">{assignment.title}</h3>
            <p className="text-gray-600 text-sm mt-2">{assignment.description}</p>
          </div>
          {isSubmitted && (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              submission.status === 'graded' ? 'bg-green-100 text-green-800' :
              submission.status === 'resubmission_required' ? 'bg-orange-100 text-orange-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {submission.status === 'graded' ? 'GRADED' :
               submission.status === 'resubmission_required' ? 'RESUBMIT REQUIRED' :
               'SUBMITTED'}
            </span>
          )}
        </div>

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span>Due: {new Date(assignment.dueDate).toLocaleString()}</span>
            {isPastDue && !isSubmitted && (
              <span className="text-red-600 font-semibold">(Overdue)</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Award size={16} />
            <span>Max Marks: {assignment.maxMarks}</span>
          </div>
        </div>

        {submission?.grade !== null && submission?.grade !== undefined && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="text-green-600" size={20} />
              <span className="font-bold text-green-800">
                Grade: {submission.grade}/{submission.maxGrade}
              </span>
            </div>
            {submission.feedback && (
              <p className="text-sm text-gray-700">
                <strong>Feedback:</strong> {submission.feedback}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-2">
          {!isSubmitted && !isPastDue && (
            <button
              onClick={() => {
                setSelectedAssignment(assignment);
                setSubmitModal(true);
              }}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Upload size={18} />
              Submit
            </button>
          )}

          {submission?.status === 'resubmission_required' && (
            <button
              onClick={() => {
                setSelectedAssignment(assignment);
                setSubmitModal(true);
              }}
              className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Resubmit
            </button>
          )}

          {isSubmitted && submission.status !== 'graded' && (
            <button
              onClick={() => handleDeleteSubmission(assignment._id)}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 size={18} />
              Delete Submission
            </button>
          )}
        </div>
      </div>
    );
  };

  const isResubmit = mySubmissions.find(s => s.assignmentId._id === selectedAssignment?._id)?.status === 'resubmission_required';

  return (
    <div className="min-h-screen bg-gray-50">
      {upcomingSessions.length > 0 && activeTab === 'courses' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 m-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="text-yellow-600" />
            <h3 className="font-bold text-yellow-800">Upcoming Sessions</h3>
          </div>
          <div className="space-y-2">
            {upcomingSessions.slice(0, 3).map(session => (
              <div key={session._id} className="text-sm text-yellow-800">
                <strong>{session.sessionTitle}</strong> - {new Date(session.scheduledDate).toLocaleString()}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-4 border-b">
            <button
              onClick={() => {
                setActiveTab('courses');
                setSelectedCourse(null);
              }}
              className={`py-4 px-6 font-semibold transition-colors ${
                activeTab === 'courses' 
                  ? 'border-b-2 border-blue-600 text-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              My Courses
            </button>
            {selectedCourse && (
              <>
                <button
                  onClick={() => setActiveTab('sessions')}
                  className={`py-4 px-6 font-semibold transition-colors ${
                    activeTab === 'sessions' 
                      ? 'border-b-2 border-blue-600 text-blue-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Live Sessions
                </button>
                <button
                  onClick={() => {
                    setActiveTab('assignments');
                    fetchMySubmissions();
                  }}
                  className={`py-4 px-6 font-semibold transition-colors ${
                    activeTab === 'assignments' 
                      ? 'border-b-2 border-blue-600 text-blue-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Assignments
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {activeTab === 'courses' && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map(enrollment => (
              <CourseCard key={enrollment._id} enrollment={enrollment} />
            ))}
            {enrollments.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                No courses enrolled yet
              </div>
            )}
          </div>
        )}

        {activeTab === 'sessions' && selectedCourse && !loading && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {selectedCourse.courseId?.courseName} - Sessions
              </h2>
              <p className="text-gray-600">Batch: {selectedCourse.batchId?.batchName}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sessions.map(session => (
                <SessionCard key={session._id} session={session} />
              ))}
              {sessions.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  No sessions scheduled yet
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'assignments' && selectedCourse && !loading && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {selectedCourse.courseId?.courseName} - Assignments
              </h2>
              <p className="text-gray-600">Batch: {selectedCourse.batchId?.batchName}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assignments.map(assignment => (
                <AssignmentCard key={assignment._id} assignment={assignment} />
              ))}
              {assignments.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  No assignments available yet
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <SubmitModal
        isOpen={submitModal}
        onClose={() => setSubmitModal(false)}
        selectedAssignment={selectedAssignment}
        isResubmit={isResubmit}
        onSubmit={handleSubmitAssignment}
        onResubmit={handleResubmit}
      />
    </div>
  );
};

export default StudentDashboard;