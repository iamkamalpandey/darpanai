import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Upload, FileCheck, CheckCircle, Calendar, Search, DollarSign, GraduationCap, Award, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CustomCTA } from '@/components/CustomCTA';
import { useAuth } from '@/hooks/use-auth';

interface EnrollmentAnalysis {
  id: number;
  filename: string;
  documentType: string;
  institutionName?: string;
  studentName?: string;
  programName?: string;
  summary?: string;
  createdAt: string;
}

export default function EnrollmentAnalysisUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch recent analyses
  const { data: analyses } = useQuery({
    queryKey: ['/api/enrollment-analyses'],
    staleTime: 5 * 60 * 1000,
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    multiple: false
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile || !documentType) {
        throw new Error('Please select a file and document type');
      }

      if (user && (user as any)?.analysisCount >= (user as any)?.maxAnalyses) {
        throw new Error('You have reached your analysis limit. Please upgrade your plan.');
      }

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('documentType', documentType);

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

      const response = await fetch('/api/enrollment-analysis', {
        method: 'POST',
        body: formData,
      });

      clearInterval(uploadInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
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
        title: "Analysis Complete!",
        description: "Your enrollment document has been successfully analyzed.",
      });
      
      // Reset form
      setSelectedFile(null);
      setDocumentType('');
      setUploadProgress(0);
      setAnalysisProgress(0);
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['/api/enrollment-analyses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
      
      setUploadProgress(0);
      setAnalysisProgress(0);
    },
  });

  const handleAnalysis = () => {
    mutation.mutate();
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">Enrollment Document Analysis</h1>
            <p className="text-lg text-gray-700">
              Get comprehensive AI-powered analysis of your enrollment documents including scholarship details, 
              financial information, academic requirements, and important deadlines.
            </p>
            <div className="flex justify-center items-center gap-6 mt-6">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Instant Analysis</span>
              </div>
              <div className="flex items-center gap-2 text-blue-600">
                <FileText className="h-5 w-5" />
                <span className="font-medium">Multiple Formats</span>
              </div>
              <div className="flex items-center gap-2 text-purple-600">
                <Award className="h-5 w-5" />
                <span className="font-medium">Detailed Insights</span>
              </div>
            </div>
          </div>
        </div>

        {/* Document Types Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6 text-center">
              <GraduationCap className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-green-800 mb-2">Academic Documents</h3>
              <p className="text-sm text-green-700">CoE, I-20, CAS statements with course and institution details</p>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6 text-center">
              <DollarSign className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-blue-800 mb-2">Financial Information</h3>
              <p className="text-sm text-blue-700">Tuition fees, scholarships, payment schedules, and costs</p>
            </CardContent>
          </Card>
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-6 text-center">
              <Briefcase className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-purple-800 mb-2">Requirements & Terms</h3>
              <p className="text-sm text-purple-700">Visa obligations, work authorization, and compliance terms</p>
            </CardContent>
          </Card>
        </div>

        {/* Upload Section */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Upload className="h-6 w-6" />
              Upload Your Enrollment Document
            </CardTitle>
            <CardDescription className="text-blue-50">
              Our AI analyzes your documents to extract key information and provide personalized recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {/* Document Type Selection */}
            <div className="space-y-3">
              <label className="text-base font-semibold text-gray-800">Select Document Type</label>
              <p className="text-sm text-gray-600 mb-4">Choose the type that best matches your document for accurate analysis</p>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Choose your document type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coe">
                    <div className="flex items-center gap-3 py-2">
                      <GraduationCap className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <div className="font-medium">Confirmation of Enrollment (CoE)</div>
                        <div className="text-sm text-gray-500">Australian university enrollment confirmation</div>
                      </div>
                      <Badge className="bg-green-100 text-green-800 text-xs">Available</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="i20" disabled>
                    <div className="flex items-center gap-3 py-2 opacity-50">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <div className="font-medium">I-20 Form</div>
                        <div className="text-sm text-gray-400">US student visa eligibility document</div>
                      </div>
                      <Badge className="bg-gray-100 text-gray-500 text-xs">Coming Soon</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="cas" disabled>
                    <div className="flex items-center gap-3 py-2 opacity-50">
                      <Award className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <div className="font-medium">CAS Statement</div>
                        <div className="text-sm text-gray-400">UK Confirmation of Acceptance for Studies</div>
                      </div>
                      <Badge className="bg-gray-100 text-gray-500 text-xs">Coming Soon</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="admission_letter" disabled>
                    <div className="flex items-center gap-3 py-2 opacity-50">
                      <CheckCircle className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <div className="font-medium">Admission Letter</div>
                        <div className="text-sm text-gray-400">University admission confirmation letter</div>
                      </div>
                      <Badge className="bg-gray-100 text-gray-500 text-xs">Coming Soon</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="offer_letter" disabled>
                    <div className="flex items-center gap-3 py-2 opacity-50">
                      <Briefcase className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <div className="font-medium">Offer Letter</div>
                        <div className="text-sm text-gray-400">Conditional or unconditional offer letter</div>
                      </div>
                      <Badge className="bg-gray-100 text-gray-500 text-xs">Coming Soon</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="enrollment_letter" disabled>
                    <div className="flex items-center gap-3 py-2 opacity-50">
                      <FileCheck className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <div className="font-medium">Enrollment Letter</div>
                        <div className="text-sm text-gray-400">Official enrollment confirmation document</div>
                      </div>
                      <Badge className="bg-gray-100 text-gray-500 text-xs">Coming Soon</Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* File Upload */}
            <div className="space-y-4">
              <label className="text-base font-semibold text-gray-800">Upload Document</label>
              <div 
                {...getRootProps()} 
                className={`border-3 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300
                  ${isDragActive 
                    ? 'border-blue-400 bg-blue-50 scale-105' 
                    : selectedFile 
                      ? 'border-green-400 bg-green-50' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                  }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-6">
                  {selectedFile ? (
                    <>
                      <div className="p-4 bg-green-100 rounded-full">
                        <FileCheck className="h-16 w-16 text-green-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-semibold text-green-800 mb-2">{selectedFile.name}</p>
                        <p className="text-green-600 mb-2">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                        <p className="text-sm text-gray-600">Click to change or drag a new file</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-4 bg-gray-100 rounded-full">
                        <Upload className="h-16 w-16 text-gray-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-semibold text-gray-700 mb-2">
                          {isDragActive ? 'Drop your document here' : 'Drag & drop your document'}
                        </p>
                        <p className="text-gray-500 mb-4">or click to browse files</p>
                        <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                          <span>PDF</span>
                          <span>•</span>
                          <span>JPG</span>
                          <span>•</span>
                          <span>PNG</span>
                          <span>•</span>
                          <span>Max 10MB</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Progress Indicators */}
            {(uploadProgress > 0 || analysisProgress > 0) && (
              <div className="space-y-4">
                {uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-blue-600">Uploading document...</span>
                      <span className="text-blue-600">{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
                
                {analysisProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-green-600">Analyzing document...</span>
                      <span className="text-green-600">{Math.round(analysisProgress)}%</span>
                    </div>
                    <Progress value={analysisProgress} className="h-2" />
                  </div>
                )}
              </div>
            )}

            {/* Credits and Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t">
              {user && (
                <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-800">
                    {(user as any)?.maxAnalyses - (user as any)?.analysisCount} analyses remaining
                  </span>
                </div>
              )}
              
              <Button
                onClick={handleAnalysis}
                disabled={!selectedFile || !documentType || mutation.isPending || analysisProgress > 0 || Boolean(user && (user as any)?.analysisCount >= (user as any)?.maxAnalyses)}
                className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 disabled:opacity-50 shadow-lg"
                size="lg"
              >
                {mutation.isPending ? (
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing Document...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Analyze Document
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Analyses */}
        {(analyses as any)?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Recent Enrollment Analyses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(analyses as any)?.slice(0, 6).map((analysis: EnrollmentAnalysis) => (
                  <div
                    key={analysis.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-sm truncate">{analysis.filename}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {new Date(analysis.createdAt).toLocaleDateString()}
                    </div>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {analysis.documentType}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTA Section */}
        <CustomCTA variant="enrollment-analysis" source="enrollment-analysis" />
      </div>
    </DashboardLayout>
  );
}