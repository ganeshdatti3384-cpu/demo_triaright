import React, { useState } from 'react';

interface Batch {
  id: string;
  batchName: string;
  courseId: string;
  trainerId: string;
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
    timezone: string;
  };
  startDate: string;
  endDate: string;
  students: any[];
  maxStudents: number;
  currentStudents: number;
  status: 'Scheduled' | 'Ongoing' | 'Completed';
  meetingLink: string;
  isActive: boolean;
}

interface BatchListProps {
  batches: Batch[];
  onViewStudents: (batch: Batch) => void;
  onEditBatch: (batch: Batch) => void;
  onDeleteBatch: (batchId: string) => void;
}

const BatchList: React.FC<BatchListProps> = ({ batches, onViewStudents, onEditBatch, onDeleteBatch }) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ongoing': return '#10b981';
      case 'Scheduled': return '#f59e0b';
      case 'Completed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'Ongoing': return 'rgba(16, 185, 129, 0.1)';
      case 'Scheduled': return 'rgba(245, 158, 11, 0.1)';
      case 'Completed': return 'rgba(107, 114, 128, 0.1)';
      default: return 'rgba(107, 114, 128, 0.1)';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const calculateProgress = (current: number, max: number) => {
    return (current / max) * 100;
  };

  // const handleDeleteClick = (e: React.MouseEvent, batchId: string) => {
  //   e.stopPropagation();
  //   setShowDeleteConfirm(batchId);
  // };

  // const handleConfirmDelete = (batchId: string) => {
  //   onDeleteBatch(batchId);
  //   setShowDeleteConfirm(null);
  // };

  // const handleCancelDelete = () => {
  //   setShowDeleteConfirm(null);
  // };

  const styles = {
    container: {
      padding: '20px',
      animation: 'fadeIn 0.5s ease-out'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '24px',
      padding: '10px'
    },
    card: (batchId: string) => ({
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      border: '1px solid #e5e7eb',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      opacity: 0,
      animation: `slideUp 0.5s ease-out forwards`,
      animationDelay: `${batches.findIndex(b => b.id === batchId) * 0.1}s`,
      position: 'relative' as const,
      overflow: 'hidden',
      transform: hoveredCard === batchId ? 'translateY(-6px)' : 'translateY(0)',
      boxShadowHover: hoveredCard === batchId ? '0 12px 32px rgba(0, 0, 0, 0.12)' : '0 4px 20px rgba(0, 0, 0, 0.08)',
      borderColor: hoveredCard === batchId ? '#d1d5db' : '#e5e7eb'
    }),
    cardBefore: (hovered: boolean) => ({
      content: '""',
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
      opacity: hovered ? 1 : 0,
      transition: 'opacity 0.3s ease'
    }),
    titleWrapper: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px',
      gap: '12px'
    },
    title: {
      margin: 0,
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#111827',
      flex: 1,
      lineHeight: 1.4
    },
    status: (status: string) => ({
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: 600,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
      border: '1.5px solid',
      whiteSpace: 'nowrap' as const,
      transition: 'all 0.3s ease',
      backgroundColor: getStatusBgColor(status),
      color: getStatusColor(status),
      borderColor: getStatusColor(status)
    }),
    schedule: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '10px'
    },
    scheduleItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      color: '#6b7280',
      fontSize: '0.875rem'
    },
    scheduleIcon: {
      width: '18px',
      height: '18px',
      strokeWidth: '2px',
      color: '#9ca3af',
      flexShrink: 0
    },
    dates: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '12px',
      background: '#f9fafb',
      borderRadius: '12px',
      marginBottom: '20px',
      color: '#4b5563',
      fontSize: '0.875rem',
      transition: 'all 0.3s ease',
      backgroundHover: '#f3f4f6'
    },
    dateIcon: {
      width: '18px',
      height: '18px',
      strokeWidth: '2px',
      color: '#6b7280',
      flexShrink: 0
    },
    students: {
      background: '#f8fafc',
      borderRadius: '12px',
      padding: '18px',
      marginBottom: '20px',
      border: '1px solid #e2e8f0',
      transition: 'all 0.3s ease',
      borderColorHover: '#cbd5e1'
    },
    studentsHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px'
    },
    studentsInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    studentsIcon: {
      width: '24px',
      height: '24px',
      strokeWidth: '2px',
      color: '#6366f1'
    },
    studentCount: {
      fontWeight: 600,
      fontSize: '1.125rem',
      color: '#111827'
    },
    studentTotal: {
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    viewButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      background: 'white',
      border: '1.5px solid #e5e7eb',
      borderRadius: '8px',
      color: '#4b5563',
      fontSize: '0.875rem',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none'
    },
    eyeIcon: {
      width: '16px',
      height: '16px',
      strokeWidth: '2px'
    },
    progressBar: {
      height: '6px',
      background: '#e5e7eb',
      borderRadius: '3px',
      overflow: 'hidden'
    },
    progressFill: (percentage: number, color: string) => ({
      height: '100%',
      width: `${percentage}%`,
      background: color,
      borderRadius: '3px',
      transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
    }),
    meetingLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: '#6366f1',
      textDecoration: 'none',
      fontSize: '0.875rem',
      fontWeight: 500,
      marginBottom: '16px',
      transition: 'all 0.2s ease'
    },
    linkIcon: {
      width: '16px',
      height: '16px',
      strokeWidth: '2px'
    },
    actions: {
      display: 'flex',
      gap: '8px'
    },
    actionButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 16px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none'
    },
    editButton: {
      background: '#f3f4f6',
      color: '#4b5563',
      border: '1px solid #e5e7eb'
    },
    deleteButton: {
      background: '#fef2f2',
      color: '#dc2626',
      border: '1px solid #fecaca'
    },
    deleteConfirm: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '16px',
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      zIndex: 10,
      animation: 'fadeIn 0.2s ease-out'
    },
    deleteText: {
      textAlign: 'center' as const,
      marginBottom: '20px'
    },
    deleteTitle: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#111827',
      marginBottom: '8px'
    },
    deleteSubtitle: {
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    deleteActions: {
      display: 'flex',
      gap: '12px'
    },
    cancelButton: {
      padding: '8px 20px',
      background: 'white',
      border: '1.5px solid #e5e7eb',
      borderRadius: '8px',
      color: '#4b5563',
      fontSize: '0.875rem',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none'
    },
    confirmDeleteButton: {
      padding: '8px 20px',
      background: '#dc2626',
      border: 'none',
      borderRadius: '8px',
      color: 'white',
      fontSize: '0.875rem',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none'
    }
  };

  const globalStyles = `
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .batch-view-btn:hover {
      background: #f9fafb;
      border-color: #d1d5db;
      transform: translateY(-1px);
    }
    
    .batch-view-btn:active {
      transform: translateY(0);
    }
    
    .batch-edit-btn:hover {
      background: #e5e7eb;
      transform: translateY(-1px);
    }
    
    .batch-edit-btn:active {
      transform: translateY(0);
    }
    
    .batch-delete-btn:hover {
      background: #fee2e2;
      transform: translateY(-1px);
    }
    
    .batch-delete-btn:active {
      transform: translateY(0);
    }
    
    .batch-meeting-link:hover {
      color: #4f46e5;
      gap: 12px;
    }
  `;

  return (
    <>
      <style>{globalStyles}</style>
      <div style={styles.container}>
        <div style={styles.grid}>
          {batches.map((batch) => {
            const progress = calculateProgress(batch.currentStudents, batch.maxStudents);
            const statusColor = getStatusColor(batch.status);
            const isHovered = hoveredCard === batch.id;
            const isDeleting = showDeleteConfirm === batch.id;
            
            return (
              <div 
                key={batch.id}
                style={{
                  ...styles.card(batch.id),
                  transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
                  boxShadow: isHovered ? '0 12px 32px rgba(0, 0, 0, 0.12)' : '0 4px 20px rgba(0, 0, 0, 0.08)',
                  borderColor: isHovered ? '#d1d5db' : '#e5e7eb'
                }}
                onMouseEnter={() => setHoveredCard(batch.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* {isDeleting && (
                  <div style={styles.deleteConfirm}>
                    <div style={styles.deleteText}>
                      <div style={styles.deleteTitle}>Delete Batch?</div>
                      <div style={styles.deleteSubtitle}>
                        Are you sure you want to delete "{batch.batchName}"? This action cannot be undone.
                      </div>
                    </div>
                    <div style={styles.deleteActions}>
                      <button 
                        style={styles.cancelButton}
                        onClick={handleCancelDelete}
                        className="batch-cancel-delete"
                      >
                        Cancel
                      </button>
                      <button 
                        style={styles.confirmDeleteButton}
                        onClick={() => handleConfirmDelete(batch.id)}
                        className="batch-confirm-delete"
                      >
                        Delete Batch
                      </button>
                    </div>
                  </div>
                )}
                 */}
                <div style={{ ...styles.cardBefore(isHovered) }} />
                
                <div style={styles.titleWrapper}>
                  <h3 style={styles.title}>{batch.batchName}</h3>
                  <span style={styles.status(batch.status)}>
                    {batch.status}
                  </span>
                </div>
                
                <div style={styles.schedule}>
                  <div style={styles.scheduleItem}>
                    <svg style={styles.scheduleIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
                      <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2"/>
                      <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2"/>
                      <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"/>
                    </svg>
                    <span>{batch.schedule.day}</span>
                  </div>
                  <div style={styles.scheduleItem}>
                    <svg style={styles.scheduleIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                      <polyline points="12 6 12 12 16 14" strokeWidth="2"/>
                    </svg>
                    <span>{formatTime(batch.schedule.startTime)} - {formatTime(batch.schedule.endTime)}</span>
                  </div>
                </div>

                <div style={{
                  ...styles.dates,
                  background: isHovered ? '#f3f4f6' : '#f9fafb'
                }}>
                  <svg style={styles.dateIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2"/>
                  </svg>
                  <span>{formatDate(batch.startDate)} to {formatDate(batch.endDate)}</span>
                </div>

                <div style={{
                  ...styles.students,
                  borderColor: isHovered ? '#cbd5e1' : '#e2e8f0'
                }}>
                  <div style={styles.studentsHeader}>
                    <div style={styles.studentsInfo}>
                      <svg style={styles.studentsIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeWidth="2"/>
                        <circle cx="9" cy="7" r="4" strokeWidth="2"/>
                        <path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75" strokeWidth="2"/>
                      </svg>
                      <div>
                        <span style={styles.studentCount}>{batch.currentStudents}</span>
                        <span style={styles.studentTotal}>/{batch.maxStudents} students</span>
                      </div>
                    </div>
                    <button 
                      className="batch-view-btn"
                      style={styles.viewButton}
                      onClick={() => onViewStudents(batch)}
                    >
                      <svg className="batch-eye-icon" style={styles.eyeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="3" strokeWidth="2"/>
                      </svg>
                      View Students
                    </button>
                  </div>
                  
                  <div style={styles.progressBar}>
                    <div 
                      style={styles.progressFill(progress, statusColor)}
                    ></div>
                  </div>
                </div>

                {batch.meetingLink && (
                  <a 
                    href={batch.meetingLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="batch-meeting-link"
                    style={styles.meetingLink}
                  >
                    <svg style={styles.linkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" strokeWidth="2"/>
                      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" strokeWidth="2"/>
                    </svg>
                    Join Class
                  </a>
                )}

                <div style={styles.actions}>
                  {/* <button 
                    className="batch-edit-btn"
                    style={{...styles.actionButton, ...styles.editButton}}
                    onClick={() => onEditBatch(batch)}
                  >
                    <svg style={{width: '14px', height: '14px', strokeWidth: '2px'}} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeWidth="2"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2"/>
                    </svg>
                    Edit
                  </button> */}
                  {/* <button 
                    className="batch-delete-btn"
                    style={{...styles.actionButton, ...styles.deleteButton}}
                    onClick={(e) => handleDeleteClick(e, batch.id)}
                  > */}
                    {/* <svg style={{width: '14px', height: '14px', strokeWidth: '2px'}} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeWidth="2"/>
                    </svg>
                    Delete
                  </button> */}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default BatchList;