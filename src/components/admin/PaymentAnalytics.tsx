
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Users, TrendingUp, Download } from 'lucide-react';

interface PaymentRecord {
  id: string;
  studentName: string;
  studentEmail: string;
  courseName: string;
  courseType: 'pack365' | 'regular';
  amount: number;
  paymentDate: string;
  status: 'completed' | 'pending' | 'failed';
}

const PaymentAnalytics = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalStudents: 0,
    pack365Revenue: 0,
    regularCoursesRevenue: 0,
    completedPayments: 0,
    pendingPayments: 0
  });

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = () => {
    // Load payment data from localStorage (in a real app, this would come from a backend)
    const savedPayments = localStorage.getItem('studentPayments');
    let paymentData: PaymentRecord[] = [];
    
    if (savedPayments) {
      paymentData = JSON.parse(savedPayments);
    } else {
      // Sample data for demonstration
      paymentData = [
        {
          id: '1',
          studentName: 'John Doe',
          studentEmail: 'john@example.com',
          courseName: 'Complete Web Development Bootcamp',
          courseType: 'pack365',
          amount: 365,
          paymentDate: '2024-01-15',
          status: 'completed'
        },
        {
          id: '2',
          studentName: 'Jane Smith',
          studentEmail: 'jane@example.com',
          courseName: 'Data Science Fundamentals',
          courseType: 'regular',
          amount: 199,
          paymentDate: '2024-01-14',
          status: 'completed'
        },
        {
          id: '3',
          studentName: 'Mike Johnson',
          studentEmail: 'mike@example.com',
          courseName: 'Full Stack Data Science Pack',
          courseType: 'pack365',
          amount: 365,
          paymentDate: '2024-01-13',
          status: 'pending'
        }
      ];
      localStorage.setItem('studentPayments', JSON.stringify(paymentData));
    }
    
    setPayments(paymentData);
    calculateAnalytics(paymentData);
  };

  const calculateAnalytics = (paymentData: PaymentRecord[]) => {
    const completedPayments = paymentData.filter(p => p.status === 'completed');
    const pendingPayments = paymentData.filter(p => p.status === 'pending');
    const pack365Payments = completedPayments.filter(p => p.courseType === 'pack365');
    const regularPayments = completedPayments.filter(p => p.courseType === 'regular');
    
    setAnalytics({
      totalRevenue: completedPayments.reduce((sum, p) => sum + p.amount, 0),
      totalStudents: paymentData.length,
      pack365Revenue: pack365Payments.reduce((sum, p) => sum + p.amount, 0),
      regularCoursesRevenue: regularPayments.reduce((sum, p) => sum + p.amount, 0),
      completedPayments: completedPayments.length,
      pendingPayments: pendingPayments.length
    });
  };

  const exportPaymentData = () => {
    const csvContent = [
      ['Student Name', 'Email', 'Course Name', 'Type', 'Amount', 'Date', 'Status'],
      ...payments.map(p => [
        p.studentName,
        p.studentEmail,
        p.courseName,
        p.courseType,
        p.amount.toString(),
        p.paymentDate,
        p.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payment-analytics.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Payment Analytics</h2>
          <p className="text-gray-600">Track student payments and revenue</p>
        </div>
        <Button onClick={exportPaymentData} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.totalRevenue}</div>
            <p className="text-xs text-muted-foreground">From completed payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalStudents}</div>
            <p className="text-xs text-muted-foreground">All payment records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pack365 Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.pack365Revenue}</div>
            <p className="text-xs text-muted-foreground">From Pack365 courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Payments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completedPayments}</div>
            <p className="text-xs text-muted-foreground">{analytics.pendingPayments} pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Records */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Payments</TabsTrigger>
          <TabsTrigger value="pack365">Pack365</TabsTrigger>
          <TabsTrigger value="regular">Regular Courses</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Payment Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{payment.studentName}</p>
                      <p className="text-sm text-gray-500">{payment.studentEmail}</p>
                      <p className="text-sm text-gray-600">{payment.courseName}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <Badge variant={payment.courseType === 'pack365' ? 'default' : 'secondary'}>
                          {payment.courseType}
                        </Badge>
                        <Badge variant={payment.status === 'completed' ? 'default' : 
                                     payment.status === 'pending' ? 'secondary' : 'destructive'}>
                          {payment.status}
                        </Badge>
                      </div>
                      <p className="font-bold text-lg">${payment.amount}</p>
                      <p className="text-xs text-gray-500">{payment.paymentDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pack365">
          <Card>
            <CardHeader>
              <CardTitle>Pack365 Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.filter(p => p.courseType === 'pack365').map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{payment.studentName}</p>
                      <p className="text-sm text-gray-500">{payment.studentEmail}</p>
                      <p className="text-sm text-gray-600">{payment.courseName}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={payment.status === 'completed' ? 'default' : 
                                   payment.status === 'pending' ? 'secondary' : 'destructive'}>
                        {payment.status}
                      </Badge>
                      <p className="font-bold text-lg">${payment.amount}</p>
                      <p className="text-xs text-gray-500">{payment.paymentDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regular">
          <Card>
            <CardHeader>
              <CardTitle>Regular Course Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.filter(p => p.courseType === 'regular').map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{payment.studentName}</p>
                      <p className="text-sm text-gray-500">{payment.studentEmail}</p>
                      <p className="text-sm text-gray-600">{payment.courseName}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={payment.status === 'completed' ? 'default' : 
                                   payment.status === 'pending' ? 'secondary' : 'destructive'}>
                        {payment.status}
                      </Badge>
                      <p className="font-bold text-lg">${payment.amount}</p>
                      <p className="text-xs text-gray-500">{payment.paymentDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.filter(p => p.status === 'pending').map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{payment.studentName}</p>
                      <p className="text-sm text-gray-500">{payment.studentEmail}</p>
                      <p className="text-sm text-gray-600">{payment.courseName}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">pending</Badge>
                      <p className="font-bold text-lg">${payment.amount}</p>
                      <p className="text-xs text-gray-500">{payment.paymentDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentAnalytics;
