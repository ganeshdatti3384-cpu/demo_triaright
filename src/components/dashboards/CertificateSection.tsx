
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, Download, Share } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CertificateSectionProps {
  studentName: string;
  courseName: string;
  completionDate: string;
}

const CertificateSection = ({ studentName, courseName, completionDate }: CertificateSectionProps) => {
  const { toast } = useToast();

  const handleDownloadCertificate = () => {
    toast({
      title: "Certificate Downloaded",
      description: "Your certificate has been downloaded successfully!",
    });
  };

  const handleShareCertificate = () => {
    toast({
      title: "Share Certificate",
      description: "Certificate link copied to clipboard!",
    });
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-xl">
            <Award className="h-6 w-6 mr-2 text-yellow-600" />
            Congratulations! 🎉
          </CardTitle>
          <Badge className="bg-green-100 text-green-800">
            100% Complete
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <p className="text-gray-700">
          You have successfully completed the <strong>{courseName}</strong> course! 
          Your certificate is now ready for download.
        </p>

        {/* Certificate Preview */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-8 shadow-sm">
          <div className="text-center">
            <div className="mb-4">
              <Award className="h-16 w-16 text-yellow-600 mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-gray-900">Certificate of Completion</h2>
            </div>
            
            <div className="space-y-3 text-gray-700">
              <p className="text-lg">This is to certify that</p>
              <p className="text-2xl font-bold text-blue-600">{studentName}</p>
              <p className="text-lg">has successfully completed the course</p>
              <p className="text-xl font-semibold text-gray-900">{courseName}</p>
              <p className="text-sm text-gray-600 mt-4">
                Completed on {completionDate}
              </p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Certificate ID: WD-2024-{Math.random().toString(36).substring(7).toUpperCase()}</span>
                <span>EduPlatform</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button 
            onClick={handleDownloadCertificate}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Certificate
          </Button>
          <Button 
            variant="outline" 
            onClick={handleShareCertificate}
            className="flex-1"
          >
            <Share className="h-4 w-4 mr-2" />
            Share Certificate
          </Button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Share your achievement on LinkedIn or add it to your portfolio!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CertificateSection;
