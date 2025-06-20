import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { CustomCTA } from "@/components/CustomCTA";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle,
  Target,
  DollarSign,
  Calendar,
  Eye,
  Building,
  User,
  Loader2,
  Plus,
  Shield
} from "lucide-react";

interface OfferLetterAnalysisItem {
  id: number;
  fileName: string;
  fileSize: number;
  analysisDate: string;
  universityInfo?: {
    name?: string;
    program?: string;
  };
}

export default function OfferLetterAnalysis() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Fetch user stats for analysis quota
  const { data: userStats } = useQuery({
    queryKey: ['/api/user/stats'],
  });

  // Fetch previous analyses
  const { data: analyses = [], isLoading } = useQuery<OfferLetterAnalysisItem[]>({
    queryKey: ['/api/offer-letter-analyses'],
    staleTime: 20 * 60 * 1000, // 20 minutes
  });

  // Upload and analyze mutation
  const analyzeMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('document', file);
      
      const response = await fetch('/api/offer-letter-analyses/analyze', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Analysis failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Analysis Complete",
        description: "Your offer letter has been analyzed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/offer-letter-analyses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
      setUploadedFile(null);
      // Navigate to the detailed analysis view
      setLocation(`/offer-letter-analysis/${data.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Something went wrong during analysis.",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF, JPG, or PNG file.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }

      setUploadedFile(file);
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    multiple: false,
    disabled: isAnalyzing || analyzeMutation.isPending
  });

  const handleAnalyze = async () => {
    if (!uploadedFile) return;

    // Check if user has analyses remaining
    if (userStats && userStats.analysisCount >= userStats.maxAnalyses) {
      toast({
        title: "Analysis Limit Reached",
        description: "You have reached your analysis limit. Please contact support to upgrade your plan.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      await analyzeMutation.mutateAsync(uploadedFile);
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsAnalyzing(false);
    }
  };

  const viewAnalysis = (analysis: OfferLetterAnalysisItem) => {
    setLocation(`/offer-letter-analysis/${analysis.id}`);
  };

  const canUpload = userStats && userStats.analysisCount < userStats.maxAnalyses;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Offer Letter Analysis</h1>
              <p className="text-gray-600 mt-1">
                Get comprehensive analysis of your offer letter with scholarship opportunities and cost-saving strategies
              </p>
            </div>
          </div>

          {/* Usage Stats */}
          {userStats && (
            <div className="flex items-center gap-4 text-sm">
              <Badge variant={canUpload ? "default" : "destructive"}>
                {userStats.analysisCount} / {userStats.maxAnalyses} analyses used
              </Badge>
              <span className="text-gray-600">
                {canUpload ? "You can upload more documents" : "Analysis limit reached"}
              </span>
            </div>
          )}
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Offer Letter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Upload */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                ${isDragActive ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-green-400'}
                ${!canUpload || isAnalyzing || analyzeMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input {...getInputProps()} disabled={!canUpload || isAnalyzing || analyzeMutation.isPending} />
              
              <div className="space-y-4">
                <div className="p-4 bg-green-100 rounded-full w-fit mx-auto">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
                
                {isDragActive ? (
                  <p className="text-lg font-medium text-green-600">Drop your offer letter here...</p>
                ) : (
                  <div>
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      {uploadedFile ? uploadedFile.name : 'Click to upload or drag and drop your offer letter'}
                    </p>
                    <p className="text-gray-600">
                      Supports PDF, JPG, PNG files up to 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Actions */}
            {uploadedFile && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-600">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setUploadedFile(null)}
                    disabled={isAnalyzing || analyzeMutation.isPending}
                  >
                    Remove
                  </Button>
                  <Button
                    onClick={handleAnalyze}
                    disabled={!canUpload || isAnalyzing || analyzeMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isAnalyzing || analyzeMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Analyze Document
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {!canUpload && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You have reached your analysis limit. Contact support to upgrade your plan for more analyses.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Features Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              What You'll Get
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600 mb-2" />
                <h4 className="font-semibold text-gray-900 mb-2">Document Analysis</h4>
                <p className="text-sm text-gray-600">
                  Complete terms & conditions examination, risk assessment, and compliance guidance
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <User className="h-6 w-6 text-purple-600 mb-2" />
                <h4 className="font-semibold text-gray-900 mb-2">Profile Analysis</h4>
                <p className="text-sm text-gray-600">
                  Academic standing assessment, strengths evaluation, and improvement areas
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <Target className="h-6 w-6 text-yellow-600 mb-2" />
                <h4 className="font-semibold text-gray-900 mb-2">Scholarship Research</h4>
                <p className="text-sm text-gray-600">
                  University-specific scholarships with eligibility matching and application guidance
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600 mb-2" />
                <h4 className="font-semibold text-gray-900 mb-2">Cost Optimization</h4>
                <p className="text-sm text-gray-600">
                  Proven strategies to reduce education costs with implementation timelines
                </p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-indigo-600 mb-2" />
                <h4 className="font-semibold text-gray-900 mb-2">Action Plan</h4>
                <p className="text-sm text-gray-600">
                  Step-by-step next steps with priorities and deadlines
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600 mb-2" />
                <h4 className="font-semibold text-gray-900 mb-2">Risk Mitigation</h4>
                <p className="text-sm text-gray-600">
                  Identify potential risks and get strategies to address them
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Previous Analyses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-full">
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
              Previous Analyses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : analyses.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Previous Analyses</h3>
                <p className="text-gray-500">
                  Upload your first offer letter to get comprehensive analysis and scholarship opportunities.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {analyses.map((analysis) => (
                  <div 
                    key={analysis.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => viewAnalysis(analysis)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">
                          {analysis.fileName}
                        </h4>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(analysis.analysisDate).toLocaleDateString()}
                          </span>
                          {analysis.universityInfo?.name && (
                            <span className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {analysis.universityInfo.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 text-sm font-medium">View Analysis</span>
                      <div className="p-1">
                        <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
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