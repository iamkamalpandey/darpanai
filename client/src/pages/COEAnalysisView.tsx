import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { ArrowLeft, FileText, Calendar, DollarSign, School, User, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/DashboardLayout';

interface COEAnalysis {
  id: number;
  filename: string;
  documentType: string;
  institutionName?: string;
  studentName?: string;
  programName?: string;
  summary?: string;
  analysis?: any;
  createdAt: string;
}

export default function COEAnalysisView() {
  const [, params] = useRoute('/coe-analysis/:id');
  const { toast } = useToast();
  const analysisId = params?.id;

  const { data: analysis, isLoading, error } = useQuery<COEAnalysis>({
    queryKey: ['/api/coe-analyses', analysisId],
    enabled: !!analysisId,
  });

  const goBack = () => {
    window.history.back();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading COE analysis...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !analysis) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Analysis Not Found</h2>
              <p className="text-gray-600 mb-4">The requested COE analysis could not be found.</p>
              <Button onClick={goBack} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const parsedAnalysis = analysis.analysis ? (typeof analysis.analysis === 'string' ? JSON.parse(analysis.analysis) : analysis.analysis) : null;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button
              onClick={goBack}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to COE Analysis
            </Button>
            <Badge variant="secondary" className="text-sm">
              {new Date(analysis.createdAt).toLocaleDateString()}
            </Badge>
          </div>

          {/* Document Info Card */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
              <CardTitle className="flex items-center gap-3">
                <FileText className="h-6 w-6" />
                COE Analysis Report
              </CardTitle>
              <CardDescription className="text-blue-50">
                Comprehensive analysis of Confirmation of Enrollment document
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Document</p>
                  <p className="font-semibold">{analysis.filename}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Institution</p>
                  <p className="font-semibold">{analysis.institutionName || 'Not specified in document'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Program</p>
                  <p className="font-semibold">{analysis.programName || 'Not specified in document'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Content */}
          {parsedAnalysis ? (
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
                <TabsTrigger value="academic" className="text-sm">Academic</TabsTrigger>
                <TabsTrigger value="financial" className="text-sm">Financial</TabsTrigger>
                <TabsTrigger value="compliance" className="text-sm">Compliance</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Document Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-800 leading-relaxed">
                        {parsedAnalysis.summary || analysis.summary || 'Summary not available in document'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Key Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Student Name</p>
                          <p className="font-semibold">{parsedAnalysis.studentName || analysis.studentName || 'Not specified in document'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Student ID</p>
                          <p className="font-semibold">{parsedAnalysis.studentId || 'Not specified in document'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Program Level</p>
                          <p className="font-semibold">{parsedAnalysis.programLevel || 'Not specified in document'}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Start Date</p>
                          <p className="font-semibold">{parsedAnalysis.startDate || 'Not specified in document'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">End Date</p>
                          <p className="font-semibold">{parsedAnalysis.endDate || 'Not specified in document'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Duration</p>
                          <p className="font-semibold">{parsedAnalysis.duration || 'Not specified in document'}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="academic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <School className="h-5 w-5 text-blue-600" />
                      Academic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Institution</p>
                          <p className="font-semibold">{parsedAnalysis.institutionName || 'Not specified in document'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Campus</p>
                          <p className="font-semibold">{parsedAnalysis.campus || 'Not specified in document'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Faculty/School</p>
                          <p className="font-semibold">{parsedAnalysis.faculty || 'Not specified in document'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Mode of Study</p>
                          <p className="font-semibold">{parsedAnalysis.modeOfStudy || 'Not specified in document'}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Program Code</p>
                          <p className="font-semibold">{parsedAnalysis.programCode || 'Not specified in document'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">CRICOS Code</p>
                          <p className="font-semibold">{parsedAnalysis.cricosCode || 'Not specified in document'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Credit Points</p>
                          <p className="font-semibold">{parsedAnalysis.creditPoints || 'Not specified in document'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Language Requirements</p>
                          <p className="font-semibold">{parsedAnalysis.languageRequirements || 'Not specified in document'}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="financial" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      Financial Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Tuition Fee</p>
                          <p className="font-semibold text-blue-600">{parsedAnalysis.tuitionFee || 'Not specified in document'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Other Fees</p>
                          <p className="font-semibold text-blue-600">{parsedAnalysis.otherFees || 'Not specified in document'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Total Cost</p>
                          <p className="font-semibold text-blue-600">{parsedAnalysis.totalCost || 'Not specified in document'}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Payment Terms</p>
                          <p className="font-semibold">{parsedAnalysis.paymentTerms || 'Not specified in document'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Refund Policy</p>
                          <p className="font-semibold">{parsedAnalysis.refundPolicy || 'Not specified in document'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Scholarship</p>
                          <p className="font-semibold">{parsedAnalysis.scholarship || 'Not specified in document'}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="compliance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                      Compliance & Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">Health Insurance (OSHC)</p>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-800">{parsedAnalysis.healthInsurance || parsedAnalysis.oshcDetails || 'Not specified in document'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">Visa Conditions</p>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-800">{parsedAnalysis.visaConditions || 'Not specified in document'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">Academic Requirements</p>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-800">{parsedAnalysis.academicRequirements || 'Not specified in document'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">Important Deadlines</p>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-800">{parsedAnalysis.importantDeadlines || 'Not specified in document'}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysis Data Unavailable</h3>
                <p className="text-gray-600">
                  The detailed analysis data for this COE document is not available. This may be due to processing issues or data format changes.
                </p>
              </CardContent>
            </Card>
          )}

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