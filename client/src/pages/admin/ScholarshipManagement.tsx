import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Search, Filter, Eye, Download, Upload } from "lucide-react";

import { z } from "zod";

// Scholarship form validation schema
const scholarshipFormSchema = z.object({
  scholarshipId: z.string().min(3, "Scholarship ID must be at least 3 characters"),
  scholarshipName: z.string().min(5, "Scholarship name must be at least 5 characters"),
  providerName: z.string().min(3, "Provider name must be at least 3 characters"),
  providerType: z.enum(["government", "private", "institution", "other"]),
  providerCountry: z.string().min(2, "Provider country is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  shortDescription: z.string().min(10, "Short description must be at least 10 characters"),
  applicationUrl: z.string().url("Must be a valid URL"),
  studyLevel: z.string().min(1, "Study level is required"),
  fieldCategory: z.string().min(1, "Field category is required"),
  targetCountries: z.array(z.string()).min(1, "At least one target country is required"),
  fundingType: z.enum(["full", "partial", "tuition-only", "living-allowance", "travel-grant"]),
  fundingAmount: z.number().min(0, "Funding amount must be positive"),
  fundingCurrency: z.string().min(3, "Currency is required"),
  applicationDeadline: z.string().min(1, "Application deadline is required"),
  eligibilityRequirements: z.array(z.string()).min(1, "At least one eligibility requirement is required"),
  languageRequirements: z.array(z.string()),
  difficultyLevel: z.enum(["easy", "medium", "hard", "very-hard"]),
  dataSource: z.string().default("official"),
  verified: z.boolean().default(true),
  status: z.enum(["active", "inactive", "pending"]).default("active")
});

type ScholarshipFormData = z.infer<typeof scholarshipFormSchema>;

interface Scholarship extends ScholarshipFormData {
  id: number;
  createdDate: string;
  updatedDate: string;
}

export default function ScholarshipManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterProviderType, setFilterProviderType] = useState<string>("all");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch scholarships with pagination and filtering
  const { data: scholarshipsData, isLoading } = useQuery({
    queryKey: ['admin-scholarships', searchTerm, filterStatus, filterProviderType, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterProviderType !== 'all') params.append('providerType', filterProviderType);
      params.append('limit', '20');
      params.append('offset', ((currentPage - 1) * 20).toString());
      
      const response = await fetch(`/api/admin/scholarships?${params}`);
      if (!response.ok) throw new Error('Failed to fetch scholarships');
      return response.json();
    }
  });

  // Category-based sections for editing
  const editingSections = [
    { 
      key: 'basic', 
      title: 'Basic Information', 
      fields: ['scholarshipId', 'name', 'shortName', 'providerName', 'providerType', 'providerCountry']
    },
    { 
      key: 'funding', 
      title: 'Funding Details', 
      fields: ['fundingType', 'fundingCurrency', 'totalValueMin', 'totalValueMax', 'tuitionCoveragePercentage']
    },
    { 
      key: 'eligibility', 
      title: 'Eligibility Requirements', 
      fields: ['minGpa', 'minAge', 'maxAge', 'genderRequirement', 'minWorkExperience', 'leadershipRequired']
    },
    { 
      key: 'application', 
      title: 'Application Process', 
      fields: ['applicationUrl', 'applicationFeeAmount', 'interviewRequired', 'essayRequired']
    },
    { 
      key: 'additional', 
      title: 'Additional Information', 
      fields: ['description', 'difficultyLevel', 'status', 'verified']
    }
  ];

  // Update scholarship mutation for category-based editing
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ScholarshipFormData> }) => {
      return apiRequest('PUT', `/api/admin/scholarships/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-scholarships'] });
      setIsEditDialogOpen(false);
      setSelectedScholarship(null);
      setEditingSection(null);
      toast({ title: "Success", description: "Scholarship updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update scholarship", variant: "destructive" });
    }
  });

  // Delete scholarship mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/admin/scholarships/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-scholarships'] });
      toast({ title: "Success", description: "Scholarship deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete scholarship", variant: "destructive" });
    }
  });

  const form = useForm<ScholarshipFormData>({
    resolver: zodResolver(scholarshipFormSchema),
    defaultValues: {
      providerType: "government",
      fundingType: "full",
      difficultyLevel: "medium",
      dataSource: "official",
      verified: true,
      status: "active",
      targetCountries: [],
      eligibilityRequirements: [],
      languageRequirements: []
    }
  });

  // Category-based editing handlers
  const handleEditSection = (scholarship: Scholarship, section: string) => {
    setSelectedScholarship(scholarship);
    setEditingSection(section);
    setIsEditDialogOpen(true);
    
    // Initialize form with current scholarship data
    const currentSection = editingSections.find(s => s.key === section);
    if (currentSection) {
      const sectionData = {};
      currentSection.fields.forEach(field => {
        sectionData[field] = scholarship[field];
      });
      form.reset(sectionData);
    }
  };

  const handleSectionSubmit = (data: Partial<ScholarshipFormData>) => {
    if (selectedScholarship && editingSection) {
      // Only send fields for the current section
      const currentSection = editingSections.find(s => s.key === editingSection);
      if (currentSection) {
        const sectionData = {};
        currentSection.fields.forEach(field => {
          if (data[field] !== undefined) {
            sectionData[field] = data[field];
          }
        });
        updateMutation.mutate({ id: selectedScholarship.id, data: sectionData });
      }
    }
  };

  const handleUpdateSubmit = (data: ScholarshipFormData) => {
    if (selectedScholarship) {
      updateMutation.mutate({ id: selectedScholarship.id, data });
    }
  };

  const handleEdit = (scholarship: Scholarship) => {
    setSelectedScholarship(scholarship);
    form.reset({
      ...scholarship,
      targetCountries: Array.isArray(scholarship.targetCountries) ? scholarship.targetCountries : [],
      eligibilityRequirements: Array.isArray(scholarship.eligibilityRequirements) ? scholarship.eligibilityRequirements : [],
      languageRequirements: Array.isArray(scholarship.languageRequirements) ? scholarship.languageRequirements : []
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this scholarship?')) {
      deleteMutation.mutate(id);
    }
  };

  const scholarships = scholarshipsData?.data?.scholarships || [];
  const totalScholarships = scholarshipsData?.data?.total || 0;
  const totalPages = Math.ceil(totalScholarships / 20);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scholarship Management</h1>
          <p className="text-muted-foreground">Manage scholarship database with full CRUD operations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => window.location.href = '/admin/scholarships/create'}>
            <Plus className="w-4 h-4 mr-2" />
            Add Scholarship
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scholarships</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalScholarships}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {scholarships.filter((s: Scholarship) => s.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {scholarships.filter((s: Scholarship) => s.verified).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Government</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {scholarships.filter((s: Scholarship) => s.providerType === 'government').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search scholarships..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="provider-filter">Provider Type</Label>
              <Select value={filterProviderType} onValueChange={setFilterProviderType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="institution">Institution</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("all");
                setFilterProviderType("all");
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scholarships Table */}
      <Card>
        <CardHeader>
          <CardTitle>Scholarships ({totalScholarships})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Loading scholarships...</div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Funding</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scholarships.map((scholarship: Scholarship) => (
                    <TableRow key={scholarship.id}>
                      <TableCell className="font-medium">{scholarship.scholarshipId}</TableCell>
                      <TableCell className="max-w-48 truncate">{scholarship.scholarshipName}</TableCell>
                      <TableCell>{scholarship.providerName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{scholarship.providerType}</Badge>
                      </TableCell>
                      <TableCell>{scholarship.providerCountry}</TableCell>
                      <TableCell>{scholarship.fundingAmount} {scholarship.fundingCurrency}</TableCell>
                      <TableCell>
                        <Badge variant={scholarship.status === 'active' ? 'default' : 'secondary'}>
                          {scholarship.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={scholarship.verified ? 'default' : 'destructive'}>
                          {scholarship.verified ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(scholarship)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(scholarship.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalScholarships)} of {totalScholarships} scholarships
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Scholarship</DialogTitle>
            <DialogDescription>Update scholarship information</DialogDescription>
          </DialogHeader>
          <ScholarshipForm 
            form={form} 
            onSubmit={handleUpdateSubmit} 
            isLoading={updateMutation.isPending}
            submitText="Update Scholarship"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Scholarship Form Component
interface ScholarshipFormProps {
  form: any;
  onSubmit: (data: ScholarshipFormData) => void;
  isLoading: boolean;
  submitText: string;
}

function ScholarshipForm({ form, onSubmit, isLoading, submitText }: ScholarshipFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Basic Information */}
          <FormField
            control={form.control}
            name="scholarshipId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scholarship ID *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. AUS_AWARDS_2025" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scholarshipName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scholarship Name *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Australia Awards Scholarship" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="providerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provider Name *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Australian Government" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="providerType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provider Type *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="institution">Institution</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="providerCountry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provider Country *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Australia" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="applicationUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Application URL *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="studyLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Study Level *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Masters, PhD" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fieldCategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Field Category *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Engineering, Medicine" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fundingType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Funding Type *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select funding type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="full">Full Funding</SelectItem>
                    <SelectItem value="partial">Partial Funding</SelectItem>
                    <SelectItem value="tuition-only">Tuition Only</SelectItem>
                    <SelectItem value="living-allowance">Living Allowance</SelectItem>
                    <SelectItem value="travel-grant">Travel Grant</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fundingAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Funding Amount *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    placeholder="50000"
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fundingCurrency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. USD, AUD, EUR" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="applicationDeadline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Application Deadline *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. April 30, 2025" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="difficultyLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty Level *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                    <SelectItem value="very-hard">Very Hard</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <Textarea {...field} rows={4} placeholder="Detailed scholarship description..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shortDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Description *</FormLabel>
              <FormControl>
                <Textarea {...field} rows={2} placeholder="Brief summary..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Additional Fields */}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="dataSource"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data Source</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. official, verified" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="verified"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Verified Scholarship</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : submitText}
          </Button>
        </div>
      </form>
    </Form>
  );
}