import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, AlertTriangle, Clock, TrendingUp, Sparkles, Target, CheckCircle, Calendar, Shield } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { format } from "date-fns";
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { DashboardLayout } from '@/components/DashboardLayout';
import { CustomCTA } from '@/components/CustomCTA';

interface RejectionReason {
  title: string;
  description: string;
  category?: string;
  severity?: string;
}

interface VisaAnalysis {
  id: number;
  filename: string;
  originalText?: string;
  analysisResults?: {
    rejectionReasons?: RejectionReason[];
    recommendations?: Array<{
      title: string;
      description: string;
      priority: string;
    }>;
    nextSteps?: Array<{
      title: string;
      description: string;
    }>;
    summary?: string;
  };
  rejectionReasons?: RejectionReason[];
  recommendations?: Array<{
    title: string;
    description: string;
    priority: string;
  }>;
  nextSteps?: Array<{
    title: string;
    description: string;
  }>;
  summary?: string;
  createdAt: string;
}

export default function VisaRejectionAnalysis() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedAnalysis, setSelectedAnalysis] = useState<VisaAnalysis | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();

  // Enhanced number formatting for comprehensive display of numerical figures
  const formatNumericalInfo = (text: string) => {
    return text.replace(
      /(\$[\d,]+(?:\.\d{2})?(?:\s*(?:CAD|USD|AUD|per\s+(?:year|semester|month|week)?))?|(?:CAD|USD|AUD|EUR|GBP|₹|¥)\s*[\d,]+(?:\.\d{2})?|€[\d,]+(?:\.\d{2})?|£[\d,]+(?:\.\d{2})?|₹[\d,]+(?:\.\d{2})?|\d+(?:\.\d+)?\s*(?:years?|semesters?|months?|weeks?|days?|hours?|credits?|units?)|(?:19|20)\d{2}(?:-(?:19|20)?\d{2})?|\d+(?:\.\d+)?%(?:\s*(?:scholarship|coverage|reduction|discount|off))?|\d+(?:\.\d+)?\s*(?:GPA|CGPA|IELTS|TOEFL|SAT|ACT|score)|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s*(?:19|20)?\d{2}|\d{1,2}(?:st|nd|rd|th)\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+(?:19|20)?\d{2})?|(?:Fall|Spring|Summer|Winter)\s+(?:19|20)?\d{2}|\d+(?:\.\d+)?\s*(?:per\s+(?:year|semester|month|week|credit|hour))|tuition\s+(?:fees?|costs?)\s*(?:of\s+)?\$?[\d,]+(?:\.\d{2})?|application\s+fee\s*(?:of\s+)?\$?[\d,]+(?:\.\d{2})?|scholarship\s+(?:of\s+|worth\s+)?\$?[\d,]+(?:\.\d{2})?)/gi,
      '<span class="font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200">$1</span>'
    );
  };

  // Fetch user's visa rejection analyses with optimized caching
  const { data: analyses = [], isLoading } = useQuery<VisaAnalysis[]>({
    queryKey: ['/api/analyses'],
    staleTime: 20 * 60 * 1000, // 20 minutes
    refetchOnMount: false,
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
        setSelectedAnalysis(targetAnalysis);
      }
    }
  }, [analyses.length, selectedAnalysis]);

  // Upload and analyze document mutation
  const analyzeMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/analyze', {
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
        description: "Your visa document has been analyzed successfully."
      });
      setSelectedFile(null);
      setUploadProgress(0);
      queryClient.invalidateQueries({ queryKey: ['/api/analyses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      setSelectedAnalysis(data);
    },
    onError: (error: any) => {
      console.error('Analysis mutation error:', error);
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
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to analyze.",
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

    analyzeMutation.mutate(selectedFile, {
      onSettled: () => {
        clearInterval(progressInterval);
        setUploadProgress(100);
        setTimeout(() => setUploadProgress(0), 1000);
      }
    });
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (selectedAnalysis) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Visa Analysis Results</h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">{selectedAnalysis.filename}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                // Instant navigation using browser history for zero delay
                window.history.back();
              }}
              className="w-full sm:w-auto hover:bg-gray-50 transition-colors duration-75"
            >
              ← Back to Analysis
            </Button>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="reasons">Key Findings</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800">Analysis Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {(selectedAnalysis as any)?.analysisResults?.summary || (selectedAnalysis as any)?.summary || 'No summary available'}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reasons" className="space-y-6">
              <div className="grid gap-6">
                {((selectedAnalysis as any)?.analysisResults?.rejectionReasons || (selectedAnalysis as any)?.rejectionReasons || []).map((reason: any, index: number) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-lg text-gray-800">{reason.title}</h3>
                        <Badge className={`${getSeverityBadgeColor(reason.severity || reason.category || 'medium')} border`}>
                          {(reason.severity || reason.category || 'medium').replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{reason.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6">
              <div className="grid gap-6">
                {((selectedAnalysis as any)?.analysisResults?.recommendations || (selectedAnalysis as any)?.recommendations || []).map((rec: any, index: number) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Target className="h-4 w-4" />
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
            <h1 className="text-2xl sm:text-3xl font-bold">Visa Analysis</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Upload your visa document (approval or rejection) to get detailed analysis, key information, and recommendations.
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Upload Your Visa Document
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* File Upload Area */}
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
                      <CheckCircle className="h-12 w-12 text-green-600" />
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

              {/* Analysis Progress */}
              {uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Analyzing document...</span>
                    <span className="text-blue-600 font-medium">{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  {user && (
                    <span>
                      Analysis quota: {user.analysisCount}/{user.maxAnalyses} used
                    </span>
                  )}
                </div>
                <Button
                  onClick={handleAnalyze}
                  disabled={!selectedFile || analyzeMutation.isPending || (user && user.analysisCount >= user.maxAnalyses)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {analyzeMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Analyzing...
                    </div>
                  ) : (user && user.analysisCount >= user.maxAnalyses) ? (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Limit Reached
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Analyze Visa
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Previous Analyses */}
        {analyses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                <Clock className="h-5 w-5 text-gray-600" />
                Previous Analyses
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-4">
                {analyses.map((analysis: VisaAnalysis) => (
                  <div
                    key={analysis.id}
                    className="flex items-center justify-between p-4 bg-gray-50 hover:bg-red-50 rounded-lg cursor-pointer transition-colors duration-200 border border-gray-200 hover:border-red-300"
                    onClick={() => setSelectedAnalysis(analysis)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-red-100 p-2 rounded-lg">
                        <FileText className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{analysis.filename}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Visa Document Analysis</span>
                          <span>{new Date(analysis.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-red-600">
                      <span className="text-sm font-medium">View Analysis</span>
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Details Modal */}
        {selectedAnalysis && (
          <Dialog open={!!selectedAnalysis} onOpenChange={() => setSelectedAnalysis(null)}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
              <div className="space-y-6">
                {/* Analysis Header */}
                <div className="bg-white rounded-lg border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900">Visa Analysis Results</h2>
                      <p className="text-gray-600 mt-1">Document: {selectedAnalysis?.filename || 'Unknown'}</p>
                      <p className="text-gray-500 text-sm mt-1">
                        Analyzed on {selectedAnalysis?.createdAt ? format(new Date(selectedAnalysis.createdAt), 'PPp') : 'Unknown date'}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setSelectedAnalysis(null)}>
                      ← Back to My Analysis
                    </Button>
                  </div>

                  {/* Quick Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <span className="font-medium">Document Type</span>
                        </div>
                        <p className="text-sm text-gray-600">Visa Document</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-5 w-5 text-green-600" />
                          <span className="font-medium">Analysis Date</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {format(new Date(selectedAnalysis.createdAt), "MMM dd, yyyy")}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-5 w-5 text-purple-600" />
                          <span className="font-medium">Status</span>
                        </div>
                        <p className="text-sm text-gray-600">Analysis Complete</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Tabbed Content */}
                  <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm border">
                      <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Overview</TabsTrigger>
                      <TabsTrigger value="issues" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700">Issues Found</TabsTrigger>
                      <TabsTrigger value="recommendations" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">Recommendations</TabsTrigger>
                      <TabsTrigger value="next-steps" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">Next Steps</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                      {/* Document Summary */}
                      {selectedAnalysis?.analysisResults?.summary && (
                        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                            <CardTitle className="text-xl text-gray-800">Document Summary</CardTitle>
                          </CardHeader>
                          <CardContent className="p-6">
                            <div 
                              className="whitespace-pre-wrap text-gray-700 leading-relaxed"
                              dangerouslySetInnerHTML={{ 
                                __html: formatNumericalInfo(selectedAnalysis?.analysisResults?.summary || '') 
                              }}
                            />
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>

                    <TabsContent value="issues" className="space-y-6">
                      {selectedAnalysis?.analysisResults?.rejectionReasons?.map((reason: any, index: number) => (
                        <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="font-semibold text-lg text-gray-800">{reason.title}</h3>
                              <Badge variant={reason.severity === 'high' ? 'destructive' : reason.severity === 'medium' ? 'default' : 'secondary'}>
                                {reason.severity}
                              </Badge>
                            </div>
                            <div 
                              className="text-gray-700 leading-relaxed"
                              dangerouslySetInnerHTML={{ 
                                __html: formatNumericalInfo(reason.description) 
                              }}
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>

                    <TabsContent value="recommendations" className="space-y-6">
                      {selectedAnalysis.analysisResults?.recommendations?.map((recommendation, index) => (
                        <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                          <CardContent className="p-6">
                            <h3 className="font-semibold text-lg text-gray-800 mb-3">{recommendation.title}</h3>
                            <div 
                              className="text-gray-700 leading-relaxed"
                              dangerouslySetInnerHTML={{ 
                                __html: formatNumericalInfo(recommendation.description) 
                              }}
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>

                    <TabsContent value="next-steps" className="space-y-6">
                      {Array.isArray(selectedAnalysis.analysisResults?.nextSteps) 
                        ? selectedAnalysis.analysisResults.nextSteps.map((step, index) => (
                            <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                              <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                  <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                                    {index + 1}
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-lg text-gray-800 mb-3">
                                      {typeof step === 'string' ? `Step ${index + 1}` : (step as any).title}
                                    </h3>
                                    <div 
                                      className="text-gray-700 leading-relaxed"
                                      dangerouslySetInnerHTML={{ 
                                        __html: formatNumericalInfo(
                                          typeof step === 'string' ? step : (step as any).description
                                        ) 
                                      }}
                                    />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        : selectedAnalysis.analysisResults?.nextSteps && (
                            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                              <CardContent className="p-6">
                                <div 
                                  className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                                  dangerouslySetInnerHTML={{ 
                                    __html: formatNumericalInfo(selectedAnalysis.analysisResults.nextSteps) 
                                  }}
                                />
                              </CardContent>
                            </Card>
                          )
                      }
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Customized CTA Section for Visa Analysis */}
        <CustomCTA variant="visa-analysis" source="visa-analysis-page" className="mt-8" />
      </div>
    </DashboardLayout>
  );
}