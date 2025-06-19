import { useQuery } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, FileText, Calendar, AlertTriangle, CheckCircle, Clock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/DashboardLayout';
import { AnalysisFeedback } from '@/components/AnalysisFeedback';

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
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Analysis Not Found</h2>
            <p className="text-gray-600 mb-6">
              The visa analysis you're looking for could not be found or you don't have permission to view it.
            </p>
            <Button onClick={goBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Analysis
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Visa Analysis Report
              </h1>
              <p className="text-gray-600 mb-4">
                Comprehensive analysis of your visa document
              </p>
              {analysis && (
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
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

          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Document</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{analysis.filename}</p>
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

          {/* Tabbed Analysis Content */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="issues" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Issues
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Recommendations
              </TabsTrigger>
              <TabsTrigger value="next-steps" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Next Steps
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-700">Analysis Overview</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-gray-700 whitespace-pre-wrap break-words">
                    {(analysis.analysisResults?.summary || analysis.summary) ? (
                      <div 
                        dangerouslySetInnerHTML={{ 
                          __html: (analysis.analysisResults?.summary || analysis.summary || '').replace(
                            /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g, 
                            '<span style="background-color: #dbeafe; padding: 2px 4px; border-radius: 4px; font-weight: 600;">$$$1</span>'
                          )
                        }}
                      />
                    ) : (
                      <p className="text-gray-500 italic">No analysis summary available.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Issues Tab */}
            <TabsContent value="issues">
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-700">Key Issues Identified</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {((analysis.analysisResults?.rejectionReasons && analysis.analysisResults.rejectionReasons.length > 0) || 
                    (analysis.rejectionReasons && analysis.rejectionReasons.length > 0)) ? (
                    <div className="space-y-4">
                      {(analysis.analysisResults?.rejectionReasons || analysis.rejectionReasons || []).map((reason, index) => (
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
                                {reason.severity.toUpperCase()}
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
                  ) : (
                    <p className="text-gray-500 italic">No specific issues identified in this analysis.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-700">Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {((analysis.analysisResults?.recommendations && analysis.analysisResults.recommendations.length > 0) || 
                    (analysis.recommendations && analysis.recommendations.length > 0)) ? (
                    <div className="space-y-4">
                      {(analysis.analysisResults?.recommendations || analysis.recommendations || []).map((rec, index) => (
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
                                {rec.priority.toUpperCase()}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No specific recommendations available for this analysis.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Next Steps Tab */}
            <TabsContent value="next-steps">
              <Card>
                <CardHeader>
                  <CardTitle className="text-purple-700">Action Plan</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {((analysis.analysisResults?.nextSteps && analysis.analysisResults.nextSteps.length > 0) || 
                    (analysis.nextSteps && analysis.nextSteps.length > 0)) ? (
                    <div className="space-y-4">
                      {(analysis.analysisResults?.nextSteps || analysis.nextSteps || []).map((step, index) => (
                        <div key={index} className="border-l-4 border-purple-400 pl-4 py-3 bg-purple-50 rounded-r">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                  {index + 1}
                                </span>
                                <h3 className="font-medium text-purple-800">{step.title}</h3>
                              </div>
                              <p className="text-gray-700 ml-7">{step.description}</p>
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
                  ) : (
                    <p className="text-gray-500 italic">No specific next steps provided for this analysis.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* One-click Feedback System */}
          <AnalysisFeedback 
            analysisId={parseInt(analysisId!)} 
            analysisType="visa" 
          />
        </div>
      </div>
    </DashboardLayout>
  );
}