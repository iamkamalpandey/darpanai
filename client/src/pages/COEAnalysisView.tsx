import { useQuery } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { ArrowLeft, AlertCircle, FileText, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/DashboardLayout';
import { AdminLayout } from '@/components/AdminLayout';
import AnalysisDisplay from '@/components/AnalysisDisplay';

export default function COEAnalysisView() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith('/admin/');
  
  // Handle both user and admin routes
  const [, userParams] = useRoute('/coe-analysis/:id');
  const [, adminParams] = useRoute('/admin/coe-analysis/:id');
  const analysisId = userParams?.id || adminParams?.id;
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Use appropriate API endpoint based on admin/user access
  const apiEndpoint = isAdminRoute ? '/api/admin/coe-analyses' : '/api/coe-analyses';
  
  const { data: analysis, isLoading, error } = useQuery({
    queryKey: [apiEndpoint, analysisId],
    enabled: !!analysisId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const goBack = () => {
    window.history.back();
  };

  const LayoutComponent = isAdminRoute ? AdminLayout : DashboardLayout;

  if (isLoading) {
    return (
      <LayoutComponent>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </LayoutComponent>
    );
  }

  if (error || !analysis) {
    return (
      <LayoutComponent>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">COE Analysis Not Found</h3>
              <p className="text-gray-600 mb-4">
                The requested COE analysis could not be found or you don't have permission to view it.
              </p>
              <Button onClick={goBack} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </LayoutComponent>
    );
  }

  return (
    <LayoutComponent>
      <div className="w-full max-w-none px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">COE Analysis Details</h1>
              <p className="text-lg text-gray-700">Detailed analysis of your Confirmation of Enrollment document</p>
              {analysis && (
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1 min-w-0 max-w-full">
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <span className="break-words overflow-wrap-anywhere max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">{(analysis as any).filename}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date((analysis as any).createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>
            <Button onClick={goBack} variant="outline" size="lg" className="shrink-0">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>

          {/* Use Unified Analysis Display Component */}
          <AnalysisDisplay 
            analysis={analysis as any} 
          />

          {/* Footer Actions */}
          <div className="flex justify-center pt-8 border-t border-gray-200">
            <Button onClick={goBack} variant="outline" size="lg" className="px-8">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to COE Analysis
            </Button>
          </div>
        </div>
      </div>
    </LayoutComponent>
  );
}