import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Edit, Trash2, Plus, Tag, Percent, IndianRupee, Calendar, Users, CheckCircle, XCircle, Copy, Sparkles, Zap, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface UsedByEntry {
  userId: string;
  usedAt: string;
}

interface LiveCourseEnrollmentCode {
  id: string; // frontend ID
  code: string;
  applicableCourse: string | null; // LiveCourse ObjectId as string
  discountType: "flat" | "percentage";
  discountAmount: number;
  maxDiscount: number | null;
  isActive: boolean;
  usageLimit: number | null;
  usedCount: number;
  usedBy: UsedByEntry[];
  expiresAt: string | null;
  createdBy: string;
  description: string;
}

const LiveCourseCouponsManagement: React.FC = () => {
  // Load coupons from localStorage on initial render
  const [codes, setCodes] = useState<LiveCourseEnrollmentCode[]>(() => {
    const savedCoupons = localStorage.getItem("liveCourseCoupons");
    if (savedCoupons) {
      try {
        return JSON.parse(savedCoupons);
      } catch (error) {
        console.error("Error parsing saved coupons:", error);
        return [];
      }
    }
    // Default coupons if none exist in localStorage
    return [
      {
        id: "1",
        code: "LIVE50",
        applicableCourse: "course_001",
        discountType: "percentage" as "flat" | "percentage",
        discountAmount: 50,
        maxDiscount: 1000,
        isActive: true,
        usageLimit: 100,
        usedCount: 25,
        usedBy: [],
        expiresAt: "2024-12-31T23:59:59",
        createdBy: "Admin",
        description: "50% discount on all live courses",
      },
      {
        id: "2",
        code: "FLAT500",
        applicableCourse: null,
        discountType: "flat" as "flat" | "percentage",
        discountAmount: 500,
        maxDiscount: null,
        isActive: true,
        usageLimit: 50,
        usedCount: 15,
        usedBy: [],
        expiresAt: "2024-12-25T23:59:59",
        createdBy: "Superadmin",
        description: "Flat ₹500 off on any live course",
      },
      {
        id: "3",
        code: "EARLYBIRD30",
        applicableCourse: "course_002",
        discountType: "percentage" as "flat" | "percentage",
        discountAmount: 30,
        maxDiscount: 500,
        isActive: false,
        usageLimit: 20,
        usedCount: 20,
        usedBy: [],
        expiresAt: "2024-11-30T23:59:59",
        createdBy: "Admin",
        description: "Early bird discount for React Masterclass",
      },
    ];
  });

  const [loading, setLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [codeToDelete, setCodeToDelete] = useState<LiveCourseEnrollmentCode | null>(null);
  const [editingCode, setEditingCode] = useState<LiveCourseEnrollmentCode | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    applicableCourse: "",
    discountType: "flat" as "flat" | "percentage",
    discountAmount: 0,
    maxDiscount: 0,
    isActive: true,
    usageLimit: 0,
    expiresAt: "",
    createdBy: "",
    description: "",
  });

  const { toast } = useToast();

  // Save coupons to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("liveCourseCoupons", JSON.stringify(codes));
  }, [codes]);

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
      createdBy: "",
      description: "",
    });
  };

  // CREATE
  const handleAddCode = () => {
    if (!formData.code || !formData.createdBy) {
      toast({
        title: "Error",
        description: "Code and Created By are required",
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

    // Check for duplicate code
    const isDuplicate = codes.some(
      (code) => code.code.toUpperCase() === formData.code.toUpperCase().trim()
    );
    if (isDuplicate) {
      toast({
        title: "Error",
        description: "Coupon code already exists",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const newCode: LiveCourseEnrollmentCode = {
      id: Date.now().toString(),
      code: formData.code.toUpperCase().trim(),
      applicableCourse: formData.applicableCourse || null,
      discountType: formData.discountType,
      discountAmount: formData.discountAmount,
      maxDiscount: formData.maxDiscount > 0 ? formData.maxDiscount : null,
      isActive: formData.isActive,
      usageLimit: formData.usageLimit > 0 ? formData.usageLimit : null,
      usedCount: 0,
      usedBy: [],
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
      createdBy: formData.createdBy,
      description: formData.description,
    };

    setCodes((prev) => [...prev, newCode]);
    setLoading(false);
    setIsAddDialogOpen(false);
    resetForm();

    toast({
      title: "Success",
      description: "Coupon created successfully",
    });
  };

  const openEditDialog = (code: LiveCourseEnrollmentCode) => {
    setEditingCode(code);
    setFormData({
      code: code.code,
      applicableCourse: code.applicableCourse || "",
      discountType: code.discountType,
      discountAmount: code.discountAmount,
      maxDiscount: code.maxDiscount || 0,
      isActive: code.isActive,
      usageLimit: code.usageLimit || 0,
      expiresAt: code.expiresAt ? code.expiresAt.slice(0, 16) : "",
      createdBy: code.createdBy,
      description: code.description,
    });
    setIsEditDialogOpen(true);
  };

  // UPDATE
  const handleEditCode = () => {
    if (!editingCode) return;

    if (!formData.code || !formData.createdBy) {
      toast({
        title: "Error",
        description: "Code and Created By are required",
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

    // Check for duplicate code (excluding current code)
    const isDuplicate = codes.some(
      (code) => 
        code.id !== editingCode.id && 
        code.code.toUpperCase() === formData.code.toUpperCase().trim()
    );
    if (isDuplicate) {
      toast({
        title: "Error",
        description: "Coupon code already exists",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    setCodes((prev) =>
      prev.map((code) =>
        code.id === editingCode.id
          ? {
              ...code,
              code: formData.code.toUpperCase().trim(),
              applicableCourse: formData.applicableCourse || null,
              discountType: formData.discountType,
              discountAmount: formData.discountAmount,
              maxDiscount: formData.maxDiscount > 0 ? formData.maxDiscount : null,
              isActive: formData.isActive,
              usageLimit: formData.usageLimit > 0 ? formData.usageLimit : null,
              expiresAt: formData.expiresAt
                ? new Date(formData.expiresAt).toISOString()
                : null,
              createdBy: formData.createdBy,
              description: formData.description,
            }
          : code
      )
    );

    setLoading(false);
    setIsEditDialogOpen(false);
    setEditingCode(null);
    resetForm();

    toast({
      title: "Success",
      description: "Coupon updated successfully",
    });
  };

  // DELETE
  const handleDeleteCode = () => {
    if (!codeToDelete) return;

    setCodes((prev) => prev.filter((code) => code.id !== codeToDelete.id));
    setCodeToDelete(null);

    toast({
      title: "Deleted",
      description: "Coupon deleted successfully",
    });
  };

  // Copy coupon code to clipboard
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
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const isUsageExceeded = (code: LiveCourseEnrollmentCode) => {
    return code.usageLimit !== null && code.usedCount >= code.usageLimit;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50/50 to-gray-100 p-4 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-200 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-indigo-200 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="bg-gradient-to-r from-white to-gray-50/80 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-lg shadow-gray-100/50">
            <div className="flex items-center gap-4 mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-indigo-300 rounded-xl blur-md opacity-60"></div>
                <div className="relative p-3 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl shadow-lg">
                  {/* Changed icon color */}
                  <Tag className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                {/* Smaller heading like the previous file */}
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                    Coupon Management
                  </h1>
                  {/* Changed icon color from blue-500 to blue-400 */}
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
                {/* Changed icon color */}
                <Zap className="h-3 w-3 text-blue-500" />
                <span className="text-xs font-medium text-gray-600">Fast & Reliable</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Changed icon color */}
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

              <div className="space-y-5 max-h-[65vh] overflow-y-auto p-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2.5">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5 text-gray-600" />
                      Code <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="E.g., LIVE50"
                        value={formData.code}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, code: e.target.value }))
                        }
                        className="pl-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Crown className="h-3.5 w-3.5 text-gray-600" />
                      Created By <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Crown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Admin name"
                        value={formData.createdBy}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            createdBy: e.target.value,
                          }))
                        }
                        className="pl-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-sm font-semibold text-gray-700">
                    Applicable Course ID (Optional)
                  </Label>
                  <Input
                    placeholder="Leave empty for all courses"
                    value={formData.applicableCourse}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        applicableCourse: e.target.value,
                      }))
                    }
                    className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2.5">
                    <Label className="text-sm font-semibold text-gray-700">
                      Discount Type <span className="text-red-500">*</span>
                    </Label>
                    <select
                      className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl px-3 py-2 text-sm bg-white/80 shadow-sm"
                      value={formData.discountType}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          discountType: e.target.value as "flat" | "percentage",
                        }))
                      }
                    >
                      <option value="flat">Flat Amount</option>
                      <option value="percentage">Percentage</option>
                    </select>
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
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            discountAmount: parseFloat(e.target.value) || 0,
                          }))
                        }
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
                      Maximum Discount (Optional)
                    </Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="number"
                        placeholder="0 = no limit"
                        value={formData.maxDiscount}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            maxDiscount: parseFloat(e.target.value) || 0,
                          }))
                        }
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
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            usageLimit: parseInt(e.target.value) || 0,
                          }))
                        }
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
                        type="datetime-local"
                        value={formData.expiresAt}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            expiresAt: e.target.value,
                          }))
                        }
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
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 border-2 border-gray-300"
                  />
                  <Label htmlFor="isActive" className="text-sm font-semibold text-gray-900">
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
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl resize-none bg-white/80 shadow-sm p-3"
                    placeholder="Describe the purpose of this coupon..."
                  />
                </div>

                <Button
                  onClick={handleAddCode}
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
              </div>
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
                    {codes.length}
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
                    {codes.filter(c => c.isActive).length}
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
                    {codes.reduce((sum, code) => sum + code.usedCount, 0)}
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
                    {codes.filter(c => !c.isActive || isExpired(c.expiresAt) || isUsageExceeded(c)).length}
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
          {codes.map((code) => {
            const isExpiredCode = isExpired(code.expiresAt);
            const isUsageExceededCode = isUsageExceeded(code);
            const isActuallyActive = code.isActive && !isExpiredCode && !isUsageExceededCode;
            
            const discountLabel =
              code.discountType === "flat"
                ? `₹${code.discountAmount} OFF`
                : `${code.discountAmount}% OFF`;

            const usageLabel =
              code.usageLimit && code.usageLimit > 0
                ? `${code.usedCount}/${code.usageLimit} used`
                : `${code.usedCount} used`;

            const expiryStatus = isExpiredCode ? "Expired" : 
                               code.expiresAt ? formatDate(code.expiresAt) : "No expiry";

            return (
              <Card
                key={code.id}
                className={`group relative overflow-hidden bg-gradient-to-b from-white to-gray-50/60 backdrop-blur-sm border-2 ${
                  isActuallyActive 
                    ? 'border-gray-200/70 hover:border-gray-300' 
                    : 'border-gray-200/50 hover:border-gray-300'
                } shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}
              >
                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${
                  isActuallyActive 
                    ? 'from-gray-200/5 via-gray-200/5 to-gray-200/5' 
                    : 'from-gray-400/5 via-gray-300/5 to-gray-400/5'
                } opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                {/* Status Badge */}
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
                          {code.code}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {code.discountType === "flat" ? (
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
                          {code.maxDiscount && (
                            <span className="text-xs font-medium text-blue-600 ml-1.5">
                              (max ₹{code.maxDiscount})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    {(isExpiredCode || isUsageExceededCode) && (
                      <div className="flex flex-col gap-1">
                        {isExpiredCode && (
                          <Badge variant="destructive" className="text-xs px-2 py-0.5 bg-gradient-to-r from-rose-500 to-pink-400 text-white border-0 shadow">
                            EXPIRED
                          </Badge>
                        )}
                        {isUsageExceededCode && (
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
                    {code.applicableCourse && (
                      <div className="flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-gray-50 to-gray-50 rounded-lg">
                        <div className="p-1.5 bg-white rounded-lg shadow-sm">
                          <Tag className="h-3.5 w-3.5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900">COURSE ID</p>
                          <p className="text-xs text-gray-700 font-medium truncate">{code.applicableCourse}</p>
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
                        <p className={`text-xs font-medium ${isExpiredCode ? 'text-rose-600' : 'text-gray-700'}`}>
                          {expiryStatus}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 p-2.5 bg-gradient-to-r from-gray-50 to-gray-50 rounded-lg">
                      <div className="p-1.5 bg-white rounded-lg shadow-sm">
                        <Crown className="h-3.5 w-3.5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">CREATED BY</p>
                        <p className="text-xs text-gray-700 font-medium">{code.createdBy}</p>
                      </div>
                    </div>
                  </div>

                  {code.description && (
                    <div className="pt-2 border-t border-gray-100/50">
                      <p className="text-xs text-gray-700 line-clamp-2">{code.description}</p>
                    </div>
                  )}

                  <div className="flex justify-between pt-3 border-t border-gray-100/50">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(code.code)}
                        className="group relative overflow-hidden border-2 border-gray-200 hover:border-gray-400 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-50 text-gray-700 hover:text-gray-900 font-medium text-xs px-2.5 py-1.5 rounded-lg shadow-sm hover:shadow transition-all duration-300"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        <Copy className="h-3 w-3 mr-1.5 relative z-10" />
                        <span className="relative z-10">Copy</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(code)}
                        className="group relative overflow-hidden border-2 border-gray-200 hover:border-gray-400 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-50 text-gray-700 hover:text-gray-900 font-medium text-xs px-2.5 py-1.5 rounded-lg shadow-sm hover:shadow transition-all duration-300"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        <Edit className="h-3 w-3 mr-1.5 relative z-10" />
                        <span className="relative z-10">Edit</span>
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setCodeToDelete(code)}
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
        {codes.length === 0 && (
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

        {/* Edit Dialog */}
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

            <div className="space-y-5 max-h-[65vh] overflow-y-auto p-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2.5">
                  <Label className="text-sm font-semibold text-gray-700">
                    Code <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      value={formData.code}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, code: e.target.value }))
                      }
                      className="pl-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-sm font-semibold text-gray-700">
                    Created By <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Crown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      value={formData.createdBy}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          createdBy: e.target.value,
                        }))
                      }
                      className="pl-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <Label className="text-sm font-semibold text-gray-700">
                  Applicable Course ID (Optional)
                </Label>
                <Input
                  value={formData.applicableCourse}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      applicableCourse: e.target.value,
                    }))
                  }
                  className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2.5">
                  <Label className="text-sm font-semibold text-gray-700">
                    Discount Type <span className="text-red-500">*</span>
                  </Label>
                  <select
                    className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl px-3 py-2 text-sm bg-white/80 shadow-sm"
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        discountType: e.target.value as "flat" | "percentage",
                      }))
                    }
                  >
                    <option value="flat">Flat Amount</option>
                    <option value="percentage">Percentage</option>
                  </select>
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
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          discountAmount: parseFloat(e.target.value) || 0,
                        }))
                      }
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
                    Maximum Discount (Optional)
                  </Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      placeholder="0 = no limit"
                      value={formData.maxDiscount}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          maxDiscount: parseFloat(e.target.value) || 0,
                        }))
                      }
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
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          usageLimit: parseInt(e.target.value) || 0,
                        }))
                      }
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
                      type="datetime-local"
                      value={formData.expiresAt}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          expiresAt: e.target.value,
                        }))
                      }
                      className="pl-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl bg-white/80 shadow-sm h-10"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3.5 bg-gradient-to-r from-gray-50 to-gray-50 rounded-xl border-2 border-gray-100">
                <input
                  id="isActive-edit"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 text-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 border-2 border-gray-300"
                />
                <Label htmlFor="isActive-edit" className="text-sm font-semibold text-gray-900">
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
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-xl resize-none bg-white/80 shadow-sm p-3"
                />
              </div>

              <Button
                onClick={handleEditCode}
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
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog
          open={!!codeToDelete}
          onOpenChange={(open) => {
            if (!open) setCodeToDelete(null);
          }}
        >
          <AlertDialogContent className="bg-gradient-to-b from-white to-rose-50/80 backdrop-blur-sm border border-white/50 shadow-2xl shadow-rose-200/30 rounded-2xl max-w-md">
            <AlertDialogHeader className="p-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-400 rounded-lg shadow">
                  <Trash2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <AlertDialogTitle className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                    Delete Coupon
                  </AlertDialogTitle>
                  <p className="text-sm text-gray-600 font-medium mt-0.5">This action cannot be undone</p>
                </div>
              </div>
            </AlertDialogHeader>
            <div className="space-y-5 p-5 pt-0">
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-50 rounded-xl border-2 border-gray-100">
                <p className="text-sm font-bold text-gray-900 mb-2">
                  "{codeToDelete?.code}"
                </p>
                <p className="text-xs text-gray-700">
                  Are you sure you want to delete this coupon? This will permanently remove all associated data.
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <AlertDialogCancel className="group relative overflow-hidden border-2 border-gray-200 hover:border-gray-400 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-50 text-gray-700 hover:text-gray-900 font-medium text-xs px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative z-10">Cancel</span>
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteCode}
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