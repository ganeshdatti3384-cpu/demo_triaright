
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { DollarSign, Users, TrendingUp, CreditCard, Calendar, Filter } from 'lucide-react';

interface PaymentData {
  id: string;
  studentName: string;
  studentEmail: string;
  courseName: string;
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
        <div>
          <h2 className="text-2xl font-bold">Payment Analytics</h2>
          <p className="text-gray-600">Track student payments and revenue</p>
        </div>
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
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paying Students</p>
                <p className="text-2xl font-bold">{totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Growth</p>
                <p className="text-2xl font-bold">+{monthlyGrowth}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold">{payments.length}</p>
              </div>
              <CreditCard className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

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
    </div>
  );
};

export default PaymentAnalytics;