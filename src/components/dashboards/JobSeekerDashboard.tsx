import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp, 
  Users, 
  Star,
  MapPin,
  Calendar,
  Target,
  FileText,
  Download,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
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

interface JobSeekerDashboardProps {
  user: {
    role: string;
    name: string;
  };
  onLogout: () => void;
}

const JobSeekerDashboard = ({ user, onLogout }: JobSeekerDashboardProps) => {
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [userName, setUserName] = useState<string>('');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([
    {
      id: 1,
      title: 'Frontend Developer',
      company: 'Tech Innovations Inc.',
      location: 'Remote',
      type: 'Full-time',
      deadline: '2024-08-15'
    },
    {
      id: 2,
      title: 'UX/UI Designer',
      company: 'Creative Solutions Ltd.',
      location: 'New York',
      type: 'Contract',
      deadline: '2024-07-30'
    },
    {
      id: 3,
      title: 'Data Analyst',
      company: 'Analytics Pro Corp.',
      location: 'San Francisco',
      type: 'Full-time',
      deadline: '2024-08-01'
    }
  ]);
  const [newGoal, setNewGoal] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
  const [editedGoalText, setEditedGoalText] = useState('');

  useEffect(() => {
    const storedCourses = localStorage.getItem('enrolledCourses');
    if (storedCourses) {
      setEnrolledCourses(JSON.parse(storedCourses));
    }

    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }

    const storedGoals = localStorage.getItem('jobSeekerGoals');
    if (storedGoals) {
      setGoals(JSON.parse(storedGoals));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('jobSeekerGoals', JSON.stringify(goals));
  }, [goals]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/job-seeker');
  };

  const handleCourseClick = (courseId: string) => {
    navigate(`/courses/recorded/${courseId}`);
  };

  const handleOpportunityClick = (opportunityId: number) => {
    // Implement logic to view opportunity details
    console.log(`View opportunity ${opportunityId}`);
  };

  const handleAddGoal = () => {
    if (newGoal.trim() !== '') {
      setGoals([...goals, newGoal]);
      setNewGoal('');
    }
  };

  const handleDeleteGoal = (index: number) => {
    const newGoals = [...goals];
    newGoals.splice(index, 1);
    setGoals(newGoals);
  };

  const handleEditGoal = (index: number) => {
    setEditingGoalId(index);
    setEditedGoalText(goals[index]);
  };

  const handleUpdateGoal = (index: number) => {
    const newGoals = [...goals];
    newGoals[index] = editedGoalText;
    setGoals(newGoals);
    setEditingGoalId(null);
  };

  const styles = {
    card: {
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    header: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '15px',
      color: '#333'
    },
    content: {
      fontSize: '16px',
      color: '#555'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {userName}!
            </h1>
            <Button 
              variant="outline" 
              onClick={() => navigate('/job-seeker/profile')}
            >
              Edit Profile
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Enrolled Courses */}
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Courses</CardTitle>
              <CardDescription>Your active courses and progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {enrolledCourses.map((course) => (
                <div key={course.id} className="border rounded-md p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{course.title}</h3>
                    <Button variant="link" onClick={() => handleCourseClick(course.id)}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      View Course
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>{course.completed ? 'Completed' : 'In Progress'}</span>
                  </div>
                  <Progress value={course.progress} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Job Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle>Job Opportunities</CardTitle>
              <CardDescription>Explore relevant job openings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {opportunities.map((opportunity) => (
                <div key={opportunity.id} className="border rounded-md p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{opportunity.title}</h3>
                    <Badge>{opportunity.type}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{opportunity.company}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <MapPin className="h-4 w-4" />
                    <span>{opportunity.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>Deadline: {opportunity.deadline}</span>
                  </div>
                  <Button variant="outline" onClick={() => handleOpportunityClick(opportunity.id)}>
                    View Details
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Career Goals */}
          <Card>
            <CardHeader>
              <CardTitle>Career Goals</CardTitle>
              <CardDescription>Set and track your professional goals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex">
                <Input
                  type="text"
                  placeholder="Add a new goal"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                />
                <Button onClick={handleAddGoal} className="ml-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <ul className="space-y-2">
                {goals.map((goal, index) => (
                  <li key={index} className="flex items-center justify-between">
                    {editingGoalId === index ? (
                      <div className="flex items-center w-full">
                        <Input
                          type="text"
                          value={editedGoalText}
                          onChange={(e) => setEditedGoalText(e.target.value)}
                          className="mr-2"
                        />
                        <Button onClick={() => handleUpdateGoal(index)} variant="outline">
                          Update
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span>{goal}</span>
                        <div>
                          <Button onClick={() => handleEditGoal(index)} variant="ghost" size="icon">
                            <Edit className="h-4 w-4 mr-2" />
                          </Button>
                          <Button onClick={() => handleDeleteGoal(index)} variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default JobSeekerDashboard;
