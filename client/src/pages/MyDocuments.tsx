import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  FileText, 
  Upload, 
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
  Download,
  RotateCcw,
  Grid3X3,
  List,
  Filter,
  Search,
  MoreVertical,
  RefreshCw
} from 'lucide-react';

// Constants
const DOCUMENT_LIMIT = 15;

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
  description?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

interface DocumentCategory {
  id: number;
  name: string;
  description: string;
}

export default function MyDocuments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedDocument, setSelectedDocument] = useState<UserDocument | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  
  // Edit form state
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTags, setEditTags] = useState('');

  // Fetch documents
  const { data: documents = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/documents'],
    queryFn: async () => {
      const response = await fetch('/api/documents');
      if (!response.ok) throw new Error('Failed to fetch documents');
      return response.json();
    }
  });

  // Fetch document categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/document-categories'],
    queryFn: async () => {
      const response = await fetch('/api/document-categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    }
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      console.log('Starting upload mutation...');
      
      // Check 15-document upload limit
      if (documents && documents.length >= 15) {
        throw new Error('Document limit reached. You can upload a maximum of 15 documents. Please delete some documents to upload new ones.');
      }
      
      const response = await fetch('/api/document-management/upload', {
        method: 'POST',
        body: formData
      });
      
      console.log('Upload response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log('Upload error data:', errorData);
        throw new Error(errorData.error || 'Upload failed');
      }
      
      const result = await response.json();
      console.log('Upload success result:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('Upload mutation success:', data);
      toast({ title: 'Success', description: 'Document uploaded successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      setIsUploadDialogOpen(false);
      resetUploadForm();
      setIsUploading(false);
    },
    onError: (error: any) => {
      console.log('Upload mutation error:', error);
      console.log('Error type:', typeof error);
      console.log('Error stack:', error.stack);
      
      let errorMessage = 'Upload failed';
      if (error && typeof error === 'object') {
        errorMessage = error.message || error.error || errorMessage;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
      setIsUploading(false);
    },
    onSettled: () => {
      console.log('Upload mutation settled');
      setIsUploading(false);
    }
  });

  // Download function
  const handleDownload = async (doc: UserDocument) => {
    try {
      const response = await fetch(`/api/document-management/documents/${doc.id}/download`);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = doc.original_name || doc.file_name;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
      
      toast({ title: 'Success', description: 'Document downloaded successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to download document', variant: 'destructive' });
    }
  };

  // Analysis mutation
  const analysisMutation = useMutation({
    mutationFn: async (documentId: number) => {
      const response = await fetch(`/api/documents/${documentId}/analyze`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Analysis failed');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Document analyzed successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      setIsViewDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  // Edit mutation
  const editMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/document-management/documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Update failed');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Document updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      setIsEditDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/document-management/documents/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Delete failed');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Document deleted successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      setIsViewDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  // Analyze document mutation
  const analyzeMutation = useMutation({
    mutationFn: async (documentId: number) => {
      const response = await fetch(`/api/documents/${documentId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Analysis failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: 'Analysis Complete', 
        description: 'Your document has been successfully analyzed with AI.' 
      });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Analysis Failed', 
        description: error.message || 'Unable to analyze document. Please try again.',
        variant: 'destructive' 
      });
    }
  });

  // Helper functions
  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadCategory('');
    setUploadDescription('');
    setUploadProgress(0);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Document action functions
  const analyzeDocument = (documentId: number) => {
    analyzeMutation.mutate(documentId);
  };

  const deleteDocument = (documentId: number) => {
    if (confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      deleteMutation.mutate(documentId);
    }
  };

  // Replace document state
  const [isReplaceDialogOpen, setIsReplaceDialogOpen] = useState(false);
  const [replaceDocumentId, setReplaceDocumentId] = useState<number | null>(null);
  const [replaceFile, setReplaceFile] = useState<File | null>(null);

  // Replace document mutation
  const replaceMutation = useMutation({
    mutationFn: async ({ id, file }: { id: number; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`/api/document-management/documents/${id}/replace`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Replace failed');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Document replaced successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      setIsReplaceDialogOpen(false);
      setReplaceFile(null);
      setReplaceDocumentId(null);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const replaceDocument = (documentId: number) => {
    setReplaceDocumentId(documentId);
    setIsReplaceDialogOpen(true);
  };

  const handleReplaceSubmit = () => {
    if (replaceDocumentId && replaceFile) {
      replaceMutation.mutate({ id: replaceDocumentId, file: replaceFile });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast({ 
          title: 'Invalid file type', 
          description: 'Only PDF, JPG, and PNG files are allowed',
          variant: 'destructive' 
        });
        return;
      }
      
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({ 
          title: 'File too large', 
          description: 'Maximum file size is 10MB',
          variant: 'destructive' 
        });
        return;
      }
      
      setUploadFile(file);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadCategory) {
      toast({ title: 'Error', description: 'Please select a file and category', variant: 'destructive' });
      return;
    }

    // Check document limit
    if (documents.length >= DOCUMENT_LIMIT) {
      toast({ 
        title: 'Upload limit reached', 
        description: `You can only upload up to ${DOCUMENT_LIMIT} documents. Please delete some documents to upload new ones.`,
        variant: 'destructive' 
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('document', uploadFile);
    formData.append('documentCategory', uploadCategory);
    formData.append('description', uploadDescription);

    uploadMutation.mutate(formData);
  };

  const handleViewDocument = (document: UserDocument) => {
    setSelectedDocument(document);
    setIsViewDialogOpen(true);
  };

  const handleEditDocument = (document: UserDocument) => {
    setSelectedDocument(document);
    setEditName(document.original_name);
    setEditCategory(document.document_category);
    setEditDescription(document.description || '');
    setEditTags(document.tags?.join(', ') || '');
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedDocument) return;
    
    editMutation.mutate({
      id: selectedDocument.id,
      data: {
        description: editDescription,
        tags: editTags.split(',').map(tag => tag.trim()).filter(tag => tag)
      }
    });
  };

  const handleAnalyze = (documentId: number) => {
    analysisMutation.mutate(documentId);
  };



  const handleDelete = (documentId: number) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      deleteMutation.mutate(documentId);
    }
  };

  const getStatusBadge = (status: string, isAnalyzed: boolean) => {
    if (isAnalyzed) {
      return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Analyzed</Badge>;
    }
    
    switch (status) {
      case 'valid':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Valid</Badge>;
      case 'invalid':
        return <Badge variant="destructive">Invalid</Badge>;
      case 'needs_review':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">Needs Review</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-600">Pending</Badge>;
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (fileType.includes('image')) return <FileText className="w-5 h-5 text-blue-500" />;
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filter documents
  const filteredDocuments = documents.filter((doc: UserDocument) => {
    const matchesSearch = doc.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.document_category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || doc.document_category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const uniqueCategories = Array.from(new Set(documents.map((doc: UserDocument) => doc.document_category)));

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-gray-900">My Documents</h1>
                <Badge 
                  variant="outline" 
                  className={`${
                    documents.length >= 15 
                      ? 'bg-red-50 text-red-700 border-red-200' 
                      : documents.length >= 13
                      ? 'bg-orange-50 text-orange-700 border-orange-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  {documents.length} of {DOCUMENT_LIMIT}
                  {documents.length >= 15 && ' (Limit Reached)'}
                  {documents.length >= 13 && documents.length < 15 && ' (Near Limit)'}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {uniqueCategories.map((category: string) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="p-2"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="p-2"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
                
                <Button
                  onClick={() => setIsUploadDialogOpen(true)}
                  disabled={documents.length >= DOCUMENT_LIMIT}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterCategory !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Upload your first document to get started'}
              </p>
              {documents.length < DOCUMENT_LIMIT && (
                <Button 
                  onClick={() => setIsUploadDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              )}
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
            }>
              {filteredDocuments.map((document: UserDocument) => (
                <Card key={document.id} className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(document.file_type)}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {document.original_name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {document.document_category}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(document.validation_status, document.is_analyzed)}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{formatFileSize(document.file_size)}</span>
                      <span>{new Date(document.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDocument(document)}
                        className="flex-1 mr-2 bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {!document.is_analyzed && (
                            <DropdownMenuItem onClick={() => analyzeDocument(document.id)}>
                              <Brain className="w-4 h-4 mr-2" />
                              Analyze Document
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleEditDocument(document)}>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownload(document)}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => replaceDocument(document.id)}
                            className="text-orange-600"
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Replace File
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteDocument(document.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Upload Dialog */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file-upload">Select File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Supported formats: PDF, JPG, PNG (max 10MB)
                </p>
              </div>
              
              {uploadFile && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    {getFileIcon(uploadFile.type)}
                    <span className="text-sm font-medium">{uploadFile.name}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatFileSize(uploadFile.size)}
                  </p>
                </div>
              )}
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={uploadCategory} onValueChange={setUploadCategory}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category: DocumentCategory) => (
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
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Add a description..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!uploadFile || !uploadCategory || isUploading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Document Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                {selectedDocument && getFileIcon(selectedDocument.file_type)}
                <span>{selectedDocument?.original_name}</span>
              </DialogTitle>
            </DialogHeader>
            
            {selectedDocument && (
              <div className="space-y-6">
                {/* Document Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Category</p>
                    <p className="text-sm text-gray-900">{selectedDocument.document_category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Size</p>
                    <p className="text-sm text-gray-900">{formatFileSize(selectedDocument.file_size)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Status</p>
                    <div className="mt-1">
                      {getStatusBadge(selectedDocument.validation_status, selectedDocument.is_analyzed)}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Uploaded</p>
                    <p className="text-sm text-gray-900">{new Date(selectedDocument.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Analysis Section */}
                {!selectedDocument.is_analyzed ? (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-blue-900">AI Analysis Available</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Extract information from this document using AI analysis
                        </p>
                      </div>
                      <Button
                        onClick={() => handleAnalyze(selectedDocument.id)}
                        disabled={analysisMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {analysisMutation.isPending ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
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
                ) : (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <h4 className="font-medium text-green-900">Document Analyzed</h4>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Information has been extracted and is ready for use
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between pt-4 border-t">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleEditDocument(selectedDocument)}
                      className="border-gray-200 hover:bg-gray-50"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDownload(selectedDocument)}
                      className="border-gray-200 hover:bg-gray-50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(selectedDocument.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Document Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Document Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1"
                  disabled
                />
                <p className="text-sm text-gray-500 mt-1">
                  Document name cannot be changed
                </p>
              </div>
              
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="mt-1"
                  disabled
                />
                <p className="text-sm text-gray-500 mt-1">
                  Category cannot be changed
                </p>
              </div>
              
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Add a description..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
                <Input
                  id="edit-tags"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  placeholder="tag1, tag2, tag3"
                  className="mt-1"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={editMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {editMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Replace Document Dialog */}
        <Dialog open={isReplaceDialogOpen} onOpenChange={setIsReplaceDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Replace Document</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="replace-file">Choose new file</Label>
                <Input
                  id="replace-file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setReplaceFile(e.target.files?.[0] || null)}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Select a PDF, JPG, or PNG file to replace the current document (max 10MB)
                </p>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsReplaceDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleReplaceSubmit}
                  disabled={!replaceFile || replaceMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {replaceMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Replacing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Replace
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}