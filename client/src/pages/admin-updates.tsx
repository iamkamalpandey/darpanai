import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateSchema, type UpdateFormData, type Update } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, Users, Calendar, AlertCircle, Image, Upload } from "lucide-react";
import { format } from "date-fns";

export default function AdminUpdates() {
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<Update | null>(null);

  // Fetch all updates
  const { data: updates = [], isLoading } = useQuery<Update[]>({
    queryKey: ["/api/admin/updates"],
  });

  // Create update mutation
  const createMutation = useMutation({
    mutationFn: (data: UpdateFormData) => apiRequest("POST", "/api/admin/updates", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/updates"] });
      toast({ title: "Success", description: "Update created successfully" });
      setCreateOpen(false);
      createForm.reset();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error?.message || "Failed to create update", variant: "destructive" });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UpdateFormData> }) => 
      apiRequest("PATCH", `/api/admin/updates/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/updates"] });
      toast({ title: "Success", description: "Update updated successfully" });
      setEditingUpdate(null);
      editForm.reset();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error?.message || "Failed to update update", variant: "destructive" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/updates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/updates"] });
      toast({ title: "Success", description: "Update deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error?.message || "Failed to delete update", variant: "destructive" });
    },
  });

  // Forms
  const createForm = useForm<UpdateFormData>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      title: "",
      content: "",
      summary: "",
      imageUrl: "",
      type: "general",
      priority: "normal",
      targetAudience: "all",
      targetVisaCategories: [],
      targetUserIds: [],
      callToAction: "",
      externalLink: "",
      expiresAt: "",
    },
  });

  const editForm = useForm<UpdateFormData>({
    resolver: zodResolver(updateSchema),
  });

  const handleCreate = (data: UpdateFormData) => {
    createMutation.mutate(data);
  };

  const handleEdit = (data: UpdateFormData) => {
    if (editingUpdate) {
      updateMutation.mutate({ id: editingUpdate.id, data });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this update?")) {
      deleteMutation.mutate(id);
    }
  };

  const startEdit = (update: Update) => {
    setEditingUpdate(update);
    editForm.reset({
      title: update.title,
      content: update.content,
      summary: update.summary,
      type: update.type as "general" | "visa_category" | "individual",
      priority: update.priority as "low" | "normal" | "high" | "urgent",
      targetAudience: update.targetAudience as "all" | "students" | "agents" | "other",
      targetVisaCategories: update.targetVisaCategories || [],
      targetUserIds: update.targetUserIds || [],
      callToAction: update.callToAction || "",
      externalLink: update.externalLink || "",
      expiresAt: update.expiresAt ? format(new Date(update.expiresAt), "yyyy-MM-dd'T'HH:mm") : "",
    });
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "urgent": return "destructive";
      case "high": return "default";
      case "normal": return "secondary";
      case "low": return "outline";
      default: return "secondary";
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "general": return "default";
      case "visa_category": return "secondary";
      case "individual": return "outline";
      default: return "default";
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading updates...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">System Updates</h1>
            <p className="text-gray-600">Manage system updates and notifications for users</p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Update
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Update</DialogTitle>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Update title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="summary"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Summary</FormLabel>
                          <FormControl>
                            <Input placeholder="Brief summary for list view" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Image URL (Optional)</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input 
                                placeholder="https://example.com/image.jpg or https://example.com/image.png" 
                                {...field} 
                              />
                              <Button type="button" variant="outline" size="sm">
                                <Upload className="h-4 w-4" />
                              </Button>
                            </div>
                          </FormControl>
                          <p className="text-xs text-muted-foreground">
                            Add a small image (JPG/PNG) to make your update more engaging. Recommended size: 400x200px
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Detailed update content" rows={4} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="general">General</SelectItem>
                              <SelectItem value="visa_category">Visa Category</SelectItem>
                              <SelectItem value="individual">Individual</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="targetAudience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Audience</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select audience" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="all">All Users</SelectItem>
                              <SelectItem value="students">Students Only</SelectItem>
                              <SelectItem value="agents">Agents Only</SelectItem>
                              <SelectItem value="other">Other Visa Categories</SelectItem>
                              <SelectItem value="visa_type">Specific Visa Types</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Conditional Visa Type Selection */}
                    {createForm.watch("targetAudience") === "visa_type" && (
                      <FormField
                        control={createForm.control}
                        name="targetVisaCategories"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Specific Visa Types</FormLabel>
                            <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg">
                              {[
                                "Student Visa (F-1)", "Tourist Visa (B-2)", "Work Visa (H-1B)", 
                                "Business Visa (B-1)", "Transit Visa", "Family Visa",
                                "Study Permit (Canada)", "Visitor Visa (Canada)", "Work Permit (Canada)",
                                "Student Visa (Australia)", "Tourist Visa (Australia)", "Work Visa (Australia)",
                                "Student Visa (UK)", "Tourist Visa (UK)", "Work Visa (UK)",
                                "Schengen Visa", "Other Visa Types"
                              ].map((visaType) => (
                                <div key={visaType} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={visaType}
                                    checked={field.value?.includes(visaType) || false}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      if (checked) {
                                        field.onChange([...current, visaType]);
                                      } else {
                                        field.onChange(current.filter((v: string) => v !== visaType));
                                      }
                                    }}
                                  />
                                  <label htmlFor={visaType} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {visaType}
                                  </label>
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Select specific visa types to target users with relevant applications
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={createForm.control}
                      name="callToAction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Call to Action (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Button text" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="externalLink"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>External Link (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="expiresAt"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Expires At (Optional)</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Creating..." : "Create Update"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Updates List */}
        <div className="grid gap-4">
          {updates.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No updates found</h3>
                <p className="text-gray-500 text-center mb-4">Create your first system update to get started.</p>
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Update
                </Button>
              </CardContent>
            </Card>
          ) : (
            updates.map((update: Update) => (
              <Card key={update.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{update.title}</CardTitle>
                        <Badge variant={getPriorityBadgeVariant(update.priority)}>
                          {update.priority}
                        </Badge>
                        <Badge variant={getTypeBadgeVariant(update.type)}>
                          {update.type.replace('_', ' ')}
                        </Badge>
                        {!update.isActive && (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </div>
                      <CardDescription>{update.summary}</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(update)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(update.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {update.imageUrl && (
                      <div className="w-full">
                        <img 
                          src={update.imageUrl} 
                          alt={update.title}
                          className="w-full max-w-md h-32 object-cover rounded-lg border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <p className="text-sm text-gray-700">{update.content}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {update.targetAudience === 'all' ? 'All Users' : update.targetAudience}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(update.createdAt), "MMM d, yyyy")}
                      </div>
                      {update.expiresAt && (
                        <div className="flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          Expires {format(new Date(update.expiresAt), "MMM d, yyyy")}
                        </div>
                      )}
                    </div>

                    {update.callToAction && update.externalLink && (
                      <div className="pt-2">
                        <Button size="sm" variant="outline" asChild>
                          <a href={update.externalLink} target="_blank" rel="noopener noreferrer">
                            {update.callToAction}
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingUpdate} onOpenChange={() => setEditingUpdate(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Update</DialogTitle>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Update title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="summary"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Summary</FormLabel>
                        <FormControl>
                          <Input placeholder="Brief summary for list view" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Image URL (Optional)</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input 
                              placeholder="https://example.com/image.jpg or https://example.com/image.png" 
                              {...field} 
                            />
                            <Button type="button" variant="outline" size="sm">
                              <Upload className="h-4 w-4" />
                            </Button>
                          </div>
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Add a small image (JPG/PNG) to make your update more engaging. Recommended size: 400x200px
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Detailed update content" rows={4} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="visa_category">Visa Category</SelectItem>
                            <SelectItem value="individual">Individual</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="targetAudience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Audience</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select audience" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">All Users</SelectItem>
                            <SelectItem value="students">Students Only</SelectItem>
                            <SelectItem value="agents">Agents Only</SelectItem>
                            <SelectItem value="other">Other Visa Categories</SelectItem>
                            <SelectItem value="visa_type">Specific Visa Types</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                    {/* Conditional Visa Type Selection for Edit Form */}
                    {editForm.watch("targetAudience") === "visa_type" && (
                      <FormField
                        control={editForm.control}
                        name="targetVisaCategories"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Specific Visa Types</FormLabel>
                            <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg">
                              {[
                                "Student Visa (F-1)", "Tourist Visa (B-2)", "Work Visa (H-1B)", 
                                "Business Visa (B-1)", "Transit Visa", "Family Visa",
                                "Study Permit (Canada)", "Visitor Visa (Canada)", "Work Permit (Canada)",
                                "Student Visa (Australia)", "Tourist Visa (Australia)", "Work Visa (Australia)",
                                "Student Visa (UK)", "Tourist Visa (UK)", "Work Visa (UK)",
                                "Schengen Visa", "Other Visa Types"
                              ].map((visaType) => (
                                <div key={visaType} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`edit-${visaType}`}
                                    checked={field.value?.includes(visaType) || false}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      if (checked) {
                                        field.onChange([...current, visaType]);
                                      } else {
                                        field.onChange(current.filter((v: string) => v !== visaType));
                                      }
                                    }}
                                  />
                                  <label htmlFor={`edit-${visaType}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {visaType}
                                  </label>
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Select specific visa types to target users with relevant applications
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                  <FormField
                    control={editForm.control}
                    name="callToAction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Call to Action (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Button text" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="externalLink"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>External Link (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="expiresAt"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Expires At (Optional)</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setEditingUpdate(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Updating..." : "Update"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}