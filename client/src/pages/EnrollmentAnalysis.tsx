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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Upload, FileText, CheckCircle, AlertCircle, Clock, DollarSign, GraduationCap, Building2, User, Calendar, TrendingUp, Globe, FileCheck, Sparkles, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { DashboardLayout } from '@/components/DashboardLayout';
import { CustomCTA } from '@/components/CustomCTA';

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

export default function EnrollmentAnalysis() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedAnalysis, setSelectedAnalysis] = useState<EnrollmentAnalysis | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();

  // Fetch user's enrollment analyses
  const { data: analyses = [], isLoading } = useQuery<EnrollmentAnalysis[]>({
    queryKey: ['/api/enrollment-analyses'],
  });

  // Fetch current user for quota checking
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    enabled: true
  }) as { data: any };

  // Handle URL parameter to load specific analysis
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const analysisId = urlParams.get('id');
    
    if (analysisId && analyses.length > 0 && !selectedAnalysis) {
      const targetAnalysis = analyses.find(analysis => analysis.id === parseInt(analysisId));
      if (targetAnalysis) {
        console.log('Loading analysis from URL:', targetAnalysis);
        setSelectedAnalysis(targetAnalysis);
      }
    }
  }, [analyses, selectedAnalysis]);

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
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  const handleAnalyze = () => {
    if (!selectedFile || !documentType) {
      toast({
        title: "Missing Information",
        description: "Please select both a file and document type.",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to analyze documents.",
        variant: "destructive"
      });
      return;
    }

    // Check user's quota
    if (user.analysisCount >= user.maxAnalyses) {
      toast({
        title: "Analysis Limit Reached",
        description: "You have reached your analysis limit. Please contact support to increase your quota.",
        variant: "destructive"
      });
      return;
    }

    // Start analysis with progress simulation
    setUploadProgress(10);
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 1000);

    analyzeMutation.mutate({ file: selectedFile, documentType }, {
      onSettled: () => {
        clearInterval(progressInterval);
        setUploadProgress(100);
        setTimeout(() => setUploadProgress(0), 1000);
      }
    });
  };

  const documentTypes = [
    { value: 'i20', label: 'I-20 Form (USA)', icon: '🇺🇸' },
    { value: 'cas', label: 'CAS Letter (UK)', icon: '🇬🇧' },
    { value: 'coe', label: 'COE Document (Australia)', icon: '🇦🇺' },
    { value: 'admission_letter', label: 'Admission Letter', icon: '📧' },
    { value: 'visa_letter', label: 'Visa Support Letter', icon: '📋' },
    { value: 'sponsor_letter', label: 'Sponsor Letter', icon: '💼' },
    { value: 'financial_guarantee', label: 'Financial Guarantee', icon: '💰' },
    { value: 'other', label: 'Other Document', icon: '📄' },
  ];

  const getImportanceBadgeColor = (importance: 'high' | 'medium' | 'low') => {
    switch (importance) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getPriorityBadgeColor = (priority: 'urgent' | 'important' | 'suggested') => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'important': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'suggested': return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'documentation': return <FileText className="h-4 w-4" />;
      case 'financial': return <DollarSign className="h-4 w-4" />;
      case 'academic': return <GraduationCap className="h-4 w-4" />;
      case 'visa': return <Globe className="h-4 w-4" />;
      case 'preparation': return <Target className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  if (selectedAnalysis) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Enrollment Analysis Results</h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">{selectedAnalysis.filename}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('id')) {
                  // If we came from My Analysis with an ID, go back there
                  window.location.href = '/my-analysis';
                } else {
                  // Otherwise just clear the analysis to show upload form
                  setSelectedAnalysis(null);
                }
              }}
              className="w-full sm:w-auto"
            >
              ← Back to My Analysis
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {selectedAnalysis.institutionCountry && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Institution</span>
                  </div>
                  <p className="text-sm text-gray-600">{selectedAnalysis.institutionCountry}</p>
                </CardContent>
              </Card>
            )}
            {selectedAnalysis.studentCountry && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Student Origin</span>
                  </div>
                  <p className="text-sm text-gray-600">{selectedAnalysis.studentCountry}</p>
                </CardContent>
              </Card>
            )}
            {selectedAnalysis.visaType && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">Visa Type</span>
                  </div>
                  <p className="text-sm text-gray-600">{selectedAnalysis.visaType}</p>
                </CardContent>
              </Card>
            )}
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm border">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Overview</TabsTrigger>
              <TabsTrigger value="findings" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Key Findings</TabsTrigger>
              <TabsTrigger value="recommendations" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Recommendations</TabsTrigger>
              <TabsTrigger value="next-steps" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Next Steps</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                  <CardTitle className="text-xl text-gray-800">Document Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {selectedAnalysis.summary}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <GraduationCap className="h-5 w-5" />
                      Academic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {selectedAnalysis.institutionName && (
                      <div>
                        <span className="font-medium text-gray-600">Institution:</span>
                        <p className="text-gray-800">{selectedAnalysis.institutionName}</p>
                      </div>
                    )}
                    {selectedAnalysis.programName && (
                      <div>
                        <span className="font-medium text-gray-600">Program:</span>
                        <p className="text-gray-800">{selectedAnalysis.programName}</p>
                      </div>
                    )}
                    {selectedAnalysis.programLevel && (
                      <div>
                        <span className="font-medium text-gray-600">Level:</span>
                        <p className="text-gray-800">{selectedAnalysis.programLevel}</p>
                      </div>
                    )}
                    {selectedAnalysis.startDate && (
                      <div>
                        <span className="font-medium text-gray-600">Start Date:</span>
                        <p className="text-gray-800">{selectedAnalysis.startDate}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-lg">
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                      <DollarSign className="h-5 w-5" />
                      Financial Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {selectedAnalysis.tuitionAmount && (
                      <div>
                        <span className="font-medium text-gray-600">Tuition:</span>
                        <p className="text-gray-800">{selectedAnalysis.tuitionAmount} {selectedAnalysis.currency}</p>
                      </div>
                    )}
                    {selectedAnalysis.scholarshipAmount && (
                      <div>
                        <span className="font-medium text-gray-600">Scholarship:</span>
                        <p className="text-gray-800">{selectedAnalysis.scholarshipAmount} {selectedAnalysis.currency}</p>
                      </div>
                    )}
                    {selectedAnalysis.totalCost && (
                      <div>
                        <span className="font-medium text-gray-600">Total Cost:</span>
                        <p className="font-semibold text-gray-800">{selectedAnalysis.totalCost} {selectedAnalysis.currency}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="findings" className="space-y-6">
              <div className="grid gap-6">
                {selectedAnalysis.keyFindings.map((finding, index) => (
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

              {selectedAnalysis.missingInformation.length > 0 && (
                <Card className="shadow-lg border-0 bg-yellow-50/80 backdrop-blur-sm border-yellow-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-800">
                      <AlertCircle className="h-5 w-5" />
                      Missing Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedAnalysis.missingInformation.map((missing, index) => (
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

            <TabsContent value="recommendations" className="space-y-6">
              <div className="grid gap-6">
                {selectedAnalysis.recommendations.map((rec, index) => (
                  <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getCategoryIcon(rec.category)}
                          <h3 className="font-semibold text-lg text-gray-800">{rec.title}</h3>
                        </div>
                        <Badge className={`${getPriorityBadgeColor(rec.priority)} border`}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{rec.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="next-steps" className="space-y-6">
              <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Target className="h-5 w-5" />
                    Your Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {selectedAnalysis.nextSteps && Array.isArray(selectedAnalysis.nextSteps) ? 
                      selectedAnalysis.nextSteps.map((step, index) => {
                        // Handle both object and string formats for backward compatibility
                        const stepData = typeof step === 'string' ? {
                          step: `Step ${index + 1}`,
                          description: step,
                          category: 'short_term' as const
                        } : step;

                        return (
                          <div key={index} className="flex items-start gap-4 p-4 bg-white/60 rounded-lg">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold text-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800 mb-2">{stepData.step}</h4>
                              <p className="text-gray-700 leading-relaxed mb-2">{stepData.description}</p>
                              <div className="flex items-center gap-3 text-sm">
                                <Badge 
                                  className={`${
                                    stepData.category === 'immediate' ? 'bg-red-100 text-red-800 border-red-200' :
                                    stepData.category === 'short_term' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                    'bg-green-100 text-green-800 border-green-200'
                                  } border`}
                                >
                                  {stepData.category.replace('_', ' ')}
                                </Badge>
                                {stepData.deadline && (
                                  <span className="text-gray-600 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {stepData.deadline}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                      : (
                        <div className="text-center py-8 text-gray-500">
                          No next steps available for this analysis.
                        </div>
                      )
                    }
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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
                  <span className="text-gray-600">Analyzing document...</span>
                  <span className="text-blue-600 font-medium">{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                {user && (
                  <span>
                    Analysis quota: {user.analysisCount}/{user.maxAnalyses} used
                  </span>
                )}
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={!selectedFile || !documentType || analyzeMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {analyzeMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyzing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Analyze Document
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Previous Analyses */}
        {analyses.length > 0 && (
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                <Clock className="h-5 w-5 text-gray-600" />
                Previous Analyses
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-4">
                {analyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors duration-200 border border-gray-200 hover:border-blue-300"
                    onClick={() => setSelectedAnalysis(analysis)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{analysis.filename}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="capitalize">{analysis.documentType.replace('_', ' ')}</span>
                          {analysis.institutionCountry && (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {analysis.institutionCountry}
                            </span>
                          )}
                          <span>{new Date(analysis.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600">
                      <span className="text-sm font-medium">View Analysis</span>
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customized CTA Section for Enrollment Analysis */}
        <CustomCTA variant="enrollment-analysis" source="enrollment-analysis-page" className="mt-8" />
      </div>
    </DashboardLayout>
  );
}