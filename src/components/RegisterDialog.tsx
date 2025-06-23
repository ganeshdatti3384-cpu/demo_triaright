
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface RegisterDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegisterDialog = ({ isOpen, onClose }: RegisterDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
            Register
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Choose your registration type to get started.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          <Button className="w-full bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600">
            Register as Student
          </Button>
          <Button variant="outline" className="w-full">
            Register as Job Seeker
          </Button>
          <Button variant="outline" className="w-full">
            Register as Employer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterDialog;
