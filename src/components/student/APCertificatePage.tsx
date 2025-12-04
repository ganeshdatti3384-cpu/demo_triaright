// components/student/APCertificatePage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  Share2, 
  Award,
  CheckCircle,
  Calendar,
  User,
  BookOpen,
  Building,
  Loader2,
  AlertCircle
} from 'lucide-react';
import APCertificateGenerator from './APCertificateGenerator';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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

const APCertificatePage = () => {
  const { enrollmentId } = useParams<{ enrollmentId: string }>();
  const navigate = useNavigate();
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  
  const certificateRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (enrollmentId) {
      fetchCertificateData();
    }
  }, [enrollmentId]);

  const fetchCertificateData = async () => {
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
      setError('');
      
      const response = await fetch(`/api/internships/apinternshipcertificate/${enrollmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCertificateData(data.certificateData);
        console.log('✅ Certificate data loaded:', data.certificateData);
      } else {
        console.log('❌ Certificate not available:', data.message);
        throw new Error(data.message || 'Failed to fetch certificate data');
      }
    } catch (error: any) {
      console.error('Error fetching certificate data:', error);
      setError(error.message || 'Failed to load certificate data');
      toast({
        title: 'Error',
        description: error.message || 'Failed to load certificate data',
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
      // Preload background image
      const preloadImage = new Image();
      preloadImage.crossOrigin = 'anonymous';
      preloadImage.src = '/lovable-uploads/certificate-bg.jpg';
      
      await new Promise((resolve, reject) => {
        preloadImage.onload = resolve;
        preloadImage.onerror = reject;
      });

      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        width: certificateRef.current.scrollWidth,
        height: certificateRef.current.scrollHeight,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('.certificate-container') as HTMLElement;
          if (clonedElement) {
            clonedElement.style.backgroundImage = 'url(/lovable-uploads/certificate-bg.jpg)';
            clonedElement.style.backgroundSize = 'cover';
            clonedElement.style.backgroundPosition = 'center';
            clonedElement.style.backgroundRepeat = 'no-repeat';
          }
        }
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
    } catch (error) {
      console.error('Error generating certificate:', error);
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
            body { 
              margin: 0; 
              padding: 20px; 
              background: white; 
              font-family: Arial, sans-serif;
            }
            .certificate-container { 
              transform: scale(0.8); 
              transform-origin: top center;
              margin: 0 auto;
              background-image: url('/lovable-uploads/certificate-bg.jpg') !important;
              background-size: cover !important;
              background-position: center !important;
              background-repeat: no-repeat !important;
            }
            @media print {
              body { 
                margin: 0; 
                padding: 0; 
                width: 210mm;
                height: 297mm;
              }
              .certificate-container { 
                transform: none;
                width: 210mm !important;
                height: 297mm !important;
                background-image: url('/lovable-uploads/certificate-bg.jpg') !important;
                background-size: cover !important;
                background-position: center !important;
                background-repeat: no-repeat !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
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
          title: `${certificateData.courseTitle} - Certificate of Completion`,
          text: `I successfully completed ${certificateData.courseTitle} from ${certificateData.providerName}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
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
                <Button onClick={() => navigate(`/ap-internship-learning/${enrollmentId}`)}>
                  Back to Learning
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/ap-internship-learning/${enrollmentId}`)}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Learning
          </Button>
          <Badge variant="default" className="bg-green-600">
            <Award className="h-4 w-4 mr-1" />
            Certificate of Completion
          </Badge>
        </div>

        {/* Certificate Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-6 w-6 mr-2 text-green-600" />
              Certificate Details
            </CardTitle>
            <CardDescription>
              Your achievement details and certificate information
            </CardDescription>
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
                  <p className="text-sm font-medium text-gray-600">Course</p>
                  <p className="text-lg font-semibold text-gray-900">{certificateData.courseTitle}</p>
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
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(certificateData.completionDate).toLocaleDateString()}
                  </p>
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

        {/* Certificate Actions */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button 
                onClick={handleDownloadPDF}
                disabled={generating}
                className="bg-green-600 hover:bg-green-700 px-8"
              >
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
              
              <Button 
                onClick={handlePrint}
                variant="outline"
                className="px-8"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Certificate
              </Button>
              
              <Button 
                onClick={handleShare}
                variant="outline"
                className="px-8"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Certificate
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Certificate Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Certificate Preview</CardTitle>
            <CardDescription>
              This is a preview of your digital certificate
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white shadow-lg">
              <div ref={certificateRef} className="scale-90 origin-top">
                <APCertificateGenerator certificateData={certificateData} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Info */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Certificate Verification
              </h3>
              <p className="text-gray-600 mb-4">
                This certificate can be verified using the Certificate ID:{" "}
                <span className="font-mono font-bold text-green-600">
                  {certificateData.certificateId}
                </span>
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

export default APCertificatePage;
