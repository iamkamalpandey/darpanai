import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { useLocation } from 'wouter';
import { 
  Upload, 
  Target, 
  FileText, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Users, 
  Calendar,
  Shield,
  Eye,
  Building,
  TrendingUp,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { CustomCTA } from '@/components/CustomCTA';
import { users } from "@shared/schema";

type User = typeof users.$inferSelect;

interface OfferLetterAnalysisItem {
  id: number;
  fileName: string;
  fileSize: number;
  analysisDate: string;
  universityInfo?: {
    name?: string;
    program?: string;
  };
  createdAt: string;
}

export default function OfferLetterAnalysis() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Fetch user data for credit validation
  const { data: user } = useQuery<User>({
    queryKey: ['/api/user'],
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  // Fetch recent offer letter analyses
  const { data: analyses = [], isLoading: isLoadingAnalyses } = useQuery<OfferLetterAnalysisItem[]>({
    queryKey: ['/api/offer-letter-analyses'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
      }
    },
    onDropRejected: () => {
      toast({
        title: "File Error",
        description: "Please upload a PDF, JPG, or PNG file under 10MB.",
        variant: "destructive",
      });
    }
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
        const errorMessage = errorData.message 
          ? `${errorData.error}\n\n${errorData.message}`
          : errorData.error || 'Offer letter analysis failed';
        throw new Error(errorMessage);
      }

      // Simulate analysis progress
      setAnalysisProgress(0);
      const analysisInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 100) {
            clearInterval(analysisInterval);
            return 100;
          }
          return prev + 15;
        });
      }, 300);

      const result = await response.json();
      clearInterval(analysisInterval);
      setAnalysisProgress(100);

      return result;
    },
    onSuccess: (data) => {
      toast({
        title: "Analysis Complete",
        description: "Your offer letter has been analyzed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/offer-letter-analyses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      setSelectedFile(null);
      setUploadProgress(0);
      setAnalysisProgress(0);
      // Navigate to the detailed analysis view
      setLocation(`/offer-letter-analysis/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Offer Letter Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
      
      setUploadProgress(0);
      setAnalysisProgress(0);
    },
  });

  const handleAnalysis = () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select an offer letter document to analyze.",
        variant: "destructive",
      });
      return;
    }

    mutation.mutate();
  };

  const viewAnalysis = (analysis: OfferLetterAnalysisItem) => {
    setLocation(`/offer-letter-analysis/${analysis.id}`);
  };

  const hasCreditsRemaining = user && user.analysisCount < user.maxAnalyses;
  const isProcessing = mutation.isPending;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-8 text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Target className="h-10 w-10 text-green-600" />
              <h1 className="text-4xl font-bold text-gray-900">Offer Letter Analysis</h1>
            </div>
            <p className="text-lg text-gray-700">
              Comprehensive AI-powered analysis of your university offer letters with strategic scholarship matching, 
              detailed terms examination, and verified recommendations from official university sources.
            </p>
            <div className="flex justify-center items-center gap-6 mt-6">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Scholarship Research</span>
              </div>
              <div className="flex items-center gap-2 text-blue-600">
                <DollarSign className="h-5 w-5" />
                <span className="font-medium">Cost Optimization</span>
              </div>
              <div className="flex items-center gap-2 text-purple-600">
                <Shield className="h-5 w-5" />
                <span className="font-medium">Terms Analysis</span>
              </div>
            </div>

            {/* Usage Stats */}
            {user && (
              <div className="flex justify-center mt-6">
                <Badge variant={hasCreditsRemaining ? "secondary" : "destructive"} className="text-sm">
                  {user.analysisCount} / {user.maxAnalyses} analyses used
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Offer Letter
            </CardTitle>
            <CardDescription>
              Upload your university offer letter to get comprehensive analysis with scholarship opportunities and cost-saving strategies.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                ${isDragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400'}
                ${!hasCreditsRemaining || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input {...getInputProps()} disabled={!hasCreditsRemaining || isProcessing} />
              
              <div className="space-y-4">
                <div className="p-4 bg-green-100 rounded-full w-fit mx-auto">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
                
                {isDragActive ? (
                  <p className="text-lg font-medium text-green-600">Drop your offer letter here...</p>
                ) : (
                  <div>
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      {selectedFile ? selectedFile.name : 'Click to upload or drag and drop your offer letter'}
                    </p>
                    <p className="text-gray-600">
                      Supports PDF, JPG, PNG files up to 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* File Preview */}
            {selectedFile && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-600">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedFile(null)}
                    disabled={isProcessing}
                  >
                    Remove
                  </Button>
                  <Button
                    onClick={handleAnalysis}
                    disabled={!hasCreditsRemaining || isProcessing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze Offer Letter'
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Progress Indicators */}
            {isProcessing && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Upload Progress</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Analysis Progress</span>
                    <span>{analysisProgress}%</span>
                  </div>
                  <Progress value={analysisProgress} className="h-2" />
                </div>
              </div>
            )}

            {/* Credit Limit Warning */}
            {!hasCreditsRemaining && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-800">Analysis Limit Reached</p>
                  <p className="text-sm text-red-600">
                    You've used all {user?.maxAnalyses || 0} analyses. Contact support to increase your limit.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Analyses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Offer Letter Analyses
            </CardTitle>
            <CardDescription>
              View your previous offer letter analysis reports and results.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAnalyses ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Loading your analyses...</p>
              </div>
            ) : analyses.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No offer letter analyses yet</p>
                <p className="text-sm text-gray-500">Upload your first offer letter to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analyses.map((analysis) => (
                  <div key={analysis.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-green-100 rounded">
                        <FileText className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{analysis.fileName}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(analysis.analysisDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {analysis.universityInfo?.name || 'University details available'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewAnalysis(analysis)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Analysis
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* CTA Section */}
        <CustomCTA variant="offer-letter-analysis" />
      </div>
    </DashboardLayout>
  );
}