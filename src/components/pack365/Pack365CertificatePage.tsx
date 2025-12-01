import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Loader2, Download, Printer, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


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

  useEffect(() => {
    // If a courseId was supplied in navigation state, fetch automatically
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
        enrollmentDate: payload.enrollmentDate ? new Date(payload.enrollmentDate).toLocaleDateString() : undefined,
        completedDate: payload.completedDate ? new Date(payload.completedDate).toLocaleDateString() : (completedDate ? new Date(completedDate).toLocaleDateString() : new Date().toLocaleDateString()),
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

  const handlePrint = () => {
    if (!certRef.current) {
      window.print();
      return;
    }

    // Open printable window with certificate HTML to ensure clean print
    const html = certRef.current.outerHTML;
    const style = `
      <style>
        @page { size: A4 landscape; margin: 20mm; }
        body { font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; padding: 0; margin: 0; background: #fff; }
      </style>
    `;
    const w = window.open("", "_blank");
    if (!w) {
      toast({ title: "Blocked", description: "Popup blocked. Allow popups to print.", variant: "destructive" });
      return;
    }
    w.document.write(`<!doctype html><html><head><meta charset="utf-8" /><title>Certificate</title>${style}</head><body>${html}</body></html>`);
    w.document.close();
    // give browser a moment before printing
    setTimeout(() => {
      w.print();
      // optional close
      // w.close();
    }, 500);
  };

  const handleDownloadPNG = async () => {
    if (!certRef.current) {
      toast({ title: "Unavailable", description: "Certificate not rendered", variant: "destructive" });
      return;
    }

    // html2canvas might not be included in the project; check before using
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

  const formattedCertificateId = () => {
    // Build a readable id using enrollmentId (if available) + courseId
    const cid = certificate?.courseId || courseIdInput || "UNKNOWN";
    const eid = enrollmentId || state.enrollmentId || "";
    return eid ? `${eid}-${cid}` : cid;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Course Certificate</h1>
              <p className="text-sm text-gray-500">Generate and download your course completion certificate</p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={handlePrint} variant="default">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button onClick={handleDownloadPNG} variant="secondary">
                <Download className="h-4 w-4 mr-2" />
                Download PNG
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
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Generating your certificate…</p>
            </div>
          )}

          {/* Certificate Render */}
          {certificate && (
            <div ref={certRef} className="bg-white border-4 border-dashed border-gray-200 p-8 rounded-md shadow-md">
              <div className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 text-white p-6 rounded-md text-center">
                <h2 className="text-3xl font-extrabold tracking-tight">Certificate of Completion</h2>
                <p className="mt-1 text-sm opacity-90">This certifies that</p>
                <h3 className="mt-4 text-2xl font-semibold">{certificate.studentName}</h3>
                <p className="mt-2 text-sm opacity-90">has successfully completed the course</p>
                <h4 className="mt-3 text-xl font-medium">{certificate.courseName}</h4>
                {certificate.stream && <p className="mt-2 text-sm opacity-90">{certificate.stream} Stream</p>}
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="col-span-2 space-y-2">
                  <p className="text-sm text-gray-700"><strong>Course ID:</strong> {certificate.courseId}</p>
                  {certificate.courseDescription && (
                    <p className="text-sm text-gray-700">{certificate.courseDescription}</p>
                  )}
                  <p className="text-sm text-gray-700"><strong>Enrollment Date:</strong> {certificate.enrollmentDate || "N/A"}</p>
                  <p className="text-sm text-gray-700"><strong>Completed On:</strong> {certificate.completedDate || new Date().toLocaleDateString()}</p>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div className="w-32 h-32 bg-white border rounded-md flex items-center justify-center">
                    {/* Placeholder for signature / logo */}
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Authorized By</p>
                      <p className="font-semibold">Pack365</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
                <div>
                  <p><strong>Certificate ID:</strong> {formattedCertificateId()}</p>
                  {certificate.email && <p><strong>Email:</strong> {certificate.email}</p>}
                  {certificate.phoneNumber && <p><strong>Phone:</strong> {certificate.phoneNumber}</p>}
                </div>

                <div className="text-right">
                  <p>Issued by</p>
                  <p className="font-semibold">Pack365 Team</p>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <Button onClick={handlePrint} variant="default">
                  <Printer className="h-4 w-4 mr-2" />
                  Print / Save as PDF
                </Button>
                <Button onClick={handleDownloadPNG} variant="secondary">
                  <Download className="h-4 w-4 mr-2" />
                  Download PNG
                </Button>
              </div>
            </div>
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
        </div>
      </div>
    </>
  );
};

export default Pack365CertificatePage;
