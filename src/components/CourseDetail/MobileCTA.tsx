
import React from 'react';
import { Button } from '@/components/ui/button';

interface MobileCTAProps {
  course: {
    price: string;
    originalPrice: string;
  };
  onEnrollClick: () => void;
}

const MobileCTA = ({ course, onEnrollClick }: MobileCTAProps) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-50">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold text-brand-primary">{course.price.replace('$', '₹')}</span>
          <span className="text-lg text-gray-500 line-through ml-2">{course.originalPrice.replace('$', '₹')}</span>
        </div>
        <Button onClick={onEnrollClick} className="bg-brand-primary hover:bg-blue-700 text-white">
          Enroll Now
        </Button>
      </div>
    </div>
  );
};

export default MobileCTA;
