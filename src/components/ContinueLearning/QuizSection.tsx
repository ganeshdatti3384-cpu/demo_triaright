
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { Lesson } from '@/data/continueLearningData';

interface QuizSectionProps {
  lesson: Lesson;
  onQuizComplete: () => void;
}

const QuizSection = ({ lesson, onQuizComplete }: QuizSectionProps) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  // Sample quiz data - in real app this would come from the lesson data
  const quizQuestions = [
    {
      question: `What is the main concept covered in "${lesson.title}"?`,
      options: [
        'Basic HTML structure',
        'CSS styling techniques',
        'JavaScript fundamentals',
        'All of the above'
      ],
      correct: 0
    },
    {
      question: 'Which of the following is a best practice?',
      options: [
        'Using semantic HTML elements',
        'Writing clean, readable code',
        'Testing your code regularly',
        'All of the above'
      ],
      correct: 3
    }
  ];

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answerIndex
    });
  };

  const handleSubmitQuiz = () => {
    let correctCount = 0;
    quizQuestions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct) {
        correctCount++;
      }
    });
    
    setScore(correctCount);
    setShowResults(true);
  };

  const handleRetakeQuiz = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
  };

  const isQuizComplete = Object.keys(selectedAnswers).length === quizQuestions.length;
  const passedQuiz = score >= Math.ceil(quizQuestions.length * 0.7); // 70% to pass

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <HelpCircle className="h-5 w-5 mr-2" />
          Lesson Quiz
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!showResults ? (
          <div className="space-y-6">
            <p className="text-gray-600">
              Test your understanding of the lesson material. You need 70% or higher to pass.
            </p>
            
            {quizQuestions.map((question, questionIndex) => (
              <div key={questionIndex} className="space-y-3">
                <h4 className="font-medium text-gray-900">
                  {questionIndex + 1}. {question.question}
                </h4>
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <label
                      key={optionIndex}
                      className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="radio"
                        name={`question-${questionIndex}`}
                        value={optionIndex}
                        checked={selectedAnswers[questionIndex] === optionIndex}
                        onChange={() => handleAnswerSelect(questionIndex, optionIndex)}
                        className="text-blue-600"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            
            <Button
              onClick={handleSubmitQuiz}
              disabled={!isQuizComplete}
              className="w-full"
            >
              Submit Quiz
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                {passedQuiz ? (
                  <CheckCircle className="h-12 w-12 text-green-500" />
                ) : (
                  <XCircle className="h-12 w-12 text-red-500" />
                )}
              </div>
              <h3 className="text-2xl font-bold mb-2">
                {passedQuiz ? 'Congratulations!' : 'Keep Practicing!'}
              </h3>
              <p className="text-gray-600 mb-4">
                You scored {score} out of {quizQuestions.length} questions correct
              </p>
              <Badge variant={passedQuiz ? "secondary" : "destructive"} className="text-lg px-4 py-2">
                {Math.round((score / quizQuestions.length) * 100)}%
              </Badge>
            </div>

            <div className="space-y-4">
              {quizQuestions.map((question, questionIndex) => {
                const userAnswer = selectedAnswers[questionIndex];
                const isCorrect = userAnswer === question.correct;
                
                return (
                  <div key={questionIndex} className="p-4 border rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {questionIndex + 1}. {question.question}
                    </h4>
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => {
                        const isUserAnswer = userAnswer === optionIndex;
                        const isCorrectAnswer = question.correct === optionIndex;
                        
                        return (
                          <div
                            key={optionIndex}
                            className={`p-2 rounded ${
                              isCorrectAnswer
                                ? 'bg-green-100 text-green-800'
                                : isUserAnswer && !isCorrect
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center">
                              {isCorrectAnswer && <CheckCircle className="h-4 w-4 mr-2" />}
                              {isUserAnswer && !isCorrect && <XCircle className="h-4 w-4 mr-2" />}
                              {option}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              {passedQuiz ? (
                <Button onClick={onQuizComplete} className="flex-1">
                  Continue to Next Lesson
                </Button>
              ) : (
                <Button onClick={handleRetakeQuiz} variant="outline" className="flex-1">
                  Retake Quiz
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizSection;
