
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Users, BookOpen, Calendar } from 'lucide-react';

interface InstructorDashboardProps {
  user: { role: string; name: string };
  onLogout: () => void;
}

const InstructorDashboard = ({ user, onLogout }: InstructorDashboardProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                Instructor Dashboard
              </h1>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                My Students
              </CardTitle>
              <CardDescription>Manage your enrolled students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">156</div>
              <Button variant="outline" className="w-full">View Students</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                My Courses
              </CardTitle>
              <CardDescription>Manage your courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">8</div>
              <Button variant="outline" className="w-full">Manage Courses</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Schedule
              </CardTitle>
              <CardDescription>Upcoming classes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">12</div>
              <Button variant="outline" className="w-full">View Schedule</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
