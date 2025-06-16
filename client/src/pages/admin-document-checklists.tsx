import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Edit, Trash2, Eye, EyeOff, CheckSquare, Search, MapPin, Clock, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { insertDocumentChecklistSchema, type DocumentChecklist, type DocumentChecklistFormData } from "@shared/schema";
import { SimpleChecklistForm } from "@/components/SimpleChecklistForm";
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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState<DocumentChecklist | null>(null);

  const { data: checklists = [], isLoading } = useQuery({
    queryKey: ['/api/admin/document-checklists'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: DocumentChecklistFormData) => {
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
      toast({ title: "Checklist created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create checklist", variant: "destructive" });
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
      toast({ title: "Checklist updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update checklist", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/document-checklists/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete checklist');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/document-checklists'] });
      toast({ title: "Checklist deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete checklist", variant: "destructive" });
    },
  });

  const form = useForm<DocumentChecklistFormData>({
    resolver: zodResolver(insertDocumentChecklistSchema),
    defaultValues: {
      country: "",
      visaType: "",
      userType: "student",
      categories: [],
      estimatedProcessingTime: "",
      fees: [],
      importantNotes: [],
      isActive: true,
    },
  });

  const filteredChecklists = checklists.filter((checklist: DocumentChecklist) => {
    const matchesSearch = checklist.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         checklist.visaType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = selectedCountry === "all" || checklist.country === selectedCountry;
    const matchesUserType = selectedUserType === "all" || checklist.userType === selectedUserType;
    return matchesSearch && matchesCountry && matchesUserType;
  });

  const handleSubmit = (data: DocumentChecklistFormData) => {
    if (editingChecklist) {
      updateMutation.mutate({ id: editingChecklist.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (checklist: DocumentChecklist) => {
    setEditingChecklist(checklist);
    form.reset({
      country: checklist.country,
      visaType: checklist.visaType,
      userType: checklist.userType as any,
      categories: checklist.categories || [],
      estimatedProcessingTime: checklist.estimatedProcessingTime,
      fees: checklist.fees || [],
      importantNotes: checklist.importantNotes,
      isActive: checklist.isActive,
    });
    setIsCreateDialogOpen(true);
  };

  const handleToggleStatus = (checklist: DocumentChecklist) => {
    updateMutation.mutate({
      id: checklist.id,
      data: { isActive: !checklist.isActive }
    });
  };

  const downloadChecklist = (checklist: DocumentChecklist) => {
    const checklistData = {
      country: checklist.country,
      visaType: checklist.visaType,
      userType: checklist.userType,
      categories: checklist.categories,
      estimatedProcessingTime: checklist.estimatedProcessingTime,
      fees: checklist.fees,
      importantNotes: checklist.importantNotes,
      lastUpdated: checklist.updatedAt || checklist.createdAt
    };

    const blob = new Blob([JSON.stringify(checklistData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${checklist.country}_${checklist.visaType}_${checklist.userType}_checklist.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    form.reset();
    setEditingChecklist(null);
    setIsCreateDialogOpen(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Document Checklists</h1>
            <p className="text-muted-foreground">
              Manage country-specific document checklists for visa applications
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Checklist
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingChecklist ? "Edit Checklist" : "Create New Checklist"}
                </DialogTitle>
                <DialogDescription>
                  {editingChecklist ? "Update the checklist details below." : "Fill in the details to create a new document checklist."}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {countries.map((country) => (
                                <SelectItem key={country} value={country}>
                                  {country}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="userType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>User Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select user type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {userTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="visaType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visa Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select visa type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {visaTypes.map((visa) => (
                              <SelectItem key={visa} value={visa}>
                                {visa}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="estimatedProcessingTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Processing Time</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 4-6 weeks" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active</FormLabel>
                          <FormDescription>
                            Make this checklist available to users
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      {editingChecklist ? "Update" : "Create"} Checklist
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search checklists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedUserType} onValueChange={setSelectedUserType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by user type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All User Types</SelectItem>
              {userTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChecklists.map((checklist: DocumentChecklist) => (
              <Card key={checklist.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {checklist.country}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {checklist.visaType} • {userTypes.find(t => t.value === checklist.userType)?.label}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={checklist.isActive ? "default" : "secondary"}>
                        {checklist.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {checklist.estimatedProcessingTime}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Categories:</span>
                      <Badge variant="outline">
                        {checklist.categories?.length || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Fees:</span>
                      <Badge variant="outline">
                        {checklist.fees?.length || 0}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Created {new Date(checklist.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadChecklist(checklist)}
                          title="Download checklist"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={checklist.isActive ? "destructive" : "default"}
                          onClick={() => handleToggleStatus(checklist)}
                          disabled={updateMutation.isPending}
                          title={checklist.isActive ? "Disable checklist" : "Enable checklist"}
                        >
                          {checklist.isActive ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-1" />
                              Disable
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-1" />
                              Enable
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(checklist)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Checklist</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the checklist for {checklist.country} - {checklist.visaType}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(checklist.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && filteredChecklists.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No checklists found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm || selectedCountry !== "all" || selectedUserType !== "all"
                  ? "Try adjusting your search criteria."
                  : "Get started by creating your first document checklist."}
              </p>
              {!searchTerm && selectedCountry === "all" && selectedUserType === "all" && (
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Checklist
                    </Button>
                  </DialogTrigger>
                </Dialog>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}