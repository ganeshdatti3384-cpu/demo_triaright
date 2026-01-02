import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, 
  Trash2, 
  Plus, 
  Tag, 
  Percent, 
  IndianRupee, 
  Calendar, 
  Users, 
  CheckCircle, 
  XCircle, 
  Copy, 
  Sparkles, 
  Zap, 
  Crown 
} from "lucide-react";

/* ================= CONFIG ================= */

const API_BASE_URL = "https://triaright.com/api/livecourses";
const getAuthToken = () => localStorage.getItem("token");

/* ================= TYPES ================= */

interface LiveCourse {
  _id: string;
  courseName: string;
}

interface Coupon {
  _id: string;
  code: string;
  applicableCourse: LiveCourse | null;
  discountType: "flat" | "percentage";
  discountAmount: number;
  maxDiscount: number | null;
  isActive: boolean;
  usageLimit: number | null;
  usedCount: number;
  expiresAt: string | null;
  description: string;
  createdBy?: string;
}

interface FormData {
  code: string;
  applicableCourse: string;
  discountType: "flat" | "percentage";
  discountAmount: number;
  maxDiscount: number;
  isActive: boolean;
  usageLimit: number;
  expiresAt: string;
  description: string;
}

/* ================= FORM FIELDS COMPONENT (Outside Parent) ================= */

interface CouponFormFieldsProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  liveCourses: LiveCourse[];
}

const CouponFormFields: React.FC<CouponFormFieldsProps> = ({ formData, setFormData, liveCourses }) => (
  <div className="space-y-5 max-h-[65vh] overflow-y-auto p-1">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="space-y-2.5">
        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Tag className="h-3.5 w-3.5 text-gray-600" />
          Coupon Code <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="E.g., LIVE50"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            className="pl-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
          />
        </div>
      </div>

      <div className="space-y-2.5">
        <Label className="text-sm font-semibold text-gray-700">
          Applicable Course (Optional)
        </Label>
        <Select 
          value={formData.applicableCourse} 
          onValueChange={(value) => setFormData({ ...formData, applicableCourse: value === "ALL" ? "" : value })}
        >
          <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/80 shadow-sm h-10">
            <SelectValue placeholder="Select courses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Courses</SelectItem>
            {liveCourses.map((course) => (
              <SelectItem key={course._id} value={course._id}>
                {course.courseName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="space-y-2.5">
        <Label className="text-sm font-semibold text-gray-700">
          Discount Type <span className="text-red-500">*</span>
        </Label>
        <Select 
          value={formData.discountType} 
          onValueChange={(value: "flat" | "percentage") => setFormData({ ...formData, discountType: value })}
        >
          <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/80 shadow-sm h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="flat">Flat Amount (₹)</SelectItem>
            <SelectItem value="percentage">Percentage (%)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2.5">
        <Label className="text-sm font-semibold text-gray-700">
          Discount Amount <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          {formData.discountType === "percentage" ? (
            <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          ) : (
            <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          )}
          <Input
            type="number"
            value={formData.discountAmount}
            onChange={(e) => setFormData({ ...formData, discountAmount: parseFloat(e.target.value) || 0 })}
            className={`pl-10 border-2 ${
              formData.discountType === "percentage" && formData.discountAmount > 100
                ? "border-red-300 focus:border-red-500 focus:ring-red-300"
                : "border-gray-200 focus:border-blue-500 focus:ring-blue-300"
            } rounded-xl bg-white/80 shadow-sm h-10`}
          />
        </div>
        {formData.discountType === "percentage" && formData.discountAmount > 100 && (
          <p className="text-xs text-red-600 font-medium mt-1">Percentage cannot exceed 100%</p>
        )}
      </div>
    </div>

    {formData.discountType === "percentage" && (
      <div className="space-y-2.5">
        <Label className="text-sm font-semibold text-gray-700">
          Maximum Discount Cap (Optional)
        </Label>
        <div className="relative">
          <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="number"
            placeholder="0 = no limit"
            value={formData.maxDiscount}
            onChange={(e) => setFormData({ ...formData, maxDiscount: parseFloat(e.target.value) || 0 })}
            className="pl-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
          />
        </div>
      </div>
    )}

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="space-y-2.5">
        <Label className="text-sm font-semibold text-gray-700">
          Usage Limit
        </Label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="number"
            placeholder="0 = unlimited"
            value={formData.usageLimit}
            onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 0 })}
            className="pl-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
          />
        </div>
      </div>

      <div className="space-y-2.5">
        <Label className="text-sm font-semibold text-gray-700">
          Expiration Date
        </Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="date"
            value={formData.expiresAt}
            onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
            className="pl-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
          />
        </div>
      </div>
    </div>

    <div className="flex items-center space-x-3 p-3.5 bg-gradient-to-r from-gray-50 to-gray-50 rounded-xl border-2 border-gray-100">
      <input
        id="isActive"
        type="checkbox"
        checked={formData.isActive}
        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
        className="h-4 w-4 text-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 border-2 border-gray-300"
      />
      <Label htmlFor="isActive" className="text-sm font-semibold text-gray-900 cursor-pointer">
        Activate Coupon Immediately
      </Label>
    </div>

    <div className="space-y-2.5">
      <Label className="text-sm font-semibold text-gray-700">
        Description
      </Label>
      <Textarea
        rows={3}
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl resize-none bg-white/80 shadow-sm p-3"
        placeholder="Describe the purpose of this coupon..."
      />
    </div>
  </div>
);

/* ================= MAIN COMPONENT ================= */

const LiveCourseCouponsManagement: React.FC = () => {
  const { toast } = useToast();

  const [liveCourses, setLiveCourses] = useState<LiveCourse[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [fetchingData, setFetchingData] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);

  /* ================= FORM STATE ================= */

  const [formData, setFormData] = useState<FormData>({
    code: "",
    applicableCourse: "",
    discountType: "flat",
    discountAmount: 0,
    maxDiscount: 0,
    isActive: true,
    usageLimit: 0,
    expiresAt: "",
    description: "",
  });

  /* ================= FETCH LIVE COURSES ================= */

  const fetchLiveCourses = async () => {
    const res = await fetch(`${API_BASE_URL}/live-courses`);
    const data = await res.json();
    setLiveCourses(data.courses || []);
  };

  /* ================= FETCH COUPONS ================= */

  const fetchCoupons = async () => {
    try {
      setFetchingData(true);
      const token = getAuthToken();

      const res = await fetch(
        `${API_BASE_URL}/admin/coupons`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch coupons",
        variant: "destructive",
      });
    } finally {
      setFetchingData(false);
    }
  };

  useEffect(() => {
    fetchLiveCourses();
    fetchCoupons();
  }, []);

  /* ================= RESET FORM ================= */

  const resetForm = () => {
    setFormData({
      code: "",
      applicableCourse: "",
      discountType: "flat",
      discountAmount: 0,
      maxDiscount: 0,
      isActive: true,
      usageLimit: 0,
      expiresAt: "",
      description: "",
    });
  };

  /* ================= CREATE COUPON ================= */

  const handleCreateCoupon = async () => {
    if (!formData.code) {
      toast({
        title: "Error",
        description: "Coupon code is required",
        variant: "destructive",
      });
      return;
    }

    if (formData.discountAmount <= 0) {
      toast({
        title: "Error",
        description: "Discount amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (formData.discountType === "percentage" && formData.discountAmount > 100) {
      toast({
        title: "Error",
        description: "Percentage discount cannot be more than 100",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const token = getAuthToken();

      const payload = {
        code: formData.code.toUpperCase().trim(),
        applicableCourse: formData.applicableCourse || null,
        discountType: formData.discountType,
        discountAmount: formData.discountAmount,
        maxDiscount:
          formData.discountType === "percentage"
            ? formData.maxDiscount || null
            : null,
        isActive: formData.isActive,
        usageLimit: formData.usageLimit || null,
        expiresAt: formData.expiresAt
          ? new Date(formData.expiresAt)
          : null,
        description: formData.description,
      };

      await fetch(`${API_BASE_URL}/admin/coupons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      toast({ title: "Success", description: "Coupon created successfully" });

      setIsAddDialogOpen(false);
      resetForm();
      fetchCoupons();
    } catch {
      toast({
        title: "Error",
        description: "Coupon creation failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= OPEN EDIT ================= */

  const openEditDialog = (coupon: Coupon) => {
    setEditingCoupon(coupon);

    setFormData({
      code: coupon.code,
      applicableCourse: coupon.applicableCourse?._id || "",
      discountType: coupon.discountType,
      discountAmount: coupon.discountAmount,
      maxDiscount: coupon.maxDiscount || 0,
      isActive: coupon.isActive,
      usageLimit: coupon.usageLimit || 0,
      expiresAt: coupon.expiresAt
        ? coupon.expiresAt.split("T")[0]
        : "",
      description: coupon.description || "",
    });

    setIsEditDialogOpen(true);
  };

  /* ================= UPDATE COUPON ================= */

  const handleUpdateCoupon = async () => {
    if (!editingCoupon) return;

    if (!formData.code) {
      toast({
        title: "Error",
        description: "Coupon code is required",
        variant: "destructive",
      });
      return;
    }

    if (formData.discountAmount <= 0) {
      toast({
        title: "Error",
        description: "Discount amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (formData.discountType === "percentage" && formData.discountAmount > 100) {
      toast({
        title: "Error",
        description: "Percentage discount cannot be more than 100",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const token = getAuthToken();

      const payload = {
        code: formData.code.toUpperCase().trim(),
        applicableCourse: formData.applicableCourse || null,
        discountType: formData.discountType,
        discountAmount: formData.discountAmount,
        maxDiscount:
          formData.discountType === "percentage" && formData.maxDiscount > 0
            ? formData.maxDiscount
            : null,
        isActive: formData.isActive,
        usageLimit: formData.usageLimit > 0 ? formData.usageLimit : null,
        expiresAt: formData.expiresAt
          ? new Date(formData.expiresAt).toISOString()
          : null,
        description: formData.description,
      };

      await fetch(
        `${API_BASE_URL}/admin/coupons/${editingCoupon._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      toast({ title: "Success", description: "Coupon updated successfully" });

      setIsEditDialogOpen(false);
      setEditingCoupon(null);
      resetForm();
      fetchCoupons();
    } catch {
      toast({
        title: "Error",
        description: "Failed to update coupon",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */

  const handleDeleteCoupon = async () => {
    if (!couponToDelete) return;

    try {
      const token = getAuthToken();
      await fetch(`${API_BASE_URL}/admin/coupons/${couponToDelete._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      toast({ title: "Deleted", description: "Coupon deleted successfully" });
      setCouponToDelete(null);
      fetchCoupons();
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete coupon",
        variant: "destructive",
      });
    }
  };

  /* ================= UTILITY FUNCTIONS ================= */

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: `Coupon code "${code}" copied to clipboard`,
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No expiry";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const isUsageExceeded = (coupon: Coupon) => {
    return coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit;
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50/50 to-gray-100 p-4 relative overflow-hidden">
      {/* Loading Overlay - shown on top, doesn't unmount content */}
      {fetchingData && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="inline-block p-4 bg-white rounded-2xl shadow-lg mb-4">
              <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            </div>
            <p className="text-gray-600 font-medium">Loading coupons...</p>
          </div>
        </div>
      )}

      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-200 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-indigo-200 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="bg-gradient-to-r from-white to-gray-50/80 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-lg shadow-gray-100/50">
            <div className="flex items-center gap-4 mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-indigo-300 rounded-xl blur-md opacity-60"></div>
                <div className="relative p-3 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl shadow-lg">
                  <Tag className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                    Coupon Management
                  </h1>
                  <Sparkles className="h-3 w-3 text-blue-400 animate-pulse" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse"></div>
                  <p className="text-xs font-medium text-gray-600">
                    Smart discount management system
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-blue-500" />
                <span className="text-xs font-medium text-gray-600">Fast & Reliable</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="h-3 w-3 text-indigo-500" />
                <span className="text-xs font-medium text-gray-600">Premium Features</span>
              </div>
            </div>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-white font-semibold px-5 py-3 h-auto rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <Plus className="h-4 w-4 mr-2 relative z-10" />
                <span className="text-sm relative z-10">Create Coupon</span>
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-xl bg-gradient-to-b from-white to-gray-50/50 backdrop-blur-sm border border-white/50 shadow-2xl shadow-blue-200/30 rounded-2xl">
              <DialogHeader className="pb-4 border-b border-gray-100/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                      Create New Coupon
                    </DialogTitle>
                    <p className="text-sm text-gray-600 font-medium mt-0.5">
                      Design your discount coupon
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <CouponFormFields formData={formData} setFormData={setFormData} liveCourses={liveCourses} />

              <Button
                onClick={handleCreateCoupon}
                className="w-full mt-3 group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                disabled={loading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                {loading ? (
                  <span className="relative z-10 flex items-center justify-center text-sm">
                    <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Creating...
                  </span>
                ) : (
                  <span className="relative z-10 flex items-center justify-center text-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Coupon
                  </span>
                )}
              </Button>
            </DialogContent>
          </Dialog>
        </div>

       
       {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="group bg-gradient-to-br from-white to-gray-50/80 backdrop-blur-sm border-2 border-white/50 shadow-lg hover:shadow-xl hover:border-gray-200/70 transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1.5">Total Coupons</p>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                    {coupons.length}
                  </h3>
                </div>
                <div className="p-2.5 bg-gradient-to-br from-gray-100 to-gray-100 rounded-lg shadow group-hover:scale-110 transition-transform duration-300">
                  <Tag className="h-4 w-4 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-white to-gray-50/80 backdrop-blur-sm border-2 border-white/50 shadow-lg hover:shadow-xl hover:border-gray-200/70 transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1.5">Active Coupons</p>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                    {coupons.filter(c => c.isActive && !isExpired(c.expiresAt) && !isUsageExceeded(c)).length}
                  </h3>
                </div>
                <div className="p-2.5 bg-gradient-to-br from-gray-100 to-gray-100 rounded-lg shadow group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="h-4 w-4 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-white to-gray-50/80 backdrop-blur-sm border-2 border-white/50 shadow-lg hover:shadow-xl hover:border-gray-200/70 transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1.5">Total Usage</p>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                    {coupons.reduce((sum, coupon) => sum + coupon.usedCount, 0)}
                  </h3>
                </div>
                <div className="p-2.5 bg-gradient-to-br from-gray-100 to-gray-100 rounded-lg shadow group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-4 w-4 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group bg-gradient-to-br from-white to-gray-50/80 backdrop-blur-sm border-2 border-white/50 shadow-lg hover:shadow-xl hover:border-gray-200/70 transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1.5">Inactive</p>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                    {coupons.filter(c => !c.isActive || isExpired(c.expiresAt) || isUsageExceeded(c)).length}
                  </h3>
                </div>
                <div className="p-2.5 bg-gradient-to-br from-gray-100 to-gray-100 rounded-lg shadow group-hover:scale-110 transition-transform duration-300">
                  <XCircle className="h-4 w-4 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coupons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {coupons.map((coupon) => {
            const isExpiredCoupon = isExpired(coupon.expiresAt);
            const isUsageExceededCoupon = isUsageExceeded(coupon);
            const isActuallyActive = coupon.isActive && !isExpiredCoupon && !isUsageExceededCoupon;
            
            const discountLabel =
              coupon.discountType === "flat"
                ? `₹${coupon.discountAmount} OFF`
                : `${coupon.discountAmount}% OFF`;

            const usageLabel =
              coupon.usageLimit && coupon.usageLimit > 0
                ? `${coupon.usedCount}/${coupon.usageLimit} used`
                : `${coupon.usedCount} used`;

            const expiryStatus = isExpiredCoupon ? "Expired" : 
                               coupon.expiresAt ? formatDate(coupon.expiresAt) : "No expiry";

            return (
              <Card
                key={coupon._id}
                className={`group relative overflow-hidden bg-gradient-to-b from-white to-gray-50/60 backdrop-blur-sm border-2 ${
                  isActuallyActive 
                    ? 'border-gray-200/70 hover:border-gray-300' 
                    : 'border-gray-200/50 hover:border-gray-300'
                } shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${
                  isActuallyActive 
                    ? 'from-gray-200/5 via-gray-200/5 to-gray-200/5' 
                    : 'from-gray-400/5 via-gray-300/5 to-gray-400/5'
                } opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                <div className="absolute top-3 right-3 z-10">
                  <Badge className={`text-xs font-bold px-2.5 py-1 rounded-full shadow ${
                    isActuallyActive 
                      ? 'bg-gradient-to-r from-emerald-500 to-green-400 text-white border-0' 
                      : 'bg-gradient-to-r from-gray-500 to-gray-400 text-white border-0'
                  }`}>
                    {isActuallyActive ? 'ACTIVE' : 'INACTIVE'}
                  </Badge>
                </div>
                
                <CardHeader className="pt-6 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <div className={`p-2 rounded-lg shadow ${
                          isActuallyActive 
                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                            : 'bg-gradient-to-br from-gray-400 to-gray-500'
                        }`}>
                          <Tag className="h-4 w-4 text-white" />
                        </div>
                        <CardTitle className="text-base font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                          {coupon.code}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {coupon.discountType === "flat" ? (
                          <div className="p-1.5 bg-gradient-to-br from-gray-100 to-gray-100 rounded-lg shadow-sm">
                            <IndianRupee className="h-3.5 w-3.5 text-gray-700" />
                          </div>
                        ) : (
                          <div className="p-1.5 bg-gradient-to-br from-gray-100 to-gray-100 rounded-lg shadow-sm">
                            <Percent className="h-3.5 w-3.5 text-gray-700" />
                          </div>
                        )}
                        <p className="text-sm font-semibold text-gray-800">
                          {discountLabel}
                          {coupon.maxDiscount && (
                            <span className="text-xs font-medium text-blue-600 ml-1.5">
                              (max ₹{coupon.maxDiscount})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    {(isExpiredCoupon || isUsageExceededCoupon) && (
                      <div className="flex flex-col gap-1">
                        {isExpiredCoupon && (
                          <Badge variant="destructive" className="text-xs px-2 py-0.5 bg-gradient-to-r from-rose-500 to-pink-400 text-white border-0 shadow">
                            EXPIRED
                          </Badge>
                        )}
                        {isUsageExceededCoupon && (
                          <Badge className="text-xs px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-400 text-white border-0 shadow">
                            LIMIT REACHED
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4 pt-0 pb-5">
                  <div className="space-y-3">
                    {coupon.applicableCourse && (
                      <div className="flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-gray-50 to-gray-50 rounded-lg">
                        <div className="p-1.5 bg-white rounded-lg shadow-sm">
                          <Tag className="h-3.5 w-3.5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900">COURSE</p>
                          <p className="text-xs text-gray-700 font-medium truncate">
                            {coupon.applicableCourse.courseName}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-gray-50 to-gray-50 rounded-lg">
                      <div className="p-1.5 bg-white rounded-lg shadow-sm">
                        <Users className="h-3.5 w-3.5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">USAGE</p>
                        <p className="text-xs text-gray-700 font-medium">{usageLabel}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-gray-50 to-gray-50 rounded-lg">
                      <div className="p-1.5 bg-white rounded-lg shadow-sm">
                        <Calendar className="h-3.5 w-3.5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">EXPIRY</p>
                        <p className={`text-xs font-medium ${isExpiredCoupon ? 'text-rose-600' : 'text-gray-700'}`}>
                          {expiryStatus}
                        </p>
                      </div>
                    </div>

                    {coupon.createdBy && (
                      <div className="flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-gray-50 to-gray-50 rounded-lg">
                        <div className="p-1.5 bg-white rounded-lg shadow-sm">
                          <Crown className="h-3.5 w-3.5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900">CREATED BY</p>
                          <p className="text-xs text-gray-700 font-medium">{coupon.createdBy}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {coupon.description && (
                    <div className="pt-2 border-t border-gray-100/50">
                      <p className="text-xs text-gray-700 line-clamp-2">{coupon.description}</p>
                    </div>
                  )}

                  <div className="flex justify-between pt-3 border-t border-gray-100/50">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(coupon.code)}
                        className="group relative overflow-hidden border-2 border-gray-200 hover:border-gray-400 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-50 text-gray-700 hover:text-gray-900 font-medium text-xs px-2.5 py-1.5 rounded-lg shadow-sm hover:shadow transition-all duration-300"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        <Copy className="h-3 w-3 mr-1.5 relative z-10" />
                        <span className="relative z-10">Copy</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(coupon)}
                        className="group relative overflow-hidden border-2 border-gray-200 hover:border-gray-400 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-50 text-gray-700 hover:text-gray-900 font-medium text-xs px-2.5 py-1.5 rounded-lg shadow-sm hover:shadow transition-all duration-300"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        <Edit className="h-3 w-3 mr-1.5 relative z-10" />
                        <span className="relative z-10">Edit</span>
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setCouponToDelete(coupon)}
                      className="group relative overflow-hidden bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium text-xs px-2.5 py-1.5 rounded-lg shadow-sm hover:shadow transition-all duration-300 hover:scale-105"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      <Trash2 className="h-3 w-3 mr-1.5 relative z-10" />
                      <span className="relative z-10">Delete</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* If no coupons */}
        {coupons.length === 0 && (
          <Card className="bg-gradient-to-b from-white to-gray-50/60 backdrop-blur-sm border-2 border-dashed border-gray-300/50 shadow-lg">
            <CardContent className="py-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-300 rounded-full blur-md opacity-30"></div>
                  <div className="relative p-4 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full shadow-lg">
                    <Tag className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent mb-2">
                  No Coupons Yet
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  Start creating discount coupons to boost enrollments!
                </p>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-white font-semibold px-5 py-3 h-auto rounded-xl text-sm">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      <Plus className="h-4 w-4 mr-2 relative z-10" />
                      <span className="relative z-10">Create First Coupon</span>
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog - FIXED: Now passing all required props */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-xl bg-gradient-to-b from-white to-gray-50/50 backdrop-blur-sm border border-white/50 shadow-2xl shadow-blue-200/30 rounded-2xl">
            <DialogHeader className="pb-4 border-b border-gray-100/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow">
                  <Edit className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                    Edit Coupon
                  </DialogTitle>
                  <p className="text-sm text-gray-600 font-medium mt-0.5">
                    Update your discount coupon details
                  </p>
                </div>
              </div>
            </DialogHeader>

            <CouponFormFields formData={formData} setFormData={setFormData} liveCourses={liveCourses} />

            <Button
              onClick={handleUpdateCoupon}
              className="w-full mt-3 group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              disabled={loading}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              {loading ? (
                <span className="relative z-10 flex items-center justify-center text-sm">
                  <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Updating...
                </span>
              ) : (
                <span className="relative z-10 flex items-center justify-center text-sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Update Coupon
                </span>
              )}
            </Button>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog
          open={!!couponToDelete}
          onOpenChange={(open) => {
            if (!open) setCouponToDelete(null);
          }}
        >
          <AlertDialogContent className="bg-gradient-to-b from-white to-rose-50/80 backdrop-blur-sm border border-white/50 shadow-2xl shadow-rose-200/30 rounded-2xl max-w-md">
            <AlertDialogHeader className="p-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-400 rounded-lg shadow">
                  <Trash2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <AlertDialogTitle className="text-lg font-bold bg-gradient-to-r from-rose-800 to-pink-700 bg-clip-text text-transparent">
                    Delete Coupon
                  </AlertDialogTitle>
                  <p className="text-sm text-rose-600/80 font-medium mt-0.5">This action cannot be undone</p>
                </div>
              </div>
            </AlertDialogHeader>
            <div className="space-y-5 p-5 pt-0">
              <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border-2 border-rose-100">
                <p className="text-sm font-bold text-rose-900 mb-2">
                  "{couponToDelete?.code}"
                </p>
                <p className="text-xs text-rose-700">
                  Are you sure you want to delete this coupon? This will permanently remove all associated data.
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <AlertDialogCancel className="group relative overflow-hidden border-2 border-gray-200 hover:border-gray-400 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-50 text-gray-700 hover:text-gray-900 font-medium text-xs px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative z-10">Cancel</span>
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteCoupon}
                  className="group relative overflow-hidden bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium text-xs px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative z-10">Delete Coupon</span>
                </AlertDialogAction>
              </div>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default LiveCourseCouponsManagement;