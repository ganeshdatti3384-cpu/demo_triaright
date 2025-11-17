// components/internships/ApplyInternshipDialog.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, FileText, Building2, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Internship {
  _id: string;
  title: string;
  companyName: string;
  location: string;
  internshipType: string;
  mode: string;
}

interface ApplyInternshipDialogProps {
  internship: Internship | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ApplyInternshipDialog = ({
  internship,
  open,
  onOpenChange,
  onSuccess
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
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!internship) return;

    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: 'Error',
        description: 'Name, email, and phone are required fields.',
        variant: 'destructive'
      });
      return;
    }

    if (!resumeFile) {
      toast({
        title: 'Error',
        description: 'Resume file is required.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      
      // Create FormData for multipart upload
      const submitData = new FormData();
      
      // Add internship ID
      submitData.append('internshipId', internship._id);
      
      // Add applicant details as JSON string
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

      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: 'Error',
          description: 'Please login to apply',
          variant: 'destructive'
        });
        return;
      }

      // Use the correct API endpoint for regular internships
      const response = await fetch('/api/internships/applications/apply', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: submitData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to apply for internship');
      }

      if (data.success) {
        toast({
          title: 'Success',
          description: data.message || 'Application submitted successfully!'
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
        setCoverLetter('');
        
        onSuccess();
        onOpenChange(false);
      }
      
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit application. Please try again.',
        variant: 'destructive'
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
            Complete your application for this internship opportunity
          </DialogDescription>
        </DialogHeader>

        {/* Internship Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Building2 className="h-5 w-5 text-blue-600 mt-1" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900">{internship.title}</h4>
              <p className="text-sm text-blue-700">{internship.companyName}</p>
              <div className="flex items-center mt-1 text-sm text-blue-600">
                <MapPin className="h-4 w-4 mr-1" />
                {internship.location} • {internship.internshipType}
              </div>
              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  internship.mode === 'Paid' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {internship.mode}
                </span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* Cover Letter (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
            <Textarea
              id="coverLetter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Tell us why you're interested in this internship..."
              rows={4}
            />
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
