/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Database, Settings, Users, CreditCard, LogOut, Eye, Lock, Package, Plus, Ticket, Calendar, Building2, Monitor, Pill, TrendingUp, UserCheck, Banknote, Edit, Trash2, IndianRupee, Copy, CheckCircle, XCircle } from 'lucide-react';
import { pack365Api, collegeApi } from '@/services/api';
import Pack365Management from '../admin/Pack365Management';
import SuperUserManagement from '../admin/SuperUserManagement';
import { toast } from 'sonner';
import { useToast } from '@/hooks/use-toast';
import type { Pack365Course } from '@/types/api';
import Navbar from '../Navbar';
import Footer from '../Footer';

interface SuperAdminDashboardProps {
  user: { role: string; name: string };
  onLogout: () => void;
}

interface APInternshipCoupon {
  _id: string;
  code: string;
  discountAmount: number;
  discountType?: 'fixed' | 'percentage';
  applicableInternship?: string;
  internshipDetails?: {
    _id: string;
    title: string;
    companyName: string;
  };
  usageLimit: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface APInternship {
  _id: string;
  title: string;
  companyName: string;
  mode: 'Free' | 'Paid';
  amount?: number;
}

const APInternshipCouponManagement = () => {
  const [coupons, setCoupons] = useState<APInternshipCoupon[]>([]);
  const [internships, setInternships] = useState<APInternship[]>([]);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<APInternshipCoupon | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    discountAmount: '',
    discountType: 'fixed' as 'fixed' | 'percentage',
    applicableInternship: 'all',
    usageLimit: '',
    expiresAt: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    fetchCoupons();
    fetchInternships();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/internships/coupons', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setCoupons(data.coupons || []);
      } else {
        toast.error('Failed to fetch coupons');
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  const fetchInternships = async () => {
    try {
      const response = await fetch('/api/internships/ap-internships');
      const data = await response.json();
      if (data.success) {
        setInternships(data.internships || []);
      }
    } catch (error) {
      console.error('Error fetching internships:', error);
    }
  };

  const handleCreateCoupon = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      if (!formData.code || !formData.discountAmount || !formData.usageLimit) {
        toast.error('Please fill all required fields');
        return;
      }

      if (formData.discountType === 'percentage' && (Number(formData.discountAmount) < 1 || Number(formData.discountAmount) > 100)) {
        toast.error('Percentage discount must be between 1 and 100');
        return;
      }

      const payload = {
        code: formData.code.toUpperCase(),
        discountAmount: Number(formData.discountAmount),
        discountType: formData.discountType,
        applicableInternship: formData.applicableInternship === 'all' ? null : formData.applicableInternship,
        usageLimit: Number(formData.usageLimit),
        expiresAt: formData.expiresAt || undefined,
        description: formData.description,
        isActive: formData.isActive
      };

      const response = await fetch('/api/internships/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Coupon created successfully!');
        setCreateDialogOpen(false);
        resetForm();
        fetchCoupons();
      } else {
        throw new Error(data.message || 'Failed to create coupon');
      }
    } catch (error: any) {
      console.error('Error creating coupon:', error);
      toast.error(error.message || 'Failed to create coupon');
    }
  };

  const handleUpdateCoupon = async () => {
    if (!selectedCoupon) return;

    try {
      const token = localStorage.getItem('token');
      const payload = {
        discountAmount: Number(formData.discountAmount),
        discountType: formData.discountType,
        applicableInternship: formData.applicableInternship === 'all' ? null : formData.applicableInternship,
        usageLimit: Number(formData.usageLimit),
        expiresAt: formData.expiresAt || undefined,
        description: formData.description,
        isActive: formData.isActive
      };

      const response = await fetch(`/api/internships/coupons/${selectedCoupon._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Coupon updated successfully!');
        setEditDialogOpen(false);
        resetForm();
        fetchCoupons();
      } else {
        throw new Error(data.message || 'Failed to update coupon');
      }
    } catch (error: any) {
      console.error('Error updating coupon:', error);
      toast.error(error.message || 'Failed to update coupon');
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/internships/coupons/${couponId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Coupon deleted successfully!');
        fetchCoupons();
      } else {
        throw new Error(data.message || 'Failed to delete coupon');
      }
    } catch (error: any) {
      console.error('Error deleting coupon:', error);
      toast.error(error.message || 'Failed to delete coupon');
    }
  };

  const handleToggleCouponStatus = async (couponId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/internships/coupons/${couponId}/deactivate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Coupon ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
        fetchCoupons();
      } else {
        throw new Error(data.message || 'Failed to update coupon status');
      }
    } catch (error: any) {
      console.error('Error updating coupon status:', error);
      toast.error(error.message || 'Failed to update coupon status');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Coupon code copied to clipboard!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discountAmount: '',
      discountType: 'fixed',
      applicableInternship: 'all',
      usageLimit: '',
      expiresAt: '',
      description: '',
      isActive: true
    });
    setSelectedCoupon(null);
  };

  const openEditDialog = (coupon: APInternshipCoupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountAmount: coupon.discountAmount.toString(),
      discountType: coupon.discountType || 'fixed',
      applicableInternship: coupon.applicableInternship || 'all',
      usageLimit: coupon.usageLimit.toString(),
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : '',
      description: coupon.description || '',
      isActive: coupon.isActive
    });
    setEditDialogOpen(true);
  };

  const getInternshipName = (internshipId: string | undefined) => {
    if (!internshipId) return 'All Internships';
    const internship = internships.find(i => i._id === internshipId);
    return internship ? `${internship.title} - ${internship.companyName}` : 'Unknown Internship';
  };

  const isExpired = (expiresAt: string | undefined) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const getUsagePercentage = (usedCount: number, usageLimit: number) => {
    return (usedCount / usageLimit) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">AP Internship Coupons</h2>
          <p className="text-gray-600">Manage discount coupons for AP Exclusive Internships</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Coupon</DialogTitle>
              <DialogDescription>
                Create a new discount coupon for AP internships. Fill in all the details below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right">Coupon Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  placeholder="e.g., SUMMER2024"
                  className="col-span-3 uppercase"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="discountType" className="text-right">Discount Type</Label>
                <Select value={formData.discountType} onValueChange={(value: 'fixed' | 'percentage') => setFormData({...formData, discountType: value})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select discount type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="discountAmount" className="text-right">
                  Discount {formData.discountType === 'percentage' ? '(%) *' : '(₹) *'}
                </Label>
                <Input
                  id="discountAmount"
                  type="number"
                  value={formData.discountAmount}
                  onChange={(e) => setFormData({...formData, discountAmount: e.target.value})}
                  placeholder={formData.discountType === 'percentage' ? "e.g., 20" : "e.g., 500"}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="applicableInternship" className="text-right">Applicable To</Label>
                <Select value={formData.applicableInternship} onValueChange={(value) => setFormData({...formData, applicableInternship: value})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select internship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Internships</SelectItem>
                    {internships.map((internship) => (
                      <SelectItem key={internship._id} value={internship._id}>
                        {internship.title} - {internship.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="usageLimit" className="text-right">Usage Limit *</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                  placeholder="e.g., 100"
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="expiresAt" className="text-right">Expiry Date</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                  className="col-span-3"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Optional description"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCoupon} disabled={loading}>
                {loading ? 'Creating...' : 'Create Coupon'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
            <DialogDescription>
              Update the coupon details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Coupon Code</Label>
              <div className="col-span-3 font-mono font-bold text-lg">{formData.code}</div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-discountType" className="text-right">Discount Type</Label>
              <Select value={formData.discountType} onValueChange={(value: 'fixed' | 'percentage') => setFormData({...formData, discountType: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select discount type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-discountAmount" className="text-right">
                Discount {formData.discountType === 'percentage' ? '(%) *' : '(₹) *'}
              </Label>
              <Input
                id="edit-discountAmount"
                type="number"
                value={formData.discountAmount}
                onChange={(e) => setFormData({...formData, discountAmount: e.target.value})}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-applicableInternship" className="text-right">Applicable To</Label>
              <Select value={formData.applicableInternship} onValueChange={(value) => setFormData({...formData, applicableInternship: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select internship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Internships</SelectItem>
                  {internships.map((internship) => (
                    <SelectItem key={internship._id} value={internship._id}>
                      {internship.title} - {internship.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-usageLimit" className="text-right">Usage Limit *</Label>
              <Input
                id="edit-usageLimit"
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-expiresAt" className="text-right">Expiry Date</Label>
              <Input
                id="edit-expiresAt"
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                className="col-span-3"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">Description</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-isActive" className="text-right">Status</Label>
              <Select value={formData.isActive.toString()} onValueChange={(value) => setFormData({...formData, isActive: value === 'true'})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCoupon} disabled={loading}>
              {loading ? 'Updating...' : 'Update Coupon'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>All Coupons</CardTitle>
          <CardDescription>
            {coupons.length} coupon{coupons.length !== 1 ? 's' : ''} available
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading coupons...</p>
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-8">
              <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No coupons found</p>
              <Button onClick={() => setCreateDialogOpen(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Coupon
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Coupon Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Applicable To</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon._id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold">{coupon.code}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyCode(coupon.code)}
                            className="h-6 w-6 p-0"
                          >
                            {copiedCode === coupon.code ? (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <IndianRupee className="h-3 w-3 mr-1" />
                          <span className="font-medium">
                            {coupon.discountType === 'percentage' 
                              ? `${coupon.discountAmount}%` 
                              : coupon.discountAmount}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-3 w-3 text-gray-500" />
                          <span className="text-sm">
                            {getInternshipName(coupon.applicableInternship)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>{coupon.usedCount} / {coupon.usageLimit}</span>
                            <span>{Math.round(getUsagePercentage(coupon.usedCount, coupon.usageLimit))}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                getUsagePercentage(coupon.usedCount, coupon.usageLimit) >= 90
                                  ? 'bg-red-600'
                                  : getUsagePercentage(coupon.usedCount, coupon.usageLimit) >= 75
                                  ? 'bg-yellow-600'
                                  : 'bg-green-600'
                              }`}
                              style={{
                                width: `${Math.min(getUsagePercentage(coupon.usedCount, coupon.usageLimit), 100)}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-3 w-3 text-gray-500" />
                          <span className={`text-sm ${
                            isExpired(coupon.expiresAt) ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {coupon.expiresAt 
                              ? new Date(coupon.expiresAt).toLocaleDateString()
                              : 'No expiry'
                            }
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            !coupon.isActive || isExpired(coupon.expiresAt) || coupon.usedCount >= coupon.usageLimit
                              ? 'destructive'
                              : 'default'
                          }
                        >
                          {!coupon.isActive ? 'Inactive' : 
                           isExpired(coupon.expiresAt) ? 'Expired' :
                           coupon.usedCount >= coupon.usageLimit ? 'Used Up' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(coupon)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleCouponStatus(coupon._id, coupon.isActive)}
                          >
                            {coupon.isActive ? (
                              <XCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            )}
                            {coupon.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteCoupon(coupon._id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const SuperAdminDashboard = ({ user, onLogout }: SuperAdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [pack365Tab, setPack365Tab] = useState('overview');
  const [createCouponOpen, setCreateCouponOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [discount, setDiscount] = useState('');
  const [selectedStream, setSelectedStream] = useState('');
  const [description, setDescription] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const { toast: useToastHook } = useToast();
  const [filteredCourses, setFilteredCourses] = useState<Pack365Course[]>([]);
  const [enrollmentCode, setEnrollmentCode] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createEnrollmentOpen, setCreateEnrollmentOpen] = useState(false);

  const [courses, setCourses] = useState<Pack365Course[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [collegeRequests, setCollegeRequests] = useState<any[]>([]);
  
  const streamData = [
    { name: 'IT', icon: Monitor, color: 'bg-blue-500', description: 'Information Technology Courses' },
    { name: 'PHARMA', icon: Pill, color: 'bg-green-500', description: 'Pharmaceutical Courses' },
    { name: 'MARKETING', icon: TrendingUp, color: 'bg-purple-500', description: 'Marketing & Sales Courses' },
    { name: 'HR', icon: UserCheck, color: 'bg-orange-500', description: 'Human Resources Courses' },
    { name: 'FINANCE', icon: Banknote, color: 'bg-emerald-500', description: 'Finance & Accounting Courses' }
  ];

  useEffect(() => {
    fetchCourses();
    fetchCoupons();
    fetchCollegeRequests();
  }, []);

  useEffect(() => {
    if (selectedStream && courses.length > 0) {
      const filtered = courses.filter(course => 
        course.stream.toUpperCase() === selectedStream.toUpperCase()
      );
      setFilteredCourses(filtered);
    }
  }, [selectedStream, courses]);

  const fetchCourses = async () => {
    try {
      const response = await pack365Api.getAllCourses();
      if (response.success) {
        setCourses(response.data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleStreamSelect = (streamName: string) => {
    setSelectedStream(streamName);
  };

  const handleBackToStreams = () => {
    setSelectedStream('');
    setFilteredCourses([]);
  };

  const fetchCoupons = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await pack365Api.getAllEnrollmentCodes(token);
      if (response.success) {
        setCoupons(Array.isArray(response.codes) ? response.codes : []);
      } else {
        setCoupons([]);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to fetch coupons');
    }
  };

  const fetchCollegeRequests = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await collegeApi.getCollegeRequests(token);
      if (response.success) {
        setCollegeRequests(response.requests);
      }
    } catch (error) {
      console.error('Error fetching college requests:', error);
      useToastHook({
        title: 'Error',
        description: 'Failed to load college requests',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await collegeApi.acceptServiceRequest(token, requestId);
      if (response.success) {
        useToastHook({
          title: 'Success',
          description: 'Request accepted successfully',
        });
        fetchCollegeRequests();
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      useToastHook({
        title: 'Error',
        description: 'Failed to accept request',
        variant: 'destructive'
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await collegeApi.rejectServiceRequest(token, requestId);
      if (response.success) {
        useToastHook({
          title: 'Success',
          description: 'Request rejected successfully',
        });
        fetchCollegeRequests();
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      useToastHook({
        title: 'Error',
        description: 'Failed to reject request',
        variant: 'destructive'
      });
    }
  };

  const handleCreateEnrollmentCode = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      if (!enrollmentCode || !selectedStream || !usageLimit) {
        toast.error('Please fill all required fields');
        return;
      }

      const response = await pack365Api.createEnrollmentCode(token, {
        code: enrollmentCode,
        stream: selectedStream,
        usageLimit: parseInt(usageLimit),
        expiresAt: expiresAt || undefined,
        description: description
      });

      if (response.success) {
        toast.success('Enrollment code created successfully!');
        fetchCoupons();
        setEnrollmentCode('');
        setSelectedStream('');
        setUsageLimit('');
        setExpiresAt('');
        setDescription('');
        setCreateEnrollmentOpen(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create enrollment code');
    }
  };

  const handleCreateCoupon = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      if (!couponCode || !selectedStream || !discount || !usageLimit) {
        toast.error('Please fill all required fields');
        return;
      }

      const response = await pack365Api.createEnrollmentCode(token, {
        code: couponCode,
        stream: selectedStream,
        discountAmount: parseInt(discount),
        usageLimit: parseInt(usageLimit),
        expiresAt: expiryDate || undefined,
        description: description
      });

      if (response.success) {
        toast.success('Coupon created successfully!');
        fetchCoupons();
        setCouponCode('');
        setSelectedStream('');
        setDiscount('');
        setUsageLimit('');
        setExpiryDate('');
        setDescription('');
        setCreateCouponOpen(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create coupon');
    }
  };

  const handleToggleCouponStatus = async (couponId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No authentication token found');
        return;
      }

      await pack365Api.deactivateEnrollmentCode(token, couponId);
      toast.success(`Coupon ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      
      fetchCoupons();
    } catch (error) {
      console.error('Error updating coupon status:', error);
      toast.error('Failed to update coupon status');
    }
  };

  const systemStats = {
    totalRevenue: '₹12,34,567',
    activeSubscriptions: 456,
    serverUptime: '99.9%',
    dataStorage: '2.4 TB',
    apiCalls: '1.2M'
  };

  const pendingRequests = collegeRequests.filter(request => request.status === 'Pending');

  return (
    <><Navbar />
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Control</TabsTrigger>
            <TabsTrigger value="pack365">Pack365</TabsTrigger>
            <TabsTrigger value="ap-coupons">AP Internship Coupons</TabsTrigger>
            <TabsTrigger value="college-approvals">College Approvals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.totalRevenue}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.activeSubscriptions}</div>
                  <p className="text-xs text-muted-foreground">Active plans</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Server Uptime</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{systemStats.serverUptime}</div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Data Storage</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.dataStorage}</div>
                  <p className="text-xs text-muted-foreground">Used storage</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">API Calls</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.apiCalls}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Pending College Approvals</CardTitle>
                <CardDescription>College service requests requiring super admin approval</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingRequests.slice(0, 3).map((request) => (
                    <div key={request._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{request.institutionName}</p>
                        <p className="text-sm text-gray-500">College Service Request - {request.serviceCategory?.join(', ') || 'General'}</p>
                        <p className="text-xs text-gray-400">Requested on {new Date(request.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">Pending</Badge>
                        <Button variant="outline" size="sm" onClick={() => setActiveTab('college-approvals')}>Review</Button>
                      </div>
                    </div>
                  ))}
                  {pendingRequests.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No pending approvals</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <SuperUserManagement user={user} />
          </TabsContent>

          <TabsContent value="pack365" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Pack365 Management</h2>
              <div className="flex space-x-2">
                <Dialog open={createEnrollmentOpen} onOpenChange={setCreateEnrollmentOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Enrollment Code
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create Enrollment Code</DialogTitle>
                      <DialogDescription>
                        Create a new enrollment code for a specific stream.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="stream" className="text-right">Stream</Label>
                        <div className="col-span-3">
                          <Select value={selectedStream} onValueChange={setSelectedStream}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a stream" />
                            </SelectTrigger>
                            <SelectContent>
                              {streamData.map((stream) => (
                                <SelectItem key={stream.name} value={stream.name}>
                                  {stream.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="enrollmentCode" className="text-right">Code</Label>
                        <Input
                          id="enrollmentCode"
                          value={enrollmentCode}
                          onChange={(e) => setEnrollmentCode(e.target.value)}
                          placeholder="e.g., ENROLL2024"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="usageLimit" className="text-right">Usage Limit</Label>
                        <Input
                          id="usageLimit"
                          type="number"
                          value={usageLimit}
                          onChange={(e) => setUsageLimit(e.target.value)}
                          placeholder="e.g., 100"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="expiresAt" className="text-right">Expires At</Label>
                        <Input
                          id="expiresAt"
                          type="date"
                          value={expiresAt}
                          onChange={(e) => setExpiresAt(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">Description</Label>
                        <Input
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Optional description"
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setCreateEnrollmentOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="button" onClick={handleCreateEnrollmentCode} disabled={isLoading}>
                        {isLoading ? 'Creating...' : 'Create Code'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={createCouponOpen} onOpenChange={setCreateCouponOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Coupon
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create New Coupon</DialogTitle>
                      <DialogDescription>
                        Create a new coupon code for streams. Fill in all the details below.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="stream" className="text-right">Stream</Label>
                        <div className="col-span-3">
                          <Select value={selectedStream} onValueChange={setSelectedStream}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a stream" />
                            </SelectTrigger>
                            <SelectContent>
                              {streamData.map((stream) => (
                                <SelectItem key={stream.name} value={stream.name}>
                                  {stream.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="couponCode" className="text-right">Coupon Code</Label>
                        <Input
                          id="couponCode"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="e.g., SAVE20"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="discount" className="text-right">Discount Amount (₹)</Label>
                        <Input
                          id="discount"
                          type="number"
                          value={discount}
                          onChange={(e) => setDiscount(e.target.value)}
                          placeholder="e.g., 200"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="usageLimit" className="text-right">Usage Limit</Label>
                        <Input
                          id="usageLimit"
                          type="number"
                          value={usageLimit}
                          onChange={(e) => setUsageLimit(e.target.value)}
                          placeholder="e.g., 50"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="expiryDate" className="text-right">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          type="date"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">Description</Label>
                        <Input
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Optional description"
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setCreateCouponOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="button" onClick={handleCreateCoupon} disabled={isLoading}>
                        {isLoading ? 'Creating...' : 'Create Coupon'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Tabs value={pack365Tab} onValueChange={setPack365Tab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="management">Course Management</TabsTrigger>
                <TabsTrigger value="coupons">Coupons</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Package className="h-5 w-5 mr-2 text-blue-600" />
                        Total Courses
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-600">{courses.length}</div>
                      <p className="text-sm text-gray-500">Available courses</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Ticket className="h-5 w-5 mr-2 text-green-600" />
                        Active Coupons
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600">{coupons.filter(c => c.isActive).length}</div>
                      <p className="text-sm text-gray-500">Currently available</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
                        Monthly Revenue
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-purple-600">₹5,67,890</div>
                      <p className="text-sm text-gray-500">From Pack365</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Pack365 Courses</CardTitle>
                    <CardDescription>All available Pack365 courses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!selectedStream ? (
                      <div>
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-2xl font-bold">Course Bundels</h2>
                          <p className="text-sm text-gray-600">Select a Bundel to view courses</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {streamData.map((stream) => {
                            const IconComponent = stream.icon;
                            const streamCourseCount = courses.filter(course => course.stream.toUpperCase() === stream.name.toUpperCase()
                            ).length;

                            return (
                              <Card
                                key={stream.name}
                                className="hover:shadow-lg transition-shadow cursor-pointer transform hover:scale-105"
                                onClick={() => handleStreamSelect(stream.name)}
                              >
                                <CardContent className="p-6">
                                  <div className="flex items-center space-x-4">
                                    <div className={`${stream.color} p-3 rounded-lg text-white`}>
                                      <IconComponent className="h-6 w-6" />
                                    </div>
                                    <div>
                                      <h3 className="text-lg font-semibold">{stream.name}</h3>
                                      <p className="text-sm text-gray-600">{stream.description}</p>
                                      <p className="text-xs text-gray-500 mt-2">
                                        {streamCourseCount} course{streamCourseCount !== 1 ? 's' : ''} available
                                      </p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-4">
                            <Button variant="outline" onClick={handleBackToStreams}>
                              ← Back to Streams
                            </Button>
                            <h2 className="text-2xl font-bold">{selectedStream} Courses</h2>
                          </div>
                          <Badge variant="outline">
                            {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>

                        <div className="space-y-4">
                          {filteredCourses.map((course) => (
                            <Card key={course._id} className="hover:shadow-md transition-shadow">
                              <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h3 className="text-lg font-semibold mb-2">{course.courseName}</h3>
                                    <p className="text-gray-600 mb-3">{course.description}</p>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                      <span>Duration: {course.totalDuration} hours</span>
                                      <span>Topics: {course.topics?.length || 0}</span>
                                      <Badge variant="secondary">{course.stream.toUpperCase()}</Badge>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-2xl font-bold text-green-600">₹{course.price}</p>
                                    <Button className="mt-2">
                                      Request Access
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                          {filteredCourses.length === 0 && (
                            <Card>
                              <CardContent className="p-8 text-center">
                                <p className="text-gray-500">No courses available for {selectedStream} stream</p>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="management" className="space-y-6">
                <Pack365Management />
              </TabsContent>

              <TabsContent value="coupons" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>All Coupons</CardTitle>
                    <CardDescription>Manage all coupon codes and their status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {coupons.map((coupon) => (
                        <div key={coupon._id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <Ticket className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium">{coupon.code}</p>
                              <p className="text-sm text-gray-500">{coupon.stream}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="font-medium">
                                {coupon.discountAmount ? `₹${coupon.discountAmount} off` : 'FREE'}
                              </p>
                              <p className="text-sm text-gray-500 flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'No expiry'}
                              </p>
                            </div>
                            <Badge variant={coupon.isActive ? 'default' : 'secondary'}>
                              {coupon.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">Edit</Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleCouponStatus(coupon._id, coupon.isActive)}
                              >
                                {coupon.isActive ? 'Deactivate' : 'Activate'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="ap-coupons" className="space-y-6">
            <APInternshipCouponManagement />
          </TabsContent>

          <TabsContent value="college-approvals" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">College Service Approvals</h2>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{pendingRequests.length} Pending Approvals</Badge>
                <Button onClick={fetchCollegeRequests} disabled={isLoading}>
                  {isLoading ? 'Loading...' : 'Refresh'}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {collegeRequests.map((request) => (
                <Card key={request._id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Building2 className="h-5 w-5 text-blue-600" />
                          <h3 className="font-semibold text-lg">{request.institutionName}</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p><span className="font-medium">Contact:</span> {request.contactPerson}</p>
                            <p><span className="font-medium">Email:</span> {request.email}</p>
                            <p><span className="font-medium">Phone:</span> {request.phoneNumber}</p>
                          </div>
                          <div>
                            <p><span className="font-medium">Expected Students:</span> {request.expectedStudents}</p>
                            <p><span className="font-medium">Preferred Date:</span> {request.preferredDate}</p>
                            <p><span className="font-medium">Type:</span> {request.serviceCategory?.join(', ') || 'College Service Request'}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="text-sm"><span className="font-medium">Description:</span> {request.serviceDescription}</p>
                          {request.additionalRequirements && (
                            <p className="text-sm"><span className="font-medium">Additional Requirements:</span> {request.additionalRequirements}</p>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          Requested on: {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge
                          variant={request.status === 'Accepted' ? 'default' :
                            request.status === 'Rejected' ? 'destructive' : 'outline'}
                        >
                          {request.status}
                        </Badge>
                        {request.status === 'Pending' && (
                          <div className="flex space-x-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRejectRequest(request._id)}
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleAcceptRequest(request._id)}
                            >
                              Accept
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {collegeRequests.length === 0 && !isLoading && (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-gray-500">No college service requests found</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default SuperAdminDashboard;
