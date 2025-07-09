/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GraduationCap } from 'lucide-react';

interface EducationTabProps {
  form: any;
  eduFields: any[];
  appendEdu: (data: any) => void;
}

const EducationTab: React.FC<EducationTabProps> = ({ form, eduFields, appendEdu }) => {
  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className=" bg-purple-500 text-white rounded-t-lg">
        <CardTitle className="flex items-center">
          <GraduationCap className="h-5 w-5 mr-2" />
          Education History
        </CardTitle>
        <CardDescription className="text-white/90">
          Your academic qualifications and achievements
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {eduFields.map((field, index) => (
          <div key={field.id} className="p-4 border-2 border-purple-200 rounded-lg space-y-4">
            <h4 className="font-semibold text-purple-700">Education #{index + 1}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField name={`education.${index}.institute`} control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Institute</FormLabel>
                  <FormControl><Input {...field} className="border-2 focus:border-purple-500" /></FormControl>
                </FormItem>
              )} />
              <FormField name={`education.${index}.course`} control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Course</FormLabel>
                  <FormControl><Input {...field} className="border-2 focus:border-purple-500" /></FormControl>
                </FormItem>
              )} />
              <FormField name={`education.${index}.year`} control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
                  <FormControl><Input {...field} className="border-2 focus:border-purple-500" /></FormControl>
                </FormItem>
              )} />
            </div>
          </div>
        ))}
        <Button 
          type="button" 
          onClick={() => appendEdu({ institute: '', course: '', year: '' })}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          + Add Another Qualification
        </Button>
      </CardContent>
    </Card>
  );
};

export default EducationTab;
