
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Calendar, Star } from 'lucide-react';

interface SuccessStoriesProps {
  onBack: () => void;
}

const SuccessStories = ({ onBack }: SuccessStoriesProps) => {
  const [currentStory, setCurrentStory] = useState(0);

  const successStories = [
    {
      id: 1,
      name: 'Priya Sharma',
      role: 'Software Developer',
      company: 'TCS',
      package: '6.5 LPA',
      image: 'https://images.unsplash.com/photo-1494790108755-2616c5e2e4b8?w=300&h=300&fit=crop&crop=face',
      story: 'After completing the Web Development course at TriaRight, I landed my dream job at TCS. The hands-on projects and placement support were exceptional.',
      course: 'Web Development',
      location: 'Hyderabad',
      year: '2024'
    },
    {
      id: 2,
      name: 'Rahul Kumar',
      role: 'Data Analyst',
      company: 'Infosys',
      package: '7.2 LPA',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      story: 'The Data Science program transformed my career completely. From a non-tech background to becoming a data analyst at Infosys!',
      course: 'Data Science',
      location: 'Bangalore',
      year: '2024'
    },
    {
      id: 3,
      name: 'Sneha Patel',
      role: 'Business Analyst',
      company: 'Wipro',
      package: '5.8 LPA',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
      story: 'The comprehensive training and mock interviews prepared me perfectly for the corporate world. Thank you TriaRight!',
      course: 'Business Analytics',
      location: 'Pune',
      year: '2024'
    },
    {
      id: 4,
      name: 'Amit Singh',
      role: 'Full Stack Developer',
      company: 'Accenture',
      package: '8.0 LPA',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
      story: 'From zero coding knowledge to full stack developer in 6 months. The mentors at TriaRight made it possible!',
      course: 'Web Development',
      location: 'Chennai',
      year: '2024'
    },
    {
      id: 5,
      name: 'Kavya Reddy',
      role: 'UI/UX Designer',
      company: 'HCL',
      package: '6.0 LPA',
      image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=300&h=300&fit=crop&crop=face',
      story: 'The design thinking approach and practical projects helped me secure a position at HCL as a UI/UX Designer.',
      course: 'Web Development',
      location: 'Hyderabad',
      year: '2024'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStory((prev) => (prev + 1) % successStories.length);
    }, 8000);

    return () => clearInterval(timer);
  }, [successStories.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" onClick={onBack} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
              TriaRight - Success Stories
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Success Stories</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Meet our successful students who transformed their careers with TriaRight training programs
          </p>
        </div>

        {/* Featured Story */}
        <div className="mb-16">
          <Card className="max-w-4xl mx-auto overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/3">
                <img
                  src={successStories[currentStory].image}
                  alt={successStories[currentStory].name}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="md:w-2/3 p-8">
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-gradient-to-r from-blue-600 to-orange-500">
                    {successStories[currentStory].course}
                  </Badge>
                  <div className="flex items-center text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {successStories[currentStory].name}
                </h3>
                <p className="text-lg text-blue-600 mb-4">
                  {successStories[currentStory].role} at {successStories[currentStory].company}
                </p>
                <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                  "{successStories[currentStory].story}"
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {successStories[currentStory].year}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {successStories[currentStory].location}
                  </div>
                  <Badge variant="secondary" className="font-semibold">
                    Package: {successStories[currentStory].package}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* All Success Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {successStories.map((story, index) => (
            <Card key={story.id} className={`cursor-pointer transition-all hover:shadow-lg ${
              index === currentStory ? 'ring-2 ring-blue-500' : ''
            }`} onClick={() => setCurrentStory(index)}>
              <CardHeader className="text-center">
                <img
                  src={story.image}
                  alt={story.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <CardTitle className="text-lg">{story.name}</CardTitle>
                <CardDescription>
                  {story.role} at {story.company}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <Badge variant="outline">{story.course}</Badge>
                  <p className="text-sm text-gray-600">Package: {story.package}</p>
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <MapPin className="h-3 w-3 mr-1" />
                    {story.location}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Your Success Story?</h3>
          <p className="text-lg text-gray-600 mb-8">Join thousands of successful learners and transform your career today!</p>
          <Button 
            onClick={onBack}
            className="bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white px-8 py-3 text-lg"
          >
            Start Learning Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuccessStories;
