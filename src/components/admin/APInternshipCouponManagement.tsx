// components/admin/APInternshipCouponManagement.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Ticket, Calendar, IndianRupee, Building2, Eye, Copy, CheckCircle, XCircle } from 'lucide-react';

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

  // Form state
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

  // Fetch coupons and internships on component mount
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

      // Validation
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
      {/* Header */}
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

      {/* Edit Coupon Dialog */}
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

      {/* Coupons Table */}
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

export default APInternshipCouponManagement;
