import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Trash2, Eye, EyeOff, CheckSquare, Search, MapPin, Clock, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { type DocumentChecklist } from "@shared/schema";
import { AdvancedChecklistForm } from "@/components/AdvancedChecklistForm";
import { AdminLayout } from "@/components/AdminLayout";

const userTypes = [
  { value: "student", label: "Student" },
  { value: "tourist", label: "Tourist" },
  { value: "work", label: "Work" },
  { value: "family", label: "Family" },
  { value: "business", label: "Business" },
];

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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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
      toast({ title: "Success", description: "Document checklist updated successfully" });
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
    return matchesSearch && matchesCountry && matchesUserType && matchesVisaType;
  });

  const handleToggleStatus = (checklist: DocumentChecklist) => {
    updateMutation.mutate({
      id: checklist.id,
      data: { isActive: !checklist.isActive }
    });
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
      <div className="p-8">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
            {userTypes.map((userType) => (
              <option key={userType.value} value={userType.value}>
                {userType.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4 text-sm text-gray-600">
          Total: {filteredChecklists.length} checklists
        </div>

        {/* Checklists Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {filteredChecklists.map((checklist: DocumentChecklist) => (
            <Card key={checklist.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 min-w-0 flex-1">
                    <CheckSquare className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg leading-tight line-clamp-2 mb-2">
                        {checklist.title}
                      </CardTitle>
                      <CardDescription className="text-sm line-clamp-2">
                        {checklist.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(checklist)}
                      className="p-1"
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
              
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Route Information */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">From:</span>
                        <Badge variant="outline">{checklist.country}</Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">Type:</span>
                        <Badge variant="outline">{checklist.visaType}</Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">User:</span>
                        <Badge variant="outline">{checklist.userType}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckSquare className="h-4 w-4 text-blue-600" />
                        <div>
                          <div className="text-xs text-blue-600 font-medium">Documents</div>
                          <div className="text-sm font-bold text-blue-800">
                            {Array.isArray(checklist.items) ? checklist.items.length : 0} required
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {checklist.estimatedProcessingTime && (
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-yellow-600" />
                          <div>
                            <div className="text-xs text-yellow-600 font-medium">Processing</div>
                            <div className="text-sm font-bold text-yellow-800">{checklist.estimatedProcessingTime}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {checklist.totalFees && (
                      <div className="bg-green-50 p-3 rounded-lg col-span-2">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <div>
                            <div className="text-xs text-green-600 font-medium">Total Fees</div>
                            <div className="text-sm font-bold text-green-800">{checklist.totalFees}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status and Metadata */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">Status:</span>
                      <Badge variant={checklist.isActive ? "default" : "secondary"}>
                        {checklist.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="text-gray-500">
                      Created: {formatDate(checklist.createdAt)}
                    </div>
                  </div>

                  {/* Important Notes Preview */}
                  {checklist.importantNotes && checklist.importantNotes.length > 0 && (
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                      <div className="text-xs text-orange-600 font-medium mb-1">Important Notes</div>
                      <div className="text-sm text-orange-800 line-clamp-2">
                        {checklist.importantNotes[0]}
                        {checklist.importantNotes.length > 1 && ` +${checklist.importantNotes.length - 1} more`}
                      </div>
                    </div>
                  )}
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
      </div>
    </AdminLayout>
  );
}