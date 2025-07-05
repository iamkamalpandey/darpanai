import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calendar, DollarSign, GraduationCap, MapPin, ExternalLink, Clock, Users, FileText, Award, Globe } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';

interface ScholarshipDetailsPageProps {
  params: {
    scholarshipId: string;
  };
}

interface ScholarshipDetail {
  id: number;
  name: string;
  description: string;
  amount_min?: number;
  amount_max?: number;
  amount_display?: string;
  deadline: string;
  application_url?: string;
  level_of_study: string[];
  need_based: boolean;
  merit_based: boolean;
  tags: string[];
  eligibility_summary: string[];
  required_documents: string[];
  target_countries: string[];
  fields_of_study: string[];
  min_gpa?: number;
  language_requirements?: string;
  is_active: boolean;
  provider: {
    id: number;
    name: string;
    website?: string;
    description?: string;
    contact_email?: string;
    country?: string;
    established_year?: number;
    logo_url?: string;
  };
}

export default function ScholarshipDetailsPageFixed({ params }: ScholarshipDetailsPageProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: scholarship, isLoading, error } = useQuery({
    queryKey: ['/api/scholarships', params.scholarshipId],
    queryFn: () => fetch(`/api/scholarships/${params.scholarshipId}`, { credentials: 'include' }).then(res => {
      if (!res.ok) throw new Error('Failed to fetch scholarship');
      return res.json();
    }),
    enabled: !!params.scholarshipId,
  });

  const handleBackClick = () => {
    setLocation('/scholarship-matching');
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return 'N/A';
    return `£${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getDifficultyColor = (tags: string[]) => {
    const hasHighCompetition = tags?.some(tag => tag.toLowerCase().includes('competitive'));
    if (hasHighCompetition) return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getFundingTypeColor = (merit: boolean, need: boolean) => {
    if (merit && need) return 'bg-green-100 text-green-800';
    if (merit) return 'bg-blue-100 text-blue-800';
    if (need) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getFundingTypeLabel = (merit: boolean, need: boolean) => {
    if (merit && need) return 'Merit & Need Based';
    if (merit) return 'Merit Based';
    if (need) return 'Need Based';
    return 'General';
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !scholarship) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <h2 className="text-xl font-semibold mb-2">Scholarship Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The scholarship you're looking for could not be found.
              </p>
              <Button onClick={handleBackClick}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Search
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const scholarshipData = scholarship as ScholarshipDetail;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={handleBackClick}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Button>
        </div>

        {/* Main Title Card */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <CardTitle className="text-2xl">{scholarshipData.name}</CardTitle>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{scholarshipData.provider.name} • {scholarshipData.provider.country}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge className={getFundingTypeColor(scholarshipData.merit_based, scholarshipData.need_based)}>
                  {getFundingTypeLabel(scholarshipData.merit_based, scholarshipData.need_based)}
                </Badge>
                <Badge className={getDifficultyColor(scholarshipData.tags || [])}>
                  {scholarshipData.tags?.some(tag => tag.toLowerCase().includes('competitive')) ? 'High Competition' : 'Moderate Competition'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{scholarshipData.description}</p>
            
            {scholarshipData.application_url && (
              <div className="mt-4">
                <Button asChild>
                  <a href={scholarshipData.application_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Apply Now
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Funding Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Funding Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Funding Type</h4>
                <Badge className={getFundingTypeColor(scholarshipData.merit_based, scholarshipData.need_based)}>
                  {getFundingTypeLabel(scholarshipData.merit_based, scholarshipData.need_based)}
                </Badge>
              </div>
              <div>
                <h4 className="font-medium mb-2">Amount Range</h4>
                <p className="text-lg font-semibold text-green-600">
                  {scholarshipData.amount_display || (
                    scholarshipData.amount_min && scholarshipData.amount_max ? 
                    `${formatCurrency(scholarshipData.amount_min)} - ${formatCurrency(scholarshipData.amount_max)}` :
                    'Amount varies'
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Important Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Application Deadline</h4>
                <p className="text-red-600 font-semibold">{formatDate(scholarshipData.deadline)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Eligibility Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Eligibility Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Study Levels */}
            {scholarshipData.level_of_study && scholarshipData.level_of_study.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Study Levels</h4>
                <div className="flex flex-wrap gap-2">
                  {scholarshipData.level_of_study.map((level: string, index: number) => (
                    <Badge key={index} variant="outline">{level}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Fields of Study */}
            {scholarshipData.fields_of_study && scholarshipData.fields_of_study.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Fields of Study</h4>
                <div className="flex flex-wrap gap-2">
                  {scholarshipData.fields_of_study.map((field: string, index: number) => (
                    <Badge key={index} variant="outline">{field}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* GPA Requirements */}
            {scholarshipData.min_gpa && (
              <div>
                <h4 className="font-medium mb-2">Minimum GPA</h4>
                <p className="text-muted-foreground">
                  {scholarshipData.min_gpa}/4.0
                </p>
              </div>
            )}

            {/* Language Requirements */}
            {scholarshipData.language_requirements && (
              <div>
                <h4 className="font-medium mb-2">Language Requirements</h4>
                <p className="text-muted-foreground">{scholarshipData.language_requirements}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Target Countries */}
        {scholarshipData.target_countries && scholarshipData.target_countries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Target Countries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {scholarshipData.target_countries.map((country: string, index: number) => (
                  <Badge key={index} variant="outline" className="bg-blue-50">
                    {country}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Required Documents */}
        {scholarshipData.required_documents && scholarshipData.required_documents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Required Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {scholarshipData.required_documents.map((doc: string, index: number) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Tags */}
        {scholarshipData.tags && scholarshipData.tags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {scholarshipData.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Provider Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Provider Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Organization</h4>
                <p className="text-muted-foreground">{scholarshipData.provider.name}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Country</h4>
                <p className="text-muted-foreground">{scholarshipData.provider.country}</p>
              </div>
            </div>
            
            {scholarshipData.provider.website && (
              <div>
                <h4 className="font-medium mb-2">Website</h4>
                <a 
                  href={scholarshipData.provider.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {scholarshipData.provider.website}
                </a>
              </div>
            )}

            {scholarshipData.provider.contact_email && (
              <div>
                <h4 className="font-medium mb-2">Contact Email</h4>
                <a 
                  href={`mailto:${scholarshipData.provider.contact_email}`}
                  className="text-blue-600 hover:underline"
                >
                  {scholarshipData.provider.contact_email}
                </a>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}