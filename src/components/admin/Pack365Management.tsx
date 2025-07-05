<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
=======

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
>>>>>>> 353d7e975c005bdcc6e584a454eecc48787a84ae
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
<<<<<<< HEAD
import { Plus, Edit, Trash2, Eye } from 'lucide-react';

type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';
=======
import { Plus, Edit, Trash2, Save, X, Calendar, Users, DollarSign } from 'lucide-react';
>>>>>>> 353d7e975c005bdcc6e584a454eecc48787a84ae

interface Pack365Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
<<<<<<< HEAD
  level: CourseLevel;
  price: number;
  isPaid: boolean;
  image: string;
  skills: string[];
  rating: number;
  studentsEnrolled: number;
  category: string;
}

const Pack365Management = () => {
  const [courses, setCourses] = useState<Pack365Course[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Pack365Course | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    duration: '365 days',
    level: 'Beginner' as CourseLevel,
    price: 0,
    isPaid: false,
    image: '/lovable-uploads/8a53fb02-6194-4512-8c0c-ba7831af3ae8.png',
    skills: '',
    category: ''
  });

  useEffect(() => {
=======
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  price: number;
  skills: string[];
  image: string;
  isPaid: boolean;
}

const Pack365Management = () => {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Pack365Course[]>([]);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Pack365Course>>({
    title: '',
    description: '',
    instructor: '',
    level: 'Beginner',
    price: 0,
    skills: [],
    image: '/placeholder.svg',
    isPaid: true
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = () => {
>>>>>>> 353d7e975c005bdcc6e584a454eecc48787a84ae
    const savedCourses = localStorage.getItem('pack365Courses');
    if (savedCourses) {
      setCourses(JSON.parse(savedCourses));
    }
<<<<<<< HEAD
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newCourse: Pack365Course = {
      id: editingCourse?.id || Date.now().toString(),
      title: formData.title,
      description: formData.description,
      instructor: formData.instructor,
      duration: formData.duration,
      level: formData.level,
      price: formData.isPaid ? formData.price : 0,
      isPaid: formData.isPaid,
      image: formData.image,
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
      rating: 4.5,
      studentsEnrolled: Math.floor(Math.random() * 10000),
      category: formData.category
    };

    let updatedCourses;
    if (editingCourse) {
      updatedCourses = courses.map(course => 
        course.id === editingCourse.id ? newCourse : course
      );
      toast({
        title: "Course Updated",
        description: `${newCourse.title} has been updated successfully.`
      });
    } else {
      updatedCourses = [...courses, newCourse];
      toast({
        title: "Course Added",
        description: `${newCourse.title} has been added to Pack365.`
      });
    }

    setCourses(updatedCourses);
    localStorage.setItem('pack365Courses', JSON.stringify(updatedCourses));
    
    resetForm();
=======
  };

  const saveCourses = (updatedCourses: Pack365Course[]) => {
    localStorage.setItem('pack365Courses', JSON.stringify(updatedCourses));
    setCourses(updatedCourses);
  };

  const handleAddCourse = () => {
    if (!formData.title || !formData.description || !formData.instructor) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newCourse: Pack365Course = {
      id: Date.now().toString(),
      title: formData.title!,
      description: formData.description!,
      instructor: formData.instructor!,
      duration: '365 days',
      level: formData.level as 'Beginner' | 'Intermediate' | 'Advanced',
      price: formData.price || 0,
      skills: formData.skills || [],
      image: formData.image || '/placeholder.svg',
      isPaid: formData.isPaid || false
    };

    const updatedCourses = [...courses, newCourse];
    saveCourses(updatedCourses);
    resetForm();
    setIsAddingCourse(false);

    toast({
      title: "Success",
      description: "Pack365 course added successfully",
    });
  };

  const handleEditCourse = (course: Pack365Course) => {
    setEditingCourse(course.id);
    setFormData({
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      level: course.level,
      price: course.price,
      skills: course.skills,
      image: course.image,
      isPaid: course.isPaid
    });
  };

  const handleUpdateCourse = () => {
    if (!formData.title || !formData.description || !formData.instructor) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const updatedCourses = courses.map(course => 
      course.id === editingCourse 
        ? {
            ...course,
            title: formData.title!,
            description: formData.description!,
            instructor: formData.instructor!,
            level: formData.level as 'Beginner' | 'Intermediate' | 'Advanced',
            price: formData.price || 0,
            skills: formData.skills || [],
            image: formData.image || '/placeholder.svg',
            isPaid: formData.isPaid || false
          }
        : course
    );

    saveCourses(updatedCourses);
    resetForm();
    setEditingCourse(null);

    toast({
      title: "Success",
      description: "Course updated successfully",
    });
  };

  const handleDeleteCourse = (courseId: string) => {
    const updatedCourses = courses.filter(course => course.id !== courseId);
    saveCourses(updatedCourses);

    toast({
      title: "Success",
      description: "Course deleted successfully",
    });
>>>>>>> 353d7e975c005bdcc6e584a454eecc48787a84ae
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      instructor: '',
<<<<<<< HEAD
      duration: '365 days',
      level: 'Beginner',
      price: 0,
      isPaid: false,
      image: '/lovable-uploads/8a53fb02-6194-4512-8c0c-ba7831af3ae8.png',
      skills: '',
      category: ''
    });
    setShowForm(false);
    setEditingCourse(null);
  };

  const handleEdit = (course: Pack365Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      duration: course.duration,
      level: course.level,
      price: course.price,
      isPaid: course.isPaid,
      image: course.image,
      skills: course.skills.join(', '),
      category: course.category
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    const updatedCourses = courses.filter(course => course.id !== id);
    setCourses(updatedCourses);
    localStorage.setItem('pack365Courses', JSON.stringify(updatedCourses));
    toast({
      title: "Course Deleted",
      description: "The course has been removed from Pack365."
    });
=======
      level: 'Beginner',
      price: 0,
      skills: [],
      image: '/placeholder.svg',
      isPaid: true
    });
  };

  const handleSkillsChange = (value: string) => {
    const skillsArray = value.split(',').map(skill => skill.trim()).filter(skill => skill);
    setFormData({ ...formData, skills: skillsArray });
>>>>>>> 353d7e975c005bdcc6e584a454eecc48787a84ae
  };

  return (
    <div className="space-y-6">
<<<<<<< HEAD
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pack365 Course Management</h2>
          <p className="text-gray-600">Manage comprehensive course packages</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
=======
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Pack365 Course Management</h2>
        <Button onClick={() => setIsAddingCourse(true)} className="bg-blue-600 hover:bg-blue-700">
>>>>>>> 353d7e975c005bdcc6e584a454eecc48787a84ae
          <Plus className="h-4 w-4 mr-2" />
          Add Pack365 Course
        </Button>
      </div>

<<<<<<< HEAD
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingCourse ? 'Edit Pack365 Course' : 'Add New Pack365 Course'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructor">Instructor</Label>
                  <Input
                    id="instructor"
                    value={formData.instructor}
                    onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select 
                    value={formData.level} 
                    onValueChange={(value: CourseLevel) => 
                      setFormData({...formData, level: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPaid"
                      checked={formData.isPaid}
                      onChange={(e) => setFormData({...formData, isPaid: e.target.checked})}
                    />
                    <Label htmlFor="isPaid">Paid Course</Label>
                  </div>
                  {formData.isPaid && (
                    <Input
                      type="number"
                      placeholder="Price (in dollars)"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                      required
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => setFormData({...formData, skills: e.target.value})}
                  placeholder="HTML, CSS, JavaScript, React"
                  required
                />
              </div>

              <div className="flex space-x-2">
                <Button type="submit">
                  {editingCourse ? 'Update Course' : 'Add Course'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
=======
      {/* Add/Edit Form */}
      {(isAddingCourse || editingCourse) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingCourse ? 'Edit' : 'Add'} Pack365 Course</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter course title"
                />
              </div>
              <div>
                <Label htmlFor="instructor">Instructor *</Label>
                <Input
                  id="instructor"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  placeholder="Enter instructor name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter course description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="level">Level</Label>
                <Select 
                  value={formData.level} 
                  onValueChange={(value: 'Beginner' | 'Intermediate' | 'Advanced') => 
                    setFormData({ ...formData, level: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Course Type</Label>
                <Select 
                  value={formData.isPaid ? 'paid' : 'free'}
                  onValueChange={(value) => setFormData({ ...formData, isPaid: value === 'paid' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                value={formData.skills?.join(', ')}
                onChange={(e) => handleSkillsChange(e.target.value)}
                placeholder="React, Node.js, MongoDB"
              />
            </div>

            <div>
              <Label htmlFor="image">Course Image URL</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="Enter image URL"
              />
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={editingCourse ? handleUpdateCourse : handleAddCourse}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {editingCourse ? 'Update' : 'Add'} Course
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  resetForm();
                  setIsAddingCourse(false);
                  setEditingCourse(null);
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
>>>>>>> 353d7e975c005bdcc6e584a454eecc48787a84ae
          </CardContent>
        </Card>
      )}

<<<<<<< HEAD
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant={course.isPaid ? "default" : "secondary"}>
                  {course.isPaid ? `$${course.price}` : 'FREE'}
                </Badge>
                <Badge variant="outline">{course.level}</Badge>
              </div>
              <CardTitle className="text-lg">{course.title}</CardTitle>
              <p className="text-sm text-gray-600">by {course.instructor}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span>Category:</span>
                    <span className="font-medium">{course.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">{course.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Students:</span>
                    <span className="font-medium">{course.studentsEnrolled.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {course.skills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {course.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{course.skills.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(course)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(course.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
=======
      {/* Courses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">by {course.instructor}</p>
                </div>
                <div className="flex space-x-1">
                  <Button size="sm" variant="outline" onClick={() => handleEditCourse(course)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDeleteCourse(course.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">{course.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    <Calendar className="h-3 w-3 mr-1" />
                    {course.duration}
                  </Badge>
                  <Badge variant="outline">{course.level}</Badge>
                  {course.isPaid ? (
                    <Badge className="bg-blue-500 text-white">
                      <DollarSign className="h-3 w-3 mr-1" />
                      ${course.price}
                    </Badge>
                  ) : (
                    <Badge className="bg-green-500 text-white">FREE</Badge>
                  )}
                </div>

                {course.skills.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium">Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {course.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
>>>>>>> 353d7e975c005bdcc6e584a454eecc48787a84ae
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
<<<<<<< HEAD
        <div className="text-center py-12">
          <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Pack365 courses yet</h3>
          <p className="text-gray-600 mb-4">Create your first comprehensive course package</p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Pack365 Course
          </Button>
        </div>
=======
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No Pack365 courses found. Add your first course to get started.</p>
          </CardContent>
        </Card>
>>>>>>> 353d7e975c005bdcc6e584a454eecc48787a84ae
      )}
    </div>
  );
};

export default Pack365Management;
