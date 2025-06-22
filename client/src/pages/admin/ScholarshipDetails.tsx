import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Edit, DollarSign, Globe, Calendar, Users, BookOpen, GraduationCap, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ScholarshipSectionEditor } from "@/components/admin/ScholarshipSectionEditor";
import { Label } from "@/components/ui/label";
import { AdminLayout } from "@/components/AdminLayout";

interface Scholarship {
  id: number;
  scholarshipId: string;
  scholarshipName: string;
  providerName: string;
  providerType: string;
  providerCountry: string;
  description: string;
  shortDescription: string;
  applicationUrl: string;
  studyLevel: string;
  fieldCategory: string;
  targetCountries: string[];
  fundingType: string;
  fundingAmount: number;
  fundingCurrency: string;
  applicationDeadline: string;
  eligibilityRequirements: string[];
  languageRequirements: string[];
  difficultyLevel: string;
  dataSource: string;
  verified: boolean;
  status: string;
  createdDate: string;
  updatedDate: string;
}

const editingSections = [
  {
    key: 'basic',
    title: 'Basic Information',
    icon: BookOpen,
    fields: 7
  },
  {
    key: 'study',
    title: 'Study Information',
    icon: GraduationCap,
    fields: 4
  },
  {
    key: 'funding',
    title: 'Funding Information',
    icon: DollarSign,
    fields: 5
  },
  {
    key: 'requirements',
    title: 'Requirements & Eligibility',
    icon: Users,
    fields: 4
  },
  {
    key: 'settings',
    title: 'Settings & Metadata',
    icon: Settings,
    fields: 3
  }
];

export default function ScholarshipDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editSection, setEditSection] = useState<'basic' | 'study' | 'funding' | 'requirements' | 'settings' | null>(null);

  // Fetch scholarship data with proper preloading
  const { data: scholarship, isLoading, error } = useQuery({
    queryKey: ["/api/admin/scholarships", id],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/admin/scholarships/${id}`);
      return response as unknown as Scholarship;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });

  // Status change mutation (independent)
  const statusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      return apiRequest("PATCH", `/api/admin/scholarships/${id}`, { status: newStatus });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Scholarship status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/scholarships", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/scholarships"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    },
  });

  // Section edit mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PATCH", `/api/admin/scholarships/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Scholarship updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/scholarships", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/scholarships"] });
      setEditSection(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update scholarship",
        variant: "destructive",
      });
    },
  });

  const handleSectionEdit = (section: 'basic' | 'study' | 'funding' | 'requirements' | 'settings') => {
    setEditSection(section);
  };

  const handleSectionSave = (data: any) => {
    updateMutation.mutate(data);
  };

  const handleStatusChange = (newStatus: string) => {
    statusMutation.mutate(newStatus);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading scholarship details...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !scholarship) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">Failed to load scholarship details</div>
        </div>
      </AdminLayout>
    );
  }

  // Remove old section references

  return (
    <AdminLayout>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <Button variant="ghost" size="sm" onClick={() => setLocation('/admin/scholarships')} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Scholarships
            </Button>
            
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-600">ID: {(scholarship as any)?.id}</span>
              <Badge variant={(scholarship as any)?.verified ? 'default' : 'destructive'} className="text-xs">
                {(scholarship as any)?.verified ? 'Verified' : 'Unverified'}
              </Badge>
            </div>
          </div>

          {/* Quick Status Change */}
          <div className="p-4 border-b border-gray-200">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Quick Status Change
            </Label>
            <Select 
              value={(scholarship as any)?.status || 'active'} 
              onValueChange={handleStatusChange}
              disabled={statusMutation.isPending}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Edit Sections */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Edit Sections
              </Label>
              <div className="space-y-1">
                {editingSections.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <Button
                      key={section.key}
                      variant="ghost"
                      className="w-full justify-start h-auto p-3 text-left hover:bg-gray-50"
                      onClick={() => handleSectionEdit(section.key)}
                    >
                      <IconComponent className="w-4 h-4 mr-3 flex-shrink-0 text-gray-500" />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">{section.title}</div>
                        <div className="text-xs text-gray-500">
                          {section.fields} fields
                        </div>
                      </div>
                      <Edit className="w-3 h-3 ml-auto flex-shrink-0 text-gray-400" />
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500">
              ID: {(scholarship as any)?.scholarshipId}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              {scholarship?.scholarshipName || 'Loading...'}
            </h1>

            {/* Content Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Basic Information */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <BookOpen className="w-4 h-4" />
                    Basic Information
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSectionEdit('basic')}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Scholarship Name</div>
                    <div className="text-sm text-gray-900">{(scholarship as any)?.scholarshipName || 'Not specified'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Provider</div>
                    <div className="text-sm text-gray-900">{(scholarship as any)?.providerName || 'Not specified'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Provider Type</div>
                    <div className="text-sm text-gray-900 capitalize">{(scholarship as any)?.providerType || 'Not Specified'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Country</div>
                    <div className="text-sm text-gray-900">{(scholarship as any)?.providerCountry || 'Not specified'}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Funding Information */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <DollarSign className="w-4 h-4" />
                    Funding Information
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSectionEdit('funding')}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Funding Type</div>
                    <div className="text-sm text-gray-900">{(scholarship as any)?.fundingType ? (scholarship as any).fundingType.replace('-', ' ').split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Not Specified'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Amount Range</div>
                    <div className="text-sm text-gray-900">
                      {(scholarship as any)?.fundingAmount && (scholarship as any)?.fundingCurrency ? 
                        `${(scholarship as any).fundingCurrency} ${(scholarship as any).fundingAmount.toLocaleString()}` :
                        'Not specified'
                      }
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Application Deadline</div>
                    <div className="text-sm text-gray-900">
                      {(scholarship as any)?.applicationDeadline ? 
                        new Date((scholarship as any).applicationDeadline).toLocaleDateString() : 
                        'Not specified'
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Study Information */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <GraduationCap className="w-4 h-4" />
                    Study Information
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSectionEdit('study')}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Study Levels</div>
                    <div className="text-sm text-gray-900">{(scholarship as any)?.studyLevel || 'Not specified'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Field Categories</div>
                    <div className="text-sm text-gray-900">{(scholarship as any)?.fieldCategory || 'Not specified'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Host Countries</div>
                    <div className="text-sm text-gray-900">
                      {(scholarship as any)?.targetCountries?.length > 0 ? 
                        (scholarship as any).targetCountries.join(', ') : 
                        'Not specified'
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Requirements & Eligibility */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <Users className="w-4 h-4" />
                    Requirements & Eligibility
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSectionEdit('requirements')}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Degree Required</div>
                    <div className="text-sm text-gray-900">
                      {(scholarship as any)?.eligibilityRequirements?.length > 0 ? 
                        (scholarship as any).eligibilityRequirements.join(', ') : 
                        'Not specified'
                      }
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Difficulty Level</div>
                    <div className="text-sm text-gray-900">{(scholarship as any)?.difficultyLevel ? (scholarship as any).difficultyLevel.charAt(0).toUpperCase() + (scholarship as any).difficultyLevel.slice(1) : 'Not Specified'}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Section Editor Dialog */}
      {editSection && scholarship && (
        <ScholarshipSectionEditor
          isOpen={!!editSection}
          onOpenChange={(open) => setEditSection(open ? editSection : null)}
          section={editSection}
          scholarshipId={id!}
          scholarshipData={scholarship}
        />
      )}
    </AdminLayout>
  );
}