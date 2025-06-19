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
  // Additional fields that might be present
  studentId?: string;
  programLevel?: string;
  startDate?: string;
  endDate?: string;
  duration?: string;
  campus?: string;
  faculty?: string;
  modeOfStudy?: string;
  programCode?: string;
  cricosCode?: string;
  creditPoints?: string;
  languageRequirements?: string;
  tuitionFee?: string;
  otherFees?: string;
  totalCost?: string;
  paymentTerms?: string;
  refundPolicy?: string;
  scholarship?: string;
  healthInsurance?: string;
  oshcDetails?: string;
  visaConditions?: string;
  academicRequirements?: string;
  importantDeadlines?: string;
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

  // Debug: log the analysis data structure
  console.log('Analysis data:', analysis);
  
  let parsedAnalysis = null;
  try {
    if (analysis.analysis) {
      parsedAnalysis = typeof analysis.analysis === 'string' ? JSON.parse(analysis.analysis) : analysis.analysis;
    }
  } catch (error) {
    console.error('Error parsing analysis data:', error);
  }
  
  // Check if we have any data to display
  const hasData = parsedAnalysis || analysis.summary || analysis.institutionName || analysis.studentName || analysis.programName;

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

          {/* Analysis Content - Show Raw Data and Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                COE Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Institution</p>
                    <p className="font-semibold">{analysis.institutionName || 'Not specified in document'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Student Name</p>
                    <p className="font-semibold">{analysis.studentName || 'Not specified in document'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Program</p>
                    <p className="font-semibold">{analysis.programName || 'Not specified in document'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Document Type</p>
                    <p className="font-semibold">COE (Confirmation of Enrollment)</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Analysis Date</p>
                    <p className="font-semibold">{new Date(analysis.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">File Name</p>
                    <p className="font-semibold">{analysis.filename}</p>
                  </div>
                </div>
              </div>

              {/* Summary Section */}
              {analysis.summary && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Analysis Summary</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{analysis.summary}</p>
                  </div>
                </div>
              )}

              {/* Detailed Analysis */}
              {parsedAnalysis && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Detailed Analysis</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-gray-800 text-sm whitespace-pre-wrap font-mono">
                      {JSON.stringify(parsedAnalysis, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Fallback message if no detailed data */}
              {!parsedAnalysis && !analysis.summary && (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Limited Analysis Data</h3>
                  <p className="text-gray-600">
                    This COE document has been processed, but detailed analysis data is not available. 
                    The document information shown above represents the basic details extracted.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>



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