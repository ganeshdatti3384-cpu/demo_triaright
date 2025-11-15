// components/internships/ApplyInternshipDialog.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { IndianRupee, Loader2, Upload, FileText, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface APInternship {
  _id: string;
  title: string;
  companyName: string;
  mode: 'Free' | 'Paid' | 'Unpaid';
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
  const [fileError, setFileError] = useState<string>('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setFileError('');

    // Validate required fields
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast({
        title: 'Error',
        description: 'Name, email, and phone are required fields.',
        variant: 'destructive'
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address.',
        variant: 'destructive'
      });
      return;
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      toast({
        title: 'Error',
        description: 'Please enter a valid 10-digit phone number.',
        variant: 'destructive'
      });
      return;
    }

    // Validate resume file
    if (!resumeFile) {
      setFileError('Resume file is required');
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
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        college: formData.college.trim(),
        qualification: formData.qualification.trim()
      };
      submitData.append('applicantDetails', JSON.stringify(applicantDetails));
      
      // Add portfolio link if provided
      if (formData.portfolioLink.trim()) {
        submitData.append('portfolioLink', formData.portfolioLink.trim());
      }
      
      // Add resume file - use 'resume' as field name to match backend
      submitData.append('resume', resumeFile);

      // Log FormData contents for debugging
      console.log('Submitting FormData:');
      for (let [key, value] of submitData.entries()) {
        if (key === 'resume') {
          console.log(`${key}:`, (value as File).name, (value as File).size);
        } else {
          console.log(`${key}:`, value);
        }
      }

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
      setFileError('');
      
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

  const handlePhoneChange = (value: string) => {
    // Allow only numbers and limit to 10 digits
    const numbersOnly = value.replace(/\D/g, '').slice(0, 10);
    handleInputChange('phone', numbersOnly);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError('');
    
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setFileError('Please upload a PDF or Word document (PDF, DOC, DOCX)');
        toast({
          title: 'Error',
          description: 'Please upload a PDF or Word document.',
          variant: 'destructive'
        });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setFileError('File size must be less than 5MB');
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
    setFileError('');
  };

  const handleDialogClose = () => {
    if (!loading) {
      onOpenChange(false);
      // Reset form when dialog closes
      setFormData({
        name: '',
        email: '',
        phone: '',
        college: '',
        qualification: '',
        portfolioLink: ''
      });
      setResumeFile(null);
      setFileError('');
    }
  };

  if (!internship) return null;

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
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
              {(internship.mode === 'Free' || internship.mode === 'Unpaid') && (
                <div className="text-right">
                  <p className="text-sm text-blue-600">Program Type</p>
                  <p className="text-lg font-bold text-green-600">
                    {internship.mode.toUpperCase()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Application Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                placeholder="Enter your full name"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone Number *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                required
                placeholder="Enter 10-digit phone number"
                disabled={loading}
                maxLength={10}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="college">
                College/University
              </Label>
              <Input
                id="college"
                value={formData.college}
                onChange={(e) => handleInputChange('college', e.target.value)}
                placeholder="e.g., IIT Delhi"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualification">
                Qualification
              </Label>
              <Input
                id="qualification"
                value={formData.qualification}
                onChange={(e) => handleInputChange('qualification', e.target.value)}
                placeholder="e.g., B.Tech Computer Science"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolioLink">
                Portfolio Link
              </Label>
              <Input
                id="portfolioLink"
                type="url"
                value={formData.portfolioLink}
                onChange={(e) => handleInputChange('portfolioLink', e.target.value)}
                placeholder="https://github.com/yourusername"
                disabled={loading}
              />
            </div>
          </div>

          {/* Resume Upload */}
          <div className="space-y-3">
            <Label htmlFor="resume">
              Resume *
            </Label>
            {!resumeFile ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload your resume (PDF or Word document)
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Max file size: 5MB • Supported: PDF, DOC, DOCX
                </p>
                <Label htmlFor="resume-upload" className="cursor-pointer">
                  <Button 
                    type="button" 
                    variant="outline"
                    disabled={loading}
                  >
                    Choose File
                  </Button>
                  <Input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={loading}
                  />
                </Label>
                {fileError && (
                  <p className="text-sm text-red-600 mt-2">{fileError}</p>
                )}
              </div>
            ) : (
              <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
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
                    disabled={loading}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleDialogClose}
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
