import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation, Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  ArrowLeft, 
  Building, 
  Calendar, 
  DollarSign, 
  GraduationCap, 
  MapPin,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Target,
  Users,
  Shield,
  ExternalLink,
  Award,
  Calculator,
  BookOpen,
  Lightbulb,
  Star,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { CustomCTA } from '@/components/CustomCTA';

interface UniversityScholarshipInfo {
  name: string;
  amount: string;
  criteria: string[];
  applicationDeadline: string;
  applicationProcess: string;
  sourceUrl: string;
  eligibilityMatch: 'High' | 'Medium' | 'Low';
  scholarshipType: 'Merit' | 'Need-based' | 'International' | 'Research' | 'Program-specific';
  studentProfileMatch: {
    gpaRequirement: string;
    matchesGPA: boolean;
    academicRequirement: string;
    matchesAcademic: boolean;
    overallMatch: number;
  };
  competitiveness?: 'Low' | 'Medium' | 'High';
  renewalRequirements?: string;
  additionalBenefits?: string[];
  applicationStrategy?: {
    recommendedSubmissionTime?: string;
    requiredDocuments?: string[];
    preparationTime?: string;
    successTips?: string[];
  };
}

interface DocumentAnalysis {
  termsAndConditions: {
    academicRequirements: string[];
    financialObligations: string[];
    enrollmentConditions: string[];
    complianceRequirements: string[];
    hiddenClauses: string[];
    criticalDeadlines: string[];
    penalties: string[];
  };
  riskAssessment: {
    highRiskFactors: string[];
    financialRisks: string[];
    academicRisks: string[];
    complianceRisks: string[];
    mitigationStrategies: string[];
  };
}

interface OfferLetterAnalysisResponse {
  universityInfo: {
    name: string;
    location: string;
    program: string;
    tuition: string;
    duration: string;
    startDate: string;
    campus: string;
    studyMode: string;
  };
  profileAnalysis: {
    academicStanding: string;
    gpa: string;
    financialStatus: string;
    relevantSkills: string[];
    strengths: string[];
    weaknesses: string[];
    improvementAreas: string[];
  };
  documentAnalysis: DocumentAnalysis;
  scholarshipOpportunities: UniversityScholarshipInfo[];
  costSavingStrategies: Array<{
    strategy: string;
    description: string;
    potentialSavings: string;
    implementationSteps: string[];
    timeline: string;
    difficulty: 'Low' | 'Medium' | 'High';
    eligibilityRequirements: string[];
    applicationProcess: string;
  }>;
  financialBreakdown: {
    totalCost: string;
    tuitionFees: string;
    otherFees: string;
    livingExpenses: string;
    scholarshipOpportunities: string;
    netCost: string;
    paymentSchedule: string[];
    fundingGaps: string[];
  };
  recommendations: Array<{
    category: 'Financial' | 'Academic' | 'Application' | 'Compliance';
    priority: 'High' | 'Medium' | 'Low';
    recommendation: string;
    rationale: string;
    implementationSteps: string[];
    timeline: string;
    expectedOutcome: string;
  }>;
  nextSteps: Array<{
    step: string;
    description: string;
    deadline: string;
    priority: 'High' | 'Medium' | 'Low';
    dependencies: string[];
    requiredResources: string[];
    successCriteria: string[];
  }>;
}

interface OfferLetterAnalysis {
  id: number;
  fileName: string;
  fileSize: number;
  analysisDate: string;
  analysisResults: OfferLetterAnalysisResponse;
  createdAt: string;
}

export default function OfferLetterAnalysisView() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const { data: analysis, isLoading, error } = useQuery<OfferLetterAnalysis>({
    queryKey: ['/api/offer-letter-analyses', id],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Loading offer letter analysis...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !analysis) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Analysis Not Found</h2>
          <p className="text-gray-600 mb-4">
            The offer letter analysis you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => setLocation('/offer-letter-analysis')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Offer Letter Analysis
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const analysisData = analysis.analysisResults || {
    universityInfo: {
      name: 'University information being processed',
      location: 'Location details available',
      program: 'Program details available',
      tuition: 'Tuition information available',
      duration: 'Duration specified',
      startDate: 'Start date provided',
      campus: 'Campus information available',
      studyMode: 'Study mode details available'
    },
    profileAnalysis: {
      academicStanding: 'Academic standing assessed',
      gpa: 'GPA requirements available',
      financialStatus: 'Financial status evaluated',
      relevantSkills: [],
      strengths: [],
      weaknesses: [],
      improvementAreas: []
    },
    documentAnalysis: {
      termsAndConditions: {
        academicRequirements: [],
        financialObligations: [],
        enrollmentConditions: [],
        complianceRequirements: [],
        hiddenClauses: [],
        criticalDeadlines: [],
        penalties: []
      },
      riskAssessment: {
        highRiskFactors: [],
        financialRisks: [],
        academicRisks: [],
        complianceRisks: [],
        mitigationStrategies: []
      }
    },
    scholarshipOpportunities: [],
    costSavingStrategies: [],
    financialBreakdown: {
      totalCost: 'Total cost calculation available',
      tuitionFees: 'Tuition fees specified',
      otherFees: 'Additional fees outlined',
      livingExpenses: 'Living expenses estimated',
      scholarshipOpportunities: '0 opportunities identified',
      netCost: 'Net cost calculated',
      paymentSchedule: [],
      fundingGaps: []
    },
    recommendations: [],
    nextSteps: []
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEligibilityColor = (match: string) => {
    switch (match) {
      case 'High': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => setLocation('/offer-letter-analysis')}
              className="hover:bg-green-100"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to My Analysis
            </Button>
            <Badge variant="secondary" className="text-sm">
              Analysis ID: {analysis.id}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white/80">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">{analysis.fileName}</p>
                    <p className="text-sm text-gray-600">Document</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">{analysisData.universityInfo.name}</p>
                    <p className="text-sm text-gray-600">University</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">{analysisData.universityInfo.program}</p>
                    <p className="text-sm text-gray-600">Program</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(analysis.analysisDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">Analysis Date</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Analysis Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="document">Document Analysis</TabsTrigger>
            <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="next-steps">Next Steps</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* University Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-600" />
                    University Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Institution</p>
                      <p className="text-gray-900">{analysisData.universityInfo.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Location</p>
                      <p className="text-gray-900">{analysisData.universityInfo.location}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Program</p>
                      <p className="text-gray-900">{analysisData.universityInfo.program}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Duration</p>
                      <p className="text-gray-900">{analysisData.universityInfo.duration}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Tuition</p>
                      <p className="text-gray-900 bg-blue-50 px-2 py-1 rounded font-medium">
                        {analysisData.universityInfo.tuition}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Start Date</p>
                      <p className="text-gray-900">{analysisData.universityInfo.startDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    Profile Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Academic Standing</p>
                    <p className="text-gray-900">{analysisData.profileAnalysis.academicStanding}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Financial Status</p>
                    <p className="text-gray-900">{analysisData.profileAnalysis.financialStatus}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Strengths</p>
                    <div className="flex flex-wrap gap-2">
                      {analysisData.profileAnalysis.strengths.map((strength, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Improvement Areas</p>
                    <div className="flex flex-wrap gap-2">
                      {analysisData.profileAnalysis.improvementAreas.map((area, index) => (
                        <Badge key={index} variant="secondary" className="bg-yellow-100 text-yellow-800">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Financial Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-green-600" />
                  Financial Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Total Cost</p>
                    <p className="text-xl font-bold text-blue-900">{analysisData.financialBreakdown.totalCost}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Scholarship Opportunities</p>
                    <p className="text-xl font-bold text-green-900">{analysisData.scholarshipOpportunities.length}</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Cost Strategies</p>
                    <p className="text-xl font-bold text-purple-900">{analysisData.costSavingStrategies.length}</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Net Cost</p>
                    <p className="text-xl font-bold text-orange-900">{analysisData.financialBreakdown.netCost}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Document Analysis Tab */}
          <TabsContent value="document" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Terms & Conditions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Terms & Conditions Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium text-gray-900 mb-2">Academic Requirements</p>
                    <ul className="space-y-1">
                      {analysisData.documentAnalysis.termsAndConditions.academicRequirements.map((req, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <p className="font-medium text-gray-900 mb-2">Financial Obligations</p>
                    <ul className="space-y-1">
                      {analysisData.documentAnalysis.termsAndConditions.financialObligations.map((obligation, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <DollarSign className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          {obligation}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <p className="font-medium text-gray-900 mb-2">Critical Deadlines</p>
                    <ul className="space-y-1">
                      {analysisData.documentAnalysis.termsAndConditions.criticalDeadlines.map((deadline, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <Clock className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          {deadline}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Assessment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-600" />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium text-gray-900 mb-2">High-Risk Factors</p>
                    <ul className="space-y-1">
                      {analysisData.documentAnalysis.riskAssessment.highRiskFactors.map((risk, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <p className="font-medium text-gray-900 mb-2">Financial Risks</p>
                    <ul className="space-y-1">
                      {analysisData.documentAnalysis.riskAssessment.financialRisks.map((risk, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <DollarSign className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <p className="font-medium text-gray-900 mb-2">Mitigation Strategies</p>
                    <ul className="space-y-1">
                      {analysisData.documentAnalysis.riskAssessment.mitigationStrategies.map((strategy, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          {strategy}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Scholarships Tab */}
          <TabsContent value="scholarships" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  Scholarship Opportunities ({analysisData.scholarshipOpportunities.length})
                </CardTitle>
                <CardDescription>
                  Researched scholarships from official university sources with eligibility matching
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {analysisData.scholarshipOpportunities.map((scholarship, index) => (
                <Card key={index} className="border-l-4 border-l-yellow-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{scholarship.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className="bg-green-100 text-green-800">
                            {scholarship.amount}
                          </Badge>
                          <Badge variant="outline" className={getEligibilityColor(scholarship.eligibilityMatch)}>
                            {scholarship.eligibilityMatch} Match
                          </Badge>
                          <Badge variant="outline">
                            {scholarship.scholarshipType}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="font-medium text-gray-900 mb-2">Eligibility Criteria</p>
                      <ul className="space-y-1">
                        {scholarship.criteria.map((criterion, criterionIndex) => (
                          <li key={criterionIndex} className="text-sm text-gray-700 flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                            {criterion}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">Application Deadline</p>
                        <p className="text-gray-700">{scholarship.applicationDeadline}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Competitiveness</p>
                        <Badge variant="outline" className={getDifficultyColor(scholarship.competitiveness || 'Medium')}>
                          {scholarship.competitiveness || 'Medium'}
                        </Badge>
                      </div>
                    </div>
                    
                    {scholarship.applicationStrategy && (
                      <div>
                        <p className="font-medium text-gray-900 mb-2">Application Strategy</p>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-900 mb-2">{scholarship.applicationStrategy.preparationTime}</p>
                          <div className="space-y-1">
                            {scholarship.applicationStrategy.successTips?.map((tip, tipIndex) => (
                              <p key={tipIndex} className="text-sm text-blue-800 flex items-start gap-2">
                                <Lightbulb className="h-3 w-3 text-blue-600 mt-1 flex-shrink-0" />
                                {tip}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {scholarship.sourceUrl && (
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <a href={scholarship.sourceUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Official Source
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Financial Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-green-600" />
                    Financial Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tuition Fees</span>
                      <span className="font-medium bg-blue-50 px-2 py-1 rounded">
                        {analysisData.financialBreakdown.tuitionFees}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Other Fees</span>
                      <span className="font-medium">{analysisData.financialBreakdown.otherFees}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Living Expenses</span>
                      <span className="font-medium">{analysisData.financialBreakdown.livingExpenses}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total Cost</span>
                      <span className="bg-red-50 px-3 py-1 rounded text-red-900">
                        {analysisData.financialBreakdown.totalCost}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Net Cost (After Scholarships)</span>
                      <span className="bg-green-50 px-3 py-1 rounded text-green-900">
                        {analysisData.financialBreakdown.netCost}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cost-Saving Strategies */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    Cost-Saving Strategies
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysisData.costSavingStrategies.map((strategy, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{strategy.strategy}</h4>
                        <Badge className={getDifficultyColor(strategy.difficulty)}>
                          {strategy.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{strategy.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium text-green-600">
                          Savings: {strategy.potentialSavings}
                        </span>
                        <span className="text-gray-500">
                          Timeline: {strategy.timeline}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {['Financial', 'Academic', 'Application', 'Compliance'].map((category) => {
                const categoryRecs = analysisData.recommendations.filter(rec => rec.category === category);
                if (categoryRecs.length === 0) return null;
                
                return (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {category === 'Financial' && <DollarSign className="h-5 w-5 text-green-600" />}
                        {category === 'Academic' && <BookOpen className="h-5 w-5 text-blue-600" />}
                        {category === 'Application' && <FileText className="h-5 w-5 text-purple-600" />}
                        {category === 'Compliance' && <Shield className="h-5 w-5 text-red-600" />}
                        {category} Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {categoryRecs.map((rec, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{rec.recommendation}</h4>
                            <Badge className={getPriorityColor(rec.priority)}>
                              {rec.priority} Priority
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 mb-3">{rec.rationale}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-gray-900">Timeline</p>
                              <p className="text-gray-700">{rec.timeline}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Expected Outcome</p>
                              <p className="text-gray-700">{rec.expectedOutcome}</p>
                            </div>
                          </div>
                          <div className="mt-3">
                            <p className="font-medium text-gray-900 mb-1">Implementation Steps</p>
                            <ul className="space-y-1">
                              {rec.implementationSteps.map((step, stepIndex) => (
                                <li key={stepIndex} className="text-sm text-gray-700 flex items-start gap-2">
                                  <span className="text-blue-600 font-medium">{stepIndex + 1}.</span>
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Next Steps Tab */}
          <TabsContent value="next-steps" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Action Plan
                </CardTitle>
                <CardDescription>
                  Prioritized next steps to maximize your offer letter benefits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysisData.nextSteps.map((step, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-3">
                        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">
                          {index + 1}
                        </span>
                        <div>
                          <h4 className="font-medium text-gray-900">{step.step}</h4>
                          <p className="text-sm text-gray-700 mt-1">{step.description}</p>
                        </div>
                      </div>
                      <Badge className={getPriorityColor(step.priority)}>
                        {step.priority}
                      </Badge>
                    </div>
                    
                    <div className="ml-10 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-900">Deadline</p>
                          <p className="text-gray-700">{step.deadline}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Dependencies</p>
                          <ul className="text-gray-700">
                            {step.dependencies.map((dep, depIndex) => (
                              <li key={depIndex}>• {dep}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Required Resources</p>
                        <div className="flex flex-wrap gap-2">
                          {step.requiredResources.map((resource, resourceIndex) => (
                            <Badge key={resourceIndex} variant="outline" className="text-xs">
                              {resource}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Success Criteria</p>
                        <ul className="space-y-1">
                          {step.successCriteria.map((criteria, criteriaIndex) => (
                            <li key={criteriaIndex} className="text-sm text-gray-700 flex items-start gap-2">
                              <Star className="h-3 w-3 text-yellow-600 mt-1 flex-shrink-0" />
                              {criteria}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <CustomCTA variant="offer-letter-analysis" />
      </div>
    </DashboardLayout>
  );
}