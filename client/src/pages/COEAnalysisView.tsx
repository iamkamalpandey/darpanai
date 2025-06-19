import { useQuery } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/DashboardLayout';
import AnalysisDisplay from '@/components/AnalysisDisplay';

export default function COEAnalysisView() {
  const [, params] = useRoute('/coe-analysis/:id');
  const analysisId = params?.id;
  const { toast } = useToast();

  const { data: analysis, isLoading, error } = useQuery({
    queryKey: ['/api/coe-analyses', analysisId],
    enabled: !!analysisId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const goBack = () => {
    window.history.back();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !analysis) {
    return (
      <DashboardLayout>
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
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">COE Analysis Details</h1>
              <p className="text-gray-600 mt-1">Detailed analysis of your Confirmation of Enrollment document</p>
            </div>
            <Button onClick={goBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>

          {/* Use Unified Analysis Display Component */}
          <AnalysisDisplay 
            analysis={{
              id: analysis.id,
              filename: analysis.filename,
              documentType: analysis.documentType,
              institutionName: analysis.institutionName,
              studentName: analysis.studentName,
              programName: analysis.programName,
              summary: analysis.summary,
              analysis: analysis.analysis,
              createdAt: analysis.createdAt,
              userId: analysis.userId
            }} 
            showUserInfo={false} 
            isAdmin={false} 
          />

          {/* Footer Actions */}
          <div className="flex justify-center pt-6">
            <Button onClick={goBack} variant="outline" size="lg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to COE Analysis
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}