import { useQuery } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CheckCircle, AlertCircle, Clock, DollarSign, GraduationCap, Building2, User, Calendar, TrendingUp, Globe, FileCheck, AlertTriangle } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Link } from 'wouter';

interface EnrollmentAnalysis {
  id: number;
  filename: string;
  documentType: string;
  institutionName?: string;
  studentName?: string;
  studentId?: string;
  programName?: string;
  programLevel?: string;
  startDate?: string;
  endDate?: string;
  institutionCountry?: string;
  studentCountry?: string;
  visaType?: string;
  tuitionAmount?: string;
  currency?: string;
  scholarshipAmount?: string;
  totalCost?: string;
  summary: string;
  keyFindings: Array<{
    title: string;
    description: string;
    importance: 'high' | 'medium' | 'low';
  }>;
  missingInformation: Array<{
    field: string;
    description: string;
    impact: string;
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'urgent' | 'important' | 'suggested';
  }>;
  nextSteps: Array<{
    step: string;
    timeline: string;
    description: string;
  }>;
  createdAt: string;
}

export default function EnrollmentAnalysisResults() {
  const [match, params] = useRoute('/enrollment-analysis-results/:id');
  const analysisId = params?.id ? parseInt(params.id) : null;

  const { data: analysis, isLoading, error } = useQuery<EnrollmentAnalysis>({
    queryKey: ['/api/enrollment-analyses', analysisId],
    enabled: !!analysisId,
  });

  const getImportanceBadgeColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'important': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'suggested': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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
            <h1 className="text-2xl sm:text-3xl font-bold">Enrollment Analysis Results</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">{analysis.filename}</p>
          </div>
          <Link href="/my-analysis">
            <Button variant="outline" className="w-full sm:w-auto">
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
                <p className="font-medium text-amber-800 mb-2">Important Educational Disclaimer</p>
                <p className="text-amber-700 leading-relaxed">
                  This enrollment document analysis is for informational purposes only and should not replace professional guidance from qualified education consultants or immigration experts. 
                  Always verify information with the issuing institution and consult with certified professionals before making any study abroad or visa decisions. 
                  This tool and company will not be liable for any financial or other losses caused by decisions made based on this analysis.
                  Use this information as a starting point for your research and professional consultation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {analysis.institutionCountry && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Institution</span>
                </div>
                <p className="text-sm text-gray-600">{analysis.institutionCountry}</p>
              </CardContent>
            </Card>
          )}
          {analysis.studentCountry && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Student Origin</span>
                </div>
                <p className="text-sm text-gray-600">{analysis.studentCountry}</p>
              </CardContent>
            </Card>
          )}
          {analysis.visaType && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Visa Type</span>
                </div>
                <p className="text-sm text-gray-600">{analysis.visaType}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Analysis Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="academic">Academic Info</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="findings">Key Findings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Document Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-green-600" />
                  Document Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800 leading-relaxed">{analysis.summary}</p>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysis.recommendations.map((rec, index) => (
                    <div key={index} className="bg-white border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">{rec.title}</h3>
                        <Badge className={`${getPriorityBadgeColor(rec.priority)} border`}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{rec.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Next Steps */}
            {analysis.nextSteps.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysis.nextSteps.map((step, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-800">{step.step}</span>
                          <Badge variant="outline" className="text-xs">{step.timeline}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="academic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-green-600" />
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {analysis.institutionName && (
                    <div>
                      <span className="font-medium text-gray-600">Institution:</span>
                      <p className="text-gray-800">{analysis.institutionName}</p>
                    </div>
                  )}
                  {analysis.programName && (
                    <div>
                      <span className="font-medium text-gray-600">Program:</span>
                      <p className="text-gray-800">{analysis.programName}</p>
                    </div>
                  )}
                  {analysis.programLevel && (
                    <div>
                      <span className="font-medium text-gray-600">Level:</span>
                      <p className="text-gray-800">{analysis.programLevel}</p>
                    </div>
                  )}
                  {analysis.startDate && (
                    <div>
                      <span className="font-medium text-gray-600">Start Date:</span>
                      <p className="text-gray-800">{analysis.startDate}</p>
                    </div>
                  )}
                  {analysis.endDate && (
                    <div>
                      <span className="font-medium text-gray-600">End Date:</span>
                      <p className="text-gray-800">{analysis.endDate}</p>
                    </div>
                  )}
                  {analysis.studentName && (
                    <div>
                      <span className="font-medium text-gray-600">Student:</span>
                      <p className="text-gray-800">{analysis.studentName}</p>
                    </div>
                  )}
                  {analysis.studentId && (
                    <div>
                      <span className="font-medium text-gray-600">Student ID:</span>
                      <p className="text-gray-800">{analysis.studentId}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Financial Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {analysis.tuitionAmount && (
                    <div>
                      <span className="font-medium text-gray-600">Tuition:</span>
                      <p className="text-gray-800">{analysis.tuitionAmount} {analysis.currency}</p>
                    </div>
                  )}
                  {analysis.scholarshipAmount && (
                    <div>
                      <span className="font-medium text-gray-600">Scholarship:</span>
                      <p className="text-gray-800">{analysis.scholarshipAmount} {analysis.currency}</p>
                    </div>
                  )}
                  {analysis.totalCost && (
                    <div>
                      <span className="font-medium text-gray-600">Total Cost:</span>
                      <p className="font-semibold text-gray-800">{analysis.totalCost} {analysis.currency}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="findings" className="space-y-6">
            <div className="grid gap-6">
              {analysis.keyFindings.map((finding, index) => (
                <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-lg text-gray-800">{finding.title}</h3>
                      <Badge className={`${getImportanceBadgeColor(finding.importance)} border`}>
                        {finding.importance}
                      </Badge>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{finding.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {analysis.missingInformation.length > 0 && (
              <Card className="shadow-lg border-0 bg-yellow-50/80 backdrop-blur-sm border-yellow-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-800">
                    <AlertCircle className="h-5 w-5" />
                    Missing Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysis.missingInformation.map((missing, index) => (
                    <div key={index} className="bg-white/60 p-4 rounded-lg">
                      <div className="font-medium text-yellow-900 mb-1">{missing.field}</div>
                      <div className="text-sm text-yellow-800 mb-2">{missing.description}</div>
                      <div className="text-xs text-yellow-700 font-medium">Impact: {missing.impact}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Professional Guidance Recommendation */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 mb-2">Professional Guidance Recommended</p>
                <p className="text-blue-700 leading-relaxed">
                  Based on this enrollment document analysis, we recommend consulting with qualified education consultants and immigration advisors 
                  who can verify this information with the issuing institution and provide personalized guidance for your study abroad journey. 
                  Consider booking a consultation with our certified education advisors who can help you understand these findings and create 
                  a comprehensive plan for your academic and visa application process.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}