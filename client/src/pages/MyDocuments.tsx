import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Upload,
  FileText,
  Eye,
  Download,
  Trash2,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  FileImage,
  Brain,
  Settings,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface UserDocument {
  id: number;
  fileName: string;
  category: string;
  documentType: string;
  fileSize: number;
  analysisStatus: 'pending' | 'completed' | 'failed';
  extractedData: any;
  verificationStatus: 'pending' | 'verified' | 'flagged';
  discrepancies: string[];
  uploadedAt: string;
  lastAnalyzedAt?: string;
  profileMatchAccuracy?: number;
}

interface Application {
  id: number;
  institutionName: string;
  courseName: string;
  targetCountry: string;
  status: string;
  requiredDocuments: string[];
}

export default function MyDocuments() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [assignDocumentDialogOpen, setAssignDocumentDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<UserDocument | null>(null);
  const [selectedDocumentForAssignment, setSelectedDocumentForAssignment] = useState<UserDocument | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: documents = [], isLoading: documentsLoading } = useQuery({
    queryKey: ['/api/documents/my-documents'],
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['/api/applications'],
  });

  const { data: documentCategories = [] } = useQuery({
    queryKey: ['/api/documents/categories'],
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents/my-documents'] });
      setUploadDialogOpen(false);
      setUploading(false);
      toast({
        title: "Document Uploaded",
        description: "Your document has been uploaded and queued for AI analysis.",
      });
    },
    onError: (error: Error) => {
      setUploading(false);
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async (documentId: number) => {
      return apiRequest('POST', `/api/documents/${documentId}/analyze`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents/my-documents'] });
      setAnalyzing(false);
      toast({
        title: "Analysis Started",
        description: "AI document analysis has been initiated.",
      });
    },
    onError: (error: Error) => {
      setAnalyzing(false);
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const applyToProfileMutation = useMutation({
    mutationFn: async (documentId: number) => {
      return apiRequest('POST', `/api/documents/${documentId}/apply-to-profile`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents/my-documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Profile Updated",
        description: "Document data has been applied to your profile.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Profile Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const assignToApplicationMutation = useMutation({
    mutationFn: async ({ documentId, applicationId }: { documentId: number; applicationId: number }) => {
      return apiRequest('POST', `/api/documents/${documentId}/assign`, { applicationId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      setAssignDocumentDialogOpen(false);
      toast({
        title: "Document Assigned",
        description: "Document has been assigned to the application.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Assignment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const file = formData.get('file') as File;
    
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    uploadMutation.mutate(formData);
  };

  const handleAnalyzeDocument = (document: UserDocument) => {
    setSelectedDocument(document);
    setAnalyzing(true);
    analyzeMutation.mutate(document.id);
  };

  const handleViewAnalysis = (document: UserDocument) => {
    setSelectedDocument(document);
    setAnalysisDialogOpen(true);
  };

  const handleAssignToApplication = (document: UserDocument) => {
    setSelectedDocumentForAssignment(document);
    setAssignDocumentDialogOpen(true);
  };

  const filteredDocuments = documents.filter((doc: any) => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = doc.file_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.file_type?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="default" className="bg-green-100 text-green-800">Verified</Badge>;
      case 'flagged':
        return <Badge variant="destructive">Discrepancies Found</Badge>;
      default:
        return <Badge variant="secondary">Pending Verification</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Documents</h1>
          <p className="text-gray-600 mt-1">
            Manage your documents with AI analysis and profile integration
          </p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold">{documents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">AI Analyzed</p>
                <p className="text-2xl font-bold">
                  {documents.filter((d: any) => d.analysis_status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-2xl font-bold">
                  {documents.filter((d: any) => d.verification_status === 'verified').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Flagged</p>
                <p className="text-2xl font-bold">
                  {documents.filter((d: any) => d.verification_status === 'flagged').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {documentCategories.map((category: any) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Documents Grid */}
      {documentsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document: any) => (
            <Card key={document.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(document.analysis_status)}
                    <CardTitle className="text-lg truncate">{document.file_name}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleViewAnalysis(document)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleAssignToApplication(document)}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Type:</span>
                  <Badge variant="outline">{document.file_type}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Category:</span>
                  <Badge variant="secondary">{document.category}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  {getVerificationBadge(document.verification_status)}
                </div>
                
                {document.analysis_status === 'completed' && document.profile_match_accuracy && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Profile Match:</span>
                      <span className="font-medium">{document.profile_match_accuracy}%</span>
                    </div>
                    <Progress value={document.profile_match_accuracy} className="h-2" />
                  </div>
                )}

                {document.discrepancies && document.discrepancies.length > 0 && (
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 text-orange-800 text-sm font-medium mb-1">
                      <AlertTriangle className="h-4 w-4" />
                      Discrepancies Found
                    </div>
                    <p className="text-sm text-orange-700">
                      {document.discrepancies.length} issue(s) detected
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {document.analysis_status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAnalyzeDocument(document)}
                      disabled={analyzing}
                      className="flex-1"
                    >
                      {analyzing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Brain className="h-4 w-4 mr-2" />}
                      Analyze
                    </Button>
                  )}
                  {document.analysis_status === 'completed' && document.extracted_data && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => applyToProfileMutation.mutate(document.id)}
                      className="flex-1"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Apply to Profile
                    </Button>
                  )}
                </div>

                <div className="text-xs text-gray-500 pt-2 border-t">
                  <div className="flex justify-between">
                    <span>Uploaded: {new Date(document.uploaded_at).toLocaleDateString()}</span>
                    <span>{(document.file_size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredDocuments.length === 0 && !documentsLoading && (
        <Card className="py-12">
          <CardContent className="text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Upload your first document to get started with AI analysis.'}
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <Button onClick={() => setUploadDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Upload Document
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div>
              <Label htmlFor="file">Document File</Label>
              <Input
                id="file"
                name="file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                required
                ref={fileInputRef}
              />
              <p className="text-sm text-gray-600 mt-1">
                Supported formats: PDF, JPG, PNG (max 10MB)
              </p>
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select name="category" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {documentCategories.map((category: any) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="documentType">Document Type</Label>
              <Input
                id="documentType"
                name="documentType"
                placeholder="e.g., Transcript, Passport, etc."
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Brief description of the document"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setUploadDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={uploading} className="flex-1">
                {uploading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Analysis Results Dialog */}
      <Dialog open={analysisDialogOpen} onOpenChange={setAnalysisDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Document Analysis Results</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <Tabs defaultValue="analysis" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
                <TabsTrigger value="verification">Verification</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="analysis" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Extracted Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedDocument.extractedData ? (
                      <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg overflow-auto">
                        {JSON.stringify(selectedDocument.extractedData, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-gray-600">No analysis data available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="verification" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Profile Verification</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Verification Status:</span>
                      {getVerificationBadge(selectedDocument.verificationStatus)}
                    </div>
                    
                    {selectedDocument.profileMatchAccuracy && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Profile Match Accuracy:</span>
                          <span className="font-medium">{selectedDocument.profileMatchAccuracy}%</span>
                        </div>
                        <Progress value={selectedDocument.profileMatchAccuracy} className="h-2" />
                      </div>
                    )}

                    {selectedDocument.discrepancies && selectedDocument.discrepancies.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-red-800">Discrepancies Found:</h4>
                        <ul className="space-y-1">
                          {selectedDocument.discrepancies.map((discrepancy, index) => (
                            <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              {discrepancy}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="actions" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Profile Integration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        Apply extracted data to automatically update your profile information.
                      </p>
                      <Button
                        onClick={() => applyToProfileMutation.mutate(selectedDocument.id)}
                        disabled={!selectedDocument.extractedData}
                        className="w-full"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Apply to Profile
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Application Assignment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        Assign this document to one of your active applications.
                      </p>
                      <Button
                        onClick={() => handleAssignToApplication(selectedDocument)}
                        className="w-full"
                        variant="outline"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Assign to Application
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Document Dialog */}
      <Dialog open={assignDocumentDialogOpen} onOpenChange={setAssignDocumentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Document to Application</DialogTitle>
          </DialogHeader>
          {selectedDocumentForAssignment && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedDocumentForAssignment.fileName}</p>
                <p className="text-sm text-gray-600">{selectedDocumentForAssignment.documentType}</p>
              </div>

              <div>
                <Label>Select Application</Label>
                <div className="space-y-2 mt-2">
                  {applications.map((app: Application) => (
                    <Card
                      key={app.id}
                      className="p-3 cursor-pointer hover:bg-gray-50 border-2 border-transparent hover:border-blue-200"
                      onClick={() => {
                        assignToApplicationMutation.mutate({
                          documentId: selectedDocumentForAssignment.id,
                          applicationId: app.id
                        });
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{app.institutionName}</p>
                          <p className="text-sm text-gray-600">{app.courseName}</p>
                          <p className="text-xs text-gray-500">{app.targetCountry}</p>
                        </div>
                        <Badge variant="outline">{app.status}</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {applications.length === 0 && (
                <div className="text-center py-6">
                  <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No active applications found</p>
                  <p className="text-sm text-gray-500">Create an application first to assign documents</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </DashboardLayout>
  );
}