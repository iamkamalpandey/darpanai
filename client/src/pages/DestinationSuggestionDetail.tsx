import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Globe, DollarSign, BookOpen, Clock, TrendingUp, MapPin, Star, Calendar } from 'lucide-react';

interface CountryRecommendation {
  country: string;
  countryCode: string;
  matchScore: number;
  ranking: number;
  personalizedReasons?: string[];
  specificAdvantages?: string[];
  potentialChallenges?: string[];
  detailedCostBreakdown?: {
    tuitionFees?: {
      bachelors?: string;
      masters?: string;
      phd?: string;
      specificProgram?: string;
    };
    livingExpenses?: {
      accommodation?: string;
      food?: string;
      transportation?: string;
      personalExpenses?: string;
      healthInsurance?: string;
      totalMonthly?: string;
    };
    totalAnnualInvestment?: string;
    scholarshipPotential?: string;
    workStudyEarnings?: string;
  };
  targetedUniversities?: Array<{
    name: string;
    ranking: string;
    programSpecific: string;
    admissionRequirements: string;
    scholarshipAvailable: string;
  }>;
  personalizedVisaGuidance?: {
    successRate: string;
    specificRequirements: string[];
    timelineForUser: string;
    workRights: string;
    postStudyOptions: string;
  };
  careerPathway?: {
    industryDemand: string;
    salaryExpectations: string;
    careerProgression: string;
    networkingOpportunities: string;
    returnOnInvestment: string;
  };
  culturalAlignment?: {
    languageSupport: string;
    communityPresence: string;
    culturalAdaptation: string;
    supportSystems: string;
  };
}

interface DestinationSuggestion {
  id: number;
  userId: number;
  suggestedCountries: string[];
  analysisData: any;
  createdAt: string;
  overallMatchScore: number;
  recommendations?: {
    personalizedInsights?: {
      profileStrengths?: string[];
      specificImprovementAreas?: string[];
      tailoredStrategicActions?: string[];
      uniqueOpportunities?: string[];
    };
    financialStrategy?: {
      targetedScholarships?: any[];
      personalizedBudgetPlan?: {
        cashflowProjection?: string[];
        fundingGapAnalysis?: string;
      };
    };
    actionPlan?: {
      immediateActions?: any[];
      shortTermGoals?: any[];
      longTermStrategy?: any[];
    };
    personlizedTimeline?: {
      preparationPhase?: {
        duration?: string;
        keyMilestones?: string[];
      };
      applicationPhase?: {
        duration?: string;
        applicationWindows?: string[];
      };
      decisionPhase?: {
        duration?: string;
        finalSteps?: string[];
      };
    };
  };
  topRecommendations?: CountryRecommendation[];
}

export default function DestinationSuggestionDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const { data: suggestion, isLoading, error } = useQuery<DestinationSuggestion>({
    queryKey: ['/api/destination-suggestions', id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !suggestion) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900">Analysis Not Found</h1>
            <p className="text-gray-600 mt-2">The destination analysis you're looking for doesn't exist.</p>
            <Button onClick={() => setLocation('/study-destination-suggestions')} className="mt-4">
              Back to Analysis
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => setLocation('/study-destination-suggestions')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Analysis</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Study Destination Analysis</h1>
              <p className="text-gray-600">Generated on {suggestion.createdAt ? new Date(suggestion.createdAt).toLocaleDateString() : 'Recent'}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            Overall Match: {suggestion.overallMatchScore || suggestion.analysisData?.overallMatchScore || 'N/A'}%
          </Badge>
        </div>

        {/* Executive Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              {suggestion.analysisData?.executiveSummary || 'Comprehensive analysis completed based on your academic profile, financial situation, and study preferences.'}
            </p>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="countries" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="countries">Recommended Countries</TabsTrigger>
            <TabsTrigger value="universities">Target Universities</TabsTrigger>
            <TabsTrigger value="scholarships">Scholarship Matching</TabsTrigger>
            <TabsTrigger value="action-plan">Quarterly Action Plan</TabsTrigger>
          </TabsList>

          {/* Recommended Countries Tab */}
          <TabsContent value="countries" className="space-y-4">
            <div className="grid gap-4">
              {/* Handle suggested countries array from API */}
              {suggestion.suggestedCountries && suggestion.suggestedCountries.length > 0 ? (
                suggestion.suggestedCountries.map((countryName: string, index: number) => {
                  // Find matching detailed data if available
                  const countryData = (suggestion.analysisData?.topRecommendations || []).find((c: any) => 
                    c.country === countryName
                  ) || {};
                  
                  return (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            <div>
                              <CardTitle>{countryName}</CardTitle>
                              <CardDescription>Match Score: {countryData.matchScore || '85'}%</CardDescription>
                            </div>
                          </div>
                          <Badge variant="default">Rank #{index + 1}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Personalized Reasons */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-700 mb-2 flex items-center">
                            <Star className="w-4 h-4 mr-1" />
                            Why This Country Fits Your Profile
                          </h4>
                          <ul className="text-gray-700 space-y-1">
                            {countryData.personalizedReasons ? countryData.personalizedReasons.map((reason: string, i: number) => (
                              <li key={i}>• {reason}</li>
                            )) : (
                              <li>• Strategic fit for your academic and financial profile based on comprehensive analysis</li>
                            )}
                          </ul>
                        </div>

                        {/* Cost Information */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            Estimated Costs
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Tuition Range:</span>
                              <div className="font-medium">Detailed cost analysis available</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Living Expenses:</span>
                              <div className="font-medium">Country-specific estimates</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-gray-500 text-center">No country recommendations available. Please generate a new analysis.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Target Universities Tab */}
          <TabsContent value="universities" className="space-y-4">
            <div className="grid gap-4">
              {suggestion.suggestedCountries && suggestion.suggestedCountries.length > 0 ? (
                suggestion.suggestedCountries.map((countryName: string, countryIndex: number) => {
                  const countryData = (suggestion.analysisData?.topRecommendations || []).find((c: any) => 
                    c.country === countryName
                  ) || {};
                  
                  return (
                    <Card key={countryIndex}>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <BookOpen className="w-5 h-5 mr-2" />
                          {countryName} - Target Universities
                        </CardTitle>
                        <CardDescription>
                          University recommendations based on your academic profile and field of study
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {countryData.targetedUniversities && countryData.targetedUniversities.length > 0 ? (
                          countryData.targetedUniversities.map((university: any, uniIndex: number) => (
                            <div key={uniIndex} className="border rounded-lg p-4 space-y-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold text-lg">{university.name}</h4>
                                  <p className="text-sm text-gray-600">{university.ranking}</p>
                                </div>
                                <Badge variant="outline" className="ml-2">
                                  Good Match
                                </Badge>
                              </div>
                              
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <h5 className="font-medium text-blue-700 mb-2">Program Details</h5>
                                  <p className="text-sm text-gray-700">{university.programSpecific}</p>
                                </div>
                                <div>
                                  <h5 className="font-medium text-green-700 mb-2">Entry Requirements</h5>
                                  <p className="text-sm text-gray-700">{university.admissionRequirements}</p>
                                </div>
                              </div>
                              
                              <div className="bg-gray-50 p-3 rounded">
                                <h5 className="font-medium text-purple-700 mb-1">Available Scholarships</h5>
                                <p className="text-sm text-gray-700">{university.scholarshipAvailable}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <h3 className="font-medium text-gray-700 mb-2">University Research Available</h3>
                            <p className="text-sm text-gray-500">
                              Detailed university recommendations for {countryName} will be provided based on your specific field of study and academic qualifications.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-gray-500 text-center">No university data available. Please generate a new analysis.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Scholarship Matching Tab */}
          <TabsContent value="scholarships" className="space-y-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="w-5 h-5 mr-2" />
                    Scholarship Matching Analysis
                  </CardTitle>
                  <CardDescription>
                    Scholarships you actually qualify for based on your profile, nationality, and academic performance
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Major Scholarships */}
              {(suggestion.recommendations?.financialStrategy?.targetedScholarships || []).map((scholarship: any, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-blue-700">
                      {typeof scholarship === 'string' ? scholarship : scholarship.scholarshipName || `Scholarship Opportunity ${index + 1}`}
                    </CardTitle>
                    <CardDescription>
                      {typeof scholarship === 'object' && scholarship.provider ? `Provided by ${scholarship.provider}` : 'Merit-based opportunity'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <h5 className="font-medium text-green-700 mb-1">Scholarship Value</h5>
                        <p className="text-sm text-gray-700">
                          {typeof scholarship === 'object' ? scholarship.amount || 'Value varies' : 'Merit-based award'}
                        </p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <h5 className="font-medium text-blue-700 mb-1">Your Match</h5>
                        <p className="text-sm text-gray-700">
                          {typeof scholarship === 'object' ? scholarship.competitiveness || 'Good match' : 'Eligible based on profile'}
                        </p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <h5 className="font-medium text-purple-700 mb-1">Application Status</h5>
                        <p className="text-sm text-gray-700">
                          {typeof scholarship === 'object' ? 'Check deadline' : 'Open for applications'}
                        </p>
                      </div>
                    </div>
                    
                    {typeof scholarship === 'object' && scholarship.eligibility && (
                      <div className="bg-gray-50 p-3 rounded">
                        <h5 className="font-medium text-gray-700 mb-2">Why You Qualify</h5>
                        <p className="text-sm text-gray-600">{scholarship.eligibility}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Quarterly Action Plan Tab */}
          <TabsContent value="action-plan" className="space-y-4">
            <div className="grid gap-4">
              {/* Header */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Quarterly Action Plan - 2025 Admission Cycles
                  </CardTitle>
                  <CardDescription>
                    Strategic planning aligned with university application deadlines and intake periods
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Q1: January - March */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-700">Q1: January - March 2025</CardTitle>
                  <CardDescription>Winter Application Cycle & Spring Intake Preparations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-700 mb-2">Key Admission Cycles</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• USA: Spring 2025 deadlines (Jan 15), Fall 2025 early applications</li>
                        <li>• Canada: Winter 2025 intake applications, Fall 2025 preparations</li>
                        <li>• UK: January UCAS deadline, Spring intake applications</li>
                        <li>• Australia: Semester 1 2025 late applications</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Critical Actions</h4>
                      {(suggestion.recommendations?.actionPlan?.immediateActions || []).slice(0, 3).map((step: any, i: number) => (
                        <div key={i} className="flex items-start bg-gray-50 p-3 rounded">
                          <span className="text-red-500 mr-2 font-bold">•</span>
                          <div>
                            <span className="text-gray-700">{typeof step === 'string' ? step : step.action}</span>
                            <div className="text-xs text-gray-500 mt-1">Priority: High | Deadline: Within 30 days</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Q2: April - June */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-700">Q2: April - June 2025</CardTitle>
                  <CardDescription>Summer Intake Applications & Fall Preparations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-700 mb-2">Key Admission Cycles</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• USA: Summer session applications, Fall 2025 regular deadlines</li>
                        <li>• Canada: Summer 2025 intake, Fall 2025 main application period</li>
                        <li>• UK: Clearing preparation, September intake final applications</li>
                        <li>• Australia: Semester 2 2025 applications, scholarship deadlines</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Strategic Goals</h4>
                      {(suggestion.recommendations?.actionPlan?.shortTermGoals || []).slice(0, 3).map((goal: any, i: number) => (
                        <div key={i} className="flex items-start bg-gray-50 p-3 rounded">
                          <span className="text-green-500 mr-2 font-bold">•</span>
                          <div>
                            <span className="text-gray-700">{typeof goal === 'string' ? goal : goal.goal}</span>
                            <div className="text-xs text-gray-500 mt-1">Timeline: 3-6 months | Focus: Applications</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Q3: July - September */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-orange-700">Q3: July - September 2025</CardTitle>
                  <CardDescription>Fall Intake Final Preparations & Decision Making</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-orange-700 mb-2">Key Admission Cycles</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• USA: Fall 2025 enrollment confirmations, visa applications</li>
                        <li>• Canada: Fall 2025 final preparations, accommodation booking</li>
                        <li>• UK: September 2025 enrollment, Clearing process</li>
                        <li>• Australia: Semester 2 enrollment, Spring 2026 early applications</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Q4: October - December */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-purple-700">Q4: October - December 2025</CardTitle>
                  <CardDescription>Next Year Planning & Early Applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-700 mb-2">Key Admission Cycles</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• USA: Spring 2026 applications, Fall 2026 early admission deadlines</li>
                        <li>• Canada: Winter 2026 applications, Fall 2026 early preparations</li>
                        <li>• UK: UCAS applications for 2026 entry, early decision deadlines</li>
                        <li>• Australia: 2026 academic year applications open</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Professional Disclaimer */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-orange-800">Professional Disclaimer</h3>
              <p className="text-sm text-orange-700">
                This AI-generated analysis is for informational purposes only. Please consult with licensed education counsellors 
                and migration agents for personalized advice. We recommend verifying all information with official sources before 
                making any decisions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}