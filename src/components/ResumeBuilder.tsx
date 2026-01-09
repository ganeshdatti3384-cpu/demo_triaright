import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Download, Eye, Save, User, GraduationCap, Briefcase, Code, FolderKanban, FileText, BookOpen, Target, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  github: string;
  portfolio: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
  description: string;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Skill {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  category: string;
}

interface Project {
  id: string;
  name: string;
  technologies: string[];
  description: string;
  link: string;
}

const ResumeBuilder = () => {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState('personal');
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    linkedin: '',
    github: '',
    portfolio: ''
  });

  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [previewMode, setPreviewMode] = useState(false);

  // Personal Info Handlers
  const handlePersonalInfoChange = (field: keyof PersonalInfo, value: string) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  // Education Handlers
  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: '',
      description: ''
    };
    setEducation(prev => [...prev, newEducation]);
  };

  const updateEducation = (id: string, field: keyof Education, value: string | boolean) => {
    setEducation(prev => prev.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  const removeEducation = (id: string) => {
    setEducation(prev => prev.filter(edu => edu.id !== id));
  };

  // Experience Handlers
  const addExperience = () => {
    const newExperience: Experience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    setExperience(prev => [...prev, newExperience]);
  };

  const updateExperience = (id: string, field: keyof Experience, value: string | boolean) => {
    setExperience(prev => prev.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const removeExperience = (id: string) => {
    setExperience(prev => prev.filter(exp => exp.id !== id));
  };

  // Skills Handlers
  const addSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: '',
      level: 'Intermediate',
      category: 'Technical'
    };
    setSkills(prev => [...prev, newSkill]);
  };

  const updateSkill = (id: string, field: keyof Skill, value: string) => {
    setSkills(prev => prev.map(skill => 
      skill.id === id ? { ...skill, [field]: value } : skill
    ));
  };

  const removeSkill = (id: string) => {
    setSkills(prev => prev.filter(skill => skill.id !== id));
  };

  // Projects Handlers
  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: '',
      technologies: [],
      description: '',
      link: ''
    };
    setProjects(prev => [...prev, newProject]);
  };

  const updateProject = (id: string, field: keyof Project, value: string | string[]) => {
    setProjects(prev => prev.map(project => 
      project.id === id ? { ...project, [field]: value } : project
    ));
  };

  const addTechnology = (projectId: string, tech: string) => {
    if (tech.trim()) {
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? { ...project, technologies: [...project.technologies, tech.trim()] }
          : project
      ));
    }
  };

  const removeTechnology = (projectId: string, techIndex: number) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, technologies: project.technologies.filter((_, index) => index !== techIndex) }
        : project
    ));
  };

  const removeProject = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
  };

  // Save Resume
  const saveResume = () => {
    toast({
      title: "Resume Saved",
      description: "Your resume has been saved successfully.",
    });
  };

  // Download Resume as PDF
  const downloadResume = () => {
    toast({
      title: "Download Started",
      description: "Your resume is being downloaded as PDF.",
    });
  };

  // Calculate completion percentage
  const calculateCompletion = () => {
    let totalFields = 7;
    let completedFields = 0;

    Object.values(personalInfo).forEach(value => {
      if (value.trim()) completedFields++;
    });

    const sections = [
      { data: education, fieldsPerItem: 7 },
      { data: experience, fieldsPerItem: 6 },
      { data: skills, fieldsPerItem: 3 },
      { data: projects, fieldsPerItem: 4 }
    ];

    sections.forEach(section => {
      totalFields += section.data.length * section.fieldsPerItem;
      section.data.forEach(item => {
        Object.values(item).forEach(value => {
          if (Array.isArray(value) ? value.length > 0 : value && value.toString().trim()) {
            completedFields++;
          }
        });
      });
    });

    return totalFields > 0 ? Math.min(100, Math.round((completedFields / totalFields) * 100)) : 0;
  };

  // Navigation sections
  const sections = [
    { 
      id: 'personal', 
      label: 'Personal Info', 
      icon: <User className="h-5 w-5" />, 
      color: 'bg-blue-500',
      description: 'Basic contact information'
    },
    { 
      id: 'education', 
      label: 'Education', 
      icon: <GraduationCap className="h-5 w-5" />, 
      color: 'bg-indigo-500',
      description: 'Academic background'
    },
    { 
      id: 'experience', 
      label: 'Experience', 
      icon: <Briefcase className="h-5 w-5" />, 
      color: 'bg-emerald-500',
      description: 'Work history'
    },
    { 
      id: 'skills', 
      label: 'Skills', 
      icon: <Code className="h-5 w-5" />, 
      color: 'bg-amber-500',
      description: 'Technical & soft skills'
    },
    { 
      id: 'projects', 
      label: 'Projects', 
      icon: <FolderKanban className="h-5 w-5" />, 
      color: 'bg-purple-500',
      description: 'Portfolio projects'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-xl">
                <BookOpen className="h-8 w-8 text-blue-700" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">ResumeCraft Pro</h1>
                <p className="text-blue-100 mt-2">Build your professional resume step by step</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4">
                <div className="text-sm font-medium">Progress</div>
                <div className="text-lg font-bold">{calculateCompletion()}%</div>
              </div>
              <Progress value={calculateCompletion()} className="h-2 bg-blue-900/30" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-80 flex-shrink-0">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="flex items-center gap-3 text-gray-800">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span>Resume Sections</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left p-4 rounded-lg transition-all duration-150 ${
                        activeSection === section.id 
                          ? 'bg-blue-50 border border-blue-200 shadow-sm' 
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${section.color} text-white`}>
                          {section.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{section.label}</div>
                          <div className="text-sm text-gray-500">{section.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </nav>

                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <Button 
                    onClick={() => setPreviewMode(!previewMode)}
                    variant={previewMode ? "default" : "outline"}
                    className="w-full"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {previewMode ? 'Edit Mode' : 'Preview Resume'}
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={saveResume} 
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button 
                      onClick={downloadResume} 
                      variant="outline"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <Award className="h-4 w-4" />
                    <span className="font-medium">Pro Tip</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Complete all sections for the best results. Use specific examples and quantify achievements.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {previewMode ? (
              <ResumePreview 
                personalInfo={personalInfo}
                education={education}
                experience={experience}
                skills={skills}
                projects={projects}
              />
            ) : (
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${sections.find(s => s.id === activeSection)?.color} text-white`}>
                        {sections.find(s => s.id === activeSection)?.icon}
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-gray-900">
                          {sections.find(s => s.id === activeSection)?.label}
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                          {sections.find(s => s.id === activeSection)?.description}
                        </CardDescription>
                      </div>
                    </div>
                    {activeSection !== 'personal' && (
                      <Badge variant="outline" className="text-gray-700">
                        {eval(activeSection)?.length || 0} entries
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  {/* Personal Info Form */}
                  {activeSection === 'personal' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="fullName" className="text-gray-700">Full Name *</Label>
                          <Input
                            id="fullName"
                            value={personalInfo.fullName}
                            onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                            placeholder="John Doe"
                            className="border-gray-300"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="email" className="text-gray-700">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={personalInfo.email}
                            onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                            placeholder="john@example.com"
                            className="border-gray-300"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="phone" className="text-gray-700">Phone Number</Label>
                          <Input
                            id="phone"
                            value={personalInfo.phone}
                            onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                            placeholder="+1 (555) 123-4567"
                            className="border-gray-300"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="address" className="text-gray-700">Location</Label>
                          <Input
                            id="address"
                            value={personalInfo.address}
                            onChange={(e) => handlePersonalInfoChange('address', e.target.value)}
                            placeholder="City, Country"
                            className="border-gray-300"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="linkedin" className="text-gray-700">LinkedIn Profile</Label>
                          <Input
                            id="linkedin"
                            value={personalInfo.linkedin}
                            onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
                            placeholder="linkedin.com/in/username"
                            className="border-gray-300"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="github" className="text-gray-700">GitHub Profile</Label>
                          <Input
                            id="github"
                            value={personalInfo.github}
                            onChange={(e) => handlePersonalInfoChange('github', e.target.value)}
                            placeholder="github.com/username"
                            className="border-gray-300"
                          />
                        </div>
                        <div className="space-y-3 md:col-span-2">
                          <Label htmlFor="portfolio" className="text-gray-700">Portfolio Website</Label>
                          <Input
                            id="portfolio"
                            value={personalInfo.portfolio}
                            onChange={(e) => handlePersonalInfoChange('portfolio', e.target.value)}
                            placeholder="portfolio.com"
                            className="border-gray-300"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Education Form */}
                  {activeSection === 'education' && (
                    <div className="space-y-6">
                      {education.map((edu, index) => (
                        <Card key={edu.id} className="border border-gray-200">
                          <div className="p-4 border-b bg-gray-50">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <GraduationCap className="h-5 w-5 text-indigo-500" />
                                <h3 className="font-medium text-gray-900">Education #{index + 1}</h3>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeEducation(edu.id)}
                                className="text-gray-500 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <Label>Institution *</Label>
                                <Input
                                  value={edu.institution}
                                  onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                                  placeholder="University Name"
                                  className="border-gray-300"
                                />
                              </div>
                              <div className="space-y-3">
                                <Label>Degree *</Label>
                                <Input
                                  value={edu.degree}
                                  onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                  placeholder="Bachelor of Science"
                                  className="border-gray-300"
                                />
                              </div>
                              <div className="space-y-3">
                                <Label>Field of Study</Label>
                                <Input
                                  value={edu.field}
                                  onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                                  placeholder="Computer Science"
                                  className="border-gray-300"
                                />
                              </div>
                              <div className="space-y-3">
                                <Label>GPA</Label>
                                <Input
                                  value={edu.gpa}
                                  onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                                  placeholder="3.8"
                                  className="border-gray-300"
                                />
                              </div>
                              <div className="space-y-3">
                                <Label>Start Date</Label>
                                <Input
                                  type="month"
                                  value={edu.startDate}
                                  onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                                  className="border-gray-300"
                                />
                              </div>
                              <div className="space-y-3">
                                <Label>End Date</Label>
                                <Input
                                  type="month"
                                  value={edu.endDate}
                                  onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                                  className="border-gray-300"
                                />
                              </div>
                              <div className="space-y-3 md:col-span-2">
                                <Label>Description</Label>
                                <Textarea
                                  value={edu.description}
                                  onChange={(e) => updateEducation(edu.id, 'description', e.target.value)}
                                  placeholder="Relevant coursework, achievements, etc."
                                  rows={3}
                                  className="border-gray-300"
                                />
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                      <Button onClick={addEducation} variant="outline" className="w-full border-dashed">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Education
                      </Button>
                    </div>
                  )}

                  {/* Experience Form */}
                  {activeSection === 'experience' && (
                    <div className="space-y-6">
                      {experience.map((exp, index) => (
                        <Card key={exp.id} className="border border-gray-200">
                          <div className="p-4 border-b bg-gray-50">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <Briefcase className="h-5 w-5 text-emerald-500" />
                                <h3 className="font-medium text-gray-900">Experience #{index + 1}</h3>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeExperience(exp.id)}
                                className="text-gray-500 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <Label>Company *</Label>
                                <Input
                                  value={exp.company}
                                  onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                  placeholder="Company Name"
                                  className="border-gray-300"
                                />
                              </div>
                              <div className="space-y-3">
                                <Label>Position *</Label>
                                <Input
                                  value={exp.position}
                                  onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                                  placeholder="Job Title"
                                  className="border-gray-300"
                                />
                              </div>
                              <div className="space-y-3">
                                <Label>Start Date</Label>
                                <Input
                                  type="month"
                                  value={exp.startDate}
                                  onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                                  className="border-gray-300"
                                />
                              </div>
                              <div className="space-y-3">
                                <Label>End Date</Label>
                                <Input
                                  type="month"
                                  value={exp.endDate}
                                  onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                  disabled={exp.current}
                                  className="border-gray-300"
                                />
                              </div>
                              <div className="flex items-center space-x-3 md:col-span-2">
                                <input
                                  type="checkbox"
                                  id={`current-${exp.id}`}
                                  checked={exp.current}
                                  onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                                  className="rounded border-gray-300"
                                />
                                <Label htmlFor={`current-${exp.id}`}>I currently work here</Label>
                              </div>
                              <div className="space-y-3 md:col-span-2">
                                <Label>Description</Label>
                                <Textarea
                                  value={exp.description}
                                  onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                                  placeholder="Describe your responsibilities and achievements..."
                                  rows={4}
                                  className="border-gray-300"
                                />
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                      <Button onClick={addExperience} variant="outline" className="w-full border-dashed">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Experience
                      </Button>
                    </div>
                  )}

                  {/* Skills Form */}
                  {activeSection === 'skills' && (
                    <div className="space-y-6">
                      {skills.map((skill, index) => (
                        <Card key={skill.id} className="border border-gray-200">
                          <div className="p-4 border-b bg-gray-50">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <Code className="h-5 w-5 text-amber-500" />
                                <h3 className="font-medium text-gray-900">Skill #{index + 1}</h3>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSkill(skill.id)}
                                className="text-gray-500 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="space-y-3">
                                <Label>Skill Name *</Label>
                                <Input
                                  value={skill.name}
                                  onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                                  placeholder="JavaScript, Python, etc."
                                  className="border-gray-300"
                                />
                              </div>
                              <div className="space-y-3">
                                <Label>Category</Label>
                                <Select
                                  value={skill.category}
                                  onValueChange={(value) => updateSkill(skill.id, 'category', value)}
                                >
                                  <SelectTrigger className="border-gray-300">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Technical">Technical</SelectItem>
                                    <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                                    <SelectItem value="Tools">Tools</SelectItem>
                                    <SelectItem value="Languages">Languages</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-3">
                                <Label>Proficiency Level</Label>
                                <Select
                                  value={skill.level}
                                  onValueChange={(value: any) => updateSkill(skill.id, 'level', value)}
                                >
                                  <SelectTrigger className="border-gray-300">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Beginner">Beginner</SelectItem>
                                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                                    <SelectItem value="Advanced">Advanced</SelectItem>
                                    <SelectItem value="Expert">Expert</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                      <Button onClick={addSkill} variant="outline" className="w-full border-dashed">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Skill
                      </Button>
                    </div>
                  )}

                  {/* Projects Form */}
                  {activeSection === 'projects' && (
                    <div className="space-y-6">
                      {projects.map((project, index) => (
                        <Card key={project.id} className="border border-gray-200">
                          <div className="p-4 border-b bg-gray-50">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <FolderKanban className="h-5 w-5 text-purple-500" />
                                <h3 className="font-medium text-gray-900">Project #{index + 1}</h3>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeProject(project.id)}
                                className="text-gray-500 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <Label>Project Name *</Label>
                                <Input
                                  value={project.name}
                                  onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                                  placeholder="E-commerce Website"
                                  className="border-gray-300"
                                />
                              </div>
                              <div className="space-y-3">
                                <Label>Project Link</Label>
                                <Input
                                  value={project.link}
                                  onChange={(e) => updateProject(project.id, 'link', e.target.value)}
                                  placeholder="https://project.com"
                                  className="border-gray-300"
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <Label>Technologies</Label>
                              <div className="flex flex-wrap gap-2 mb-3">
                                {project.technologies.map((tech, techIndex) => (
                                  <Badge key={techIndex} variant="secondary" className="bg-gray-100 text-gray-700">
                                    {tech}
                                    <button
                                      onClick={() => removeTechnology(project.id, techIndex)}
                                      className="ml-2 hover:text-red-500"
                                    >
                                      ×
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Add technology..."
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      addTechnology(project.id, (e.target as HTMLInputElement).value);
                                      (e.target as HTMLInputElement).value = '';
                                    }
                                  }}
                                  className="border-gray-300"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={(e) => {
                                    const input = e.currentTarget.previousSibling as HTMLInputElement;
                                    addTechnology(project.id, input.value);
                                    input.value = '';
                                  }}
                                >
                                  Add
                                </Button>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <Label>Description</Label>
                              <Textarea
                                value={project.description}
                                onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                                placeholder="Describe the project, your role, and key achievements..."
                                rows={4}
                                className="border-gray-300"
                              />
                            </div>
                          </div>
                        </Card>
                      ))}
                      <Button onClick={addProject} variant="outline" className="w-full border-dashed">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Project
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Resume Preview Component
const ResumePreview = ({ personalInfo, education, experience, skills, projects }: any) => {
  return (
    <Card className="border border-gray-200 shadow-sm bg-white">
      <CardContent className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{personalInfo.fullName || 'Your Name'}</h1>
          <div className="flex flex-wrap justify-center gap-4 mt-2 text-gray-600">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>• {personalInfo.phone}</span>}
            {personalInfo.address && <span>• {personalInfo.address}</span>}
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {personalInfo.linkedin && (
              <span className="text-blue-600">LinkedIn: {personalInfo.linkedin}</span>
            )}
            {personalInfo.github && (
              <span className="text-gray-600">GitHub: {personalInfo.github}</span>
            )}
            {personalInfo.portfolio && (
              <span className="text-gray-600">Portfolio: {personalInfo.portfolio}</span>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {/* Education */}
          {education.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Education</h2>
              </div>
              <div className="space-y-4">
                {education.map((edu: any, index: number) => (
                  <div key={index} className="border-l-2 border-indigo-200 pl-4">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{edu.institution}</h3>
                        <p className="text-gray-700">{edu.degree} {edu.field && `in ${edu.field}`}</p>
                      </div>
                      <div className="text-gray-600 text-sm mt-1 md:mt-0">
                        {edu.startDate} - {edu.endDate}
                      </div>
                    </div>
                    {edu.gpa && <p className="text-gray-600 mt-1">GPA: {edu.gpa}</p>}
                    {edu.description && (
                      <p className="text-gray-600 mt-2">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Briefcase className="h-5 w-5 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Experience</h2>
              </div>
              <div className="space-y-4">
                {experience.map((exp: any, index: number) => (
                  <div key={index} className="border-l-2 border-emerald-200 pl-4">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{exp.position}</h3>
                        <p className="text-gray-700">{exp.company}</p>
                      </div>
                      <div className="text-gray-600 text-sm mt-1 md:mt-0">
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </div>
                    </div>
                    {exp.description && (
                      <p className="text-gray-600 mt-2 whitespace-pre-line">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Code className="h-5 w-5 text-amber-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Skills</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: any, index: number) => (
                  <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700">
                    {skill.name} ({skill.level})
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FolderKanban className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Projects</h2>
              </div>
              <div className="space-y-4">
                {projects.map((project: any, index: number) => (
                  <div key={index} className="border-l-2 border-purple-200 pl-4">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{project.name}</h3>
                        {project.link && (
                          <a href={project.link} className="text-blue-600 hover:underline text-sm">
                            View Project
                          </a>
                        )}
                      </div>
                    </div>
                    {project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 my-2">
                        {project.technologies.map((tech: string, techIndex: number) => (
                          <Badge key={techIndex} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {project.description && (
                      <p className="text-gray-600 mt-2 whitespace-pre-line">{project.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumeBuilder;