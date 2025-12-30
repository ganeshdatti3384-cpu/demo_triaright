import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  Users, 
  MapPin,
  Calendar,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { courseApi } from '@/services/api';
import Navbar from '../Navbar';

interface Course {
  id: string;
  title: string;
  description: string;
  progress: number;
  completed: boolean;
}

interface Opportunity {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  deadline: string;
}

const JobSeekerDashboard = () => {
  const navigate = useNavigate();

  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [userName, setUserName] = useState('');
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
  const [editedGoalText, setEditedGoalText] = useState('');

  const opportunities: Opportunity[] = [
    {
      id: 1,
      title: 'Frontend Developer',
      company: 'Tech Innovations Inc.',
      location: 'Remote',
      type: 'Full-time',
      deadline: '2024-08-15'
    }
  ];

  useEffect(() => {
    const storedCourses = localStorage.getItem('enrolledCourses');
    if (storedCourses) setEnrolledCourses(JSON.parse(storedCourses));

    const storedName = localStorage.getItem('userName');
    if (storedName) setUserName(storedName);

    const storedGoals = localStorage.getItem('jobSeekerGoals');
    if (storedGoals) setGoals(JSON.parse(storedGoals));

    loadAvailableCourses();
  }, []);

  const loadAvailableCourses = async () => {
    try {
      setLoadingCourses(true);
      const courses = await courseApi.getAllCourses();
      setAvailableCourses(courses.courses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('jobSeekerGoals', JSON.stringify(goals));
  }, [goals]);

  const handleCourseClick = (courseId: string) => {
    navigate(`/courses/recorded/${courseId}`);
  };

  // ✅ FIXED: Live Course Navigation
const handleLiveCoursesClick = () => {
  navigate('/enroll');
};


  const handleAddGoal = () => {
    if (newGoal.trim()) {
      setGoals([...goals, newGoal]);
      setNewGoal('');
    }
  };

  const handleDeleteGoal = (index: number) => {
    const updated = [...goals];
    updated.splice(index, 1);
    setGoals(updated);
  };

  const handleEditGoal = (index: number) => {
    setEditingGoalId(index);
    setEditedGoalText(goals[index]);
  };

  const handleUpdateGoal = (index: number) => {
    const updated = [...goals];
    updated[index] = editedGoalText;
    setGoals(updated);
    setEditingGoalId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Enrolled Courses */}
        <Card>
          <CardHeader>
            <CardTitle>Enrolled Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {enrolledCourses.map(course => (
              <div key={course.id} className="mb-4">
                <h3 className="font-semibold">{course.title}</h3>
                <Progress value={course.progress} />
                <Button variant="link" onClick={() => handleCourseClick(course.id)}>
                  <BookOpen className="h-4 w-4 mr-1" /> View
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ✅ Live Courses Card */}
   <Card
  onClick={handleLiveCoursesClick}
  className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
>
  <CardHeader>
    <CardTitle className="flex items-center justify-center">
      <Users className="mr-2" />
      Live Courses
    </CardTitle>
    <CardDescription className="text-center">
      Click to explore live courses
    </CardDescription>
  </CardHeader>
</Card>

        {/* Job Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle>Job Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            {opportunities.map(job => (
              <div key={job.id}>
                <h3>{job.title}</h3>
                <Badge>{job.type}</Badge>
                <div className="text-sm text-gray-500 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" /> {job.location}
                </div>
                <div className="text-sm text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" /> {job.deadline}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Career Goals */}
        <Card>
          <CardHeader>
            <CardTitle>Career Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex mb-2">
              <Input value={newGoal} onChange={e => setNewGoal(e.target.value)} />
              <Button onClick={handleAddGoal} className="ml-2">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {goals.map((goal, i) => (
              <div key={i} className="flex justify-between items-center">
                {editingGoalId === i ? (
                  <>
                    <Input value={editedGoalText} onChange={e => setEditedGoalText(e.target.value)} />
                    <Button onClick={() => handleUpdateGoal(i)}>Save</Button>
                  </>
                ) : (
                  <>
                    <span>{goal}</span>
                    <div>
                      <Button size="icon" variant="ghost" onClick={() => handleEditGoal(i)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDeleteGoal(i)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

      </main>
    </div>
  );
};

export default JobSeekerDashboard;
