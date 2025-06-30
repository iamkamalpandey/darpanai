import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, CheckCircle, AlertCircle, Brain, Sparkles, FileImage } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Analysis {
  id: number;
  fileName: string;
  fileType: string;
  status: string;
  createdAt: string;
  extractedData?: any;
}

export default function SimpleTranscriptAnalysis() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's transcript analyses
  const { data: analyses = [], isLoading } = useQuery<Analysis[]>({
    queryKey: ['/api/academic-document-analyses'],
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/academic-document-analysis', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Analysis failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/academic-document-analyses'] });
      setIsProcessing(false);
      toast({
        title: 'Success!',
        description: 'Your transcript has been analyzed successfully.',
      });
    },
    onError: (error: any) => {
      setIsProcessing(false);
      toast({
        title: 'Analysis Failed',
        description: error.message || 'Please try uploading a clear JPG or PNG image of your transcript.',
        variant: 'destructive',
      });
    },
  });

  const handleFileUpload = (file: File) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload PDF, JPG, or PNG files only.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please upload files smaller than 10MB.',
        variant: 'destructive',
      });
      return;
    }

    uploadMutation.mutate(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Analyzed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Transcript Analysis</h1>
              <p className="text-gray-600">AI-powered analysis of your academic transcripts</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Upload Section */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-xl font-medium text-gray-900 mb-2">Upload Your Transcript</h2>
              <p className="text-gray-600 mb-6">
                Upload academic transcripts from NEB, HSEB, universities, or other educational institutions
              </p>

              {/* Upload Area */}
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer",
                  isDragging ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400",
                  isProcessing && "pointer-events-none opacity-50"
                )}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => fileInputRef.current?.click()}
              >
                {isProcessing ? (
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-blue-600 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">Analyzing Your Transcript</p>
                      <p className="text-gray-600">This may take a few moments...</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
                      <Upload className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        Drop your transcript here or click to upload
                      </p>
                      <p className="text-gray-600">PDF, JPG, or PNG • Max 10MB</p>
                    </div>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* File Type Info */}
              <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>PDF Documents</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileImage className="h-4 w-4" />
                  <span>JPG/PNG Images</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {analyses.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Your Analyses</h3>
                <Badge variant="outline">{analyses.length} transcript{analyses.length !== 1 ? 's' : ''}</Badge>
              </div>

              <div className="space-y-3">
                {analyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/academic-document-details/${analysis.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{analysis.fileName}</p>
                        <p className="text-sm text-gray-600">Uploaded {formatDate(analysis.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(analysis.status)}
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {analyses.length === 0 && !isLoading && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transcripts yet</h3>
              <p className="text-gray-600">Upload your first academic transcript to get started</p>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Tips for Best Results</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Ensure your transcript is clearly visible and well-lit</li>
                <li>• For PDF files, make sure they contain readable text</li>
                <li>• Upload high-quality images (JPG/PNG) if PDF processing fails</li>
                <li>• Academic transcripts with subject marks work best</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}