
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const baseSchema = z.object({
  profileImage: z.any().optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, 'You must agree to the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const studentSchema = baseSchema.extend({
  college: z.string().min(1, 'College is required'),
  course: z.string().min(1, 'Course is required'),
  year: z.string().min(1, 'Academic year is required'),
  skills: z.string().optional(),
});

const employerSchema = baseSchema.extend({
  companyName: z.string().min(1, 'Company name is required'),
  designation: z.string().min(1, 'Designation is required'),
  website: z.string().optional(),
});

const collegeSchema = baseSchema.extend({
  collegeName: z.string().min(1, 'Institution name is required'),
  address: z.string().min(1, 'Address is required'),
  website: z.string().optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;
type EmployerFormData = z.infer<typeof employerSchema>;
type CollegeFormData = z.infer<typeof collegeSchema>;

const Register = () => {
  const [userType, setUserType] = useState<'student' | 'employer' | 'college'>('student');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const getSchema = () => {
    switch (userType) {
      case 'student': return studentSchema;
      case 'employer': return employerSchema;
      case 'college': return collegeSchema;
      default: return baseSchema;
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(getSchema()),
    defaultValues: {
      terms: false
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "Error",
          description: "Image size must be less than 2MB",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setValue('profileImage', file);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: any) => {
    toast({
      title: "Success",
      description: `${userType.charAt(0).toUpperCase() + userType.slice(1)} account created successfully!`,
    });
    
    // Navigate to home page or dashboard
    navigate('/');
  };

  const handleUserTypeChange = (newType: 'student' | 'employer' | 'college') => {
    setUserType(newType);
    reset({ terms: false });
    setImagePreview(null);
  };

  const renderStudentForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="college">College/University</Label>
          <Input
            id="college"
            placeholder="Enter your college name"
            {...register('college')}
          />
          {errors.college && (
            <p className="text-red-500 text-sm">{String(errors.college.message)}</p>
          )}
        </div>
        <div>
          <Label htmlFor="course">Course/Major</Label>
          <Input
            id="course"
            placeholder="e.g., Computer Science"
            {...register('course')}
          />
          {errors.course && (
            <p className="text-red-500 text-sm">{String(errors.course.message)}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="year">Academic Year</Label>
        <Select onValueChange={(value) => setValue('year', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1st">1st Year</SelectItem>
            <SelectItem value="2nd">2nd Year</SelectItem>
            <SelectItem value="3rd">3rd Year</SelectItem>
            <SelectItem value="4th">4th Year</SelectItem>
            <SelectItem value="graduate">Graduate</SelectItem>
          </SelectContent>
        </Select>
        {errors.year && (
          <p className="text-red-500 text-sm">{String(errors.year.message)}</p>
        )}
      </div>

      <div>
        <Label htmlFor="skills">Skills & Interests</Label>
        <Textarea
          id="skills"
          placeholder="List your technical skills, programming languages, interests..."
          {...register('skills')}
        />
      </div>
    </div>
  );

  const renderEmployerForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="companyName">Company Name</Label>
        <Input
          id="companyName"
          placeholder="Enter company name"
          {...register('companyName')}
        />
        {errors.companyName && (
          <p className="text-red-500 text-sm">{String(errors.companyName.message)}</p>
        )}
      </div>

      <div>
        <Label htmlFor="designation">Job Title/Designation</Label>
        <Input
          id="designation"
          placeholder="e.g., HR Manager, Recruiter"
          {...register('designation')}
        />
        {errors.designation && (
          <p className="text-red-500 text-sm">{String(errors.designation.message)}</p>
        )}
      </div>

      <div>
        <Label htmlFor="website">Company Website (Optional)</Label>
        <Input
          id="website"
          placeholder="https://yourcompany.com"
          {...register('website')}
        />
      </div>
    </div>
  );

  const renderCollegeForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="collegeName">Institution Name</Label>
        <Input
          id="collegeName"
          placeholder="Enter institution name"
          {...register('collegeName')}
        />
        {errors.collegeName && (
          <p className="text-red-500 text-sm">{String(errors.collegeName.message)}</p>
        )}
      </div>

      <div>
        <Label htmlFor="address">Institution Address</Label>
        <Textarea
          id="address"
          placeholder="Enter complete address"
          {...register('address')}
        />
        {errors.address && (
          <p className="text-red-500 text-sm">{String(errors.address.message)}</p>
        )}
      </div>

      <div>
        <Label htmlFor="website">Institution Website (Optional)</Label>
        <Input
          id="website"
          placeholder="https://yourinstitution.edu"
          {...register('website')}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="container mx-auto max-w-2xl px-4">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Create Your Account
            </CardTitle>
            <p className="text-center text-gray-600">
              Join our platform and start your journey
            </p>
          </CardHeader>

          <CardContent>
            <Tabs value={userType} onValueChange={handleUserTypeChange} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="student">Student</TabsTrigger>
                <TabsTrigger value="employer">Employer</TabsTrigger>
                <TabsTrigger value="college">Institution</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
                {/* Profile Image Upload */}
                <div>
                  <Label>Profile Picture</Label>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Upload className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="profile-upload"
                      />
                      <Label htmlFor="profile-upload" className="cursor-pointer">
                        <Button type="button" variant="outline" asChild>
                          <span>Upload Photo</span>
                        </Button>
                      </Label>
                      <p className="text-sm text-gray-500 mt-1">Max size: 2MB, Square preferred</p>
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="First name"
                      {...register('firstName')}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm">{String(errors.firstName.message)}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Last name"
                      {...register('lastName')}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm">{String(errors.lastName.message)}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{String(errors.email.message)}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="Enter your phone number"
                    {...register('phone')}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm">{String(errors.phone.message)}</p>
                  )}
                </div>

                {/* User Type Specific Fields */}
                <TabsContent value="student" className="mt-0">
                  {renderStudentForm()}
                </TabsContent>
                <TabsContent value="employer" className="mt-0">
                  {renderEmployerForm()}
                </TabsContent>
                <TabsContent value="college" className="mt-0">
                  {renderCollegeForm()}
                </TabsContent>

                {/* Password Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      {...register('password')}
                    />
                    {errors.password && (
                      <p className="text-red-500 text-sm">{String(errors.password.message)}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      {...register('confirmPassword')}
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm">{String(errors.confirmPassword.message)}</p>
                    )}
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" {...register('terms')} />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the Terms of Service and Privacy Policy
                  </Label>
                </div>
                {errors.terms && (
                  <p className="text-red-500 text-sm">{String(errors.terms.message)}</p>
                )}

                <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Create {userType.charAt(0).toUpperCase() + userType.slice(1)} Account
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/" className="text-blue-600 hover:underline font-semibold">
                      Sign in
                    </Link>
                  </p>
                </div>
              </form>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
