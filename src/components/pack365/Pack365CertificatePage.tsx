import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import {
  Loader2,
  Download,
  ArrowLeft,
  Award,
  CheckCircle,
  Calendar,
  User,
  BookOpen,
  Building,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type CertificateData = {
  studentName: string;
  email?: string;
  phoneNumber?: string;
  courseId: string;
  courseName: string;
  courseDescription?: string;
  stream?: string;
  enrollmentDate?: string;
  completedDate?: string;
};

const Pack365CertificatePage: React.FC = () => {
  const { enrollmentId } = useParams<{ enrollmentId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const state = (location.state || {}) as {
    enrollmentId?: string;
    courseId?: string;
    completedDate?: string;
    courseName?: string;
    stream?: string;
  };

  const [loading, setLoading] = useState<boolean>(false);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [courseIdInput, setCourseIdInput] = useState<string>(state.courseId || "");
  const certRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (state.courseId) {
      fetchCertificate(state.courseId, state.completedDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCertificate = async (courseId: string, completedDate?: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({ title: "Authentication Required", variant: "destructive" });
      navigate("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/pack365/enrollment/certificate/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId,
          completedDate,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const msg = data?.message || data?.error || "Failed to fetch certificate data";
        setError(msg);
        toast({ title: "Failed", description: msg, variant: "destructive" });
        setLoading(false);
        return;
      }

      const payload = data.data || {};
      const cert: CertificateData = {
        studentName: payload.studentName || payload.fullName || "Student",
        email: payload.email || "",
        phoneNumber: payload.phoneNumber || "",
        courseId: payload.courseId || courseId,
        courseName: payload.courseName || state.courseName || payload.courseName || "Course",
        courseDescription: payload.courseDescription || payload.courseDescription || "",
        stream: payload.stream || state.stream || "",
        enrollmentDate: payload.enrollmentDate
          ? new Date(payload.enrollmentDate).toLocaleDateString()
          : undefined,
        completedDate: payload.completedDate
          ? new Date(payload.completedDate).toLocaleDateString()
          : completedDate
          ? new Date(completedDate).toLocaleDateString()
          : undefined,
      };

      setCertificate(cert);
      setLoading(false);
    } catch (err: any) {
      console.error("Certificate fetch error:", err);
      setError(err.message || "Failed to fetch certificate");
      toast({ title: "Error", description: err.message || "Failed to fetch certificate", variant: "destructive" });
      setLoading(false);
    }
  };

  const handleGenerate = () => {
    if (!courseIdInput) {
      setError("Please provide a valid courseId");
      return;
    }
    fetchCertificate(courseIdInput);
  };

  const formattedCertificateId = () => {
    const cid = certificate?.courseId || courseIdInput || "COURSE_386337";
    const eid = enrollmentId || state.enrollmentId || "";
    return eid ? `${eid}-${cid}` : cid;
  };

  const handleDownloadPNG = async () => {
    if (!certRef.current) {
      toast({ title: "Unavailable", description: "Certificate not rendered", variant: "destructive" });
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const html2canvas = (window as any).html2canvas;
    if (!html2canvas) {
      toast({
        title: "Library Missing",
        description: "html2canvas is not available. Use browser Print -> Save as PDF.",
        variant: "destructive",
      });
      return;
    }

    try {
      const canvas = await html2canvas(certRef.current, { scale: 2, useCORS: true });
      const dataURL = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataURL;
      a.download = `${certificate?.courseName || "certificate"}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("Download PNG error:", err);
      toast({ title: "Error", description: "Failed to generate image", variant: "destructive" });
    }
  };

  const handleDownloadPDF = async () => {
    if (!certRef.current || !certificate) return;
    setGenerating(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const html2canvasWin = (window as any).html2canvas;

    try {
      let html2canvasLib: any = html2canvasWin;
      let jsPDFLib: any = (window as any).jspdf;

      if (!html2canvasLib) {
        try {
          // @ts-ignore
          html2canvasLib = (await import("html2canvas")).default;
        } catch (e) {
          html2canvasLib = null;
        }
      }

      if (!jsPDFLib) {
        try {
          // @ts-ignore
          const jspdfModule = await import("jspdf");
          jsPDFLib = jspdfModule.jsPDF || jspdfModule.default;
        } catch (e) {
          jsPDFLib = null;
        }
      }

      if (!html2canvasLib) {
        toast({
          title: "Library Missing",
          description: "html2canvas is not available to generate PDF. You can use the Download PNG.",
          variant: "destructive",
        });
        setGenerating(false);
        return;
      }

      const preloadImage = new Image();
      preloadImage.crossOrigin = "anonymous";
      preloadImage.src = "/lovable-uploads/certificate-bg.jpg";
      await new Promise((resolve) => {
        preloadImage.onload = () => resolve(true);
        preloadImage.onerror = () => resolve(true);
        setTimeout(() => resolve(true), 500);
      });

      const canvas = await html2canvasLib(certRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        width: certRef.current.scrollWidth,
        height: certRef.current.scrollHeight,
        onclone: (clonedDoc: Document) => {
          const clonedElement = clonedDoc.querySelector(".certificate-container") as HTMLElement | null;
          if (clonedElement) {
            clonedElement.style.backgroundImage = "url(/lovable-uploads/certificate-bg.jpg)";
            clonedElement.style.backgroundSize = "cover";
            clonedElement.style.backgroundPosition = "center";
            clonedElement.style.backgroundRepeat = "no-repeat";
          }
        },
      });

      const imgData = canvas.toDataURL("image/png", 1.0);

      if (jsPDFLib) {
        const pdf = new jsPDFLib({
          orientation: "portrait",
          unit: "px",
          format: [canvas.width, canvas.height],
        });
        pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
        pdf.save(`${formattedCertificateId() || certificate.courseId}.pdf`);
      } else {
        const a = document.createElement("a");
        a.href = imgData;
        a.download = `${formattedCertificateId() || certificate.courseId}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }

      toast({
        title: "Download Successful",
        description: "Certificate downloaded",
        variant: "default",
      });
    } catch (err) {
      console.error("Error generating certificate:", err);
      toast({
        title: "Download Failed",
        description: "Failed to generate certificate file",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  /**
   * Course body component (centered vertically)
   * - Uses certificate values and includes Completed On & Certificate ID in the paragraph as requested.
   * - Does NOT modify any certificate data.
   */
  const Pack365CourseBody: React.FC<{
    certificate: CertificateData;
    providerName?: string;
  }> = ({ certificate, providerName }) => {
    const provider = providerName || "Pack365";
    const start = certificate.enrollmentDate || "12/1/2025";
    // Use provided completed date fallback if missing
    const end = certificate.completedDate || "12/2/2025";
    const certId = formattedCertificateId() || "COURSE_386337";

    return (
      <div className="w-full h-full flex flex-col items-center justify-center px-12 text-center">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-1">Certificate of Completion</h2>
          <p className="text-sm text-gray-700 mb-6">This certifies that</p>

          <h3 className="text-2xl font-semibold text-gray-900 mb-2">{certificate.studentName}</h3>
          <p className="text-sm text-gray-700 mb-3">has successfully completed the course</p>
          <h4 className="text-xl font-medium text-gray-900 mb-6">{certificate.courseName}</h4>
          {certificate.stream && <p className="text-sm text-gray-700 mb-6">{certificate.stream} Stream</p>}

          <div className="text-left text-gray-800 leading-relaxed space-y-4">
            <p>
              This is to certify that <strong>{certificate.studentName}</strong> has successfully completed the professional
              course <strong>{certificate.courseName}</strong> {certificate.stream ? `(${certificate.stream})` : ""}. The course was provided by <strong>{provider}</strong>.
              During the course period from <strong>{start}</strong> to <strong>{end}</strong>, the candidate demonstrated commendable dedication, technical competence, and a proactive attitude toward assigned tasks.
            </p>

            <p>
              The program included hands-on experience with front-end and back-end web development tools, collaboration with project teams,
              and regular participation in code reviews and technical discussions — all designed to enhance practical skills and real-world development capabilities.
            </p>

            <p>
              We appreciate the learner’s contribution and wish them continued success in their future endeavors.
            </p>

            {/* Add Completed On & Certificate ID inside the body as requested */}
            <div className="mt-6">
              <p className="font-semibold">Completed On:</p>
              <p className="mb-2">{end}</p>
              <p className="font-semibold">Certificate ID:</p>
              <p className="font-mono">{certId}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => (state.courseId ? navigate(-1) : navigate(`/`))}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Course Certificate</h1>
                <p className="text-sm text-gray-600">Generate and download your course completion certificate</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-600 text-white">
                <Award className="h-4 w-4 mr-1" />
                Certificate of Completion
              </Badge>

              {/* Only Download buttons remain */}
              <Button onClick={handleDownloadPDF} disabled={generating || !certificate} className="bg-green-600 hover:bg-green-700 px-3 py-2">
                {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4" />}
              </Button>
              <Button onClick={handleDownloadPNG} className="px-3 py-2">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Input area if courseId was not provided */}
          {!state.courseId && !certificate && (
            <div className="mb-6 p-4 bg-white rounded-md shadow-sm">
              <p className="text-sm text-gray-600 mb-3">
                Enter the courseId (provided by the system) to generate your certificate. Normally this page is reached from the course learning flow and the ID is supplied automatically.
              </p>
              <div className="flex gap-2">
                <input
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Course ID (e.g. COURSE_799200)"
                  value={courseIdInput}
                  onChange={(e) => setCourseIdInput(e.target.value)}
                />
                <Button onClick={handleGenerate} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate"}
                </Button>
              </div>
              {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            </div>
          )}

          {/* Loader */}
          {loading && !certificate && (
            <div className="p-8 bg-white rounded-md shadow text-center">
              <Loader2 className="h-8 w-8 text-green-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Generating your certificate…</p>
            </div>
          )}

          {/* Certificate Info Card */}
          {certificate && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-green-600" />
                  Certificate Details
                </CardTitle>
                <CardDescription>
                  Your achievement details and certificate information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Student Name</p>
                      <p className="text-lg font-semibold text-gray-900">{certificate.studentName}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Course</p>
                      <p className="text-lg font-semibold text-gray-900">{certificate.courseName}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Building className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Provider</p>
                      <p className="text-lg font-semibold text-gray-900">Pack365</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completed On</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {certificate.completedDate || "12/2/2025"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Certificate ID</p>
                      <p className="text-lg font-semibold text-gray-900">{formattedCertificateId() || "COURSE_386337"}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Award className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Stream</p>
                      <p className="text-lg font-semibold text-gray-900">{certificate.stream || "—"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions (only downloads available) */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={handleDownloadPDF}
                  disabled={generating || !certificate}
                  className="bg-green-600 hover:bg-green-700 px-8"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download Certificate (PDF)
                    </>
                  )}
                </Button>

                <Button onClick={handleDownloadPNG} disabled={!certificate} className="px-8">
                  <Download className="h-4 w-4 mr-2" />
                  Download PNG
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Certificate Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Certificate Preview</CardTitle>
              <CardDescription>This is a preview of your digital certificate</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center p-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white shadow-lg">
                <div ref={previewRef} className="origin-top">
                  {/* Certificate visual - centered content vertically and horizontally.
                      Removed first-image/top duplicate sections and removed the 3rd image block.
                      Phone/contact is hidden; mail displayed; Completed On & Certificate ID added in body. */}
                  <div
                    ref={certRef}
                    className="certificate-container bg-white relative flex items-center justify-center"
                    style={{
                      width: "794px",
                      height: "1123px",
                      backgroundImage: "url(/lovable-uploads/certificate-bg.jpg)",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  >
                    {/* The inner overlay ensures content sits centered in the middle of the certificate */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-auto" style={{ maxHeight: "86%" }}>
                        {/* Single unified body centered */}
                        {certificate && <Pack365CourseBody certificate={certificate} providerName={undefined} />}

                        {/* Bottom area: left mail only, right signature (no phone number). Properly aligned and spaced. */}
                        <div className="mt-6 px-12">
                          <div className="flex justify-between items-end text-sm text-gray-700">
                            <div className="text-left">
                              <div>
                                <p className="font-semibold">Mail id :</p>
                                <p className="mb-1">{certificate?.email || "navi@gmail.com"}</p>
                              </div>
                              {/* phone intentionally not displayed */}
                            </div>

                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-800">KISSHORE KUMAAR</p>
                              <p className="text-xs text-gray-500">Founder & Director - Triaright</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Print styles to ensure background prints if allowed */}
                    <style>{`
                      @media print {
                        .certificate-container {
                          width: 100% !important;
                          height: 100% !important;
                          margin: 0 !important;
                          padding: 0 !important;
                          border: none !important;
                          background-image: url(/lovable-uploads/certificate-bg.jpg) !important;
                          background-size: cover !important;
                          background-position: center !important;
                          background-repeat: no-repeat !important;
                          -webkit-print-color-adjust: exact !important;
                          print-color-adjust: exact !important;
                        }
                      }
                    `}</style>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Info */}
          {certificate && (
            <Card className="mt-6">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Certificate Verification</h3>
                  <p className="text-gray-600 mb-4">
                    This certificate can be verified using the Certificate ID:{" "}
                    <span className="font-mono font-bold text-green-600">{formattedCertificateId() || "COURSE_386337"}</span>
                  </p>
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                    Issued by Pack365 • Verified Completion
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* If no certificate and no state and not loading show hint */}
          {!certificate && !loading && state.courseId && (
            <div className="mt-6 p-4 bg-white rounded-md shadow-sm text-sm text-gray-600">
              <p>
                If you arrived here from the course page, the certificate should generate automatically. If you still
                see this message, try reloading the page or contact support.
              </p>
            </div>
          )}

          {/* Error / Not available */}
          {(!certificate && !loading && error) && (
            <div className="mt-6">
              <Card className="text-center py-8">
                <CardContent>
                  <div className="w-24 h-24 bg-gradient-to-r from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="h-12 w-12 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Error Loading Certificate</h3>
                  <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">{error}</p>
                  <div className="flex justify-center space-x-4">
                    <Button onClick={() => navigate(-1)} variant="outline">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Go Back
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Pack365CertificatePage;
