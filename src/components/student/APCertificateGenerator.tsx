// components/student/APCertificateGenerator.tsx
import React, { useRef, useState, useEffect } from 'react';

interface CertificateData {
  studentName: string;
  studentEmail: string;
  college: string;
  courseTitle: string;
  stream: string;
  providerName: string;
  instructorName: string;
  internshipTitle: string;
  companyName: string;
  internshipDuration: string;
  enrollmentDate: string;
  completionDate: string;
  enrollmentType: string;
  completionPercentage: string;
  certificateId: string;
}

interface Enrollment {
  _id: string;
  completionPercentage: number;
  courseId: {
    title: string;
  };
}

interface Props {
  enrollment: Enrollment;
}

const APCertificateGenerator: React.FC<Props> = ({ enrollment }) => {
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  const generateCertificate = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/internships/apinternshipcertificate/${enrollment._id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to generate certificate');
      
      const data = await response.json();
      setCertificateData(data.certificateData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate certificate');
    } finally {
      setLoading(false);
    }
  };

  const drawCertificate = (ctx: CanvasRenderingContext2D, data: CertificateData) => {
    // Set canvas background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Gold border
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, ctx.canvas.width - 40, ctx.canvas.height - 40);

    // Blue inner border
    ctx.strokeStyle = '#1a237e';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, ctx.canvas.width - 80, ctx.canvas.height - 80);

    // Header
    ctx.fillStyle = '#1a237e';
    ctx.font = 'bold 48px "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.fillText('TRIARIGHT', ctx.canvas.width / 2, 100);

    // Subheader
    ctx.fillStyle = '#d4af37';
    ctx.font = 'italic 24px "Times New Roman", serif';
    ctx.fillText('THE NEW ERA OF LEARNING', ctx.canvas.width / 2, 140);

    // Certificate Title
    ctx.fillStyle = '#1a237e';
    ctx.font = 'bold 36px "Times New Roman", serif';
    ctx.fillText('CERTIFICATE OF COMPLETION', ctx.canvas.width / 2, 220);

    // Presented to
    ctx.fillStyle = '#333333';
    ctx.font = '24px "Times New Roman", serif';
    ctx.fillText('This certificate is proudly presented to', ctx.canvas.width / 2, 280);

    // Student Name
    ctx.fillStyle = '#1a237e';
    ctx.font = 'bold 42px "Times New Roman", serif';
    ctx.fillText(data.studentName.toUpperCase(), ctx.canvas.width / 2, 340);

    // Completion details
    ctx.fillStyle = '#333333';
    ctx.font = '20px "Times New Roman", serif';
    ctx.fillText('has successfully completed the', ctx.canvas.width / 2, 390);

    // Course Title
    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 28px "Times New Roman", serif';
    ctx.fillText(data.courseTitle, ctx.canvas.width / 2, 430);

    // Internship details
    ctx.fillStyle = '#333333';
    ctx.font = '20px "Times New Roman", serif';
    ctx.fillText(`Internship: ${data.internshipTitle}`, ctx.canvas.width / 2, 470);
    ctx.fillText(`at ${data.companyName}`, ctx.canvas.width / 2, 500);

    // Duration and completion
    ctx.fillStyle = '#666666';
    ctx.font = '18px "Times New Roman", serif';
    ctx.fillText(`Duration: ${data.internshipDuration} | Completion: ${data.completionPercentage}%`, ctx.canvas.width / 2, 540);

    // Footer section
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ctx.canvas.width / 4, 620);
    ctx.lineTo((3 * ctx.canvas.width) / 4, 620);
    ctx.stroke();

    // Date and Certificate No
    ctx.fillStyle = '#333333';
    ctx.font = '16px "Times New Roman", serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Date of issue: ${new Date(data.completionDate).toLocaleDateString()}`, 100, 660);
    ctx.fillText(`Certificate no: ${data.certificateId}`, 100, 685);

    // Contact info
    ctx.textAlign = 'right';
    ctx.fillText('Mail id: info@triaright.com', ctx.canvas.width - 100, 660);
    ctx.fillText('contact: 9059373300', ctx.canvas.width - 100, 685);

    // Founder signature
    ctx.textAlign = 'center';
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 20px "Times New Roman", serif';
    ctx.fillText('KISSHORE KUMAAR', ctx.canvas.width / 2, 750);
    ctx.font = '18px "Times New Roman", serif';
    ctx.fillText('Founder & Director - Triaright', ctx.canvas.width / 2, 780);

    // Address
    ctx.font = '14px "Times New Roman", serif';
    ctx.fillText('7-1-58, 404B, 4th Floor, Surekha Chambers, Ameerpet, Hyderabad, Telangana - 500016', ctx.canvas.width / 2, 810);
  };

  // Initialize canvas when certificate data is available
  useEffect(() => {
    if (certificateData && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Set display size (smaller for preview)
        canvas.width = 800;
        canvas.height = 565;
        drawCertificate(ctx, certificateData);
        setIsCanvasReady(true);
      }
    }
  }, [certificateData]);

  const downloadCertificate = () => {
    if (!certificateData) return;

    // Create a temporary canvas for high-quality download
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) return;

    // Set high resolution for download
    tempCanvas.width = 1200;
    tempCanvas.height = 848;
    drawCertificate(tempCtx, certificateData);

    // Download
    const link = document.createElement('a');
    link.download = `certificate-${certificateData.certificateId}.png`;
    link.href = tempCanvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Progress section component
  const ProgressSection = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold mb-4">Your Progress</h3>
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span>Completion</span>
          <span>{enrollment.completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full" 
            style={{ width: `${enrollment.completionPercentage}%` }}
          ></div>
        </div>
      </div>
      
      {enrollment.completionPercentage >= 80 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Certificate Available!</h4>
          <p className="text-blue-600 mb-4">
            You've completed {enrollment.completionPercentage}% of "{enrollment.courseId.title}".
            Generate your certificate now.
          </p>
          <button 
            onClick={generateCertificate}
            disabled={loading}
            className="bg-gradient-to-r from-blue-700 to-blue-800 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : 'Generate Certificate'}
          </button>
        </div>
      )}

      {enrollment.completionPercentage < 80 && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">Certificate Not Available Yet</h4>
          <p className="text-yellow-600">
            You need to complete at least 80% of the course to generate your certificate. 
            Current progress: {enrollment.completionPercentage}%
          </p>
        </div>
      )}
    </div>
  );

  // Certificate generation section
  const CertificateSection = () => {
    if (loading) {
      return (
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Generating Certificate...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-red-800 font-semibold mb-2">Certificate Not Available</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={generateCertificate}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (!certificateData) {
      return null;
    }

    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-4 justify-center mb-6 flex-wrap">
          <button 
            onClick={downloadCertificate}
            disabled={!isCanvasReady}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Download Certificate
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Print Certificate
          </button>
          <button 
            onClick={() => {
              setCertificateData(null);
              setIsCanvasReady(false);
            }}
            className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
          >
            Generate New
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="border-2 border-gray-200 rounded-lg p-2 bg-white">
            <canvas 
              ref={canvasRef}
              className="w-full h-auto mx-auto"
            />
          </div>
          
          {/* Certificate details */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-3">Certificate Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Certificate ID:</strong> {certificateData.certificateId}</p>
                <p><strong>Student Name:</strong> {certificateData.studentName}</p>
                <p><strong>Course:</strong> {certificateData.courseTitle}</p>
                <p><strong>Internship:</strong> {certificateData.internshipTitle}</p>
              </div>
              <div>
                <p><strong>Company:</strong> {certificateData.companyName}</p>
                <p><strong>Completion:</strong> {certificateData.completionPercentage}%</p>
                <p><strong>Issue Date:</strong> {new Date(certificateData.completionDate).toLocaleDateString()}</p>
                <p><strong>Provider:</strong> {certificateData.providerName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <ProgressSection />
      <CertificateSection />
    </div>
  );
};

export default APCertificateGenerator;
