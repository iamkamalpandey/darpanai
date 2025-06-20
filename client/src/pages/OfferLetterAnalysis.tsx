import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { useLocation } from 'wouter';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Users, 
  Calendar,
  Shield,
  TrendingUp,
  AlertCircle,
  Loader2,
  University,
  Target
} from 'lucide-react';

export default function OfferLetterAnalysis() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user stats for quota checking
  const { data: userStats } = useQuery({
    queryKey: ['/api/user/stats'],
    staleTime: 5 * 60 * 1000,
  });

  // Get user's analyses
  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ['/api/offer-letter-analyses'],
    staleTime: 5 * 60 * 1000,
  });

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
    disabled: mutation.isPending
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) {
        throw new Error('No file selected');
      }

      const formData = new FormData();
      formData.append('document', selectedFile);

      // Simulate upload progress
      setUploadProgress(0);
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(uploadInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/offer-letter-analyses/analyze', {
        method: 'POST',
        body: formData,
      });

      clearInterval(uploadInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Analysis Complete!",
        description: "Your offer letter has been analyzed successfully.",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/offer-letter-analyses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
      
      // Navigate to the analysis result
      if (data.analysis?.id) {
        setLocation(`/offer-letter-analysis/${data.analysis.id}`);
      }
      
      // Reset form
      setSelectedFile(null);
      setUploadProgress(0);
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
      setUploadProgress(0);
    }
  });

  const canAnalyze = userStats && userStats.analysisCount < userStats.maxAnalyses;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Offer Letter Analysis
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get comprehensive strategic analysis of your university offer letter with AI-powered insights, 
            scholarship opportunities, and actionable recommendations.
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <University className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Institution Analysis</h3>
              <p className="text-sm text-gray-600">Comprehensive evaluation of university accreditation and program quality</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Financial Assessment</h3>
              <p className="text-sm text-gray-600">Detailed cost analysis, ROI calculations, and funding strategies</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Strategic Recommendations</h3>
              <p className="text-sm text-gray-600">Actionable insights for enrollment decisions and career planning</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Offer Letter
                </CardTitle>
                <CardDescription>
                  Upload your university offer letter (PDF, JPG, or PNG) for comprehensive analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!canAnalyze && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You have reached your analysis limit. Contact support to increase your quota.
                    </AlertDescription>
                  </Alert>
                )}

                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragActive
                      ? 'border-blue-400 bg-blue-50'
                      : canAnalyze
                      ? 'border-gray-300 hover:border-gray-400 cursor-pointer'
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                >
                  <input {...getInputProps()} disabled={!canAnalyze} />
                  <Upload className={`h-12 w-12 mx-auto mb-4 ${canAnalyze ? 'text-gray-400' : 'text-gray-300'}`} />
                  
                  {selectedFile ? (
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className={`text-sm font-medium ${canAnalyze ? 'text-gray-900' : 'text-gray-500'}`}>
                        {isDragActive ? 'Drop your file here' : 'Drop your offer letter here or click to browse'}
                      </p>
                      <p className={`text-xs ${canAnalyze ? 'text-gray-500' : 'text-gray-400'}`}>
                        PDF, JPG, PNG up to 10MB
                      </p>
                    </div>
                  )}
                </div>

                {mutation.isPending && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Analyzing document...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                )}

                <Button
                  onClick={() => mutation.mutate()}
                  disabled={!selectedFile || mutation.isPending || !canAnalyze}
                  className="w-full"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Analyze Offer Letter
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Usage Stats */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Analysis Usage</CardTitle>
              </CardHeader>
              <CardContent>
                {userStats ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Used</span>
                      <span className="font-semibold">{userStats.analysisCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Limit</span>
                      <span className="font-semibold">{userStats.maxAnalyses}</span>
                    </div>
                    <Progress 
                      value={(userStats.analysisCount / userStats.maxAnalyses) * 100} 
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">
                      {userStats.maxAnalyses - userStats.analysisCount} analyses remaining
                    </p>
                  </div>
                ) : (
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-2 bg-gray-200 rounded"></div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Analysis Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Institution verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Financial analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Risk assessment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Strategic recommendations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Career guidance</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Analyses */}
        {analyses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Analyses</CardTitle>
              <CardDescription>Your previous offer letter analyses</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {analyses.slice(0, 5).map((analysis: any) => (
                    <div
                      key={analysis.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setLocation(`/offer-letter-analysis/${analysis.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="font-medium">{analysis.fileName}</p>
                          <p className="text-sm text-gray-600">
                            {analysis.universityInfo?.name || 'Processing...'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(analysis.analysisDate).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}