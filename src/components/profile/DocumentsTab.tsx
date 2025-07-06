
import React, { useRef } from 'react';
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

interface DocumentsTabProps {
  uploadedDocuments: UploadedDocument[];
  onDocumentUpload: (event: React.ChangeEvent<HTMLInputElement>, category: 'document' | 'payslip') => void;
  onDeleteDocument: (docId: string) => void;
  formatFileSize: (bytes: number) => string;
}

const DocumentsTab: React.FC<DocumentsTabProps> = ({ 
  uploadedDocuments, 
  onDocumentUpload, 
  onDeleteDocument, 
  formatFileSize 
}) => {
  const documentInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-t-lg">
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Document Management
        </CardTitle>
        <CardDescription className="text-white/90">
          Upload and manage your documents
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="border-2 border-dashed border-teal-300 rounded-lg p-6 text-center">
          <Upload className="h-12 w-12 text-teal-500 mx-auto mb-4" />
          <Button
            type="button"
            onClick={() => documentInputRef.current?.click()}
            className="bg-gradient-to-r from-teal-500 to-cyan-500"
          >
            Upload Documents
          </Button>
          <p className="text-sm text-gray-600 mt-2">
            Supported formats: PDF, DOC, DOCX, JPG, PNG
          </p>
          <input
            ref={documentInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.png,.jpeg"
            onChange={(e) => onDocumentUpload(e, 'document')}
            className="hidden"
          />
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-lg">Uploaded Documents</h4>
          {uploadedDocuments.filter(doc => doc.category === 'document').map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-teal-600" />
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

export default DocumentsTab;
