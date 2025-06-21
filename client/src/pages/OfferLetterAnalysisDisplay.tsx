import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Clock, Users, ArrowLeft, DollarSign, Calendar, Building } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface AnalysisResult {
  id: number;
  documentId: number;
  userId: number;
  analysisResults: any;
  gptAnalysisResults: any;
  claudeAnalysisResults: any;
  hybridAnalysisResults: any;
  institutionalData: any;
  scholarshipData: any;
  competitorAnalysis: any;
  tokensUsed: number;
  claudeTokensUsed: number;
  totalAiCost: string;
  processingTime: number;
  scrapingTime: number;
  analysisStatus: string;
  isPublic: boolean;
  createdAt: string;
}

interface OfferLetterAnalysisDisplayProps {
  params: { id: string };
}

export default function OfferLetterAnalysisDisplay({ params }: OfferLetterAnalysisDisplayProps) {
  const [, navigate] = useLocation();
  
  const { data, isLoading, error } = useQuery<AnalysisResult>({
    queryKey: ['/api/offer-letter-analyses-new', params.id],
    queryFn: async () => {
      const response = await fetch(`/api/offer-letter-analyses-new/${params.id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch analysis');
      }
      return response.json();
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-4">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="p-8 text-center">
            <CardContent>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Analysis Not Found</h2>
              <p className="text-gray-600 mb-6">The requested analysis could not be found.</p>
              <Button onClick={() => navigate('/offer-letter-analysis')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Analysis List
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Extract analysis data with fallbacks
  const analysisData = data.analysisResults || data.gptAnalysisResults || {};
  const institutionName = analysisData?.institution || 'Institution Processing...';
  const programName = analysisData?.offerDetails?.program || 'Program Processing...';
  const tuitionAmount = analysisData?.offerDetails?.tuition || 'Amount Processing...';
  const startDate = analysisData?.offerDetails?.startDate || 'Date Processing...';
  const executiveSummary = analysisData?.executiveSummary || 'This analysis provides comprehensive insights into your offer letter, including program details, financial breakdown, and strategic recommendations for your educational journey.';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/offer-letter-analysis')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Analysis
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Offer Letter Analysis</h1>
            <p className="text-gray-600">Analysis ID: {data.id} • {new Date(data.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Analysis Metadata */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Analysis Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Processing Time</p>
                  <p className="font-medium">{data.processingTime}ms</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Tokens Used</p>
                  <p className="font-medium">{data.tokensUsed?.toLocaleString() || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Analysis Cost</p>
                  <p className="font-medium">{data.totalAiCost}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {data.analysisStatus}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
            <TabsTrigger value="raw">Raw Data</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Institution Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Institution & Program Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Institution Name</p>
                      <p className="font-medium text-lg">{institutionName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Program</p>
                      <p className="font-medium">{programName}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Tuition Amount</p>
                      <p className="font-medium text-lg text-blue-600">{tuitionAmount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Start Date</p>
                      <p className="font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {startDate}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Executive Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Executive Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {executiveSummary}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Analysis Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{data.tokensUsed?.toLocaleString() || '0'}</div>
                    <div className="text-sm text-gray-600">Tokens Processed</div>
                  </div>
                  <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-3xl font-bold text-green-600 mb-2">{(data.processingTime / 1000).toFixed(1)}s</div>
                    <div className="text-sm text-gray-600">Processing Time</div>
                  </div>
                  <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-3xl font-bold text-purple-600 mb-2">{data.totalAiCost}</div>
                    <div className="text-sm text-gray-600">Analysis Cost</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-6">
            {/* Primary Analysis Results */}
            <Card>
              <CardHeader>
                <CardTitle>Primary Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto whitespace-pre-wrap border">
                    {JSON.stringify(data.analysisResults || data.gptAnalysisResults, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* Additional Analysis Data */}
            {data.institutionalData && (
              <Card>
                <CardHeader>
                  <CardTitle>Institutional Research Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto whitespace-pre-wrap border">
                      {JSON.stringify(data.institutionalData, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {data.scholarshipData && (
              <Card>
                <CardHeader>
                  <CardTitle>Scholarship Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto whitespace-pre-wrap border">
                      {JSON.stringify(data.scholarshipData, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="raw" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Complete Analysis Data</CardTitle>
                <p className="text-sm text-gray-600">Raw JSON response from the analysis system</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto whitespace-pre-wrap border max-h-96">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}