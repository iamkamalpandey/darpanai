import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Brain, Download, CheckCircle, Trash2, Eye, Calendar, Clock } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AcademicDocumentAnalysisResults } from '@shared/academicDocumentSchema';

interface AcademicDocumentAnalysis {
  id: number;
  fileName: string;
  fileSize: number;
  analysisResults: AcademicDocumentAnalysisResults;
  processingTime: number;
  tokensUsed: number;
  createdAt: string;
  isAppliedToProfile: boolean;
}

export default function AcademicDocumentAnalysis() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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
      toast({
        title: "Analysis Complete!",
        description: `Your academic document has been analyzed successfully. Processing took ${Math.round(data.processingTime / 1000)} seconds.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/academic-document-analyses'] });
      setSelectedFile(null);
      setIsUploading(false);
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze academic document. Please try again.",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  });

  // Apply academic document data to profile mutation
  const applyToProfileMutation = useMutation({
    mutationFn: async (analysisId: number) => {
      const response = await fetch(`/api/academic-document-analyses/${analysisId}/apply-to-profile`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to apply academic document data to profile');
      }
      
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Profile Updated!",
        description: `Successfully updated ${data.updatedFields?.length || 0} profile fields from your academic document.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/academic-document-analyses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile-completion'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update Profile",
        description: error.message || "Failed to apply academic document data to profile.",
        variant: "destructive",
      });
    }
  });

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

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Academic Document
          </CardTitle>
          <CardDescription>
            Upload your diploma, degree certificate, transcript, or any official academic document. 
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
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No academic document analyses yet. Upload your first document to get started!</p>
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
                            onClick={() => applyToProfileMutation.mutate(analysis.id)}
                            disabled={applyToProfileMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {applyToProfileMutation.isPending ? (
                              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                            ) : (
                              <>
                                <Download className="w-4 h-4 mr-1" />
                                Apply to Profile
                              </>
                            )}
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
    </div>
  );
}