import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Edit, ArrowLeft, Calendar, Globe, DollarSign, BookOpen, Users, Award, 
  Clock, CheckCircle, AlertCircle, Info, ExternalLink, Mail, Phone, 
  Building, GraduationCap, FileText, Star, Target, Languages, 
  CreditCard, MapPin, Link as LinkIcon
} from "lucide-react";
import { useLocation } from "wouter";
import type { Scholarship } from "@shared/scholarshipSchema";

interface InfoItemProps {
  label: string;
  value: string | number | null | undefined;
  icon?: React.ReactNode;
  isArray?: boolean;
  isCurrency?: boolean;
  isDate?: boolean;
  isLink?: boolean;
}

const InfoItem = ({ label, value, icon, isArray, isCurrency, isDate, isLink }: InfoItemProps) => {
  if (!value && value !== 0) return null;

  const formatValue = () => {
    if (isArray && Array.isArray(value)) {
      return value.join(", ");
    }
    if (isCurrency && typeof value === 'string') {
      return `$${value}`;
    }
    if (isDate && typeof value === 'string') {
      return new Date(value).toLocaleDateString();
    }
    return value?.toString() || 'Not specified';
  };

  const displayValue = formatValue();

  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      {icon && (
        <div className="flex-shrink-0 w-5 h-5 text-gray-500 mt-0.5">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
        {isLink ? (
          <a 
            href={displayValue.startsWith('http') ? displayValue : `https://${displayValue}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline break-words"
          >
            {displayValue}
          </a>
        ) : (
          <p className="text-gray-900 break-words">{displayValue}</p>
        )}
      </div>
    </div>
  );
};

export default function ScholarshipDetailsRedesign() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Extract scholarship ID from URL
  const scholarshipId = location.split('/').pop();

  // Fetch scholarship details
  const { data: scholarshipData, isLoading, error } = useQuery({
    queryKey: ['scholarship-details', scholarshipId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/scholarships/${scholarshipId}`);
      if (!response.ok) throw new Error('Failed to fetch scholarship details');
      return response.json();
    },
    enabled: !!scholarshipId
  });

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      return apiRequest('PUT', `/api/admin/scholarships/${scholarshipId}`, {
        ...scholarshipData?.data,
        status: newStatus
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scholarship-details', scholarshipId] });
      queryClient.invalidateQueries({ queryKey: ['admin-scholarships'] });
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
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading scholarship details...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !scholarshipData?.data) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">Failed to load scholarship details</p>
            <Button onClick={() => setLocation('/admin/scholarships')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Scholarships
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const scholarship = scholarshipData.data;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => setLocation('/admin/scholarships')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Scholarships
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 break-words">{scholarship.name}</h1>
              <p className="text-gray-600 mt-1">Scholarship ID: {scholarship.scholarshipId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge 
              variant={scholarship.status === 'active' ? 'default' : 'secondary'}
              className="px-3 py-1"
            >
              {scholarship.status?.charAt(0).toUpperCase() + scholarship.status?.slice(1)}
            </Badge>
            <Button 
              onClick={() => setLocation(`/admin/scholarship/edit/${scholarship.id}`)}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Scholarship
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Update Status</label>
                <Select 
                  value={scholarship.status || 'active'} 
                  onValueChange={(value) => statusMutation.mutate(value)}
                  disabled={statusMutation.isPending}
                >
                  <SelectTrigger className="w-48">
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
              {scholarship.officialWebsite && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Official Website</label>
                  <Button variant="outline" asChild>
                    <a 
                      href={scholarship.officialWebsite.startsWith('http') ? scholarship.officialWebsite : `https://${scholarship.officialWebsite}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Visit Website
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Basic Information */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Basic Information */}
            <Card>
              <CardHeader className="border-l-4 border-blue-500">
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem label="Scholarship Name" value={scholarship.name} icon={<Award />} />
                  <InfoItem label="Provider" value={scholarship.providerName} icon={<Building />} />
                  <InfoItem label="Provider Type" value={scholarship.providerType} icon={<Users />} />
                  <InfoItem label="Provider Country" value={scholarship.providerCountry} icon={<Globe />} />
                  <InfoItem label="Description" value={scholarship.description} icon={<FileText />} />
                  <InfoItem label="Brief Description" value={scholarship.briefDescription} icon={<FileText />} />
                </div>
              </CardContent>
            </Card>

            {/* Study Information */}
            <Card>
              <CardHeader className="border-l-4 border-green-500">
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Study Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem label="Study Levels" value={scholarship.studyLevels} icon={<BookOpen />} isArray />
                  <InfoItem label="Field Categories" value={scholarship.fieldCategories} icon={<Target />} isArray />
                  <InfoItem label="Target Countries" value={scholarship.targetCountries} icon={<Globe />} isArray />
                  <InfoItem label="Specific Universities" value={scholarship.specificUniversities} icon={<Building />} isArray />
                  <InfoItem label="Duration (Years)" value={scholarship.durationYears} icon={<Clock />} />
                  <InfoItem label="Duration Description" value={scholarship.durationDescription} icon={<Clock />} />
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card>
              <CardHeader className="border-l-4 border-orange-500">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Financial Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem label="Funding Type" value={scholarship.fundingType} icon={<CreditCard />} />
                  <InfoItem label="Total Value (Min)" value={scholarship.totalValueMin} icon={<DollarSign />} isCurrency />
                  <InfoItem label="Total Value (Max)" value={scholarship.totalValueMax} icon={<DollarSign />} isCurrency />
                  <InfoItem label="Currency" value={scholarship.currency} icon={<DollarSign />} />
                  <InfoItem label="Coverage Details" value={scholarship.coverageDetails} icon={<Info />} />
                  <InfoItem label="Additional Benefits" value={scholarship.additionalBenefits} icon={<Award />} />
                  <InfoItem label="Application Fee Amount" value={scholarship.applicationFeeAmount} icon={<CreditCard />} isCurrency />
                  <InfoItem label="Application Fee Currency" value={scholarship.applicationFeeCurrency} icon={<CreditCard />} />
                  <InfoItem label="Fee Waiver Available" value={scholarship.feeWaiverAvailable} icon={<CheckCircle />} />
                  <InfoItem label="Renewable" value={scholarship.renewable} icon={<Info />} />
                  <InfoItem label="Renewal Criteria" value={scholarship.renewalCriteria} icon={<Info />} />
                </div>
              </CardContent>
            </Card>

            {/* Requirements & Eligibility */}
            <Card>
              <CardHeader className="border-l-4 border-purple-500">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Requirements & Eligibility
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem label="Eligibility Requirements" value={scholarship.eligibilityRequirements} icon={<Users />} isArray />
                  <InfoItem label="Academic Requirements" value={scholarship.academicRequirements} icon={<BookOpen />} />
                  <InfoItem label="Minimum GPA" value={scholarship.minimumGpa} icon={<Star />} />
                  <InfoItem label="Language Requirements" value={scholarship.languageRequirements} icon={<Languages />} isArray />
                  <InfoItem label="Age Restrictions" value={scholarship.ageRestrictions} icon={<Users />} />
                  <InfoItem label="Nationality Requirements" value={scholarship.nationalityRequirements} icon={<Globe />} isArray />
                  <InfoItem label="Gender Requirements" value={scholarship.genderRequirements} icon={<Users />} />
                  <InfoItem label="Leadership Required" value={scholarship.leadershipRequired} icon={<Star />} />
                  <InfoItem label="Work Experience Required" value={scholarship.workExperienceRequired} icon={<Building />} />
                  <InfoItem label="Community Service Required" value={scholarship.communityServiceRequired} icon={<Users />} />
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column - Sidebar Information */}
          <div className="space-y-6">

            {/* Application Information */}
            <Card>
              <CardHeader className="border-l-4 border-red-500">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Application Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoItem label="Application Deadline" value={scholarship.applicationDeadline} icon={<Calendar />} isDate />
                <InfoItem label="Notification Date" value={scholarship.notificationDate} icon={<Calendar />} isDate />
                <InfoItem label="Application Process" value={scholarship.applicationProcess} icon={<FileText />} />
                <InfoItem label="Required Documents" value={scholarship.requiredDocuments} icon={<FileText />} isArray />
                <InfoItem label="Selection Criteria" value={scholarship.selectionCriteria} icon={<Target />} />
                <InfoItem label="Difficulty Level" value={scholarship.difficultyLevel} icon={<Star />} />
                <InfoItem label="Total Applicants/Year" value={scholarship.totalApplicantsPerYear} icon={<Users />} />
                <InfoItem label="Acceptance Rate" value={scholarship.acceptanceRate ? `${scholarship.acceptanceRate}%` : null} icon={<Star />} />
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader className="border-l-4 border-indigo-500">
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoItem label="Contact Email" value={scholarship.contactEmail} icon={<Mail />} />
                <InfoItem label="Contact Phone" value={scholarship.contactPhone} icon={<Phone />} />
                <InfoItem label="Official Website" value={scholarship.officialWebsite} icon={<LinkIcon />} isLink />
                <InfoItem label="Application Portal" value={scholarship.applicationPortal} icon={<ExternalLink />} isLink />
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card>
              <CardHeader className="border-l-4 border-gray-500">
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Additional Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoItem label="Tags" value={scholarship.tags} icon={<Star />} isArray />
                <InfoItem label="Work Restrictions" value={scholarship.workRestrictions} icon={<Building />} />
                <InfoItem label="Travel Restrictions" value={scholarship.travelRestrictions} icon={<Globe />} />
                <InfoItem label="Other Scholarships Allowed" value={scholarship.otherScholarshipsAllowed} icon={<Award />} />
                <InfoItem label="Mentorship Available" value={scholarship.mentorshipAvailable} icon={<Users />} />
                <InfoItem label="Networking Opportunities" value={scholarship.networkingOpportunities} icon={<Users />} />
                <InfoItem label="Alumni Support" value={scholarship.alumniSupport} icon={<Users />} />
                <InfoItem label="Created Date" value={scholarship.createdDate} icon={<Calendar />} isDate />
                <InfoItem label="Last Updated" value={scholarship.lastUpdated} icon={<Calendar />} isDate />
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </AdminLayout>
  );
}