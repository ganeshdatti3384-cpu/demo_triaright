
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

interface WhatYoullLearnProps {
  learningOutcomes: string[];
}

const WhatYoullLearn = ({ learningOutcomes }: WhatYoullLearnProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>What You'll Learn</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-3">
          {learningOutcomes.map((item, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{item}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatYoullLearn;
