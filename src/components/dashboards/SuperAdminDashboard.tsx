
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  GraduationCap, 
  Building, 
  Briefcase, 
  BookOpen, 
  TrendingUp,
  DollarSign,
  Calendar,
  Activity,
  LogOut
} from 'lucide-react';
import { pack365Api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import UserManagement from '../admin/UserManagement';
import Pack365Management from '../admin/Pack365Management';
import Overview from '../admin/Overview';

interface SuperAdminDashboardProps {
  user: { role: string; name: string };
  onLogout: () => void;
}

const SuperAdminDashboard = ({ user, onLogout }: SuperAdminDashboardProps) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalEmployers: 0,
    totalColleges: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    activeUsers: 0
  });
  const [enrollmentCodes, setEnrollmentCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      
      // Fetch enrollment codes
      const codesResponse = await pack365Api.getAllEnrollmentCodes(token);
      if (codesResponse.success && codesResponse.codes) {
        setEnrollmentCodes(codesResponse.codes);
      }
      
      // Mock stats for now - replace with actual API calls
      setStats({
        totalUsers: 1250,
        totalStudents: 800,
        totalEmployers: 150,
        totalColleges: 45,
        totalCourses: 25,
        totalEnrollments: 950,
        totalRevenue: 125000,
        activeUsers: 320
      });
      
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/93e33449-ffbe-4c83-9fcf-6012873a863c.png" 
                alt="TriaRight" 
                className="h-8 w-auto"
              />
              <h1 className="text-xl font-semibold text-gray-900">Super Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="pack365">Pack365</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Overview stats={stats} />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="pack365" className="space-y-6">
            <Pack365Management />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
