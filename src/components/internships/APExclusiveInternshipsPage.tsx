// components/internships/APExclusiveInternshipsPage.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, MapPin, Building2, Calendar, IndianRupee, Clock, Users, BookOpen, Star, CheckCircle, Shield, Award, Zap, TrendingUp, Globe, Bookmark, Eye, Share2, Heart, ChevronLeft, ChevronRight, Tag, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ApplyInternshipDialog from './ApplyInternshipDialog';
import APRazorpayPayment from './APRazorpayPayment';

interface APInternship {
  _id: string;
  internshipId?: string;
  title: string;
  description: string;
  companyName: string;
  location: string;
  internshipType: 'Online' | 'Offline';
  term: 'Shortterm' | 'Longterm';
  duration: string;
  startDate: string;
  applicationDeadline: string;
  mode: 'Free' | 'Paid';
  stream: string;
  amount?: number;
  currency: string;
  qualification: string;
  openings: number;
  status: 'Open' | 'Closed' | 'On Hold';
  postedBy: string;
  createdAt: string;
  views?: number;
  applications?: number;
  rating?: number;
}

interface Enrollment {
  _id: string;
  internshipId: string;
  status: 'active' | 'completed' | 'cancelled';
  enrolledAt: string;
}

interface Application {
  _id: string;
  internshipId: string;
  userId: string;
  status: string;
  paymentStatus: string;
  enrollmentId?: string;
  orderId?: string;
  enrollmentType?: string;
}

interface Coupon {
  _id: string;
  code: string;
  discountAmount: number;
  applicableInternship?: string;
  usageLimit: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
  description: string;
}

const trustBadges = [
  {
    name: "Skill India",
    image: "/lovable-uploads/skill-india-badge.png",
    alt: "Skill India - Government of India",
    category: "Government"
  },
  {
    name: "Startup India",
    image: "/lovable-uploads/startup-india-badge.png",
    alt: "Startup India - Government of India",
    category: "Government"
  },
  {
    name: "AICTE",
    image: "/lovable-uploads/aicte-badge.png",
    alt: "AICTE Approved",
    category: "Education"
  },
  {
    name: "APSSDC",
    image: "/lovable-uploads/apssdc-badge.png",
    alt: "APSSDC Partner",
    category: "Government"
  },
  {
    name: "ISO 9001:2015",
    image: "/lovable-uploads/iso-badge.png",
    alt: "ISO 9001:2015 Certified",
    category: "Quality"
  },
  {
    name: "MSME",
    image: "/lovable-uploads/msme-badge.png",
    alt: "MSME Registered",
    category: "Government"
  },
  {
    name: "NASSCOM",
    image: "/lovable-uploads/nasscom-badge.gif",
    alt: "NASSCOM Partner",
    category: "Industry"
  },
  {
    name: "NSDC",
    image: "/lovable-uploads/nsdc-badge.png",
    alt: "NSDC Partner",
    category: "Government"
  },
  {
    name: "APSCHE",
    image: "/lovable-uploads/apsche-badge.png",
    alt: "APSCHE Affiliated",
    category: "Education"
  }
];

const APExclusiveInternshipsPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [apInternships, setApInternships] = useState<APInternship[]>([]);
  const [filteredAPInternships, setFilteredAPInternships] = useState<APInternship[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    mode: 'all',
    stream: 'all',
    sort: 'newest'
  });
  const [selectedInternship, setSelectedInternship] = useState<APInternship | null>(null);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [showPaymentPage, setShowPaymentPage] = useState(false);
  const [showCouponDialog, setShowCouponDialog] = useState(false);
  const [applicationId, setApplicationId] = useState<string>('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [scrollPosition, setScrollPosition] = useState(0);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchAPInternships();
    if (isAuthenticated) {
      fetchEnrollments();
      fetchApplications();
    }
    fetchCoupons();
  }, [isAuthenticated]);

  useEffect(() => {
    filterInternships();
  }, [apInternships, searchTerm, filters, activeTab]);

  // Auto-scroll effect for trust badges
  useEffect(() => {
    if (!autoScrollEnabled) return;

    const container = document.getElementById('trust-badges-container');
    if (!container) return;

    const scrollInterval = setInterval(() => {
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (scrollPosition >= maxScroll) {
        // Reset to start when reaching the end
        container.scrollTo({ left: 0, behavior: 'smooth' });
        setScrollPosition(0);
      } else {
        const newPosition = scrollPosition + 1;
        container.scrollTo({ left: newPosition, behavior: 'smooth' });
        setScrollPosition(newPosition);
      }
    }, 30); // Adjust speed as needed

    return () => clearInterval(scrollInterval);
  }, [scrollPosition, autoScrollEnabled]);

  const fetchAPInternships = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/internships/ap-internships');
      const data = await response.json();
      if (data.success) {
        // Add some mock data for demo
        const internshipsWithStats = data.internships.map((internship: APInternship) => ({
          ...internship,
          views: Math.floor(Math.random() * 1000) + 100,
          applications: Math.floor(Math.random() * 200) + 50,
          rating: (Math.random() * 1 + 4).toFixed(1) // Random rating between 4.0 and 5.0
        }));
        setApInternships(internshipsWithStats.filter((internship: APInternship) => internship.status === 'Open'));
      }
    } catch (error) {
      console.error('Error fetching AP internships:', error);
      toast({
        title: 'Error',
        description: 'Failed to load AP internships',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    if (!isAuthenticated) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/internships/apinternshipmy-enrollments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setEnrollments(data.enrollments);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  const fetchApplications = async () => {
    if (!isAuthenticated) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/internships/apinternshipmy-applications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setApplications(data.applications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchCoupons = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/internships/coupons', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();
      if (data.success) {
        setCoupons(data.coupons.filter((coupon: Coupon) => 
          coupon.isActive && 
          new Date(coupon.expiresAt) > new Date() &&
          coupon.usedCount < coupon.usageLimit
        ));
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  };

  const filterInternships = () => {
    let filtered = apInternships.filter(internship => {
      const matchesSearch = internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           internship.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           internship.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filters.type === 'all' || internship.internshipType.toLowerCase() === filters.type;
      const matchesMode = filters.mode === 'all' || internship.mode.toLowerCase() === filters.mode;
      const matchesStream = filters.stream === 'all' || internship.stream.toLowerCase().includes(filters.stream);

      return matchesSearch && matchesType && matchesMode && matchesStream;
    });

    // Apply sorting
    switch (filters.sort) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'applications':
        filtered.sort((a, b) => (b.applications || 0) - (a.applications || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }

    // Apply tab-specific filtering
    if (activeTab === 'free') {
      filtered = filtered.filter(internship => internship.mode === 'Free');
    } else if (activeTab === 'paid') {
      filtered = filtered.filter(internship => internship.mode === 'Paid');
    } else if (activeTab === 'online') {
      filtered = filtered.filter(internship => internship.internshipType === 'Online');
    }

    setFilteredAPInternships(filtered);
  };

  const isEnrolled = (internshipId: string) => {
    return enrollments.some(enrollment => enrollment.internshipId === internshipId);
  };

  const hasApplied = (internshipId: string) => {
    return applications.some(application => 
      application.internshipId === internshipId
    );
  };

  const getApplication = (internshipId: string) => {
    return applications.find(application => application.internshipId === internshipId);
  };

  const getApplicationStatus = (internshipId: string) => {
    const application = getApplication(internshipId);
    if (!application) return 'not_applied';
    
    if (application.enrollmentId) return 'enrolled';
    if (application.paymentStatus === 'completed') return 'payment_completed';
    if (application.paymentStatus === 'pending') return 'payment_pending';
    
    return 'applied';
  };

  const handleEnroll = async (internship: APInternship) => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to enroll in internships',
        variant: 'destructive'
      });
      return;
    }

    if (user?.role !== 'student' && user?.role !== 'jobseeker') {
      toast({
        title: 'Access Denied',
        description: 'Only students and job seekers can enroll in internships',
        variant: 'destructive'
      });
      return;
    }

    // Check if already enrolled
    if (isEnrolled(internship._id)) {
      toast({
        title: 'Already Enrolled',
        description: 'You are already enrolled in this internship',
        variant: 'default'
      });
      return;
    }

    // Check application status
    const applicationStatus = getApplicationStatus(internship._id);
    const existingApplication = getApplication(internship._id);

    if (applicationStatus === 'enrolled') {
      toast({
        title: 'Already Enrolled',
        description: 'You are already enrolled in this internship',
        variant: 'default'
      });
      return;
    }

    if (applicationStatus === 'payment_pending' && internship.mode === 'Paid') {
      // Show payment page for pending paid applications
      setSelectedInternship(internship);
      setApplicationId(existingApplication!._id);
      setShowPaymentPage(true);
      return;
    }

    // Check if application deadline has passed
    if (isDeadlinePassed(internship.applicationDeadline)) {
      toast({
        title: 'Enrollment Closed',
        description: 'The enrollment deadline for this internship has passed',
        variant: 'destructive'
      });
      return;
    }

    setSelectedInternship(internship);

    // For free internships, enroll directly
    if (internship.mode === 'Free') {
      setEnrollLoading(internship._id);
      await enrollInFreeInternship(internship);
    } else {
      // For paid internships, show coupon dialog first
      setShowCouponDialog(true);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !selectedInternship) return;

    setCouponLoading(true);
    setCouponError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCouponError('Please login to apply coupon');
        return;
      }

      // Validate coupon by checking against active coupons
      const validCoupon = coupons.find(coupon => 
        coupon.code.toLowerCase() === couponCode.toLowerCase() &&
        (!coupon.applicableInternship || coupon.applicableInternship === selectedInternship._id)
      );

      if (validCoupon) {
        setAppliedCoupon(validCoupon);
        setCouponError('');
        toast({
          title: 'Coupon Applied!',
          description: `Discount of ₹${validCoupon.discountAmount} applied successfully`,
          variant: 'default'
        });
      } else {
        setCouponError('Invalid or expired coupon code');
      }
    } catch (error) {
      setCouponError('Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const proceedToPayment = async () => {
    if (!selectedInternship) return;

    setEnrollLoading(selectedInternship._id);
    setShowCouponDialog(false);

    try {
      await createPaidApplication(selectedInternship);
    } catch (error) {
      console.error('Error during enrollment:', error);
      toast({
        title: 'Enrollment Failed',
        description: 'Failed to process enrollment. Please try again.',
        variant: 'destructive'
      });
      setEnrollLoading(null);
    }
  };

  const enrollInFreeInternship = async (internship: APInternship) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/internships/apinternshipapply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          internshipId: internship._id
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Successfully Enrolled!',
          description: `You have been enrolled in ${internship.title}`,
          variant: 'default'
        });
        
        // Refresh enrollments and applications
        await fetchEnrollments();
        await fetchApplications();
        
        // Reset loading state
        setEnrollLoading(null);
        
        // Redirect to student dashboard after a delay
        setTimeout(() => {
          window.location.href = '/student-dashboard?tab=trainings';
        }, 2000);
      } else {
        throw new Error(data.message || 'Failed to enroll in internship');
      }
    } catch (error: any) {
      console.error('Error enrolling in free internship:', error);
      toast({
        title: 'Enrollment Failed',
        description: error.message || 'Failed to enroll in internship',
        variant: 'destructive'
      });
      setEnrollLoading(null);
    }
  };

  const createPaidApplication = async (internship: APInternship) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const requestBody: any = {
        internshipId: internship._id
      };

      // Add coupon code if applied
      if (appliedCoupon) {
        requestBody.couponCode = appliedCoupon.code;
      }

      const response = await fetch('/api/internships/apinternshipapply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setApplicationId(data.application._id);
        
        // For paid internships, proceed to payment
        setShowPaymentPage(true);
        
        // Reset coupon state
        setAppliedCoupon(null);
        setCouponCode('');
        setEnrollLoading(null);
        
        // Refresh applications to get updated status
        await fetchApplications();
      } else {
        throw new Error(data.message || 'Failed to create application');
      }
    } catch (error: any) {
      console.error('Error creating paid application:', error);
      throw error;
    }
  };

  const handlePaymentSuccess = () => {
    toast({
      title: 'Payment Successful!',
      description: `You have been successfully enrolled in ${selectedInternship?.title}`,
      variant: 'default'
    });
    
    // Refresh enrollments and applications
    fetchEnrollments();
    fetchApplications();
    
    setTimeout(() => {
      window.location.href = '/student-dashboard?tab=trainings';
    }, 2000);
  };

  const handlePaymentBack = () => {
    setShowPaymentPage(false);
    setSelectedInternship(null);
    setApplicationId('');
    setEnrollLoading(null);
  };

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const getModeBadge = (mode: string) => {
    const variants = {
      Paid: 'default',
      Free: 'secondary'
    } as const;

    return (
      <Badge variant={variants[mode as keyof typeof variants] || 'outline'}>
        {mode}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      Online: 'secondary',
      Offline: 'default'
    } as const;

    return (
      <Badge variant={variants[type as keyof typeof variants] || 'outline'}>
        {type}
      </Badge>
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= Math.floor(rating)
                ? 'text-yellow-400 fill-yellow-400'
                : star === Math.ceil(rating) && rating % 1 !== 0
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm font-medium ml-1">{rating}</span>
      </div>
    );
  };

  const handleTrustBadgeContainerHover = () => {
    setAutoScrollEnabled(false);
  };

  const handleTrustBadgeContainerLeave = () => {
    setAutoScrollEnabled(true);
  };

  const calculateDiscountedAmount = (originalAmount: number) => {
    if (!appliedCoupon) return originalAmount;
    return Math.max(0, originalAmount - appliedCoupon.discountAmount);
  };

  const CouponDialog = () => {
    if (!selectedInternship) return null;

    const originalAmount = selectedInternship.amount || 0;
    const discountedAmount = calculateDiscountedAmount(originalAmount);
    const hasDiscount = appliedCoupon && discountedAmount < originalAmount;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Apply Coupon</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowCouponDialog(false);
                setEnrollLoading(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Price Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Price Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Original Price:</span>
                  <span className="font-semibold">₹{originalAmount.toLocaleString()}</span>
                </div>
                {hasDiscount && (
                  <>
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-₹{appliedCoupon.discountAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-blue-200 pt-2">
                      <span className="font-semibold">Final Amount:</span>
                      <span className="font-bold text-green-600 text-lg">
                        ₹{discountedAmount.toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Coupon Input */}
            {!appliedCoupon && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Enter Coupon Code</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                  >
                    {couponLoading ? 'Applying...' : 'Apply'}
                  </Button>
                </div>
                {couponError && (
                  <p className="text-sm text-red-600">{couponError}</p>
                )}
              </div>
            )}

            {/* Applied Coupon */}
            {appliedCoupon && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-green-600" />
                    <span className="font-medium">{appliedCoupon.code}</span>
                    <Badge variant="outline" className="bg-green-100 text-green-700">
                      -₹{appliedCoupon.discountAmount}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeCoupon}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  {appliedCoupon.description}
                </p>
              </div>
            )}

            {/* Available Coupons */}
            {coupons.length > 0 && !appliedCoupon && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Available Coupons</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {coupons.map((coupon) => (
                    <div
                      key={coupon._id}
                      className="flex justify-between items-center p-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setCouponCode(coupon.code);
                        handleApplyCoupon();
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Tag className="h-3 w-3 text-blue-600" />
                        <span className="font-medium text-sm">{coupon.code}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        -₹{coupon.discountAmount}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCouponDialog(false);
                  setEnrollLoading(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={proceedToPayment}
                disabled={enrollLoading === selectedInternship._id}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {enrollLoading === selectedInternship._id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  `Proceed to Pay ₹${discountedAmount.toLocaleString()}`
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const InternshipCard = ({ internship }: { internship: APInternship }) => {
    const deadlinePassed = isDeadlinePassed(internship.applicationDeadline);
    const enrolled = isEnrolled(internship._id);
    const applicationStatus = getApplicationStatus(internship._id);
    const application = getApplication(internship._id);
    const daysLeft = Math.ceil((new Date(internship.applicationDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const isLoading = enrollLoading === internship._id;
    
    const getButtonText = () => {
      if (enrolled) return 'Go to Dashboard';
      if (applicationStatus === 'payment_pending') return 'Complete Payment';
      if (applicationStatus === 'payment_completed') return 'Processing...';
      if (applicationStatus === 'applied') return 'Processing...';
      if (internship.mode === 'Free') return 'Enroll Free';
      return 'Enroll Now';
    };

    const getButtonVariant = () => {
      if (enrolled) return 'default';
      if (applicationStatus === 'payment_pending') return 'default';
      if (deadlinePassed) return 'outline';
      return 'default';
    };

    const getButtonStyle = () => {
      if (enrolled) return 'bg-green-600 hover:bg-green-700';
      if (applicationStatus === 'payment_pending') return 'bg-orange-600 hover:bg-orange-700';
      if (deadlinePassed) return '';
      return 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700';
    };

    return (
      <Card className="h-full flex flex-col border-2 border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 group overflow-hidden">
        {/* Popular Badge */}
        {internship.applications && internship.applications > 100 && (
          <div className="absolute top-4 right-4 z-10">
            <Badge className="bg-red-500 text-white hover:bg-red-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              Popular
            </Badge>
          </div>
        )}
        
        {/* Card Header with Gradient */}
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 rounded-full -mr-10 -mt-10 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-indigo-200 rounded-full -ml-8 -mb-8 opacity-50"></div>
          
          <div className="flex justify-between items-start mb-2 relative z-10">
            <div className="flex-1">
              <CardTitle className="text-lg mb-1 line-clamp-2 group-hover:text-blue-700 transition-colors">
                {internship.title}
              </CardTitle>
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Building2 className="h-4 w-4 mr-1" />
                <span className="line-clamp-1 font-medium">{internship.companyName}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap shadow-sm">
                <Star className="h-3 w-3 mr-1" />
                AP Exclusive
              </Badge>
              {enrolled && (
                <Badge variant="default" className="bg-green-500 text-white shadow-sm">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Enrolled
                </Badge>
              )}
              {applicationStatus === 'payment_pending' && (
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 shadow-sm">
                  <Clock className="h-3 w-3 mr-1" />
                  Payment Pending
                </Badge>
              )}
              {(applicationStatus === 'applied' || applicationStatus === 'payment_completed') && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 shadow-sm">
                  <Clock className="h-3 w-3 mr-1" />
                  Processing
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3 relative z-10">
            {getModeBadge(internship.mode)}
            {getTypeBadge(internship.internshipType)}
            <Badge variant="outline" className="flex items-center bg-white">
              <MapPin className="h-3 w-3 mr-1" />
              {internship.location}
            </Badge>
          </div>

          {/* Rating and Stats */}
          <div className="flex items-center justify-between text-sm relative z-10">
            {internship.rating && renderStars(internship.rating)}
            <div className="flex items-center gap-4 text-gray-500">
              <div className="flex items-center">
                <Eye className="h-3 w-3 mr-1" />
                {internship.views}
              </div>
              <div className="flex items-center">
                <Users className="h-3 w-3 mr-1" />
                {internship.applications}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-grow pt-4">
          <CardDescription className="line-clamp-3 text-sm mb-4">
            {internship.description}
          </CardDescription>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Duration:
              </span>
              <span className="font-medium text-gray-900">
                {internship.duration}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Start Date:
              </span>
              <span className="font-medium text-gray-900">
                {new Date(internship.startDate).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Apply Before:
              </span>
              <span className={`font-medium flex items-center ${deadlinePassed ? 'text-red-600' : daysLeft <= 3 ? 'text-orange-600' : 'text-green-600'}`}>
                {new Date(internship.applicationDeadline).toLocaleDateString()}
                {!deadlinePassed && daysLeft <= 7 && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {daysLeft}d left
                  </Badge>
                )}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Openings:
              </span>
              <span className="font-medium text-gray-900">
                {internship.openings} seats
              </span>
            </div>
            
            {internship.amount && internship.amount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center">
                  <IndianRupee className="h-4 w-4 mr-2" />
                  Amount:
                </span>
                <span className="font-medium flex items-center text-green-600">
                  <IndianRupee className="h-3 w-3 mr-1" />
                  {internship.amount.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="pt-4 border-t border-gray-100">
          <Button 
            className={`w-full shadow-sm ${getButtonStyle()}`}
            onClick={() => {
              if (enrolled) {
                window.location.href = '/student-dashboard?tab=trainings';
              } else {
                handleEnroll(internship);
              }
            }}
            disabled={deadlinePassed || isLoading || applicationStatus === 'applied' || applicationStatus === 'payment_completed'}
            variant={getButtonVariant()}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              <div className="flex items-center">
                {enrolled && <BookOpen className="h-4 w-4 mr-2" />}
                {applicationStatus === 'payment_pending' && <IndianRupee className="h-4 w-4 mr-2" />}
                {internship.mode === 'Free' && !enrolled && <Zap className="h-4 w-4 mr-2" />}
                {internship.mode === 'Paid' && !enrolled && applicationStatus !== 'payment_pending' && <Star className="h-4 w-4 mr-2" />}
                {getButtonText()}
              </div>
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  // Show payment page if applicable
  if (showPaymentPage && selectedInternship) {
    return (
      <APRazorpayPayment
        internshipId={selectedInternship._id}
        internshipTitle={selectedInternship.title}
        amount={selectedInternship.amount || 0}
        applicationId={applicationId}
        couponCode={appliedCoupon?.code}
        discountAmount={appliedCoupon?.discountAmount || 0}
        onPaymentSuccess={handlePaymentSuccess}
        onBack={handlePaymentBack}
      />
    );
  }

  if (loading && !showPaymentPage) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <div className="text-center text-gray-600">Loading AP Exclusive internships...</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-6">
              <div className="flex items-center justify-center p-2 bg-blue-600 text-white rounded-full">
                <Star className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AP Exclusive Internships
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Premium internship opportunities exclusively for Andhra Pradesh students. 
              Access unique programs, government initiatives, and industry partnerships.
            </p>
          </div>

          {/* Premium Trust Badges Section with Auto Scrolling Only */}
          <Card className="mb-12 border-0 shadow-2xl bg-gradient-to-r from-white to-blue-50 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            <CardHeader className="text-center pb-6 pt-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Trusted & Recognized
                </CardTitle>
                <Award className="h-8 w-8 text-indigo-600" />
              </div>
            </CardHeader>
            <CardContent className="pb-8">
              {/* Trust Badges Auto Scroll Container */}
              <div className="relative">
                {/* Trust Badges Scroll Container - Auto Scroll Only */}
                <div
                  id="trust-badges-container"
                  className="flex overflow-x-hidden gap-6 px-2 py-4"
                  style={{ scrollBehavior: 'smooth' }}
                  onMouseEnter={handleTrustBadgeContainerHover}
                  onMouseLeave={handleTrustBadgeContainerLeave}
                >
                  {trustBadges.map((badge, index) => (
                    <div 
                      key={index} 
                      className="group flex-shrink-0 flex flex-col items-center justify-center p-6 bg-white rounded-2xl border-2 border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 min-w-[180px]"
                    >
                      <div className="w-20 h-20 mb-4 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-3 group-hover:scale-110 transition-transform duration-300">
                        <img 
                          src={badge.image} 
                          alt={badge.alt}
                          className="max-w-full max-h-full object-contain filter group-hover:brightness-110 transition-all"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden text-xs text-center text-gray-500 font-medium">
                          {badge.name}
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-800 text-center leading-tight">
                        {badge.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Search and Filters */}
          <Card className="mb-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search AP internships by title, company, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 bg-white border-2 border-gray-200 focus:border-blue-500 rounded-xl text-lg shadow-sm"
                  />
                </div>
                <div className="flex gap-4 flex-wrap">
                  <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                    <SelectTrigger className="w-48 bg-white border-2 border-gray-200 rounded-xl shadow-sm">
                      <SelectValue placeholder="Internship Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filters.mode} onValueChange={(value) => setFilters({...filters, mode: value})}>
                    <SelectTrigger className="w-40 bg-white border-2 border-gray-200 rounded-xl shadow-sm">
                      <SelectValue placeholder="Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modes</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="free">Free</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filters.sort} onValueChange={(value) => setFilters({...filters, sort: value})}>
                    <SelectTrigger className="w-44 bg-white border-2 border-gray-200 rounded-xl shadow-sm">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="applications">Most Applications</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Tabs and Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl p-2 shadow-lg">
              <TabsTrigger 
                value="all" 
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
              >
                <Globe className="h-4 w-4 mr-2" />
                All Internships
              </TabsTrigger>
              <TabsTrigger 
                value="free" 
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
              >
                <Zap className="h-4 w-4 mr-2" />
                Free
              </TabsTrigger>
              <TabsTrigger 
                value="paid" 
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
              >
                <Star className="h-4 w-4 mr-2" />
                Paid
              </TabsTrigger>
              <TabsTrigger 
                value="online" 
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
              >
                <Globe className="h-4 w-4 mr-2" />
                Online
              </TabsTrigger>
            </TabsList>

            {/* All Internships */}
            <TabsContent value="all" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredAPInternships.map((internship) => (
                  <InternshipCard key={internship._id} internship={internship} />
                ))}
              </div>
              {filteredAPInternships.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="h-12 w-12 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No AP internships found</h3>
                  <p className="text-gray-600 text-lg max-w-md mx-auto">
                    Try adjusting your search criteria or check back later for new premium opportunities.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Free Internships */}
            <TabsContent value="free" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredAPInternships.map((internship) => (
                  <InternshipCard key={internship._id} internship={internship} />
                ))}
              </div>
              {filteredAPInternships.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Zap className="h-12 w-12 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No free AP internships found</h3>
                  <p className="text-gray-600 text-lg max-w-md mx-auto">
                    Try adjusting your filters or check back later for new free opportunities.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Paid Internships */}
            <TabsContent value="paid" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredAPInternships.map((internship) => (
                  <InternshipCard key={internship._id} internship={internship} />
                ))}
              </div>
              {filteredAPInternships.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Star className="h-12 w-12 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No paid AP internships found</h3>
                  <p className="text-gray-600 text-lg max-w-md mx-auto">
                    Try adjusting your filters or check back later for new paid opportunities.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Online Internships */}
            <TabsContent value="online" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredAPInternships.map((internship) => (
                  <InternshipCard key={internship._id} internship={internship} />
                ))}
              </div>
              {filteredAPInternships.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Globe className="h-12 w-12 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No online AP internships found</h3>
                  <p className="text-gray-600 text-lg max-w-md mx-auto">
                    Try adjusting your filters or check back later for new online opportunities.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Enhanced Stats Section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white overflow-hidden">
              <CardContent className="pt-8 pb-6 text-center relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-white/20"></div>
                <div className="text-4xl font-bold mb-2">{apInternships.length}</div>
                <p className="text-blue-100">AP Exclusive Internships</p>
                <div className="absolute bottom-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mb-8"></div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white overflow-hidden">
              <CardContent className="pt-8 pb-6 text-center relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-white/20"></div>
                <div className="text-4xl font-bold mb-2">
                  {apInternships.filter(i => i.mode === 'Free').length}
                </div>
                <p className="text-green-100">Free Opportunities</p>
                <div className="absolute bottom-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mb-8"></div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white overflow-hidden">
              <CardContent className="pt-8 pb-6 text-center relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-white/20"></div>
                <div className="text-4xl font-bold mb-2">
                  {apInternships.filter(i => i.internshipType === 'Online').length}
                </div>
                <p className="text-purple-100">Online Programs</p>
                <div className="absolute bottom-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mb-8"></div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-500 to-red-600 text-white overflow-hidden">
              <CardContent className="pt-8 pb-6 text-center relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-white/20"></div>
                <div className="text-4xl font-bold mb-2">
                  {[...new Set(apInternships.map(i => i.stream))].length}
                </div>
                <p className="text-orange-100">Different Streams</p>
                <div className="absolute bottom-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mb-8"></div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Coupon Dialog */}
        {showCouponDialog && <CouponDialog />}
      </div>
      <Footer />
    </>
  );
};

export default APExclusiveInternshipsPage;
