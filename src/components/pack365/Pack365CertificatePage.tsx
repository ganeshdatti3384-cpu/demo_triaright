// components/pack365/Pack365CertificatePage.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Download, Printer, Share2, Award, CheckCircle, Calendar, User, BookOpen, Building, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { pack365Api, profileApi } from '@/services/api';

/**
 * CertificateData - shape used by the renderer / PDF generator
 */
interface CertificateData {
  studentName: string;
  studentEmail?: string;
  stream: string;
  coursesSummary: string;
  providerName: string;
  completionDate: string;
  completionPercentage: number;
  certificateId: string;
  enrollmentId: string;
  enrollmentDate?: string;
}

const Pack365CertificatePage: React.FC = () => {
  const { enrollmentId } = useParams<{ enrollmentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);

  const certificateRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (enrollmentId) {
      const decodedEnrollmentId = decodeURIComponent(enrollmentId);
      console.log('Certificate page loaded with enrollmentId:', decodedEnrollmentId);
      fetchData(decodedEnrollmentId);
    } else {
      setError('Invalid enrollment ID');
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollmentId]);

  const fetchData = async (targetEnrollmentId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to access certificate',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Fetching enrollments for certificate...');
      
      // Get user's enrollments and find the specific one
      const enrollmentsRes = await pack365Api.getMyEnrollments(token);
      if (!enrollmentsRes.success) {
        throw new Error('Failed to fetch enrollments');
      }

      const enrollments = enrollmentsRes.enrollments || [];
      console.log('All enrollments found:', enrollments);
      console.log('Looking for enrollment with ID:', targetEnrollmentId);

      // Enhanced search for enrollment with multiple ID fields
      const enrollment = enrollments.find((e: any) => {
        const possibleIds = [
          e._id,
          e.enrollmentId,
          e.id,
          e.normalizedEnrollmentId,
          (e.enrollment && e.enrollment._id) || null,
          (e.enrollment && e.enrollment.enrollmentId) || null
        ]
          .filter(id => id !== null && id !== undefined)
          .map(id => String(id).trim().toLowerCase());
        
        const targetId = String(targetEnrollmentId).trim().toLowerCase();
        return possibleIds.some(id => id === targetId);
      });

      if (!enrollment) {
        console.log('Available enrollment IDs:', enrollments.map((e: any) => ({
          _id: e._id,
          enrollmentId: e.enrollmentId,
          id: e.id,
          normalizedEnrollmentId: e.normalizedEnrollmentId,
          stream: e.stream
        })));
        throw new Error(`Enrollment not found for ID: ${targetEnrollmentId}. Please ensure you have completed all courses in the stream.`);
      }

      console.log('Found matching enrollment:', enrollment);

      // FIXED: Use profileApi.getProfile which exists in backend
      const userRes = await profileApi.getProfile(token);
      console.log('User profile response:', userRes);
      
      if (!userRes) {
        throw new Error('Failed to fetch user profile');
      }

      // Build certificate data
      const certId = enrollment.certificateId || enrollment.certificate?.certificateId || `PACK365-${String(enrollment._id || enrollment.enrollmentId).slice(-8)}`;
      const completionDate = enrollment.completedAt || enrollment.completionDate || enrollment.expiresAt || new Date().toISOString();
      
      // Calculate completion percentage
      let completionPercentage = 100; // default to 100% if no progress data
      if (typeof enrollment.totalWatchedPercentage === 'number') {
        completionPercentage = Math.round(enrollment.totalWatchedPercentage);
      } else if (enrollment.totalTopics && enrollment.watchedTopics) {
        completionPercentage = Math.round((enrollment.watchedTopics / enrollment.totalTopics) * 100);
      } else if (enrollment.courses && Array.isArray(enrollment.courses)) {
        // Calculate from individual course progress
        const totalCourses = enrollment.courses.length;
        const completedCourses = enrollment.courses.filter((course: any) => {
          const progress = course.progress;
          return progress && (progress.completionPercentage === 100 || progress.isCompleted);
        }).length;
        completionPercentage = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 100;
      }

      const coursesSummary = Array.isArray(enrollment.courses)
        ? enrollment.courses.map((c: any) => c.courseName || c.courseId || '').filter(Boolean).join(', ')
        : 'All courses in stream';

      // Get user name from profile
      const userName = userRes.name || userRes.fullName || userRes.firstName || 'Student';

      const payload: CertificateData = {
        studentName: userName,
        studentEmail: userRes.email || '',
        stream: enrollment.stream || enrollment.streamName || 'Pack365 Stream',
        coursesSummary,
        providerName: 'Triaright Education',
        completionDate,
        completionPercentage,
        certificateId: certId,
        enrollmentId: enrollment._id || enrollment.enrollmentId || targetEnrollmentId,
        enrollmentDate: enrollment.enrollmentDate || enrollment.createdAt || ''
      };

      setCertificateData(payload);
      console.log('Certificate data prepared:', payload);

    } catch (err: any) {
      console.error('Error loading certificate data', err);
      setError(err.message || 'Failed to load certificate data');
      toast({
        title: 'Error',
        description: err.message || 'Failed to load certificate data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!certificateRef.current || !certificateData) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: certificateRef.current.scrollWidth,
        height: certificateRef.current.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${certificateData.certificateId}.pdf`);

      toast({
        title: 'Download Successful',
        description: 'Certificate downloaded as PDF',
        variant: 'default'
      });
    } catch (err) {
      console.error('Error generating PDF', err);
      toast({
        title: 'Download Failed',
        description: 'Failed to generate certificate PDF',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    const certificateElement = certificateRef.current;
    if (!certificateElement) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate - ${certificateData?.certificateId}</title>
          <style>
            body { margin: 0; padding: 20px; background: white; font-family: "Times New Roman", serif; }
            .certificate-container { max-width: 900px; margin: 0 auto; }
          </style>
        </head>
        <body>
          ${certificateElement.outerHTML}
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    };
  };

  const handleShare = async () => {
    if (!certificateData) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${certificateData.stream} - Certificate of Completion`,
          text: `I completed ${certificateData.stream} (${certificateData.coursesSummary || 'Pack365'})`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share error', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast({
          title: 'Link Copied',
          description: 'Certificate link copied to clipboard',
          variant: 'default'
        });
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-green-600" />
          </div>
          <div className="text-center text-gray-600">Loading certificate...</div>
        </div>
      </div>
    );
  }

  if (error || !certificateData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center py-16">
            <CardContent>
              <div className="w-24 h-24 bg-gradient-to-r from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-12 w-12 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {error ? 'Error Loading Certificate' : 'Certificate Not Available'}
              </h3>
              <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
                {error || 'Certificate data could not be found or you are not eligible.'}
              </p>
              <div className="flex justify-center space-x-4">
                <Button onClick={() => navigate(-1)} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
                <Button onClick={() => navigate('/pack365')}>
                  Browse Streams
                </Button>
              </div>
              {/* Debug information */}
              <div className="mt-6 p-4 bg-gray-100 rounded-lg text-left">
                <p className="text-sm font-mono text-gray-600">
                  <strong>Debug Info:</strong><br />
                  Enrollment ID from URL: {enrollmentId}<br />
                  Decoded ID: {enrollmentId ? decodeURIComponent(enrollmentId) : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Certificate visual renderer - matches AP certificate styling / layout
  const CertificateRenderer: React.FC<{ data: CertificateData }> = ({ data }) => {
    return (
      <div
        ref={certificateRef}
        className="w-[900px] bg-white p-8 relative"
        style={{ fontFamily: '"Times New Roman", serif' }}
      >
        <div style={{ border: '8px solid #d4af37', padding: 12 }}>
          <div style={{ border: '2px solid #1a237e', padding: 18 }}>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#1a237e]">TRIARIGHT EDUCATION</div>
              <div className="text-lg italic text-[#d4af37] mt-1">THE NEW ERA OF LEARNING</div>

              <div className="mt-8 text-2xl font-bold text-[#1a237e]">CERTIFICATE OF COMPLETION</div>

              <div className="mt-8 text-gray-700 text-lg">This certificate is proudly presented to</div>

              <div className="mt-4 text-3xl font-extrabold text-[#1a237e]">{data.studentName.toUpperCase()}</div>

              <div className="mt-6 text-gray-700 text-lg">for successfully completing the</div>

              <div className="mt-3 text-2xl font-bold text-[#d4af37]">{data.stream}</div>

              {data.coursesSummary && (
                <div className="mt-3 text-gray-700 text-sm max-w-2xl mx-auto">{data.coursesSummary}</div>
              )}

              <div className="mt-8 text-gray-600">
                Completion: <span className="font-semibold">{data.completionPercentage}%</span>
              </div>

              <div className="mt-10 flex justify-between items-center px-8">
                <div className="text-left">
                  <div className="text-sm text-gray-700">Date of issue</div>
                  <div className="text-base font-semibold">{new Date(data.completionDate).toLocaleDateString()}</div>
                  <div className="text-sm text-gray-500 mt-1">Certificate ID: <span className="font-mono text-sm text-green-600">{data.certificateId}</span></div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-700">Issued by</div>
                  <div className="text-base font-semibold">Triaright Education</div>
                </div>
              </div>

              <div className="mt-12 text-center">
                <div className="text-lg font-bold">KISSHORE KUMAAR</div>
                <div className="text-sm">Founder & Director - Triaright Education</div>
              </div>

              <div className="mt-6 text-center text-xs text-gray-500 max-w-[760px] mx-auto">
                7-1-58, 404B, 4th Floor, Surekha Chambers, Ameerpet, Hyderabad, Telangana - 500016
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Badge variant="default" className="bg-green-600">
            <Award className="h-4 w-4 mr-1" />
            Pack365 Certificate
          </Badge>
        </div>

        {/* Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-6 w-6 mr-2 text-green-600" />
              Certificate Details
            </CardTitle>
            <CardDescription>Your achievement details and certificate information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Student Name</p>
                  <p className="text-lg font-semibold text-gray-900">{certificateData.studentName}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Stream</p>
                  <p className="text-lg font-semibold text-gray-900">{certificateData.stream}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Building className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Provider</p>
                  <p className="text-lg font-semibold text-gray-900">{certificateData.providerName}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed On</p>
                  <p className="text-lg font-semibold text-gray-900">{new Date(certificateData.completionDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Certificate ID</p>
                  <p className="text-lg font-semibold text-gray-900">{certificateData.certificateId}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Award className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion</p>
                  <p className="text-lg font-semibold text-gray-900">{certificateData.completionPercentage}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button onClick={handleDownloadPDF} disabled={generating} className="bg-green-600 hover:bg-green-700 px-8">
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download Certificate
                  </>
                )}
              </Button>

              <Button onClick={handlePrint} variant="outline" className="px-8">
                <Printer className="h-4 w-4 mr-2" />
                Print Certificate
              </Button>

              <Button onClick={handleShare} variant="outline" className="px-8">
                <Share2 className="h-4 w-4 mr-2" />
                Share Certificate
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Certificate Preview</CardTitle>
            <CardDescription>This is a preview of your digital certificate</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white shadow-lg">
              <div className="scale-90 origin-top">
                <CertificateRenderer data={certificateData} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Info */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Certificate Verification</h3>
              <p className="text-gray-600 mb-4">
                This certificate can be verified using the Certificate ID:&nbsp;
                <span className="font-mono font-bold text-green-600">{certificateData.certificateId}</span>
              </p>
              <div className="flex items-center justify-center text-sm text-gray-500">
                <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                Issued by {certificateData.providerName} • Verified Completion
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Pack365CertificatePage;
