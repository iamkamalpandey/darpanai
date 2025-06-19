import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle, AlertCircle, Clock, FileCheck, Sparkles, Calendar, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { DashboardLayout } from '@/components/DashboardLayout';
import { CustomCTA } from '@/components/CustomCTA';
import { EnrollmentAnalysisDisplay } from '@/components/EnrollmentAnalysisDisplay';

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
  
  summary: string;
  keyFindings: Array<{
    title: string;
    description: string;
    importance: 'high' | 'medium' | 'low';
    category?: 'financial' | 'academic' | 'visa' | 'health' | 'accommodation' | 'scholarship' | 'compliance' | 'deadline' | 'requirement' | 'internship' | 'work_authorization' | 'academic_obligations' | 'terms_conditions' | 'other';
    actionRequired?: string;
    deadline?: string;
    amount?: string;
    consequence?: string;
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
    category: 'documentation' | 'financial' | 'academic' | 'visa' | 'preparation';
  }>;
  nextSteps: Array<{
    step: string;
    description: string;
    deadline?: string;
    category: 'immediate' | 'short_term' | 'long_term';
  }> | string[];
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
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for enrollment analyses
  const { data: analyses } = useQuery({
    queryKey: ['/api/enrollment-analyses'],
    staleTime: 15 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Query for user data to check credit limits
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    staleTime: 15 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
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

  const mutation = useMutation({
    mutationFn: async ({ file, documentType }: { file: File; documentType: string }) => {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', documentType);

      const response = await fetch('/api/enrollment-analysis', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status}: ${errorText}`);
      }
      
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

    if (user && (user as any)?.analysisCount >= (user as any)?.maxAnalyses) {
      toast({
        title: 'Analysis Limit Reached',
        description: 'You have reached your analysis limit. Please upgrade your plan to continue.',
        variant: 'destructive',
      });
      return;
    }

    // Simulate upload progress
    setUploadProgress(0);
    const uploadInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          setAnalysisProgress(0);
          
          // Simulate analysis progress
          const analysisInterval = setInterval(() => {
            setAnalysisProgress((prev) => {
              if (prev >= 100) {
                clearInterval(analysisInterval);
                return 100;
              }
              return prev + 2;
            });
          }, 100);
          
          return 100;
        }
        return prev + 5;
      });
    }, 50);

    mutation.mutate({ file: selectedFile, documentType });
  };

  // If an analysis is selected, show the detailed view
  if (selectedAnalysis) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold">Enrollment Analysis Report</h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Comprehensive analysis of your enrollment document with detailed insights and recommendations.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedAnalysis(null);
              }}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Analysis
            </Button>
          </div>
          
          <EnrollmentAnalysisDisplay 
            analysis={{
              id: selectedAnalysis.id,
              fileName: selectedAnalysis.filename,
              createdAt: selectedAnalysis.createdAt,
              institution: selectedAnalysis.institutionName,
              program: selectedAnalysis.programName,
              studentName: selectedAnalysis.studentName,
              programLevel: selectedAnalysis.programLevel,
              startDate: selectedAnalysis.startDate,
              endDate: selectedAnalysis.endDate,
              institutionCountry: selectedAnalysis.institutionCountry,
              visaType: selectedAnalysis.visaType,
              healthCover: selectedAnalysis.healthCover,
              englishTestScore: selectedAnalysis.englishTestScore,
              institutionContact: selectedAnalysis.institutionContact,
              visaObligations: selectedAnalysis.visaObligations,
              orientationDate: selectedAnalysis.orientationDate,
              passportDetails: selectedAnalysis.passportDetails,
              supportServices: selectedAnalysis.supportServices,
              paymentSchedule: selectedAnalysis.paymentSchedule,
              bankDetails: selectedAnalysis.bankDetails,
              conditionsOfOffer: selectedAnalysis.conditionsOfOffer,
              scholarshipDetails: selectedAnalysis.scholarshipDetails,
              scholarshipPercentage: selectedAnalysis.scholarshipPercentage,
              scholarshipDuration: selectedAnalysis.scholarshipDuration,
              scholarshipConditions: selectedAnalysis.scholarshipConditions,
              internshipRequired: selectedAnalysis.internshipRequired,
              internshipDuration: selectedAnalysis.internshipDuration,
              workAuthorization: selectedAnalysis.workAuthorization,
              workHoursLimit: selectedAnalysis.workHoursLimit,
              academicRequirements: selectedAnalysis.academicRequirements,
              gpaRequirement: selectedAnalysis.gpaRequirement,
              attendanceRequirement: selectedAnalysis.attendanceRequirement,
              languageRequirements: selectedAnalysis.languageRequirements,
              graduationRequirements: selectedAnalysis.graduationRequirements,
              termsToFulfil: selectedAnalysis.termsToFulfil,
              summary: selectedAnalysis.summary,
              keyFindings: selectedAnalysis.keyFindings,
              recommendations: selectedAnalysis.recommendations,
              missingInformation: selectedAnalysis.missingInformation
            }}
            isAdmin={false}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold">Enrollment Document Analysis</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Get comprehensive AI-powered insights on your enrollment documents including country requirements, visa information, and next steps.
            </p>
          </div>
        </div>
        
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Upload Your Document
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
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