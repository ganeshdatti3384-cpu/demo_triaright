import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Clock, AlertCircle, CheckCircle2, ArrowLeft, BookOpen, Award } from "lucide-react";
import { pack365Api } from "@/services/api";
import Navbar from "@/components/Navbar";

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  type: "easy" | "medium" | "hard";
  description?: string;
}

interface Exam {
  id: string;
  examId: string;
  courseId: string;
  questions: Question[];
  maxAttempts: number;
  passingScore: number;
  timeLimit: number;
  isActive: boolean;
  examType: "course" | "final";
  name: string;
}

export default function ExamInterface() {
  const { stream } = useParams<{ stream: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [eligible, setEligible] = useState(false);
  const [availableExams, setAvailableExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  
  useEffect(() => {
    async function init() {
      setLoading(true);
      setErrorMessage("");
      try {
        // Check user eligibility (e.g. 80% watched)
        const token = localStorage.getItem("token");
        if (!token) {
          setErrorMessage("Login required.");
          navigate("/login");
          return;
        }
        const enrollmentResponse = await pack365Api.getMyEnrollments(token);
        const streamEnrollment = enrollmentResponse.enrollments?.find(
          (e: any) => e.stream?.toLowerCase() === stream?.toLowerCase()
        );
        if (!streamEnrollment) {
          setErrorMessage("Not enrolled for this stream.");
          return;
        }
        if (streamEnrollment.totalWatchedPercentage < 80) {
          setErrorMessage("Complete at least 80% to unlock exams.");
          return;
        }

        setEligible(true);
        // Fetch all exams (course-wise + final)
        const availableExamsResponse = await pack365Api.getAvailableExams(token);
        let exams = availableExamsResponse.exams || [];
        // Add type for distinction (you may need to adapt this if backend is not explicit)
        exams = exams.map((exam: any) => ({
          ...exam,
          examType: exam.name?.toLowerCase()?.includes("final")
            ? "final"
            : "course"
        }));
        setAvailableExams(exams);
        if (exams.length > 0) setSelectedExamId(exams[0].examId);
      } catch (e) {
        setErrorMessage("Error loading exams.");
      }
      setLoading(false);
    }
    init();
  }, [stream, navigate]);

  useEffect(() => {
    async function loadExam() {
      if (!selectedExamId) return;
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const examDetailsResponse = await pack365Api.getExamDetails(selectedExamId, token);
        setSelectedExam(examDetailsResponse.exam);
      } catch (err) {
        setErrorMessage("Failed to load exam details.");
      }
      setLoading(false);
    }
    loadExam();
  }, [selectedExamId]);

  if (loading) return <div>Loading exam...</div>;
  if (errorMessage) return <div><AlertCircle /> {errorMessage}</div>;
  if (!eligible) return <div>Please complete stream progress first.</div>;
  if (availableExams.length === 0)
    return <div>No exams available right now.</div>;

  return (
    <div>
      <Navbar />
      <Card>
        <CardHeader>
          <CardTitle>Select an Exam Type</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedExamId}
            onValueChange={setSelectedExamId}
          >
            {availableExams.map((exam) => (
              <RadioGroupItem key={exam.examId} value={exam.examId}>
                <Label>
                  {exam.name} ({exam.examType === "final" ? "Stream Final" : "Course-wise"})
                </Label>
              </RadioGroupItem>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
      {selectedExam &&
        <Card>
          <CardHeader>
            <CardTitle>{selectedExam.name}</CardTitle>
            <Badge>{selectedExam.examType === "final" ? "Stream Final" : "Course-wise"}</Badge>
          </CardHeader>
          <CardContent>
            <div>Max Attempts: {selectedExam.maxAttempts}</div>
            <div>Passing Score: {selectedExam.passingScore}</div>
            <div>Time Limit: {selectedExam.timeLimit} minutes</div>
            <Progress value={0} max={selectedExam.questions.length * 100} />
            {/* Render each question UI here... */}
          </CardContent>
        </Card>
      }
      <Button onClick={() => navigate(`/pack365-learning/${stream}`)}>
        <ArrowLeft /> Back to Learning
      </Button>
    </div>
  );
}
