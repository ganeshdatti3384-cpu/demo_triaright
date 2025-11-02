// components/internships/ApplyInternshipDialog.tsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Tag } from 'lucide-react';

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
  const [applyingWithCoupon, setApplyingWithCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    qualification: '',
    portfolioLink: '',
    coverLetter: '' // Text cover letter
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
        portfolioLink: '',
        coverLetter: ''
      });
      
      // Reset coupon state
      setCouponCode('');
      setCouponApplied(false);
      setDiscountAmount(0);
      setApplyingWithCoupon(false);
      setFinalAmount(internship?.amount || 0);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        college: '',
        qualification: '',
        portfolioLink: '',
        coverLetter: ''
      });
      setResumeFile(null);
      setCoverLetterFile(null);
      setCouponCode('');
      setCouponApplied(false);
      setDiscountAmount(0);
      setApplyingWithCoupon(false);
    }
  }, [open, user, internship]);

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

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !internship || internship.mode !== 'Paid') {
      return;
    }

    setCouponLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/internships/validate-coupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          couponCode: couponCode.toUpperCase(),
          internshipId: internship._id,
          amount: internship.amount
        })
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setCouponApplied(true);
        setDiscountAmount(data.discountAmount);
        setFinalAmount(data.finalAmount);
        toast({
          title: 'Coupon Applied!',
          description: `Discount of ₹${data.discountAmount} applied successfully`,
          variant: 'default'
        });
      } else {
        toast({
          title: 'Invalid Coupon',
          description: data.message || 'This coupon code is not valid',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Coupon Error',
        description: 'Failed to validate coupon code',
        variant: 'destructive'
      });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setCouponCode('');
    setDiscountAmount(0);
    setFinalAmount(internship?.amount || 0);
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
      formDataToSend.append('coverLetterText', formData.coverLetter || '');
      formDataToSend.append('resume', resumeFile);
      
      if (coverLetterFile) {
        formDataToSend.append('coverLetter', coverLetterFile);
      }

      // Add coupon code if applied
      if (couponApplied && couponCode) {
        formDataToSend.append('couponCode', couponCode.toUpperCase());
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
        // Handle paid internship with coupon code enrollment
        else if (internship.mode === 'Paid' && couponApplied) {
          toast({
            title: 'Application Successful!',
            description: `You have been successfully enrolled in "${internship.title}" using coupon code`,
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
                  razorpay_signature: response.razorpay_signature,
                  applicationId: data.applicationId // Pass the application ID for payment linking
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

          {/* Cover Letter Text */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Cover Letter</h3>
            <Textarea
              value={formData.coverLetter}
              onChange={(e) => setFormData({...formData, coverLetter: e.target.value})}
              placeholder="Tell us why you're interested in this internship and what makes you a good candidate..."
              className="min-h-[100px] resize-vertical"
            />
            <p className="text-xs text-gray-500">Optional - You can also upload a cover letter file below</p>
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

          {/* Coupon Code Section - Only for Paid Internships */}
          {internship.mode === 'Paid' && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Coupon Code</h3>
                {!applyingWithCoupon && !couponApplied && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setApplyingWithCoupon(true)}
                    className="flex items-center gap-2"
                  >
                    <Tag className="h-4 w-4" />
                    Apply Coupon
                  </Button>
                )}
              </div>

              {applyingWithCoupon && !couponApplied && (
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1"
                    disabled={couponLoading}
                  />
                  <Button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim() || couponLoading}
                    variant="outline"
                  >
                    {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setApplyingWithCoupon(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}

              {couponApplied && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-800 font-medium">Coupon Applied</p>
                      <p className="text-green-600 text-sm">Code: {couponCode}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveCoupon}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

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
                <div className="col-span-2 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Original Amount:</span>
                    <span className="font-medium">₹{internship.amount}</span>
                  </div>
                  {couponApplied && (
                    <>
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-₹{discountAmount}</span>
                      </div>
                      <div className="flex justify-between border-t pt-1">
                        <span className="text-gray-600 font-semibold">Final Amount:</span>
                        <span className="font-bold text-green-600">₹{finalAmount}</span>
                      </div>
                    </>
                  )}
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
                {internship.mode === 'Free' 
                  ? 'Apply & Enroll Now' 
                  : couponApplied 
                    ? 'Apply with Coupon' 
                    : 'Proceed to Payment'
                }
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyInternshipDialog;
