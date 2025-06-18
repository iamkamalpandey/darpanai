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
import { queryClient, apiRequest } from "@/lib/queryClient";
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

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function AdminDocumentTemplates() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedVisaType, setSelectedVisaType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<DocumentTemplate | null>(null);
  const { toast } = useToast();

  const { data: templates = [], isLoading } = useQuery<DocumentTemplate[]>({
    queryKey: ['/api/admin/document-templates'],
  });

  const { data: dropdownOptions = { countries: [], visaTypes: [], userTypes: [] } } = useQuery<{
    countries: string[];
    visaTypes: string[];
    userTypes: string[];
  }>({
    queryKey: ['/api/dropdown-options'],
  });

  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/admin/document-templates', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to create template');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/document-templates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dropdown-options'] });
      toast({
        title: "Success",
        description: "Template created successfully",
      });
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create template",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
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
      queryClient.invalidateQueries({ queryKey: ['/api/dropdown-options'] });
      toast({
        title: "Success",
        description: "Template updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update template",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/document-templates/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/document-templates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dropdown-options'] });
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete template",
        variant: "destructive",
      });
    },
  });

  const filteredTemplates = templates.filter((template: DocumentTemplate) => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    const matchesCountry = !selectedCountry || 
      (template.countries && template.countries.includes(selectedCountry));
    const matchesVisaType = !selectedVisaType || 
      (template.visaTypes && template.visaTypes.includes(selectedVisaType));
    const matchesStatus = !selectedStatus || 
      (selectedStatus === 'active' && template.isActive) ||
      (selectedStatus === 'inactive' && !template.isActive);
    
    return matchesSearch && matchesCategory && matchesCountry && matchesVisaType && matchesStatus;
  });

  const handleSubmit = async (formData: FormData) => {
    createMutation.mutate(formData);
  };

  const handleToggleStatus = (template: DocumentTemplate) => {
    updateMutation.mutate({
      id: template.id,
      data: { isActive: !template.isActive }
    });
  };

  const downloadTemplate = (template: DocumentTemplate) => {
    if (template.filePath) {
      window.open(`/api/document-templates/${template.id}/download`, '_blank');
    } else {
      toast({
        title: "No file available",
        description: "This template doesn't have a downloadable file.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading templates...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Document Templates</h1>
            <p className="text-gray-600 mt-1">Manage downloadable document templates for users</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
              {dropdownOptions.countries.map((country: string) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>

            <select
              value={selectedVisaType}
              onChange={(e) => setSelectedVisaType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Visa Types</option>
              {dropdownOptions.visaTypes.map((visaType: string) => (
                <option key={visaType} value={visaType}>{visaType}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            Total: {filteredTemplates.length} templates
          </div>
        </div>

        {/* Templates Grid - Maximum 3 cards per row for better UX */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full min-w-0 auto-rows-fr">
          {filteredTemplates.map((template: DocumentTemplate) => (
            <Card key={template.id} className="group hover:shadow-lg transition-all duration-200 shadow-sm hover:shadow-md bg-white w-full min-w-0 max-w-full overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-3 min-w-0">
                  <div className="flex items-center space-x-2 min-w-0 flex-1 overflow-hidden">
                    <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 truncate">
                      {template.category}
                    </Badge>
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
                            Are you sure you want to delete this template? This action cannot be undone.
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
                
                <CardTitle className="text-base sm:text-lg leading-tight mb-2 group-hover:text-blue-700 transition-colors truncate">
                  {template.title}
                </CardTitle>
                
                <CardDescription className="text-sm text-gray-600 line-clamp-3 leading-relaxed break-words">
                  {template.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0 space-y-4 flex-1 min-w-0 overflow-hidden">
                {/* Countries and Visa Types */}
                <div className="bg-gray-50 p-3 rounded-lg space-y-3 min-w-0">
                  {template.countries && template.countries.length > 0 && (
                    <div className="min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-700">Countries</span>
                        <span className="text-xs text-gray-500">({template.countries.length} total)</span>
                      </div>
                      <div className="space-y-1">
                        {template.countries.slice(0, 3).map((country, index) => (
                          <div key={country} className="flex items-center justify-between py-1">
                            <span className="text-xs text-gray-600">{index + 1}.</span>
                            <Badge variant="secondary" className="text-xs flex-shrink-0 ml-2">
                              {country}
                            </Badge>
                          </div>
                        ))}
                        {template.countries.length > 3 && (
                          <div className="text-center">
                            <Badge variant="secondary" className="text-xs">
                              +{template.countries.length - 3} more countries
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {template.visaTypes && template.visaTypes.length > 0 && (
                    <div className="min-w-0 border-t border-gray-200 pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-700">Visa Types</span>
                        <span className="text-xs text-gray-500">({template.visaTypes.length} total)</span>
                      </div>
                      <div className="space-y-1">
                        {template.visaTypes.slice(0, 3).map((visaType, index) => (
                          <div key={visaType} className="flex items-center justify-between py-1">
                            <span className="text-xs text-gray-600">{index + 1}.</span>
                            <Badge variant="outline" className="text-xs flex-shrink-0 ml-2">
                              {visaType}
                            </Badge>
                          </div>
                        ))}
                        {template.visaTypes.length > 3 && (
                          <div className="text-center">
                            <Badge variant="outline" className="text-xs">
                              +{template.visaTypes.length - 3} more types
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* File Information */}
                {(template.fileName || template.fileSize) && (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2 min-w-0 overflow-hidden">
                    {template.fileName && (
                      <div className="flex items-center justify-between text-xs min-w-0">
                        <span className="text-gray-600 flex-shrink-0">File:</span>
                        <span className="font-medium text-gray-800 truncate ml-2 min-w-0">{template.fileName}</span>
                      </div>
                    )}
                    {template.fileSize && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 flex-shrink-0">Size:</span>
                        <span className="text-gray-800 whitespace-nowrap">{formatFileSize(template.fileSize)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 min-w-0">
                  <Badge variant={template.isActive ? "default" : "secondary"} className="text-xs w-fit">
                    {template.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <span className="text-xs text-gray-500 truncate">
                    Created: {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategory 
                ? "Try adjusting your search or filter criteria to find relevant templates."
                : "Document templates are currently being prepared. Please check back soon."
              }
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Template
            </Button>
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isCreateDialogOpen || !!editingTemplate} onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingTemplate(null);
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? `Edit Template: ${editingTemplate.title}` : 'Create New Template'}
              </DialogTitle>
              <DialogDescription>
                Fill in the details to {editingTemplate ? 'update' : 'create'} a document template.
              </DialogDescription>
            </DialogHeader>
            
            <AdvancedTemplateForm
              initialData={editingTemplate}
              mode={editingTemplate ? "edit" : "create"}
              onSubmit={async (formData: FormData) => {
                try {
                  if (editingTemplate) {
                    await updateMutation.mutateAsync({ id: editingTemplate.id, data: formData });
                  } else {
                    await createMutation.mutateAsync(formData);
                  }
                  queryClient.invalidateQueries({ queryKey: ['/api/admin/document-templates'] });
                  toast({
                    title: "Success",
                    description: `Template ${editingTemplate ? 'updated' : 'created'} successfully`,
                  });
                  setIsCreateDialogOpen(false);
                  setEditingTemplate(null);
                } catch (error: any) {
                  toast({
                    title: "Error",
                    description: error.message || `Failed to ${editingTemplate ? 'update' : 'create'} template`,
                    variant: "destructive",
                  });
                }
              }}
              onCancel={() => {
                setIsCreateDialogOpen(false);
                setEditingTemplate(null);
              }}
              isLoading={createMutation.isPending || updateMutation.isPending}
              initialData={editingTemplate}
              mode={editingTemplate ? "edit" : "create"}
            />
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}