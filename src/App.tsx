
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Register from "./pages/Register";
import RecordedCourses from "./pages/RecordedCourses";
import OnlineInternships from "./pages/OnlineInternships";
import OfflineInternships from "./pages/OfflineInternships";
import JobAssurance from "./pages/JobAssurance";
import JobAssistance from "./pages/JobAssistance";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/register" element={<Register />} />
          <Route path="/courses/recorded" element={<RecordedCourses />} />
          <Route path="/internships/online" element={<OnlineInternships />} />
          <Route path="/internships/offline" element={<OfflineInternships />} />
          <Route path="/jobs/assurance" element={<JobAssurance />} />
          <Route path="/jobs/assistance" element={<JobAssistance />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
