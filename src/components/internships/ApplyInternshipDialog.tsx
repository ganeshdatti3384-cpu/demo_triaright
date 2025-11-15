// components/internships/ApplyInternshipDialog.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { IndianRupee, Loader2, Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { internshipsApi } from '@/services/api';

interface Internship {
  _id: string;
  title: string;
  companyName: string;
  mode: 'Unpaid' | 'Paid';
  stipendAmount?: number;
  currency: string;
}

interface ApplyInternshipDialogProps {
  internship: Internship | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const ApplyInternshipDialog = ({
  internship,
  open,
  onOpenChange,
  onSuccess
}: ApplyInternshipDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    qualification: '',
    portfolioLink: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!internship) return;
    
    // Validate required fields
    if (!formData.name || !formData.email || !resumeFile) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields and upload resume",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const applicationData = new FormData();
      
      // Add internship ID
      applicationData.append('internshipId', internship._id);
      
      // Add applicant details as JSON string (matches backend expectation)
      const applicantDetails = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        college: formData.college || '',
        qualification: formData.qualification || ''
      };
      applicationData.append('applicantDetails', JSON.stringify(applicantDetails));
      
      // Add portfolio link
      applicationData.append('portfolioLink', formData.portfolioLink);
      
      // Add resume file
      applicationData.append('resume', resumeFile);

      const result = await internshipsApi.applyForInternship(applicationData);

      if (result.success) {
        toast({
          title: "Application Submitted Successfully!",
          description: result.message,
        });
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          college: '',
          qualification: '',
          portfolioLink: ''
        });
        setResumeFile(null);
        
        onOpenChange(false);
        onSuccess?.();
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error('Application error:', error);
      toast({
        title: "Application Failed",
        description: error.message || "Failed to submit application",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type and size
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or Word document",
          variant: "destructive"
        });
        return;
      }

      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive"
        });
        return;
      }

      setResumeFile(file);
    }
  };

  if (!internship) return null;

  const getAmountDisplay = () => {
    if (internship.mode === 'Unpaid') {
      return (
        <div className="text-right">
          <p className="text-sm text-blue-600">Internship Type</p>
          <p className="text-lg font-bold text-green-600">UNPAID</p>
        </div>
      );
    }
    
    if (internship.stipendAmount && internship.stipendAmount > 0) {
      return (
        <div className="text-right">
          <p className="text-sm text-blue-600">Stipend</p>
          <p className="text-xl font-bold text-green-600 flex items-center justify-end">
            {internship.currency === 'INR' && <IndianRupee className="h-5 w-5" />}
            {internship.stipendAmount.toLocaleString()}/month
          </p>
        </div>
      );
    }
    
    return (
      <div className="text-right">
        <p className="text-sm text-blue-600">Internship Type</p>
        <p className="text-lg font-bold text-green-600">PAID</p>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply for {internship.title}</DialogTitle>
          <DialogDescription>
            Complete your application for this internship at {internship.companyName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Internship Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-blue-900">{internship.title}</h4>
                <p className="text-sm text-blue-700">{internship.companyName}</p>
                <p className="text-sm text-blue-600 capitalize">{internship.mode.toLowerCase()} Internship</p>
              </div>
              {getAmountDisplay()}
            </div>
          </div>

          {/* Application Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="college">College/University</Label>
              <Input
                id="college"
                value={formData.college}
                onChange={(e) => handleInputChange('college', e.target.value)}
                placeholder="Enter your college name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualification">Qualification</Label>
              <Input
                id="qualification"
                value={formData.qualification}
                onChange={(e) => handleInputChange('qualification', e.target.value)}
                placeholder="e.g., B.Tech Computer Science"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolioLink">Portfolio Link</Label>
              <Input
                id="portfolioLink"
                value={formData.portfolioLink}
                onChange={(e) => handleInputChange('portfolioLink', e.target.value)}
                placeholder="https://yourportfolio.com"
              />
            </div>
          </div>

          {/* Resume Upload */}
          <div className="space-y-2">
            <Label htmlFor="resume">Resume *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="resume-upload"
              />
              <Label htmlFor="resume-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {resumeFile ? 'Resume Selected' : 'Upload your resume'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      PDF, DOC, DOCX (Max 5MB)
                    </p>
                  </div>
                  {resumeFile && (
                    <p className="text-sm text-green-600 font-medium mt-2 flex items-center">
                      <FileText className="h-4 w-4 mr-1" />
                      {resumeFile.name}
                    </p>
                  )}
                </div>
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="min-w-32 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                'Apply Now'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyInternshipDialog;
