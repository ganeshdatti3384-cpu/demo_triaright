// components/internships/ApplyInternshipDialog.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { IndianRupee, Loader2, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Internship {
  _id: string;
  title: string;
  companyName: string;
  mode: 'Unpaid' | 'Paid';
  stipendAmount?: number;
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
    skills: '',
    experience: '',
    coverLetter: '',
    portfolioLink: ''
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!internship) return;
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone || !formData.college || !formData.qualification) {
      toast({
        title: 'Missing Information',
        description: 'Please fill all required fields',
        variant: 'destructive'
      });
      return;
    }

    if (!resumeFile) {
      toast({
        title: 'Resume Required',
        description: 'Please upload your resume',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);

      const submitFormData = new FormData();
      
      // Append data exactly as backend expects
      submitFormData.append('internshipId', internship._id);
      
      const applicantDetails = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        college: formData.college,
        qualification: formData.qualification
      };
      
      submitFormData.append('applicantDetails', JSON.stringify(applicantDetails));
      
      if (formData.portfolioLink) {
        submitFormData.append('portfolioLink', formData.portfolioLink);
      }
      
      // Append resume file
      submitFormData.append('resume', resumeFile);

      const token = localStorage.getItem('token');
      
      console.log('Submitting application data:', {
        internshipId: internship._id,
        applicantDetails,
        portfolioLink: formData.portfolioLink,
        hasResume: !!resumeFile
      });

      const response = await fetch('/api/internships/applications/apply', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: submitFormData
      });

      const result = await response.json();
      console.log('Backend response:', result);

      if (result.success) {
        toast({
          title: 'Application Submitted!',
          description: 'Your internship application has been submitted successfully.'
        });
        resetForm();
        onSuccess();
        onOpenChange(false);
      } else {
        throw new Error(result.message || 'Failed to submit application');
      }
    } catch (error: any) {
      console.error('Application error:', error);
      toast({
        title: 'Application Failed',
        description: error.message || 'Failed to submit application. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      college: '',
      qualification: '',
      skills: '',
      experience: '',
      coverLetter: '',
      portfolioLink: ''
    });
    setResumeFile(null);
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
      // Check file type
      const allowedTypes = [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a PDF or Word document (PDF, DOC, DOCX)',
          variant: 'destructive'
        });
        return;
      }
      
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Please upload a file smaller than 5MB',
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
              {internship.mode === 'Paid' && internship.stipendAmount && (
                <div className="text-right">
                  <p className="text-sm text-blue-600">Stipend</p>
                  <p className="text-xl font-bold text-green-600 flex items-center">
                    <IndianRupee className="h-5 w-5" />
                    {internship.stipendAmount.toLocaleString()}/month
                  </p>
                </div>
              )}
              {internship.mode === 'Unpaid' && (
                <div className="text-right">
                  <p className="text-sm text-blue-600">Internship Type</p>
                  <p className="text-lg font-bold text-green-600">UNPAID</p>
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
              <Label htmlFor="college">College/University *</Label>
              <Input
                id="college"
                value={formData.college}
                onChange={(e) => handleInputChange('college', e.target.value)}
                required
                placeholder="e.g., IIT Delhi, MIT"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qualification">Qualification *</Label>
              <Input
                id="qualification"
                value={formData.qualification}
                onChange={(e) => handleInputChange('qualification', e.target.value)}
                required
                placeholder="e.g., B.Tech Computer Science"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <Input
                id="skills"
                value={formData.skills}
                onChange={(e) => handleInputChange('skills', e.target.value)}
                placeholder="e.g., JavaScript, React, Node.js"
              />
              <p className="text-sm text-gray-500">Separate skills with commas</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolioLink">Portfolio/GitHub Link (Optional)</Label>
            <Input
              id="portfolioLink"
              value={formData.portfolioLink}
              onChange={(e) => handleInputChange('portfolioLink', e.target.value)}
              placeholder="https://github.com/yourusername"
            />
          </div>

          {/* Resume Upload */}
          <div className="space-y-2">
            <Label htmlFor="resume">Resume *</Label>
            {!resumeFile ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  id="resume"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Label htmlFor="resume" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-700">
                    Click to upload your resume
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, DOC, DOCX up to 5MB
                  </p>
                </Label>
              </div>
            ) : (
              <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 font-bold text-sm">PDF</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{resumeFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeResume}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Previous Experience (Optional)</Label>
            <Textarea
              id="experience"
              value={formData.experience}
              onChange={(e) => handleInputChange('experience', e.target.value)}
              placeholder="Describe your previous work experience or projects"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
            <Textarea
              id="coverLetter"
              value={formData.coverLetter}
              onChange={(e) => handleInputChange('coverLetter', e.target.value)}
              placeholder="Why are you interested in this internship and what makes you a good candidate?"
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !resumeFile}
              className="min-w-32"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Applying...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyInternshipDialog;
