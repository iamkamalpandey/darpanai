import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Globe, DollarSign, BookOpen, Clock, TrendingUp, MapPin, Star } from 'lucide-react';

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
  // Legacy fields for backward compatibility
  reasons?: string[];
  advantages?: string[];
  challenges?: string[];
  estimatedCosts?: {
    tuitionRange: string;
    livingCosts: string;
    totalAnnualCost: string;
  };
  topUniversities?: string[];
  visaRequirements?: {
    difficulty: string;
    processingTime: string;
    workPermit: string;
  };
  careerProspects?: {
    jobMarket: string;
    averageSalary: string;
    growthOpportunities: string;
  };
  culturalFit?: {
    languageBarrier: string;
    culturalAdaptation: string;
    internationalStudentSupport: string;
  };
}

interface DestinationSuggestion {
  id: number;
  userId: number;
  suggestedCountries: CountryRecommendation[];
  matchScore: number;
  reasoning: string;
  keyFactors: string[];
  recommendations: {
    personalizedInsights: {
      profileStrengths: string[];
      specificImprovementAreas: string[];
      tailoredStrategicActions: string[];
      uniqueOpportunities: string[];
    };
    actionPlan: {
      immediateActions: Array<{
        action: string;
        deadline: string;
        priority: string;
        specificSteps: string[];
        resources: string[];
      }>;
      shortTermGoals: Array<{
        goal: string;
        timeline: string;
        milestones: string[];
        requirements: string[];
        successMetrics: string[];
      }>;
      longTermStrategy: Array<{
        objective: string;
        timeframe: string;
        keyActivities: string[];
        dependencies: string[];
        expectedOutcomes: string[];
      }>;
    };
    financialStrategy: {
      personalizedBudgetPlan: {
        totalInvestmentRequired: string;
        fundingGapAnalysis: string;
        cashflowProjection: string[];
      };
      targetedScholarships: Array<{
        scholarshipName: string;
        provider: string;
        amount: string;
        eligibilityMatch: string;
        applicationDeadline: string;
        competitiveness: string;
        applicationStrategy: string[];
      }>;
      costOptimizationStrategies: Array<{
        strategy: string;
        potentialSavings: string;
        implementationSteps: string[];
        timeline: string;
      }>;
    };
    personlizedTimeline: {
      preparationPhase: {
        duration: string;
        keyMilestones: string[];
        criticalDeadlines: string[];
      };
      applicationPhase: {
        duration: string;
        applicationWindows: string[];
        documentsRequired: string[];
      };
      decisionPhase: {
        duration: string;
        evaluationCriteria: string[];
        finalSteps: string[];
      };
    };
  };
  createdAt: string;
}

export default function DestinationSuggestionDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const { data: suggestion, isLoading } = useQuery<DestinationSuggestion>({
    queryKey: [`/api/destination-suggestions/${id}`],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!suggestion) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-gray-500">Destination suggestion not found</p>
          <Button 
            onClick={() => setLocation('/destination-suggestions')}
            className="mt-4"
          >
            Back to Suggestions
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/destination-suggestions')}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Suggestions
          </Button>
        </div>

        {/* Executive Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Study Destination Analysis
            </CardTitle>
            <CardDescription>
              Generated on {new Date(suggestion.createdAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Overall Match: {suggestion.matchScore}%
                </Badge>
              </div>
              <p className="text-gray-700 leading-relaxed">{suggestion.reasoning}</p>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="countries" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="countries">Top Countries</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="next-steps">Next Steps</TabsTrigger>
          </TabsList>

          {/* Top Countries Tab */}
          <TabsContent value="countries" className="space-y-4">
            {(suggestion.suggestedCountries || []).map((country, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-bold">#{country.ranking}</span>
                      </div>
                      {country.country}
                    </CardTitle>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {country.matchScore}% Match
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Advantages */}
                    <div>
                      <h4 className="font-semibold text-green-700 mb-2 flex items-center">
                        <Star className="w-4 h-4 mr-1" />
                        Advantages
                      </h4>
                      <ul className="space-y-1">
                        {(country.advantages || []).map((advantage, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start">
                            <span className="text-green-500 mr-2">•</span>
                            {advantage}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Top Universities */}
                    <div>
                      <h4 className="font-semibold text-blue-700 mb-2 flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        Top Universities
                      </h4>
                      <ul className="space-y-1">
                        {(country.topUniversities || []).map((university, i) => (
                          <li key={i} className="text-sm text-gray-600">
                            • {university}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Cost Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      Estimated Costs
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Tuition (Program):</span>
                        <div className="font-medium">{country.detailedCostBreakdown?.tuitionFees?.specificProgram || country.estimatedCosts?.tuitionRange || 'Cost information available upon analysis'}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Living Expenses:</span>
                        <div className="font-medium">{country.detailedCostBreakdown?.livingExpenses?.totalMonthly || country.estimatedCosts?.livingCosts || 'Living cost estimates available'}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Total Investment:</span>
                        <div className="font-medium text-blue-600">{country.detailedCostBreakdown?.totalAnnualInvestment || country.estimatedCosts?.totalAnnualCost || 'Total cost calculated upon analysis'}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Scholarship Potential:</span>
                        <div className="font-medium text-green-600">{country.detailedCostBreakdown?.scholarshipPotential || 'Scholarship opportunities available'}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-700">Strengths Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(suggestion.recommendations?.personalizedInsights?.profileStrengths || []).map((strength: string, i: number) => (
                      <li key={i} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-orange-700">Areas for Improvement</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(suggestion.recommendations?.personalizedInsights?.specificImprovementAreas || []).map((area: string, i: number) => (
                      <li key={i} className="flex items-start">
                        <span className="text-orange-500 mr-2">→</span>
                        <span className="text-gray-700">{area}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-700">Strategic Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(suggestion.recommendations?.personalizedInsights?.tailoredStrategicActions || []).map((rec: string, i: number) => (
                      <li key={i} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span className="text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Budget Tab */}
          <TabsContent value="budget" className="space-y-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-700">Cost-Saving Strategies</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(suggestion.recommendations?.financialStrategy?.costOptimizationStrategies || []).map((strategy: any, i: number) => (
                      <li key={i} className="flex items-start">
                        <span className="text-green-500 mr-2">💰</span>
                        <span className="text-gray-700">{typeof strategy === 'string' ? strategy : strategy.strategy}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-700">Scholarship Opportunities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(suggestion.recommendations?.budgetOptimization?.scholarshipOpportunities || []).map((scholarship, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-blue-500 mr-2">🎓</span>
                        <span className="text-gray-700">{scholarship}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-purple-700">Financial Planning Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(suggestion.recommendations?.budgetOptimization?.financialPlanningTips || []).map((tip, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-purple-500 mr-2">💡</span>
                        <span className="text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Application Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-700 mb-2">Preparation Phase</h4>
                      <p className="text-gray-700">{suggestion.recommendations?.timeline?.preparation || 'Timeline information not available'}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-700 mb-2">Application Phase</h4>
                      <p className="text-gray-700">{suggestion.recommendations?.timeline?.application || 'Timeline information not available'}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-700 mb-2">Decision Making</h4>
                      <p className="text-gray-700">{suggestion.recommendations?.timeline?.decisionMaking || 'Timeline information not available'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Next Steps Tab */}
          <TabsContent value="next-steps" className="space-y-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-700">Immediate Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(suggestion.recommendations?.nextSteps?.immediate || []).map((step, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-red-500 mr-2">🔥</span>
                        <span className="text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-orange-700">Short-term (1-3 months)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(suggestion.recommendations?.nextSteps?.shortTerm || []).map((step, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-orange-500 mr-2">📅</span>
                        <span className="text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-green-700">Long-term (3-12 months)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(suggestion.recommendations?.nextSteps?.longTerm || []).map((step, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-green-500 mr-2">🎯</span>
                        <span className="text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ul>
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