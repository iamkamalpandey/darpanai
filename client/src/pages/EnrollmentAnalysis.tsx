import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Upload, FileCheck, CheckCircle, Calendar, ArrowLeft, Clock, Search, Info, DollarSign, GraduationCap, AlertTriangle, BookOpen, Award, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CustomCTA } from '@/components/CustomCTA';
import { useAuth } from '@/hooks/use-auth';

// Enhanced interface with all comprehensive fields
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
  healthCover?: string;
  englishTestScore?: string;
  institutionContact?: string;
  visaObligations?: string;
  paymentSchedule?: string;
  bankDetails?: string;
  conditionsOfOffer?: string;
  orientationDate?: string;
  passportDetails?: string;
  supportServices?: string;
  
  // Enhanced enrollment fields
  scholarshipDetails?: string;
  scholarshipPercentage?: string;
  scholarshipDuration?: string;
  scholarshipConditions?: string;
  internshipRequired?: string;
  internshipDuration?: string;
  workAuthorization?: string;
  workHoursLimit?: string;
  academicRequirements?: string;
  gpaRequirement?: string;
  attendanceRequirement?: string;
  languageRequirements?: string;
  insuranceRequirements?: string;
  accommodationInfo?: string;
  transportationInfo?: string;
  libraryAccess?: string;
  technologyRequirements?: string;
  courseMaterials?: string;
  examRequirements?: string;
  graduationRequirements?: string;
  transferCredits?: string;
  additionalFees?: string;
  refundPolicy?: string;
  withdrawalPolicy?: string;
  disciplinaryPolicies?: string;
  codeOfConduct?: string;
  emergencyContacts?: string;
  campusServices?: string;
  studentRights?: string;
  termsToFulfil?: string;
  
  // Analysis results
  summary?: string;
  keyFindings?: Array<{
    title: string;
    description: string;
    importance: 'high' | 'medium' | 'low';
    category?: string;
    actionRequired?: string;
    deadline?: string;
    amount?: string;
    consequence?: string;
  }>;
  recommendations?: Array<{
    title: string;
    description: string;
    priority: 'urgent' | 'important' | 'suggested';
    category: string;
  }>;
  nextSteps?: Array<{
    step: string;
    description: string;
    deadline?: string;
    category: string;
  }>;
  missingInformation?: Array<{
    field: string;
    description: string;
    impact: string;
  }>;
  complianceIssues?: Array<{
    issue: string;
    severity: string;
    resolution: string;
  }>;
  analysisScore?: number;
  confidence?: number;
  createdAt: string;
}

const documentTypes = [
  { value: 'coe', label: 'Confirmation of Enrollment (CoE)', icon: '📋' },
  { value: 'offer_letter', label: 'Offer Letter', icon: '📄' },
  { value: 'admission_letter', label: 'Admission Letter', icon: '✅' },
  { value: 'enrollment_letter', label: 'Enrollment Letter', icon: '📝' },
  { value: 'i20', label: 'I-20 Form', icon: '📋' },
  { value: 'cas', label: 'CAS Statement', icon: '📄' },
  { value: 'confirmation_enrollment', label: 'Enrollment Confirmation', icon: '✅' },
  { value: 'visa_letter', label: 'Visa Support Letter', icon: '📝' },
  { value: 'sponsor_letter', label: 'Sponsor Letter', icon: '💰' },
  { value: 'financial_guarantee', label: 'Financial Guarantee', icon: '🎓' },
  { value: 'other', label: 'Other Document', icon: '📎' },
];

export default function EnrollmentAnalysis() {
  const [selectedAnalysis, setSelectedAnalysis] = useState<EnrollmentAnalysis | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Query for enrollment analyses
  const { data: analyses } = useQuery({
    queryKey: ['/api/enrollment-analyses'],
    staleTime: 15 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // File upload handling
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  // Analysis mutation
  const mutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile || !documentType) {
        throw new Error('File and document type are required');
      }

      setUploadProgress(20);
      setAnalysisProgress(10);

      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('documentType', documentType);

      setUploadProgress(50);
      setAnalysisProgress(30);

      const response = await fetch('/api/enrollment-analysis', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      setUploadProgress(80);
      setAnalysisProgress(70);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status}: ${errorText}`);
      }
      
      setUploadProgress(100);
      setAnalysisProgress(100);
      
      return response.json();
    },
    onSuccess: (data) => {
      setSelectedAnalysis(data);
      setSelectedFile(null);
      setDocumentType('');
      setUploadProgress(0);
      setAnalysisProgress(0);
      queryClient.invalidateQueries({ queryKey: ['/api/enrollment-analyses'] });
      toast({
        title: 'Analysis Complete',
        description: 'Your enrollment document has been successfully analyzed.',
      });
    },
    onError: (error: any) => {
      setUploadProgress(0);
      setAnalysisProgress(0);
      toast({
        title: 'Analysis Failed',
        description: error.message || 'Failed to analyze document. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleAnalysis = () => {
    if (!selectedFile || !documentType) {
      toast({
        title: 'Missing Information',
        description: 'Please select both a file and document type.',
        variant: 'destructive',
      });
      return;
    }
    mutation.mutate();
  };

  // Show detailed analysis view if an analysis is selected
  if (selectedAnalysis) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header with Back Button */}
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              onClick={() => setSelectedAnalysis(null)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Analysis
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Enrollment Analysis Report</h1>
              <p className="text-gray-600">Detailed analysis of your enrollment document</p>
            </div>
          </div>

          {/* Document Information Card */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Document Type:</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {selectedAnalysis.documentType?.replace(/_/g, ' ') || 'Enrollment Confirmation'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Analysis Date:</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(selectedAnalysis.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">File Name:</p>
                  <p className="text-lg font-semibold text-gray-900 truncate">
                    {selectedAnalysis.filename}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Tabbed Analysis Content */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="findings" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Key Findings
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Recommendations
              </TabsTrigger>
              <TabsTrigger value="steps" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Next Steps
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Complete Details
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Academic Information */}
                <Card>
                  <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Academic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Institution:</p>
                        <p className="text-base text-gray-900">{selectedAnalysis.institutionName || 'Not specified in document'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Program:</p>
                        <p className="text-base text-gray-900">{selectedAnalysis.programName || 'Not specified in document'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Student Name:</p>
                        <p className="text-base text-gray-900">{selectedAnalysis.studentName || 'Not specified in document'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Document Type:</p>
                        <p className="text-base text-gray-900">{selectedAnalysis.documentType || 'Not specified in document'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Analysis Date:</p>
                        <p className="text-base text-gray-900">{new Date(selectedAnalysis.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Summary */}
                <Card>
                  <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Quick Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="text-gray-700 whitespace-pre-wrap break-words">
                      {selectedAnalysis.summary || 'Analysis summary not available.'}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Financial Information */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Financial Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-600">Tuition Fees</p>
                      <p className="text-lg font-bold text-blue-600">
                        {selectedAnalysis.tuitionAmount 
                          ? `${selectedAnalysis.currency || ''} ${selectedAnalysis.tuitionAmount}`.trim()
                          : 'Not specified'
                        }
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-600">Scholarship</p>
                      <p className="text-lg font-bold text-green-600">
                        {selectedAnalysis.scholarshipAmount || selectedAnalysis.scholarshipPercentage
                          ? `${selectedAnalysis.scholarshipAmount || ''} ${selectedAnalysis.scholarshipPercentage || ''}`.trim()
                          : 'Not specified'
                        }
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-600">Total Cost</p>
                      <p className="text-lg font-bold text-purple-600">
                        {selectedAnalysis.totalCost || 'Not specified'}
                      </p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-600">Additional Fees</p>
                      <p className="text-lg font-bold text-orange-600">
                        {selectedAnalysis.additionalFees || 'Not specified'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Test Scores & Requirements */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Test Scores & Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">English Test Score:</p>
                      <div className="p-3 bg-indigo-50 rounded-lg">
                        <p className="text-base text-gray-900">{selectedAnalysis.englishTestScore || 'Not specified in document'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Academic Requirements:</p>
                      <div className="p-3 bg-indigo-50 rounded-lg">
                        <p className="text-base text-gray-900">{selectedAnalysis.academicRequirements || 'Not specified in document'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Key Findings Tab */}
            <TabsContent value="findings" className="space-y-6">
              <Card>
                <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Key Findings & Important Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {selectedAnalysis.keyFindings && selectedAnalysis.keyFindings.length > 0 ? (
                    <div className="space-y-4">
                      {selectedAnalysis.keyFindings.map((finding: any, index: number) => (
                        <div key={index} className="border-l-4 border-red-400 pl-4 py-3 bg-red-50 rounded-r-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-red-800 mb-2">{finding.title}</h4>
                              <p className="text-red-700 mb-3 whitespace-pre-wrap break-words">{finding.description}</p>
                              
                              {/* Enhanced finding details */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                {finding.actionRequired && (
                                  <div className="bg-yellow-100 p-2 rounded">
                                    <p className="text-xs font-medium text-yellow-800">Action Required:</p>
                                    <p className="text-sm text-yellow-700">{finding.actionRequired}</p>
                                  </div>
                                )}
                                {finding.deadline && (
                                  <div className="bg-red-100 p-2 rounded">
                                    <p className="text-xs font-medium text-red-800">Deadline:</p>
                                    <p className="text-sm text-red-700">{finding.deadline}</p>
                                  </div>
                                )}
                                {finding.amount && (
                                  <div className="bg-blue-100 p-2 rounded">
                                    <p className="text-xs font-medium text-blue-800">Amount:</p>
                                    <p className="text-sm text-blue-700 font-semibold">{finding.amount}</p>
                                  </div>
                                )}
                                {finding.consequence && (
                                  <div className="bg-orange-100 p-2 rounded">
                                    <p className="text-xs font-medium text-orange-800">Consequence:</p>
                                    <p className="text-sm text-orange-700">{finding.consequence}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            <Badge 
                              variant={finding.importance === 'high' ? 'destructive' : finding.importance === 'medium' ? 'default' : 'secondary'}
                              className="ml-2"
                            >
                              {finding.importance || 'medium'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No specific key findings identified in this document.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-6">
              <Card>
                <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Recommendations & Advice
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {selectedAnalysis.recommendations && selectedAnalysis.recommendations.length > 0 ? (
                    <div className="space-y-4">
                      {selectedAnalysis.recommendations.map((rec: any, index: number) => (
                        <div key={index} className="border-l-4 border-green-400 pl-4 py-3 bg-green-50 rounded-r-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-green-800 mb-2">{rec.title}</h4>
                              <p className="text-green-700 whitespace-pre-wrap break-words">{rec.description}</p>
                            </div>
                            <div className="flex flex-col gap-1 ml-2">
                              <Badge 
                                variant={rec.priority === 'urgent' ? 'destructive' : rec.priority === 'important' ? 'default' : 'secondary'}
                              >
                                {rec.priority}
                              </Badge>
                              {rec.category && (
                                <Badge variant="outline" className="text-xs">
                                  {rec.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No specific recommendations provided for this document.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Next Steps Tab */}
            <TabsContent value="steps" className="space-y-6">
              <Card>
                <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Next Steps & Action Items
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {selectedAnalysis.nextSteps && selectedAnalysis.nextSteps.length > 0 ? (
                    <div className="space-y-4">
                      {selectedAnalysis.nextSteps.map((step: any, index: number) => (
                        <div key={index} className="flex gap-4 p-4 bg-purple-50 rounded-lg">
                          <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-purple-800 mb-2">{step.step}</h4>
                            <p className="text-purple-700 whitespace-pre-wrap break-words">{step.description}</p>
                            {step.deadline && (
                              <div className="mt-2 p-2 bg-purple-100 rounded">
                                <p className="text-xs font-medium text-purple-800">Deadline: {step.deadline}</p>
                              </div>
                            )}
                          </div>
                          {step.category && (
                            <Badge variant="outline" className="self-start">
                              {step.category}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No specific next steps identified for this document.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Complete Details Tab */}
            <TabsContent value="details" className="space-y-6">
              {/* Scholarship & Financial Aid Details */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Scholarship & Financial Aid Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Scholarship Details:</p>
                        <p className="text-base text-gray-900">{selectedAnalysis.scholarshipDetails || 'Not specified in document'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Scholarship Duration:</p>
                        <p className="text-base text-gray-900">{selectedAnalysis.scholarshipDuration || 'Not specified in document'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Payment Schedule:</p>
                        <p className="text-base text-gray-900 whitespace-pre-wrap break-words">{selectedAnalysis.paymentSchedule || 'Not specified in document'}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Scholarship Conditions:</p>
                        <p className="text-base text-gray-900 whitespace-pre-wrap break-words">{selectedAnalysis.scholarshipConditions || 'Not specified in document'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Bank Details:</p>
                        <p className="text-base text-gray-900 whitespace-pre-wrap break-words">{selectedAnalysis.bankDetails || 'Not specified in document'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Refund Policy:</p>
                        <p className="text-base text-gray-900 whitespace-pre-wrap break-words">{selectedAnalysis.refundPolicy || 'Not specified in document'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Internship & Work Authorization */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Internship & Work Authorization
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Internship Required:</p>
                        <p className="text-base text-gray-900">{selectedAnalysis.internshipRequired || 'Not specified in document'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Internship Duration:</p>
                        <p className="text-base text-gray-900">{selectedAnalysis.internshipDuration || 'Not specified in document'}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Work Authorization:</p>
                        <p className="text-base text-gray-900 whitespace-pre-wrap break-words">{selectedAnalysis.workAuthorization || 'Not specified in document'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Work Hours Limit:</p>
                        <p className="text-base text-gray-900">{selectedAnalysis.workHoursLimit || 'Not specified in document'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Academic Requirements & Terms to Fulfil */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Academic Requirements & Terms to Fulfil
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">GPA Requirement:</p>
                        <p className="text-base text-gray-900">{selectedAnalysis.gpaRequirement || 'Not specified in document'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Attendance Requirement:</p>
                        <p className="text-base text-gray-900">{selectedAnalysis.attendanceRequirement || 'Not specified in document'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Language Requirements:</p>
                        <p className="text-base text-gray-900 whitespace-pre-wrap break-words">{selectedAnalysis.languageRequirements || 'Not specified in document'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Graduation Requirements:</p>
                        <p className="text-base text-gray-900 whitespace-pre-wrap break-words">{selectedAnalysis.graduationRequirements || 'Not specified in document'}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Health Cover Details:</p>
                        <p className="text-base text-gray-900 whitespace-pre-wrap break-words">{selectedAnalysis.healthCover || 'Not specified in document'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Institution Contact:</p>
                        <p className="text-base text-gray-900 whitespace-pre-wrap break-words">{selectedAnalysis.institutionContact || 'Not specified in document'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Support Services:</p>
                        <p className="text-base text-gray-900 whitespace-pre-wrap break-words">{selectedAnalysis.supportServices || 'Not specified in document'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Terms to Fulfil:</p>
                        <p className="text-base text-gray-900 whitespace-pre-wrap break-words">{selectedAnalysis.termsToFulfil || 'Not specified in document'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Professional Disclaimer */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-orange-800 mb-2">Professional Consultation Recommended</h3>
                  <p className="text-orange-700 text-sm leading-relaxed">
                    This analysis is for informational purposes only. Please consult with qualified education counselors 
                    or immigration experts before making any decisions based on this analysis. The tool and company are 
                    not responsible for any financial or other losses resulting from decisions made based on this analysis.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Main enrollment analysis page
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Enrollment Document Analysis</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Upload your enrollment documents for comprehensive AI-powered analysis. 
            Get detailed insights on scholarship information, requirements, and compliance.
          </p>
        </div>

        {/* Upload Card */}
        <Card className="border-2 border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-6 w-6 text-green-600" />
              Document Analysis
            </CardTitle>
            <CardDescription className="text-base">
              Upload your enrollment confirmation, offer letter, or other educational documents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Document Type Selection */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700">Select Document Type</label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger className="h-12 text-base border-2 border-gray-200 hover:border-blue-300 transition-colors">
                    <SelectValue placeholder="Choose your document type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <span>{type.icon}</span>
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* File Upload Area */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700">Upload Document</label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
                    isDragActive
                      ? 'border-blue-400 bg-blue-50'
                      : selectedFile
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center gap-3">
                    {selectedFile ? (
                      <>
                        <FileCheck className="h-12 w-12 text-green-600" />
                        <div>
                          <p className="font-medium text-green-800">{selectedFile.name}</p>
                          <p className="text-sm text-green-600">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-700">
                            {isDragActive ? 'Drop your file here' : 'Drag & drop or click to upload'}
                          </p>
                          <p className="text-sm text-gray-500">PDF, JPG, PNG up to 10MB</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Progress */}
            {uploadProgress > 0 && (
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Upload Progress</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {analysisProgress > 0 && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Analysis Progress</span>
                  <span>{Math.round(analysisProgress)}%</span>
                </div>
                <Progress value={analysisProgress} className="w-full" />
              </div>
            )}

            {/* Credit Status */}
            {user && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">
                    Analysis Credits: {(user as any)?.maxAnalyses - (user as any)?.analysisCount} remaining
                  </span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-6 flex justify-center">
              <Button
                onClick={handleAnalysis}
                disabled={!selectedFile || !documentType || mutation.isPending || analysisProgress > 0 || Boolean(user && (user as any)?.analysisCount >= (user as any)?.maxAnalyses)}
                className="px-8 py-3 text-base font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {mutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </div>
                ) : (
                  'Analyze Document'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Analyses */}
        {(analyses as any)?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Recent Enrollment Analyses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(analyses as any)?.slice(0, 6).map((analysis: EnrollmentAnalysis) => (
                  <div
                    key={analysis.id}
                    onClick={() => setSelectedAnalysis(analysis)}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-sm truncate">{analysis.filename}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {new Date(analysis.createdAt).toLocaleDateString()}
                    </div>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {analysis.documentType}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTA Section */}
        <CustomCTA variant="enrollment-analysis" source="enrollment-analysis" />
      </div>
    </DashboardLayout>
  );
}