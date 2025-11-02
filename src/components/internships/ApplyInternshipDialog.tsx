// components/internships/ApplyInternshipDialog.tsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface APInternship {
  _id: string;
  title: string;
  companyName: string;
  mode: 'Free' | 'Paid';
  amount?: number;
  stream: string;
  duration: string;
}

interface ApplyInternshipDialogProps {
  internship: APInternship | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ApplyInternshipDialog: React.FC<ApplyInternshipDialogProps> = ({
  internship,
  open,
  onOpenChange,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    qualification: '',
    portfolioLink: ''
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);

  const { toast } = useToast();
  const { user } = useAuth();

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open && user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        college: user.college || '',
        qualification: user.qualification || '',
        portfolioLink: ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        college: '',
        qualification: '',
        portfolioLink: ''
      });
      setResumeFile(null);
      setCoverLetterFile(null);
    }
  }, [open, user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check file type
      if (!file.type.includes('pdf') && !file.type.includes('msword') && !file.type.includes('wordprocessingml')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload PDF or DOC/DOCX files only',
          variant: 'destructive'
        });
        return;
      }
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload files smaller than 5MB',
          variant: 'destructive'
        });
        return;
      }
      setFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!internship) return;

    // Validation
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: 'Missing information',
        description: 'Name, email, and phone are required',
        variant: 'destructive'
      });
      return;
    }

    if (!resumeFile) {
      toast({
        title: 'Resume required',
        description: 'Please upload your resume',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('internshipId', internship._id);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('college', formData.college || '');
      formDataToSend.append('qualification', formData.qualification || '');
      formDataToSend.append('portfolioLink', formData.portfolioLink || '');
      formDataToSend.append('resume', resumeFile);
      
      if (coverLetterFile) {
        formDataToSend.append('coverLetter', coverLetterFile);
      }

      const token = localStorage.getItem('token');
      const response = await fetch('/api/internships/apinternshipapply', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Handle free internship - instant enrollment
        if (internship.mode === 'Free') {
          toast({
            title: 'Application Successful!',
            description: `You have been successfully enrolled in "${internship.title}"`,
            variant: 'default'
          });
          onSuccess();
          onOpenChange(false);
        } 
        // Handle paid internship - payment flow
        else if (internship.mode === 'Paid' && data.razorpayOrder) {
          // Initialize Razorpay payment
          const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: data.razorpayOrder.amount,
            currency: data.razorpayOrder.currency,
            name: 'Triaright Education',
            description: `Internship: ${internship.title}`,
            order_id: data.razorpayOrder.id,
            handler: async function (response: any) {
              // Verify payment on backend
              const verifyResponse = await fetch('/api/internships/apinternshipverify-payment', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              });

              const verifyData = await verifyResponse.json();

              if (verifyResponse.ok && verifyData.success) {
                toast({
                  title: 'Payment Successful!',
                  description: `You have been successfully enrolled in "${internship.title}"`,
                  variant: 'default'
                });
                onSuccess();
                onOpenChange(false);
              } else {
                toast({
                  title: 'Payment Failed',
                  description: verifyData.message || 'Payment verification failed',
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

          const razorpay = new (window as any).Razorpay(options);
          razorpay.open();
          
          razorpay.on('payment.failed', function (response: any) {
            toast({
              title: 'Payment Failed',
              description: response.error.description || 'Payment could not be completed',
              variant: 'destructive'
            });
          });
        }
      } else {
        throw new Error(data.message || 'Failed to apply for internship');
      }
    } catch (error: any) {
      console.error('Application error:', error);
      toast({
        title: 'Application Failed',
        description: error.message || 'Failed to apply for internship',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!internship) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Apply for {internship.title}</DialogTitle>
          <DialogDescription className="text-sm">
            {internship.mode === 'Free' 
              ? 'This is a free internship. You will be instantly enrolled upon application.'
              : `This is a paid internship. Amount: ₹${internship.amount}`
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information - Split into 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Personal Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Full Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Email *</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Phone *</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Education & Files */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Education & Documents</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">College/University</label>
                  <Input
                    value={formData.college}
                    onChange={(e) => setFormData({...formData, college: e.target.value})}
                    className="mt-1"
                    placeholder="Enter your college name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Qualification</label>
                  <Input
                    value={formData.qualification}
                    onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                    className="mt-1"
                    placeholder="e.g., B.Tech Computer Science"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Portfolio Link</label>
                  <Input
                    type="url"
                    value={formData.portfolioLink}
                    onChange={(e) => setFormData({...formData, portfolioLink: e.target.value})}
                    className="mt-1"
                    placeholder="https://github.com/yourusername"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* File Uploads - Full width below */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900">Upload Documents</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Resume (PDF/DOC) *</label>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileChange(e, setResumeFile)}
                  required
                />
                <p className="text-xs text-gray-500">Max 5MB, PDF or DOC/DOCX files only</p>
                {resumeFile && (
                  <p className="text-sm text-green-600">✓ {resumeFile.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Cover Letter (PDF/DOC)</label>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileChange(e, setCoverLetterFile)}
                />
                <p className="text-xs text-gray-500">Optional, Max 5MB</p>
                {coverLetterFile && (
                  <p className="text-sm text-green-600">✓ {coverLetterFile.name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Internship Summary */}
          <div className="bg-gray-50 rounded-lg p-4 border">
            <h4 className="font-semibold text-gray-900 mb-2">Internship Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Company:</span>
                <p className="font-medium">{internship.companyName}</p>
              </div>
              <div>
                <span className="text-gray-600">Mode:</span>
                <p className="font-medium">{internship.mode}</p>
              </div>
              <div>
                <span className="text-gray-600">Stream:</span>
                <p className="font-medium">{internship.stream}</p>
              </div>
              <div>
                <span className="text-gray-600">Duration:</span>
                <p className="font-medium">{internship.duration}</p>
              </div>
              {internship.mode === 'Paid' && internship.amount && (
                <div className="col-span-2">
                  <span className="text-gray-600">Amount:</span>
                  <p className="font-medium text-green-600">₹{internship.amount}</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="sm:flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="sm:flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {internship.mode === 'Free' ? 'Apply & Enroll Now' : 'Proceed to Payment'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyInternshipDialog;
