import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Brain, 
  Zap, 
  Eye,
  Download,
  Trash2,
  Clock,
  Target,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  BookOpen,
  Award,
  Map
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface DocumentAnalysis {
  id: number;
  fileName: string;
  analysisResults: any;
  documentType: string;
  confidence: number;
  processingTime: number;
  createdAt: string;
}

export default function EnhancedAcademicDocumentAnalysis() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's previous analyses
  const { data: analyses = [], isLoading: analysesLoading } = useQuery<DocumentAnalysis[]>({
    queryKey: ['/api/academic-document-analyses'],
  });

  // File upload mutation with progress tracking
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsProcessing(true);
      setProcessingStage('🚀 Initializing Multi-AI Processing Pipeline...');
      setAnalysisProgress(10);

      const formData = new FormData();
      formData.append('file', file);


      // Simulate progress updates during processing
      const progressInterval = setInterval(() => {
        setAnalysisProgress((prev) => {
          const stages = [
            { progress: 20, stage: '📄 Identifying transcript type (NEB/HSEB/University)...' },
            { progress: 35, stage: '🔍 Extracting transcript structure and tables...' },
            { progress: 55, stage: '🎯 Validating academic document format...' },
            { progress: 75, stage: '📊 Processing subject-wise marks and grades...' },
            { progress: 90, stage: '🏗️ Structuring transcript data for analysis...' }
          ];
          
          const currentStage = stages.find(s => prev < s.progress);
          if (currentStage) {
            setProcessingStage(currentStage.stage);
            return currentStage.progress;
          }
          return prev;
        });
      }, 2500);

      try {
        const response = await fetch('/api/academic-document-analysis', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        
        clearInterval(progressInterval);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to analyze academic document');
        }
        
        const result = await response.json();
        setAnalysisProgress(100);
        setProcessingStage('✅ Multi-AI Analysis Complete!');
        
        setTimeout(() => {
          setIsProcessing(false);
          setAnalysisProgress(0);
          setProcessingStage('');
        }, 1500);

        return result;
      } catch (error) {
        clearInterval(progressInterval);
        setIsProcessing(false);
        setAnalysisProgress(0);
        setProcessingStage('');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/academic-document-analyses'] });
      toast({
        title: 'Transcript Analysis Complete!',
        description: 'Your academic transcript has been successfully analyzed and structured data extracted.',
      });
    },
    onError: (error: any) => {
      toast({
        title: '❌ Analysis Failed',
        description: error.message || 'Failed to analyze document. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Delete analysis mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/academic-document-analyses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/academic-document-analyses'] });
      toast({
        title: 'Analysis Deleted',
        description: 'The analysis has been removed from your records.',
      });
    },
  });

  // File drop zone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        uploadMutation.mutate(acceptedFiles[0]);
      }
    },
    onDropRejected: (rejectedFiles) => {
      const file = rejectedFiles[0];
      if (file.errors[0]?.code === 'file-too-large') {
        toast({
          title: 'File Too Large',
          description: 'Please select a file smaller than 10MB.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a PDF, JPG, or PNG file.',
          variant: 'destructive',
        });
      }
    },
  });

  const formatProcessingTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-500';
    if (confidence >= 70) return 'bg-blue-500';
    if (confidence >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getDocumentTypeIcon = (type: string) => {
    if (!type) return <FileText className="h-4 w-4" />;
    
    switch (type.toLowerCase()) {
      case 'transcript': return <BookOpen className="h-4 w-4" />;
      case 'diploma': return <Award className="h-4 w-4" />;
      case 'certificate': return <ShieldCheck className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold">Academic Transcript Analysis</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Specialized AI-powered transcript processing system for NEB/HSEB, Tribhuvan University, and other Nepalese academic institutions. 
            Upload only academic transcripts for intelligent analysis and structured data extraction.
          </p>
          
          {/* AI Technology Badges */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <Map className="h-4 w-4 mr-2 text-blue-600" />
              Google Document AI
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <Target className="h-4 w-4 mr-2 text-purple-600" />
              Claude Sonnet 4.0
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <Brain className="h-4 w-4 mr-2 text-green-600" />
              OpenAI GPT-4
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <Sparkles className="h-4 w-4 mr-2 text-orange-600" />
              95%+ Accuracy
            </Badge>
          </div>
          
          {/* Processing Pipeline Visual */}
          <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100 max-w-4xl mx-auto">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 text-center">Multi-AI Processing Pipeline</h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                <Map className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Document AI</span>
              </div>
              <div className="hidden md:block text-gray-400">→</div>
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg border border-purple-200">
                <Target className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Classification</span>
              </div>
              <div className="hidden md:block text-gray-400">→</div>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
                <Brain className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Extraction</span>
              </div>
              <div className="hidden md:block text-gray-400">→</div>
              <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-lg border border-orange-200">
                <Sparkles className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-700">Structured Data</span>
              </div>
            </div>
          </div>
        </div>

        {/* Specialized Features Section */}
        <div className="mb-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center border-blue-200 bg-gradient-to-b from-blue-50 to-white">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <Map className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Transcript Type Detection</h3>
              <p className="text-sm text-gray-600">Automatically identifies NEB/HSEB, Tribhuvan University, and other institutional formats</p>
            </Card>
            
            <Card className="p-6 text-center border-purple-200 bg-gradient-to-b from-purple-50 to-white">
              <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Academic Institution Support</h3>
              <p className="text-sm text-gray-600">Specialized parsing for Nepalese educational system transcript structures</p>
            </Card>
            
            <Card className="p-6 text-center border-green-200 bg-gradient-to-b from-green-50 to-white">
              <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Dynamic Data Extraction</h3>
              <p className="text-sm text-gray-600">Adapts to different transcript layouts and extracts relevant academic fields</p>
            </Card>
            
            <Card className="p-6 text-center border-orange-200 bg-gradient-to-b from-orange-50 to-white">
              <div className="w-12 h-12 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Structured Data Output</h3>
              <p className="text-sm text-gray-600">Organizes semester/year data with subject codes, marks, and performance metrics</p>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <Card className="border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors duration-300">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Transcript
                </CardTitle>
                <CardDescription>
                  Upload academic transcripts only (NEB/HSEB, Tribhuvan University, etc.) for intelligent analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  {...getRootProps()}
                  className={`
                    relative p-8 text-center border-2 border-dashed rounded-lg transition-all duration-300 cursor-pointer
                    ${isDragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }
                  `}
                >
                  <input {...getInputProps()} />
                  
                  {isProcessing ? (
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Zap className="h-8 w-8 text-white animate-pulse" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-900">{processingStage}</p>
                        <Progress value={analysisProgress} className="h-2" />
                        <p className="text-xs text-gray-500">{analysisProgress}% complete</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Upload className="h-8 w-8 text-white" />
                      </div>
                      
                      {isDragActive ? (
                        <p className="text-blue-600 font-medium">Drop your transcript here</p>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-gray-900 font-medium">
                            Drag & drop your academic transcript or click to browse
                          </p>
                          <p className="text-sm text-gray-500">
                            Academic transcripts only • PDF, JPG, PNG • Max 10MB
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Processing Features */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Intelligent transcript type identification
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    NEB/HSEB and university transcript support
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Subject-wise marks and grade extraction
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Semester/year-wise academic data
                  </div>
                </div>
                
                {/* Transcript Only Warning */}
                <Alert className="mt-6 border-orange-200 bg-orange-50">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>Transcripts Only:</strong> Please upload academic transcripts only. 
                    Other documents (certificates, experience letters) will be rejected.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Results Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Transcript Analysis Results
                  </div>
                  <Badge variant="outline" className="px-3 py-1">
                    {analyses.length} Transcript{analyses.length !== 1 ? 's' : ''} Analyzed
                  </Badge>
                </CardTitle>
                <CardDescription>
                  View and manage your academic transcript analysis history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analysesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : analyses.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No transcripts analyzed yet</h3>
                    <p className="text-gray-500 mb-6">
                      Upload your first academic transcript to experience intelligent transcript analysis with structured data extraction
                    </p>
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Get Started
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {analyses.map((analysis: DocumentAnalysis) => (
                      <Card key={analysis.id} className="border border-gray-200 hover:shadow-md transition-shadow duration-200">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                {getDocumentTypeIcon(analysis.documentType)}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 break-words max-w-md">
                                  {analysis.fileName}
                                </h3>
                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatProcessingTime(analysis.processingTime)}
                                  </span>
                                  <span>
                                    {new Date(analysis.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <Badge 
                                  variant="outline" 
                                  className={`${getConfidenceColor(analysis.confidence)} text-white border-none`}
                                >
                                  {analysis.confidence}% confidence
                                </Badge>
                                <p className="text-xs text-gray-500 mt-1 capitalize">
                                  {analysis.documentType || 'Unknown'}
                                </p>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(`/academic-document-details/${analysis.id}`, '_blank')}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => deleteMutation.mutate(analysis.id)}
                                  disabled={deleteMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Quick Preview */}
                          {analysis.analysisResults && typeof analysis.analysisResults === 'object' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                              <div className="text-center">
                                <p className="text-sm font-medium text-gray-900">Institution</p>
                                <p className="text-xs text-gray-500 break-words">
                                  {analysis.analysisResults?.institutionName || 'Not specified'}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-medium text-gray-900">Qualification</p>
                                <p className="text-xs text-gray-500 break-words">
                                  {analysis.analysisResults?.qualificationLevel || 'Not specified'}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-medium text-gray-900">Field</p>
                                <p className="text-xs text-gray-500 break-words">
                                  {analysis.analysisResults?.fieldOfStudy || 'Not specified'}
                                </p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Technical Details Footer */}
        <div className="mt-16 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Intelligent Transcript Analysis</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Advanced AI system specifically designed for academic transcript processing, with intelligent type detection 
              and specialized support for Nepalese educational institutions.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
                <Map className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Transcript Type Detection</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                AI-powered identification of transcript types including NEB/HSEB Higher Secondary, 
                Tribhuvan University Bachelor's, and other Nepalese educational institutions.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-500 rounded-full flex items-center justify-center">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Dynamic Data Extraction</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Adaptive parsing system that adjusts to different transcript layouts and 
                structures to extract subject codes, marks, grades, and semester data.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Structured Output</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Organizes extracted data into structured JSON format with semester/year groupings, 
                subject-wise performance metrics, and academic progression tracking.
              </p>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>2-5 minute processing</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span>95%+ Accuracy Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>Multi-layer AI processing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden file input for manual selection */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              uploadMutation.mutate(file);
            }
          }}
        />
      </div>
    </div>
  );
}