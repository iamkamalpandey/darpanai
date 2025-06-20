import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  AlertCircle,
  Loader2,
  University,
  Target,
  AlertTriangle,
  Info
} from 'lucide-react';

interface UserStats {
  analysisCount: number;
  maxAnalyses: number;
}

interface AnalysisItem {
  id: number;
  fileName: string;
  analysisDate: string;
  universityInfo?: {
    name?: string;
  };
}

export default function OfferLetterAnalysis() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user stats for quota checking
  const { data: userStats } = useQuery<UserStats>({
    queryKey: ['/api/user/stats'],
    staleTime: 5 * 60 * 1000,
  });

  // Get user's analyses
  const { data: analyses = [], isLoading } = useQuery<AnalysisItem[]>({
    queryKey: ['/api/offer-letter-analyses'],
    staleTime: 5 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) {
        throw new Error('No file selected');
      }

      setUploadStatus('uploading');
      const formData = new FormData();
      formData.append('document', selectedFile);

      // Progressive upload simulation
      setUploadProgress(0);
      const stages = [
        { progress: 20, status: 'uploading', message: 'Uploading document...' },
        { progress: 40, status: 'processing', message: 'Extracting text...' },
        { progress: 60, status: 'processing', message: 'Processing with AI...' },
        { progress: 80, status: 'processing', message: 'Generating analysis...' },
        { progress: 95, status: 'processing', message: 'Finalizing results...' }
      ];

      let currentStage = 0;
      const progressInterval = setInterval(() => {
        if (currentStage < stages.length) {
          const stage = stages[currentStage];
          setUploadProgress(stage.progress);
          setUploadStatus(stage.status as any);
          currentStage++;
        }
      }, 800);

      try {
        const response = await fetch('/api/offer-letter-analyses/analyze', {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressInterval);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || errorData.error || 'Analysis failed');
        }

        const result = await response.json();
        setUploadProgress(100);
        setUploadStatus('success');
        
        return result;
      } catch (error) {
        clearInterval(progressInterval);
        setUploadStatus('error');
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Analysis Complete!",
        description: "Your offer letter analysis is ready to view.",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/offer-letter-analyses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
      
      // Navigate to the analysis result
      if (data.analysisId) {
        setTimeout(() => {
          setLocation(`/offer-letter-analysis/${data.analysisId}`);
        }, 1500);
      }
      
      // Reset form after delay
      setTimeout(() => {
        setSelectedFile(null);
        setUploadProgress(0);
        setUploadStatus('idle');
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
      setUploadProgress(0);
      setUploadStatus('error');
      
      // Reset to idle after delay
      setTimeout(() => {
        setUploadStatus('idle');
      }, 3000);
    }
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please select a PDF, JPG, or PNG file.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      setUploadStatus('idle');
    }
  };

  const canAnalyze = userStats && userStats.analysisCount < userStats.maxAnalyses;
  const isProcessing = mutation.isPending || uploadStatus === 'uploading' || uploadStatus === 'processing';

  const getStatusMessage = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'Uploading your document...';
      case 'processing':
        return 'AI is analyzing your offer letter...';
      case 'success':
        return 'Analysis complete! Redirecting to results...';
      case 'error':
        return 'Analysis failed. Please try again.';
      default:
        return 'Ready to analyze your offer letter';
    }
  };

  const getStatusColor = () => {
    switch (uploadStatus) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'uploading':
      case 'processing':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-full">
            <University className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">AI-Powered Document Analysis</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Offer Letter Analysis
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Upload your university offer letter and get comprehensive strategic analysis including 
            institution verification, financial breakdown, risk assessment, and actionable recommendations.
          </p>
        </div>

        {/* Enhanced Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <University className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Institution Analysis</h3>
              <p className="text-sm text-gray-700">Verify accreditation, program quality, and institutional standing</p>
            </CardContent>
          </Card>
          
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Financial Assessment</h3>
              <p className="text-sm text-gray-700">Detailed cost analysis, ROI calculations, and funding strategies</p>
            </CardContent>
          </Card>
          
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Strategic Guidance</h3>
              <p className="text-sm text-gray-700">Actionable insights for enrollment decisions and career planning</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Upload Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3">
                  <Upload className="h-6 w-6" />
                  Upload Your Offer Letter
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Supported formats: PDF, JPG, PNG • Maximum size: 10MB
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Quota Warning */}
                {!canAnalyze && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>Analysis Quota Reached:</strong> You have used all available analyses. 
                      Contact support to increase your quota.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Status Display */}
                <div className="text-center space-y-2">
                  <p className={`text-sm font-medium ${getStatusColor()}`}>
                    {getStatusMessage()}
                  </p>
                  {uploadStatus === 'success' && (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Redirecting to your analysis...</span>
                    </div>
                  )}
                </div>

                {/* File Upload Area */}
                <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  uploadStatus === 'success' 
                    ? 'border-green-300 bg-green-50' 
                    : uploadStatus === 'error'
                    ? 'border-red-300 bg-red-50'
                    : canAnalyze 
                    ? 'border-blue-300 bg-blue-50 hover:border-blue-400' 
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  {uploadStatus === 'success' ? (
                    <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
                  ) : uploadStatus === 'error' ? (
                    <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-600" />
                  ) : (
                    <Upload className={`h-16 w-16 mx-auto mb-4 ${canAnalyze ? 'text-blue-400' : 'text-gray-300'}`} />
                  )}
                  
                  {selectedFile ? (
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-600">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-gray-900">
                        Select Your Offer Letter
                      </p>
                      <p className="text-sm text-gray-600">
                        Choose a PDF, JPG, or PNG file to analyze
                      </p>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    disabled={!canAnalyze || isProcessing}
                    className="mt-6 block w-full text-sm text-gray-500
                      file:mr-4 file:py-3 file:px-6
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-600 file:text-white
                      hover:file:bg-blue-700 file:transition-colors
                      disabled:file:bg-gray-400 disabled:file:cursor-not-allowed"
                  />
                </div>

                {/* Progress Bar */}
                {isProcessing && (
                  <div className="space-y-3">
                    <Progress value={uploadProgress} className="w-full h-3" />
                    <div className="flex items-center justify-center gap-2 text-blue-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm font-medium">Processing your document...</span>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <Button
                  onClick={() => mutation.mutate()}
                  disabled={!selectedFile || isProcessing || !canAnalyze}
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Analyzing Document...
                    </>
                  ) : (
                    <>
                      <FileText className="h-5 w-5 mr-2" />
                      Start Analysis
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Usage Stats */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gray-50 rounded-t-lg">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Usage Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {userStats ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Analyses Used</span>
                      <span className="text-2xl font-bold text-blue-600">{userStats.analysisCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Total Limit</span>
                      <span className="text-2xl font-bold text-gray-900">{userStats.maxAnalyses}</span>
                    </div>
                    <Progress 
                      value={(userStats.analysisCount / userStats.maxAnalyses) * 100} 
                      className="w-full h-3"
                    />
                    <div className="text-center">
                      <Badge variant={userStats.analysisCount >= userStats.maxAnalyses ? "destructive" : "secondary"}>
                        {userStats.maxAnalyses - userStats.analysisCount} remaining
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded"></div>
                    <div className="h-6 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Analysis Features */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gray-50 rounded-t-lg">
                <CardTitle className="text-lg">What You'll Get</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[
                    { icon: CheckCircle, text: "Institution verification & accreditation" },
                    { icon: DollarSign, text: "Complete financial breakdown" },
                    { icon: Target, text: "Risk assessment matrix" },
                    { icon: University, text: "Program quality evaluation" },
                    { icon: FileText, text: "Strategic recommendations" }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <feature.icon className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Analyses */}
        {analyses.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Analyses
              </CardTitle>
              <CardDescription>Your previous offer letter analyses</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {analyses.slice(0, 3).map((analysis) => (
                    <div
                      key={analysis.id}
                      className="flex items-center justify-between p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all"
                      onClick={() => setLocation(`/offer-letter-analysis/${analysis.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{analysis.fileName}</p>
                          <p className="text-sm text-gray-600">
                            {analysis.universityInfo?.name || 'Processing completed'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="bg-white">
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