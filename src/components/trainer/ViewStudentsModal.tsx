import React, { useState, useEffect } from 'react';

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  enrollmentDate: string;
}

interface BatchInfo {
  batchName: string;
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
  };
  currentStudents: number;
  maxStudents: number;
}

interface ViewStudentsModalProps {
  open: boolean;
  onClose: () => void;
  students: Student[];
  batchInfo: BatchInfo;
}

const ViewStudentsModal: React.FC<ViewStudentsModalProps> = ({
  open,
  onClose,
  students,
  batchInfo
}) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (open) {
      setTimeout(() => setShowModal(true), 10);
    } else {
      setShowModal(false);
    }
  }, [open]);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvatarColor = (id: string) => {
    const colors = [
      'bg-gradient-to-br from-purple-500 to-pink-500',
      'bg-gradient-to-br from-blue-500 to-cyan-500',
      'bg-gradient-to-br from-green-500 to-emerald-500',
      'bg-gradient-to-br from-orange-500 to-red-500',
      'bg-gradient-to-br from-indigo-500 to-purple-500'
    ];
    return colors[parseInt(id) % colors.length];
  };

  const handleClose = () => {
    setShowModal(false);
    setTimeout(() => {
      onClose();
      setSearchTerm('');
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
      maxWidth: '600px',
      maxHeight: '90vh',
      overflow: 'hidden',
      transform: showModal ? 'scale(1)' : 'scale(0.95)',
      opacity: showModal ? 1 : 0,
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
    },
    header: {
      padding: '24px 32px',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    headerContent: {
      flex: 1
    },
    title: {
      margin: 0,
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#111827',
      marginBottom: '4px'
    },
    subtitle: {
      margin: 0,
      fontSize: '0.875rem',
      color: '#6b7280',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    closeButton: {
      background: 'transparent',
      border: 'none',
      width: '36px',
      height: '36px',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: '#6b7280',
      transition: 'all 0.2s ease',
      outline: 'none'
    },
    content: {
      padding: '24px 32px'
    },
    searchContainer: {
      marginBottom: '24px'
    },
    searchInput: {
      width: '100%',
      padding: '14px 16px 14px 44px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      fontSize: '0.95rem',
      transition: 'all 0.2s ease',
      outline: 'none',
      background: 'white'
    },
    searchIcon: {
      position: 'absolute' as const,
      left: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '20px',
      height: '20px',
      strokeWidth: '2px',
      color: '#9ca3af'
    },
    statsCard: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    statsLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    avatarGroup: {
      display: 'flex'
    },
    avatar: (index: number, color: string) => ({
      width: '44px',
      height: '44px',
      borderRadius: '50%',
      border: '3px solid white',
      marginLeft: index > 0 ? '-12px' : '0',
      background: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 600,
      fontSize: '0.875rem'
    }),
    statsText: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '4px'
    },
    statsTitle: {
      fontSize: '1.25rem',
      fontWeight: 600,
      margin: 0
    },
    statsSubtitle: {
      fontSize: '0.875rem',
      opacity: 0.9,
      margin: 0
    },
    percentage: {
      background: 'rgba(255, 255, 255, 0.2)',
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '0.875rem',
      fontWeight: 600,
      backdropFilter: 'blur(10px)'
    },
    studentList: {
      maxHeight: '400px',
      overflowY: 'auto' as const
    },
    studentItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '20px',
      borderBottom: '1px solid #e5e7eb',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    },
    studentAvatar: (color: string) => ({
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      background: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 600,
      fontSize: '1rem',
      marginRight: '16px',
      flexShrink: 0
    }),
    studentInfo: {
      flex: 1
    },
    studentName: {
      margin: 0,
      fontSize: '1rem',
      fontWeight: 600,
      color: '#111827',
      marginBottom: '4px'
    },
    studentContact: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '4px'
    },
    contactItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    contactIcon: {
      width: '16px',
      height: '16px',
      strokeWidth: '2px'
    },
    enrollmentDate: {
      fontSize: '0.75rem',
      color: '#9ca3af',
      margin: 0
    },
    emptyState: {
      textAlign: 'center' as const,
      padding: '60px 20px'
    },
    emptyIcon: {
      width: '80px',
      height: '80px',
      strokeWidth: '1.5px',
      color: '#e5e7eb',
      margin: '0 auto 20px'
    },
    emptyText: {
      margin: 0,
      fontSize: '1rem',
      color: '#6b7280'
    }
  };

  const globalStyles = `
    @keyframes studentAppear {
      from {
        opacity: 0;
        transform: translateX(-10px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    .students-search:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }
    
    .student-item:hover {
      background: #f9fafb;
      transform: translateX(4px);
    }
    
    .close-btn:hover {
      background: #f3f4f6;
      color: #374151;
    }
    
    .close-btn:active {
      transform: scale(0.95);
    }
    
    ::-webkit-scrollbar {
      width: 6px;
    }
    
    ::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }
    
    ::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
  `;

  if (!open) return null;

  const percentage = Math.round((batchInfo.currentStudents / batchInfo.maxStudents) * 100);
  const avatarColors = [
    'linear-gradient(135deg, #8b5cf6, #ec4899)',
    'linear-gradient(135deg, #3b82f6, #06b6d4)',
    'linear-gradient(135deg, #10b981, #84cc16)',
    'linear-gradient(135deg, #f59e0b, #ef4444)',
    'linear-gradient(135deg, #6366f1, #8b5cf6)'
  ];

  return (
    <>
      <style>{globalStyles}</style>
      <div style={styles.overlay} onClick={handleClose}>
        <div style={styles.modal} onClick={e => e.stopPropagation()}>
          <div style={styles.header}>
            <div style={styles.headerContent}>
              <h2 style={styles.title}>{batchInfo.batchName}</h2>
              <div style={styles.subtitle}>
                <span>{batchInfo.schedule.day}</span>
                <span>•</span>
                <span>{batchInfo.schedule.startTime} - {batchInfo.schedule.endTime}</span>
              </div>
            </div>
            <button 
              className="close-btn"
              style={styles.closeButton}
              onClick={handleClose}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2"/>
                <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2"/>
              </svg>
            </button>
          </div>
          
          <div style={styles.content}>
            <div style={styles.statsCard}>
              <div style={styles.statsLeft}>
                <div style={styles.avatarGroup}>
                  {students.slice(0, 3).map((student, index) => (
                    <div 
                      key={student.id}
                      style={styles.avatar(index, avatarColors[index % avatarColors.length])}
                    >
                      {getInitials(student.name)}
                    </div>
                  ))}
                </div>
                <div style={styles.statsText}>
                  <h3 style={styles.statsTitle}>{students.length} Students</h3>
                  <p style={styles.statsSubtitle}>
                    {batchInfo.currentStudents} enrolled of {batchInfo.maxStudents} capacity
                  </p>
                </div>
              </div>
              <div style={styles.percentage}>
                {percentage}% Full
              </div>
            </div>
            
            <div style={styles.searchContainer}>
              <div style={{ position: 'relative' }}>
                <svg style={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2"/>
                </svg>
                <input
                  type="text"
                  className="students-search"
                  style={styles.searchInput}
                  placeholder="Search students by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div style={styles.studentList}>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => (
                  <div 
                    key={student.id}
                    className="student-item"
                    style={{
                      ...styles.studentItem,
                      animation: `studentAppear 0.3s ease-out ${index * 0.05}s forwards`,
                      opacity: 0
                    }}
                  >
                    <div 
                      style={styles.studentAvatar(avatarColors[index % avatarColors.length])}
                    >
                      {getInitials(student.name)}
                    </div>
                    <div style={styles.studentInfo}>
                      <h4 style={styles.studentName}>{student.name}</h4>
                      <div style={styles.studentContact}>
                        <div style={styles.contactItem}>
                          <svg style={styles.contactIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeWidth="2"/>
                            <polyline points="22,6 12,13 2,6" strokeWidth="2"/>
                          </svg>
                          {student.email}
                        </div>
                        {student.phone && (
                          <div style={styles.contactItem}>
                            <svg style={styles.contactIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" strokeWidth="2"/>
                            </svg>
                            {student.phone}
                          </div>
                        )}
                      </div>
                      <p style={styles.enrollmentDate}>
                        Enrolled on {formatDate(student.enrollmentDate)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div style={styles.emptyState}>
                  <svg style={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeWidth="2"/>
                    <circle cx="9" cy="7" r="4" strokeWidth="2"/>
                    <path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75" strokeWidth="2"/>
                  </svg>
                  <p style={styles.emptyText}>
                    {searchTerm ? 'No students found matching your search' : 'No students enrolled yet'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewStudentsModal;