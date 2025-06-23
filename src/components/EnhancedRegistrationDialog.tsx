
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EnhancedRegistrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: (userData: any) => void;
}

const EnhancedRegistrationDialog = ({ isOpen, onClose, onRegisterSuccess }: EnhancedRegistrationDialogProps) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    whatsappNumber: '',
    role: 'student',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.termsAccepted) {
      alert('Please accept the Terms & Conditions to continue.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    onRegisterSuccess(formData);
    onClose();
  };

  const isFormValid = formData.fullName && formData.email && formData.phone && 
                     formData.whatsappNumber && formData.password && formData.confirmPassword && 
                     formData.termsAccepted;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Join TriaRight</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="whatsapp">WhatsApp Number *</Label>
            <Input
              id="whatsapp"
              value={formData.whatsappNumber}
              onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="job-seeker">Job Seeker</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="employer">Employer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={formData.termsAccepted}
              onCheckedChange={(checked) => handleInputChange('termsAccepted', checked as boolean)}
            />
            <Label htmlFor="terms" className="text-sm">
              I agree to the{' '}
              <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
                Terms & Conditions
              </a>
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
            disabled={!isFormValid}
          >
            Register
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedRegistrationDialog;
