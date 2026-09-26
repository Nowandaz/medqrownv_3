import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider, useTheme } from "@/contexts/theme-context";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminExamDetail from "@/pages/admin/exam-detail";
import AdminSettings from "@/pages/admin/settings";
import AdminClasses from "@/pages/admin/classes";
import AdminClassDetail from "@/pages/admin/class-detail";
import AdminPayments from "@/pages/admin/payments";
import AdminWaitlist from "@/pages/admin/waitlist";
import AdminStudents from "@/pages/admin/students";
import AdminSite from "@/pages/admin/site";
import { TermsPage, PrivacyPage, FaqPage, InstitutionsPage } from "@/pages/landing/site-pages";
import StudentLogin from "@/pages/student/login";
import StudentSignup from "@/pages/student/signup";
import StudentVerifyEmail from "@/pages/student/verify-email";
import StudentAwaiting from "@/pages/student/awaiting";
import StudentForgotPassword from "@/pages/student/forgot-password";
import StudentResetPassword from "@/pages/student/reset-password";
import StudentSetPassword from "@/pages/student/set-password";
import StudentInstructions from "@/pages/student/instructions";
import StudentExam from "@/pages/student/exam";
import StudentExamReview from "@/pages/student/exam-review";

// Student Shell & Pages
import { StudentShell } from "@/components/student/student-shell";
import StudentDashboard from "@/pages/student/dashboard";
import StudentMyClass from "@/pages/student/my-class";
import StudentResults from "@/pages/student/results";
import StudentProfile from "@/pages/student/profile";
import StudentSelfTests from "@/pages/student/self-tests";
import StudentSelfTestRun from "@/pages/student/self-test-run";
import StudentSelfTestResults from "@/pages/student/self-test-results";
import StudentLiveRooms from "@/pages/student/live-rooms";
import StudentLiveRoom from "@/pages/student/live-room";
import LiveQuizShare from "@/pages/student/live-quiz-share";
import LiveRoomJoin from "@/pages/student/live-room-join";
import { FEATURES } from "@/lib/feature-flags";

function DashboardRedirect({ to }: { to: string }) {
  const [, setLocation] = useLocation();
  useEffect(() => setLocation(to), [setLocation, to]);
  return null;
}

function StudentRoutes() {
  return (
    <StudentShell>
      <Switch>
        <Route path="/student/dashboard" component={StudentDashboard} />
        <Route path="/student/my-class" component={StudentMyClass} />
        <Route path="/student/results" component={StudentResults} />
        <Route path="/student/profile" component={StudentProfile} />
        
        <Route path="/student/classes/:id" component={() => <DashboardRedirect to="/student/my-class" />} />
        <Route path="/student/past-exams" component={() => <DashboardRedirect to="/student/results" />} />
        <Route path="/student/past-exams/:id" component={() => <DashboardRedirect to="/student/results" />} />
        <Route path="/student/stats" component={() => <DashboardRedirect to="/student/results" />} />
        <Route path="/student/units" component={() => <DashboardRedirect to="/student/dashboard" />} />
        <Route path="/student/units/:id" component={() => <DashboardRedirect to="/student/dashboard" />} />
        <Route component={NotFound} />
      </Switch>
    </StudentShell>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/portal" component={StudentLogin} />
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/exams/:id" component={AdminExamDetail} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/classes" component={AdminClasses} />
      <Route path="/admin/classes/:id" component={AdminClassDetail} />
      <Route path="/admin/payments" component={AdminPayments} />
      <Route path="/admin/waitlist" component={AdminWaitlist} />
      <Route path="/admin/students" component={AdminStudents} />
      <Route path="/admin/site" component={AdminSite} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/faq" component={FaqPage} />
      <Route path="/institutions" component={FEATURES.institutions ? InstitutionsPage : () => <DashboardRedirect to="/" />} />
      <Route path="/student/signup" component={FEATURES.publicSignup ? StudentSignup : () => <DashboardRedirect to="/portal" />} />
      <Route path="/student/verify" component={FEATURES.publicSignup ? StudentVerifyEmail : () => <DashboardRedirect to="/portal" />} />
      <Route path="/student/awaiting" component={FEATURES.publicSignup ? StudentAwaiting : () => <DashboardRedirect to="/portal" />} />
      <Route path="/student/forgot-password" component={StudentForgotPassword} />
      <Route path="/student/reset-password" component={StudentResetPassword} />
      <Route path="/student/set-password/:token" component={StudentSetPassword} />
      <Route path="/student/instructions" component={StudentInstructions} />
      <Route path="/student/exam" component={StudentExam} />
      <Route path="/student/exam-review" component={StudentExamReview} />
      <Route path="/student/self-tests/:id/run" component={FEATURES.studentSelfTests ? StudentSelfTestRun : () => <DashboardRedirect to="/student/dashboard" />} />
      <Route path="/student/self-tests/:id/results" component={FEATURES.studentSelfTests ? StudentSelfTestResults : () => <DashboardRedirect to="/student/dashboard" />} />
       <Route path="/student/live-rooms/share/:token" component={FEATURES.studentLiveRooms ? LiveQuizShare : () => <DashboardRedirect to="/student/dashboard" />} />
       <Route path="/student/live-rooms/:id" component={FEATURES.studentLiveRooms ? StudentLiveRoom : () => <DashboardRedirect to="/student/dashboard" />} />
       <Route path="/join/:roomCode" component={FEATURES.studentLiveRooms ? LiveRoomJoin : () => <DashboardRedirect to="/student/dashboard" />} />
      
      {/* Nested Shell Routes */}
      <Route path="/student/dashboard" component={StudentRoutes} />
      <Route path="/student/my-class" component={StudentRoutes} />
      <Route path="/student/results" component={StudentRoutes} />
      <Route path="/student/profile" component={StudentRoutes} />
      
      <Route path="/student/classes/:id" component={StudentRoutes} />
      <Route path="/student/units" component={StudentRoutes} />
      <Route path="/student/units/:id" component={StudentRoutes} />
      <Route path="/student/past-exams" component={StudentRoutes} />
      <Route path="/student/past-exams/:id" component={StudentRoutes} />
      <Route path="/student/stats" component={StudentRoutes} />
      <Route path="/student/self-tests" component={FEATURES.studentSelfTests ? StudentRoutes : () => <DashboardRedirect to="/student/dashboard" />} />
        <Route path="/student/live-rooms" component={FEATURES.studentLiveRooms ? StudentRoutes : () => <DashboardRedirect to="/student/dashboard" />} />
      <Route path="/student/profile" component={StudentRoutes} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="fixed top-3 right-20 sm:top-auto sm:right-5 sm:bottom-5 z-[9999] h-11 w-11 rounded-full shadow-xl border-2 border-primary/30 bg-card hover:bg-muted flex items-center justify-center transition-colors"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark"
        ? <Sun className="w-5 h-5 text-primary" />
        : <Moon className="w-5 h-5 text-primary" />}
    </button>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
          <ThemeToggle />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
