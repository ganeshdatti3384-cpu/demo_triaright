// components/internships/ApplyInternshipDialog.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { IndianRupee, Loader2, Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface APInternship {
  _id: string;
  title: string;
  companyName: string;
  mode: 'Free' | 'Paid';
  amount?: number;
}

interface ApplyInternshipDialogProps {
  internship: APInternship | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (applicationData: FormData) => Promise<void> | void;
  loading: boolean;
}

const ApplyInternshipDialog = ({
  internship,
  open,
  onOpenChange,
  onSubmit,
  loading
}: ApplyInternshipDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    qualification: '',
    portfolioLink: ''
  });
  
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: 'Error',
        description: 'Name, email, and phone are required fields.',
        variant: 'destructive'
      });
      return;
    }

    // Validate resume file
    if (!resumeFile) {
      toast({
        title: 'Error',
        description: 'Resume file is required.',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Create FormData for multipart/form-data
      const submitData = new FormData();
      
      // Add internship ID
      submitData.append('internshipId', internship?._id || '');
      
      // Add applicant details as JSON string (as backend expects)
      const applicantDetails = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        college: formData.college,
        qualification: formData.qualification
      };
      submitData.append('applicantDetails', JSON.stringify(applicantDetails));
      
      // Add portfolio link if provided
      if (formData.portfolioLink) {
        submitData.append('portfolioLink', formData.portfolioLink);
      }
      
      // Add resume file
      submitData.append('resume', resumeFile);

      await onSubmit(submitData);
      
      // Reset form on success
      setFormData({
        name: '',
        email: '',
        phone: '',
        college: '',
        qualification: '',
        portfolioLink: ''
      });
      setResumeFile(null);
      
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit application. Please try again.',
        variant: 'destructive'
      });
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
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Error',
          description: 'Please upload a PDF or Word document.',
          variant: 'destructive'
        });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'File size must be less than 5MB.',
          variant: 'destructive'
        });
        return;
      }

      setResumeFile(file);
    }
  };

  const removeResume = () => {
    setResumeFile(null);
  };

  if (!internship) return null;

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
              </div>
              {internship.mode === 'Paid' && internship.amount && (
                <div className="text-right">
                  <p className="text-sm text-blue-600">Program Fee</p>
                  <p className="text-xl font-bold text-green-600 flex items-center">
                    <IndianRupee className="h-5 w-5" />
                    {internship.amount.toLocaleString()}
                  </p>
                </div>
              )}
              {internship.mode === 'Free' && (
                <div className="text-right">
                  <p className="text-sm text-blue-600">Program Type</p>
                  <p className="text-lg font-bold text-green-600">FREE</p>
                </div>
              )}
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
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
                placeholder="Enter your phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="college">College/University</Label>
              <Input
                id="college"
                value={formData.college}
                onChange={(e) => handleInputChange('college', e.target.value)}
                placeholder="e.g., IIT Delhi"
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
                placeholder="https://github.com/yourusername"
              />
            </div>
          </div>

          {/* Resume Upload */}
          <div className="space-y-2">
            <Label htmlFor="resume">Resume *</Label>
            {!resumeFile ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload your resume (PDF or Word document)
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Max file size: 5MB
                </p>
                <Label htmlFor="resume-upload" className="cursor-pointer">
                  <Button type="button" variant="outline">
                    Choose File
                  </Button>
                  <Input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </Label>
              </div>
            ) : (
              <div className="border border-green-200 bg-green-50 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">{resumeFile.name}</p>
                    <p className="text-sm text-green-700">
                      {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeResume}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Remove
                </Button>
              </div>
            )}
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
              className="min-w-32"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Applying...
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
