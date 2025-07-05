import React, { useState } from 'react';
<<<<<<< HEAD
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Overview from '../admin/Overview';
import UserManagement from '../admin/UserManagement';
import CourseManagement from '../admin/CourseManagement';
=======
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Settings, Users, BookOpen, Briefcase, GraduationCap, LogOut, BarChart3, Package, DollarSign } from 'lucide-react';
import CourseManagement from '../admin/CourseManagement';
import UserManagement from '../admin/UserManagement';
import JobManagement from '../admin/JobManagement';
>>>>>>> 353d7e975c005bdcc6e584a454eecc48787a84ae
import Pack365Management from '../admin/Pack365Management';
import PaymentAnalytics from '../admin/PaymentAnalytics';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, courses, and system settings</p>
        </div>

<<<<<<< HEAD
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
=======
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-8">
>>>>>>> 353d7e975c005bdcc6e584a454eecc48787a84ae
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="pack365">Pack365</TabsTrigger>
<<<<<<< HEAD
=======
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
>>>>>>> 353d7e975c005bdcc6e584a454eecc48787a84ae
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Overview />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <CourseManagement />
          </TabsContent>

          <TabsContent value="pack365" className="space-y-6">
            <Pack365Management />
          </TabsContent>

<<<<<<< HEAD
          <TabsContent value="payments" className="space-y-6">
            <PaymentAnalytics />
=======
          <TabsContent value="jobs" className="space-y-6">
            <JobManagement />
>>>>>>> 353d7e975c005bdcc6e584a454eecc48787a84ae
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <PaymentAnalytics />
          </TabsContent>

          <TabsContent value="approvals" className="space-y-6">
            <div>Approvals Content</div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
