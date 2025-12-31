import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut } from 'lucide-react';
import UpdateManagement from '@/components/admin/UpdateManagement';
import PlacementManagement from '@/components/admin/PlacementManagement';
import JobManagement from '@/components/admin/JobManagement';
import RegularInternshipManagement from '@/components/admin/RegularInternshipManagement';

interface EmployerDashboardProps {
  user: { role: string; name: string };
  onLogout: () => void;
}

const EmployerDashboard = ({ user, onLogout }: EmployerDashboardProps) => {
  const [activeTab, setActiveTab] = useState('updates');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
              <img 
                src="/lovable-uploads/93e33449-ffbe-4c83-9fcf-6012873a863c.png" 
                alt="TriaRight Logo" 
                className="h-10 w-auto"
              />
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="updates">Updates</TabsTrigger>
            <TabsTrigger value="placements">Placements</TabsTrigger>
            <TabsTrigger value="job-management">Job Management</TabsTrigger>
            <TabsTrigger value="internships">Internships</TabsTrigger>
          </TabsList>

          {/* Components */}
          <TabsContent value="updates">
            <UpdateManagement />
          </TabsContent>

          <TabsContent value="placements">
            <PlacementManagement />
          </TabsContent>

          <TabsContent value="job-management">
            <JobManagement />
          </TabsContent>

          <TabsContent value="internships">
            <RegularInternshipManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EmployerDashboard;
