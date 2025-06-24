
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, HeadphonesIcon, Download, Smartphone } from 'lucide-react';

const CourseFeatures = () => {
  const features = [
    { icon: Award, text: 'Certificate of Completion' },
    { icon: HeadphonesIcon, text: 'Direct Instructor Support' },
    { icon: Download, text: 'Downloadable Resources' },
    { icon: Smartphone, text: 'Mobile Access' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Course Features</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center text-sm">
            <feature.icon className="h-4 w-4 text-blue-500 mr-3" />
            <span>{feature.text}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CourseFeatures;
