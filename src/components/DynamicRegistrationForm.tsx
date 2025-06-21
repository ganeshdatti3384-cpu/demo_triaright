
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, ChevronDown, Upload } from 'lucide-react';

const baseFields = {
  role: z.enum(['student', 'job-seeker']),
  profilePicture: z.any().optional(),
  fullName: z.string().min(1, 'Full name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  alternatePhone: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  fatherName: z.string().optional(),
  maritalStatus: z.enum(['single', 'married']),
  nationality: z.string().min(1, 'Nationality is required'),
  languagesKnown: z.string().min(1, 'Languages known is required'),
  hobbies: z.string().optional(),
  education: z.array(z.object({
    instituteName: z.string().min(1, 'Institute name is required'),
    stream: z.string().min(1, 'Stream/Course is required'),
    yearOfPassing: z.string().min(1, 'Year of passing is required'),
  })),
  projects: z.array(z.object({
    name: z.string(),
    githubLink: z.string().url().optional().or(z.literal('')),
    description: z.string(),
  })).optional(),
  certifications: z.array(z.object({
    name: z.string(),
    details: z.string(),
  })).optional(),
  internships: z.array(z.object({
    companyName: z.string(),
    role: z.string(),
    responsibilities: z.string(),
  })).optional(),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
};

const baseSchema = z.object(baseFields).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const jobSeekerSchema = z.object({
  ...baseFields,
  jobCategory: z.string().min(1, 'Job category is required'),
  experience: z.array(z.object({
    companyName: z.string(),
    role: z.string(),
    duration: z.string(),
    responsibilities: z.string(),
  })).optional(),
  resume: z.any().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type BaseFormData = z.infer<typeof baseSchema>;
type JobSeekerFormData = z.infer<typeof jobSeekerSchema>;
type FormData = BaseFormData | JobSeekerFormData;

interface DynamicRegistrationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
}

const DynamicRegistrationForm = ({ isOpen, onClose, onSuccess }: DynamicRegistrationFormProps) => {
  const [selectedRole, setSelectedRole] = useState<'student' | 'job-seeker'>('student');
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    basic: true,
    personal: false,
    education: false,
    projects: false,
    certifications: false,
    internships: false,
    account: false,
  });

  const { toast } = useToast();

  const schema = selectedRole === 'job-seeker' ? jobSeekerSchema : baseSchema;
  
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: selectedRole,
      education: [{ instituteName: '', stream: '', yearOfPassing: '' }],
      projects: [],
      certifications: [],
      internships: [],
      ...(selectedRole === 'job-seeker' && { experience: [] }),
    }
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation
  } = useFieldArray({ control, name: 'education' });

  const {
    fields: projectFields,
    append: appendProject,
    remove: removeProject
  } = useFieldArray({ control, name: 'projects' });

  const {
    fields: certificationFields,
    append: appendCertification,
    remove: removeCertification
  } = useFieldArray({ control, name: 'certifications' });

  const {
    fields: internshipFields,
    append: appendInternship,
    remove: removeInternship
  } = useFieldArray({ control, name: 'internships' });

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience
  } = useFieldArray({ control, name: 'experience' });

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem(`registration_${selectedRole}`);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      Object.keys(parsedData).forEach(key => {
        setValue(key as any, parsedData[key]);
      });
    }
  }, [selectedRole, setValue]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const onSubmit = (data: any) => {
    // Save to localStorage
    localStorage.setItem(`registration_${selectedRole}`, JSON.stringify(data));
    
    toast({
      title: "Registration Successful!",
      description: "Your information has been saved successfully.",
    });

    onSuccess(data);
  };

  const handleRoleChange = (role: 'student' | 'job-seeker') => {
    setSelectedRole(role);
    setValue('role', role);
    reset({
      role: role,
      education: [{ instituteName: '', stream: '', yearOfPassing: '' }],
      projects: [],
      certifications: [],
      internships: [],
      ...(role === 'job-seeker' && { experience: [] }),
    });
  };

  const renderBasicInformation = () => (
    <Collapsible open={openSections.basic} onOpenChange={() => toggleSection('basic')}>
      <CollapsibleTrigger asChild>
        <Card className="cursor-pointer hover:bg-gray-50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Basic Information</CardTitle>
            <ChevronDown className={`h-4 w-4 transition-transform ${openSections.basic ? 'rotate-180' : ''}`} />
          </CardHeader>
        </Card>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <CardContent className="space-y-4 pt-4">
          <div>
            <Label>Profile Picture</Label>
            <div className="flex items-center space-x-2">
              <Button type="button" variant="outline" className="flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Upload Photo</span>
              </Button>
              <Input type="file" accept="image/*" {...register('profilePicture')} className="hidden" />
            </div>
          </div>

          <div>
            <Label htmlFor="fullName">Full Name (as per SSC certificate) *</Label>
            <Input {...register('fullName')} id="fullName" />
            {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
          </div>

          <div>
            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
            <Input type="date" {...register('dateOfBirth')} id="dateOfBirth" />
            {errors.dateOfBirth && <p className="text-red-500 text-sm">{errors.dateOfBirth.message}</p>}
          </div>

          <div>
            <Label>Gender *</Label>
            <RadioGroup onValueChange={(value) => setValue('gender', value as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female">Female</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">Other</Label>
              </div>
            </RadioGroup>
            {errors.gender && <p className="text-red-500 text-sm">{errors.gender.message}</p>}
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input type="email" {...register('email')} id="email" />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="phone">Phone *</Label>
            <Input {...register('phone')} id="phone" />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
          </div>

          <div>
            <Label htmlFor="alternatePhone">Alternate Phone</Label>
            <Input {...register('alternatePhone')} id="alternatePhone" />
          </div>

          <div>
            <Label htmlFor="address">Address *</Label>
            <Textarea {...register('address')} id="address" />
            {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
          </div>
        </CardContent>
      </CollapsibleContent>
    </Collapsible>
  );

  const renderPersonalInfo = () => (
    <Collapsible open={openSections.personal} onOpenChange={() => toggleSection('personal')}>
      <CollapsibleTrigger asChild>
        <Card className="cursor-pointer hover:bg-gray-50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Family & Personal Info</CardTitle>
            <ChevronDown className={`h-4 w-4 transition-transform ${openSections.personal ? 'rotate-180' : ''}`} />
          </CardHeader>
        </Card>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <CardContent className="space-y-4 pt-4">
          <div>
            <Label htmlFor="fatherName">Father's Name {selectedRole === 'job-seeker' ? '*' : ''}</Label>
            <Input {...register('fatherName')} id="fatherName" />
            {errors.fatherName && <p className="text-red-500 text-sm">{errors.fatherName.message}</p>}
          </div>

          <div>
            <Label>Marital Status *</Label>
            <RadioGroup onValueChange={(value) => setValue('maritalStatus', value as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="single" id="single" />
                <Label htmlFor="single">Single</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="married" id="married" />
                <Label htmlFor="married">Married</Label>
              </div>
            </RadioGroup>
            {errors.maritalStatus && <p className="text-red-500 text-sm">{errors.maritalStatus.message}</p>}
          </div>

          <div>
            <Label htmlFor="nationality">Nationality *</Label>
            <Input {...register('nationality')} id="nationality" />
            {errors.nationality && <p className="text-red-500 text-sm">{errors.nationality.message}</p>}
          </div>

          <div>
            <Label htmlFor="languagesKnown">Languages Known *</Label>
            <Input {...register('languagesKnown')} id="languagesKnown" placeholder="e.g., English, Hindi, Telugu" />
            {errors.languagesKnown && <p className="text-red-500 text-sm">{errors.languagesKnown.message}</p>}
          </div>

          <div>
            <Label htmlFor="hobbies">Hobbies</Label>
            <Textarea {...register('hobbies')} id="hobbies" />
          </div>

          {selectedRole === 'job-seeker' && (
            <div>
              <Label htmlFor="jobCategory">Looking for Job Category *</Label>
              <Select onValueChange={(value) => setValue('jobCategory' as any, value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="Non-IT">Non-IT</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Management">Management</SelectItem>
                  <SelectItem value="Pharma">Pharma</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                </SelectContent>
              </Select>
              {errors.jobCategory && <p className="text-red-500 text-sm">{errors.jobCategory.message}</p>}
            </div>
          )}
        </CardContent>
      </CollapsibleContent>
    </Collapsible>
  );

  const renderEducation = () => (
    <Collapsible open={openSections.education} onOpenChange={() => toggleSection('education')}>
      <CollapsibleTrigger asChild>
        <Card className="cursor-pointer hover:bg-gray-50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Education</CardTitle>
            <ChevronDown className={`h-4 w-4 transition-transform ${openSections.education ? 'rotate-180' : ''}`} />
          </CardHeader>
        </Card>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <CardContent className="space-y-4 pt-4">
          {educationFields.map((field, index) => (
            <div key={field.id} className="border p-4 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Education {index + 1}</h4>
                {educationFields.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeEducation(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div>
                <Label>Institute Name *</Label>
                <Input {...register(`education.${index}.instituteName`)} />
                {errors.education?.[index]?.instituteName && (
                  <p className="text-red-500 text-sm">{errors.education[index].instituteName.message}</p>
                )}
              </div>

              <div>
                <Label>Stream/Course *</Label>
                <Select onValueChange={(value) => setValue(`education.${index}.stream`, value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stream" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="B.Tech">B.Tech</SelectItem>
                    <SelectItem value="MCA">MCA</SelectItem>
                    <SelectItem value="B.Sc">B.Sc</SelectItem>
                    <SelectItem value="M.Sc">M.Sc</SelectItem>
                    <SelectItem value="MBA">MBA</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.education?.[index]?.stream && (
                  <p className="text-red-500 text-sm">{errors.education[index].stream.message}</p>
                )}
              </div>

              <div>
                <Label>Year of Passing *</Label>
                <Input {...register(`education.${index}.yearOfPassing`)} type="number" min="1950" max="2030" />
                {errors.education?.[index]?.yearOfPassing && (
                  <p className="text-red-500 text-sm">{errors.education[index].yearOfPassing.message}</p>
                )}
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => appendEducation({ instituteName: '', stream: '', yearOfPassing: '' })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Education
          </Button>
        </CardContent>
      </CollapsibleContent>
    </Collapsible>
  );

  const renderOptionalSections = () => (
    <>
      {/* Projects Section */}
      <Collapsible open={openSections.projects} onOpenChange={() => toggleSection('projects')}>
        <CollapsibleTrigger asChild>
          <Card className="cursor-pointer hover:bg-gray-50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Projects (Optional)</CardTitle>
              <ChevronDown className={`h-4 w-4 transition-transform ${openSections.projects ? 'rotate-180' : ''}`} />
            </CardHeader>
          </Card>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-4">
            {projectFields.map((field, index) => (
              <div key={field.id} className="border p-4 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Project {index + 1}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeProject(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div>
                  <Label>Project Name</Label>
                  <Input {...register(`projects.${index}.name`)} />
                </div>

                <div>
                  <Label>GitHub Link</Label>
                  <Input {...register(`projects.${index}.githubLink`)} placeholder="https://github.com/..." />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea {...register(`projects.${index}.description`)} />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => appendProject({ name: '', githubLink: '', description: '' })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      {/* Similar sections for certifications, internships, and experience */}
      {selectedRole === 'job-seeker' && (
        <Card>
          <CardHeader>
            <CardTitle>Resume Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label>Upload Resume *</Label>
              <div className="flex items-center space-x-2">
                <Button type="button" variant="outline" className="flex items-center space-x-2">
                  <Upload className="h-4 w-4" />
                  <span>Upload Resume</span>
                </Button>
                <Input type="file" accept=".pdf,.doc,.docx" {...register('resume' as any)} className="hidden" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );

  const renderAccountSetup = () => (
    <Collapsible open={openSections.account} onOpenChange={() => toggleSection('account')}>
      <CollapsibleTrigger asChild>
        <Card className="cursor-pointer hover:bg-gray-50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Account Setup</CardTitle>
            <ChevronDown className={`h-4 w-4 transition-transform ${openSections.account ? 'rotate-180' : ''}`} />
          </CardHeader>
        </Card>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <CardContent className="space-y-4 pt-4">
          <div>
            <Label htmlFor="username">Username *</Label>
            <Input {...register('username')} id="username" />
            {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
          </div>

          <div>
            <Label htmlFor="password">Password *</Label>
            <Input type="password" {...register('password')} id="password" />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Re-enter Password *</Label>
            <Input type="password" {...register('confirmPassword')} id="confirmPassword" />
            {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
          </div>
        </CardContent>
      </CollapsibleContent>
    </Collapsible>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dynamic Registration Form
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Role Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Role</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedRole} onValueChange={handleRoleChange}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="student" id="student-role" />
                  <Label htmlFor="student-role">User / Student</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="job-seeker" id="job-seeker-role" />
                  <Label htmlFor="job-seeker-role">Job Seeker</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {renderBasicInformation()}
          {renderPersonalInfo()}
          {renderEducation()}
          {renderOptionalSections()}
          {renderAccountSetup()}

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Register as {selectedRole === 'student' ? 'Student' : 'Job Seeker'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DynamicRegistrationForm;
