import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Download, Eye, Edit, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    // Here you would typically save to backend or local storage
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
    // PDF generation logic would go here
  };

  // Navigation sections
  const sections = [
    { id: 'personal', label: 'Personal Info', icon: '👤' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'experience', label: 'Experience', icon: '💼' },
    { id: 'skills', label: 'Skills', icon: '🛠️' },
    { id: 'projects', label: 'Projects', icon: '🚀' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Resume Builder</h1>
          <p className="text-lg text-gray-600">Create a professional resume in minutes</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <Card>
              <CardHeader>
                <CardTitle>Resume Sections</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                        activeSection === section.id 
                          ? 'bg-blue-100 text-blue-700 font-medium' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-lg">{section.icon}</span>
                      <span>{section.label}</span>
                    </button>
                  ))}
                </nav>

                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                  <Button 
                    onClick={() => setPreviewMode(!previewMode)}
                    variant="outline" 
                    className="w-full"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {previewMode ? 'Edit Mode' : 'Preview Mode'}
                  </Button>
                  <Button onClick={saveResume} className="w-full bg-blue-600 hover:bg-blue-700">
                    <Save className="h-4 w-4 mr-2" />
                    Save Resume
                  </Button>
                  <Button onClick={downloadResume} variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
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
              <Card>
                <CardHeader>
                  <CardTitle>
                    {sections.find(s => s.id === activeSection)?.label}
                  </CardTitle>
                  <CardDescription>
                    Fill in your {sections.find(s => s.id === activeSection)?.label.toLowerCase()} information
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Personal Info Form */}
                  {activeSection === 'personal' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name *</Label>
                          <Input
                            id="fullName"
                            value={personalInfo.fullName}
                            onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={personalInfo.email}
                            onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                            placeholder="john@example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={personalInfo.phone}
                            onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            value={personalInfo.address}
                            onChange={(e) => handlePersonalInfoChange('address', e.target.value)}
                            placeholder="City, Country"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="linkedin">LinkedIn</Label>
                          <Input
                            id="linkedin"
                            value={personalInfo.linkedin}
                            onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
                            placeholder="linkedin.com/in/username"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="github">GitHub</Label>
                          <Input
                            id="github"
                            value={personalInfo.github}
                            onChange={(e) => handlePersonalInfoChange('github', e.target.value)}
                            placeholder="github.com/username"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="portfolio">Portfolio</Label>
                          <Input
                            id="portfolio"
                            value={personalInfo.portfolio}
                            onChange={(e) => handlePersonalInfoChange('portfolio', e.target.value)}
                            placeholder="portfolio.com"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Education Form */}
                  {activeSection === 'education' && (
                    <div className="space-y-6">
                      {education.map((edu, index) => (
                        <Card key={edu.id} className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="font-semibold">Education #{index + 1}</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeEducation(edu.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Institution *</Label>
                              <Input
                                value={edu.institution}
                                onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                                placeholder="University Name"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Degree *</Label>
                              <Input
                                value={edu.degree}
                                onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                placeholder="Bachelor of Science"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Field of Study</Label>
                              <Input
                                value={edu.field}
                                onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                                placeholder="Computer Science"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>GPA</Label>
                              <Input
                                value={edu.gpa}
                                onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                                placeholder="3.8"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Start Date</Label>
                              <Input
                                type="month"
                                value={edu.startDate}
                                onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>End Date</Label>
                              <Input
                                type="month"
                                value={edu.endDate}
                                onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <Label>Description</Label>
                              <Textarea
                                value={edu.description}
                                onChange={(e) => updateEducation(edu.id, 'description', e.target.value)}
                                placeholder="Relevant coursework, achievements, etc."
                                rows={3}
                              />
                            </div>
                          </div>
                        </Card>
                      ))}
                      <Button onClick={addEducation} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Education
                      </Button>
                    </div>
                  )}

                  {/* Experience Form */}
                  {activeSection === 'experience' && (
                    <div className="space-y-6">
                      {experience.map((exp, index) => (
                        <Card key={exp.id} className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="font-semibold">Experience #{index + 1}</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExperience(exp.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Company *</Label>
                              <Input
                                value={exp.company}
                                onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                placeholder="Company Name"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Position *</Label>
                              <Input
                                value={exp.position}
                                onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                                placeholder="Job Title"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Start Date</Label>
                              <Input
                                type="month"
                                value={exp.startDate}
                                onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>End Date</Label>
                              <Input
                                type="month"
                                value={exp.endDate}
                                onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                disabled={exp.current}
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`current-${exp.id}`}
                                checked={exp.current}
                                onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                                className="rounded"
                              />
                              <Label htmlFor={`current-${exp.id}`}>I currently work here</Label>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <Label>Description</Label>
                              <Textarea
                                value={exp.description}
                                onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                                placeholder="Describe your responsibilities and achievements..."
                                rows={4}
                              />
                            </div>
                          </div>
                        </Card>
                      ))}
                      <Button onClick={addExperience} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Experience
                      </Button>
                    </div>
                  )}

                  {/* Skills Form */}
                  {activeSection === 'skills' && (
                    <div className="space-y-6">
                      {skills.map((skill, index) => (
                        <Card key={skill.id} className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="font-semibold">Skill #{index + 1}</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSkill(skill.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Skill Name *</Label>
                              <Input
                                value={skill.name}
                                onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                                placeholder="JavaScript, Python, etc."
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Category</Label>
                              <Select
                                value={skill.category}
                                onValueChange={(value) => updateSkill(skill.id, 'category', value)}
                              >
                                <SelectTrigger>
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
                            <div className="space-y-2">
                              <Label>Proficiency Level</Label>
                              <Select
                                value={skill.level}
                                onValueChange={(value: any) => updateSkill(skill.id, 'level', value)}
                              >
                                <SelectTrigger>
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
                        </Card>
                      ))}
                      <Button onClick={addSkill} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Skill
                      </Button>
                    </div>
                  )}

                  {/* Projects Form */}
                  {activeSection === 'projects' && (
                    <div className="space-y-6">
                      {projects.map((project, index) => (
                        <Card key={project.id} className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="font-semibold">Project #{index + 1}</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeProject(project.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Project Name *</Label>
                                <Input
                                  value={project.name}
                                  onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                                  placeholder="E-commerce Website"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Project Link</Label>
                                <Input
                                  value={project.link}
                                  onChange={(e) => updateProject(project.id, 'link', e.target.value)}
                                  placeholder="https://project.com"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Technologies</Label>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {project.technologies.map((tech, techIndex) => (
                                  <Badge key={techIndex} variant="secondary" className="flex items-center gap-1">
                                    {tech}
                                    <button
                                      onClick={() => removeTechnology(project.id, techIndex)}
                                      className="hover:text-red-500"
                                    >
                                      <X className="h-3 w-3" />
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
                            <div className="space-y-2">
                              <Label>Description</Label>
                              <Textarea
                                value={project.description}
                                onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                                placeholder="Describe the project, your role, and key achievements..."
                                rows={4}
                              />
                            </div>
                          </div>
                        </Card>
                      ))}
                      <Button onClick={addProject} className="w-full">
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
    <Card className="bg-white">
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
              <span className="text-green-600">Portfolio: {personalInfo.portfolio}</span>
            )}
          </div>
        </div>

        {/* Education */}
        {education.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-2 mb-4">Education</h2>
            {education.map((edu: any, index: number) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{edu.institution}</h3>
                  <span className="text-gray-600">
                    {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                  </span>
                </div>
                <p className="text-gray-700">{edu.degree} {edu.field && `in ${edu.field}`}</p>
                {edu.gpa && <p className="text-gray-600">GPA: {edu.gpa}</p>}
                {edu.description && (
                  <p className="text-gray-600 mt-1">{edu.description}</p>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-2 mb-4">Experience</h2>
            {experience.map((exp: any, index: number) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{exp.position}</h3>
                  <span className="text-gray-600">
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <p className="text-gray-700">{exp.company}</p>
                {exp.description && (
                  <p className="text-gray-600 mt-1 whitespace-pre-line">{exp.description}</p>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-2 mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill: any, index: number) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {skill.name} ({skill.level})
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-2 mb-4">Projects</h2>
            {projects.map((project: any, index: number) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{project.name}</h3>
                  {project.link && (
                    <a href={project.link} className="text-blue-600 hover:underline">
                      View Project
                    </a>
                  )}
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
                  <p className="text-gray-600 whitespace-pre-line">{project.description}</p>
                )}
              </div>
            ))}
          </section>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeBuilder;