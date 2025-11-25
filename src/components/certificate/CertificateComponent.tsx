// components/certificate/CertificateComponent.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Download, ArrowLeft, Award, Calendar, User, BookOpen, Building } from 'lucide-react';

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
  completionPercentage: string;
  certificateId: string;
}

const CertificateComponent = () => {
  const { enrollmentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchCertificateData();
  }, [enrollmentId]);

  const fetchCertificateData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/internships/apinternshipcertificate/${enrollmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setCertificateData(data.certificateData);
      } else {
        toast({
          title: 'Certificate Not Available',
          description: data.message || 'Certificate is not yet available',
          variant: 'destructive'
        });
        navigate(-1);
      }
    } catch (error) {
      console.error('Error fetching certificate:', error);
      toast({
        title: 'Error',
        description: 'Failed to load certificate data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async () => {
    setGenerating(true);
    try {
      // Generate and download PDF certificate
      // This would integrate with a PDF generation service
      toast({
        title: 'Download Started',
        description: 'Your certificate is being generated...',
        variant: 'default'
      });
      
      // Simulate PDF generation
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = '#';
        link.download = `Certificate-${certificateData?.certificateId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: 'Download Complete',
          description: 'Certificate downloaded successfully',
          variant: 'default'
        });
      }, 2000);
      
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download certificate',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (!certificateData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Certificate Not Found</h2>
          <Button onClick={() => navigate('/student/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Button>
          <h1 className="text-4xl font-bold text-gray-900">Certificate of Completion</h1>
          <p className="text-lg text-gray-600 mt-2">
            Congratulations on completing your internship program!
          </p>
        </div>

        {/* Certificate Card */}
        <Card className="border-2 border-gold-500 shadow-2xl">
          <CardContent className="p-8">
            {/* Certificate Design */}
            <div className="text-center border-4 border-double border-gold-400 rounded-lg p-8 bg-white relative">
              
              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-gold-400"></div>
              <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-gold-400"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-gold-400"></div>
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-gold-400"></div>
              
              {/* Certificate Header */}
              <div className="mb-8">
                <Award className="h-16 w-16 text-gold-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">CERTIFICATE OF COMPLETION</h2>
                <div className="w-32 h-1 bg-gold-500 mx-auto"></div>
              </div>

              {/* Presented To */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">This certificate is proudly presented to</p>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{certificateData.studentName}</h3>
                <p className="text-gray-600">{certificateData.studentEmail}</p>
                <p className="text-gray-600">{certificateData.college}</p>
              </div>

              {/* Completion Details */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  for successfully completing the internship program in
                </p>
                <h4 className="text-xl font-bold text-blue-600 mb-2">{certificateData.courseTitle}</h4>
                <p className="text-gray-700 mb-2">{certificateData.stream}</p>
                <p className="text-sm text-gray-600">
                  offered by {certificateData.providerName} in collaboration with {certificateData.companyName}
                </p>
              </div>

              {/* Program Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
                <div className="flex items-center justify-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-600" />
                  <span>Duration: {certificateData.internshipDuration}</span>
                </div>
                <div className="flex items-center justify-center">
                  <User className="h-4 w-4 mr-2 text-gray-600" />
                  <span>Instructor: {certificateData.instructorName}</span>
                </div>
              </div>

              {/* Completion Stats */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium">Completion Rate</p>
                    <p className="text-2xl font-bold text-green-600">
                      {certificateData.completionPercentage}%
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Certificate ID</p>
                    <p className="font-mono text-gray-700">{certificateData.certificateId}</p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="flex justify-between text-xs text-gray-600 border-t pt-4">
                <div>
                  <p className="font-medium">Enrollment Date</p>
                  <p>{new Date(certificateData.enrollmentDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-medium">Completion Date</p>
                  <p>{new Date(certificateData.completionDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <div className="text-center mt-6">
              <Button
                onClick={downloadCertificate}
                disabled={generating}
                className="bg-green-600 hover:bg-green-700"
                size="lg"
              >
                <Download className="h-5 w-5 mr-2" />
                {generating ? 'Generating PDF...' : 'Download Certificate'}
              </Button>
              
              <p className="text-sm text-gray-600 mt-3">
                This certificate verifies the successful completion of the internship program.
                It can be shared on professional networks like LinkedIn.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Share Options */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Share Your Achievement</CardTitle>
            <CardDescription>
              Share your certificate on professional networks and with potential employers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" className="flex items-center">
                <Building className="h-4 w-4 mr-2" />
                Share on LinkedIn
              </Button>
              <Button variant="outline" className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                Add to Portfolio
              </Button>
              <Button variant="outline" className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Email to Recruiter
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CertificateComponent;