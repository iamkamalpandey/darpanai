import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Edit, DollarSign, Globe, Calendar, Users, BookOpen, GraduationCap, Settings, CheckCircle, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ScholarshipSectionEditor from "../../components/admin/ScholarshipSectionEditor";
import { Label } from "@/components/ui/label";
import { AdminLayout } from "@/components/AdminLayout";

interface Scholarship {
  id: number;
  scholarshipId: string;
  name: string;
  shortName: string;
  providerName: string;
  providerType: string;
  providerCountry: string;
  hostCountries: string[];
  eligibleCountries: string[];
  studyLevels: string[];
  fieldCategories: string[];
  specificFields: string[];
  description: string;
  applicationUrl: string;
  fundingType: string;
  fundingCurrency: string;
  tuitionCoveragePercentage: number;
  livingAllowanceAmount: number;
  livingAllowanceFrequency: string;
  totalValueMin: number;
  totalValueMax: number;
  applicationOpenDate: string;
  applicationDeadline: string;
  notificationDate: string;
  programStartDate: string;
  durationValue: number;
  durationUnit: string;
  minGpa: number;
  gpaScale: number;
  degreeRequired: string[];
  minAge: number;
  maxAge: number;
  genderRequirement: string;
  minWorkExperience: number;
  leadershipRequired: boolean;
  languageRequirements: string[];
  applicationFeeAmount: number;
  applicationFeeCurrency: string;
  feeWaiverAvailable: boolean;
  documentsRequired: string[];
  interviewRequired: boolean;
  essayRequired: boolean;
  renewable: boolean;
  maxRenewalDuration: string;
  renewalCriteria: string[];
  workRestrictions: string;
  travelRestrictions: string;
  otherScholarshipsAllowed: boolean;
  mentorshipAvailable: boolean;
  networkingOpportunities: boolean;
  internshipOpportunities: boolean;
  researchOpportunities: boolean;
  tags: string[];
  difficultyLevel: string;
  totalApplicantsPerYear: number;
  acceptanceRate: number;
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
    fields: ['name', 'shortName', 'providerName', 'providerType', 'providerCountry', 'description', 'applicationUrl']
  },
  {
    key: 'study',
    title: 'Study Information',
    icon: GraduationCap,
    fields: ['studyLevels', 'fieldCategories', 'hostCountries', 'eligibleCountries']
  },
  {
    key: 'funding',
    title: 'Funding Information',
    icon: DollarSign,
    fields: ['fundingType', 'fundingCurrency', 'totalValueMin', 'totalValueMax', 'applicationDeadline']
  },
  {
    key: 'requirements',
    title: 'Requirements & Eligibility',
    icon: Users,
    fields: ['degreeRequired', 'languageRequirements', 'minGpa', 'difficultyLevel']
  },
  {
    key: 'settings',
    title: 'Settings & Metadata',
    icon: Settings,
    fields: ['dataSource', 'verified', 'status']
  }
];

export default function ScholarshipDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Fetch scholarship data with proper preloading
  const { data: scholarshipResponse, isLoading, error } = useQuery({
    queryKey: ["/api/admin/scholarships", id],
    queryFn: () => apiRequest("GET", `/api/admin/scholarships/${id}`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });

  const scholarship = (scholarshipResponse as any)?.data || scholarshipResponse;

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
      setEditingSection(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update scholarship",
        variant: "destructive",
      });
    },
  });

  const handleSectionEdit = (section: string) => {
    setEditingSection(section);
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

  const currentSection = editingSections.find(s => s.key === editingSection);

  return (
    <AdminLayout>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Button variant="ghost" size="sm" onClick={() => setLocation('/admin/scholarships')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Scholarships
              </Button>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              {scholarship.name || scholarship.scholarshipId}
            </h1>
            <div className="flex items-center gap-2">
              <Badge variant={scholarship.status === 'active' ? 'default' : 'secondary'}>
                {scholarship.status}
              </Badge>
              <Badge variant={scholarship.verified ? 'default' : 'destructive'}>
                {scholarship.verified ? 'Verified' : 'Unverified'}
              </Badge>
            </div>
          </div>

          {/* Quick Status Change */}
          <div className="p-4 border-b border-gray-200">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Quick Status Change
            </Label>
            <Select 
              value={scholarship?.status || 'active'} 
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
              <div className="space-y-2">
                {editingSections.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <Button
                      key={section.key}
                      variant="ghost"
                      className="w-full justify-start h-auto p-3 text-left"
                      onClick={() => handleSectionEdit(section.key)}
                    >
                      <IconComponent className="w-4 h-4 mr-3 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-sm">{section.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {section.fields.length} fields
                        </div>
                      </div>
                      <Edit className="w-3 h-3 ml-auto flex-shrink-0" />
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 space-y-1">
              <div>ID: {scholarship.scholarshipId}</div>
              <div>Created: {new Date(scholarship.createdDate).toLocaleDateString()}</div>
              <div>Updated: {new Date(scholarship.updatedDate).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {scholarship.name}
              </h1>
              <p className="text-gray-600 mb-4">
                {scholarship.description}
              </p>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="px-3 py-1">
                  {scholarship.providerType}
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  {scholarship.providerCountry}
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  {scholarship.fundingType}
                </Badge>
                {scholarship.applicationUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={scholarship.applicationUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Apply
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Basic Information */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSectionEdit('basic')}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Scholarship Name</Label>
                    <div className="text-sm mt-1">{scholarship.name || 'Not specified'}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Provider</Label>
                    <div className="text-sm mt-1">{scholarship.providerName || 'Not specified'}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Provider Type</Label>
                    <div className="text-sm mt-1 capitalize">{scholarship.providerType?.replace('-', ' ') || 'Not specified'}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Country</Label>
                    <div className="text-sm mt-1">{scholarship.providerCountry || 'Not specified'}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Funding Information */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Funding Information
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSectionEdit('funding')}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Funding Type</Label>
                    <Badge variant="outline" className="mt-1 capitalize">
                      {scholarship.fundingType?.replace('-', ' ') || 'Not specified'}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Amount Range</Label>
                    <div className="text-sm mt-1">
                      {scholarship.totalValueMin && scholarship.totalValueMax ? 
                        `${scholarship.fundingCurrency} ${scholarship.totalValueMin.toLocaleString()} - ${scholarship.totalValueMax.toLocaleString()}` :
                        'Not specified'
                      }
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Application Deadline</Label>
                    <div className="text-sm mt-1">
                      {scholarship.applicationDeadline ? 
                        new Date(scholarship.applicationDeadline).toLocaleDateString() : 
                        'Not specified'
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Study Information */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Study Information
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSectionEdit('study')}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Study Levels</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {scholarship.studyLevels?.length > 0 ? 
                        scholarship.studyLevels.map((level: string, index: number) => (
                          <Badge key={index} variant="secondary">{level}</Badge>
                        )) : 
                        <span className="text-sm text-gray-500">Not specified</span>
                      }
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Field Categories</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {scholarship.fieldCategories?.length > 0 ? 
                        scholarship.fieldCategories.map((field: string, index: number) => (
                          <Badge key={index} variant="secondary">{field}</Badge>
                        )) : 
                        <span className="text-sm text-gray-500">Not specified</span>
                      }
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Host Countries</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {scholarship.hostCountries?.length > 0 ? 
                        scholarship.hostCountries.map((country: string, index: number) => (
                          <Badge key={index} variant="secondary">{country}</Badge>
                        )) : 
                        <span className="text-sm text-gray-500">Not specified</span>
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Requirements */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Requirements & Eligibility
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSectionEdit('requirements')}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Degree Required</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {scholarship.degreeRequired?.length > 0 ? 
                        scholarship.degreeRequired.map((degree: string, index: number) => (
                          <Badge key={index} variant="secondary">{degree}</Badge>
                        )) : 
                        <span className="text-sm text-gray-500">Not specified</span>
                      }
                    </div>
                  </div>
                  
                  {scholarship.languageRequirements?.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Language Requirements</Label>
                      <ul className="mt-2 space-y-2">
                        {scholarship.languageRequirements.map((req: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                            <span className="text-sm">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm font-medium text-gray-600">Difficulty Level</Label>
                    <Badge variant="outline" className="mt-1 capitalize">
                      {scholarship.difficultyLevel || 'Not specified'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Section Editor Dialog */}
      {editingSection && currentSection && (
        <ScholarshipSectionEditor
          isOpen={!!editingSection}
          onClose={() => setEditingSection(null)}
          onSave={handleSectionSave}
          section={editingSection}
          title={currentSection.title}
          initialData={scholarship}
          isLoading={updateMutation.isPending}
        />
      )}
    </AdminLayout>
  );
}