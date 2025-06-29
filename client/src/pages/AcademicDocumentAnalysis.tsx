import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Brain, Download, CheckCircle, Trash2, Eye, Calendar, Clock, Info, Shield, AlertCircle, Settings } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AcademicDocumentAnalysisResults } from '@shared/academicDocumentSchema';
import ProfileUpdatePreview from '@/components/ProfileUpdatePreview';

interface AcademicDocumentAnalysis {
  id: number;
  fileName: string;
  fileSize: number;
  analysisResults: AcademicDocumentAnalysisResults;
  processingTime: number;
  tokensUsed: number;
  confidence?: number;
  extractedText: string;
  createdAt: string;
  isAppliedToProfile: boolean;
}

export default function AcademicDocumentAnalysis() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedAnalysisForPreview, setSelectedAnalysisForPreview] = useState<AcademicDocumentAnalysis | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's academic document analyses
  const { data: academicDocumentAnalyses = [], isLoading } = useQuery<AcademicDocumentAnalysis[]>({
    queryKey: ['/api/academic-document-analyses'],
  });

  // Upload and analyze academic document mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/academic-document-analysis', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze academic document');
      }
      
      return response.json();
    },
    onSuccess: (data: any) => {
      const confidenceText = data.confidence ? ` Text extraction confidence: ${Math.round(data.confidence * 100)}%.` : '';
      const processingMethod = data.confidence >= 0.8 ? 'Google Vision API' : 
                              data.confidence >= 0.5 ? 'PDF extraction' : 'OCR processing';
      toast({
        title: "Analysis Complete!",
        description: `Your academic document has been analyzed successfully using ${processingMethod}. Processing took ${Math.round(data.processingTime / 1000)} seconds.${confidenceText}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/academic-document-analyses'] });
      setSelectedFile(null);
      setIsUploading(false);
    },
    onError: (error: any) => {
      let errorMessage = "Failed to analyze academic document. Please try again.";
      let errorTitle = "Analysis Failed";
      
      if (error.message) {
        if (error.message.includes("Document validation failed") || error.message.includes("Academic document analysis failed")) {
          errorTitle = "Document Validation Failed";
          if (error.message.includes("experience document")) {
            errorMessage = "This appears to be an experience/employment letter, not an academic document. Please upload university transcripts, degree certificates, or enrollment documents instead.";
          } else if (error.message.includes("financial document")) {
            errorMessage = "This appears to be a financial document, not an academic document. Please upload university transcripts, degree certificates, or enrollment documents instead.";
          } else if (error.message.includes("Insufficient text extracted") || error.message.includes("clear, high-resolution")) {
            errorMessage = "Unable to extract readable text from your document. Please ensure the document is clear, high-resolution, and contains visible text. For scanned documents, try uploading a higher quality version.";
          } else if (error.message.includes("Academic analysis requires transcripts")) {
            errorMessage = "This document is not suitable for academic analysis. Please upload university transcripts, degree certificates, or enrollment documents only.";
          } else if (error.message.includes("OCR limitations") || error.message.includes("converting your PDF to a JPG")) {
            errorMessage = "Unable to process this PDF document. Please convert it to a JPG or PNG image and try again.";
          } else if (error.message.includes("PDF conversion failed")) {
            errorMessage = "PDF processing failed. Please save your document as a JPG or PNG image and upload that instead.";
          } else if (error.message.includes("password-protected, corrupted, or contain only images")) {
            errorMessage = "This PDF cannot be processed. It may be password-protected or contain only images. Please convert it to a JPG or PNG image and try again.";
          } else {
            errorMessage = "The document could not be validated for academic analysis. Please ensure you're uploading a university transcript, degree certificate, or enrollment document.";
          }
        } else if (error.message.includes("Could not extract sufficient text")) {
          errorTitle = "Text Extraction Failed";
          errorMessage = "Unable to extract readable text from your document. Please ensure the document is clear, high-resolution, and contains visible text. PDF format works best.";
        } else if (error.message.includes("file too large")) {
          errorTitle = "File Too Large";
          errorMessage = "Your file exceeds the 10MB limit. Please compress the file or use a smaller image.";
        } else if (error.message.includes("invalid file type")) {
          errorTitle = "Invalid File Type";
          errorMessage = "Please upload only PDF, JPG, or PNG files.";
        } else if (error.message.includes("processing failed")) {
          errorTitle = "Processing Error";
          errorMessage = "Document processing failed. Please try uploading a clearer version or different format.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
      setIsUploading(false);
    }
  });

  // Handle opening the profile update preview
  const handleOpenPreview = (analysis: AcademicDocumentAnalysis) => {
    setSelectedAnalysisForPreview(analysis);
    setPreviewModalOpen(true);
  };

  // Handle successful profile update from preview modal
  const handlePreviewSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/academic-document-analyses'] });
    queryClient.invalidateQueries({ queryKey: ['/api/user/profile-completion'] });
    queryClient.invalidateQueries({ queryKey: ['/api/user'] });
  };

  // Delete academic document analysis mutation
  const deleteMutation = useMutation({
    mutationFn: async (analysisId: number) => {
      const response = await fetch(`/api/academic-document-analyses/${analysisId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete analysis');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Analysis Deleted",
        description: "Academic document analysis has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/academic-document-analyses'] });
    }
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload PDF, JPG, or PNG files only.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "File size must be less than 10MB.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      setIsUploading(true);
      uploadMutation.mutate(selectedFile);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Academic Document Analysis</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Upload your highest academic certificates, diplomas, degrees, or transcripts to extract comprehensive academic information and auto-populate your profile for enhanced study destination recommendations.
        </p>
      </div>

      {/* Upload Guidelines */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Upload Guidelines & Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-900 mb-3">✅ Recommended Documents:</h4>
              <ul className="text-blue-800 space-y-2 text-sm">
                <li>• Official degree certificates (Bachelor's, Master's, PhD)</li>
                <li>• Academic transcripts with grades and GPA</li>
                <li>• Diploma certificates from recognized institutions</li>
                <li>• Professional certification documents</li>
                <li>• Mark sheets with clear institutional letterhead</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-900 mb-3">📋 Technical Requirements:</h4>
              <ul className="text-blue-800 space-y-2 text-sm">
                <li>• Supported formats: PDF, JPG, PNG</li>
                <li>• Maximum file size: 10MB</li>
                <li>• High resolution (300 DPI recommended)</li>
                <li>• Clear, readable text without blur</li>
                <li>• Complete document (all pages included)</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-100 border border-yellow-300 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Common Upload Issues & Solutions:
            </h4>
            <ul className="text-yellow-800 space-y-1 text-sm">
              <li>• <strong>Blurry text:</strong> Use higher resolution scan or better lighting</li>
              <li>• <strong>Incomplete extraction:</strong> Ensure all text is clearly visible</li>
              <li>• <strong>Failed analysis:</strong> Try uploading a different format (PDF works best)</li>
              <li>• <strong>Large file size:</strong> Compress PDF or reduce image quality</li>
            </ul>
          </div>

          <div className="bg-blue-100 p-4 rounded-lg">
            <p className="text-blue-900 text-sm font-medium flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Your documents are processed securely with end-to-end encryption and never stored permanently on our servers.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Academic Document
          </CardTitle>
          <CardDescription>
            Upload your diploma, degree certificate, transcript, or any official academic document. 
            Advanced multi-tier processing: Google Vision API → PDF extraction → OCR fallback for maximum reliability.
            Supported formats: PDF, JPG, PNG (max 10MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="academic-document">Choose Academic Document</Label>
            <Input
              id="academic-document"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="mt-1"
            />
          </div>

          {selectedFile && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">{selectedFile.name}</p>
                    <p className="text-sm text-blue-700">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Analyze Document
                    </>
                  )}
                </Button>
              </div>
              
              {(uploadMutation.isPending || isUploading) && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full"></div>
                    <div>
                      <p className="font-medium text-yellow-900">Processing your academic document...</p>
                      <p className="text-sm text-yellow-700">This may take 30-60 seconds depending on document complexity and file size.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Academic Document Analyses List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Academic Document Analyses</CardTitle>
          <CardDescription>
            View and manage your uploaded academic document analyses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-gray-600">Loading analyses...</p>
            </div>
          ) : academicDocumentAnalyses.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Academic Documents Analyzed Yet</h3>
              <p className="text-gray-600 mb-4 max-w-md mx-auto">
                Upload your first academic document to extract comprehensive academic information and auto-populate your profile.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 max-w-lg mx-auto">
                <h4 className="font-medium text-gray-900 mb-2">💡 Quick Tips:</h4>
                <ul className="text-sm text-gray-600 space-y-1 text-left">
                  <li>• Upload clear, high-resolution documents</li>
                  <li>• PDF format provides best results</li>
                  <li>• Ensure all text is visible and readable</li>
                  <li>• Processing typically takes 30-60 seconds</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {academicDocumentAnalyses.map((analysis: AcademicDocumentAnalysis) => (
                <Card key={analysis.id} className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-green-600" />
                        <div>
                          <h3 className="font-medium">{analysis.fileName}</h3>
                          <p className="text-sm text-gray-600">
                            {formatFileSize(analysis.fileSize)} • Analyzed {formatDate(analysis.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMutation.mutate(analysis.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      {/* Institution Information */}
                      {analysis.analysisResults.institutionName && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-1">Institution</h4>
                          <p className="text-sm text-blue-800">{analysis.analysisResults.institutionName}</p>
                          {analysis.analysisResults.institutionCountry && (
                            <p className="text-xs text-blue-700">{analysis.analysisResults.institutionCountry}</p>
                          )}
                        </div>
                      )}

                      {/* Qualification */}
                      {analysis.analysisResults.qualificationLevel && (
                        <div className="p-3 bg-green-50 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-1">Qualification</h4>
                          <p className="text-sm text-green-800">{analysis.analysisResults.qualificationLevel}</p>
                          {analysis.analysisResults.fieldOfStudy && (
                            <p className="text-xs text-green-700">{analysis.analysisResults.fieldOfStudy}</p>
                          )}
                        </div>
                      )}

                      {/* Academic Performance */}
                      {analysis.analysisResults.gpa && (
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <h4 className="font-medium text-purple-900 mb-1">GPA/Grade</h4>
                          <p className="text-sm text-purple-800">{analysis.analysisResults.gpa}</p>
                          {analysis.analysisResults.gradeScale && (
                            <p className="text-xs text-purple-700">Scale: {analysis.analysisResults.gradeScale}</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {Math.round(analysis.processingTime / 1000)}s
                        </span>
                        {analysis.isAppliedToProfile && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            Applied to Profile
                          </span>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {!analysis.isAppliedToProfile && (
                          <Button
                            size="sm"
                            onClick={() => handleOpenPreview(analysis)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Settings className="w-4 h-4 mr-1" />
                            Update Profile
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Update Preview Modal */}
      {selectedAnalysisForPreview && (
        <ProfileUpdatePreview
          isOpen={previewModalOpen}
          onClose={() => {
            setPreviewModalOpen(false);
            setSelectedAnalysisForPreview(null);
          }}
          analysisData={{
            id: selectedAnalysisForPreview.id,
            fileName: selectedAnalysisForPreview.fileName,
            analysisResults: selectedAnalysisForPreview.analysisResults,
          }}
          onSuccess={handlePreviewSuccess}
        />
      )}
    </div>
  );
}