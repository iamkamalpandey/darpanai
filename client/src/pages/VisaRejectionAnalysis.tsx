import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, AlertTriangle, Clock, TrendingUp, Sparkles, Target, CheckCircle } from 'lucide-react';
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
    summary?: string;
  };
  rejectionReasons?: RejectionReason[];
  recommendations?: Array<{
    title: string;
    description: string;
    priority: string;
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

  // Fetch user's visa rejection analyses
  const { data: analyses = [], isLoading } = useQuery<VisaAnalysis[]>({
    queryKey: ['/api/analyses'],
  });

  // Fetch current user for quota checking
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    enabled: true
  }) as { data: any };

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
        description: "Your visa rejection letter has been analyzed successfully."
      });
      setSelectedFile(null);
      setUploadProgress(0);
      queryClient.invalidateQueries({ queryKey: ['/api/analyses'] });
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
              <h1 className="text-2xl sm:text-3xl font-bold">Visa Rejection Analysis Results</h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">{selectedAnalysis.filename}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setSelectedAnalysis(null)}
              className="w-full sm:w-auto"
            >
              ← Back to Upload
            </Button>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="reasons">Rejection Reasons</TabsTrigger>
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
            <h1 className="text-2xl sm:text-3xl font-bold">Visa Rejection Analysis</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Upload your visa rejection letter to get detailed analysis and recommendations for improvement.
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-red-600" />
              Upload Your Rejection Letter
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* File Upload Area */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive
                    ? 'border-red-400 bg-red-50'
                    : selectedFile
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 hover:border-red-400 hover:bg-red-50'
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
                    <span className="text-red-600 font-medium">{Math.round(uploadProgress)}%</span>
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
                  disabled={!selectedFile || analyzeMutation.isPending}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 text-base font-medium"
                >
                  {analyzeMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Analyzing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Analyze Rejection
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
                {analyses.map((analysis) => (
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
                          <span>Visa Rejection Analysis</span>
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

        {/* Customized CTA Section for Visa Analysis */}
        <CustomCTA variant="visa-analysis" source="visa-analysis-page" className="mt-8" />
      </div>
    </DashboardLayout>
  );
}