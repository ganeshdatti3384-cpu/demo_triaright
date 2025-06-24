
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle } from 'lucide-react';

interface PricingCardProps {
  course: {
    price: string;
    originalPrice: string;
  };
  onEnrollClick: () => void;
}

const PricingCard = ({ course, onEnrollClick }: PricingCardProps) => {
  const whatsIncluded = [
    'Lifetime access to course content',
    'Certificate of completion',
    'Direct instructor support',
    'Mobile and desktop access',
    'Downloadable resources',
    '30-day money-back guarantee'
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-2">
            <span className="text-3xl font-bold text-brand-primary">{course.price}</span>
            <span className="text-xl text-gray-500 line-through ml-2">{course.originalPrice}</span>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {Math.round(((parseInt(course.originalPrice.replace('₹', '').replace(',', '')) - parseInt(course.price.replace('₹', '').replace(',', ''))) / parseInt(course.originalPrice.replace('₹', '').replace(',', ''))) * 100)}% OFF
          </Badge>
        </div>
        
        <Button onClick={onEnrollClick} className="w-full bg-brand-primary hover:bg-blue-700 text-white mb-4" size="lg">
          Enroll Now
        </Button>
        
        <p className="text-center text-sm text-gray-600 mb-4">30-day money-back guarantee</p>
        
        <Separator className="my-4" />
        
        <div className="space-y-3">
          <h4 className="font-medium">What's Included:</h4>
          {whatsIncluded.map((item, index) => (
            <div key={index} className="flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PricingCard;
