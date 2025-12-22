import React, { useState, useEffect } from 'react';

interface CreateBatchModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (batchData: any) => void;
  courses: Array<{ id: string; title: string }>;
  editData?: any | null;
  mode?: 'create' | 'edit';
}

const CreateBatchModal: React.FC<CreateBatchModalProps> = ({
  open,
  onClose,
  onSubmit,
  courses,
  editData = null,
  mode = 'create'
}) => {
  const [batchData, setBatchData] = useState({
    batchName: '',
    courseId: '',
    schedule: {
      day: 'Monday',
      startTime: '10:00',
      endTime: '12:00',
      timezone: 'IST (UTC+5:30)'
    },
    startDate: '',
    endDate: '',
    maxStudents: 30,
    meetingLink: '',
    status: 'Scheduled' as 'Scheduled' | 'Ongoing' | 'Completed'
  });

  const [showModal, setShowModal] = useState(false);

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
    'Friday', 'Saturday', 'Sunday'
  ];

  const timezones = [
    'IST (UTC+5:30)',
    'PST (UTC-8)',
    'EST (UTC-5)',
    'GMT (UTC+0)',
    'CET (UTC+1)'
  ];

  const times = Array.from({ length: 24 * 4 }, (_, i) => {
    const hour = Math.floor(i / 4);
    const minute = (i % 4) * 15;
    const hour12 = hour % 12 || 12;
    const ampm = hour < 12 ? 'AM' : 'PM';
    return {
      value: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      label: `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`
    };
  });

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && editData) {
        // Populate form with existing data for editing
        setBatchData({
          batchName: editData.batchName || '',
          courseId: editData.courseId || '',
          schedule: {
            day: editData.schedule?.day || 'Monday',
            startTime: editData.schedule?.startTime || '10:00',
            endTime: editData.schedule?.endTime || '12:00',
            timezone: editData.schedule?.timezone || 'IST (UTC+5:30)'
          },
          startDate: editData.startDate || '',
          endDate: editData.endDate || '',
          maxStudents: editData.maxStudents || 30,
          meetingLink: editData.meetingLink || '',
          status: editData.status || 'Scheduled'
        });
      } else {
        // Reset form for creation
        setBatchData({
          batchName: '',
          courseId: '',
          schedule: {
            day: 'Monday',
            startTime: '10:00',
            endTime: '12:00',
            timezone: 'IST (UTC+5:30)'
          },
          startDate: '',
          endDate: '',
          maxStudents: 30,
          meetingLink: '',
          status: 'Scheduled'
        });
      }
      setTimeout(() => setShowModal(true), 10);
    } else {
      setShowModal(false);
    }
  }, [open, editData, mode]);

  const handleChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setBatchData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setBatchData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = () => {
    const dataToSubmit = mode === 'edit' && editData 
      ? { ...batchData, id: editData.id } 
      : batchData;
    onSubmit(dataToSubmit);
    handleClose();
  };

  const handleClose = () => {
    setShowModal(false);
    setTimeout(() => {
      onClose();
      if (mode === 'create') {
        setBatchData({
          batchName: '',
          courseId: '',
          schedule: {
            day: 'Monday',
            startTime: '10:00',
            endTime: '12:00',
            timezone: 'IST (UTC+5:30)'
          },
          startDate: '',
          endDate: '',
          maxStudents: 30,
          meetingLink: '',
          status: 'Scheduled'
        });
      }
    }, 300);
  };

  const styles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: open ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      zIndex: 1000,
      opacity: showModal ? 1 : 0,
      transition: 'opacity 0.3s ease'
    },
    modal: {
      background: 'white',
      borderRadius: '20px',
      width: '100%',
      maxWidth: '800px',
      maxHeight: '90vh',
      overflow: 'auto',
      transform: showModal ? 'scale(1)' : 'scale(0.95)',
      opacity: showModal ? 1 : 0,
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
    },
    header: {
      background: mode === 'edit' 
        ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '28px 32px',
      borderTopLeftRadius: '20px',
      borderTopRightRadius: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      margin: 0,
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.5px'
    },
    closeButton: {
      background: 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: 'white',
      transition: 'all 0.2s ease',
      outline: 'none'
    },
    content: {
      padding: '32px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '24px'
    },
    fullWidth: {
      gridColumn: 'span 2'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px'
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: '#374151',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    required: {
      color: '#ef4444'
    },
    input: {
      padding: '14px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      fontSize: '0.95rem',
      transition: 'all 0.2s ease',
      outline: 'none'
    },
    select: {
      padding: '14px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      fontSize: '0.95rem',
      background: 'white',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none'
    },
    timeSelectGroup: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px'
    },
    footer: {
      padding: '24px 32px',
      borderTop: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '16px'
    },
    cancelButton: {
      padding: '12px 28px',
      border: '2px solid #e5e7eb',
      background: 'white',
      borderRadius: '10px',
      fontSize: '0.95rem',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none',
      color: '#4b5563'
    },
    submitButton: {
      padding: '12px 32px',
      background: mode === 'edit' 
        ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: 'none',
      borderRadius: '10px',
      fontSize: '0.95rem',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none',
      color: 'white',
      boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)'
    },
    icon: {
      width: '18px',
      height: '18px',
      strokeWidth: '2px'
    }
  };

  const globalStyles = `
    @keyframes modalAppear {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    .batch-input:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }
    
    .batch-select:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }
    
    .batch-close-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: rotate(90deg);
    }
    
    .batch-cancel-btn:hover {
      background: #f9fafb;
      border-color: #d1d5db;
      transform: translateY(-1px);
    }
    
    .batch-submit-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
    }
    
    .batch-submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
    
    .batch-submit-btn:disabled:hover {
      transform: none;
      box-shadow: 0 4px 14px rgba(102, 126, 234, 0.4);
    }
  `;

  if (!open) return null;

  return (
    <>
      <style>{globalStyles}</style>
      <div style={styles.overlay} onClick={handleClose}>
        <div style={styles.modal} onClick={e => e.stopPropagation()}>
          <div style={styles.header}>
            <h2 style={styles.title}>
              {mode === 'edit' ? 'Edit Batch' : 'Create New Batch'}
            </h2>
            <button 
              className="batch-close-btn"
              style={styles.closeButton}
              onClick={handleClose}
            >
              <svg style={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2"/>
                <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2"/>
              </svg>
            </button>
          </div>
          
          <div style={styles.content}>
            <div style={styles.grid}>
              <div style={styles.fullWidth}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Batch Name
                    <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className="batch-input"
                    style={styles.input}
                    value={batchData.batchName}
                    onChange={(e) => handleChange('batchName', e.target.value)}
                    placeholder="e.g., MERN-Batch-Jan-2024"
                    required
                  />
                </div>
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Course
                  <span style={styles.required}>*</span>
                </label>
                <select
                  className="batch-select"
                  style={styles.select}
                  value={batchData.courseId}
                  onChange={(e) => handleChange('courseId', e.target.value)}
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Maximum Students
                  <span style={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  className="batch-input"
                  style={styles.input}
                  value={batchData.maxStudents}
                  onChange={(e) => handleChange('maxStudents', parseInt(e.target.value))}
                  min="1"
                  max="100"
                  required
                />
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Day
                  <span style={styles.required}>*</span>
                </label>
                <select
                  className="batch-select"
                  style={styles.select}
                  value={batchData.schedule.day}
                  onChange={(e) => handleChange('schedule.day', e.target.value)}
                >
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              
              <div style={styles.timeSelectGroup}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Start Time
                    <span style={styles.required}>*</span>
                  </label>
                  <select
                    className="batch-select"
                    style={styles.select}
                    value={batchData.schedule.startTime}
                    onChange={(e) => handleChange('schedule.startTime', e.target.value)}
                  >
                    {times.map((time) => (
                      <option key={time.value} value={time.value}>
                        {time.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    End Time
                    <span style={styles.required}>*</span>
                  </label>
                  <select
                    className="batch-select"
                    style={styles.select}
                    value={batchData.schedule.endTime}
                    onChange={(e) => handleChange('schedule.endTime', e.target.value)}
                  >
                    {times.map((time) => (
                      <option key={time.value} value={time.value}>
                        {time.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Timezone
                  <span style={styles.required}>*</span>
                </label>
                <select
                  className="batch-select"
                  style={styles.select}
                  value={batchData.schedule.timezone}
                  onChange={(e) => handleChange('schedule.timezone', e.target.value)}
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Status
                  <span style={styles.required}>*</span>
                </label>
                <select
                  className="batch-select"
                  style={styles.select}
                  value={batchData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Start Date
                  <span style={styles.required}>*</span>
                </label>
                <input
                  type="date"
                  className="batch-input"
                  style={styles.input}
                  value={batchData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  required
                />
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  End Date
                  <span style={styles.required}>*</span>
                </label>
                <input
                  type="date"
                  className="batch-input"
                  style={styles.input}
                  value={batchData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  required
                />
              </div>
              
              <div style={styles.fullWidth}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Meeting Link
                  </label>
                  <input
                    type="url"
                    className="batch-input"
                    style={styles.input}
                    value={batchData.meetingLink}
                    onChange={(e) => handleChange('meetingLink', e.target.value)}
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div style={styles.footer}>
            <button 
              className="batch-cancel-btn"
              style={styles.cancelButton}
              onClick={handleClose}
            >
              Cancel
            </button>
            <button 
              className="batch-submit-btn"
              style={styles.submitButton}
              onClick={handleSubmit}
              disabled={!batchData.batchName || !batchData.courseId || !batchData.startDate || !batchData.endDate}
            >
              {mode === 'edit' ? 'Update Batch' : 'Create Batch'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateBatchModal;