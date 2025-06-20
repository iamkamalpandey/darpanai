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
  Info,
  Star,
  Shield,
  GraduationCap,
  ArrowRight
} from 'lucide-react';

interface UserStats {
  analysisCount: number;
  maxAnalyses: number;
  remainingAnalyses: number;
}

interface AnalysisItem {
  id: number;
  fileName: string;
  analysisDate: string;
  universityInfo?: {
    name?: string;
  };
  universityName?: string;
  program?: string;
  createdAt: string;
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

  const canAnalyze = userStats && userStats.remainingAnalyses > 0;
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
      <div className="space-y-8">
        {/* Header - Match COE Analysis Style */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Star className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Offer Letter Analysis</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your university offer letter for comprehensive AI-powered analysis. Get detailed 
            strategic insights, financial assessment, and actionable enrollment recommendations.
          </p>
        </div>

        {/* Analysis Card - Match COE Analysis Style */}
        <div className="max-w-4xl mx-auto">
          <Card className="relative overflow-hidden border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                Available
              </Badge>
            </div>
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Star className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl text-blue-900 mb-2">Offer Letter Analysis</CardTitle>
                  <CardDescription className="text-blue-700">
                    Comprehensive AI-powered strategic analysis for university offer letters including 
                    institution verification, financial breakdown, risk assessment, and actionable recommendations.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Feature Highlights */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
                  <University className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm text-blue-900 mb-1">Institution Analysis</h4>
                  <p className="text-xs text-blue-600">Verify accreditation, program quality, and institutional standing</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
                  <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm text-blue-900 mb-1">Financial Assessment</h4>
                  <p className="text-xs text-blue-600">Cost analysis, ROI calculations, and funding strategies</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
                  <Target className="h-5 w-5 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm text-blue-900 mb-1">Strategic Guidance</h4>
                  <p className="text-xs text-blue-600">Actionable insights for enrollment decisions and career planning</p>
                </div>
              </div>

              {/* Quota Warning */}
              {!canAnalyze && userStats && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>Analysis Quota Reached:</strong> You have used all {userStats.maxAnalyses} available analyses. 
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
              <div className="pt-2">
                <Button
                  onClick={() => mutation.mutate()}
                  disabled={!selectedFile || isProcessing || !canAnalyze}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Analyzing Document...
                    </>
                  ) : (
                    <>
                      <span>Analyze Offer Letter</span>
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Stats & Recent Analyses Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
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
                    <Badge variant={userStats.remainingAnalyses <= 0 ? "destructive" : "secondary"}>
                      {userStats.remainingAnalyses} remaining
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

        {/* Recent Analyses */}
        {analyses.length > 0 && (
          <Card className="shadow-lg max-w-6xl mx-auto">
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
                            {analysis.universityName || analysis.universityInfo?.name || 'Analysis completed'}
                          </p>
                          {analysis.program && (
                            <p className="text-xs text-gray-500">{analysis.program}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="bg-white">
                          {new Date(analysis.createdAt || analysis.analysisDate).toLocaleDateString()}
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