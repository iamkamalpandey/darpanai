import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Trash2, Eye, EyeOff, FileText, Search, Download, Upload, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { type DocumentTemplate } from "@shared/schema";
import { AdminLayout } from "@/components/AdminLayout";
import { AdvancedTemplateForm } from "@/components/AdvancedTemplateForm";

const categories = [
  { value: "financial", label: "Financial" },
  { value: "academic", label: "Academic" },
  { value: "personal", label: "Personal" },
  { value: "employment", label: "Employment" },
  { value: "travel", label: "Travel" },
  { value: "legal", label: "Legal" },
  { value: "medical", label: "Medical" },
  { value: "insurance", label: "Insurance" },
  { value: "accommodation", label: "Accommodation" },
  { value: "language", label: "Language" },
  { value: "others", label: "Others" }
];

export default function AdminDocumentTemplates() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedVisaType, setSelectedVisaType] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<DocumentTemplate | null>(null);
  const { toast } = useToast();

  const { data: templates = [], isLoading } = useQuery<DocumentTemplate[]>({
    queryKey: ['/api/admin/document-templates'],
  });

  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/admin/document-templates', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to create template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/document-templates'] });
      setIsCreateDialogOpen(false);
      toast({ title: "Success", description: "Document template uploaded successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<DocumentTemplate> }) => {
      const response = await fetch(`/api/admin/document-templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/document-templates'] });
      setEditingTemplate(null);
      toast({ title: "Success", description: "Document template updated successfully" });
    },
  });

  const editUpdateMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`/api/admin/document-templates/${editingTemplate?.id}`, {
        method: 'PATCH',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to update template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/document-templates'] });
      setEditingTemplate(null);
      toast({ title: "Success", description: "Document template updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/document-templates/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete template');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/document-templates'] });
      toast({ title: "Success", description: "Document template deleted successfully" });
    },
  });

  const filteredTemplates = templates.filter((template: DocumentTemplate) => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (formData: FormData) => {
    await createMutation.mutateAsync(formData);
  };

  const handleToggleStatus = (template: DocumentTemplate) => {
    updateMutation.mutate({
      id: template.id,
      data: { isActive: !template.isActive }
    });
  };

  const downloadTemplate = (template: DocumentTemplate) => {
    const link = document.createElement('a');
    link.href = `/api/document-templates/${template.id}/download`;
    link.download = template.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="text-center">Loading document templates...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Document Templates</h1>
            <p className="text-gray-600 mt-2">Manage uploadable sample documents for visa applications</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Upload Document Template</DialogTitle>
                <DialogDescription>
                  Upload sample document files that users can download as templates
                </DialogDescription>
              </DialogHeader>
              <AdvancedTemplateForm
                onSubmit={handleSubmit}
                onCancel={() => setIsCreateDialogOpen(false)}
                isLoading={createMutation.isPending}
                mode="create"
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter Controls */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Countries</option>
              {(dropdownOptions?.countries || []).map((country: string) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>

            <select
              value={selectedVisaType}
              onChange={(e) => setSelectedVisaType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Visa Types</option>
              {(dropdownOptions?.visaTypes || []).map((visaType: string) => (
                <option key={visaType} value={visaType}>{visaType}</option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-600">
            Total: {filteredTemplates.length} templates
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredTemplates.map((template: DocumentTemplate) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2">
                    <FileText className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg leading-6 truncate">{template.title}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {template.documentType ? 
                          template.documentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
                          'Document'
                        }
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingTemplate(template)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="Edit Template"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(template)}
                      className="p-1"
                      title={template.isActive ? "Deactivate" : "Activate"}
                    >
                      {template.isActive ? 
                        <Eye className="h-4 w-4 text-green-600" /> : 
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      }
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-1 text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Template</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{template.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteMutation.mutate(template.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.description}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">File:</span>
                    <span className="font-medium">{template.fileName}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Size:</span>
                    <span>{formatFileSize(template.fileSize)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Category:</span>
                    <Badge variant="secondary">{template.category}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Status:</span>
                    <Badge variant={template.isActive ? "default" : "secondary"}>
                      {template.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {template.countries && template.countries.length > 0 && (
                    <div className="text-sm">
                      <span className="text-gray-500 block mb-1">Countries:</span>
                      <div className="flex flex-wrap gap-1">
                        {template.countries.slice(0, 3).map((country, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {country}
                          </Badge>
                        ))}
                        {template.countries.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.countries.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {template.visaTypes && template.visaTypes.length > 0 && (
                    <div className="text-sm">
                      <span className="text-gray-500 block mb-1">Visa Types:</span>
                      <div className="flex flex-wrap gap-1">
                        {template.visaTypes.slice(0, 2).map((visa, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {visa}
                          </Badge>
                        ))}
                        {template.visaTypes.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.visaTypes.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Button
                    onClick={() => downloadTemplate(template)}
                    className="w-full"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategory 
                ? "Try adjusting your search or filter criteria."
                : "Upload your first document template to get started."
              }
            </p>
            {!searchTerm && !selectedCategory && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload First Template
              </Button>
            )}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Document Template</DialogTitle>
              <DialogDescription>
                Update the template information and file
              </DialogDescription>
            </DialogHeader>
            {editingTemplate && (
              <AdvancedTemplateForm
                initialData={editingTemplate}
                mode="edit"
                onSubmit={async (data: FormData) => {
                  return new Promise<void>((resolve, reject) => {
                    editUpdateMutation.mutate(data, {
                      onSuccess: () => resolve(),
                      onError: (error) => reject(error)
                    });
                  });
                }}
                onCancel={() => setEditingTemplate(null)}
                isLoading={editUpdateMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}