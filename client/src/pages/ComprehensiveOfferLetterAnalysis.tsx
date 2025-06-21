import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, Upload, FileText, Brain, Globe, Trophy, TrendingUp, Clock, DollarSign, Users, Building, MapPin, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ComprehensiveAnalysis {
  institutionDetails: {
    name: string;
    tradingName?: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
    registrations: {
      cricos?: string;
      providerId?: string;
      abn?: string;
      accreditation?: string;
    };
    contactInformation: {
      phone?: string;
      email?: string;
      website?: string;
    };
    institutionType: string;
    foundedYear?: string;
    reputation: {
      ranking?: string;
      accreditationBodies: string[];
      specializations: string[];
    };
  };
  courseDetails: {
    program: {
      name: string;
      specialization?: string;
      level: string;
      field: string;
      mode: string;
    };
    codes: {
      courseCode?: string;
      cricosCode?: string;
    };
    duration: {
      totalWeeks?: string;
      years?: string;
      unitsTotal?: string;
      creditsTotal?: string;
    };
    schedule: {
      orientationDate?: string;
      startDate?: string;
      endDate?: string;
      studyPeriods?: string;
      periodsPerYear?: string;
    };
    structure: {
      unitsPerYear?: string;
      creditTransfer?: string;
      prerequisites?: string;
      pathwayPrograms?: string;
    };
    accreditation: {
      professionalBodies: string[];
      careerOutcomes: string[];
      industryConnections: string[];
    };
  };
  studentProfile: {
    personalDetails: {
      name?: string;
      dateOfBirth?: string;
      gender?: string;
      nationality?: string;
      maritalStatus?: string;
    };
    contact: {
      homeAddress?: string;
      phone?: string;
      email?: string;
      emergencyContact?: string;
    };
    identification: {
      studentId?: string;
      passportNumber?: string;
      passportExpiry?: string;
    };
    agent: {
      agentName?: string;
      agentContact?: string;
    };
    supportNeeds: {
      academic?: string;
      accessibility?: string;
      cultural?: string;
      services: string[];
    };
  };
  financialBreakdown: {
    tuitionFees: {
      perUnit?: string;
      upfrontFee?: string;
      totalFees?: string;
      currency?: string;
    };
    paymentSchedule: Array<{
      studyPeriod: string;
      amount: string;
      dueDate: string;
      description: string;
    }>;
    additionalFees: {
      enrollmentFee?: string;
      materialFee?: string;
      administrativeFees?: string;
      estimatedTotalCost?: string;
    };
    scholarships: {
      offered?: string;
      conditions?: string;
      renewalCriteria?: string;
    };
    paymentMethods: Array<{
      method: string;
      details: string;
      fees?: string;
    }>;
    costComparison: {
      marketAverage?: string;
      competitivePosition?: string;
      valueAssessment?: string;
    };
  };
  offerConditions: {
    academic: Array<{
      condition: string;
      deadline?: string;
      documentation?: string;
      priority: string;
    }>;
    visa: Array<{
      requirement: string;
      authority?: string;
      timeline?: string;
      implications?: string;
    }>;
    health: Array<{
      requirement: string;
      provider?: string;
      coverage?: string;
      cost?: string;
    }>;
    english: Array<{
      requirement: string;
      acceptedTests: string[];
      minimumScores?: string;
      alternatives?: string;
    }>;
    other: Array<{
      condition: string;
      category: string;
      compliance?: string;
    }>;
  };
  complianceRequirements: {
    studentVisa: {
      subclass?: string;
      conditions: string[];
      workRights?: string;
      familyRights?: string;
    };
    academicProgress: {
      minimumRequirements?: string;
      attendanceRequirements?: string;
      interventionStrategy?: string;
      consequencesOfFailure?: string;
    };
    esos: {
      framework?: string;
      studentRights: string[];
      providerObligations: string[];
      complaintProcedures?: string;
    };
    refundPolicy: Array<{
      scenario: string;
      percentage?: string;
      conditions?: string;
      timeline?: string;
    }>;
  };
  institutionalResearch: {
    rankings: {
      global?: string;
      national?: string;
      subjectSpecific?: string;
      sources: string[];
    };
    facilities: {
      campus?: string;
      library?: string;
      laboratories?: string;
      accommodation?: string;
      studentServices: string[];
    };
    faculty: {
      totalFaculty?: string;
      internationalFaculty?: string;
      studentFacultyRatio?: string;
      researchOutput?: string;
    };
    studentBody: {
      totalEnrollment?: string;
      internationalStudents?: string;
      diversity?: string;
      graduationRate?: string;
    };
    careerOutcomes: {
      employmentRate?: string;
      averageSalary?: string;
      topEmployers: string[];
      industryConnections: string[];
    };
  };
  availableScholarships: Array<{
    name: string;
    type: string;
    amount?: string;
    duration?: string;
    eligibility: {
      academic?: string;
      nationality?: string;
      program?: string;
      other?: string;
    };
    application: {
      deadline?: string;
      process?: string;
      documents: string[];
      link?: string;
    };
    renewable?: string;
    competitiveness?: string;
    estimatedApplicants?: string;
  }>;
  competitorAnalysis: {
    similarInstitutions: Array<{
      name: string;
      location?: string;
      programCost?: string;
      duration?: string;
      ranking?: string;
      advantages: string[];
      disadvantages: string[];
      applicationDeadline?: string;
      scholarships?: string;
      website?: string;
    }>;
    marketPosition: {
      costPosition?: string;
      qualityRating?: string;
      competitiveAdvantages: string[];
      potentialConcerns: string[];
    };
  };
  strategicAnalysis: {
    strengths: Array<{
      category: string;
      strength: string;
      impact?: string;
      evidence?: string;
    }>;
    concerns: Array<{
      category: string;
      concern: string;
      severity: string;
      mitigation?: string;
      timeline?: string;
    }>;
    opportunities: Array<{
      opportunity: string;
      benefit?: string;
      requirements?: string;
      timeline?: string;
    }>;
    recommendations: Array<{
      category: string;
      recommendation: string;
      rationale?: string;
      priority: string;
      timeline?: string;
      resources?: string;
      expectedOutcome?: string;
    }>;
  };
  actionPlan: {
    immediate: Array<{
      action: string;
      description?: string;
      deadline?: string;
      priority: string;
      documents: string[];
      estimatedTime?: string;
      dependencies: string[];
    }>;
    shortTerm: Array<{
      action: string;
      description?: string;
      timeline?: string;
      preparation?: string;
    }>;
    longTerm: Array<{
      action: string;
      description?: string;
      milestones: string[];
      planning?: string;
    }>;
  };
}

interface AnalysisResult {
  id: number;
  analysis: ComprehensiveAnalysis;
  processingTime: number;
  tokensUsed: number;
  scrapingTime: number;
}

interface AnalysisListItem {
  id: number;
  fileName: string;
  institutionName: string;
  program: string;
  createdAt: string;
  processingTime: number;
  tokensUsed: number;
}

export default function ComprehensiveOfferLetterAnalysis() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user stats for quota checking
  const { data: userStats } = useQuery({
    queryKey: ['/api/user/stats'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch existing analyses
  const { data: analyses = [], isLoading: analysesLoading } = useQuery<AnalysisListItem[]>({
    queryKey: ['/api/offer-letter-analyses'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Upload and analyze mutation
  const analyzeMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('document', file);

      // Simulate progress updates
      setUploadProgress(10);
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 1000);

      const response = await fetch('/api/offer-letter-analysis', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Analysis failed');
      }

      return response.json() as Promise<AnalysisResult>;
    },
    onSuccess: (result) => {
      setUploadProgress(0);
      setSelectedFile(null);
      setSelectedAnalysis(result);
      queryClient.invalidateQueries({ queryKey: ['/api/offer-letter-analyses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
      toast({
        title: 'Analysis Complete',
        description: `Comprehensive analysis completed in ${result.processingTime}s using ${result.tokensUsed} tokens`,
      });
    },
    onError: (error: Error) => {
      setUploadProgress(0);
      toast({
        title: 'Analysis Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a PDF, JPG, or PNG file',
          variant: 'destructive',
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast({
          title: 'File Too Large',
          description: 'Please upload a file smaller than 10MB',
          variant: 'destructive',
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleAnalyze = () => {
    if (!selectedFile) return;

    if (userStats && userStats.remainingAnalyses <= 0) {
      toast({
        title: 'Quota Exceeded',
        description: 'You have reached your analysis limit. Please contact support for more analyses.',
        variant: 'destructive',
      });
      return;
    }

    analyzeMutation.mutate(selectedFile);
  };

  const viewAnalysis = async (analysisId: number) => {
    try {
      const response = await fetch(`/api/offer-letter-analyses/${analysisId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analysis');
      }
      const analysis = await response.json();
      setSelectedAnalysis({
        id: analysis.id,
        analysis: analysis.analysisResults,
        processingTime: analysis.processingTime || 0,
        tokensUsed: (analysis.tokensUsed || 0) + (analysis.claudeTokensUsed || 0),
        scrapingTime: analysis.scrapingTime || 0
      });
    } catch (error) {
      toast({
        title: 'Failed to Load Analysis',
        description: 'Could not load the selected analysis',
        variant: 'destructive',
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (selectedAnalysis) {
    const analysis = selectedAnalysis.analysis;
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Comprehensive Offer Letter Analysis
            </h1>
            <p className="text-gray-600 mt-2">Multi-AI powered analysis with institutional research and competitive insights</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setSelectedAnalysis(null)}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Back to Analyses
          </Button>
        </div>

        {/* Analysis Header */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{analysis.institutionDetails.name}</CardTitle>
                <CardDescription className="text-lg font-medium text-gray-700">
                  {analysis.courseDetails.program.name}
                </CardDescription>
              </div>
              <div className="flex gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {selectedAnalysis.processingTime}s processing
                </div>
                <div className="flex items-center gap-1">
                  <Brain className="h-4 w-4" />
                  {selectedAnalysis.tokensUsed} tokens
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  {selectedAnalysis.scrapingTime}s research
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Analysis Tabs */}
        <Tabs defaultValue="executive" className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="executive">Executive Summary</TabsTrigger>
            <TabsTrigger value="institution">Institution</TabsTrigger>
            <TabsTrigger value="course">Course Details</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="strategic">Strategic Analysis</TabsTrigger>
            <TabsTrigger value="action">Action Plan</TabsTrigger>
          </TabsList>

          {/* Executive Summary Tab */}
          <TabsContent value="executive" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {analysis.strategicAnalysis.strengths.slice(0, 3).map((strength, index) => (
                    <div key={index} className="p-2 bg-white rounded border-l-4 border-green-400">
                      <p className="font-medium text-sm">{strength.category}</p>
                      <p className="text-sm text-gray-600">{strength.strength}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-yellow-800 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Concerns
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {analysis.strategicAnalysis.concerns.slice(0, 3).map((concern, index) => (
                    <div key={index} className="p-2 bg-white rounded border-l-4 border-yellow-400">
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-sm">{concern.category}</p>
                        <Badge className={getSeverityColor(concern.severity)}>{concern.severity}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{concern.concern}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {analysis.strategicAnalysis.opportunities.slice(0, 3).map((opportunity, index) => (
                    <div key={index} className="p-2 bg-white rounded border-l-4 border-blue-400">
                      <p className="font-medium text-sm">{opportunity.opportunity}</p>
                      <p className="text-sm text-gray-600">{opportunity.benefit}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Quick Financial Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">Total Fees</p>
                    <p className="text-xl font-bold text-gray-800">
                      {analysis.financialBreakdown.tuitionFees.totalFees || 'Not specified'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">Currency</p>
                    <p className="text-xl font-bold text-gray-800">
                      {analysis.financialBreakdown.tuitionFees.currency || 'Not specified'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="text-xl font-bold text-gray-800">
                      {analysis.courseDetails.duration.years || analysis.courseDetails.duration.totalWeeks || 'Not specified'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">Available Scholarships</p>
                    <p className="text-xl font-bold text-gray-800">
                      {analysis.availableScholarships.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Institution Tab */}
          <TabsContent value="institution" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Institution Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="font-medium">Institution Name</Label>
                    <p className="text-gray-700">{analysis.institutionDetails.name}</p>
                  </div>
                  {analysis.institutionDetails.tradingName && (
                    <div>
                      <Label className="font-medium">Trading Name</Label>
                      <p className="text-gray-700">{analysis.institutionDetails.tradingName}</p>
                    </div>
                  )}
                  <div>
                    <Label className="font-medium">Type</Label>
                    <p className="text-gray-700">{analysis.institutionDetails.institutionType}</p>
                  </div>
                  {analysis.institutionDetails.foundedYear && (
                    <div>
                      <Label className="font-medium">Founded</Label>
                      <p className="text-gray-700">{analysis.institutionDetails.foundedYear}</p>
                    </div>
                  )}
                  <div>
                    <Label className="font-medium">Address</Label>
                    <p className="text-gray-700">
                      {analysis.institutionDetails.address.street}, {analysis.institutionDetails.address.city},
                      {analysis.institutionDetails.address.state} {analysis.institutionDetails.address.postalCode},
                      {analysis.institutionDetails.address.country}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Rankings & Research Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysis.institutionalResearch.rankings.global && (
                    <div>
                      <Label className="font-medium">Global Ranking</Label>
                      <p className="text-gray-700">{analysis.institutionalResearch.rankings.global}</p>
                    </div>
                  )}
                  {analysis.institutionalResearch.rankings.national && (
                    <div>
                      <Label className="font-medium">National Ranking</Label>
                      <p className="text-gray-700">{analysis.institutionalResearch.rankings.national}</p>
                    </div>
                  )}
                  {analysis.institutionalResearch.careerOutcomes.employmentRate && (
                    <div>
                      <Label className="font-medium">Employment Rate</Label>
                      <p className="text-gray-700">{analysis.institutionalResearch.careerOutcomes.employmentRate}</p>
                    </div>
                  )}
                  <div>
                    <Label className="font-medium">Student Services</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {analysis.institutionalResearch.facilities.studentServices.slice(0, 6).map((service, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Registrations and Accreditation */}
            <Card>
              <CardHeader>
                <CardTitle>Registrations & Accreditation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {analysis.institutionDetails.registrations.cricos && (
                    <div>
                      <Label className="font-medium">CRICOS</Label>
                      <p className="text-gray-700">{analysis.institutionDetails.registrations.cricos}</p>
                    </div>
                  )}
                  {analysis.institutionDetails.registrations.providerId && (
                    <div>
                      <Label className="font-medium">Provider ID</Label>
                      <p className="text-gray-700">{analysis.institutionDetails.registrations.providerId}</p>
                    </div>
                  )}
                  {analysis.institutionDetails.registrations.abn && (
                    <div>
                      <Label className="font-medium">ABN</Label>
                      <p className="text-gray-700">{analysis.institutionDetails.registrations.abn}</p>
                    </div>
                  )}
                  {analysis.institutionDetails.registrations.accreditation && (
                    <div>
                      <Label className="font-medium">Accreditation</Label>
                      <p className="text-gray-700">{analysis.institutionDetails.registrations.accreditation}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Course Details Tab */}
          <TabsContent value="course" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Program Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="font-medium">Program Name</Label>
                    <p className="text-gray-700">{analysis.courseDetails.program.name}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Level</Label>
                    <p className="text-gray-700">{analysis.courseDetails.program.level}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Field of Study</Label>
                    <p className="text-gray-700">{analysis.courseDetails.program.field}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Study Mode</Label>
                    <p className="text-gray-700">{analysis.courseDetails.program.mode}</p>
                  </div>
                  {analysis.courseDetails.program.specialization && (
                    <div>
                      <Label className="font-medium">Specialization</Label>
                      <p className="text-gray-700">{analysis.courseDetails.program.specialization}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Course Structure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysis.courseDetails.duration.years && (
                    <div>
                      <Label className="font-medium">Duration</Label>
                      <p className="text-gray-700">{analysis.courseDetails.duration.years}</p>
                    </div>
                  )}
                  {analysis.courseDetails.duration.totalWeeks && (
                    <div>
                      <Label className="font-medium">Total Weeks</Label>
                      <p className="text-gray-700">{analysis.courseDetails.duration.totalWeeks}</p>
                    </div>
                  )}
                  {analysis.courseDetails.duration.unitsTotal && (
                    <div>
                      <Label className="font-medium">Total Units</Label>
                      <p className="text-gray-700">{analysis.courseDetails.duration.unitsTotal}</p>
                    </div>
                  )}
                  {analysis.courseDetails.structure.unitsPerYear && (
                    <div>
                      <Label className="font-medium">Units Per Year</Label>
                      <p className="text-gray-700">{analysis.courseDetails.structure.unitsPerYear}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Schedule Information */}
            <Card>
              <CardHeader>
                <CardTitle>Important Dates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {analysis.courseDetails.schedule.startDate && (
                    <div>
                      <Label className="font-medium">Start Date</Label>
                      <p className="text-gray-700">{analysis.courseDetails.schedule.startDate}</p>
                    </div>
                  )}
                  {analysis.courseDetails.schedule.endDate && (
                    <div>
                      <Label className="font-medium">End Date</Label>
                      <p className="text-gray-700">{analysis.courseDetails.schedule.endDate}</p>
                    </div>
                  )}
                  {analysis.courseDetails.schedule.orientationDate && (
                    <div>
                      <Label className="font-medium">Orientation</Label>
                      <p className="text-gray-700">{analysis.courseDetails.schedule.orientationDate}</p>
                    </div>
                  )}
                  {analysis.courseDetails.schedule.studyPeriods && (
                    <div>
                      <Label className="font-medium">Study Periods</Label>
                      <p className="text-gray-700">{analysis.courseDetails.schedule.studyPeriods}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Professional Accreditation */}
            {analysis.courseDetails.accreditation.professionalBodies.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Professional Accreditation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="font-medium">Professional Bodies</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {analysis.courseDetails.accreditation.professionalBodies.map((body, index) => (
                          <Badge key={index} variant="outline">
                            {body}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {analysis.courseDetails.accreditation.careerOutcomes.length > 0 && (
                      <div>
                        <Label className="font-medium">Career Outcomes</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {analysis.courseDetails.accreditation.careerOutcomes.map((outcome, index) => (
                            <Badge key={index} variant="secondary">
                              {outcome}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Tuition Fees
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysis.financialBreakdown.tuitionFees.totalFees && (
                    <div>
                      <Label className="font-medium">Total Fees</Label>
                      <p className="text-gray-700 text-lg font-semibold">
                        {analysis.financialBreakdown.tuitionFees.totalFees} {analysis.financialBreakdown.tuitionFees.currency}
                      </p>
                    </div>
                  )}
                  {analysis.financialBreakdown.tuitionFees.perUnit && (
                    <div>
                      <Label className="font-medium">Per Unit</Label>
                      <p className="text-gray-700">{analysis.financialBreakdown.tuitionFees.perUnit}</p>
                    </div>
                  )}
                  {analysis.financialBreakdown.tuitionFees.upfrontFee && (
                    <div>
                      <Label className="font-medium">Upfront Fee</Label>
                      <p className="text-gray-700">{analysis.financialBreakdown.tuitionFees.upfrontFee}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Additional Fees</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysis.financialBreakdown.additionalFees.enrollmentFee && (
                    <div>
                      <Label className="font-medium">Enrollment Fee</Label>
                      <p className="text-gray-700">{analysis.financialBreakdown.additionalFees.enrollmentFee}</p>
                    </div>
                  )}
                  {analysis.financialBreakdown.additionalFees.materialFee && (
                    <div>
                      <Label className="font-medium">Material Fee</Label>
                      <p className="text-gray-700">{analysis.financialBreakdown.additionalFees.materialFee}</p>
                    </div>
                  )}
                  {analysis.financialBreakdown.additionalFees.administrativeFees && (
                    <div>
                      <Label className="font-medium">Administrative Fees</Label>
                      <p className="text-gray-700">{analysis.financialBreakdown.additionalFees.administrativeFees}</p>
                    </div>
                  )}
                  {analysis.financialBreakdown.additionalFees.estimatedTotalCost && (
                    <div>
                      <Label className="font-medium">Estimated Total Cost</Label>
                      <p className="text-gray-700 text-lg font-semibold">
                        {analysis.financialBreakdown.additionalFees.estimatedTotalCost}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Payment Schedule */}
            {analysis.financialBreakdown.paymentSchedule.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.financialBreakdown.paymentSchedule.map((payment, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div>
                            <Label className="font-medium">Study Period</Label>
                            <p className="text-gray-700">{payment.studyPeriod}</p>
                          </div>
                          <div>
                            <Label className="font-medium">Amount</Label>
                            <p className="text-gray-700 font-semibold">{payment.amount}</p>
                          </div>
                          <div>
                            <Label className="font-medium">Due Date</Label>
                            <p className="text-gray-700">{payment.dueDate}</p>
                          </div>
                          <div className="md:col-span-3">
                            <Label className="font-medium">Description</Label>
                            <p className="text-gray-700">{payment.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Market Comparison */}
            {(analysis.financialBreakdown.costComparison.marketAverage || 
              analysis.financialBreakdown.costComparison.competitivePosition) && (
              <Card>
                <CardHeader>
                  <CardTitle>Market Comparison</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysis.financialBreakdown.costComparison.marketAverage && (
                    <div>
                      <Label className="font-medium">Market Average</Label>
                      <p className="text-gray-700">{analysis.financialBreakdown.costComparison.marketAverage}</p>
                    </div>
                  )}
                  {analysis.financialBreakdown.costComparison.competitivePosition && (
                    <div>
                      <Label className="font-medium">Competitive Position</Label>
                      <p className="text-gray-700">{analysis.financialBreakdown.costComparison.competitivePosition}</p>
                    </div>
                  )}
                  {analysis.financialBreakdown.costComparison.valueAssessment && (
                    <div>
                      <Label className="font-medium">Value Assessment</Label>
                      <p className="text-gray-700">{analysis.financialBreakdown.costComparison.valueAssessment}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Scholarships Tab */}
          <TabsContent value="scholarships" className="space-y-6">
            {analysis.availableScholarships.length > 0 ? (
              <div className="grid gap-6">
                {analysis.availableScholarships.map((scholarship, index) => (
                  <Card key={index} className="border-blue-200">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{scholarship.name}</CardTitle>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">{scholarship.type}</Badge>
                            {scholarship.competitiveness && (
                              <Badge variant="secondary">{scholarship.competitiveness} competition</Badge>
                            )}
                          </div>
                        </div>
                        {scholarship.amount && (
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">{scholarship.amount}</p>
                            {scholarship.duration && (
                              <p className="text-sm text-gray-600">{scholarship.duration}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="font-medium">Eligibility</Label>
                          <div className="space-y-1 text-sm text-gray-700">
                            {scholarship.eligibility.academic && (
                              <p><span className="font-medium">Academic:</span> {scholarship.eligibility.academic}</p>
                            )}
                            {scholarship.eligibility.nationality && (
                              <p><span className="font-medium">Nationality:</span> {scholarship.eligibility.nationality}</p>
                            )}
                            {scholarship.eligibility.program && (
                              <p><span className="font-medium">Program:</span> {scholarship.eligibility.program}</p>
                            )}
                            {scholarship.eligibility.other && (
                              <p><span className="font-medium">Other:</span> {scholarship.eligibility.other}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label className="font-medium">Application Details</Label>
                          <div className="space-y-1 text-sm text-gray-700">
                            {scholarship.application.deadline && (
                              <p><span className="font-medium">Deadline:</span> {scholarship.application.deadline}</p>
                            )}
                            {scholarship.application.process && (
                              <p><span className="font-medium">Process:</span> {scholarship.application.process}</p>
                            )}
                            {scholarship.renewable && (
                              <p><span className="font-medium">Renewable:</span> {scholarship.renewable}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      {scholarship.application.documents.length > 0 && (
                        <div>
                          <Label className="font-medium">Required Documents</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {scholarship.application.documents.map((doc, docIndex) => (
                              <Badge key={docIndex} variant="outline" className="text-xs">
                                {doc}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No scholarships found in the analysis.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Consider checking the institution's website for available scholarships.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            {/* Offer Conditions */}
            <div className="grid gap-6">
              {/* Academic Conditions */}
              {analysis.offerConditions.academic.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Academic Conditions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.offerConditions.academic.map((condition, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-gray-800">{condition.condition}</p>
                            <Badge className={getPriorityColor(condition.priority)}>
                              {condition.priority}
                            </Badge>
                          </div>
                          {condition.deadline && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Deadline:</span> {condition.deadline}
                            </p>
                          )}
                          {condition.documentation && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Documentation:</span> {condition.documentation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Visa Requirements */}
              {analysis.offerConditions.visa.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Visa Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.offerConditions.visa.map((requirement, index) => (
                        <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-gray-800 mb-2">{requirement.requirement}</p>
                          {requirement.authority && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Authority:</span> {requirement.authority}
                            </p>
                          )}
                          {requirement.timeline && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Timeline:</span> {requirement.timeline}
                            </p>
                          )}
                          {requirement.implications && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Implications:</span> {requirement.implications}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* English Language Requirements */}
              {analysis.offerConditions.english.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      English Language Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.offerConditions.english.map((requirement, index) => (
                        <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-gray-800 mb-2">{requirement.requirement}</p>
                          {requirement.acceptedTests.length > 0 && (
                            <div className="mb-2">
                              <Label className="font-medium text-sm">Accepted Tests:</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {requirement.acceptedTests.map((test, testIndex) => (
                                  <Badge key={testIndex} variant="outline" className="text-xs">
                                    {test}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {requirement.minimumScores && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Minimum Scores:</span> {requirement.minimumScores}
                            </p>
                          )}
                          {requirement.alternatives && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Alternatives:</span> {requirement.alternatives}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Student Visa Information */}
            <Card>
              <CardHeader>
                <CardTitle>Student Visa Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.complianceRequirements.studentVisa.subclass && (
                  <div>
                    <Label className="font-medium">Visa Subclass</Label>
                    <p className="text-gray-700">{analysis.complianceRequirements.studentVisa.subclass}</p>
                  </div>
                )}
                {analysis.complianceRequirements.studentVisa.workRights && (
                  <div>
                    <Label className="font-medium">Work Rights</Label>
                    <p className="text-gray-700">{analysis.complianceRequirements.studentVisa.workRights}</p>
                  </div>
                )}
                {analysis.complianceRequirements.studentVisa.conditions.length > 0 && (
                  <div>
                    <Label className="font-medium">Visa Conditions</Label>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {analysis.complianceRequirements.studentVisa.conditions.map((condition, index) => (
                        <li key={index}>{condition}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Strategic Analysis Tab */}
          <TabsContent value="strategic" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {analysis.strategicAnalysis.strengths.map((strength, index) => (
                        <div key={index} className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                          <p className="font-medium text-sm text-green-800">{strength.category}</p>
                          <p className="text-sm text-gray-700">{strength.strength}</p>
                          {strength.impact && (
                            <p className="text-xs text-gray-600 mt-1">
                              <span className="font-medium">Impact:</span> {strength.impact}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Concerns */}
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-800 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Concerns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {analysis.strategicAnalysis.concerns.map((concern, index) => (
                        <div key={index} className="p-3 bg-red-50 rounded border-l-4 border-red-400">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-medium text-sm text-red-800">{concern.category}</p>
                            <Badge className={getSeverityColor(concern.severity)}>{concern.severity}</Badge>
                          </div>
                          <p className="text-sm text-gray-700">{concern.concern}</p>
                          {concern.mitigation && (
                            <p className="text-xs text-gray-600 mt-1">
                              <span className="font-medium">Mitigation:</span> {concern.mitigation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Strategic Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.strategicAnalysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-blue-800">{recommendation.category}</p>
                          <p className="text-gray-700">{recommendation.recommendation}</p>
                        </div>
                        <Badge className={getPriorityColor(recommendation.priority)}>
                          {recommendation.priority}
                        </Badge>
                      </div>
                      {recommendation.rationale && (
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Rationale:</span> {recommendation.rationale}
                        </p>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600">
                        {recommendation.timeline && (
                          <p><span className="font-medium">Timeline:</span> {recommendation.timeline}</p>
                        )}
                        {recommendation.resources && (
                          <p><span className="font-medium">Resources:</span> {recommendation.resources}</p>
                        )}
                        {recommendation.expectedOutcome && (
                          <p><span className="font-medium">Expected Outcome:</span> {recommendation.expectedOutcome}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Competitor Analysis */}
            {analysis.competitorAnalysis.similarInstitutions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Competitor Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.competitorAnalysis.similarInstitutions.map((competitor, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{competitor.name}</p>
                            {competitor.location && (
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {competitor.location}
                              </p>
                            )}
                          </div>
                          {competitor.ranking && (
                            <Badge variant="outline">{competitor.ranking}</Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {competitor.advantages.length > 0 && (
                            <div>
                              <Label className="font-medium text-green-700">Advantages</Label>
                              <ul className="list-disc list-inside text-gray-600 space-y-1">
                                {competitor.advantages.map((advantage, advIndex) => (
                                  <li key={advIndex}>{advantage}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {competitor.disadvantages.length > 0 && (
                            <div>
                              <Label className="font-medium text-red-700">Disadvantages</Label>
                              <ul className="list-disc list-inside text-gray-600 space-y-1">
                                {competitor.disadvantages.map((disadvantage, disIndex) => (
                                  <li key={disIndex}>{disadvantage}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Action Plan Tab */}
          <TabsContent value="action" className="space-y-6">
            {/* Immediate Actions */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Immediate Actions (Next 2 Weeks)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.actionPlan.immediate.map((action, index) => (
                    <div key={index} className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-red-800">{action.action}</p>
                        <Badge className={getPriorityColor(action.priority)}>{action.priority}</Badge>
                      </div>
                      {action.description && (
                        <p className="text-sm text-gray-700 mb-2">{action.description}</p>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600">
                        {action.deadline && (
                          <p><span className="font-medium">Deadline:</span> {action.deadline}</p>
                        )}
                        {action.estimatedTime && (
                          <p><span className="font-medium">Est. Time:</span> {action.estimatedTime}</p>
                        )}
                        {action.documents.length > 0 && (
                          <p><span className="font-medium">Documents:</span> {action.documents.length} required</p>
                        )}
                      </div>
                      {action.documents.length > 0 && (
                        <div className="mt-2">
                          <Label className="font-medium text-xs">Required Documents:</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {action.documents.map((doc, docIndex) => (
                              <Badge key={docIndex} variant="outline" className="text-xs">
                                {doc}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {action.dependencies.length > 0 && (
                        <div className="mt-2">
                          <Label className="font-medium text-xs">Dependencies:</Label>
                          <p className="text-xs text-gray-600">{action.dependencies.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Short Term Actions */}
            {analysis.actionPlan.shortTerm.length > 0 && (
              <Card className="border-yellow-200">
                <CardHeader>
                  <CardTitle className="text-yellow-800 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Short Term Actions (1-3 Months)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.actionPlan.shortTerm.map((action, index) => (
                      <div key={index} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="font-medium text-yellow-800">{action.action}</p>
                        {action.description && (
                          <p className="text-sm text-gray-700 mt-1">{action.description}</p>
                        )}
                        {action.timeline && (
                          <p className="text-xs text-gray-600 mt-2">
                            <span className="font-medium">Timeline:</span> {action.timeline}
                          </p>
                        )}
                        {action.preparation && (
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">Preparation:</span> {action.preparation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Long Term Actions */}
            {analysis.actionPlan.longTerm.length > 0 && (
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Long Term Planning (3+ Months)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.actionPlan.longTerm.map((action, index) => (
                      <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="font-medium text-green-800">{action.action}</p>
                        {action.description && (
                          <p className="text-sm text-gray-700 mt-1">{action.description}</p>
                        )}
                        {action.milestones.length > 0 && (
                          <div className="mt-2">
                            <Label className="font-medium text-xs">Milestones:</Label>
                            <ul className="list-disc list-inside text-xs text-gray-600 space-y-1 mt-1">
                              {action.milestones.map((milestone, milestoneIndex) => (
                                <li key={milestoneIndex}>{milestone}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {action.planning && (
                          <p className="text-xs text-gray-600 mt-2">
                            <span className="font-medium">Planning:</span> {action.planning}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Professional Disclaimer */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">Professional Disclaimer</p>
                <p>
                  This comprehensive analysis is generated using advanced AI technology and web research. 
                  While we strive for accuracy, all information should be verified with official sources. 
                  For critical decisions regarding education, visa, and financial matters, please consult 
                  with qualified education counselors, migration agents, and financial advisors.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Comprehensive Offer Letter Analysis
        </h1>
        <p className="text-gray-600">
          Multi-AI powered analysis with institutional research, scholarship matching, and strategic insights
        </p>
      </div>

      {/* Upload Section */}
      <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            Advanced Multi-AI Analysis
          </CardTitle>
          <CardDescription>
            Upload your offer letter for comprehensive analysis using both OpenAI GPT-4o and Claude Anthropic, 
            including institutional research, scholarship matching, and competitor analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <Label htmlFor="document-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-4 text-blue-500" />
                <p className="mb-2 text-sm text-blue-600">
                  <span className="font-semibold">Click to upload</span> your offer letter
                </p>
                <p className="text-xs text-blue-500">PDF, JPG, or PNG (Max 10MB)</p>
              </div>
              <Input
                id="document-upload"
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
              />
            </Label>
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between p-3 bg-blue-100 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">{selectedFile.name}</span>
                <span className="text-xs text-blue-600">
                  ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                </span>
              </div>
              <Button
                onClick={() => setSelectedFile(null)}
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:bg-blue-200"
              >
                Remove
              </Button>
            </div>
          )}

          {uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing with Multi-AI System</span>
                <span>{uploadProgress.toFixed(0)}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-xs text-gray-600 text-center">
                Analyzing with OpenAI GPT-4o, Claude Anthropic, and institutional web research...
              </p>
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {userStats && (
                <p>
                  Remaining analyses: <span className="font-medium">{userStats.remainingAnalyses}</span> of {userStats.maxAnalyses}
                </p>
              )}
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={!selectedFile || analyzeMutation.isPending || (userStats?.remainingAnalyses <= 0)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {analyzeMutation.isPending ? (
                <>
                  <Brain className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Start Comprehensive Analysis
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-blue-200">
          <CardContent className="p-4 text-center">
            <Brain className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-medium">Multi-AI Analysis</h3>
            <p className="text-xs text-gray-600">OpenAI GPT-4o + Claude Anthropic</p>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="p-4 text-center">
            <Globe className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <h3 className="font-medium">Live Web Research</h3>
            <p className="text-xs text-gray-600">Real-time institutional data</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200">
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <h3 className="font-medium">Scholarship Matching</h3>
            <p className="text-xs text-gray-600">12+ verified opportunities</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <h3 className="font-medium">Strategic Analysis</h3>
            <p className="text-xs text-gray-600">Competitor & market insights</p>
          </CardContent>
        </Card>
      </div>

      {/* Previous Analyses */}
      {analyses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Previous Comprehensive Analyses</CardTitle>
            <CardDescription>
              View your previous offer letter analyses with full multi-AI insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analysesLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading analyses...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {analyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    onClick={() => viewAnalysis(analysis.id)}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{analysis.institutionName}</h3>
                        <p className="text-sm text-gray-600">{analysis.program}</p>
                        <p className="text-xs text-gray-500">
                          {analysis.fileName} • {new Date(analysis.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {analysis.processingTime}s
                        </div>
                        <div className="flex items-center gap-1">
                          <Brain className="h-3 w-3" />
                          {analysis.tokensUsed}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}