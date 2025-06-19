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
  GraduationCap, 
  FileText, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Users, 
  Calendar,
  Shield,
  BookOpen,
  CreditCard,
  AlertTriangle
} from 'lucide-react';

interface User {
  id: number;
  analysisCount: number;
  maxAnalyses: number;
}

interface CoEAnalysis {
  id: number;
  filename: string;
  documentType: string;
  institutionName?: string;
  studentName?: string;
  programName?: string;
  summary?: string;
  createdAt: string;
}

export default function CoEAnalysis() {
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

  // Fetch recent CoE analyses
  const { data: analyses = [], isLoading: isLoadingAnalyses } = useQuery<CoEAnalysis[]>({
    queryKey: ['/api/coe-analyses'],
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
      formData.append('documentType', 'coe');

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

      const response = await fetch('/api/coe-analysis', {
        method: 'POST',
        body: formData,
      });

      clearInterval(uploadInterval);

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message 
          ? `${errorData.error}\n\n${errorData.message}`
          : errorData.error || 'CoE analysis failed';
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
      
      return result;
    },
    onSuccess: (data) => {
      toast({
        title: "CoE Analysis Complete!",
        description: "Your Confirmation of Enrollment has been successfully analyzed.",
      });
      
      // Reset form
      setSelectedFile(null);
      setUploadProgress(0);
      setAnalysisProgress(0);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/coe-analyses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: Error) => {
      toast({
        title: "CoE Analysis Failed",
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
        description: "Please select a CoE document to analyze.",
        variant: "destructive",
      });
      return;
    }

    mutation.mutate();
  };

  const hasCreditsRemaining = user && user.analysisCount < user.maxAnalyses;
  const isProcessing = mutation.isPending;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-8 text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <GraduationCap className="h-10 w-10 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">COE Document Analysis</h1>
            </div>
            <p className="text-lg text-gray-700">
              Specialized AI-powered analysis for Confirmation of Enrollment (COE) documents from universities worldwide. 
              Extract comprehensive institution details, financial breakdown, and compliance requirements.
            </p>
            <div className="flex justify-center items-center gap-6 mt-6">
              <div className="flex items-center gap-2 text-blue-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">COE Specialized</span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <Shield className="h-5 w-5" />
                <span className="font-medium">Compliance Check</span>
              </div>
              <div className="flex items-center gap-2 text-purple-600">
                <DollarSign className="h-5 w-5" />
                <span className="font-medium">Financial Analysis</span>
              </div>
            </div>
          </div>
        </div>

        {/* CoE Analysis Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="p-6 text-center">
              <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-blue-800 mb-2">Institution & Course Details</h3>
              <p className="text-sm text-blue-700">CRICOS codes, course structure, program duration, and academic requirements</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-6 text-center">
              <CreditCard className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-green-800 mb-2">Financial Breakdown</h3>
              <p className="text-sm text-green-700">Tuition fees, OSHC, payment schedules, and scholarship information</p>
            </CardContent>
          </Card>
          <Card className="border-purple-200 bg-purple-50/50">
            <CardContent className="p-6 text-center">
              <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-purple-800 mb-2">Visa Compliance</h3>
              <p className="text-sm text-purple-700">Student visa obligations, work rights, and compliance requirements</p>
            </CardContent>
          </Card>
        </div>

        {/* Upload Section */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Upload className="h-6 w-6" />
              Upload Your COE Document
            </CardTitle>
            <CardDescription className="text-blue-50">
              Our specialized AI analyzes COE documents to extract critical enrollment and compliance information
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {/* Document Type Information */}
            <div className="space-y-3">
              <label className="text-base font-semibold text-gray-800">Document Type</label>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                  <div className="flex-1">
                    <div className="font-medium text-blue-800">Confirmation of Enrollment (COE)</div>
                    <div className="text-sm text-blue-600">University enrollment confirmation - specialized analysis for all countries</div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active Template</Badge>
                </div>
              </div>
              
              {/* COE Requirements Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-amber-800 mb-1">COE Documents Only</h4>
                    <p className="text-sm text-amber-700">
                      This analysis is specifically designed for Confirmation of Enrollment documents from any country. 
                      Other enrollment documents (I-20, CAS, Admission Letters) require different analysis templates.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-4">
              <label className="text-base font-semibold text-gray-800">Upload CoE Document</label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                {selectedFile ? (
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-700">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Badge className="bg-green-100 text-green-800">Ready for Analysis</Badge>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-700">
                      {isDragActive ? 'Drop your CoE document here' : 'Drag & drop or click to upload'}
                    </p>
                    <p className="text-sm text-gray-500">PDF, JPG, PNG up to 10MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Indicators */}
            {isProcessing && (
              <div className="space-y-4">
                {uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading document...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
                
                {analysisProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Analyzing COE document...</span>
                      <span>{analysisProgress}%</span>
                    </div>
                    <Progress value={analysisProgress} className="h-2" />
                  </div>
                )}
              </div>
            )}

            {/* Credits & Action */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-gray-600">
                  Analysis Credits: <span className="font-semibold text-blue-600">
                    {user ? `${user.maxAnalyses - user.analysisCount} remaining` : 'Loading...'}
                  </span>
                </span>
              </div>
              
              <Button
                onClick={handleAnalysis}
                disabled={!selectedFile || !hasCreditsRemaining || isProcessing}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              >
                {isProcessing ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing COE...
                  </>
                ) : (
                  <>
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Analyze COE Document
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent CoE Analyses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-600" />
              Recent COE Analyses
            </CardTitle>
            <CardDescription>
              Your previously analyzed Confirmation of Enrollment documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAnalyses ? (
              <div className="text-center py-8 text-gray-500">Loading analyses...</div>
            ) : analyses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No COE analyses yet. Upload your first COE document above.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analyses.slice(0, 6).map((analysis: CoEAnalysis) => (
                  <Card 
                    key={analysis.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setLocation(`/coe-analysis/${analysis.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <FileText className="h-8 w-8 text-blue-600 mt-1" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {analysis.filename}
                          </h4>
                          {analysis.institutionName && (
                            <p className="text-sm text-gray-600 truncate">
                              {analysis.institutionName}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">COE</Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(analysis.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}