
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CourseQuizAssignmentProps {
  type: 'quiz' | 'assignment';
}

const CourseQuizAssignment = ({ type }: CourseQuizAssignmentProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [textAnswer, setTextAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const { toast } = useToast();

  const quizQuestion = {
    question: "Which HTML tag is used to create the largest heading?",
    options: [
      { id: 'a', text: '<h6>', correct: false },
      { id: 'b', text: '<h1>', correct: true },
      { id: 'c', text: '<header>', correct: false },
      { id: 'd', text: '<heading>', correct: false }
    ],
    explanation: "The <h1> tag creates the largest heading in HTML. Heading tags range from <h1> (largest) to <h6> (smallest)."
  };

  const assignmentPrompt = {
    title: "Build a Simple HTML Page",
    description: "Create a basic HTML page that includes at least 3 different HTML tags we've learned about in this lesson.",
    requirements: [
      "Use a proper HTML document structure with DOCTYPE, html, head, and body tags",
      "Include at least one heading tag (h1, h2, etc.)",
      "Add a paragraph with some text content",
      "Include a link to any website using the anchor tag"
    ],
    submissionFormat: "Upload your HTML file or paste your code in the text area below."
  };

  const handleQuizSubmit = () => {
    const isCorrect = quizQuestion.options.find(opt => opt.id === selectedAnswer)?.correct;
    setSubmitted(true);
    
    if (isCorrect) {
      setFeedback("Correct! " + quizQuestion.explanation);
      toast({
        title: "Correct Answer!",
        description: "Great job! You got it right.",
      });
    } else {
      setFeedback("Incorrect. " + quizQuestion.explanation);
      toast({
        title: "Try Again",
        description: "That's not quite right. Review the explanation and try again.",
        variant: "destructive"
      });
    }
  };

  const handleAssignmentSubmit = () => {
    if (!textAnswer.trim()) {
      toast({
        title: "Submission Required",
        description: "Please provide your assignment submission.",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitted(true);
    setFeedback("Assignment submitted successfully! Your instructor will review it and provide feedback within 24 hours.");
    toast({
      title: "Assignment Submitted",
      description: "Your work has been submitted for review.",
    });
  };

  if (type === 'quiz') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Knowledge Check</CardTitle>
            <Badge variant="outline">Quiz</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">{quizQuestion.question}</h3>
            
            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
              {quizQuestion.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={option.id} disabled={submitted} />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                    {option.text}
                  </Label>
                  {submitted && option.correct && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  {submitted && selectedAnswer === option.id && !option.correct && (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
              ))}
            </RadioGroup>
          </div>

          {!submitted ? (
            <Button 
              onClick={handleQuizSubmit} 
              disabled={!selectedAnswer}
              className="w-full"
            >
              Submit Answer
            </Button>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start space-x-2">
                {feedback.startsWith('Correct') ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <p className="text-sm">{feedback}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{assignmentPrompt.title}</CardTitle>
          <Badge variant="outline">Assignment</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-gray-700 mb-4">{assignmentPrompt.description}</p>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Requirements:</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              {assignmentPrompt.requirements.map((req, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Submission</h4>
          <p className="text-sm text-gray-600">{assignmentPrompt.submissionFormat}</p>
          
          {/* File Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Drop your HTML file here or click to browse</p>
            <Button variant="outline" size="sm">Choose File</Button>
          </div>
          
          {/* Text Area */}
          <div>
            <Label htmlFor="code-submission">Or paste your HTML code here:</Label>
            <Textarea
              id="code-submission"
              placeholder="<!DOCTYPE html>
<html>
<head>
    <title>My First Webpage</title>
</head>
<body>
    <!-- Your code here -->
</body>
</html>"
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
              disabled={submitted}
            />
          </div>
        </div>

        {!submitted ? (
          <Button 
            onClick={handleAssignmentSubmit} 
            className="w-full"
          >
            Submit Assignment
          </Button>
        ) : (
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <p className="text-sm text-green-800">{feedback}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseQuizAssignment;
