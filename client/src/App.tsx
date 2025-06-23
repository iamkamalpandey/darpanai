import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { UserProtectedRoute } from "@/components/UserProtectedRoute";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { AdminRedirect } from "@/components/AdminRedirect";
import NotFound from "@/pages/not-found";
import SimplifiedAuth from "@/components/SimplifiedAuth";
import { queryClient } from "./lib/queryClient";

// --- Add these imports for the drag-and-drop fix ---
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
// --- End of new imports ---

// New redesigned components
const StudentAIDashboard = lazy(() => import("@/pages/StudentAIDashboard"));
const EducationLanding = lazy(() => import("@/pages/EducationLanding"));

// Lazy load heavy components for better initial performance
const VisaAnalyzer = lazy(() => import("@/pages/VisaAnalyzer"));
const AnalysisHub = lazy(() => import("@/pages/AnalysisHub"));
const VisaRejectionAnalysis = lazy(
  () => import("@/pages/VisaRejectionAnalysis"),
);
const EnrollmentAnalysis = lazy(() => import("@/pages/EnrollmentAnalysis"));
const CoEAnalysis = lazy(() => import("@/pages/CoEAnalysis"));
const COEAnalysisView = lazy(() => import("@/pages/COEAnalysisView"));
const ComprehensiveOfferLetterAnalysis = lazy(
  () => import("@/pages/ComprehensiveOfferLetterAnalysisSimplified"),
);
const OfferLetterAnalysisDisplay = lazy(
  () => import("@/pages/OfferLetterAnalysisDisplay"),
);
const VisaAnalysisView = lazy(() => import("@/pages/VisaAnalysisView"));
const ScholarshipResearch = lazy(() => import("@/pages/ScholarshipResearch"));
const UserVisaAnalysisView = lazy(() => import("@/pages/UserVisaAnalysisView"));
const EnrollmentAnalysisResults = lazy(
  () => import("@/pages/EnrollmentAnalysisResults"),
);
const VisaAnalysisResults = lazy(() => import("@/pages/VisaAnalysisResults"));
const ConsultationsPage = lazy(() => import("@/pages/consultations"));
const UpdatesPage = lazy(() => import("@/pages/updates"));
const DocumentTemplates = lazy(() => import("@/pages/document-templates"));
const DocumentChecklist = lazy(() => import("@/pages/document-checklist"));
const AdminDashboard = lazy(() => import("@/pages/admin-dashboard"));
const AdminAnalyses = lazy(() => import("@/pages/admin-analyses"));
const ScholarshipManagement = lazy(
  () => import("@/pages/admin/ScholarshipManagement"),
);
const ScholarshipCreate = lazy(() => import("@/pages/admin/ScholarshipCreate"));
const ScholarshipDetailsRedesign = lazy(
  () => import("@/pages/admin/ScholarshipDetailsRedesign"),
);
const ScholarshipEdit = lazy(() => import("@/pages/admin/ScholarshipEdit"));
const AdminAppointments = lazy(() => import("@/pages/admin-appointments"));
const AdminUsers = lazy(() => import("@/pages/admin-users"));
const AdminProfessionalApplications = lazy(
  () => import("@/pages/admin-professional-applications"),
);
const AdminUpdates = lazy(() => import("@/pages/admin-updates"));
const AdminSettings = lazy(() => import("@/pages/admin-settings"));
const AdminDocumentTemplates = lazy(
  () => import("@/pages/admin-document-templates"),
);
const AdminDocumentChecklists = lazy(
  () => import("@/pages/admin-document-checklists"),
);
const AdminFeedback = lazy(() => import("@/pages/admin-feedback"));
const AdminOfferLetterAnalysisView = lazy(
  () => import("@/pages/AdminOfferLetterAnalysisView"),
);
const AdminInformationReports = lazy(
  () => import("@/pages/admin/InformationReports"),
);
const AdminOfferLetterDetails = lazy(
  () => import("@/pages/admin/AdminOfferLetterDetails"),
);
const AdminCoeDetails = lazy(() => import("@/pages/admin/CoeDetailsNew"));
const StudyDestinationSuggestions = lazy(
  () => import("@/pages/StudyDestinationSuggestions"),
);
const DestinationSuggestionDetail = lazy(
  () => import("@/pages/DestinationSuggestionDetail"),
);
const PersonalizedDestinationAnalysis = lazy(
  () => import("@/pages/PersonalizedDestinationAnalysis"),
);
const ProfileEdit = lazy(() => import("@/pages/ProfileEdit"));
const ProfilePageRedesign = lazy(
  () => import("@/components/ProfilePageRedesign"),
);
const OfferLetterInfo = lazy(() => import("@/pages/OfferLetterInfo"));
const OfferLetterDetails = lazy(() => import("@/pages/OfferLetterDetails"));
const CoeInformation = lazy(() => import("@/pages/CoeInformation"));
const CoeDetails = lazy(() => import("@/pages/CoeDetailsNew"));
const UserCoeDetails = lazy(() => import("@/pages/UserCoeDetails"));
const AdminOfferLetterInfo = lazy(
  () => import("@/pages/admin/AdminOfferLetterInfo"),
);
const UserAdminCoeDetails = lazy(() => import("@/pages/UserAdminCoeDetails"));
const OfferLetterAnalysisView = lazy(
  () => import("@/pages/OfferLetterAnalysisView_comprehensive"),
);

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
  </div>
);

function Router() {
  // HomePage component that routes users to their appropriate dashboard
  function HomePage() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
      return <LoadingFallback />;
    }

    if (user?.role === "admin") {
      return <AdminRedirect />;
    }

    if (user) {
      return (
        <Suspense fallback={<LoadingFallback />}>
          <StudentAIDashboard />
        </Suspense>
      );
    }

    return (
      <Suspense fallback={<LoadingFallback />}>
        <EducationLanding />
      </Suspense>
    );
  }

  return (
    <Switch>
      {/* Public Authentication Routes */}
      <Route path="/auth" component={SimplifiedAuth} />
      <Route path="/login" component={SimplifiedAuth} />
      <Route path="/register" component={SimplifiedAuth} />

      {/* Home Route */}
      <Route path="/" component={HomePage} />

      {/* User Routes */}
      <Route path="/my-analysis">
        <UserProtectedRoute
          path="/my-analysis"
          component={() => (
            <Suspense fallback={<LoadingFallback />}>
              <AnalysisHub />
            </Suspense>
          )}
        />
      </Route>
      <Route path="/visa-analysis">
        <UserProtectedRoute
          path="/visa-analysis"
          component={() => (
            <Suspense fallback={<LoadingFallback />}>
              <VisaRejectionAnalysis />
            </Suspense>
          )}
        />
      </Route>
      <Route path="/enrollment-analysis">
        <UserProtectedRoute
          path="/enrollment-analysis"
          component={() => (
            <Suspense fallback={<LoadingFallback />}>
              <EnrollmentAnalysis />
            </Suspense>
          )}
        />
      </Route>
      <Route path="/coe-analysis">
        <UserProtectedRoute
          path="/coe-analysis"
          component={() => (
            <Suspense fallback={<LoadingFallback />}>
              <CoEAnalysis />
            </Suspense>
          )}
        />
      </Route>
      <Route path="/coe-analysis/:id">
        <UserProtectedRoute
          path="/coe-analysis/:id"
          component={COEAnalysisView}
        />
      </Route>
      <Route path="/offer-letter-analysis">
        <UserProtectedRoute
          path="/offer-letter-analysis"
          component={() => (
            <Suspense fallback={<LoadingFallback />}>
              <ComprehensiveOfferLetterAnalysis />
            </Suspense>
          )}
        />
      </Route>
      <Route path="/offer-letter-analysis/:id">
        {(params) => (
          <UserProtectedRoute
            path="/offer-letter-analysis/:id"
            component={() => (
              <Suspense fallback={<LoadingFallback />}>
                <OfferLetterAnalysisDisplay params={params} />
              </Suspense>
            )}
          />
        )}
      </Route>
      <Route path="/scholarship-research">
        <UserProtectedRoute
          path="/scholarship-research"
          component={() => (
            <Suspense fallback={<LoadingFallback />}>
              <ScholarshipResearch />
            </Suspense>
          )}
        />
      </Route>
      <Route path="/destination-suggestions">
        <UserProtectedRoute
          path="/destination-suggestions"
          component={() => (
            <Suspense fallback={<LoadingFallback />}>
              <StudyDestinationSuggestions />
            </Suspense>
          )}
        />
      </Route>
      <Route path="/destination-suggestions/:id">
        <UserProtectedRoute
          path="/destination-suggestions/:id"
          component={DestinationSuggestionDetail}
        />
      </Route>
      <Route path="/personalized-destination-analysis">
        <UserProtectedRoute
          path="/personalized-destination-analysis"
          component={PersonalizedDestinationAnalysis}
        />
      </Route>
      <Route path="/personalized-destination-analysis/:id">
        <UserProtectedRoute
          path="/personalized-destination-analysis/:id"
          component={PersonalizedDestinationAnalysis}
        />
      </Route>
      <Route path="/profile">
        <UserProtectedRoute path="/profile" component={ProfilePageRedesign} />
      </Route>
      <Route path="/profile/edit">
        <UserProtectedRoute path="/profile/edit" component={ProfileEdit} />
      </Route>
      <Route path="/offer-letter-info">
        <UserProtectedRoute
          path="/offer-letter-info"
          component={OfferLetterInfo}
        />
      </Route>
      <Route path="/offer-letter-info/:id">
        <UserProtectedRoute
          path="/offer-letter-info/:id"
          component={OfferLetterDetails}
        />
      </Route>
      <Route path="/coe-info">
        <UserProtectedRoute path="/coe-info" component={CoeInformation} />
      </Route>
      <Route path="/coe-info/:id">
        <UserProtectedRoute path="/coe-info/:id" component={CoeDetails} />
      </Route>
      <Route path="/user-coe-details/:id">
        <UserProtectedRoute
          path="/user-coe-details/:id"
          component={UserCoeDetails}
        />
      </Route>
      <Route path="/visa-analysis/:id">
        <UserProtectedRoute
          path="/visa-analysis/:id"
          component={UserVisaAnalysisView}
        />
      </Route>
      <Route path="/enrollment-analysis-results/:id">
        <UserProtectedRoute
          path="/enrollment-analysis-results/:id"
          component={EnrollmentAnalysisResults}
        />
      </Route>
      <Route path="/visa-analysis-results/:id">
        <UserProtectedRoute
          path="/visa-analysis-results/:id"
          component={VisaAnalysisResults}
        />
      </Route>
      <Route path="/consultations">
        <UserProtectedRoute
          path="/consultations"
          component={ConsultationsPage}
        />
      </Route>
      <Route path="/updates">
        <UserProtectedRoute path="/updates" component={UpdatesPage} />
      </Route>
      <Route path="/document-templates">
        <UserProtectedRoute
          path="/document-templates"
          component={DocumentTemplates}
        />
      </Route>
      <Route path="/document-checklist">
        <UserProtectedRoute
          path="/document-checklist"
          component={DocumentChecklist}
        />
      </Route>
      <Route path="/analysis/:id">
        <UserProtectedRoute path="/analysis/:id" component={VisaAnalyzer} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin">
        <AdminProtectedRoute path="/admin" component={AdminDashboard} />
      </Route>
      <Route path="/admin/users">
        <AdminProtectedRoute path="/admin/users" component={AdminUsers} />
      </Route>
      <Route path="/admin/analyses">
        <AdminProtectedRoute path="/admin/analyses" component={AdminAnalyses} />
      </Route>
      <Route path="/admin/feedback">
        <AdminProtectedRoute path="/admin/feedback" component={AdminFeedback} />
      </Route>
      <Route path="/admin/appointments">
        <AdminProtectedRoute
          path="/admin/appointments"
          component={AdminAppointments}
        />
      </Route>
      <Route path="/admin/professional-applications">
        <AdminProtectedRoute
          path="/admin/professional-applications"
          component={AdminProfessionalApplications}
        />
      </Route>
      <Route path="/admin/scholarships">
        <AdminProtectedRoute
          path="/admin/scholarships"
          component={ScholarshipManagement}
        />
      </Route>
      <Route path="/admin/scholarships/create">
        <AdminProtectedRoute
          path="/admin/scholarships/create"
          component={ScholarshipCreate}
        />
      </Route>
      <Route path="/admin/scholarship-details/:id">
        <AdminProtectedRoute
          path="/admin/scholarship-details/:id"
          component={ScholarshipDetailsRedesign}
        />
      </Route>
      <Route path="/admin/scholarship/edit/:id">
        <AdminProtectedRoute
          path="/admin/scholarship/edit/:id"
          component={ScholarshipEdit}
        />
      </Route>
      <Route path="/admin/updates">
        <AdminProtectedRoute path="/admin/updates" component={AdminUpdates} />
      </Route>
      <Route path="/admin/settings">
        <AdminProtectedRoute path="/admin/settings" component={AdminSettings} />
      </Route>
      <Route path="/admin/document-templates">
        <AdminProtectedRoute
          path="/admin/document-templates"
          component={AdminDocumentTemplates}
        />
      </Route>
      <Route path="/admin/document-checklists">
        <AdminProtectedRoute
          path="/admin/document-checklists"
          component={AdminDocumentChecklists}
        />
      </Route>
      <Route path="/admin/offer-letter-info">
        <AdminProtectedRoute
          path="/admin/offer-letter-info"
          component={AdminOfferLetterInfo}
        />
      </Route>
      <Route path="/admin/coe-analysis/:id">
        <AdminProtectedRoute
          path="/admin/coe-analysis/:id"
          component={COEAnalysisView}
        />
      </Route>
      <Route path="/admin/visa-analysis/:id">
        <AdminProtectedRoute
          path="/admin/visa-analysis/:id"
          component={VisaAnalysisView}
        />
      </Route>
      <Route path="/admin/offer-letter-analysis/:id">
        <AdminProtectedRoute
          path="/admin/offer-letter-analysis/:id"
          component={AdminOfferLetterAnalysisView}
        />
      </Route>
      <Route path="/admin/information-reports">
        <AdminProtectedRoute
          path="/admin/information-reports"
          component={AdminInformationReports}
        />
      </Route>
      <Route path="/admin/offer-letter-details/:id">
        <AdminProtectedRoute
          path="/admin/offer-letter-details/:id"
          component={AdminOfferLetterDetails}
        />
      </Route>
      <Route path="/admin/offer-letter-info/:id">
        <AdminProtectedRoute
          path="/admin/offer-letter-info/:id"
          component={AdminOfferLetterDetails}
        />
      </Route>
      <Route path="/admin/coe-details/:id">
        <AdminProtectedRoute
          path="/admin/coe-details/:id"
          component={AdminCoeDetails}
        />
      </Route>

      {/* 404 Route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      {/* --- Wrap your entire app with DndProvider here --- */}
      <DndProvider backend={HTML5Backend}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AuthProvider>
              <Toaster />
              <Router />
            </AuthProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </DndProvider>
    </ErrorBoundary>
  );
}

export default App;
