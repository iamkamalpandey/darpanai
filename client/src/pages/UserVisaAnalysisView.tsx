import { useQuery } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Calendar, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/DashboardLayout';
import { FeedbackSystem } from '@/components/FeedbackSystem';
import { CustomCTA } from '@/components/CustomCTA';

interface VisaAnalysisData {
  id: number;
  filename: string;
  summary?: string;
  analysisResults?: {
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
  country?: string;
  visaType?: string;
  isPublic?: boolean;
  createdAt: string;
  userId: number;
}

export default function UserVisaAnalysisView() {
  const [, params] = useRoute('/visa-analysis/:id');
  const analysisId = params?.id;
  const { toast } = useToast();

  const { data: analysis, isLoading, error } = useQuery<VisaAnalysisData>({
    queryKey: [`/api/analyses/${analysisId}`],
    enabled: !!analysisId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Debug logging to understand data structure
  if (analysis) {
    console.log('UserVisaAnalysisView - Analysis data:', analysis);
  }

  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/my-analysis';
    }
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
      </DashboardLayout>
    );
  }

  // Extract data from nested structure or fallback to direct properties
  const analysisData = analysis.analysisResults || analysis;
  const rejectionReasons = analysisData.rejectionReasons || [];
  const recommendations = analysisData.recommendations || [];
  const nextSteps = analysisData.nextSteps || [];

  return (
    <DashboardLayout>
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
              Back to My Analysis
            </Button>
          </div>

          {/* Analysis Content */}
          <div className="grid grid-cols-1 gap-8">
            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Document Type</span>
                  </div>
                  <p className="text-sm text-gray-600">Visa Analysis</p>
                </CardContent>
              </Card>
              
              {analysis.country && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Country</span>
                    </div>
                    <p className="text-sm text-gray-600">{analysis.country}</p>
                  </CardContent>
                </Card>
              )}
              
              {analysis.visaType && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">Visa Type</span>
                    </div>
                    <p className="text-sm text-gray-600">{analysis.visaType}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Main Analysis Content */}
            <div className="space-y-6">
              {/* Overview Section */}
              {(analysisData.summary || analysis.summary) && (
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-blue-900 mb-4">Overview</h3>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap break-words">
                        {analysisData.summary || analysis.summary}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Key Issues Section */}
              {rejectionReasons.length > 0 && (
                <Card className="border-l-4 border-l-red-500">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-red-900 mb-4">Key Issues</h3>
                    <div className="space-y-4">
                      {rejectionReasons.map((reason, index) => (
                        <div key={index} className="bg-red-50 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-red-900">{reason.title}</h4>
                            {reason.severity && (
                              <Badge variant={reason.severity === 'high' ? 'destructive' : reason.severity === 'medium' ? 'default' : 'secondary'}>
                                {reason.severity}
                              </Badge>
                            )}
                          </div>
                          <p className="text-red-800 text-sm whitespace-pre-wrap break-words">
                            {reason.description}
                          </p>
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

              {/* Recommendations Section */}
              {recommendations.length > 0 && (
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-green-900 mb-4">Recommendations</h3>
                    <div className="space-y-4">
                      {recommendations.map((rec, index) => (
                        <div key={index} className="bg-green-50 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-green-900">{rec.title}</h4>
                            {rec.priority && (
                              <Badge variant={rec.priority === 'urgent' ? 'destructive' : rec.priority === 'important' ? 'default' : 'secondary'}>
                                {rec.priority}
                              </Badge>
                            )}
                          </div>
                          <p className="text-green-800 text-sm whitespace-pre-wrap break-words">
                            {rec.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Next Steps Section */}
              {nextSteps.length > 0 && (
                <Card className="border-l-4 border-l-purple-500">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-purple-900 mb-4">Next Steps</h3>
                    <div className="space-y-4">
                      {nextSteps.map((step, index) => (
                        <div key={index} className="bg-purple-50 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="bg-purple-100 text-purple-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-purple-900 mb-1">{step.title}</h4>
                              <p className="text-purple-800 text-sm whitespace-pre-wrap break-words">
                                {step.description}
                              </p>
                              {step.category && (
                                <Badge variant="outline" className="mt-2 text-xs">
                                  {step.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Feedback System */}
            <div className="mt-8">
              <FeedbackSystem 
                analysisId={parseInt(analysisId!)} 
                analysisType="visa"
              />
            </div>

            {/* Call to Action */}
            <div className="mt-8">
              <CustomCTA variant="visa-analysis" source="visa-analysis-report" />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}