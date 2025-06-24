
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, Download, Star, CheckCircle } from 'lucide-react';

interface CertificateSectionProps {
  courseName: string;
  studentName: string;
}

const CertificateSection = ({ courseName, studentName }: CertificateSectionProps) => {
  const handleDownloadCertificate = () => {
    // In a real app, this would generate and download a PDF certificate
    console.log('Downloading certificate...');
  };

  return (
    <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center text-green-800">
          <Award className="h-6 w-6 mr-2" />
          Course Completion Certificate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Completion Status */}
          <div className="flex items-center justify-center space-x-2 p-4 bg-green-100 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <span className="text-green-800 font-medium">
              Congratulations! You've completed the course
            </span>
          </div>

          {/* Certificate Preview */}
          <div className="border-2 border-dashed border-green-300 rounded-lg p-8 bg-white text-center">
            <div className="space-y-4">
              <Award className="h-16 w-16 text-gold mx-auto text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-900">Certificate of Completion</h2>
              <p className="text-gray-600">This is to certify that</p>
              <p className="text-3xl font-bold text-blue-600">{studentName}</p>
              <p className="text-gray-600">has successfully completed</p>
              <p className="text-xl font-semibold text-gray-900">{courseName}</p>
              
              <div className="flex items-center justify-center space-x-4 mt-6">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Star className="h-4 w-4 mr-1" />
                  Certified
                </Badge>
                <Badge variant="outline">
                  {new Date().getFullYear()}
                </Badge>
              </div>
            </div>
          </div>

          {/* Download Actions */}
          <div className="space-y-3">
            <Button 
              onClick={handleDownloadCertificate}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              <Download className="h-5 w-5 mr-2" />
              Download Certificate (PDF)
            </Button>
            
            <p className="text-sm text-gray-600 text-center">
              Your certificate will include your name, course completion date, and a unique verification ID.
            </p>
          </div>

          {/* Achievement Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">100%</div>
              <div className="text-sm text-gray-600">Completion</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">A+</div>
              <div className="text-sm text-gray-600">Grade</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">15h</div>
              <div className="text-sm text-gray-600">Study Time</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CertificateSection;
