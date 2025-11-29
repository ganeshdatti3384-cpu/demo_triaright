// components/student/APCertificateGenerator.tsx
import React, { useRef, useState } from 'react';

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

interface Props {
  enrollmentId: string;
}

const APCertificateGenerator: React.FC<Props> = ({ enrollmentId }) => {
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateCertificate = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/internships/apinternshipcertificate/${enrollmentId}`,
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
    // Clear canvas
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

  const downloadCertificate = () => {
    if (!canvasRef.current || !certificateData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size and draw
    canvas.width = 1200;
    canvas.height = 848;
    drawCertificate(ctx, certificateData);

    // Download
    const link = document.createElement('a');
    link.download = `certificate-${certificateData.certificateId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

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

  return (
    <div className="max-w-4xl mx-auto p-4">
      {!certificateData ? (
        <div className="text-center bg-gray-50 rounded-lg p-8 border-2 border-dashed border-gray-300">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Generate Certificate</h2>
          <p className="text-gray-600 mb-6">Click below to generate your internship certificate</p>
          <button 
            onClick={generateCertificate}
            className="bg-gradient-to-r from-blue-700 to-blue-800 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
          >
            Generate Certificate
          </button>
        </div>
      ) : (
        <div>
          <div className="flex gap-4 justify-center mb-6 flex-wrap">
            <button 
              onClick={downloadCertificate}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
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
              onClick={() => setCertificateData(null)}
              className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
            >
              Generate New
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <canvas 
              ref={canvasRef}
              className="w-full h-auto border border-gray-300 rounded"
              style={{ width: '100%', height: 'auto', maxWidth: '1200px' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default APCertificateGenerator;
