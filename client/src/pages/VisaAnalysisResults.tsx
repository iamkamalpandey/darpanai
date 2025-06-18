import { useQuery } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertCircle, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Link } from 'wouter';

interface VisaAnalysis {
  id: number;
  filename: string;
  summary: string;
  analysisResults?: string;
  rejectionReasons?: Array<{
    title: string;
    description: string;
    category?: string;
    severity?: string;
  }>;
  recommendations?: Array<{
    title: string;
    description: string;
  }>;
  nextSteps?: Array<{
    title: string;
    description: string;
  }>;
  country?: string;
  isPublic?: boolean;
  createdAt: string;
}

export default function VisaAnalysisResults() {
  const [match, params] = useRoute('/visa-analysis-results/:id');
  const analysisId = params?.id ? parseInt(params.id) : null;

  const { data: analysis, isLoading, error } = useQuery<VisaAnalysis>({
    queryKey: ['/api/analyses', analysisId],
    enabled: !!analysisId,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading analysis...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !analysis) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Analysis Not Found</h2>
            <p className="text-gray-600 mb-4">The requested analysis could not be found.</p>
            <Link href="/my-analysis">
              <Button>Back to My Analysis</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Visa Analysis Results</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">{analysis.filename}</p>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>
              {new Date(analysis.createdAt).toLocaleDateString()}
            </span>
            {analysis.country && (
              <Badge variant="outline">{analysis.country}</Badge>
            )}
            {analysis.isPublic !== undefined && (
              <Badge variant={analysis.isPublic ? "default" : "secondary"}>
                {analysis.isPublic ? "Public" : "Private"}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex justify-start">
          <Link href="/my-analysis">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Analysis List
            </Button>
          </Link>
        </div>

        {/* Important Disclaimer */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 mb-2">Important Legal Disclaimer</p>
                <p className="text-amber-700 leading-relaxed">
                  This analysis is for informational purposes only and should not be considered as professional immigration advice. 
                  Always consult with qualified immigration experts or lawyers before making any decisions. 
                  This tool and company will not be liable for any financial or other losses caused by decisions made based on this analysis.
                  Make your decisions based on professional expert guidance and your own thorough research.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Complete Original Analysis */}
        {analysis.analysisResults && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Complete Visa Analysis Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-sm break-words font-mono">
                  {typeof analysis.analysisResults === 'string' 
                    ? analysis.analysisResults 
                    : JSON.stringify(analysis.analysisResults, null, 2).replace(/[{}"]/g, '').replace(/,\s*$/gm, '')
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary - Fallback */}
        {!analysis.analysisResults && analysis.summary && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Visa Analysis Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed break-words">{analysis.summary}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rejection Reasons */}
        {analysis.rejectionReasons && analysis.rejectionReasons.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Rejection Reasons
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.rejectionReasons.map((reason, index) => (
                <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-red-900">{reason.title}</h3>
                    {reason.severity && (
                      <Badge className="bg-red-100 text-red-800 border-red-200">
                        {reason.severity}
                      </Badge>
                    )}
                  </div>
                  <p className="text-red-800 leading-relaxed">{reason.description}</p>
                  {reason.category && (
                    <div className="mt-2">
                      <span className="text-xs text-red-600 font-medium">Category: {reason.category}</span>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.recommendations.map((rec, index) => (
                <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">{rec.title}</h3>
                  <p className="text-green-800 leading-relaxed">{rec.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        {analysis.nextSteps && analysis.nextSteps.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.nextSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 mb-1">{step.title}</h4>
                      <p className="text-gray-600 text-sm break-words">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Professional Guidance Recommendation */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 mb-2">Next Steps Recommendation</p>
                <p className="text-blue-700 leading-relaxed">
                  Based on this analysis, we strongly recommend consulting with qualified immigration experts who can provide 
                  personalized guidance for your specific situation. Consider booking a consultation with our certified immigration advisors 
                  who can help you understand these findings and create an actionable plan for your visa application process.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}