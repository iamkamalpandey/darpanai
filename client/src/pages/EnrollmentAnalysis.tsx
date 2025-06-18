import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Upload, FileText, CheckCircle, AlertCircle, Clock, DollarSign, GraduationCap, Building2, User, Calendar, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

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
    category: 'documentation' | 'financial' | 'academic' | 'visa' | 'preparation';
  }>;
  nextSteps: Array<{
    step: string;
    description: string;
    deadline?: string;
    category: 'immediate' | 'short_term' | 'long_term';
  }>;
  isValid: boolean;
  expiryDate?: string;
  complianceIssues: Array<{
    issue: string;
    severity: 'critical' | 'moderate' | 'minor';
    resolution: string;
  }>;
  analysisScore: number;
  confidence: number;
  processingTime: number;
  tokensUsed: number;
  createdAt: string;
}

const documentTypes = [
  { value: 'i20', label: 'I-20 Form (USA)' },
  { value: 'cas', label: 'CAS Letter (UK)' },
  { value: 'admission_letter', label: 'Admission Letter' },
  { value: 'offer_letter', label: 'Offer Letter' },
  { value: 'confirmation_enrollment', label: 'Enrollment Confirmation' },
  { value: 'other', label: 'Other Document' }
];

export default function EnrollmentAnalysis() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedAnalysis, setSelectedAnalysis] = useState<EnrollmentAnalysis | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's enrollment analyses
  const { data: analyses = [], isLoading: analysesLoading } = useQuery({
    queryKey: ['/api/enrollment-analyses'],
    enabled: true
  }) as { data: EnrollmentAnalysis[]; isLoading: boolean };

  // Fetch current user for quota checking
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    enabled: true
  }) as { data: any };

  // Upload and analyze document mutation
  const analyzeMutation = useMutation({
    mutationFn: async ({ file, documentType }: { file: File; documentType: string }) => {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', documentType);

      const response = await fetch('/api/enrollment-analysis', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Analysis failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Analysis Complete",
        description: "Your enrollment document has been analyzed successfully."
      });
      setSelectedFile(null);
      setDocumentType('');
      setUploadProgress(0);
      queryClient.invalidateQueries({ queryKey: ['/api/enrollment-analyses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      setSelectedAnalysis(data);
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to analyze document';
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive"
      });
      setUploadProgress(0);
    }
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
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const handleAnalyze = async () => {
    if (!selectedFile || !documentType) {
      toast({
        title: "Missing Information",
        description: "Please select a document and document type.",
        variant: "destructive"
      });
      return;
    }

    if (user && user.analysisCount >= user.maxAnalyses) {
      toast({
        title: "Analysis Limit Reached",
        description: `You've used all ${user.maxAnalyses} analyses. Please upgrade your plan or contact support.`,
        variant: "destructive"
      });
      return;
    }

    setUploadProgress(10);
    analyzeMutation.mutate({ file: selectedFile, documentType });
  };

  const formatCurrency = (amount: string, currency: string = 'USD') => {
    if (!amount) return 'N/A';
    return `${currency} ${amount}`;
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'important': return 'default';
      case 'suggested': return 'secondary';
      default: return 'default';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'moderate': return 'default';
      case 'minor': return 'secondary';
      default: return 'default';
    }
  };

  const canAnalyze = user && user.analysisCount < user.maxAnalyses;
  const remainingAnalyses = user ? user.maxAnalyses - user.analysisCount : 0;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Enrollment Confirmation Analysis</h1>
        <p className="text-muted-foreground">
          Upload your I-20, CAS letter, admission letter, or enrollment confirmation for AI-powered analysis
        </p>
        {user && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Remaining analyses: {remainingAnalyses}</span>
            <span>Total used: {user.analysisCount}/{user.maxAnalyses}</span>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Document
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Upload */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-300 hover:border-gray-400'
              } ${!canAnalyze ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input {...getInputProps()} disabled={!canAnalyze} />
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              {selectedFile ? (
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-medium">
                    {canAnalyze ? 'Drop your document here or click to browse' : 'Analysis limit reached'}
                  </p>
                  <p className="text-sm text-gray-500">
                    PDF, PNG, or JPG files up to 10MB
                  </p>
                </div>
              )}
            </div>

            {/* Document Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Type</label>
              <Select value={documentType} onValueChange={setDocumentType} disabled={!canAnalyze}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Upload Progress */}
            {analyzeMutation.isPending && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Analyzing document...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            {/* Analyze Button */}
            <Button
              onClick={handleAnalyze}
              disabled={!selectedFile || !documentType || analyzeMutation.isPending || !canAnalyze}
              className="w-full"
            >
              {analyzeMutation.isPending ? 'Analyzing...' : 'Analyze Document'}
            </Button>

            {!canAnalyze && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You've reached your analysis limit. Please upgrade your plan or contact support for more analyses.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Recent Analyses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Analyses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : analyses.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No analyses yet. Upload your first document to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {analyses.slice(0, 5).map((analysis) => (
                  <div
                    key={analysis.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setSelectedAnalysis(analysis)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium truncate">{analysis.filename}</p>
                        <p className="text-sm text-gray-500 capitalize">
                          {analysis.documentType.replace('_', ' ')}
                        </p>
                        {analysis.institutionName && (
                          <p className="text-sm text-gray-600">{analysis.institutionName}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge variant={analysis.isValid ? 'default' : 'destructive'}>
                          {analysis.analysisScore}%
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(analysis.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analysis Results */}
      {selectedAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Analysis Results: {selectedAnalysis.filename}
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="capitalize">
                {selectedAnalysis.documentType.replace('_', ' ')}
              </Badge>
              <Badge variant={selectedAnalysis.isValid ? 'default' : 'destructive'}>
                {selectedAnalysis.isValid ? 'Valid' : 'Issues Found'}
              </Badge>
              <Badge variant="secondary">
                Score: {selectedAnalysis.analysisScore}%
              </Badge>
              <Badge variant="secondary">
                Confidence: {selectedAnalysis.confidence}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="findings">Findings</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="next-steps">Next Steps</TabsTrigger>
                <TabsTrigger value="issues">Issues</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="prose max-w-none">
                  <h3>Summary</h3>
                  <p className="whitespace-pre-wrap">{selectedAnalysis.summary}</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedAnalysis.institutionName && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Institution</p>
                        <p className="font-medium text-sm">{selectedAnalysis.institutionName}</p>
                      </div>
                    </div>
                  )}
                  {selectedAnalysis.programLevel && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <GraduationCap className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Level</p>
                        <p className="font-medium text-sm capitalize">{selectedAnalysis.programLevel}</p>
                      </div>
                    </div>
                  )}
                  {selectedAnalysis.totalCost && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <DollarSign className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="text-sm text-gray-600">Total Cost</p>
                        <p className="font-medium text-sm">
                          {formatCurrency(selectedAnalysis.totalCost, selectedAnalysis.currency)}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedAnalysis.startDate && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600">Start Date</p>
                        <p className="font-medium text-sm">{selectedAnalysis.startDate}</p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Student Information
                    </h3>
                    <div className="space-y-2">
                      {selectedAnalysis.studentName && (
                        <div>
                          <label className="text-sm text-gray-600">Name</label>
                          <p className="font-medium">{selectedAnalysis.studentName}</p>
                        </div>
                      )}
                      {selectedAnalysis.studentId && (
                        <div>
                          <label className="text-sm text-gray-600">Student ID</label>
                          <p className="font-medium">{selectedAnalysis.studentId}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      Program Information
                    </h3>
                    <div className="space-y-2">
                      {selectedAnalysis.programName && (
                        <div>
                          <label className="text-sm text-gray-600">Program</label>
                          <p className="font-medium">{selectedAnalysis.programName}</p>
                        </div>
                      )}
                      {selectedAnalysis.programLevel && (
                        <div>
                          <label className="text-sm text-gray-600">Level</label>
                          <p className="font-medium capitalize">{selectedAnalysis.programLevel}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        {selectedAnalysis.startDate && (
                          <div>
                            <label className="text-sm text-gray-600">Start Date</label>
                            <p className="font-medium">{selectedAnalysis.startDate}</p>
                          </div>
                        )}
                        {selectedAnalysis.endDate && (
                          <div>
                            <label className="text-sm text-gray-600">End Date</label>
                            <p className="font-medium">{selectedAnalysis.endDate}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Financial Information
                    </h3>
                    <div className="space-y-2">
                      {selectedAnalysis.tuitionAmount && (
                        <div>
                          <label className="text-sm text-gray-600">Tuition</label>
                          <p className="font-medium">
                            {formatCurrency(selectedAnalysis.tuitionAmount, selectedAnalysis.currency)}
                          </p>
                        </div>
                      )}
                      {selectedAnalysis.scholarshipAmount && (
                        <div>
                          <label className="text-sm text-gray-600">Scholarship</label>
                          <p className="font-medium">
                            {formatCurrency(selectedAnalysis.scholarshipAmount, selectedAnalysis.currency)}
                          </p>
                        </div>
                      )}
                      {selectedAnalysis.totalCost && (
                        <div>
                          <label className="text-sm text-gray-600">Total Cost</label>
                          <p className="font-medium">
                            {formatCurrency(selectedAnalysis.totalCost, selectedAnalysis.currency)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Analysis Metrics
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm text-gray-600">Analysis Score</label>
                        <p className="font-medium">{selectedAnalysis.analysisScore}%</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">AI Confidence</label>
                        <p className="font-medium">{selectedAnalysis.confidence}%</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Processing Time</label>
                        <p className="font-medium">{(selectedAnalysis.processingTime / 1000).toFixed(2)}s</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="findings" className="space-y-4">
                <h3 className="font-semibold">Key Findings</h3>
                {selectedAnalysis.keyFindings.length === 0 ? (
                  <p className="text-gray-500">No specific findings identified.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedAnalysis.keyFindings.map((finding, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{finding.title}</h4>
                          <Badge variant={getImportanceColor(finding.importance)}>
                            {finding.importance}
                          </Badge>
                        </div>
                        <p className="text-gray-700">{finding.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {selectedAnalysis.missingInformation.length > 0 && (
                  <>
                    <Separator />
                    <h3 className="font-semibold">Missing Information</h3>
                    <div className="space-y-3">
                      {selectedAnalysis.missingInformation.map((missing, index) => (
                        <div key={index} className="p-4 border rounded-lg bg-yellow-50">
                          <h4 className="font-medium">{missing.field}</h4>
                          <p className="text-gray-700 mb-2">{missing.description}</p>
                          <p className="text-sm text-yellow-700">
                            <strong>Impact:</strong> {missing.impact}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <h3 className="font-semibold">Recommendations</h3>
                {selectedAnalysis.recommendations.length === 0 ? (
                  <p className="text-gray-500">No specific recommendations at this time.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedAnalysis.recommendations.map((rec, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{rec.title}</h4>
                          <div className="flex gap-2">
                            <Badge variant={getPriorityColor(rec.priority)}>
                              {rec.priority}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {rec.category}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-gray-700">{rec.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="next-steps" className="space-y-4">
                <h3 className="font-semibold">Next Steps</h3>
                {selectedAnalysis.nextSteps.length === 0 ? (
                  <p className="text-gray-500">No specific next steps identified.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedAnalysis.nextSteps.map((step, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{step.step}</h4>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="capitalize">
                              {step.category.replace('_', ' ')}
                            </Badge>
                            {step.deadline && (
                              <Badge variant="secondary">
                                {step.deadline}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-700">{step.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="issues" className="space-y-4">
                <h3 className="font-semibold">Compliance Issues</h3>
                {selectedAnalysis.complianceIssues.length === 0 ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span>No compliance issues identified</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedAnalysis.complianceIssues.map((issue, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-red-50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{issue.issue}</h4>
                          <Badge variant={getSeverityColor(issue.severity)}>
                            {issue.severity}
                          </Badge>
                        </div>
                        <p className="text-gray-700 mb-2"><strong>Resolution:</strong> {issue.resolution}</p>
                      </div>
                    ))}
                  </div>
                )}

                {selectedAnalysis.expiryDate && (
                  <>
                    <Separator />
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Document Expiry:</strong> This document expires on {selectedAnalysis.expiryDate}
                      </AlertDescription>
                    </Alert>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}