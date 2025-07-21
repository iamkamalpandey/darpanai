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
import { ExpertProtectedRoute } from "@/components/ExpertProtectedRoute";
import { AdminRedirect } from "@/components/AdminRedirect";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Landing from "@/pages/Landing";
import SimplifiedAuth from "@/components/SimplifiedAuth";

// Core Components
const StudentAIDashboard = lazy(() => import("@/pages/StudentAIDashboard"));
const UnifiedDashboard = lazy(() => import("@/pages/UnifiedDashboard"));
const PublicLanding = lazy(() => import("@/pages/PublicLanding"));

// Analysis Components
const AnalysisHub = lazy(() => import("@/pages/AnalysisHub"));
const VisaRejectionAnalysis = lazy(() => import("@/pages/VisaRejectionAnalysis"));
const CoEAnalysis = lazy(() => import("@/pages/CoEAnalysis"));
const COEAnalysisView = lazy(() => import("@/pages/COEAnalysisView"));
const ComprehensiveOfferLetterAnalysis = lazy(() => import("@/pages/ComprehensiveOfferLetterAnalysisSimplified"));
const OfferLetterAnalysisDisplay = lazy(() => import("@/pages/OfferLetterAnalysisDisplay"));

// Scholarship Components
const ScholarshipHubNew = lazy(() => import("@/pages/ScholarshipHubNew"));
const ScholarshipDetailsPageFixed = lazy(() => import("@/pages/ScholarshipDetailsPageFixed"));

// Core Pages
const ConsultationsPage = lazy(() => import("@/pages/consultations"));
const UpdatesPage = lazy(() => import("@/pages/updates"));
const DocumentTemplates = lazy(() => import("@/pages/document-templates"));
const DocumentChecklist = lazy(() => import("@/pages/document-checklist"));
const EduCounselAI = lazy(() => import("@/pages/EduCounselAI"));
const EligibilityQuickScan = lazy(() => import("@/pages/EligibilityQuickScan"));
const MyDocuments = lazy(() => import("@/pages/MyDocuments"));
// Profile and Information Components
const ProfileEdit = lazy(() => import("@/pages/ProfileEdit"));
const OfferLetterInfo = lazy(() => import("@/pages/OfferLetterInfo"));
const OfferLetterDetails = lazy(() => import("@/pages/OfferLetterDetails"));
const CoeInformation = lazy(() => import("@/pages/CoeInformation"));
const CoeDetails = lazy(() => import("@/pages/CoeDetailsNew"));
const UserCoeDetails = lazy(() => import("@/pages/UserCoeDetails"));

// Admin Components
const AdminDashboard = lazy(() => import("@/pages/admin-dashboard"));
const AdminAnalyses = lazy(() => import("@/pages/admin-analyses"));
const AdminAppointments = lazy(() => import("@/pages/admin-appointments"));
const AdminUsers = lazy(() => import("@/pages/admin-users"));
const AdminUpdates = lazy(() => import("@/pages/admin-updates"));
const AdminSettings = lazy(() => import("@/pages/admin-settings"));
const AdminDocumentTemplates = lazy(() => import("@/pages/admin-document-templates"));
const AdminDocumentChecklists = lazy(() => import("@/pages/admin-document-checklists"));
const AdminFeedback = lazy(() => import("@/pages/admin-feedback"));
const AdminInformationReports = lazy(() => import("@/pages/admin/InformationReports"));
const AdminExpertManagement = lazy(() => import("@/pages/AdminExpertManagement"));
const AdminStudentManagement = lazy(() => import("@/pages/AdminStudentManagement"));

// Scholarship Management
const ScholarshipManagement = lazy(() => import("@/pages/admin/ScholarshipManagement"));
const ScholarshipDetails = lazy(() => import("@/pages/admin/ScholarshipDetails"));
const ScholarshipCreate = lazy(() => import("@/pages/admin/ScholarshipCreate"));
const ScholarshipEdit = lazy(() => import("@/pages/admin/ScholarshipEdit"));

// Expert Components
const ExpertDashboard = lazy(() => import("@/pages/ExpertDashboard"));
const StudentManagement = lazy(() => import("@/pages/expert/StudentManagement"));

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
    
    if (user?.role === 'expert') {
      return (
        <Suspense fallback={<LoadingFallback />}>
          <ExpertDashboard />
        </Suspense>
      );
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
        <PublicLanding />
      </Suspense>
    );
  }
  return (
    <Switch>
      {/* Public Authentication Routes */}
      <Route path="/auth" component={SimplifiedAuth} />
      <Route path="/login" component={SimplifiedAuth} />
      <Route path="/register" component={SimplifiedAuth} />
      
      {/* Home Route - Shows Landing for guests, Dashboard for authenticated users */}
      <Route path="/" component={HomePage} />
      
      {/* Unified Dashboard Route - Accessible by authenticated users */}
      <Route path="/unified-dashboard">
        <UserProtectedRoute path="/unified-dashboard" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <UnifiedDashboard />
          </Suspense>
        )} />
      </Route>
      

      
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

      <Route path="/educounsel-ai">
        <UserProtectedRoute path="/educounsel-ai" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <EduCounselAI />
          </Suspense>
        )} />
      </Route>
      <Route path="/eligibility-quick-scan">
        <UserProtectedRoute path="/eligibility-quick-scan" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <EligibilityQuickScan />
          </Suspense>
        )} />
      </Route>
      
      {/* Core User Routes */}
      <Route path="/scholarship-research">
        <UserProtectedRoute path="/scholarship-research" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <ScholarshipHubNew />
          </Suspense>
        )} />
      </Route>

      <Route path="/scholarship-details/:scholarshipId">
        {(params) => (
          <UserProtectedRoute path="/scholarship-details/:scholarshipId" component={() => (
            <Suspense fallback={<LoadingFallback />}>
              <ScholarshipDetailsPageFixed params={params} />
            </Suspense>
          )} />
        )}
      </Route>
      <Route path="/scholarship-hub">
        <UserProtectedRoute path="/scholarship-hub" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <ScholarshipHubNew />
          </Suspense>
        )} />
      </Route>
      <Route path="/scholarship-details/:id">
        {(params) => (
          <UserProtectedRoute path="/scholarship-details/:id" component={() => (
            <Suspense fallback={<LoadingFallback />}>
              <ScholarshipDetailsPageFixed params={params} />
            </Suspense>
          )} />
        )}
      </Route>
      <Route path="/profile-based-application">
        <UserProtectedRoute path="/profile-based-application" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <ProfileBasedApplication />
          </Suspense>
        )} />
      </Route>
      <Route path="/smart-application-tracker">
        <UserProtectedRoute path="/smart-application-tracker" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <SmartApplicationTracker />
          </Suspense>
        )} />
      </Route>
      <Route path="/communication-center">
        <UserProtectedRoute path="/communication-center" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <CommunicationCenter />
          </Suspense>
        )} />
      </Route>
      <Route path="/document-intelligence">
        <UserProtectedRoute path="/document-intelligence" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <DocumentIntelligenceHub />
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
      <Route path="/scholarship-research">
        <UserProtectedRoute path="/scholarship-research" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <ScholarshipResearch />
          </Suspense>
        )} />
      </Route>
      <Route path="/simple-assessment">
        <UserProtectedRoute path="/simple-assessment" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <SimpleAssessment />
          </Suspense>
        )} />
      </Route>
      <Route path="/assessment">
        <UserProtectedRoute path="/assessment" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdvancedAssessmentPage />
          </Suspense>
        )} />
      </Route>

      <Route path="/learning-path">
        <UserProtectedRoute path="/learning-path" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <GamifiedLearningPath />
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
      <Route path="/user-coe-details/:id">
        <UserProtectedRoute path="/user-coe-details/:id" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <UserCoeDetails />
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
      <Route path="/my-documents">
        <UserProtectedRoute path="/my-documents" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <MyDocuments />
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
      <Route path="/cultural-adaptation-challenges">
        <UserProtectedRoute path="/cultural-adaptation-challenges" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <CulturalAdaptationChallenges />
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
      <Route path="/admin/expert-management">
        <AdminProtectedRoute path="/admin/expert-management" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminExpertManagement />
          </Suspense>
        )} />
      </Route>
      <Route path="/admin/student-management">
        <AdminProtectedRoute path="/admin/student-management" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminStudentManagement />
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
      <Route path="/admin/unified-applications">
        <AdminProtectedRoute path="/admin/unified-applications" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <ApplicationManagementHub />
          </Suspense>
        )} />
      </Route>
      <Route path="/admin/applications">
        <AdminProtectedRoute path="/admin/applications" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminApplicationManagement />
          </Suspense>
        )} />
      </Route>
      <Route path="/admin/smart-applications">
        <AdminProtectedRoute path="/admin/smart-applications" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <SmartApplicationManagement />
          </Suspense>
        )} />
      </Route>
      <Route path="/admin/modern-applications">
        <AdminProtectedRoute path="/admin/modern-applications" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <ModernAdminApplicationManagement />
          </Suspense>
        )} />
      </Route>
      <Route path="/admin/scholarships">
        <AdminProtectedRoute path="/admin/scholarships" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <ScholarshipManagement />
          </Suspense>
        )} />
      </Route>
      <Route path="/admin/scholarships/create">
        <AdminProtectedRoute path="/admin/scholarships/create" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <ScholarshipCreate />
          </Suspense>
        )} />
      </Route>
      <Route path="/admin/scholarship-details/:id">
        <AdminProtectedRoute path="/admin/scholarship-details/:id" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <ScholarshipDetailsRedesign />
          </Suspense>
        )} />
      </Route>
      <Route path="/admin/scholarship/edit/:id">
        <AdminProtectedRoute path="/admin/scholarship/edit/:id" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <ScholarshipEdit />
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
      <Route path="/admin/offer-letter-info">
        <AdminProtectedRoute path="/admin/offer-letter-info" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminOfferLetterInfo />
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
      <Route path="/admin/information-reports">
        <AdminProtectedRoute path="/admin/information-reports" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminInformationReports />
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
      <Route path="/admin/offer-letter-info/:id">
        <AdminProtectedRoute path="/admin/offer-letter-info/:id" component={() => (
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
      <Route path="/admin/experts">
        <AdminProtectedRoute path="/admin/experts" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <AdminExpertManagement />
          </Suspense>
        )} />
      </Route>
      
      {/* Expert Routes - Only accessible by education experts */}
      <Route path="/expert">
        <ExpertProtectedRoute path="/expert" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <ExpertDashboard />
          </Suspense>
        )} />
      </Route>
      
      <Route path="/expert-dashboard">
        <ExpertProtectedRoute path="/expert-dashboard" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <ExpertDashboard />
          </Suspense>
        )} />
      </Route>
      
      <Route path="/expert/students">
        <ExpertProtectedRoute path="/expert/students" component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <StudentManagement />
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
