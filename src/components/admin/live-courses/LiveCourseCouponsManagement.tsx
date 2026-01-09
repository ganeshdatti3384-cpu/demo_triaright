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
  Crown,
  AlertCircle
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

/* ================= VALIDATION ================= */

interface ValidationErrors {
  code?: string;
  applicableCourse?: string;
  discountType?: string;
  discountAmount?: string;
  maxDiscount?: string;
  isActive?: string;
  usageLimit?: string;
  expiresAt?: string;
  description?: string;
}

const validateCouponForm = (formData: FormData): { success: boolean; errors: ValidationErrors } => {
  const errors: ValidationErrors = {};

  // Coupon code validation
  const code = formData.code.trim();
  if (!code) {
    errors.code = "Coupon code is required";
  } else if (code.length > 20) {
    errors.code = "Coupon code must be less than 20 characters";
  } else if (!/^[A-Za-z0-9]+$/.test(code)) {
    errors.code = "Coupon code can only contain letters and numbers";
  }

  // Discount amount validation
  if (formData.discountAmount === undefined || formData.discountAmount === null) {
    errors.discountAmount = "Discount amount is required";
  } else if (typeof formData.discountAmount !== 'number' || isNaN(formData.discountAmount)) {
    errors.discountAmount = "Discount amount must be a number";
  } else if (formData.discountAmount <= 0) {
    errors.discountAmount = "Discount amount must be greater than 0";
  } else if (formData.discountAmount > 1000000) {
    errors.discountAmount = "Discount amount is too large";
  } else if (formData.discountType === "percentage" && formData.discountAmount > 100) {
    errors.discountAmount = "Percentage discount cannot exceed 100%";
  }

  // Max discount validation (only for percentage type)
  if (formData.discountType === "percentage" && formData.maxDiscount !== undefined) {
    if (formData.maxDiscount < 0) {
      errors.maxDiscount = "Maximum discount cannot be negative";
    } else if (formData.maxDiscount > 1000000) {
      errors.maxDiscount = "Maximum discount is too large";
    }
  }

  // Usage limit validation
  if (formData.usageLimit !== undefined) {
    if (formData.usageLimit < 0) {
      errors.usageLimit = "Usage limit cannot be negative";
    } else if (!Number.isInteger(formData.usageLimit)) {
      errors.usageLimit = "Usage limit must be a whole number";
    } else if (formData.usageLimit > 100000) {
      errors.usageLimit = "Usage limit is too large";
    }
  }

  // Expiration date validation
  if (formData.expiresAt && formData.expiresAt.trim() !== "") {
    const expirationDate = new Date(formData.expiresAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (expirationDate < today) {
      errors.expiresAt = "Expiration date must be today or in the future";
    }
  }

  // Description validation
  if (formData.description && formData.description.length > 500) {
    errors.description = "Description must be less than 500 characters";
  }

  return {
    success: Object.keys(errors).length === 0,
    errors
  };
};

/* ================= FORM FIELDS COMPONENT ================= */

interface CouponFormFieldsProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  liveCourses: LiveCourse[];
  errors: ValidationErrors;
  touched: Record<string, boolean>;
  setTouched: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

const FormError: React.FC<{ message?: string }> = ({ message }) => {
  if (!message) return null;
  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      <AlertCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
      <p className="text-xs text-red-600 font-medium">{message}</p>
    </div>
  );
};

const CouponFormFields: React.FC<CouponFormFieldsProps> = ({ 
  formData, 
  setFormData, 
  liveCourses,
  errors,
  touched,
  setTouched
}) => {
  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const getInputClassName = (field: keyof ValidationErrors, baseClass: string) => {
    const hasError = touched[field] && errors[field];
    return `${baseClass} ${hasError ? 'border-red-300 focus:border-red-500 focus:ring-red-300' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-300'}`;
  };

  return (
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
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              onBlur={() => handleBlur('code')}
              maxLength={20}
              className={getInputClassName('code', 'pl-10 rounded-xl bg-white/80 shadow-sm h-10 border-2')}
            />
          </div>
          <FormError message={touched.code ? errors.code : undefined} />
          <p className="text-xs text-gray-500">Only letters and numbers, max 20 characters</p>
        </div>

        <div className="space-y-2.5">
          <Label className="text-sm font-semibold text-gray-700">
            Applicable Course (Optional)
          </Label>
          <Select 
            value={formData.applicableCourse || "ALL"} 
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
              min="0"
              max={formData.discountType === "percentage" ? 100 : 1000000}
              step="0.01"
              value={formData.discountAmount || ""}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                setFormData({ ...formData, discountAmount: isNaN(value) ? 0 : Math.max(0, value) });
              }}
              onBlur={() => handleBlur('discountAmount')}
              className={getInputClassName('discountAmount', 'pl-10 rounded-xl bg-white/80 shadow-sm h-10 border-2')}
            />
          </div>
          <FormError message={touched.discountAmount ? errors.discountAmount : undefined} />
          {formData.discountType === "percentage" && (
            <p className="text-xs text-gray-500">Enter value between 1-100</p>
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
              min="0"
              placeholder="0 = no limit"
              value={formData.maxDiscount || ""}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                setFormData({ ...formData, maxDiscount: isNaN(value) ? 0 : Math.max(0, value) });
              }}
              onBlur={() => handleBlur('maxDiscount')}
              className={getInputClassName('maxDiscount', 'pl-10 rounded-xl bg-white/80 shadow-sm h-10 border-2')}
            />
          </div>
          <FormError message={touched.maxDiscount ? errors.maxDiscount : undefined} />
          <p className="text-xs text-gray-500">Leave empty or 0 for unlimited</p>
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
              min="0"
              step="1"
              placeholder="0 = unlimited"
              value={formData.usageLimit || ""}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                setFormData({ ...formData, usageLimit: isNaN(value) ? 0 : Math.max(0, Math.floor(value)) });
              }}
              onBlur={() => handleBlur('usageLimit')}
              className={getInputClassName('usageLimit', 'pl-10 rounded-xl bg-white/80 shadow-sm h-10 border-2')}
            />
          </div>
          <FormError message={touched.usageLimit ? errors.usageLimit : undefined} />
          <p className="text-xs text-gray-500">0 means unlimited usage</p>
        </div>

        <div className="space-y-2.5">
          <Label className="text-sm font-semibold text-gray-700">
            Expiration Date
          </Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              onBlur={() => handleBlur('expiresAt')}
              className={getInputClassName('expiresAt', 'pl-10 rounded-xl bg-white/80 shadow-sm h-10 border-2')}
            />
          </div>
          <FormError message={touched.expiresAt ? errors.expiresAt : undefined} />
          <p className="text-xs text-gray-500">Leave empty for no expiration</p>
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
          maxLength={500}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          onBlur={() => handleBlur('description')}
          className={getInputClassName('description', 'rounded-xl resize-none bg-white/80 shadow-sm p-3 border-2')}
          placeholder="Describe the purpose of this coupon..."
        />
        <div className="flex justify-between items-center">
          <FormError message={touched.description ? errors.description : undefined} />
          <p className="text-xs text-gray-500">{formData.description.length}/500 characters</p>
        </div>
      </div>
    </div>
  );
};

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

  // Validation state
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

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

  // Validate form data whenever it changes
  useEffect(() => {
    const { errors: validationErrors } = validateCouponForm(formData);
    setErrors(validationErrors);
  }, [formData]);

  /* ================= FETCH LIVE COURSES ================= */

  const fetchLiveCourses = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/live-courses`);
      const data = await res.json();
      setLiveCourses(data.courses || []);
    } catch {
      console.error("Failed to fetch live courses");
    }
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
    setErrors({});
    setTouched({});
  };

  /* ================= VALIDATE AND SUBMIT ================= */

  const validateAndSubmit = (onSuccess: () => Promise<void>) => {
    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {
      code: true,
      discountAmount: true,
      discountType: true,
      maxDiscount: true,
      usageLimit: true,
      expiresAt: true,
      description: true,
    };
    setTouched(allTouched);

    const { success, errors: validationErrors } = validateCouponForm(formData);
    setErrors(validationErrors);

    if (!success) {
      // Find first error to display in toast
      const firstError = Object.values(validationErrors).find(Boolean);
      toast({
        title: "Validation Error",
        description: firstError || "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    onSuccess();
  };

  /* ================= CREATE COUPON ================= */

  const handleCreateCoupon = async () => {
    validateAndSubmit(async () => {
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
          description: formData.description.trim(),
        };

        const res = await fetch(`${API_BASE_URL}/admin/coupons`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error("Failed to create coupon");
        }

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
    });
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

    setErrors({});
    setTouched({});
    setIsEditDialogOpen(true);
  };

  /* ================= UPDATE COUPON ================= */

  const handleUpdateCoupon = async () => {
    if (!editingCoupon) return;

    validateAndSubmit(async () => {
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
          description: formData.description.trim(),
        };

        const res = await fetch(
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

        if (!res.ok) {
          throw new Error("Failed to update coupon");
        }

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
    });
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
      {/* Loading Overlay */}
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

          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) resetForm();
          }}>
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

              <CouponFormFields 
                formData={formData} 
                setFormData={setFormData} 
                liveCourses={liveCourses}
                errors={errors}
                touched={touched}
                setTouched={setTouched}
              />

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

        {/* Coupons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <Card key={coupon._id} className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-100/50 to-transparent rounded-bl-full"></div>
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg shadow">
                      <Tag className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        {coupon.code}
                        <button
                          onClick={() => copyToClipboard(coupon.code)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <Copy className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
                        </button>
                      </CardTitle>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {coupon.applicableCourse?.courseName || "All Courses"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {coupon.isActive && !isExpired(coupon.expiresAt) && !isUsageExceeded(coupon) ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                    <span className="text-sm text-gray-600 font-medium">Discount</span>
                    <span className="text-lg font-bold text-blue-600">
                      {coupon.discountType === "percentage" ? (
                        <>{coupon.discountAmount}%</>
                      ) : (
                        <>₹{coupon.discountAmount}</>
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <p className="text-gray-500 text-xs">Usage</p>
                      <p className="font-semibold text-gray-800">
                        {coupon.usedCount}/{coupon.usageLimit || "∞"}
                      </p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <p className="text-gray-500 text-xs">Expires</p>
                      <p className={`font-semibold text-xs ${isExpired(coupon.expiresAt) ? 'text-red-600' : 'text-gray-800'}`}>
                        {formatDate(coupon.expiresAt)}
                      </p>
                    </div>
                  </div>

                  {coupon.description && (
                    <p className="text-xs text-gray-500 line-clamp-2">{coupon.description}</p>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(coupon)}
                      className="flex-1 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                    >
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCouponToDelete(coupon)}
                      className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {!fetchingData && coupons.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-block p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mb-4">
              <Tag className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Coupons Yet</h3>
            <p className="text-gray-500 mb-4">Create your first coupon to start offering discounts</p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          setEditingCoupon(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-xl bg-gradient-to-b from-white to-gray-50/50 backdrop-blur-sm border border-white/50 shadow-2xl shadow-blue-200/30 rounded-2xl">
          <DialogHeader className="pb-4 border-b border-gray-100/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow">
                <Edit className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                  Edit Coupon
                </DialogTitle>
                <p className="text-sm text-gray-600 font-medium mt-0.5">
                  Update coupon details
                </p>
              </div>
            </div>
          </DialogHeader>

          <CouponFormFields 
            formData={formData} 
            setFormData={setFormData} 
            liveCourses={liveCourses}
            errors={errors}
            touched={touched}
            setTouched={setTouched}
          />

          <Button
            onClick={handleUpdateCoupon}
            className="w-full mt-3 group relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
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
                <CheckCircle className="h-4 w-4 mr-2" />
                Update Coupon
              </span>
            )}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!couponToDelete} onOpenChange={() => setCouponToDelete(null)}>
        <AlertDialogContent className="bg-white rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-gray-800">
              Delete Coupon?
            </AlertDialogTitle>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete the coupon "{couponToDelete?.code}"? This action cannot be undone.
            </p>
          </AlertDialogHeader>
          <div className="flex items-center gap-3 mt-4">
            <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCoupon}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LiveCourseCouponsManagement;
