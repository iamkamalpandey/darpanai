import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import VisaAnalyzer from "@/pages/VisaAnalyzer";
import AnalysisHistory from "@/pages/AnalysisHistory";
import AuthPage from "@/pages/auth-page";
import ConsultationsPage from "@/pages/consultations";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected Routes */}
      <ProtectedRoute path="/" component={Home} />
      <ProtectedRoute path="/analyzer" component={VisaAnalyzer} />
      <ProtectedRoute path="/history" component={AnalysisHistory} />
      <ProtectedRoute path="/consultations" component={ConsultationsPage} />
      
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
