import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Clock } from "lucide-react";

/**
 * AdminCreateCoupon
 *
 * A form component for admins to create course coupons.
 *
 * Fields supported (per backend createCourseCoupon):
 * - code (string, required)
 * - discountType ("flat" | "percentage", required)
 * - discountAmount (number, required)
 * - maxDiscount (number, optional — only meaningful for percentage)
 * - minCoursePrice (number, optional)
 * - applicableCourse (courseId, optional)
 * - usageLimit (number, optional)
 * - expiresAt (ISO date string, optional)
 * - description (string, optional)
 *
 * Notes:
 * - This component fetches courses (paid) to allow selecting an applicableCourse.
 * - Uses `useAuth()` for token and `useToast()` for notifications (same pattern as other UI files).
 * - Expects API base at import.meta.env.VITE_BACKEND_URL or defaults to https://dev.triaright.com/api
 */

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "https://dev.triaright.com/api";

type DiscountType = "flat" | "percentage";

const AdminCreateCoupon: React.FC = () => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("flat");
  const [discountAmount, setDiscountAmount] = useState<number | "">("");
  const [maxDiscount, setMaxDiscount] = useState<number | "">("");
  const [minCoursePrice, setMinCoursePrice] = useState<number | "">("");
  const [applicableCourse, setApplicableCourse] = useState<string | null>(null);
  const [usageLimit, setUsageLimit] = useState<number | "">("");
  const [expiresAt, setExpiresAt] = useState<string>(""); // yyyy-mm-dd
  const [description, setDescription] = useState<string>("");

  const [loadingCourses, setLoadingCourses] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPaidCourses();
  }, []);

  const fetchPaidCourses = async () => {
    try {
      setLoadingCourses(true);
      const resp = await axios.get(`${API_BASE_URL}/courses/paid`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const list = resp.data?.courses || [];
      setCourses(list);
    } catch (err: any) {
      console.error("Failed to fetch courses:", err);
      toast({
        title: "Error",
        description: "Unable to load courses for coupon applicability",
        variant: "destructive",
      });
    } finally {
      setLoadingCourses(false);
    }
  };

  const validateForm = () => {
    if (!code || code.trim().length === 0) {
      toast({ title: "Validation", description: "Coupon code is required", variant: "destructive" });
      return false;
    }

    if (discountAmount === "" || discountAmount === null) {
      toast({ title: "Validation", description: "Discount amount is required", variant: "destructive" });
      return false;
    }

    if (typeof discountAmount === "number" && discountAmount < 0) {
      toast({ title: "Validation", description: "Discount amount cannot be negative", variant: "destructive" });
      return false;
    }

    if (discountType === "percentage" && typeof discountAmount === "number" && discountAmount > 100) {
      toast({ title: "Validation", description: "Percentage discount cannot exceed 100%", variant: "destructive" });
      return false;
    }

    if (discountType === "percentage" && maxDiscount !== "" && typeof maxDiscount === "number" && maxDiscount < 0) {
      toast({ title: "Validation", description: "Max discount cannot be negative", variant: "destructive" });
      return false;
    }

    if (minCoursePrice !== "" && typeof minCoursePrice === "number" && minCoursePrice < 0) {
      toast({ title: "Validation", description: "Minimum course price cannot be negative", variant: "destructive" });
      return false;
    }

    if (usageLimit !== "" && typeof usageLimit === "number" && usageLimit < 1) {
      toast({ title: "Validation", description: "Usage limit must be at least 1", variant: "destructive" });
      return false;
    }

    if (expiresAt && new Date(expiresAt) < new Date()) {
      toast({ title: "Validation", description: "Expiry date cannot be in the past", variant: "destructive" });
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setCode("");
    setDiscountType("flat");
    setDiscountAmount("");
    setMaxDiscount("");
    setMinCoursePrice("");
    setApplicableCourse(null);
    setUsageLimit("");
    setExpiresAt("");
    setDescription("");
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validateForm()) return;

    const payload: any = {
      code: code.toUpperCase().trim(),
      discountType,
      discountAmount: typeof discountAmount === "number" ? discountAmount : Number(discountAmount),
    };

    if (discountType === "percentage") {
      payload.maxDiscount = maxDiscount === "" ? undefined : Number(maxDiscount);
    }

    if (minCoursePrice !== "") payload.minCoursePrice = Number(minCoursePrice);
    if (applicableCourse) payload.applicableCourse = applicableCourse;
    if (usageLimit !== "") payload.usageLimit = Number(usageLimit);
    if (expiresAt) {
      // server expects a date; send ISO string
      const iso = new Date(expiresAt);
      payload.expiresAt = iso.toISOString();
    }
    if (description) payload.description = description;

    try {
      setSubmitting(true);
      const resp = await axios.post(
        `${API_BASE_URL}/courses/admin/coupons`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (resp.data && resp.data.success) {
        toast({ title: "Success", description: "Coupon created successfully", variant: "success" });
        resetForm();
      } else {
        toast({ title: "Error", description: resp.data?.message || "Failed to create coupon", variant: "destructive" });
      }
    } catch (err: any) {
      console.error("Create coupon error:", err);
      const msg = err.response?.data?.message || err.message || "Failed to create coupon";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Course Coupon</CardTitle>
        <CardDescription>Admins can create coupons applicable to paid courses</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Coupon Code</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="E.g. NEW50 or FREE100"
              />
            </div>

            <div>
              <Label>Discount Type</Label>
              <Select value={discountType} onValueChange={(v) => setDiscountType(v as DiscountType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flat">Flat (₹)</SelectItem>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Discount Amount</Label>
              <Input
                type="number"
                value={discountAmount === "" ? "" : discountAmount}
                onChange={(e) => {
                  const val = e.target.value;
                  setDiscountAmount(val === "" ? "" : Number(val));
                }}
                placeholder={discountType === "percentage" ? "e.g. 20 (for 20%)" : "e.g. 500"}
                min={0}
              />
            </div>

            {discountType === "percentage" && (
              <div>
                <Label>Max Discount (optional)</Label>
                <Input
                  type="number"
                  value={maxDiscount === "" ? "" : maxDiscount}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMaxDiscount(val === "" ? "" : Number(val));
                  }}
                  placeholder="Maximum ₹ discount when percentage applied"
                  min={0}
                />
              </div>
            )}

            <div>
              <Label>Minimum Course Price (optional)</Label>
              <Input
                type="number"
                value={minCoursePrice === "" ? "" : minCoursePrice}
                onChange={(e) => {
                  const val = e.target.value;
                  setMinCoursePrice(val === "" ? "" : Number(val));
                }}
                placeholder="e.g. 500"
                min={0}
              />
            </div>

            <div>
              <Label>Applicable Course (optional)</Label>
              <Select
                value={applicableCourse ?? ""}
                onValueChange={(v) => setApplicableCourse(v === "" ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingCourses ? "Loading courses..." : "Apply to all paid courses"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Paid Courses</SelectItem>
                  {courses.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.courseName} — ₹{c.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Usage Limit (optional)</Label>
              <Input
                type="number"
                value={usageLimit === "" ? "" : usageLimit}
                onChange={(e) => setUsageLimit(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="How many times coupon can be used in total"
                min={1}
              />
            </div>

            <div>
              <Label>Expiry Date (optional)</Label>
              <Input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
              />
            </div>
          </div>

          <div>
            <Label>Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional note about coupon (terms, audience, etc.)"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" className="flex items-center gap-2" disabled={submitting}>
              {submitting ? <><Clock className="h-4 w-4 animate-spin"/> Creating...</> : "Create Coupon"}
            </Button>
            <Button
              variant="outline"
              onClick={(ev) => {
                ev.preventDefault();
                resetForm();
              }}
            >
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminCreateCoupon;
