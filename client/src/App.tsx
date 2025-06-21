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
import SimplifiedAuth from "@/components/SimplifiedAuth";

// Lazy load heavy components for better initial performance
const VisaAnalyzer = lazy(() => import("@/pages/VisaAnalyzer"));
const AnalysisHistory = lazy(() => import("@/pages/AnalysisHistory"));
const AnalysisHub = lazy(() => import("@/pages/AnalysisHub"));
const MyAnalysis = lazy(() => import("@/pages/MyAnalysis"));
const VisaRejectionAnalysis = lazy(() => import("@/pages/VisaRejectionAnalysis"));
const EnrollmentAnalysis = lazy(() => import("@/pages/EnrollmentAnalysis"));
const CoEAnalysis = lazy(() => import("@/pages/CoEAnalysis"));
const COEAnalysisView = lazy(() => import("@/pages/COEAnalysisView"));
const OfferLetterAnalysis = lazy(() => import("@/pages/OfferLetterAnalysis"));
const OfferLetterAnalysisView = lazy(() => import("@/pages/OfferLetterAnalysisView_comprehensive"));
const ComprehensiveOfferLetterAnalysis = lazy(() => import("@/pages/ComprehensiveOfferLetterAnalysisSimplified"));
const OfferLetterAnalysisDisplay = lazy(() => import("@/pages/OfferLetterAnalysisDisplay"));
const VisaAnalysisView = lazy(() => import("@/pages/VisaAnalysisView"));
const ScholarshipResearch = lazy(() => import("@/pages/ScholarshipResearch"));
const UserVisaAnalysisView = lazy(() => import("@/pages/UserVisaAnalysisView"));
const EnrollmentAnalysisResults = lazy(() => import("@/pages/EnrollmentAnalysisResults"));
const VisaAnalysisResults = lazy(() => import("@/pages/VisaAnalysisResults"));
const ConsultationsPage = lazy(() => import("@/pages/consultations"));
const UpdatesPage = lazy(() => import("@/pages/updates"));
const DocumentTemplates = lazy(() => import("@/pages/document-templates"));
const DocumentChecklist = lazy(() => import("@/pages/document-checklist"));
const AdminDashboard = lazy(() => import("@/pages/admin-dashboard"));
const AdminAnalyses = lazy(() => import("@/pages/admin-analyses"));
const AdminAppointments = lazy(() => import("@/pages/admin-appointments"));
const AdminUsers = lazy(() => import("@/pages/admin-users"));
const AdminProfessionalApplications = lazy(() => import("@/pages/admin-professional-applications"));
const AdminUpdates = lazy(() => import("@/pages/admin-updates"));
const AdminSettings = lazy(() => import("@/pages/admin-settings"));
const AdminDocumentTemplates = lazy(() => import("@/pages/admin-document-templates"));
const AdminDocumentChecklists = lazy(() => import("@/pages/admin-document-checklists"));
const AdminFeedback = lazy(() => import("@/pages/admin-feedback"));
const AdminOfferLetterAnalysisView = lazy(() => import("@/pages/AdminOfferLetterAnalysisView"));
const AdminInformationReports = lazy(() => import("@/pages/admin/InformationReports"));
const AdminOfferLetterDetails = lazy(() => import("@/pages/admin/OfferLetterDetails"));
const AdminCoeDetails = lazy(() => import("@/pages/admin/CoeDetailsNew"));
const AdminOfferLetterInformation = lazy(() => import("@/pages/AdminOfferLetterInformation"));
const AdminCoeInformation = lazy(() => import("@/pages/AdminCoeInformation"));
const StudyDestinationSuggestions = lazy(() => import("@/pages/StudyDestinationSuggestions"));
const DestinationSuggestionDetail = lazy(() => import("@/pages/DestinationSuggestionDetail"));
const PersonalizedDestinationAnalysis = lazy(() => import("@/pages/PersonalizedDestinationAnalysis"));
const EnhancedUserProfile = lazy(() => import("@/pages/EnhancedUserProfile"));
const ProfileEdit = lazy(() => import("@/pages/ProfileEdit"));
const ProfilePageRedesign = lazy(() => import("@/components/ProfilePageRedesign"));
const OfferLetterInfo = lazy(() => import("@/pages/OfferLetterInfo"));
const OfferLetterDetails = lazy(() => import("@/pages/OfferLetterDetails"));
const OfferLetterInformation = lazy(() => import("@/pages/OfferLetterInformation"));
const OfferLetterAnalysisRevamped = lazy(() => import("@/pages/OfferLetterAnalysisRevamped"));
const OfferLetterDetailsNew = lazy(() => import("@/pages/OfferLetterDetailsNew"));
const CoeInformation = lazy(() => import("@/pages/CoeInformation"));
const CoeDetails = lazy(() => import("@/pages/CoeDetailsNew"));

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
      <Route path="/auth" component={SimplifiedAuth} />
      
      {/* Home Route - Shows Landing for guests, Dashboard for authenticated users */}
      <Route path="/" component={HomePage} />
      
      {/* User Routes - Only accessible by regular users */}
      <Route path="/my-analysis">
        <UserProtectedRoute path="/my-analysis" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AnalysisHub />
          </Suspense>
        )} />
      </Route>
      <Route path="/visa-analysis">
        <UserProtectedRoute path="/visa-analysis" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <VisaRejectionAnalysis />
          </Suspense>
        )} />
      </Route>
      <Route path="/enrollment-analysis">
        <UserProtectedRoute path="/enrollment-analysis" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <EnrollmentAnalysis />
          </Suspense>
        )} />
      </Route>
      <Route path="/coe-analysis">
        <UserProtectedRoute path="/coe-analysis" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <CoEAnalysis />
          </Suspense>
        )} />
      </Route>
      <Route path="/coe-analysis/:id">
        <UserProtectedRoute path="/coe-analysis/:id" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <COEAnalysisView />
          </Suspense>
        )} />
      </Route>
      <Route path="/offer-letter-analysis">
        <UserProtectedRoute path="/offer-letter-analysis" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <ComprehensiveOfferLetterAnalysis />
          </Suspense>
        )} />
      </Route>
      <Route path="/offer-letter-analysis/:id">
        {(params) => (
          <UserProtectedRoute path="/offer-letter-analysis/:id" component={() => (
            <Suspense fallback={<LoadingFallback />}>
              <OfferLetterAnalysisDisplay params={params} />
            </Suspense>
          )} />
        )}
      </Route>
      <Route path="/scholarship-research">
        <UserProtectedRoute path="/scholarship-research" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <ScholarshipResearch />
          </Suspense>
        )} />
      </Route>
      <Route path="/destination-suggestions">
        <UserProtectedRoute path="/destination-suggestions" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <StudyDestinationSuggestions />
          </Suspense>
        )} />
      </Route>
      <Route path="/destination-suggestions/:id">
        <UserProtectedRoute path="/destination-suggestions/:id" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <DestinationSuggestionDetail />
          </Suspense>
        )} />
      </Route>
      <Route path="/personalized-destination-analysis">
        <UserProtectedRoute path="/personalized-destination-analysis" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <PersonalizedDestinationAnalysis />
          </Suspense>
        )} />
      </Route>
      <Route path="/personalized-destination-analysis/:id">
        <UserProtectedRoute path="/personalized-destination-analysis/:id" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <PersonalizedDestinationAnalysis />
          </Suspense>
        )} />
      </Route>

      <Route path="/profile">
        <UserProtectedRoute path="/profile" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <ProfilePageRedesign />
          </Suspense>
        )} />
      </Route>
      <Route path="/offer-letter-info">
        <UserProtectedRoute path="/offer-letter-info" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <OfferLetterInfo />
          </Suspense>
        )} />
      </Route>
      <Route path="/offer-letter-info/:id">
        <UserProtectedRoute path="/offer-letter-info/:id" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <OfferLetterDetails />
          </Suspense>
        )} />
      </Route>
      <Route path="/coe-info">
        <UserProtectedRoute path="/coe-info" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <CoeInformation />
          </Suspense>
        )} />
      </Route>
      <Route path="/coe-info/:id">
        <UserProtectedRoute path="/coe-info/:id" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <CoeDetails />
          </Suspense>
        )} />
      </Route>
      <Route path="/offer-letter-information">
        <UserProtectedRoute path="/offer-letter-information" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <OfferLetterAnalysisRevamped />
          </Suspense>
        )} />
      </Route>
      <Route path="/offer-letter-details/:id">
        <UserProtectedRoute path="/offer-letter-details/:id" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <OfferLetterDetailsNew />
          </Suspense>
        )} />
      </Route>
      <Route path="/profile/edit">
        <UserProtectedRoute path="/profile/edit" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <ProfileEdit />
          </Suspense>
        )} />
      </Route>
      <Route path="/offer-letter-analysis/:id">
        <UserProtectedRoute path="/offer-letter-analysis/:id" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <OfferLetterAnalysisView />
          </Suspense>
        )} />
      </Route>
      <Route path="/visa-analysis/:id">
        <UserProtectedRoute path="/visa-analysis/:id" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <UserVisaAnalysisView />
          </Suspense>
        )} />
      </Route>
      <Route path="/enrollment-analysis-results/:id">
        <UserProtectedRoute path="/enrollment-analysis-results/:id" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <EnrollmentAnalysisResults />
          </Suspense>
        )} />
      </Route>
      <Route path="/visa-analysis-results/:id">
        <UserProtectedRoute path="/visa-analysis-results/:id" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <VisaAnalysisResults />
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
      <Route path="/enrollment-analysis">
        <UserProtectedRoute path="/enrollment-analysis" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <EnrollmentAnalysis />
          </Suspense>
        )} />
      </Route>
      <Route path="/my-analysis">
        <UserProtectedRoute path="/my-analysis" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AnalysisHub />
          </Suspense>
        )} />
      </Route>
      <Route path="/visa-analysis">
        <UserProtectedRoute path="/visa-analysis" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <VisaRejectionAnalysis />
          </Suspense>
        )} />
      </Route>
      <Route path="/visa-analysis/:id">
        <UserProtectedRoute path="/visa-analysis/:id" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <UserVisaAnalysisView />
          </Suspense>
        )} />
      </Route>
      <Route path="/analysis/:id">
        <UserProtectedRoute path="/analysis/:id" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <VisaAnalyzer />
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
      <Route path="/admin/feedback">
        <AdminProtectedRoute path="/admin/feedback" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminFeedback />
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
      <Route path="/admin/coe-analysis/:id">
        <AdminProtectedRoute path="/admin/coe-analysis/:id" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <COEAnalysisView />
          </Suspense>
        )} />
      </Route>
      <Route path="/admin/visa-analysis/:id">
        <AdminProtectedRoute path="/admin/visa-analysis/:id" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <VisaAnalysisView />
          </Suspense>
        )} />
      </Route>
      <Route path="/admin/offer-letter-analysis/:id">
        <AdminProtectedRoute path="/admin/offer-letter-analysis/:id" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminOfferLetterAnalysisView />
          </Suspense>
        )} />
      </Route>
      <Route path="/admin/offer-letter-information">
        <AdminProtectedRoute path="/admin/offer-letter-information" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminOfferLetterInformation />
          </Suspense>
        )} />
      </Route>
      <Route path="/admin/offer-letter-details/:id">
        <AdminProtectedRoute path="/admin/offer-letter-details/:id" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <OfferLetterDetailsNew />
          </Suspense>
        )} />
      </Route>
      <Route path="/admin/coe-information">
        <AdminProtectedRoute path="/admin/coe-information" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminCoeInformation />
          </Suspense>
        )} />
      </Route>
      <Route path="/admin/offer-letter-details/:id">
        <AdminProtectedRoute path="/admin/offer-letter-details/:id" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminOfferLetterDetails />
          </Suspense>
        )} />
      </Route>
      <Route path="/admin/coe-details/:id">
        <AdminProtectedRoute path="/admin/coe-details/:id" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminCoeDetails />
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
