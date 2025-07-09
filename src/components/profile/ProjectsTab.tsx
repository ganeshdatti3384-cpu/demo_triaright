/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Briefcase } from 'lucide-react';

interface ProjectsTabProps {
  form: any;
  projFields: any[];
  appendProj: (data: any) => void;
}

const ProjectsTab: React.FC<ProjectsTabProps> = ({ form, projFields, appendProj }) => {
  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-red-500 text-white rounded-t-lg">
        <CardTitle className="flex items-center">
          <Briefcase className="h-5 w-5 mr-2" />
          Projects & Experience
        </CardTitle>
        <CardDescription className="text-white/90">
          Showcase your work and achievements
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {projFields.map((field, index) => (
          <div key={field.id} className="p-4 border-2 border-orange-200 rounded-lg space-y-4">
            <h4 className="font-semibold text-orange-700">Project #{index + 1}</h4>
            <div className="space-y-4">
              <FormField name={`projects.${index}.name`} control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl><Input {...field} className="border-2 focus:border-orange-500" /></FormControl>
                </FormItem>
              )} />
              <FormField name={`projects.${index}.github`} control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub Link</FormLabel>
                  <FormControl><Input {...field} className="border-2 focus:border-orange-500" /></FormControl>
                </FormItem>
              )} />
              <FormField name={`projects.${index}.description`} control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea {...field} className="border-2 focus:border-orange-500" /></FormControl>
                </FormItem>
              )} />
            </div>
          </div>
        ))}
        <Button 
          type="button" 
          onClick={() => appendProj({ name: '', github: '', description: '' })}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
        >
          + Add Another Project
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProjectsTab;
