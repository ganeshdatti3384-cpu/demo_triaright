// components/student/LiveCertificateGenerator.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface CertificateData {
  studentName: string;
  courseTitle: string;
  stream: string;
  internshipDuration: string;
  enrollmentDate: string;
  completionDate: string;
  certificateId: string;
}

const LiveCertificateGenerator: React.FC = () => {
  const { enrollmentId } = useParams();
  const navigate = useNavigate();

  const [certificateData, setCertificateData] =
    useState<CertificateData | null>(null);

  useEffect(() => {
    fetchCertificate();
  }, []);

  // 🔹 ONLY DATA MAPPING (nothing else)
  const mapCertificateData = (apiData: any): CertificateData => ({
    studentName: apiData.userDetails.fullName,
    courseTitle: apiData.courseDetails.courseName,
    stream: apiData.courseDetails.category || '',
    internshipDuration: `${apiData.courseDetails.duration.value} ${apiData.courseDetails.duration.unit}`,
    enrollmentDate: apiData.enrollmentDetails.enrollmentDate,
    completionDate: apiData.certificateIssueDate,
    certificateId: apiData.enrollmentId,
  });

  const fetchCertificate = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const res = await fetch(
        `https://triaright.com/api/livecourses/${enrollmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message);
      }

      setCertificateData(mapCertificateData(json.data));
    } catch (err) {
      console.error(err);
    }
  };

  // ⛔ until data loads
  if (!certificateData) return null;

  // ⬇⬇⬇ BELOW IS 100% YOUR ORIGINAL JSX (UNCHANGED) ⬇⬇⬇

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const year = date.getFullYear();
    const suffix =
      day === 1 || day === 21 || day === 31
        ? 'st'
        : day === 2 || day === 22
        ? 'nd'
        : day === 3 || day === 23
        ? 'rd'
        : 'th';
    return `${day}${suffix} ${month} ${year}`;
  };


  return (
    <div 
      className="certificate-container"
      style={{
        width: '210mm',
        height: '297mm',
         backgroundImage: 'url(/lovable-uploads/livecertificate-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        paddingTop: '60mm',
        paddingBottom: '20mm',
        paddingLeft:'32mm',
        boxSizing: 'border-box',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <div 
        className="content-box"
        style={{
          maxWidth: '80%',
          paddingBottom: '93px',
          color: '#000'
        }}
      >
        <h1 
          style={{
            fontSize: '26pt',
            marginBottom: '20pt',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            letterSpacing: '1px'
          }}
        >
          Course Completion Certificate
        </h1>
        
        <p 
          style={{
            fontSize: '13pt',
            lineHeight: '1.8',
            marginBottom: '16pt'
          }}
        >
          This is to certify that <strong>{certificateData.studentName}</strong> has actively participated and successfully completed the live training course titled <strong>"{certificateData.courseTitle}"</strong> conducted by <strong>Triaright Solutions Pvt. Ltd.</strong>.
        </p>
        
        <p 
          style={{
            fontSize: '13pt',
            lineHeight: '1.8',
            marginBottom: '16pt'
          }}
        >
          The course was conducted from <strong>{formatDate(certificateData.enrollmentDate)}</strong> to <strong>{formatDate(certificateData.completionDate)}</strong> and involved hands-on sessions, live projects, group discussions, and practical coding challenges that enhanced the participant's skillset and real-world development capabilities.
        </p>
        
        <p 
          className="closing"
          style={{
            fontSize: '13pt',
            lineHeight: '1.8',
            marginBottom: '16pt',
            fontStyle: 'normal'
          }}
        >
          We congratulate the learner on their achievement and wish them continued success in their career journey.
        </p>

     {/* Bottom Left Details */}
<div
  style={{
    position: 'absolute', bottom: '55mm', left: '25mm', textAlign: 'left', fontSize: '10.5pt', lineHeight: '1.6', color: '#000'
  }}
>
  <p>
    <strong>Date of Issue:</strong>{' '}
    {formatDate(certificateData.completionDate)}
  </p>
  <p>
    <strong>Certificate ID:</strong>{' '}
    {certificateData.certificateId}
  </p>
  <p>
    <strong>Email ID:</strong>{' '}
    info@triaright.com
  </p>
  <p>
    <strong>Contact Number:</strong>{' '}
    +91-8008627750
  </p>

  {/* Horizontal Line */}
  <div
    style={{
     width: '160mm',
    height: '1px',
    backgroundColor: '#000',
    bottom: '25mm',
    left: '50%',
    // top:'100mm',
    // transform: 'translateX(-50%)'
    }}
  />

  
</div>
<div
 style={{
    position: 'absolute', bottom: '15mm', left: '75mm', textAlign: 'left', fontSize: '10.5pt', lineHeight: '1.6', color: '#000'
  }}
>
  {/* Address */} <p style={{ fontSize: '10pt', top: '10mm' }}> Kondapur, Hyderabad, Telangana - 500084 </p>

</div>
</div>

      
    </div>
  );
};

export default LiveCertificateGenerator;