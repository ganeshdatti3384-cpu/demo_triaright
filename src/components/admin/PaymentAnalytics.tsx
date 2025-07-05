
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
<<<<<<< HEAD
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { DollarSign, Users, TrendingUp, CreditCard, Calendar, Filter } from 'lucide-react';

interface PaymentData {
=======
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Users, TrendingUp, Download } from 'lucide-react';

interface PaymentRecord {
>>>>>>> 353d7e975c005bdcc6e584a454eecc48787a84ae
  id: string;
  studentName: string;
  studentEmail: string;
  courseName: string;
<<<<<<< HEAD
  courseType: 'course' | 'pack365';
  amount: number;
  paymentDate: string;
  paymentStatus: 'completed' | 'pending' | 'failed';
  paymentMethod: string;
}

const PaymentAnalytics = () => {
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [monthlyGrowth, setMonthlyGrowth] = useState(0);

  useEffect(() => {
    // Generate mock payment data
    const mockPayments: PaymentData[] = [
      {
        id: '1',
        studentName: 'John Doe',
        studentEmail: 'john@example.com',
        courseName: 'Complete Web Development Bootcamp',
        courseType: 'pack365',
        amount: 365,
        paymentDate: '2024-01-15',
        paymentStatus: 'completed',
        paymentMethod: 'Credit Card'
      },
      {
        id: '2',
        studentName: 'Jane Smith',
        studentEmail: 'jane@example.com',
        courseName: 'React Fundamentals',
        courseType: 'course',
        amount: 99,
        paymentDate: '2024-01-14',
        paymentStatus: 'completed',
        paymentMethod: 'UPI'
      },
      {
        id: '3',
        studentName: 'Mike Johnson',
        studentEmail: 'mike@example.com',
        courseName: 'Data Science Pack',
        courseType: 'pack365',
        amount: 365,
        paymentDate: '2024-01-13',
        paymentStatus: 'completed',
        paymentMethod: 'Debit Card'
      },
      {
        id: '4',
        studentName: 'Sarah Wilson',
        studentEmail: 'sarah@example.com',
        courseName: 'Python Basics',
        courseType: 'course',
        amount: 49,
        paymentDate: '2024-01-12',
        paymentStatus: 'pending',
        paymentMethod: 'Digital Wallet'
      },
      {
        id: '5',
        studentName: 'Tom Brown',
        studentEmail: 'tom@example.com',
        courseName: 'JavaScript Advanced',
        courseType: 'course',
        amount: 149,
        paymentDate: '2024-01-11',
        paymentStatus: 'failed',
        paymentMethod: 'Credit Card'
      }
    ];

    setPayments(mockPayments);
    
    // Calculate analytics
    const completedPayments = mockPayments.filter(p => p.paymentStatus === 'completed');
    const revenue = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const uniqueStudents = new Set(completedPayments.map(p => p.studentEmail)).size;
    
    setTotalRevenue(revenue);
    setTotalStudents(uniqueStudents);
    setMonthlyGrowth(25.4); // Mock growth percentage
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const completedPayments = payments.filter(p => p.paymentStatus === 'completed');
  const pendingPayments = payments.filter(p => p.paymentStatus === 'pending');
  const failedPayments = payments.filter(p => p.paymentStatus === 'failed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
=======
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
>>>>>>> 353d7e975c005bdcc6e584a454eecc48787a84ae
        <div>
          <h2 className="text-2xl font-bold">Payment Analytics</h2>
          <p className="text-gray-600">Track student payments and revenue</p>
        </div>
<<<<<<< HEAD
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
=======
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
>>>>>>> 353d7e975c005bdcc6e584a454eecc48787a84ae
          </CardContent>
        </Card>

        <Card>
<<<<<<< HEAD
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paying Students</p>
                <p className="text-2xl font-bold">{totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
=======
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalStudents}</div>
            <p className="text-xs text-muted-foreground">All payment records</p>
>>>>>>> 353d7e975c005bdcc6e584a454eecc48787a84ae
          </CardContent>
        </Card>

        <Card>
<<<<<<< HEAD
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Growth</p>
                <p className="text-2xl font-bold">+{monthlyGrowth}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
=======
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pack365 Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.pack365Revenue}</div>
            <p className="text-xs text-muted-foreground">From Pack365 courses</p>
>>>>>>> 353d7e975c005bdcc6e584a454eecc48787a84ae
          </CardContent>
        </Card>

        <Card>
<<<<<<< HEAD
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold">{payments.length}</p>
              </div>
              <CreditCard className="h-8 w-8 text-orange-600" />
            </div>
=======
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Payments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completedPayments}</div>
            <p className="text-xs text-muted-foreground">{analytics.pendingPayments} pending</p>
>>>>>>> 353d7e975c005bdcc6e584a454eecc48787a84ae
          </CardContent>
        </Card>
      </div>

<<<<<<< HEAD
      {/* Payment Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Completed Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{completedPayments.length}</div>
            <Progress value={(completedPayments.length / payments.length) * 100} className="mb-2" />
            <p className="text-sm text-gray-600">
              ${completedPayments.reduce((sum, p) => sum + p.amount, 0)} revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-yellow-600">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{pendingPayments.length}</div>
            <Progress value={(pendingPayments.length / payments.length) * 100} className="mb-2" />
            <p className="text-sm text-gray-600">
              ${pendingPayments.reduce((sum, p) => sum + p.amount, 0)} potential
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Failed Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{failedPayments.length}</div>
            <Progress value={(failedPayments.length / payments.length) * 100} className="mb-2" />
            <p className="text-sm text-gray-600">
              ${failedPayments.reduce((sum, p) => sum + p.amount, 0)} lost
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Details */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Payments</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(payment.paymentStatus)}`} />
                    <div>
                      <p className="font-medium">{payment.studentName}</p>
                      <p className="text-sm text-gray-600">{payment.studentEmail}</p>
                    </div>
                    <div>
                      <p className="font-medium">{payment.courseName}</p>
                      <p className="text-sm text-gray-600">
                        <Badge variant="outline" className="text-xs">
                          {payment.courseType}
                        </Badge>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${payment.amount}</p>
                    <p className="text-sm text-gray-600">{payment.paymentMethod}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg border-green-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <div>
                      <p className="font-medium">{payment.studentName}</p>
                      <p className="text-sm text-gray-600">{payment.studentEmail}</p>
                    </div>
                    <div>
                      <p className="font-medium">{payment.courseName}</p>
                      <Badge variant="outline" className="text-xs">
                        {payment.courseType}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${payment.amount}</p>
                    <p className="text-sm text-gray-600">{payment.paymentMethod}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              {pendingPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg border-yellow-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div>
                      <p className="font-medium">{payment.studentName}</p>
                      <p className="text-sm text-gray-600">{payment.studentEmail}</p>
                    </div>
                    <div>
                      <p className="font-medium">{payment.courseName}</p>
                      <Badge variant="outline" className="text-xs">
                        {payment.courseType}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-yellow-600">${payment.amount}</p>
                    <p className="text-sm text-gray-600">{payment.paymentMethod}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="failed" className="space-y-4">
              {failedPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg border-red-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div>
                      <p className="font-medium">{payment.studentName}</p>
                      <p className="text-sm text-gray-600">{payment.studentEmail}</p>
                    </div>
                    <div>
                      <p className="font-medium">{payment.courseName}</p>
                      <Badge variant="outline" className="text-xs">
                        {payment.courseType}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">${payment.amount}</p>
                    <p className="text-sm text-gray-600">{payment.paymentMethod}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
=======
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
>>>>>>> 353d7e975c005bdcc6e584a454eecc48787a84ae
    </div>
  );
};

export default PaymentAnalytics;
