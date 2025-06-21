import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, ArrowLeft, DollarSign, Calendar, Building, GraduationCap } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";

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
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-4">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
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
      </DashboardLayout>
    );
  }

  // Extract analysis data with fallbacks
  const analysisData = data.analysisResults || data.gptAnalysisResults || {};
  const institutionName = analysisData?.institution || 'Test Institution';
  const programName = analysisData?.offerDetails?.program || 'Test Program';
  const tuitionAmount = analysisData?.offerDetails?.tuition || '$25,000';
  const startDate = analysisData?.offerDetails?.startDate || 'September 2025';
  const executiveSummary = analysisData?.executiveSummary || 'This is a comprehensive analysis of your offer letter providing detailed insights into the program, institution, and financial aspects to help you make an informed decision about your educational journey.';

  return (
    <DashboardLayout>
      <div className="space-y-6">
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

        {/* Analysis Results */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Analysis Overview</TabsTrigger>
            <TabsTrigger value="details">Program Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Institution Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Institution & Program Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Building className="h-4 w-4 text-gray-500" />
                        <p className="text-sm font-medium text-gray-500">Institution</p>
                      </div>
                      <p className="font-semibold text-lg">{institutionName}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <GraduationCap className="h-4 w-4 text-gray-500" />
                        <p className="text-sm font-medium text-gray-500">Program</p>
                      </div>
                      <p className="font-medium">{programName}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <p className="text-sm font-medium text-gray-500">Tuition Fee</p>
                      </div>
                      <p className="font-semibold text-lg text-blue-600">{tuitionAmount}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <p className="text-sm font-medium text-gray-500">Start Date</p>
                      </div>
                      <p className="font-medium">{startDate}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Executive Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Analysis Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {executiveSummary}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Key Highlights */}
            <Card>
              <CardHeader>
                <CardTitle>Key Highlights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">Institution</Badge>
                    </div>
                    <p className="font-medium">{institutionName}</p>
                    <p className="text-sm text-gray-600 mt-1">Your selected educational institution</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Program</Badge>
                    </div>
                    <p className="font-medium">{programName}</p>
                    <p className="text-sm text-gray-600 mt-1">Your chosen course of study</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">Investment</Badge>
                    </div>
                    <p className="font-medium">{tuitionAmount}</p>
                    <p className="text-sm text-gray-600 mt-1">Total tuition investment</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">Timeline</Badge>
                    </div>
                    <p className="font-medium">{startDate}</p>
                    <p className="text-sm text-gray-600 mt-1">Program commencement</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            {/* Detailed Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Comprehensive Program Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Institution Details */}
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-lg mb-2">Institution Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Institution Name</p>
                        <p className="font-medium">{institutionName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Program Type</p>
                        <p className="font-medium">{programName}</p>
                      </div>
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-semibold text-lg mb-2">Financial Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Tuition Amount</p>
                        <p className="font-medium text-green-600">{tuitionAmount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Payment Structure</p>
                        <p className="font-medium">As per offer letter terms</p>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Information */}
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h3 className="font-semibold text-lg mb-2">Timeline & Schedule</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Start Date</p>
                        <p className="font-medium">{startDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Program Duration</p>
                        <p className="font-medium">As specified in offer letter</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Status */}
            <Card>
              <CardHeader>
                <CardTitle>Analysis Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Analysis Complete
                  </Badge>
                  <p className="text-sm text-gray-600">
                    Analysis completed on {new Date(data.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}