import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  FileText, 
  Clock, 
  Brain,
  Users,
  ArrowLeft,
  Eye
} from "lucide-react";
import { useLocation } from "wouter";

interface AnalysisResult {
  id: number;
  analysis: any;
  processingTime: number;
  tokensUsed: number;
  scrapingTime: number;
}

interface AnalysisListItem {
  id: number;
  fileName: string;
  institutionName: string;
  program: string;
  createdAt: string;
  processingTime: number;
  tokensUsed: number;
}

export default function ComprehensiveOfferLetterAnalysisSimplified() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  // Fetch user stats for quota checking
  const { data: userStats } = useQuery<{ remainingAnalyses: number; maxAnalyses: number; analysisCount: number }>({
    queryKey: ['/api/user/stats'],
    staleTime: 5 * 60 * 1000,
  });

  // Fetch existing analyses
  const { data: analyses = [], isLoading: analysesLoading } = useQuery<AnalysisListItem[]>({
    queryKey: ['/api/offer-letter-analyses-new'],
    staleTime: 10 * 60 * 1000,
  });

  // Upload and analyze mutation
  const analyzeMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('document', file);

      // Simulate progress updates
      setUploadProgress(10);
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 1000);

      const response = await fetch('/api/offer-letter-analysis-new', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Analysis failed');
      }

      return response.json() as Promise<AnalysisResult>;
    },
    onSuccess: (result) => {
      setUploadProgress(0);
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ['/api/offer-letter-analyses-new'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
      toast({
        title: 'Analysis Complete',
        description: `Analysis completed in ${result.processingTime}ms using ${result.tokensUsed} tokens`,
      });
      // Navigate to the detailed view
      navigate(`/offer-letter-analysis/${result.id}`);
    },
    onError: (error: Error) => {
      setUploadProgress(0);
      toast({
        title: 'Analysis Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a PDF, JPG, or PNG file',
          variant: 'destructive',
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast({
          title: 'File Too Large',
          description: 'Please upload a file smaller than 10MB',
          variant: 'destructive',
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleAnalyze = () => {
    if (!selectedFile) return;
    
    if (userStats && userStats.remainingAnalyses <= 0) {
      toast({
        title: 'Analysis Quota Exceeded',
        description: 'You have reached your analysis limit. Please contact support for more analyses.',
        variant: 'destructive',
      });
      return;
    }

    analyzeMutation.mutate(selectedFile);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Offer Letter Analysis
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload your offer letter for comprehensive AI-powered analysis including institutional research, 
            scholarship matching, and competitive insights
          </p>
        </div>

        {/* Upload Section */}
        <Card className="border-2 border-dashed border-blue-300 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Offer Letter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="document-upload">Select Document (PDF, JPG, PNG - Max 10MB)</Label>
              <Input
                id="document-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
            </div>

            {selectedFile && (
              <div className="p-4 bg-white rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleAnalyze}
                    disabled={analyzeMutation.isPending}
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    {analyzeMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Analyzing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Analyze Document
                      </div>
                    )}
                  </Button>
                </div>

                {uploadProgress > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Processing...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
              </div>
            )}

            {/* Quota Display */}
            {userStats && (
              <div className="flex justify-center">
                <Badge variant="outline" className="bg-white">
                  {userStats.remainingAnalyses} / {userStats.maxAnalyses} analyses remaining
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Analysis History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysesLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 h-16 rounded-lg" />
                ))}
              </div>
            ) : analyses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No analyses yet. Upload your first offer letter to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {analyses.map((analysis) => (
                  <div key={analysis.id} className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <FileText className="h-8 w-8 text-blue-500 mt-1" />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {analysis.fileName || `Analysis #${analysis.id}`}
                          </h3>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>{analysis.institutionName || 'Institution data processing...'}</p>
                            <p>{analysis.program || 'Program data processing...'}</p>
                            <div className="flex gap-4 text-xs">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {analysis.processingTime}ms
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {analysis.tokensUsed} tokens
                              </span>
                              <span>{new Date(analysis.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/offer-letter-analysis/${analysis.id}`)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View Analysis
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}