
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, DollarSign, Gift } from 'lucide-react';

interface Pack365Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  price: number;
  isPaid: boolean;
  image: string;
  skills: string[];
  category: string;
}

const Pack365Management = () => {
  const [courses, setCourses] = useState<Pack365Course[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Pack365Course | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    duration: '',
    level: 'Beginner' as const,
    price: 0,
    isPaid: false,
    image: '/lovable-uploads/8a53fb02-6194-4512-8c0c-ba7831af3ae8.png',
    skills: '',
    category: ''
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = () => {
    const savedCourses = localStorage.getItem('pack365Courses');
    if (savedCourses) {
      setCourses(JSON.parse(savedCourses));
    }
  };

  const saveCourses = (updatedCourses: Pack365Course[]) => {
    localStorage.setItem('pack365Courses', JSON.stringify(updatedCourses));
    setCourses(updatedCourses);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const skillsArray = formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill);
    
    const courseData: Pack365Course = {
      id: editingCourse?.id || Date.now().toString(),
      title: formData.title,
      description: formData.description,
      instructor: formData.instructor,
      duration: formData.duration,
      level: formData.level,
      price: formData.isPaid ? formData.price : 0,
      isPaid: formData.isPaid,
      image: formData.image,
      skills: skillsArray,
      category: formData.category
    };

    let updatedCourses;
    if (editingCourse) {
      updatedCourses = courses.map(course => 
        course.id === editingCourse.id ? courseData : course
      );
    } else {
      updatedCourses = [...courses, courseData];
    }

    saveCourses(updatedCourses);
    resetForm();
    setIsDialogOpen(false);
    
    toast({
      title: editingCourse ? 'Course Updated' : 'Course Created',
      description: `Pack365 course has been ${editingCourse ? 'updated' : 'created'} successfully.`,
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      instructor: '',
      duration: '',
      level: 'Beginner',
      price: 0,
      isPaid: false,
      image: '/lovable-uploads/8a53fb02-6194-4512-8c0c-ba7831af3ae8.png',
      skills: '',
      category: ''
    });
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
    setIsDialogOpen(true);
  };

  const handleDelete = (courseId: string) => {
    const updatedCourses = courses.filter(course => course.id !== courseId);
    saveCourses(updatedCourses);
    
    toast({
      title: 'Course Deleted',
      description: 'Pack365 course has been deleted successfully.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Pack365 Course Management</h2>
          <p className="text-gray-600">Manage your Pack365 course offerings</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Pack365 Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCourse ? 'Edit Pack365 Course' : 'Add New Pack365 Course'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instructor">Instructor</Label>
                  <Input
                    id="instructor"
                    value={formData.instructor}
                    onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    placeholder="e.g., 365 days"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="level">Level</Label>
                  <Select value={formData.level} onValueChange={(value: any) => setFormData({...formData, level: value})}>
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
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => setFormData({...formData, skills: e.target.value})}
                  placeholder="React, JavaScript, Node.js"
                  required
                />
              </div>
              
              <div className="flex items-center space-x-4">
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
                  <div>
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                      min="0"
                      required
                    />
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{course.instructor}</p>
                </div>
                <div className="flex items-center space-x-1">
                  {course.isPaid ? (
                    <Badge className="bg-blue-500">
                      <DollarSign className="h-3 w-3 mr-1" />
                      ${course.price}
                    </Badge>
                  ) : (
                    <Badge className="bg-green-500">
                      <Gift className="h-3 w-3 mr-1" />
                      FREE
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">{course.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>{course.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span>Level:</span>
                  <Badge variant="outline">{course.level}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Category:</span>
                  <span>{course.category}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {course.skills.slice(0, 3).map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {course.skills.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{course.skills.length - 3}
                  </Badge>
                )}
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => handleEdit(course)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(course.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No Pack365 courses created yet.</p>
          <p className="text-sm text-gray-400">Click "Add Pack365 Course" to get started.</p>
        </div>
      )}
    </div>
  );
};

export default Pack365Management;
