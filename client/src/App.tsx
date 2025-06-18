import { Switch, Route, useLocation } from "wouter";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { UserProtectedRoute } from "@/components/UserProtectedRoute";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { AdminRedirect } from "@/components/AdminRedirect";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Landing from "@/pages/Landing";
import AuthPage from "@/pages/auth-page";

// Lazy load heavy components for better initial performance
const VisaAnalyzer = lazy(() => import("@/pages/VisaAnalyzer"));
const AnalysisHistory = lazy(() => import("@/pages/AnalysisHistory"));
const ConsultationsPage = lazy(() => import("@/pages/consultations"));
const UpdatesPage = lazy(() => import("@/pages/updates"));
const DocumentTemplates = lazy(() => import("@/pages/document-templates"));
const DocumentChecklist = lazy(() => import("@/pages/document-checklist"));
const EnrollmentAnalysis = lazy(() => import("@/pages/EnrollmentAnalysis"));
const AdminDashboard = lazy(() => import("@/pages/admin-dashboard"));
const AdminAnalyses = lazy(() => import("@/pages/admin-analyses"));
const AdminAppointments = lazy(() => import("@/pages/admin-appointments"));
const AdminUsers = lazy(() => import("@/pages/admin-users"));
const AdminProfessionalApplications = lazy(() => import("@/pages/admin-professional-applications"));
const AdminUpdates = lazy(() => import("@/pages/admin-updates"));
const AdminSettings = lazy(() => import("@/pages/admin-settings"));
const AdminDocumentTemplates = lazy(() => import("@/pages/admin-document-templates"));
const AdminDocumentChecklists = lazy(() => import("@/pages/admin-document-checklists"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

function Router() {
  // HomePage component that routes users to their appropriate dashboard
  function HomePage() {
    const { user, isLoading } = useAuth();
    
    if (isLoading) {
      return <LoadingFallback />;
    }
    
    if (user?.role === 'admin') {
      return <AdminRedirect />;
    }
    
    if (user) {
      return <Home />;
    }
    
    return <Landing />;
  }
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/auth" component={AuthPage} />
      
      {/* Home Route - Shows Landing for guests, Dashboard for authenticated users */}
      <Route path="/" component={HomePage} />
      
      {/* User Routes - Only accessible by regular users */}
      <Route path="/analyzer">
        <UserProtectedRoute path="/analyzer" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <VisaAnalyzer />
          </Suspense>
        )} />
      </Route>
      <Route path="/history">
        <UserProtectedRoute path="/history" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AnalysisHistory />
          </Suspense>
        )} />
      </Route>
      <Route path="/consultations">
        <UserProtectedRoute path="/consultations" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <ConsultationsPage />
          </Suspense>
        )} />
      </Route>
      <Route path="/updates">
        <UserProtectedRoute path="/updates" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <UpdatesPage />
          </Suspense>
        )} />
      </Route>
      <Route path="/document-templates">
        <UserProtectedRoute path="/document-templates" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <DocumentTemplates />
          </Suspense>
        )} />
      </Route>
      <Route path="/document-checklist">
        <UserProtectedRoute path="/document-checklist" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <DocumentChecklist />
          </Suspense>
        )} />
      </Route>
      
      {/* Admin Routes - Only accessible by admin users */}
      <Route path="/admin">
        <AdminProtectedRoute path="/admin" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminDashboard />
          </Suspense>
        )} />
      </Route>
      <Route path="/admin/users">
        <AdminProtectedRoute path="/admin/users" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminUsers />
          </Suspense>
        )} />
      </Route>
      <Route path="/admin/analyses">
        <AdminProtectedRoute path="/admin/analyses" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminAnalyses />
          </Suspense>
        )} />
      </Route>
      <Route path="/admin/appointments">
        <AdminProtectedRoute path="/admin/appointments" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminAppointments />
          </Suspense>
        )} />
      </Route>
      <Route path="/admin/professional-applications">
        <AdminProtectedRoute path="/admin/professional-applications" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminProfessionalApplications />
          </Suspense>
        )} />
      </Route>
      <Route path="/admin/updates">
        <AdminProtectedRoute path="/admin/updates" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminUpdates />
          </Suspense>
        )} />
      </Route>
      <Route path="/admin/settings">
        <AdminProtectedRoute path="/admin/settings" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminSettings />
          </Suspense>
        )} />
      </Route>
      <Route path="/admin/document-templates">
        <AdminProtectedRoute path="/admin/document-templates" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminDocumentTemplates />
          </Suspense>
        )} />
      </Route>
      <Route path="/admin/document-checklists">
        <AdminProtectedRoute path="/admin/document-checklists" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminDocumentChecklists />
          </Suspense>
        )} />
      </Route>
      
      {/* 404 Route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Router />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
