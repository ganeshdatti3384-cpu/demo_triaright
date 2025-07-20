
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Monitor,
  Building,
  Pill,
  TrendingUp,
  Users,
  DollarSign,
  Plus,
  Edit,
  Check,
  X,
  Upload,
  Download,
  AlertTriangle
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { pack365Api } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"

const SuperAdminDashboard = () => {
  const { toast } = useToast();
  const { token } = useAuth();
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount: 0,
    expiryDate: '',
    description: ''
  });
  const [coupons, setCoupons] = useState<any[]>([]);
  const [selectedStream, setSelectedStream] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [examFile, setExamFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState<any | null>(null);
  const [newMaxAttempts, setNewMaxAttempts] = useState<number | undefined>(undefined);
  const [isUpdatingAttempts, setIsUpdatingAttempts] = useState(false);
  const [date, setDate] = useState<Date>();

  const streams = [
    { name: 'IT', icon: Monitor, color: 'blue', description: 'Information Technology' },
    { name: 'Non-IT', icon: Building, color: 'green', description: 'Non-Information Technology' },
    { name: 'Pharma', icon: Pill, color: 'purple', description: 'Pharmaceutical' },
    { name: 'Marketing', icon: TrendingUp, color: 'orange', description: 'Marketing & Sales' },
    { name: 'HR', icon: Users, color: 'pink', description: 'Human Resources' },
    { name: 'Finance', icon: DollarSign, color: 'yellow', description: 'Finance & Accounting' }
  ];

  useEffect(() => {
    fetchCoupons();
    fetchExams();
  }, [token]);

  const fetchCoupons = async () => {
    if (!token) return;
    try {
      const response = await pack365Api.getAllCoupons(token);
      if (response.success) {
        setCoupons(response.coupons || []);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch coupons',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch coupons',
        variant: 'destructive'
      });
    }
  };

  const handleCreateCoupon = async () => {
    if (!newCoupon.code || !selectedStream || !newCoupon.discount || !newCoupon.expiryDate) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      const couponData = {
        code: newCoupon.code,
        courseId: selectedStream,
        discount: newCoupon.discount,
        expiryDate: newCoupon.expiryDate,
        description: newCoupon.description
      };

      await pack365Api.createCoupon(token!, couponData);
      
      toast({
        title: 'Success',
        description: 'Coupon created successfully'
      });
      
      setNewCoupon({ code: '', discount: 0, expiryDate: '', description: '' });
      setSelectedStream('');
      fetchCoupons();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create coupon',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateCouponStatus = async (couponId: string, isActive: boolean) => {
    if (!token) return;
    setIsUpdatingStatus(true);
    try {
      await pack365Api.updateCouponStatus(token, couponId, !isActive);
      toast({
        title: 'Success',
        description: `Coupon ${isActive ? 'deactivated' : 'activated'} successfully`
      });
      fetchCoupons();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update coupon status',
        variant: 'destructive'
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleExamFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setExamFile(e.target.files[0]);
    }
  };

  const handleUploadExam = async () => {
    if (!examFile || !token) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', examFile);
      const response = await pack365Api.uploadExamFromExcel(token, formData);

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Exam uploaded successfully'
        });
        setExamFile(null);
        fetchExams();
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to upload exam',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to upload exam',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const fetchExams = async () => {
    if (!token) return;
    try {
      const examsData = await pack365Api.getAllExams(token);
      setExams(examsData);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch exams',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateMaxAttempts = async () => {
    if (!selectedExam || newMaxAttempts === undefined || !token) {
      toast({
        title: 'Error',
        description: 'Please select an exam and enter a valid number of attempts',
        variant: 'destructive'
      });
      return;
    }

    setIsUpdatingAttempts(true);
    try {
      const response = await pack365Api.updateExamMaxAttempts(token, {
        examId: selectedExam._id,
        maxAttempts: newMaxAttempts
      });

      if (response.message === 'Exam max attempts updated successfully') {
        toast({
          title: 'Success',
          description: 'Max attempts updated successfully'
        });
        fetchExams();
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to update max attempts',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update max attempts',
        variant: 'destructive'
      });
    } finally {
      setIsUpdatingAttempts(false);
    }
  };

  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      ['Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer (A, B, C, or D)', 'Course ID', 'Exam Name', 'Pass Marks', 'Total Marks', 'Exam Duration (minutes)']
    ]);
    XLSX.utils.book_append_sheet(wb, ws, 'Exam Template');
    const wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
    const wbout = XLSX.write(wb, wopts);

    const blob = new Blob([new Uint8Array(wbout)], { type: 'application/octet-stream' });
    saveAs(blob, 'exam_template.xlsx');
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Super Admin Dashboard</h1>

      {/* Coupon Management Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Coupon Management</h2>
        <Card>
          <CardHeader>
            <CardTitle>Create New Coupon</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="couponCode">Coupon Code</Label>
              <Input
                id="couponCode"
                value={newCoupon.code}
                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="discount">Discount (%)</Label>
              <Input
                id="discount"
                type="number"
                value={newCoupon.discount}
                onChange={(e) => setNewCoupon({ ...newCoupon, discount: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`w-full justify-start text-left font-normal ${!date && "text-muted-foreground"}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(selectedDate) => {
                      setDate(selectedDate);
                      setNewCoupon({
                        ...newCoupon,
                        expiryDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
                      });
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="stream">Stream</Label>
              <Select onValueChange={(value) => setSelectedStream(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a stream" />
                </SelectTrigger>
                <SelectContent>
                  {streams.map((stream, index) => (
                    <SelectItem key={index} value={stream.name.toLowerCase()}>
                      {stream.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Coupon Description"
                value={newCoupon.description}
                onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <Button onClick={handleCreateCoupon} className="w-full">
                Create Coupon
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Coupon Listing Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Existing Coupons</h2>
        {coupons.length > 0 ? (
          <Table>
            <TableCaption>A list of all available coupons.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Code</TableHead>
                <TableHead>Stream</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon._id}>
                  <TableCell className="font-medium">{coupon.code}</TableCell>
                  <TableCell>{coupon.courseId}</TableCell>
                  <TableCell>{coupon.discount}%</TableCell>
                  <TableCell>{coupon.expiryDate}</TableCell>
                  <TableCell>{coupon.isActive ? 'Active' : 'Inactive'}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isUpdatingStatus}
                      onClick={() => handleUpdateCouponStatus(coupon._id, coupon.isActive)}
                    >
                      {coupon.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Card>
            <CardContent>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <p className="text-sm text-gray-500">No coupons found. Create one to get started!</p>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      <Separator className="my-6" />

      {/* Exam Management Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Exam Management</h2>
        <Card>
          <CardHeader>
            <CardTitle>Upload Exam Questions</CardTitle>
            <CardDescription>
              Upload an Excel file containing exam questions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-4">
              <Button variant="outline" onClick={handleDownloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              <Input
                type="file"
                id="examFile"
                accept=".xlsx, .xls"
                className="hidden"
                onChange={handleExamFileChange}
              />
              <Label htmlFor="examFile" className="cursor-pointer bg-secondary text-secondary-foreground rounded-md px-4 py-2 hover:bg-secondary/80">
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Label>
              {examFile && <span className="text-sm text-gray-500">{examFile.name}</span>}
            </div>
            <Button onClick={handleUploadExam} disabled={isUploading}>
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                'Upload Exam'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Exam Listing and Max Attempts Update */}
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Update Exam Max Attempts</h3>
          {exams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="selectExam">Select Exam</Label>
                <Select onValueChange={(value) => {
                  const selected = exams.find(exam => exam._id === value);
                  setSelectedExam(selected || null);
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.map((exam) => (
                      <SelectItem key={exam._id} value={exam._id}>
                        {exam.examName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="maxAttempts">New Max Attempts</Label>
                <Input
                  type="number"
                  id="maxAttempts"
                  placeholder="Enter max attempts"
                  value={newMaxAttempts !== undefined ? newMaxAttempts.toString() : ''}
                  onChange={(e) => setNewMaxAttempts(Number(e.target.value))}
                />
              </div>
              <div className="md:col-span-2">
                <Button onClick={handleUpdateMaxAttempts} disabled={isUpdatingAttempts} className="w-full">
                  {isUpdatingAttempts ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Max Attempts'
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <p className="text-sm text-gray-500">No exams found. Upload one to get started!</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
};

const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p
      className={cn(
        "text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function cn(...inputs: (string | undefined | null)[]): string {
  return inputs.filter(Boolean).join(' ');
}

export default SuperAdminDashboard;
