import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckSquare, 
  Search, 
  MapPin, 
  Clock, 
  DollarSign, 
  Edit, 
  Download 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { type DocumentChecklist } from "@shared/schema";
import { AdvancedChecklistForm } from "@/components/AdvancedChecklistForm";
import { AdminLayout } from "@/components/AdminLayout";



const countries = [
  "Nepal", "India", "Pakistan", "Bangladesh", "Sri Lanka", "Vietnam", "China",
  "Philippines", "Indonesia", "Thailand", "Nigeria", "Ghana", "Kenya",
  "USA", "Canada", "UK", "Australia", "Germany", "France", "Netherlands",
  "Other"
];

const visaTypes = [
  "Student F-1", "Tourist B-2", "Work H-1B", "Study Permit", "Visitor Visa",
  "Business B-1", "Transit C-1", "Family Reunification", "Investment E-2",
  "Artist O-1", "Researcher J-1", "Spouse/Partner", "Working Holiday",
  "Permanent Residence", "Refugee/Asylum", "Other"
];

export default function AdminDocumentChecklists() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedUserType, setSelectedUserType] = useState<string>("all");
  const [selectedVisaType, setSelectedVisaType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState<DocumentChecklist | null>(null);

  // Load dropdown options from database
  const { data: dropdownOptions } = useQuery({
    queryKey: ['/api/dropdown-options'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use dynamic dropdown options with fallback
  const userTypeOptions = (dropdownOptions as any)?.userTypes || ["Student", "Tourist", "Work", "Family", "Business", "Other"];
  const visaTypeOptions = (dropdownOptions as any)?.visaTypes || ["Student F-1", "Tourist B-2", "Work H-1B", "Study Permit", "Other"];
  const countryOptions = (dropdownOptions as any)?.countries || ["USA", "UK", "Canada", "Australia", "Germany", "Other"];

  const { data: checklists = [], isLoading } = useQuery<DocumentChecklist[]>({
    queryKey: ['/api/admin/document-checklists'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/admin/document-checklists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create checklist');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/document-checklists'] });
      setIsCreateDialogOpen(false);
      toast({ title: "Success", description: "Document checklist created successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<DocumentChecklist> }) => {
      const response = await fetch(`/api/admin/document-checklists/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update checklist');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/document-checklists'] });
      setEditingChecklist(null);
      toast({ title: "Success", description: "Document checklist updated successfully" });
    },
  });

  const editUpdateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      // Comprehensive data sanitization to prevent JSON corruption
      const sanitizedData: any = {};
      
      // Handle string fields explicitly
      if (data.title !== undefined) sanitizedData.title = String(data.title).trim();
      if (data.description !== undefined) sanitizedData.description = String(data.description).trim();
      if (data.country !== undefined) sanitizedData.country = String(data.country).trim();
      if (data.visaType !== undefined) sanitizedData.visaType = String(data.visaType).trim();
      if (data.userType !== undefined) sanitizedData.userType = String(data.userType).trim();
      if (data.estimatedProcessingTime !== undefined) sanitizedData.estimatedProcessingTime = String(data.estimatedProcessingTime).trim();
      if (data.totalFees !== undefined) sanitizedData.totalFees = String(data.totalFees).trim();
      if (data.isActive !== undefined) sanitizedData.isActive = Boolean(data.isActive);
      
      // Handle importantNotes with strict validation
      if (data.importantNotes !== undefined) {
        if (Array.isArray(data.importantNotes)) {
          sanitizedData.importantNotes = data.importantNotes
            .filter((note: any) => note !== null && note !== undefined)
            .map((note: any) => String(note).trim())
            .filter((note: string) => note.length > 0 && note.length < 500);
        } else {
          sanitizedData.importantNotes = [];
        }
      }
      
      // Handle items with complete validation
      if (data.items !== undefined) {
        if (Array.isArray(data.items)) {
          sanitizedData.items = data.items.map((item: any, index: number) => ({
            id: String(item.id || `item_${index}`).trim(),
            name: String(item.name || '').trim(),
            description: String(item.description || '').trim(),
            category: String(item.category || 'documentation'),
            required: Boolean(item.required),
            completed: Boolean(item.completed),
            order: parseInt(String(item.order)) || index + 1,
            tips: Array.isArray(item.tips) ? 
              item.tips.filter((tip: any) => tip && typeof tip === 'string')
                       .map((tip: any) => String(tip).trim())
                       .filter((tip: string) => tip.length > 0 && tip.length < 200) : []
          }));
        } else {
          sanitizedData.items = [];
        }
      }
      
      // Handle array fields
      if (data.originCountries !== undefined) {
        sanitizedData.originCountries = Array.isArray(data.originCountries) ? data.originCountries : [];
      }
      if (data.destinationCountries !== undefined) {
        sanitizedData.destinationCountries = Array.isArray(data.destinationCountries) ? data.destinationCountries : [];
      }
      
      const response = await fetch(`/api/admin/document-checklists/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to update checklist');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/document-checklists'] });
      setEditingChecklist(null);
      toast({ title: "Success", description: "Document checklist updated successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update checklist",
        variant: "destructive"
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/document-checklists/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete checklist');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/document-checklists'] });
      toast({ title: "Success", description: "Document checklist deleted successfully" });
    },
  });

  const filteredChecklists = checklists.filter((checklist: DocumentChecklist) => {
    const matchesSearch = checklist.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         checklist.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = selectedCountry === 'all' || checklist.country === selectedCountry;
    const matchesUserType = selectedUserType === 'all' || checklist.userType === selectedUserType;
    const matchesVisaType = selectedVisaType === 'all' || checklist.visaType === selectedVisaType;
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'active' && checklist.isActive) ||
                         (selectedStatus === 'inactive' && !checklist.isActive);
    return matchesSearch && matchesCountry && matchesUserType && matchesVisaType && matchesStatus;
  });

  const handleToggleStatus = (checklist: DocumentChecklist) => {
    updateMutation.mutate({
      id: checklist.id,
      data: { isActive: !checklist.isActive }
    });
  };

  const downloadChecklistAsExcel = (checklist: DocumentChecklist) => {
    // Convert checklist to CSV format for Excel compatibility
    const csvData = convertChecklistToCSV(checklist);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${checklist.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_checklist.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const convertChecklistToCSV = (checklist: DocumentChecklist): string => {
    let csv = 'Document Checklist Report\n\n';
    csv += `Title:,${checklist.title}\n`;
    csv += `Description:,${checklist.description}\n`;
    csv += `Country:,${checklist.country}\n`;
    csv += `Visa Type:,${checklist.visaType}\n`;
    csv += `User Type:,${checklist.userType}\n`;
    csv += `Processing Time:,${checklist.estimatedProcessingTime}\n`;
    csv += `Total Fees:,${checklist.totalFees}\n\n`;
    
    csv += 'Required Documents and Steps:\n';
    csv += 'Order,Document Name,Description,Category,Required,Tips\n';
    
    const items = Array.isArray(checklist.items) ? checklist.items : [];
    items.forEach((item: any) => {
      const tips = item.tips ? item.tips.join('; ') : '';
      csv += `${item.order || ''},"${item.name}","${item.description}","${item.category}","${item.required ? 'Yes' : 'No'}","${tips}"\n`;
    });
    
    if (checklist.importantNotes && checklist.importantNotes.length > 0) {
      csv += '\nImportant Notes:\n';
      checklist.importantNotes.forEach((note: string, index: number) => {
        csv += `${index + 1},"${note}"\n`;
      });
    }
    
    return csv;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="text-center">Loading document checklists...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Document Checklists</h1>
            <p className="text-gray-600 mt-2">Manage comprehensive document requirement checklists for visa applications</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Checklist
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Document Checklist</DialogTitle>
                <DialogDescription>
                  Create a comprehensive checklist of required documents for specific visa applications
                </DialogDescription>
              </DialogHeader>
              <AdvancedChecklistForm
                onSubmit={async (data) => {
                  await createMutation.mutateAsync(data);
                }}
                onCancel={() => setIsCreateDialogOpen(false)}
                isLoading={createMutation.isPending}
                mode="create"
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search checklists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Countries</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>

          <select
            value={selectedVisaType}
            onChange={(e) => setSelectedVisaType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Visa Types</option>
            {visaTypes.map((visaType) => (
              <option key={visaType} value={visaType}>
                {visaType}
              </option>
            ))}
          </select>

          <select
            value={selectedUserType}
            onChange={(e) => setSelectedUserType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All User Types</option>
            {userTypeOptions.map((userType: string) => (
              <option key={userType} value={userType.toLowerCase()}>
                {userType}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="mb-4 text-sm text-gray-600">
          Total: {filteredChecklists.length} checklists
        </div>

        {/* Checklists Grid - Maximum 3 cards per row for better UX */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full min-w-0 auto-rows-fr">
          {filteredChecklists.map((checklist: DocumentChecklist) => (
            <Card key={checklist.id} className="hover:shadow-lg transition-all duration-200 shadow-sm hover:shadow-md bg-white h-full flex flex-col w-full min-w-0 max-w-full overflow-hidden">
              <CardHeader className="pb-4 flex-shrink-0">
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <div className="flex items-start space-x-2 min-w-0 flex-1 overflow-hidden">
                    <CheckSquare className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <CardTitle className="text-sm sm:text-base lg:text-lg leading-tight mb-2 truncate">
                        {checklist.title}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm line-clamp-2 break-words">
                        {checklist.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingChecklist(checklist)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="Edit Checklist"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(checklist)}
                      className="p-1"
                      title={checklist.isActive ? "Deactivate" : "Activate"}
                    >
                      {checklist.isActive ? 
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
                          <AlertDialogTitle>Delete Checklist</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{checklist.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteMutation.mutate(checklist.id)}
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
              
              <CardContent className="pt-0 min-w-0 overflow-hidden">
                <div className="space-y-4 min-w-0">
                  {/* Route Information */}
                  <div className="bg-gray-50 p-3 rounded-lg min-w-0 overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-700">Application Route</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 w-12 flex-shrink-0">From:</span>
                        <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 flex-shrink-0">{checklist.country}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 w-12 flex-shrink-0">Type:</span>
                        <Badge variant="outline" className="text-xs bg-purple-50 border-purple-200 flex-shrink-0">{checklist.visaType}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 w-12 flex-shrink-0">User:</span>
                        <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200 flex-shrink-0">{checklist.userType}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                    <div className="bg-blue-50 p-3 rounded-lg min-w-0 overflow-hidden">
                      <div className="flex items-center space-x-2 min-w-0">
                        <CheckSquare className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <div className="min-w-0 overflow-hidden">
                          <div className="text-xs text-blue-600 font-medium">Documents</div>
                          <div className="text-sm font-bold text-blue-800 truncate">
                            {Array.isArray(checklist.items) ? checklist.items.length : 0} required
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {checklist.estimatedProcessingTime && (
                      <div className="bg-yellow-50 p-3 rounded-lg min-w-0 overflow-hidden">
                        <div className="flex items-center space-x-2 min-w-0">
                          <Clock className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                          <div className="min-w-0 overflow-hidden">
                            <div className="text-xs text-yellow-600 font-medium">Processing</div>
                            <div className="text-sm font-bold text-yellow-800 truncate">{checklist.estimatedProcessingTime}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {checklist.totalFees && (
                      <div className="bg-green-50 p-3 rounded-lg col-span-1 sm:col-span-2 min-w-0 overflow-hidden">
                        <div className="flex items-center space-x-2 min-w-0">
                          <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <div className="min-w-0 overflow-hidden">
                            <div className="text-xs text-green-600 font-medium">Total Fees</div>
                            <div className="text-sm font-bold text-green-800 truncate">{checklist.totalFees}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status and Metadata */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm min-w-0">
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="text-gray-500 flex-shrink-0">Status:</span>
                      <Badge variant={checklist.isActive ? "default" : "secondary"} className="truncate">
                        {checklist.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="text-gray-500 text-xs sm:text-sm truncate">
                      Created: {formatDate(checklist.createdAt)}
                    </div>
                  </div>

                  {/* Important Notes Preview */}
                  {checklist.importantNotes && checklist.importantNotes.length > 0 && (
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 min-w-0 overflow-hidden">
                      <div className="text-xs text-orange-600 font-medium mb-1 truncate">Important Notes</div>
                      <div className="text-sm text-orange-800 line-clamp-2 break-words">
                        {checklist.importantNotes[0]}
                        {checklist.importantNotes.length > 1 && ` +${checklist.importantNotes.length - 1} more`}
                      </div>
                    </div>
                  )}

                  {/* Download Checklist as Excel Button */}
                  <div className="pt-3 border-t min-w-0">
                    <Button
                      onClick={() => downloadChecklistAsExcel(checklist)}
                      className="w-full text-sm"
                      size="sm"
                      variant="outline"
                    >
                      <Download className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">Download Excel</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredChecklists.length === 0 && (
          <div className="text-center py-12">
            <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No checklists found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCountry !== 'all' || selectedUserType !== 'all' || selectedVisaType !== 'all'
                ? "Try adjusting your search or filter criteria."
                : "Create your first document checklist to get started."
              }
            </p>
            {!searchTerm && selectedCountry === 'all' && selectedUserType === 'all' && selectedVisaType === 'all' && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Checklist
              </Button>
            )}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingChecklist} onOpenChange={() => setEditingChecklist(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Document Checklist</DialogTitle>
              <DialogDescription>
                Update the checklist information and requirements
              </DialogDescription>
            </DialogHeader>
            {editingChecklist && (
              <AdvancedChecklistForm
                initialData={editingChecklist}
                mode="edit"
                onSubmit={async (data) => {
                  return new Promise<void>((resolve, reject) => {
                    editUpdateMutation.mutate({ id: editingChecklist!.id, data: data }, {
                      onSuccess: () => resolve(),
                      onError: (error) => reject(error)
                    });
                  });
                }}
                onCancel={() => setEditingChecklist(null)}
                isLoading={editUpdateMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}