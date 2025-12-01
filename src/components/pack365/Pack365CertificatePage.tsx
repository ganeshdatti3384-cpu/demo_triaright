import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  ArrowLeft, 
  Award, 
  Calendar, 
  User, 
  BookOpen, 
  CheckCircle2,
  Loader2,
  Share2,
  Printer
} from 'lucide-react';
import { pack365Api } from '@/services/api';
import Navbar from '@/components/Navbar';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CertificateData {
  studentName: string;
  email: string;
  phoneNumber: string;
  courseId: string;
  courseName: string;
  courseDescription: string;
  stream: string;
  enrollmentDate: string;
  completedDate: string;
  examScore?: number;
}

const Pack365CertificatePage: React.FC = () => {
  const { enrollmentId: paramEnrollmentId } = useParams<{ enrollmentId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get enrollmentId from params, state, or query
  const enrollmentIdFromState = (location.state as any)?.enrollmentId;
  const enrollmentIdFromQuery = new URLSearchParams(location.search).get('enrollmentId');
  const enrollmentId = paramEnrollmentId || enrollmentIdFromState || enrollmentIdFromQuery;

  const [loading, setLoading] = useState(true);
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    const loadCertificateData = async () => {
      if (!enrollmentId) {
        setError('No enrollment ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          toast({ title: 'Authentication required', variant: 'destructive' });
          navigate('/login');
          return;
        }

        // First, get enrollment details
        const enrollmentResponse = await pack365Api.getMyEnrollments(token);
        const enrollments = enrollmentResponse.enrollments || [];
        
        // Find the specific enrollment
        const enrollment = enrollments.find((e: any) => 
          e.normalizedEnrollmentId === enrollmentId || 
          e._id === enrollmentId ||
          e.enrollmentId === enrollmentId
        );

        if (!enrollment) {
          setError('Enrollment not found');
          setLoading(false);
          return;
        }

        // Get course completion date (use current date as fallback)
        const completedDate = new Date().toISOString();

        // Fetch certificate data from backend
        const certificateResponse = await fetchCertificateData(token, enrollment, completedDate);
        
        if (certificateResponse.success) {
          setCertificateData(certificateResponse.data);
        } else {
          throw new Error(certificateResponse.message || 'Failed to load certificate data');
        }

      } catch (err: any) {
        console.error('Error loading certificate:', err);
        setError(err.message || 'Failed to load certificate data');
        toast({
          title: 'Error',
          description: 'Failed to load certificate data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadCertificateData();
  }, [enrollmentId, navigate, toast]);

  const fetchCertificateData = async (token: string, enrollment: any, completedDate: string) => {
    try {
      // Try to get certificate data from the new endpoint
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'https://dev.triaright.com/api'}/pack365/enrollment/certificate/data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          enrollmentId: enrollment._id || enrollment.normalizedEnrollmentId,
          completedDate: completedDate
        })
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('Certificate endpoint not available, using fallback');
    }

    // Fallback: Construct certificate data from enrollment
    const course = enrollment.courses?.[0] || {};
    return {
      success: true,
      data: {
        studentName: enrollment.studentName || 'Student Name',
        email: enrollment.email || '',
        phoneNumber: enrollment.phoneNumber || '',
        courseId: course.courseId || 'N/A',
        courseName: course.courseName || 'Pack365 Course',
        courseDescription: course.description || '',
        stream: enrollment.stream || '',
        enrollmentDate: enrollment.enrollmentDate || new Date().toISOString(),
        completedDate: completedDate,
        examScore: enrollment.examScore || enrollment.bestExamScore || 0
      }
    };
  };

  const handleDownloadPDF = async () => {
    if (!certificateData || downloading) return;

    try {
      setDownloading(true);
      const certificateElement = document.getElementById('certificate-content');
      
      if (!certificateElement) {
        throw new Error('Certificate element not found');
      }

      // Use html2canvas to capture the certificate
      const canvas = await html2canvas(certificateElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 297; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Pack365-Certificate-${certificateData.courseName}-${certificateData.studentName}.pdf`);

      toast({
        title: 'Download Complete',
        description: 'Certificate downloaded successfully',
        variant: 'default'
      });
    } catch (err: any) {
      console.error('Download error:', err);
      toast({
        title: 'Download Failed',
        description: 'Failed to download certificate',
        variant: 'destructive'
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!certificateData || sharing) return;

    try {
      setSharing(true);
      
      // Capture certificate as image
      const certificateElement = document.getElementById('certificate-content');
      if (!certificateElement) return;

      const canvas = await html2canvas(certificateElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const file = new File([blob], `certificate-${certificateData.studentName}.png`, {
          type: 'image/png'
        });

        if (navigator.share && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: `My Pack365 Certificate: ${certificateData.courseName}`,
              text: `I just completed ${certificateData.courseName} on Pack365!`
            });
          } catch (shareErr) {
            console.log('Sharing cancelled or failed');
          }
        } else {
          // Fallback: Copy image to clipboard
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            toast({
              title: 'Copied to Clipboard',
              description: 'Certificate image copied to clipboard',
              variant: 'default'
            });
          } catch (clipboardErr) {
            toast({
              title: 'Share Unavailable',
              description: 'Sharing not supported on this device',
              variant: 'destructive'
            });
          }
        }
      }, 'image/png');
    } catch (err) {
      console.error('Share error:', err);
      toast({
        title: 'Share Failed',
        description: 'Failed to share certificate',
        variant: 'destructive'
      });
    } finally {
      setSharing(false);
    }
  };

  const handlePrint = () => {
    const certificateElement = document.getElementById('certificate-content');
    if (!certificateElement) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: 'Print Failed',
        description: 'Please allow popups to print',
        variant: 'destructive'
      });
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Pack365 Certificate - ${certificateData?.courseName}</title>
          <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            .certificate { 
              border: 3px solid #1e40af; 
              padding: 40px; 
              text-align: center;
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            }
            .logo { font-size: 48px; color: #1e40af; margin-bottom: 20px; }
            .title { font-size: 36px; color: #1e40af; margin-bottom: 30px; font-weight: bold; }
            .subtitle { font-size: 24px; color: #374151; margin-bottom: 40px; }
            .student-name { font-size: 32px; color: #1e40af; margin: 30px 0; font-weight: bold; }
            .course-name { font-size: 28px; color: #374151; margin-bottom: 20px; }
            .details { font-size: 18px; color: #4b5563; margin: 20px 0; }
            .date { font-size: 16px; color: #6b7280; margin-top: 40px; }
            .signature { margin-top: 60px; border-top: 2px solid #1e40af; padding-top: 20px; }
            @media print {
              body { -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${certificateElement.outerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading certificate...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !certificateData) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <div className="text-center">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Certificate Not Available</h2>
                <p className="text-gray-600 mb-4">
                  {error || 'Certificate data not found. Please ensure you have completed the course exam.'}
                </p>
                <div className="space-x-2">
                  <Button onClick={() => navigate(-1)} variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                  </Button>
                  <Button onClick={() => navigate('/pack365-dashboard')} variant="default">
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Course Certificate</h1>
                <p className="text-gray-600 mt-2">
                  Official certificate of completion for {certificateData.courseName}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified Certificate
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {certificateData.stream} Stream
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Certificate Display */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-6 w-6" />
                    Certificate of Completion
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Certificate Content */}
                  <div 
                    id="certificate-content"
                    className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-[500px] flex flex-col items-center justify-center"
                  >
                    {/* Decorative Border */}
                    <div className="absolute top-4 left-4 right-4 bottom-4 border-4 border-blue-300 border-dashed rounded-lg pointer-events-none"></div>
                    
                    {/* Certificate Design */}
                    <div className="text-center relative z-10 max-w-2xl">
                      {/* Logo/Header */}
                      <div className="mb-8">
                        <div className="text-5xl font-bold text-blue-600 mb-2">Pack365</div>
                        <div className="text-lg text-gray-600">Skill Development Platform</div>
                      </div>

                      {/* Title */}
                      <div className="mb-10">
                        <div className="text-4xl font-bold text-gray-900 mb-2">
                          CERTIFICATE OF COMPLETION
                        </div>
                        <div className="text-lg text-gray-600">
                          This is to certify that
                        </div>
                      </div>

                      {/* Student Name */}
                      <div className="my-10">
                        <div className="text-3xl font-bold text-blue-700 py-4 px-8 border-t-2 border-b-2 border-blue-300 inline-block">
                          {certificateData.studentName}
                        </div>
                      </div>

                      {/* Course Details */}
                      <div className="mb-8">
                        <div className="text-xl text-gray-700 mb-4">
                          has successfully completed the course
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-2">
                          {certificateData.courseName}
                        </div>
                        <div className="text-lg text-gray-600 mb-4">
                          {certificateData.courseDescription}
                        </div>
                        <div className="text-md text-gray-500">
                          {certificateData.stream} Stream • Pack365
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-2 gap-8 mt-12 pt-8 border-t border-gray-300">
                        <div className="text-center">
                          <div className="text-sm text-gray-500 mb-1">Enrollment Date</div>
                          <div className="font-semibold">
                            {new Date(certificateData.enrollmentDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-500 mb-1">Completion Date</div>
                          <div className="font-semibold">
                            {new Date(certificateData.completedDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {/* Signature Area */}
                      <div className="mt-16 pt-8 border-t border-gray-400">
                        <div className="flex justify-between items-end">
                          <div className="text-center">
                            <div className="font-semibold text-gray-900">Triple A Education</div>
                            <div className="text-sm text-gray-600">Authorized Signature</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-gray-900">Pack365</div>
                            <div className="text-sm text-gray-600">Verified & Issued</div>
                          </div>
                        </div>
                      </div>

                      {/* Certificate ID */}
                      <div className="mt-8 text-sm text-gray-500">
                        Certificate ID: {certificateData.courseId}-{new Date(certificateData.completedDate).getTime()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions Panel */}
            <div>
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Certificate Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button
                      onClick={handleDownloadPDF}
                      className="w-full flex items-center justify-center gap-2"
                      variant="default"
                      disabled={downloading}
                    >
                      {downloading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      Download PDF Certificate
                    </Button>

                    <Button
                      onClick={handlePrint}
                      className="w-full flex items-center justify-center gap-2"
                      variant="outline"
                    >
                      <Printer className="h-4 w-4" />
                      Print Certificate
                    </Button>

                    <Button
                      onClick={handleShare}
                      className="w-full flex items-center justify-center gap-2"
                      variant="outline"
                      disabled={sharing}
                    >
                      {sharing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Share2 className="h-4 w-4" />
                      )}
                      Share Certificate
                    </Button>
                  </div>

                  {/* Certificate Details */}
                  <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-3">Certificate Details</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Recipient:</span>
                        <span className="font-medium">{certificateData.studentName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Course:</span>
                        <span className="font-medium">{certificateData.courseName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Completed:</span>
                        <span className="font-medium">
                          {new Date(certificateData.completedDate).toLocaleDateString()}
                        </span>
                      </div>
                      {certificateData.examScore && (
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-yellow-500" />
                          <span className="text-gray-600">Exam Score:</span>
                          <span className="font-medium">{certificateData.examScore}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Verification Info */}
                  <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-2">Verification</h3>
                    <p className="text-sm text-gray-600">
                      This certificate is digitally verified and can be validated through the Pack365 platform.
                    </p>
                    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-center">
                      <CheckCircle2 className="h-4 w-4 text-green-600 inline-block mr-1" />
                      <span className="text-sm text-green-700">Verified & Authentic</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Pack365CertificatePage;
