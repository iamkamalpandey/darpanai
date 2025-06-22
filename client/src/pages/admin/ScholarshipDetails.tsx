import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, BookOpen, GraduationCap, DollarSign, Users, Settings, Edit, Calendar, Globe, FileText, Database, Award, MapPin } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
      try {
        displayValue = Array.isArray(value) ? value.join(', ') : JSON.stringify(value);
      } catch {
        displayValue = String(value);
      }
    } else {
      displayValue = String(value);
    }
  }

  return (
    <div className="flex flex-col space-y-1">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900 break-words overflow-hidden text-wrap">
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
    fields: ['name', 'shortName', 'description', 'providerName', 'providerType', 'providerCountry', 'applicationUrl', 'dataSource']
  },
  {
    key: 'study',
    title: 'Study Information', 
    icon: GraduationCap,
    fields: ['studyLevels', 'fieldCategories', 'hostCountries', 'targetCountries', 'programDuration', 'startDate']
  },
  {
    key: 'funding',
    title: 'Funding Information',
    icon: DollarSign,
    fields: ['fundingType', 'fundingAmount', 'fundingCurrency', 'fundingDuration', 'renewable', 'renewalCriteria', 'additionalBenefits', 'livingAllowance']
  },
  {
    key: 'requirements',
    title: 'Requirements & Eligibility',
    icon: Users,
    fields: ['eligibleCountries', 'eligibilityRequirements', 'academicRequirements', 'languageRequirements', 'ageLimit', 'gpaRequirement', 'workExperienceRequired', 'leadershipRequired']
  },
  {
    key: 'settings',
    title: 'Management & Settings',
    icon: Settings,
    fields: ['status', 'applicationDeadline', 'notificationDate', 'difficultyLevel', 'verified', 'tags', 'remarks']
  }
];

export default function ScholarshipDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editSection, setEditSection] = useState<string | null>(null);

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
    mutationFn: async (newStatus: string) => {
      return apiRequest("PUT", `/api/admin/scholarships/${id}`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/scholarships", id] });
      toast({
        title: "Success",
        description: "Scholarship status updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to update status",
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading scholarship details...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !scholarship) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load scholarship details</p>
            <Button onClick={() => setLocation('/admin/scholarships')}>
              Back to Scholarships
            </Button>
          </div>
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
            
            <h2 className="text-xl font-bold text-gray-900 mb-2 break-words overflow-hidden text-wrap">
              {scholarship?.name || 'Loading...'}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Comprehensive scholarship details with complete database field coverage and editing capabilities
            </p>
            
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Badge variant={scholarship?.verified ? 'default' : 'destructive'} className="text-xs">
                {scholarship?.verified ? 'Verified' : 'Unverified'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                ID: {scholarship?.scholarshipId}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {scholarship?.providerType}
              </Badge>
            </div>

            {/* Status Management */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Status Management</label>
                <Select 
                  value={scholarship?.status || 'active'} 
                  onValueChange={(value) => statusMutation.mutate(value)}
                  disabled={statusMutation.isPending}
                >
                  <SelectTrigger className="h-8">
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

              <Button 
                onClick={() => setLocation(`/admin/scholarship/edit/${scholarship.id}`)}
                className="w-full"
                size="sm"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Scholarship
              </Button>
            </div>
          </div>

          {/* Metadata */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Scholarship Metadata</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="text-xs text-gray-600">Database ID</span>
                </div>
                <span className="text-sm font-semibold">{scholarship.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-xs text-gray-600">Funding Type</span>
                </div>
                <span className="text-sm font-semibold capitalize">{scholarship.fundingType}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  <span className="text-xs text-gray-600">Provider Country</span>
                </div>
                <span className="text-sm font-semibold">{scholarship.providerCountry}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span className="text-xs text-gray-600">Application Deadline</span>
                </div>
                <span className="text-sm font-semibold">
                  {scholarship.applicationDeadline ? 
                    new Date(scholarship.applicationDeadline).toLocaleDateString() : 
                    'Not specified'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Edit Sections */}
          <div className="p-6 flex-1 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Edit Sections</h3>
            <div className="space-y-2">
              {editingSections.map((section) => (
                <Button
                  key={section.key}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setEditSection(section.key)}
                >
                  <section.icon className="w-4 h-4 mr-2 flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{section.title}</div>
                    <div className="text-xs text-gray-500">{section.fields.length} fields</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Content Header */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 break-words overflow-hidden text-wrap">
                  {scholarship.name}
                </h1>
                <p className="text-gray-600">{scholarship.providerName} • {scholarship.providerCountry}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={scholarship.status === 'active' ? 'default' : 'secondary'}>
                  {scholarship.status}
                </Badge>
                <Badge variant={scholarship.fundingType === 'full' ? 'default' : 'outline'}>
                  {scholarship.fundingType} funding
                </Badge>
              </div>
            </div>
          </div>

          {/* Scholarship Information */}
          <div className="flex-1 overflow-auto p-6">
            <div className="grid gap-6">
              {/* Basic Information */}
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem label="Scholarship Name" value={scholarship.name} />
                    <InfoItem label="Short Name" value={scholarship.shortName} />
                    <InfoItem label="Scholarship ID" value={scholarship.scholarshipId} />
                    <InfoItem label="Provider Name" value={scholarship.providerName} />
                    <InfoItem label="Provider Type" value={scholarship.providerType} />
                    <InfoItem label="Provider Country" value={scholarship.providerCountry} />
                    <InfoItem label="Application URL" value={scholarship.applicationUrl} />
                    <InfoItem label="Data Source" value={scholarship.dataSource} />
                    <div className="md:col-span-2">
                      <InfoItem label="Description" value={scholarship.description} />
                    </div>
                  </dl>
                </CardContent>
              </Card>

              {/* Study Information */}
              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-green-500 flex-shrink-0" />
                    Study Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem label="Study Levels" value={scholarship.studyLevels} isArray />
                    <InfoItem label="Field Categories" value={scholarship.fieldCategories} isArray />
                    <InfoItem label="Host Countries" value={scholarship.hostCountries} isArray />
                    <InfoItem label="Eligible Countries" value={scholarship.eligibleCountries} isArray />
                    <InfoItem label="Program Duration" value={
                      scholarship.durationValue && scholarship.durationUnit 
                        ? `${scholarship.durationValue} ${scholarship.durationUnit}`
                        : null
                    } />
                    <InfoItem label="Program Start Date" value={
                      scholarship.programStartDate ? 
                        new Date(scholarship.programStartDate).toLocaleDateString() : 
                        null
                    } />
                  </dl>
                </CardContent>
              </Card>

              {/* Funding Information */}
              <Card className="border-l-4 border-l-orange-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    Funding Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem label="Funding Type" value={scholarship.fundingType} />
                    <InfoItem label="Total Value (Min)" value={scholarship.totalValueMin ? `${scholarship.fundingCurrency} ${scholarship.totalValueMin}` : null} />
                    <InfoItem label="Total Value (Max)" value={scholarship.totalValueMax ? `${scholarship.fundingCurrency} ${scholarship.totalValueMax}` : null} />
                    <InfoItem label="Currency" value={scholarship.fundingCurrency} />
                    <InfoItem label="Tuition Coverage %" value={scholarship.tuitionCoveragePercentage} />
                    <InfoItem label="Living Allowance" value={
                      scholarship.livingAllowanceAmount 
                        ? `${scholarship.fundingCurrency} ${scholarship.livingAllowanceAmount} ${scholarship.livingAllowanceFrequency || ''}`
                        : null
                    } />
                    <InfoItem label="Renewable" value={scholarship.renewable} />
                    <InfoItem label="Max Renewal Duration" value={scholarship.maxRenewalDuration} />
                    <InfoItem label="Renewal Criteria" value={scholarship.renewalCriteria} isArray />
                  </dl>
                </CardContent>
              </Card>

              {/* Requirements & Eligibility */}
              <Card className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-500 flex-shrink-0" />
                    Requirements & Eligibility
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem label="Eligible Countries" value={scholarship.eligibleCountries} isArray />
                    <InfoItem label="Age Range" value={
                      scholarship.minAge || scholarship.maxAge 
                        ? `${scholarship.minAge || 'N/A'} - ${scholarship.maxAge || 'N/A'} years`
                        : null
                    } />
                    <InfoItem label="Minimum GPA" value={
                      scholarship.minGpa && scholarship.gpaScale 
                        ? `${scholarship.minGpa}/${scholarship.gpaScale}`
                        : scholarship.minGpa
                    } />
                    <InfoItem label="Min Work Experience" value={
                      scholarship.minWorkExperience ? `${scholarship.minWorkExperience} years` : null
                    } />
                    <InfoItem label="Leadership Required" value={scholarship.leadershipRequired} />
                    <InfoItem label="Gender Requirement" value={scholarship.genderRequirement} />
                    <InfoItem label="Degree Required" value={scholarship.degreeRequired} isArray />
                    <InfoItem label="Interview Required" value={scholarship.interviewRequired} />
                    <InfoItem label="Essay Required" value={scholarship.essayRequired} />
                    <div className="md:col-span-2">
                      <InfoItem label="Language Requirements" value={scholarship.languageRequirements} isArray />
                    </div>
                    <div className="md:col-span-2">
                      <InfoItem label="Documents Required" value={scholarship.documentsRequired} isArray />
                    </div>
                  </dl>
                </CardContent>
              </Card>

              {/* Additional Details */}
              <Card className="border-l-4 border-l-gray-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    Additional Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem label="Status" value={scholarship.status} />
                    <InfoItem label="Difficulty Level" value={scholarship.difficultyLevel} />
                    <InfoItem label="Verified" value={scholarship.verified} />
                    <InfoItem label="Data Source" value={scholarship.dataSource} />
                    <InfoItem label="Application Open Date" value={
                      scholarship.applicationOpenDate ? 
                        new Date(scholarship.applicationOpenDate).toLocaleDateString() : 
                        null
                    } />
                    <InfoItem label="Application Deadline" value={
                      scholarship.applicationDeadline ? 
                        new Date(scholarship.applicationDeadline).toLocaleDateString() : 
                        null
                    } />
                    <InfoItem label="Notification Date" value={
                      scholarship.notificationDate ? 
                        new Date(scholarship.notificationDate).toLocaleDateString() : 
                        null
                    } />
                    <InfoItem label="Application Fee" value={
                      scholarship.applicationFeeAmount && parseFloat(scholarship.applicationFeeAmount) > 0
                        ? `${scholarship.applicationFeeCurrency} ${scholarship.applicationFeeAmount}`
                        : "No fee"
                    } />
                    <InfoItem label="Fee Waiver Available" value={scholarship.feeWaiverAvailable} />
                    <InfoItem label="Total Applicants/Year" value={scholarship.totalApplicantsPerYear} />
                    <InfoItem label="Acceptance Rate" value={
                      scholarship.acceptanceRate ? `${scholarship.acceptanceRate}%` : null
                    } />
                    <InfoItem label="Tags" value={scholarship.tags} isArray />
                    <InfoItem label="Work Restrictions" value={scholarship.workRestrictions} />
                    <InfoItem label="Travel Restrictions" value={scholarship.travelRestrictions} />
                    <InfoItem label="Other Scholarships Allowed" value={scholarship.otherScholarshipsAllowed} />
                    <InfoItem label="Mentorship Available" value={scholarship.mentorshipAvailable} />
                    <InfoItem label="Networking Opportunities" value={scholarship.networkingOpportunities} />
                    <InfoItem label="Internship Opportunities" value={scholarship.internshipOpportunities} />
                    <InfoItem label="Research Opportunities" value={scholarship.researchOpportunities} />
                    <InfoItem label="Created Date" value={
                      scholarship.createdDate ? 
                        new Date(scholarship.createdDate).toLocaleDateString() : 
                        null
                    } />
                    <InfoItem label="Updated Date" value={
                      scholarship.updatedDate ? 
                        new Date(scholarship.updatedDate).toLocaleDateString() : 
                        null
                    } />
                  </dl>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}