import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, BookOpen, GraduationCap, DollarSign, Users, Settings, Edit, Calendar, Globe, FileText } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ScholarshipSectionEditor } from "@/components/admin/ScholarshipSectionEditor";
import type { Scholarship } from "@shared/scholarshipSchema";

// InfoItem component for displaying scholarship information
interface InfoItemProps {
  label: string;
  value?: string | number | null | unknown;
  isArray?: boolean;
}

function InfoItem({ label, value, isArray = false }: InfoItemProps) {
  let displayValue = "Not specified";
  
  if (value !== null && value !== undefined) {
    if (isArray && Array.isArray(value)) {
      displayValue = value.length > 0 ? value.join(', ') : "Not specified";
    } else if (typeof value === 'boolean') {
      displayValue = value ? 'Yes' : 'No';
    } else if (typeof value === 'object') {
      displayValue = JSON.stringify(value);
    } else {
      displayValue = String(value);
    }
  }

  return (
    <div className="flex flex-col space-y-1">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900 break-words overflow-hidden">
        {displayValue}
      </dd>
    </div>
  );
}

// Edit sections configuration
const editingSections = [
  {
    key: 'basic',
    title: 'Basic Information',
    icon: BookOpen,
    fields: 8
  },
  {
    key: 'study',
    title: 'Study Information',
    icon: GraduationCap,
    fields: 6
  },
  {
    key: 'funding',
    title: 'Funding Information',
    icon: DollarSign,
    fields: 8
  },
  {
    key: 'requirements',
    title: 'Requirements & Eligibility',
    icon: Users,
    fields: 12
  },
  {
    key: 'settings',
    title: 'Additional Details',
    icon: Settings,
    fields: 10
  }
];

export default function ScholarshipDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editSection, setEditSection] = useState<'basic' | 'study' | 'funding' | 'requirements' | 'settings' | null>(null);

  // Fetch scholarship data
  const { data: scholarship, isLoading, error } = useQuery({
    queryKey: ["/api/admin/scholarships", id],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/admin/scholarships/${id}`);
      return response as unknown as Scholarship;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  // Status change mutation
  const statusMutation = useMutation({
    mutationFn: async (status: string) => {
      return apiRequest("PUT", `/api/admin/scholarships/${id}`, {
        ...scholarship,
        status
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Scholarship status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/scholarships", id] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (status: string) => {
    statusMutation.mutate(status);
  };

  const handleSectionEdit = (section: 'basic' | 'study' | 'funding' | 'requirements' | 'settings') => {
    setEditSection(section);
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

  return (
    <AdminLayout>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <Button variant="ghost" size="sm" onClick={() => setLocation('/admin/scholarships')} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Scholarships
            </Button>
            
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {scholarship?.name || 'Loading...'}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Comprehensive scholarship management with complete database field coverage and editing capabilities
            </p>
            
            <div className="flex items-center gap-2">
              <Badge variant={scholarship?.verified ? 'default' : 'destructive'} className="text-xs">
                {scholarship?.verified ? 'Verified' : 'Unverified'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                ID: {scholarship?.scholarshipId}
              </Badge>
            </div>
          </div>

          {/* Status Controls */}
          <div className="p-4 border-b border-gray-200">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Status Management</label>
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
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Edit Sections */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Edit Sections</h3>
              <div className="space-y-3">
                {editingSections.map((section) => {
                  const IconComponent = section.icon;
                  
                  return (
                    <div
                      key={section.key}
                      className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                        editSection === section.key 
                          ? 'bg-blue-50 border-blue-200 shadow-sm' 
                          : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200'
                      }`}
                      onClick={() => handleSectionEdit(section.key as 'basic' | 'study' | 'funding' | 'requirements' | 'settings')}
                    >
                      <div className={`p-3 rounded-lg ${
                        editSection === section.key ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <IconComponent className={`w-5 h-5 ${
                          editSection === section.key ? 'text-blue-600' : 'text-gray-500'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className={`font-semibold text-sm ${
                          editSection === section.key ? 'text-blue-900' : 'text-gray-700'
                        }`}>
                          {section.title}
                        </div>
                        <div className="text-xs text-gray-500">{section.fields} database fields</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 space-y-1">
              <div>Created: {scholarship?.createdDate ? new Date(scholarship.createdDate).toLocaleDateString() : 'Unknown'}</div>
              <div>Updated: {scholarship?.updatedDate ? new Date(scholarship.updatedDate).toLocaleDateString() : 'Never'}</div>
              <div>Data Source: {scholarship?.dataSource || 'Manual Entry'}</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Title */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Scholarship Database Overview
              </h1>
              <p className="text-gray-600">
                Complete database field coverage with {editingSections.reduce((acc, section) => acc + section.fields, 0)} manageable fields across 5 comprehensive sections
              </p>
            </div>

            {/* Content Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Basic Information */}
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg font-bold">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    Basic Information
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSectionEdit('basic')}
                    className="hover:bg-blue-50"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InfoItem label="Scholarship Name" value={scholarship?.name} />
                  <InfoItem label="Short Name" value={scholarship?.shortName} />
                  <InfoItem label="Provider Name" value={scholarship?.providerName} />
                  <InfoItem label="Provider Type" value={scholarship?.providerType} />
                  <InfoItem label="Provider Country" value={scholarship?.providerCountry} />
                  <InfoItem label="Host Countries" value={scholarship?.hostCountries} isArray />
                  <InfoItem label="Eligible Countries" value={scholarship?.eligibleCountries} isArray />
                  <InfoItem label="Description" value={scholarship?.description} />
                </CardContent>
              </Card>

              {/* Study Information */}
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg font-bold">
                    <GraduationCap className="w-5 h-5 text-green-600" />
                    Study Information
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSectionEdit('study')}
                    className="hover:bg-green-50"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InfoItem label="Study Levels" value={scholarship?.studyLevels} isArray />
                  <InfoItem label="Field Categories" value={scholarship?.fieldCategories} isArray />
                  <InfoItem label="Specific Fields" value={scholarship?.specificFields} isArray />
                  <InfoItem label="Application URL" value={scholarship?.applicationUrl} />
                  <InfoItem label="Application Deadline" value={scholarship?.applicationDeadline} />
                  <InfoItem label="Program Start Date" value={scholarship?.programStartDate} />
                </CardContent>
              </Card>

              {/* Funding Information */}
              <Card className="border-l-4 border-l-yellow-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg font-bold">
                    <DollarSign className="w-5 h-5 text-yellow-600" />
                    Funding Information
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSectionEdit('funding')}
                    className="hover:bg-yellow-50"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InfoItem label="Funding Type" value={scholarship?.fundingType} />
                  <InfoItem label="Currency" value={scholarship?.fundingCurrency} />
                  <InfoItem label="Tuition Coverage %" value={scholarship?.tuitionCoveragePercentage} />
                  <InfoItem label="Living Allowance" value={scholarship?.livingAllowanceAmount} />
                  <InfoItem label="Total Value (Min)" value={scholarship?.totalValueMin} />
                  <InfoItem label="Total Value (Max)" value={scholarship?.totalValueMax} />
                  <InfoItem label="Duration" value={`${scholarship?.durationValue || ''} ${scholarship?.durationUnit || ''}`.trim()} />
                  <InfoItem label="Renewable" value={scholarship?.renewable} />
                </CardContent>
              </Card>

              {/* Requirements & Eligibility */}
              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg font-bold">
                    <Users className="w-5 h-5 text-purple-600" />
                    Requirements & Eligibility
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSectionEdit('requirements')}
                    className="hover:bg-purple-50"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InfoItem label="Minimum GPA" value={scholarship?.minGpa} />
                  <InfoItem label="GPA Scale" value={scholarship?.gpaScale} />
                  <InfoItem label="Degree Required" value={scholarship?.degreeRequired} isArray />
                  <InfoItem label="Age Range" value={`${scholarship?.minAge || ''} - ${scholarship?.maxAge || ''}`.replace(' - ', ' to ').trim()} />
                  <InfoItem label="Gender Requirement" value={scholarship?.genderRequirement} />
                  <InfoItem label="Work Experience (Years)" value={scholarship?.minWorkExperience} />
                  <InfoItem label="Leadership Required" value={scholarship?.leadershipRequired} />
                  <InfoItem label="Language Requirements" value={scholarship?.languageRequirements} isArray />
                  <InfoItem label="Documents Required" value={scholarship?.documentsRequired} isArray />
                  <InfoItem label="Interview Required" value={scholarship?.interviewRequired} />
                  <InfoItem label="Essay Required" value={scholarship?.essayRequired} />
                  <InfoItem label="Application Fee" value={`${scholarship?.applicationFeeAmount || '0'} ${scholarship?.applicationFeeCurrency || 'USD'}`} />
                </CardContent>
              </Card>

              {/* Application & Process Information */}
              <Card className="lg:col-span-2 border-l-4 border-l-indigo-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg font-bold">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    Application Timeline & Process
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSectionEdit('settings')}
                    className="hover:bg-indigo-50"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <InfoItem label="Application Open Date" value={scholarship?.applicationOpenDate} />
                    <InfoItem label="Application Deadline" value={scholarship?.applicationDeadline} />
                    <InfoItem label="Notification Date" value={scholarship?.notificationDate} />
                    <InfoItem label="Fee Waiver Available" value={scholarship?.feeWaiverAvailable} />
                    <InfoItem label="Max Renewal Duration" value={scholarship?.maxRenewalDuration} />
                    <InfoItem label="Renewal Criteria" value={scholarship?.renewalCriteria} isArray />
                    <InfoItem label="Work Restrictions" value={scholarship?.workRestrictions} />
                    <InfoItem label="Family Support" value={scholarship?.familySupport} />
                    <InfoItem label="Health Insurance" value={scholarship?.healthInsurance} />
                  </div>
                </CardContent>
              </Card>

              {/* Additional Details */}
              <Card className="lg:col-span-2 border-l-4 border-l-gray-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg font-bold">
                    <FileText className="w-5 h-5 text-gray-600" />
                    Additional Details & Metadata
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSectionEdit('settings')}
                    className="hover:bg-gray-50"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <InfoItem label="Official Website" value={scholarship?.officialWebsite} />
                    <InfoItem label="Contact Email" value={scholarship?.contactEmail} />
                    <InfoItem label="Contact Phone" value={scholarship?.contactPhone} />
                    <InfoItem label="Social Media" value={scholarship?.socialMedia} />
                    <InfoItem label="Data Source" value={scholarship?.dataSource} />
                    <InfoItem label="Source URL" value={scholarship?.sourceUrl} />
                    <InfoItem label="Verified" value={scholarship?.verified} />
                    <InfoItem label="Verification Date" value={scholarship?.verificationDate} />
                    <InfoItem label="Status" value={scholarship?.status} />
                    <InfoItem label="Tags" value={scholarship?.tags} isArray />
                    <InfoItem label="Notes" value={scholarship?.notes} />
                    <InfoItem label="Internal Reference" value={scholarship?.internalReference} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      {editSection && (
        <ScholarshipSectionEditor
          section={editSection}
          isOpen={!!editSection}
          onClose={() => setEditSection(null)}
          onSave={() => {
            setEditSection(null);
            queryClient.invalidateQueries({ queryKey: ["/api/admin/scholarships", id] });
          }}
          scholarshipId={id!}
          scholarshipData={scholarship}
        />
      )}
    </AdminLayout>
  );
}