import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Clock, Users, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface AnalysisResult {
  id: number;
  analysis: any;
  processingTime: number;
  tokensUsed: number;
  scrapingTime: number;
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
        throw new Error('Failed to fetch analysis');
      }
      return response.json();
    },
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
            <p className="text-gray-600">Analysis ID: {data.id}</p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <FileText className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Complete
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analysis Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <p className="text-sm text-gray-600 mb-2">Analysis Results:</p>
                    <div className="bg-white p-4 rounded border">
                      {typeof data.analysis === 'string' ? (
                        <pre className="whitespace-pre-wrap text-sm text-gray-700">
                          {data.analysis}
                        </pre>
                      ) : (
                        <pre className="whitespace-pre-wrap text-sm text-gray-700">
                          {JSON.stringify(data.analysis, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Raw Analysis Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto max-h-96">
                  <pre>{JSON.stringify(data, null, 2)}</pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 pt-6">
          <Button 
            variant="outline"
            onClick={() => navigate('/offer-letter-analysis')}
          >
            View All Analyses
          </Button>
          <Button onClick={() => window.print()}>
            Print Analysis
          </Button>
        </div>
      </div>
    </div>
  );
}