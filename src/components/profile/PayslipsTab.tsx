
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Eye, Download, Trash2 } from 'lucide-react';

interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  category: 'document' | 'payslip';
}

interface PayslipsTabProps {
  uploadedDocuments: UploadedDocument[];
  onDocumentUpload: (event: React.ChangeEvent<HTMLInputElement>, category: 'document' | 'payslip') => void;
  onDeleteDocument: (docId: string) => void;
  formatFileSize: (bytes: number) => string;
}

const PayslipsTab: React.FC<PayslipsTabProps> = ({ 
  uploadedDocuments, 
  onDocumentUpload, 
  onDeleteDocument, 
  formatFileSize 
}) => {
  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-t-lg">
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Payslips Management
        </CardTitle>
        <CardDescription className="text-white/90">
          Upload and view your payslips
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="border-2 border-dashed border-emerald-300 rounded-lg p-6 text-center">
          <Upload className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
          <Button
            type="button"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.multiple = true;
              input.accept = '.pdf,.doc,.docx,.jpg,.png,.jpeg';
              input.onchange = (e) => onDocumentUpload(e as any, 'payslip');
              input.click();
            }}
            className="bg-gradient-to-r from-emerald-500 to-green-500"
          >
            Upload Payslips
          </Button>
          <p className="text-sm text-gray-600 mt-2">
            Upload your monthly payslips securely
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-lg">Payslip History</h4>
          {uploadedDocuments.filter(doc => doc.category === 'payslip').map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-sm text-gray-600">
                    {formatFileSize(doc.size)} • {new Date(doc.uploadDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => onDeleteDocument(doc.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PayslipsTab;
