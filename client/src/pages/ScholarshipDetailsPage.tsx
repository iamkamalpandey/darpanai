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
  scholarshipId: string;
  name: string;
  shortName?: string;
  providerName: string;
  providerType: string;
  providerCountry: string;
  providerWebsite?: string;
  hostCountries: string[];
  eligibleCountries: string[];
  studyLevels: string[];
  fieldCategories: string[];
  specificFields?: string[];
  fundingType: string;
  fundingCurrency: string;
  tuitionCoveragePercentage?: string;
  livingAllowanceAmount?: string;
  livingAllowanceFrequency?: string;
  totalValueMin?: string;
  totalValueMax?: string;
  applicationOpenDate?: string;
  applicationDeadline: string;
  notificationDate?: string;
  programStartDate?: string;
  durationValue?: number;
  durationUnit?: string;
  minGpa?: string;
  gpaScale?: string;
  degreeRequired: string[];
  minAge?: number;
  maxAge?: number;
  genderRequirement: string;
  minWorkExperience?: number;
  leadershipRequired: boolean;
  languageRequirements: Array<{
    level: string;
    testType?: string;
    validityYears?: number;
  }>;
  applicationUrl?: string;
  applicationFeeAmount?: string;
  applicationFeeCurrency?: string;
  feeWaiverAvailable: boolean;
  documentsRequired: string[];
  interviewRequired: boolean;
  essayRequired: boolean;
  renewable: boolean;
  maxRenewalDuration?: string;
  renewalCriteria?: string;
  workRestrictions?: string;
  travelRestrictions?: string;
  otherScholarshipsAllowed?: string;
  mentorshipAvailable: boolean;
  networkingOpportunities: boolean;
  internshipOpportunities: boolean;
  researchOpportunities: boolean;
  description: string;
  tags: string[];
  difficultyLevel: string;
  totalApplicantsPerYear?: number;
  acceptanceRate?: string;
  status: string;
}

export default function ScholarshipDetailsPage({ params }: ScholarshipDetailsPageProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: scholarship, isLoading, error } = useQuery({
    queryKey: ['/api/scholarships', params.scholarshipId],
    enabled: !!params.scholarshipId,
  });

  const handleBackClick = () => {
    setLocation('/scholarship-matching');
  };

  const formatCurrency = (amount: string | undefined, currency: string) => {
    if (!amount) return 'N/A';
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return amount;
    
    const currencySymbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'AUD': 'A$',
      'CAD': 'C$',
      'JPY': '¥',
      'INR': '₹'
    };
    
    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${numAmount.toLocaleString()}`;
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

  const getDifficultyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFundingTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'full': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      case 'tuition-only': return 'bg-purple-100 text-purple-800';
      case 'stipend-only': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
                  <span>{scholarshipData.providerName} • {scholarshipData.providerCountry}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge className={getFundingTypeColor(scholarshipData.fundingType)}>
                  {scholarshipData.fundingType} Funding
                </Badge>
                <Badge className={getDifficultyColor(scholarshipData.difficultyLevel)}>
                  {scholarshipData.difficultyLevel} Difficulty
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{scholarshipData.description}</p>
            
            {scholarshipData.applicationUrl && (
              <div className="mt-4">
                <Button asChild>
                  <a href={scholarshipData.applicationUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Apply Now
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Funding Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Funding Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Funding Type</span>
                  <p className="font-medium">{scholarshipData.fundingType}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Currency</span>
                  <p className="font-medium">{scholarshipData.fundingCurrency}</p>
                </div>
              </div>
              
              {scholarshipData.totalValueMin && scholarshipData.totalValueMax && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Total Value Range</span>
                  <p className="font-semibold text-lg text-green-600">
                    {formatCurrency(scholarshipData.totalValueMin, scholarshipData.fundingCurrency)} - {formatCurrency(scholarshipData.totalValueMax, scholarshipData.fundingCurrency)}
                  </p>
                </div>
              )}
              
              {scholarshipData.tuitionCoveragePercentage && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Tuition Coverage</span>
                  <p className="font-medium">{scholarshipData.tuitionCoveragePercentage}%</p>
                </div>
              )}
              
              {scholarshipData.livingAllowanceAmount && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Living Allowance</span>
                  <p className="font-medium">
                    {formatCurrency(scholarshipData.livingAllowanceAmount, scholarshipData.fundingCurrency)} 
                    {scholarshipData.livingAllowanceFrequency && ` ${scholarshipData.livingAllowanceFrequency}`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Application Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Application Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Application Deadline</span>
                <p className="font-medium text-red-600">{formatDate(scholarshipData.applicationDeadline)}</p>
              </div>
              
              {scholarshipData.applicationOpenDate && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Application Opens</span>
                  <p className="font-medium">{formatDate(scholarshipData.applicationOpenDate)}</p>
                </div>
              )}
              
              {scholarshipData.notificationDate && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Notification Date</span>
                  <p className="font-medium">{formatDate(scholarshipData.notificationDate)}</p>
                </div>
              )}
              
              {scholarshipData.programStartDate && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Program Start</span>
                  <p className="font-medium">{formatDate(scholarshipData.programStartDate)}</p>
                </div>
              )}
              
              {scholarshipData.durationValue && scholarshipData.durationUnit && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Duration</span>
                  <p className="font-medium">{scholarshipData.durationValue} {scholarshipData.durationUnit}</p>
                </div>
              )}
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
              <div>
                <span className="text-sm font-medium text-muted-foreground">Study Levels</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {scholarshipData.studyLevels.map((level, index) => (
                    <Badge key={index} variant="secondary">{level}</Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <span className="text-sm font-medium text-muted-foreground">Field Categories</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {scholarshipData.fieldCategories.map((field, index) => (
                    <Badge key={index} variant="outline">{field}</Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <span className="text-sm font-medium text-muted-foreground">Degree Required</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {scholarshipData.degreeRequired.map((degree, index) => (
                    <Badge key={index} variant="secondary">{degree}</Badge>
                  ))}
                </div>
              </div>
              
              {scholarshipData.minGpa && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Minimum GPA</span>
                  <p className="font-medium">
                    {scholarshipData.minGpa}
                    {scholarshipData.gpaScale && ` / ${scholarshipData.gpaScale}`}
                  </p>
                </div>
              )}
              
              {(scholarshipData.minAge || scholarshipData.maxAge) && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Age Requirement</span>
                  <p className="font-medium">
                    {scholarshipData.minAge && `Min: ${scholarshipData.minAge}`}
                    {scholarshipData.minAge && scholarshipData.maxAge && ', '}
                    {scholarshipData.maxAge && `Max: ${scholarshipData.maxAge}`}
                  </p>
                </div>
              )}
              
              {scholarshipData.minWorkExperience !== undefined && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Work Experience</span>
                  <p className="font-medium">
                    {scholarshipData.minWorkExperience === 0 ? 'Not required' : `${scholarshipData.minWorkExperience} years minimum`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Geographic Eligibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Geographic Eligibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Host Countries</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {scholarshipData.hostCountries.map((country, index) => (
                    <Badge key={index} variant="default">{country}</Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <span className="text-sm font-medium text-muted-foreground">Eligible Countries</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {scholarshipData.eligibleCountries.includes('*') ? (
                    <Badge variant="default">All Countries</Badge>
                  ) : (
                    scholarshipData.eligibleCountries.slice(0, 10).map((country, index) => (
                      <Badge key={index} variant="outline">{country}</Badge>
                    ))
                  )}
                  {scholarshipData.eligibleCountries.length > 10 && !scholarshipData.eligibleCountries.includes('*') && (
                    <Badge variant="outline">+{scholarshipData.eligibleCountries.length - 10} more</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Language Requirements */}
          {scholarshipData.languageRequirements && scholarshipData.languageRequirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Language Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {scholarshipData.languageRequirements.map((req, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded">
                      <p className="font-medium">{req.level}</p>
                      {req.testType && <p className="text-sm text-muted-foreground">Test: {req.testType}</p>}
                      {req.validityYears && <p className="text-sm text-muted-foreground">Valid for: {req.validityYears} years</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Required Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Required Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {scholarshipData.documentsRequired.map((doc, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Interview Required:</span>
                  <Badge variant={scholarshipData.interviewRequired ? "destructive" : "secondary"}>
                    {scholarshipData.interviewRequired ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Essay Required:</span>
                  <Badge variant={scholarshipData.essayRequired ? "destructive" : "secondary"}>
                    {scholarshipData.essayRequired ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        {(scholarshipData.mentorshipAvailable || scholarshipData.networkingOpportunities || scholarshipData.internshipOpportunities || scholarshipData.researchOpportunities) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Additional Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {scholarshipData.mentorshipAvailable && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Mentorship Available</span>
                  </div>
                )}
                {scholarshipData.networkingOpportunities && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Networking Opportunities</span>
                  </div>
                )}
                {scholarshipData.internshipOpportunities && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Internship Opportunities</span>
                  </div>
                )}
                {scholarshipData.researchOpportunities && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">Research Opportunities</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}