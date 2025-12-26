import React, { useState, useEffect } from 'react';
import { Calendar, Clock, FileText, Upload, CheckCircle, XCircle, AlertCircle, Video, Download, Trash2, RefreshCw, Award, Link2, CreditCard, Tag, X, Check, Users, BookOpen } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5007/api/livecourses';

const LiveCourseEnrollment = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [allCourses, setAllCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [pricing, setPricing] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Student Dashboard States
  const [dashboardTab, setDashboardTab] = useState('courses');
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [allSessions, setAllSessions] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [allAssignments, setAllAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [submitModal, setSubmitModal] = useState(false);
  const [submissionData, setSubmissionData] = useState({
    textContent: '',
    links: '',
    files: []
  });

  // Detail View States
  const [sessionDetail, setSessionDetail] = useState(null);
  const [assignmentDetail, setAssignmentDetail] = useState(null);
  const [assignmentSubmission, setAssignmentSubmission] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    fetchAllCourses();
    fetchMyCourses();
  }, []);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  const fetchAllCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/live-courses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setAllCourses(data.courses || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setLoading(false);
    }
  };

  const fetchMyCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/enrollments/my-enrollments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setMyCourses(data.enrollments || []);
    } catch (error) {
      console.error('Error fetching my courses:', error);
    }
  };

  const fetchSessions = async (batchId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/student/live-sessions`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      // Store all sessions
      setAllSessions(data.sessions || []);
      
      // Filter sessions by selected batch if batchId is provided
      if (batchId) {
        const filteredSessions = (data.sessions || []).filter(
          session => session.batchId === batchId || session.batchId?._id === batchId
        );
        setSessions(filteredSessions);
      } else {
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error('Failed to fetch sessions');
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

  const fetchAssignments = async (batchId, courseId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/assignments/student/batch-assignments`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      // Store all assignments
      setAllAssignments(data.assignments || []);
      
      if (batchId && courseId) {
        const filteredAssignments = (data.assignments || []).filter(assignment => {
          const assignmentBatchId = assignment.batchId?._id || assignment.batchId;
          const assignmentCourseId = assignment.courseId?._id || assignment.courseId;
          return assignmentBatchId === batchId && assignmentCourseId === courseId;
        });
        setAssignments(filteredAssignments);
      } else {
        setAssignments(data.assignments || []);
      }
    } catch (err) {
      console.error('Failed to fetch assignments');
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

  const fetchSessionDetail = async (sessionId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/student/live-sessions/${sessionId}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setSessionDetail(data.session);
      setDashboardTab('sessionDetail');
    } catch (err) {
      console.error('Failed to fetch session details');
      alert('Error loading session details');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignmentDetail = async (assignmentId) => {
    setLoading(true);
    try {
      const [assignmentRes, submissionRes] = await Promise.all([
        fetch(`${API_BASE_URL}/assignments/student/${assignmentId}`, {
          headers: getAuthHeaders()
        }),
        fetch(`${API_BASE_URL}/assignments/${assignmentId}/my-submission`, {
          headers: getAuthHeaders()
        })
      ]);

      const assignmentData = await assignmentRes.json();
      const submissionData = await submissionRes.json();

      setAssignmentDetail(assignmentData.assignment);
      setAssignmentSubmission(submissionData.submission || null);
      setDashboardTab('assignmentDetail');
    } catch (err) {
      console.error('Failed to fetch assignment details');
      alert('Error loading assignment details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAssignment = async (assignmentId) => {
    try {
      const formData = new FormData();
      formData.append('textContent', submissionData.textContent);
      
      const linksArray = submissionData.links.split('\n').filter(link => link.trim());
      linksArray.forEach(link => formData.append('links[]', link.trim()));
      
      submissionData.files.forEach(file => formData.append('files', file));

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
        setSubmissionData({ textContent: '', links: '', files: [] });
        fetchMySubmissions();
        fetchAssignments();
      } else {
        const data = await response.json();
        alert(data.message || 'Submission failed');
      }
    } catch (err) {
      alert('Error submitting assignment');
    }
  };

  const handleResubmit = async (assignmentId) => {
    try {
      const formData = new FormData();
      submissionData.files.forEach(file => formData.append('files', file));

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
        setSubmissionData({ textContent: '', links: '', files: [] });
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

  const isEnrolled = (courseId) => {
    return myCourses.some(enrollment => enrollment.courseId?._id === courseId);
  };

  const handleEnrollClick = (course) => {
    setSelectedCourse(course);
    setShowPaymentModal(true);
    setCouponCode('');
    setCouponApplied(false);
    setCouponError('');
    setPricing({
      originalPrice: course.price,
      discountAmount: 0,
      priceAfterDiscount: course.price,
      gst: (course.price * 18) / 100,
      totalAmount: course.price + (course.price * 18) / 100
    });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setProcessing(true);
    setCouponError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: couponCode.toUpperCase(),
          courseId: selectedCourse._id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setCouponError(data.message || 'Invalid coupon code');
        setProcessing(false);
        return;
      }

      const { pricing } = data;

      setPricing({
        originalPrice: pricing.originalPrice,
        discountAmount: pricing.discountAmount,
        priceAfterDiscount: pricing.priceAfterDiscount,
        gst: pricing.gst,
        totalAmount: pricing.totalAmount
      });

      setCouponApplied(true);
      setProcessing(false);
    } catch (error) {
      setCouponError('Error validating coupon');
      setProcessing(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponApplied(false);
    setCouponError('');
    setPricing({
      originalPrice: selectedCourse.price,
      discountAmount: 0,
      priceAfterDiscount: selectedCourse.price,
      gst: (selectedCourse.price * 18) / 100,
      totalAmount: selectedCourse.price + (selectedCourse.price * 18) / 100
    });
  };

  const handleProceedToPayment = async () => {
    setProcessing(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/enrollments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId: selectedCourse._id,
          couponCode: couponApplied ? couponCode : null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Error creating order');
        setProcessing(false);
        return;
      }

      if (data.isFree && data.enrollmentId) {
        setEnrollmentSuccess(true);
        setProcessing(false);
        setTimeout(() => {
          setShowPaymentModal(false);
          setEnrollmentSuccess(false);
          fetchAllCourses();
          fetchMyCourses();
        }, 3000);
        return;
      }

      if (!window.Razorpay) {
        alert('Payment gateway is loading. Please try again in a moment.');
        setProcessing(false);
        return;
      }

      const options = {
        key: data.razorpayKeyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Course Enrollment',
        description: selectedCourse.courseName,
        order_id: data.orderId,
        handler: async function (response) {
          await verifyPayment(response);
        },
        prefill: {
          name: currentUser?.name || currentUser?.firstName || '',
          email: currentUser?.email || '',
          contact: currentUser?.phoneNumber || currentUser?.whatsappNumber || ''
        },
        theme: {
          color: '#3b82f6'
        },
        modal: {
          ondismiss: function() {
            setProcessing(false);
            alert('Payment cancelled. You can try again anytime.');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      setProcessing(false);
    } catch (error) {
      console.error('Payment error:', error);
      alert('Error initiating payment');
      setProcessing(false);
    }
  };

  const verifyPayment = async (paymentResponse) => {
    setProcessing(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/enrollments/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature
        })
      });

      const data = await response.json();

      if (response.ok) {
        setEnrollmentSuccess(true);
        setProcessing(false);
        setTimeout(() => {
          setShowPaymentModal(false);
          setEnrollmentSuccess(false);
          setCouponCode('');
          setCouponApplied(false);
          fetchAllCourses();
          fetchMyCourses();
        }, 3000);
      } else {
        setProcessing(false);
        alert(data.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setProcessing(false);
      alert('Error verifying payment');
    }
  };

  const AllCoursesCard = ({ course, enrolled = false }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={course.courseImage || 'https://via.placeholder.com/400x200'}
          alt={course.courseName}
          className="w-full h-48 object-cover"
        />
        {enrolled && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <Check size={16} />
            Enrolled
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {course.category}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {typeof course.duration === 'object' 
              ? `${course.duration.value} ${course.duration.unit}` 
              : course.duration}
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {course.courseName}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{course.enrolledCount || 0} enrolled</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            ₹{(course.price || 0).toLocaleString()}
          </div>
        </div>

        {enrolled ? (
          <div className="w-full bg-green-100 text-green-700 py-2 px-4 rounded-lg font-medium text-center flex items-center justify-center gap-2">
            <BookOpen className="w-5 h-5" />
            Already Enrolled
          </div>
        ) : (
          <button
            onClick={() => handleEnrollClick(course)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Enroll Now
          </button>
        )}
      </div>
    </div>
  );

  const DashboardCourseCard = ({ enrollment }) => (
    <div 
      onClick={() => {
        setSelectedEnrollment(enrollment);
        setDashboardTab('sessions');
        const batchId = enrollment.batchId?._id;
        const courseId = enrollment.courseId?._id;
        
        fetchSessions(batchId);
        fetchAssignments(batchId, courseId);
        fetchUpcomingSessions();
      }}
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
    >
      <img 
        src={enrollment.courseId?.courseImage || 'https://via.placeholder.com/400x200'} 
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
      <div 
        className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => fetchSessionDetail(session._id)}
      >
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
          <p className="text-gray-600 mb-4 line-clamp-2">{session.description}</p>
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

        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {canJoin && (
            <a 
              href={session.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
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
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download size={18} />
              View Recording
            </a>
          )}
        </div>
      </div>
    );
  };

  const AssignmentCard = ({ assignment }) => {
    const submission = mySubmissions.find(s => s.assignmentId._id === assignment._id);
    const isPastDue = assignment.isPastDue;
    const isSubmitted = !!submission;

    return (
      <div 
        className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => fetchAssignmentDetail(assignment._id)}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800">{assignment.title}</h3>
            <p className="text-gray-600 text-sm mt-2 line-clamp-2">{assignment.description}</p>
          </div>
          {isSubmitted && (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ml-2 ${
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
              <p className="text-sm text-gray-700 line-clamp-2">
                <strong>Feedback:</strong> {submission.feedback}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
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

  const SubmitModal = () => {
    const isResubmit = mySubmissions.find(s => s.assignmentId._id === selectedAssignment?._id)?.status === 'resubmission_required';

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
                    value={submissionData.textContent}
                    onChange={(e) => setSubmissionData({...submissionData, textContent: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-3 min-h-[120px]"
                    placeholder="Enter your submission text..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Links (one per line)
                  </label>
                  <textarea
                    value={submissionData.links}
                    onChange={(e) => setSubmissionData({...submissionData, links: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-3"
                    placeholder="https://example.com"
                    rows="3"
                  />
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
                onChange={(e) => setSubmissionData({...submissionData, files: Array.from(e.target.files)})}
                className="w-full border border-gray-300 rounded-lg p-3"
              />
              {submissionData.files.length > 0 && (
                <div className="mt-2 space-y-1">
                  {Array.from(submissionData.files).map((file, idx) => (
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
              onClick={() => {
                if (isResubmit) {
                  handleResubmit(selectedAssignment._id);
                } else {
                  handleSubmitAssignment(selectedAssignment._id);
                }
              }}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              {isResubmit ? 'Resubmit' : 'Submit'}
            </button>
            <button
              onClick={() => {
                setSubmitModal(false);
                setSubmissionData({ textContent: '', links: '', files: [] });
              }}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const SessionDetailView = () => {
    if (!sessionDetail) return null;

    const canJoin = isSessionJoinable(sessionDetail);
    const isCompleted = sessionDetail.status === 'completed';

    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => {
            setDashboardTab('sessions');
            setSessionDetail(null);
          }}
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          ← Back to Sessions
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {sessionDetail.sessionTitle}
              </h1>
              {sessionDetail.sessionNumber && (
                <span className="text-lg text-gray-500">Session #{sessionDetail.sessionNumber}</span>
              )}
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              sessionDetail.status === 'live' ? 'bg-red-100 text-red-800' :
              sessionDetail.status === 'completed' ? 'bg-green-100 text-green-800' :
              sessionDetail.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {sessionDetail.status.toUpperCase()}
            </span>
          </div>

          {sessionDetail.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{sessionDetail.description}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Schedule Details
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong>Date:</strong> {new Date(sessionDetail.scheduledDate).toLocaleDateString()}</p>
                <p><strong>Start Time:</strong> {sessionDetail.scheduledStartTime}</p>
                <p><strong>End Time:</strong> {sessionDetail.scheduledEndTime}</p>
                {sessionDetail.duration && (
                  <p><strong>Duration:</strong> {sessionDetail.duration} minutes</p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Course Information
              </h3>
              <div className="space-y-2 text-sm">
                {sessionDetail.courseId && (
                  <p><strong>Course:</strong> {sessionDetail.courseId.courseName || 'N/A'}</p>
                )}
                {sessionDetail.batchId && (
                  <>
                    <p><strong>Batch:</strong> {sessionDetail.batchId.batchName || 'N/A'}</p>
                    {sessionDetail.batchId.startDate && (
                      <p><strong>Batch Start:</strong> {new Date(sessionDetail.batchId.startDate).toLocaleDateString()}</p>
                    )}
                    {sessionDetail.batchId.endDate && (
                      <p><strong>Batch End:</strong> {new Date(sessionDetail.batchId.endDate).toLocaleDateString()}</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {sessionDetail.trainerUserId && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Trainer Information</h3>
              <p className="text-blue-800 text-sm">
                <strong>Trainer ID:</strong> {sessionDetail.trainerUserId}
              </p>
            </div>
          )}

          {sessionDetail.sessionMaterials && sessionDetail.sessionMaterials.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Session Materials</h3>
              <div className="space-y-2">
                {sessionDetail.sessionMaterials.map((material, idx) => (
                  <a
                    key={idx}
                    href={material.url || material}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 p-3 bg-gray-50 rounded-lg"
                  >
                    <FileText className="w-5 h-5" />
                    {material.title || material.name || `Material ${idx + 1}`}
                  </a>
                ))}
              </div>
            </div>
          )}

          {sessionDetail.topics && sessionDetail.topics.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Topics to be Covered</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {sessionDetail.topics.map((topic, idx) => (
                  <li key={idx}>{topic}</li>
                ))}
              </ul>
            </div>
          )}

          {sessionDetail.resources && sessionDetail.resources.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Resources</h3>
              <div className="space-y-2">
                {sessionDetail.resources.map((resource, idx) => (
                  <a
                    key={idx}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <Link2 className="w-4 h-4" />
                    {resource.title || resource.url}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {canJoin && sessionDetail.meetingLink && (
              <a
                href={sessionDetail.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-semibold"
              >
                <Video size={20} />
                Join Session Now
              </a>
            )}

            {isCompleted && sessionDetail.recordingUrl && (
              <a
                href={sessionDetail.recordingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 font-semibold"
              >
                <Download size={20} />
                View Recording
              </a>
            )}
          </div>

          {sessionDetail.notes && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">Session Notes</h3>
              <p className="text-yellow-800 text-sm whitespace-pre-wrap">{sessionDetail.notes}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const AssignmentDetailView = () => {
    if (!assignmentDetail) return null;

    const isPastDue = assignmentDetail.isPastDue;
    const isSubmitted = !!assignmentSubmission;

    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => {
            setDashboardTab('assignments');
            setAssignmentDetail(null);
            setAssignmentSubmission(null);
          }}
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          ← Back to Assignments
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {assignmentDetail.title}
              </h1>
              {assignmentDetail.assignmentNumber && (
                <span className="text-lg text-gray-500">Assignment #{assignmentDetail.assignmentNumber}</span>
              )}
            </div>
            {isSubmitted && (
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                assignmentSubmission.status === 'graded' ? 'bg-green-100 text-green-800' :
                assignmentSubmission.status === 'resubmission_required' ? 'bg-orange-100 text-orange-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {assignmentSubmission.status === 'graded' ? 'GRADED' :
                 assignmentSubmission.status === 'resubmission_required' ? 'RESUBMIT REQUIRED' :
                 'SUBMITTED'}
              </span>
            )}
          </div>

          {assignmentDetail.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{assignmentDetail.description}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Due Date
              </h3>
              <p className="text-gray-700">
                {new Date(assignmentDetail.dueDate).toLocaleString()}
              </p>
              {isPastDue && !isSubmitted && (
                <p className="text-red-600 font-semibold mt-2">⚠️ This assignment is overdue</p>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Grading Information
              </h3>
              <p className="text-gray-700">
                <strong>Maximum Marks:</strong> {assignmentDetail.maxMarks}
              </p>
            </div>
          </div>

          {assignmentDetail.instructions && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
              <p className="text-blue-800 text-sm whitespace-pre-wrap">{assignmentDetail.instructions}</p>
            </div>
          )}

          {assignmentDetail.attachments && assignmentDetail.attachments.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Attachments</h3>
              <div className="space-y-2">
                {assignmentDetail.attachments.map((attachment, idx) => (
                  <a
                    key={idx}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 p-3 bg-gray-50 rounded-lg"
                  >
                    <FileText className="w-5 h-5" />
                    {attachment.name || `Attachment ${idx + 1}`}
                  </a>
                ))}
              </div>
            </div>
          )}

          {assignmentSubmission && (
            <div className="mb-6 border-t pt-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Submission</h3>
              
              {assignmentSubmission.textContent && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Text Content</h4>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                    {assignmentSubmission.textContent}
                  </p>
                </div>
              )}

              {assignmentSubmission.links && assignmentSubmission.links.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Submitted Links</h4>
                  <div className="space-y-2">
                    {assignmentSubmission.links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                      >
                        <Link2 className="w-4 h-4" />
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {assignmentSubmission.files && assignmentSubmission.files.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Submitted Files</h4>
                  <div className="space-y-2">
                    {assignmentSubmission.files.map((file, idx) => (
                      <a
                        key={idx}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 p-3 bg-gray-50 rounded-lg"
                      >
                        <FileText className="w-5 h-5" />
                        {file.name || `File ${idx + 1}`}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-600 mt-4">
                Submitted on: {new Date(assignmentSubmission.submittedAt).toLocaleString()}
              </p>

              {assignmentSubmission.grade !== null && assignmentSubmission.grade !== undefined && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Award className="text-green-600 w-8 h-8" />
                    <div>
                      <h4 className="text-2xl font-bold text-green-800">
                        {assignmentSubmission.grade}/{assignmentSubmission.maxGrade || assignmentDetail.maxMarks}
                      </h4>
                      <p className="text-sm text-green-700">Your Grade</p>
                    </div>
                  </div>
                  {assignmentSubmission.feedback && (
                    <div className="mt-4 pt-4 border-t border-green-200">
                      <h4 className="font-semibold text-green-900 mb-2">Instructor Feedback</h4>
                      <p className="text-green-800 whitespace-pre-wrap">{assignmentSubmission.feedback}</p>
                    </div>
                  )}
                  {assignmentSubmission.gradedAt && (
                    <p className="text-sm text-green-700 mt-3">
                      Graded on: {new Date(assignmentSubmission.gradedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            {!isSubmitted && !isPastDue && (
              <button
                onClick={() => {
                  setSelectedAssignment(assignmentDetail);
                  setSubmitModal(true);
                }}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-semibold"
              >
                <Upload size={20} />
                Submit Assignment
              </button>
            )}

            {assignmentSubmission?.status === 'resubmission_required' && (
              <button
                onClick={() => {
                  setSelectedAssignment(assignmentDetail);
                  setSubmitModal(true);
                }}
                className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 font-semibold"
              >
                <RefreshCw size={20} />
                Resubmit Assignment
              </button>
            )}

            {isSubmitted && assignmentSubmission.status !== 'graded' && (
              <button
                onClick={() => handleDeleteSubmission(assignmentDetail._id)}
                className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-semibold"
              >
                <Trash2 size={20} />
                Delete Submission
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading && activeTab !== 'my') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
    
      {upcomingSessions.length > 0 && activeTab === 'my' && dashboardTab === 'courses' && (
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
          <div className="flex gap-4 border-b overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab('all');
                setDashboardTab('courses');
                setSelectedEnrollment(null);
              }}
              className={`py-4 px-6 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'all' 
                  ? 'border-b-2 border-blue-600 text-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              All Courses
            </button>
            <button
              onClick={() => {
                setActiveTab('my');
                setDashboardTab('courses');
                setSelectedEnrollment(null);
                fetchUpcomingSessions();
              }}
              className={`py-4 px-6 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'my' 
                  ? 'border-b-2 border-blue-600 text-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              My Courses ({myCourses.length})
            </button>

            {activeTab === 'my' && selectedEnrollment && (
              <>
                <button
                  onClick={() => setDashboardTab('sessions')}
                  className={`py-4 px-6 font-semibold transition-colors whitespace-nowrap ${
                    dashboardTab === 'sessions' 
                      ? 'border-b-2 border-blue-600 text-blue-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Live Sessions
                </button>
                <button
                  onClick={() => {
                    setDashboardTab('assignments');
                    fetchMySubmissions();
                  }}
                  className={`py-4 px-6 font-semibold transition-colors whitespace-nowrap ${
                    dashboardTab === 'assignments' 
                      ? 'border-b-2 border-blue-600 text-blue-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Assignments
                </button>
              </>
            )}

            {activeTab === 'my' && (
              <>
                <button
                  onClick={() => {
                    setDashboardTab('allSessions');
                    setSelectedEnrollment(null);
                    fetchSessions(); 
                  }}
                  className={`py-4 px-6 font-semibold transition-colors whitespace-nowrap ${
                    dashboardTab === 'allSessions' 
                      ? 'border-b-2 border-blue-600 text-blue-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  All Sessions
                </button>
                <button
                  onClick={() => {
                    setDashboardTab('allAssignments');
                    setSelectedEnrollment(null);
                    fetchAssignments();
                    fetchMySubmissions();
                  }}
                  className={`py-4 px-6 font-semibold transition-colors whitespace-nowrap ${
                    dashboardTab === 'allAssignments' 
                      ? 'border-b-2 border-blue-600 text-blue-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  All Assignments
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

        {activeTab === 'all' && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCourses.map((course) => (
              <AllCoursesCard 
                key={course._id} 
                course={course} 
                enrolled={isEnrolled(course._id)}
              />
            ))}
            {allCourses.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                No courses available
              </div>
            )}
          </div>
        )}

        {activeTab === 'my' && !loading && (
          <>
            {dashboardTab === 'courses' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myCourses.map(enrollment => (
                  <DashboardCourseCard key={enrollment._id} enrollment={enrollment} />
                ))}
                {myCourses.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    No courses enrolled yet
                  </div>
                )}
              </div>
            )}

            {dashboardTab === 'sessionDetail' && <SessionDetailView />}

            {dashboardTab === 'assignmentDetail' && <AssignmentDetailView />}

            {dashboardTab === 'sessions' && selectedEnrollment && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {selectedEnrollment.courseId?.courseName} - Sessions
                  </h2>
                  <p className="text-gray-600">Batch: {selectedEnrollment.batchId?.batchName}</p>
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

            {dashboardTab === 'assignments' && selectedEnrollment && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {selectedEnrollment.courseId?.courseName} - Assignments
                  </h2>
                  <p className="text-gray-600">Batch: {selectedEnrollment.batchId?.batchName}</p>
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

            {dashboardTab === 'allSessions' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    All Live Sessions
                  </h2>
                  <p className="text-gray-600">All sessions across your enrolled courses</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {allSessions.map(session => (
                    <SessionCard key={session._id} session={session} />
                  ))}
                  {allSessions.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                      No sessions available
                    </div>
                  )}
                </div>
              </div>
            )}

            {dashboardTab === 'allAssignments' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    All Assignments
                  </h2>
                  <p className="text-gray-600">All assignments across your enrolled courses</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {allAssignments.map(assignment => (
                    <AssignmentCard key={assignment._id} assignment={assignment} />
                  ))}
                  {allAssignments.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                      No assignments available
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
            <button
              onClick={() => {
                setShowPaymentModal(false);
                setCouponCode('');
                setCouponApplied(false);
                setCouponError('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              disabled={processing}
            >
              <X className="w-6 h-6" />
            </button>

            {enrollmentSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enrollment Successful!</h3>
                <p className="text-gray-600">You have been successfully enrolled in the course.</p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Enrollment</h2>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{selectedCourse?.courseName}</h3>
                  <p className="text-sm text-gray-600">{selectedCourse?.category}</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Have a coupon code?
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        disabled={couponApplied}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>
                    {couponApplied ? (
                      <button
                        onClick={handleRemoveCoupon}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={handleApplyCoupon}
                        disabled={processing || !couponCode.trim()}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                  {couponError && (
                    <p className="text-red-600 text-sm mt-2">{couponError}</p>
                  )}
                  {couponApplied && (
                    <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      Coupon applied successfully!
                    </p>
                  )}
                </div>

                {pricing && (
                  <div className="border-t border-b border-gray-200 py-4 mb-6 space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Original Price</span>
                      <span>₹{pricing.originalPrice.toLocaleString()}</span>
                    </div>
                    {pricing.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>- ₹{pricing.discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600">
                      <span>GST (18%)</span>
                      <span>₹{pricing.gst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                      <span>Total Amount</span>
                      <span>₹{pricing.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleProceedToPayment}
                  disabled={processing}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <CreditCard className="w-5 h-5" />
                  {processing ? 'Processing...' : 'Proceed to Payment'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
      
      {submitModal && <SubmitModal />}
    </div>
  );
};

export default LiveCourseEnrollment;