import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { UserProtectedRoute } from "@/components/UserProtectedRoute";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import VisaAnalyzer from "@/pages/VisaAnalyzer";
import AnalysisHistory from "@/pages/AnalysisHistory";
import AuthPage from "@/pages/auth-page";
import ConsultationsPage from "@/pages/consultations";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminAnalyses from "@/pages/admin-analyses";
import AdminAppointments from "@/pages/admin-appointments";
import AdminUsers from "@/pages/admin-users";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/auth" component={AuthPage} />
      
      {/* User Routes - Only accessible by regular users */}
      <UserProtectedRoute path="/" component={Home} />
      <UserProtectedRoute path="/analyzer" component={VisaAnalyzer} />
      <UserProtectedRoute path="/history" component={AnalysisHistory} />
      <UserProtectedRoute path="/consultations" component={ConsultationsPage} />
      
      {/* Admin Routes - Only accessible by admin users */}
      <AdminProtectedRoute path="/admin" component={AdminDashboard} />
      <AdminProtectedRoute path="/admin/users" component={AdminUsers} />
      <AdminProtectedRoute path="/admin/analyses" component={AdminAnalyses} />
      <AdminProtectedRoute path="/admin/appointments" component={AdminAppointments} />
      
      {/* 404 Route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
