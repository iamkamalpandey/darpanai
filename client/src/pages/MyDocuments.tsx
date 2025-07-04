import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import DashboardLayout from '@/components/DashboardLayout';
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  X, 
  Save, 
  Plus, 
  Brain,
  RefreshCw,
  User,
  ExternalLink,
  Grid3X3,
  List,
  Download,
  RotateCcw
} from 'lucide-react';

interface UserDocument {
  id: number;
  file_name: string;
  original_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  document_category: string;
  is_analyzed: boolean;
  analysis_data: any;
  extracted_fields: any;
  validation_status: 'pending' | 'valid' | 'invalid' | 'needs_review';
  validation_issues: any[];
  tags: string[];
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Legacy compatibility fields
  category: string;
  analysis_status: 'pending' | 'completed' | 'failed';
  verification_status: 'pending' | 'verified' | 'flagged';
  uploaded_at: string;
  extracted_data: any;
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<number | null>(null);
  const [customName, setCustomName] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryUpload, setSelectedCategoryUpload] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user documents
  const { data: documents = [], isLoading: documentsLoading } = useQuery({
    queryKey: ['/api/documents'],
    queryFn: async () => {
      const response = await fetch('/api/documents');
      if (!response.ok) throw new Error('Failed to fetch documents');
      return response.json();
    }
  });

  // Fetch document categories
  const { data: documentCategories = [] } = useQuery({
    queryKey: ['/api/document-categories'],
    queryFn: async () => {
      const response = await fetch('/api/document-categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    }
  });

  // Fetch applications for assignment
  const { data: applications = [] } = useQuery({
    queryKey: ['/api/applications'],
    queryFn: async () => {
      const response = await fetch('/api/applications');
      if (!response.ok) throw new Error('Failed to fetch applications');
      return response.json();
    }
  });

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to upload document');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      setUploadDialogOpen(false);
      toast({ title: 'Document uploaded successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to upload document', variant: 'destructive' });
    }
  });

  // Update document mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update document');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      setEditingDocument(null);
      toast({ title: 'Document updated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to update document', variant: 'destructive' });
    }
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete document');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({ title: 'Document deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete document', variant: 'destructive' });
    }
  });

  // Analyze document mutation
  const analyzeMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/documents/${id}/analyze`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to analyze document');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      setAnalyzing(false);
      toast({ title: 'Document analysis completed' });
    },
    onError: () => {
      setAnalyzing(false);
      toast({ title: 'Failed to analyze document', variant: 'destructive' });
    }
  });

  // Replace document mutation
  const replaceMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
      const response = await fetch(`/api/documents/${id}/replace`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to replace document');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({ title: 'Document replaced successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to replace document', variant: 'destructive' });
    }
  });

  // Apply to profile mutation
  const addToProfileMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/documents/${id}/apply-to-profile`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to apply to profile');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Document data applied to profile successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to apply document data to profile', variant: 'destructive' });
    }
  });

  // Filter documents
  const filteredDocuments = (documents as any[]).filter((document: any) => {
    const matchesSearch = document.file_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         document.custom_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         document.document_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || document.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Add additional fields
    if (customName) formData.append('customName', customName);
    if (documentType) formData.append('documentType', documentType);
    if (description) formData.append('description', description);
    if (selectedCategoryUpload) formData.append('documentCategory', selectedCategoryUpload);

    uploadMutation.mutate(formData);
    
    // Reset form
    form.reset();
    setCustomName('');
    setDocumentType('');
    setDescription('');
    setSelectedCategoryUpload('');
  };

  const getStatusIcon = (isAnalyzed: boolean) => {
    if (isAnalyzed) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <Clock className="h-5 w-5 text-yellow-500" />;
  };

  const getVerificationBadge = (status: string) => {
    const variants = {
      verified: 'default',
      flagged: 'destructive',
      pending: 'secondary'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  const handleAnalyzeDocument = (document: UserDocument) => {
    setAnalyzing(true);
    analyzeMutation.mutate(document.id);
  };

  const handleViewAnalysis = (document: UserDocument) => {
    // Navigate to analysis details page
    window.location.href = `/analysis/${document.id}`;
  };

  const handleAssignToApplication = (document: UserDocument) => {
    // Navigate to application assignment page
    window.location.href = `/assign-document/${document.id}`;
  };

  const handleEditDocument = (document: UserDocument) => {
    setEditingDocument(document.id);
    setCustomName(document.original_name || document.file_name || '');
    setDocumentType(document.document_category || '');
    setDescription(document.description || '');
    setSelectedCategoryUpload(document.category || '');
  };

  const handleDownloadDocument = (doc: UserDocument) => {
    const link = document.createElement('a');
    link.href = `/api/documents/${doc.id}/download`;
    link.download = doc.original_name || doc.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReplaceDocument = (document: UserDocument) => {
    if (fileInputRef.current) {
      fileInputRef.current.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const formData = new FormData();
          formData.append('document', file);
          formData.append('documentCategory', document.document_category);
          formData.append('description', document.description || '');
          
          replaceMutation.mutate({ id: document.id, formData });
        }
      };
      fileInputRef.current.click();
    }
  };

  const handleAddToProfile = (document: UserDocument) => {
    addToProfileMutation.mutate(document.id);
  };

  const handleSaveDocument = (id: number) => {
    updateMutation.mutate({
      id,
      data: {
        original_name: customName,
        document_category: documentType,
        description,
        tags: selectedCategoryUpload ? [selectedCategoryUpload] : [],
      }
    });
  };

  const handleCancelEdit = () => {
    setEditingDocument(null);
    setCustomName('');
    setDocumentType('');
    setDescription('');
    setSelectedCategoryUpload('');
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">My Documents</h1>
            <p className="text-gray-600 mt-2">
              Manage and analyze your academic documents with AI-powered insights
            </p>
          </div>
          <Button onClick={() => setUploadDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Upload Document
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {(documentCategories as any[]).map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Documents Display */}
        {documentsLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Loading your documents...</p>
          </div>
        ) : viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((document: any) => (
              <Card key={document.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getStatusIcon(document.analysis_status)}
                      {editingDocument === document.id ? (
                        <Input
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          className="text-lg font-semibold"
                          placeholder="Document name"
                        />
                      ) : (
                        <CardTitle className="text-lg truncate">
                          {document.custom_name || document.file_name}
                        </CardTitle>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {editingDocument === document.id ? (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => handleSaveDocument(document.id)}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => handleEditDocument(document)}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleViewAnalysis(document)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleAssignToApplication(document)}>
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {editingDocument === document.id ? (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm">Document Type</Label>
                        <Input
                          value={documentType}
                          onChange={(e) => setDocumentType(e.target.value)}
                          placeholder="e.g., Transcript, Passport, etc."
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Category</Label>
                        <Select value={selectedCategoryUpload} onValueChange={setSelectedCategoryUpload}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {(documentCategories as any[]).map((category) => (
                              <SelectItem key={category.id} value={category.name}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm">Description</Label>
                        <Textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Brief description of the document"
                          rows={2}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Type:</span>
                        <Badge variant="outline">{document.document_type}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Category:</span>
                        <Badge variant="secondary">{document.category}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Status:</span>
                        {getVerificationBadge(document.verification_status)}
                      </div>
                    </>
                  )}

                  {document.description && (
                    <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                      <span className="font-medium">Description: </span>
                      {document.description}
                    </div>
                  )}

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
                        onClick={() => handleAddToProfile(document)}
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
        ) : (
          // List View
          <div className="space-y-4">
            {filteredDocuments.map((document: any) => (
              <Card key={document.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {getStatusIcon(document.is_analyzed)}
                      <div className="flex-1 min-w-0">
                        {editingDocument === document.id ? (
                          <div className="space-y-2">
                            <Input
                              value={customName}
                              onChange={(e) => setCustomName(e.target.value)}
                              className="font-semibold"
                              placeholder="Document name"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                value={documentType}
                                onChange={(e) => setDocumentType(e.target.value)}
                                placeholder="Document type"
                              />
                              <Select value={selectedCategoryUpload} onValueChange={setSelectedCategoryUpload}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {(documentCategories as any[]).map((category) => (
                                    <SelectItem key={category.id} value={category.name}>
                                      {category.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <Textarea
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              placeholder="Description"
                              rows={2}
                            />
                          </div>
                        ) : (
                          <>
                            <h3 className="font-semibold text-lg truncate">
                              {document.original_name || document.file_name}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <span>{document.document_category}</span>
                              <Badge variant="secondary">{document.category}</Badge>
                              {getVerificationBadge(document.validation_status)}
                              <span>Uploaded: {new Date(document.created_at).toLocaleDateString()}</span>
                              <span>{(document.file_size / 1024).toFixed(1)} KB</span>
                            </div>
                            {document.description && (
                              <p className="text-sm text-gray-600 mt-2">{document.description}</p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {document.analysis_status === 'completed' && document.profile_match_accuracy && (
                        <div className="text-center">
                          <div className="text-sm font-medium">{document.profile_match_accuracy}%</div>
                          <div className="text-xs text-gray-500">Match</div>
                        </div>
                      )}
                      
                      {editingDocument === document.id ? (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => handleSaveDocument(document.id)}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => handleEditDocument(document)}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDownloadDocument(document)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleReplaceDocument(document)}>
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleViewAnalysis(document)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleAssignToApplication(document)}>
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          {!document.is_analyzed && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAnalyzeDocument(document)}
                              disabled={analyzing}
                            >
                              {analyzing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                            </Button>
                          )}
                          {document.is_analyzed && document.extracted_fields && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAddToProfile(document)}
                            >
                              <User className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(document.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {document.discrepancies && document.discrepancies.length > 0 && (
                    <div className="mt-3 p-2 bg-orange-50 rounded border border-orange-200">
                      <div className="flex items-center gap-2 text-orange-800 text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        {document.discrepancies.length} discrepancy(ies) detected
                      </div>
                    </div>
                  )}
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
                <Label htmlFor="document">Document File</Label>
                <Input
                  id="document"
                  name="document"
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
                <Label htmlFor="customName">Document Name (Optional)</Label>
                <Input
                  id="customName"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Give your document a custom name"
                />
              </div>

              <div>
                <Label htmlFor="documentType">Document Type</Label>
                <Input
                  id="documentType"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  placeholder="e.g., Transcript, Passport, Certificate"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={selectedCategoryUpload} onValueChange={setSelectedCategoryUpload} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(documentCategories as any[]).map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                <Button
                  type="submit"
                  disabled={uploadMutation.isPending}
                  className="flex-1"
                >
                  {uploadMutation.isPending ? (
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

        {/* Hidden file input for document replacement */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          style={{ display: 'none' }}
        />
      </div>
    </DashboardLayout>
  );
}