import { useQuery } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { ArrowLeft, AlertCircle, FileText, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout } from '@/components/DashboardLayout';
import { AdminLayout } from '@/components/AdminLayout';

interface VisaAnalysisData {
  id: number;
  filename: string;
  analysisResults: {
    summary?: string;
    rejectionReasons?: Array<{
      title: string;
      description: string;
      category?: string;
      severity?: 'high' | 'medium' | 'low';
    }>;
    recommendations?: Array<{
      title: string;
      description: string;
      priority?: 'urgent' | 'important' | 'suggested';
    }>;
    nextSteps?: Array<{
      title: string;
      description: string;
      category?: 'immediate' | 'short_term' | 'long_term';
    }>;
    keyTerms?: Array<{
      term: string;
      description: string;
    }>;
  };
  country?: string;
  visaType?: string;
  isPublic?: boolean;
  createdAt: string;
  userId: number;
}

export default function VisaAnalysisView() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith('/admin/');
  
  // Handle both user and admin routes
  const [, userParams] = useRoute('/visa-analysis/:id');
  const [, adminParams] = useRoute('/admin/visa-analysis/:id');
  const analysisId = userParams?.id || adminParams?.id;
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Use appropriate API endpoint based on admin/user access
  const apiEndpoint = isAdminRoute ? '/api/admin/analyses' : '/api/analyses';
  
  const { data: analysis, isLoading, error } = useQuery<VisaAnalysisData>({
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Visa Analysis Not Found</h3>
              <p className="text-gray-600 mb-4">
                The requested visa analysis could not be found or you don't have permission to view it.
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Visa Analysis Details</h1>
              <p className="text-lg text-gray-700">Comprehensive analysis of your visa document</p>
              {analysis && (
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1 min-w-0 max-w-full">
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <span className="break-words overflow-wrap-anywhere max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">{analysis.filename}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(analysis.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  {analysis.country && (
                    <Badge variant="outline">{analysis.country}</Badge>
                  )}
                  {analysis.visaType && (
                    <Badge variant="secondary">{analysis.visaType}</Badge>
                  )}
                </div>
              )}
            </div>
            <Button onClick={goBack} variant="outline" size="lg" className="shrink-0">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>

          {/* Analysis Content */}
          <div className="grid grid-cols-1 gap-8">
            {/* Summary */}
            {analysis.analysisResults?.summary && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4 text-blue-700">Analysis Summary</h2>
                  <div 
                    className="text-gray-700 whitespace-pre-wrap break-words"
                    dangerouslySetInnerHTML={{ 
                      __html: analysis.analysisResults.summary.replace(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g, '<span style="background-color: #dbeafe; padding: 2px 4px; border-radius: 4px; font-weight: 600;">$$$1</span>')
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Rejection Reasons / Issues */}
            {analysis.analysisResults?.rejectionReasons && analysis.analysisResults.rejectionReasons.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4 text-red-700">Key Issues Identified</h2>
                  <div className="space-y-4">
                    {analysis.analysisResults.rejectionReasons.map((reason, index) => (
                      <div key={index} className="border-l-4 border-red-400 pl-4 py-3 bg-red-50 rounded-r">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-red-800">{reason.title}</h3>
                            <p className="text-gray-700 mt-1">{reason.description}</p>
                          </div>
                          {reason.severity && (
                            <Badge 
                              variant={reason.severity === 'high' ? 'destructive' : reason.severity === 'medium' ? 'default' : 'secondary'}
                              className="ml-2"
                            >
                              {reason.severity}
                            </Badge>
                          )}
                        </div>
                        {reason.category && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            {reason.category}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {analysis.analysisResults?.recommendations && analysis.analysisResults.recommendations.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4 text-green-700">Recommendations</h2>
                  <div className="space-y-4">
                    {analysis.analysisResults.recommendations.map((rec, index) => (
                      <div key={index} className="border-l-4 border-green-400 pl-4 py-3 bg-green-50 rounded-r">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-green-800">{rec.title}</h3>
                            <p className="text-gray-700 mt-1">{rec.description}</p>
                          </div>
                          {rec.priority && (
                            <Badge 
                              variant={rec.priority === 'urgent' ? 'destructive' : rec.priority === 'important' ? 'default' : 'secondary'}
                              className="ml-2"
                            >
                              {rec.priority}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Next Steps */}
            {analysis.analysisResults?.nextSteps && analysis.analysisResults.nextSteps.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4 text-purple-700">Next Steps</h2>
                  <div className="space-y-4">
                    {analysis.analysisResults.nextSteps.map((step, index) => (
                      <div key={index} className="border-l-4 border-purple-400 pl-4 py-3 bg-purple-50 rounded-r">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-purple-800">{step.title}</h3>
                            <p className="text-gray-700 mt-1">{step.description}</p>
                          </div>
                          {step.category && (
                            <Badge variant="outline" className="ml-2">
                              {step.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Key Terms */}
            {analysis.analysisResults?.keyTerms && analysis.analysisResults.keyTerms.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-700">Key Terms & Conditions</h2>
                  <div className="space-y-3">
                    {analysis.analysisResults.keyTerms.map((term, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <h3 className="font-medium text-gray-800 mb-1">{term.term}</h3>
                        <p className="text-gray-600 text-sm">{term.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-center pt-8 border-t border-gray-200">
            <Button onClick={goBack} variant="outline" size="lg" className="px-8">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {isAdminRoute ? 'Back to All Analysis' : 'Back to My Analysis'}
            </Button>
          </div>
        </div>
      </div>
    </LayoutComponent>
  );
}