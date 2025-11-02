// components/internships/ApplyInternshipDialog.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { IndianRupee, Building2, MapPin, Calendar, Clock, Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface ApplyInternshipDialogProps {
  internship: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ApplyInternshipDialog = ({ internship, open, onOpenChange, onSuccess }: ApplyInternshipDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    qualification: '',
    portfolioLink: '',
    coverLetter: ''
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'coverLetter') => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'File size should be less than 5MB',
          variant: 'destructive'
        });
        return;
      }

      // Validate file type
      const allowedTypes = ['.pdf', '.doc', '.docx'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(fileExtension || '')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload PDF, DOC, or DOCX files only',
          variant: 'destructive'
        });
        return;
      }

      if (type === 'resume') {
        setResumeFile(file);
      } else {
        setCoverLetterFile(file);
      }
    }
  };

  const handleRazorpayPayment = async (paymentData: any, applicationId: string) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: paymentData.amount,
      currency: paymentData.currency,
      name: internship.companyName,
      description: `Payment for ${internship.title}`,
      order_id: paymentData.id,
      handler: async (response: any) => {
        try {
          // Verify payment for AP internship
          const verifyResponse = await fetch('/api/internships/apinternshipverify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            toast({
              title: 'Application Submitted',
              description: 'Your internship application has been submitted successfully!'
            });
            onSuccess();
          } else {
            throw new Error(verifyData.message || 'Payment verification failed');
          }
        } catch (error: any) {
          toast({
            title: 'Payment Failed',
            description: error.message || 'Payment verification failed',
            variant: 'destructive'
          });
        }
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone
      },
      theme: {
        color: '#4F46E5'
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resumeFile) {
      toast({
        title: 'Resume Required',
        description: 'Please upload your resume',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add application data
      formDataToSend.append('internshipId', internship._id);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('college', formData.college);
      formDataToSend.append('qualification', formData.qualification);
      
      if (formData.portfolioLink) {
        formDataToSend.append('portfolioLink', formData.portfolioLink);
      }
      
      // Add files
      if (resumeFile) {
        formDataToSend.append('resume', resumeFile);
      }
      if (coverLetterFile) {
        formDataToSend.append('coverLetter', coverLetterFile);
      }

      const token = localStorage.getItem('token');
      
      // Use AP internship application endpoint
      const response = await fetch('/api/internships/apinternshipapply', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success) {
        if (data.razorpayOrder) {
          // Handle payment flow for paid internships
          await handleRazorpayPayment(data.razorpayOrder, data.application?._id);
        } else {
          toast({
            title: 'Application Submitted',
            description: 'Your internship application has been submitted successfully!'
          });
          onSuccess();
        }
      } else {
        throw new Error(data.message || 'Failed to submit application');
      }
    } catch (error: any) {
      console.error('Application error:', error);
      toast({
        title: 'Application Failed',
        description: error.message || 'Failed to submit application',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!internship) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply for Internship</DialogTitle>
          <DialogDescription>
            Complete your application for this internship opportunity.
          </DialogDescription>
        </DialogHeader>

        {/* Internship Details */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-lg mb-2">{internship.title}</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              <Building2 className="h-4 w-4 mr-2 text-gray-500" />
              <span>{internship.companyName}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
              <span>{internship.location}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gray-500" />
              <span>{internship.duration}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span>Apply by {new Date(internship.applicationDeadline).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Badge variant={internship.mode === 'Paid' ? 'default' : 'outline'}>
              {internship.mode}
            </Badge>
            {internship.amount && internship.amount > 0 && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <IndianRupee className="h-3 w-3 mr-1" />
                {internship.amount}/month
              </Badge>
            )}
          </div>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="college">College/University *</Label>
              <Input
                id="college"
                value={formData.college}
                onChange={(e) => setFormData({...formData, college: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qualification">Qualification *</Label>
            <Input
              id="qualification"
              value={formData.qualification}
              onChange={(e) => setFormData({...formData, qualification: e.target.value})}
              placeholder="e.g., B.Tech Computer Science, 3rd Year"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolioLink">Portfolio/GitHub Link (Optional)</Label>
            <Input
              id="portfolioLink"
              type="url"
              value={formData.portfolioLink}
              onChange={(e) => setFormData({...formData, portfolioLink: e.target.value})}
              placeholder="https://github.com/yourusername"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume">Resume *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileChange(e, 'resume')}
                className="hidden"
              />
              <Label htmlFor="resume" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">
                  {resumeFile ? resumeFile.name : 'Click to upload resume (PDF, DOC, DOCX)'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Max file size: 5MB</p>
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <Input
                id="coverLetter"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileChange(e, 'coverLetter')}
                className="hidden"
              />
              <Label htmlFor="coverLetter" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">
                  {coverLetterFile ? coverLetterFile.name : 'Click to upload cover letter (PDF, DOC, DOCX)'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Max file size: 5MB</p>
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
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {internship.mode === 'Paid' && internship.amount > 0 ? 'Pay & Apply' : 'Submit Application'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyInternshipDialog;
