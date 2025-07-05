
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Star, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Pack365Card = () => {
  const navigate = useNavigate();

  const handleEnrollClick = () => {
    navigate('/pack365');
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-lg text-white group-hover:scale-110 transition-transform">
            <Calendar className="h-6 w-6" />
          </div>
          <div className="flex flex-col items-end space-y-1">
            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">PREMIUM</Badge>
            <Badge variant="outline" className="border-purple-300">365 Days</Badge>
          </div>
        </div>
        <CardTitle className="text-xl text-purple-800">Pack365 - Annual Learning Program</CardTitle>
        <CardDescription className="text-gray-700">
          Complete annual learning package with all courses, projects, and career support
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>Full Year Access</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>Premium Content</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-purple-800">What's Included:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• All premium courses</li>
              <li>• 1-on-1 mentorship</li>
              <li>• Job placement assistance</li>
              <li>• Industry projects</li>
              <li>• Certificate of completion</li>
            </ul>
          </div>

          <Button 
            onClick={handleEnrollClick}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            Explore Pack365 Courses
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Pack365Card;
