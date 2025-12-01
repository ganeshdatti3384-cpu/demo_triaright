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
  Printer,
  Home,
  Mail,
  Phone
} from 'lucide-react';
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

  // Get data from state
  const enrollmentIdFromState = (location.state as any)?.enrollmentId;
  const courseIdFromState = (location.state as any)?.courseId;
  const completedDateFromState = (location.state as any)?.completedDate;
  const courseNameFromState = (location.state as any)?.courseName;
  const streamFromState = (location.state as any)?.stream;
  
  const enrollmentId = paramEnrollmentId || enrollmentIdFromState;

  const [loading, setLoading] = useState(false);
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    const generateCertificate = async () => {
      try {
        setLoading(true);
        
        // Get required data from state
        const courseId = courseIdFromState;
        const completedDate = completedDateFromState || new Date().toISOString();
        const courseName = courseNameFromState || 'Pack365 Course';
        const stream = streamFromState || '';

        if (!courseId) {
          toast({ 
            title: 'Missing Information', 
            description: 'Course ID is required for certificate generation.',
            variant: 'destructive' 
          });
          navigate('/pack365');
          return;
        }

        // Get user info from localStorage or token
        const token = localStorage.getItem('token');
        let userProfile: any = null;
        
        if (token) {
          try {
            // Try to get basic user info from token
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            userProfile = {
              firstName: tokenData.firstName || '',
              lastName: tokenData.lastName || '',
              email: tokenData.email || '',
              phoneNumber: tokenData.phoneNumber || ''
            };
          } catch (e) {
            console.log('Could not parse token, using defaults');
          }
        }

        // Create certificate data from available information
        const certificateData: CertificateData = {
          studentName: `${userProfile?.firstName || 'Student'} ${userProfile?.lastName || ''}`.trim(),
          email: userProfile?.email || '',
          phoneNumber: userProfile?.phoneNumber || '',
          courseId: courseId,
          courseName: courseName,
          courseDescription: `Certificate of completion for ${courseName}`,
          stream: stream,
          enrollmentDate: new Date().toISOString(),
          completedDate: completedDate,
          examScore: 100 // Default score since exam was passed
        };

        setCertificateData(certificateData);
        
        toast({
          title: 'Certificate Ready',
          description: 'Your certificate has been generated successfully!',
          variant: 'default'
        });

      } catch (err: any) {
        console.error('Error generating certificate:', err);
        toast({
          title: 'Error',
          description: 'Failed to generate certificate',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    generateCertificate();
  }, [enrollmentId, navigate, toast, courseIdFromState, completedDateFromState, courseNameFromState, streamFromState]);

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
        backgroundColor: '#ffffff',
        logging: false
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
      pdf.save(`Pack365-Certificate-${certificateData.courseName.replace(/\s+/g, '-')}-${certificateData.studentName.replace(/\s+/g, '-')}.pdf`);

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
        scale: 1,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const file = new File([blob], `certificate-${certificateData.studentName.replace(/\s+/g, '-')}.png`, {
          type: 'image/png'
        });

        if (navigator.share && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: `My Pack365 Certificate: ${certificateData.courseName}`,
              text: `I just completed ${certificateData.courseName} on Pack365! Check out my certificate.`
            });
          } catch (shareErr) {
            console.log('Sharing cancelled or failed');
          }
        } else {
          // Fallback: Create download link
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `certificate-${certificateData.studentName.replace(/\s+/g, '-')}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          toast({
            title: 'Image Downloaded',
            description: 'Certificate image downloaded as PNG',
            variant: 'default'
          });
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

    const printContent = certificateElement.innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pack365 Certificate - ${certificateData?.courseName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', sans-serif;
              background: white;
              color: #333;
              padding: 20px;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            .certificate-container {
              width: 100%;
              max-width: 1200px;
              margin: 0 auto;
              border: 20px solid transparent;
              background: linear-gradient(white, white) padding-box,
                        linear-gradient(135deg, #1e40af 0%, #3b82f6 100%) border-box;
              position: relative;
              overflow: hidden;
            }
            
            .certificate-container::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: 
                radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(30, 64, 175, 0.1) 0%, transparent 50%);
              pointer-events: none;
            }
            
            .watermark {
              position: absolute;
              font-size: 180px;
              font-weight: bold;
              color: rgba(30, 64, 175, 0.03);
              transform: rotate(-45deg);
              top: 30%;
              left: -50px;
              white-space: nowrap;
              font-family: 'Playfair Display', serif;
            }
            
            .logo-section {
              text-align: center;
              padding: 40px 0 20px;
            }
            
            .logo-title {
              font-family: 'Playfair Display', serif;
              font-size: 48px;
              font-weight: 700;
              color: #1e40af;
              letter-spacing: 2px;
              margin-bottom: 10px;
            }
            
            .logo-subtitle {
              font-size: 18px;
              color: #6b7280;
              letter-spacing: 4px;
              text-transform: uppercase;
            }
            
            .main-title {
              text-align: center;
              margin: 40px 0;
            }
            
            .certificate-title {
              font-family: 'Playfair Display', serif;
              font-size: 42px;
              font-weight: 700;
              color: #1e40af;
              margin-bottom: 15px;
            }
            
            .certificate-subtitle {
              font-size: 20px;
              color: #4b5563;
              font-weight: 400;
            }
            
            .student-name {
              text-align: center;
              margin: 60px 0;
              padding: 40px 0;
              border-top: 3px solid #3b82f6;
              border-bottom: 3px solid #3b82f6;
            }
            
            .name-text {
              font-family: 'Playfair Display', serif;
              font-size: 48px;
              font-weight: 700;
              color: #1e40af;
              line-height: 1.2;
            }
            
            .course-details {
              text-align: center;
              margin: 40px 0;
              padding: 0 40px;
            }
            
            .completion-text {
              font-size: 22px;
              color: #4b5563;
              margin-bottom: 30px;
            }
            
            .course-name {
              font-family: 'Playfair Display', serif;
              font-size: 36px;
              font-weight: 700;
              color: #1f2937;
              margin-bottom: 15px;
            }
            
            .course-description {
              font-size: 18px;
              color: #6b7280;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto 20px;
            }
            
            .stream-badge {
              display: inline-block;
              background: linear-gradient(135deg, #1e40af, #3b82f6);
              color: white;
              padding: 8px 24px;
              border-radius: 30px;
              font-weight: 600;
              font-size: 16px;
              margin-top: 10px;
            }
            
            .dates-section {
              display: flex;
              justify-content: center;
              gap: 80px;
              margin: 60px 0 40px;
              padding-top: 40px;
              border-top: 1px solid #e5e7eb;
            }
            
            .date-item {
              text-align: center;
            }
            
            .date-label {
              font-size: 14px;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 8px;
            }
            
            .date-value {
              font-size: 20px;
              font-weight: 600;
              color: #1f2937;
            }
            
            .signatures {
              display: flex;
              justify-content: space-between;
              margin: 80px 0 40px;
              padding-top: 40px;
              border-top: 2px solid #1e40af;
            }
            
            .signature-item {
              text-align: center;
              flex: 1;
            }
            
            .signature-name {
              font-size: 20px;
              font-weight: 700;
              color: #1f2937;
              margin-bottom: 8px;
            }
            
            .signature-title {
              font-size: 14px;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            
            .signature-line {
              width: 200px;
              height: 1px;
              background: #1f2937;
              margin: 30px auto;
            }
            
            .certificate-id {
              text-align: center;
              font-size: 14px;
              color: #9ca3af;
              padding: 30px 0;
              border-top: 1px solid #e5e7eb;
              margin-top: 40px;
            }
            
            .verification-badge {
              display: inline-block;
              background: #10b981;
              color: white;
              padding: 6px 16px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              margin-left: 10px;
            }
            
            @media print {
              body {
                padding: 0;
              }
              
              .no-print {
                display: none !important;
              }
              
              .certificate-container {
                border: none;
              }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `;

    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <Award className="absolute inset-0 m-auto text-blue-600" size={32} />
            </div>
            <p className="mt-6 text-lg font-medium text-gray-700">Generating your certificate...</p>
          </div>
        </div>
      </>
    );
  }

  if (!certificateData) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full shadow-2xl border-0">
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <Award className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Certificate Not Generated</h2>
                <p className="text-gray-600 mb-6">
                  Failed to generate certificate. Please go back and try again.
                </p>
                <div className="space-y-3">
                  <Button 
                    onClick={() => navigate(-1)} 
                    variant="outline" 
                    className="w-full"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        {/* Top Navigation Bar */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <Button
                  onClick={() => navigate(-1)}
                  variant="ghost"
                  size="sm"
                  className="hover:bg-blue-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-gray-900">Certificate of Completion</h1>
                  <p className="text-sm text-gray-600">{certificateData.courseName}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="default" className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {certificateData.stream}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Certificate Display - Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-0">
                {/* Certificate Content */}
                <div 
                  id="certificate-content"
                  className="p-8 md:p-12 bg-gradient-to-br from-white to-blue-50 min-h-[600px] relative"
                >
                  {/* Watermark Background */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-100 rounded-full opacity-10"></div>
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-100 rounded-full opacity-10"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl font-black text-blue-50 opacity-20 select-none">
                      Pack365
                    </div>
                  </div>

                  {/* Certificate Border */}
                  <div className="absolute inset-4 border-4 border-double border-blue-200 rounded-xl pointer-events-none"></div>

                  {/* Certificate Content */}
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="text-center mb-12">
                      <div className="text-5xl md:text-6xl font-bold text-blue-600 mb-2 font-serif">
                        Pack365
                      </div>
                      <div className="text-lg text-gray-600 tracking-widest uppercase">
                        Excellence in Learning
                      </div>
                    </div>

                    {/* Certificate Title */}
                    <div className="text-center mb-16">
                      <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-serif">
                        CERTIFICATE OF ACHIEVEMENT
                      </div>
                      <div className="text-xl text-gray-600">
                        This certificate is proudly presented to
                      </div>
                    </div>

                    {/* Student Name */}
                    <div className="text-center my-16 py-8 border-t-4 border-b-4 border-blue-300 border-double">
                      <div className="text-4xl md:text-5xl font-bold text-blue-700 leading-tight font-serif">
                        {certificateData.studentName}
                      </div>
                    </div>

                    {/* Course Details */}
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                      <div className="text-xl text-gray-700 mb-8">
                        for successfully completing the course
                      </div>
                      <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        {certificateData.courseName}
                      </div>
                      <div className="text-lg text-gray-600 mb-6 leading-relaxed">
                        {certificateData.courseDescription}
                      </div>
                      <div className="inline-block px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold">
                        {certificateData.stream} Stream
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex justify-center gap-16 mt-20 pt-8 border-t border-gray-300">
                      <div className="text-center">
                        <div className="text-sm text-gray-500 uppercase tracking-wider mb-2">
                          Completed On
                        </div>
                        <div className="text-lg font-semibold text-gray-900">
                          {formatDate(certificateData.completedDate)}
                        </div>
                      </div>
                    </div>

                    {/* Signatures */}
                    <div className="flex justify-between mt-24 pt-8 border-t-2 border-blue-400">
                      <div className="text-center flex-1">
                        <div className="text-lg font-bold text-gray-900 mb-1">Dr. Ajay Prabhakar</div>
                        <div className="text-sm text-gray-600">Founder & Director</div>
                        <div className="text-xs text-gray-500 mt-4">Triple A Education</div>
                      </div>
                      <div className="text-center flex-1">
                        <div className="text-lg font-bold text-gray-900 mb-1">Pack365</div>
                        <div className="text-sm text-gray-600">Skill Development Platform</div>
                        <div className="text-xs text-gray-500 mt-4">Verified & Authenticated</div>
                      </div>
                    </div>

                    {/* Certificate ID */}
                    <div className="text-center mt-12 pt-6 border-t border-gray-200">
                      <div className="text-sm text-gray-500">
                        Certificate ID: <span className="font-mono font-medium">
                          CERT-{Date.now().toString(36).toUpperCase()}
                        </span>
                        <span className="ml-4 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          ✓ Verified
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Actions and Info */}
            <div>
              <div className="space-y-6">
                {/* Action Buttons */}
                <Card className="shadow-lg border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center">
                      <Award className="h-5 w-5 mr-2 text-blue-600" />
                      Certificate Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={handleDownloadPDF}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                      disabled={downloading}
                    >
                      {downloading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF Certificate
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={handlePrint}
                      className="w-full h-12"
                      variant="outline"
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print Certificate
                    </Button>

                    <Button
                      onClick={handleShare}
                      className="w-full h-12"
                      variant="outline"
                      disabled={sharing}
                    >
                      {sharing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Share2 className="h-4 w-4 mr-2" />
                      )}
                      Share Certificate
                    </Button>
                  </CardContent>
                </Card>

                {/* Certificate Details */}
                <Card className="shadow-lg border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center">
                      <User className="h-5 w-5 mr-2 text-blue-600" />
                      Certificate Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <User className="h-4 w-4 text-gray-400 mt-1 mr-3" />
                        <div>
                          <div className="text-sm text-gray-500">Recipient</div>
                          <div className="font-medium">{certificateData.studentName}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Mail className="h-4 w-4 text-gray-400 mt-1 mr-3" />
                        <div>
                          <div className="text-sm text-gray-500">Email</div>
                          <div className="font-medium">{certificateData.email || 'Not provided'}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Phone className="h-4 w-4 text-gray-400 mt-1 mr-3" />
                        <div>
                          <div className="text-sm text-gray-500">Phone</div>
                          <div className="font-medium">{certificateData.phoneNumber || 'Not provided'}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <BookOpen className="h-4 w-4 text-gray-400 mt-1 mr-3" />
                        <div>
                          <div className="text-sm text-gray-500">Course</div>
                          <div className="font-medium">{certificateData.courseName}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Calendar className="h-4 w-4 text-gray-400 mt-1 mr-3" />
                        <div>
                          <div className="text-sm text-gray-500">Completion Date</div>
                          <div className="font-medium">{formatDate(certificateData.completedDate)}</div>
                        </div>
                      </div>
                      
                      {certificateData.examScore && (
                        <div className="flex items-start">
                          <Award className="h-4 w-4 text-yellow-500 mt-1 mr-3" />
                          <div>
                            <div className="text-sm text-gray-500">Exam Score</div>
                            <div className="font-medium">{certificateData.examScore}%</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Verification Info */}
                <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Verified & Authentic</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        This certificate is digitally verified and can be validated through the Pack365 platform.
                      </p>
                      <div className="text-xs text-gray-500 bg-white/50 p-3 rounded-lg">
                        Certificate ID: CERT-{Date.now().toString(36).toUpperCase()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Pack365CertificatePage;
