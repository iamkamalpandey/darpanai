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
  reasons: string[];
  advantages: string[];
  challenges: string[];
  estimatedCosts: {
    tuitionRange: string;
    livingCosts: string;
    totalAnnualCost: string;
  };
  topUniversities: string[];
  visaRequirements: {
    difficulty: string;
    processingTime: string;
    workPermit: string;
  };
  careerProspects: {
    jobMarket: string;
    averageSalary: string;
    growthOpportunities: string;
  };
  culturalFit: {
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
      strengthsAnalysis: string[];
      improvementAreas: string[];
      strategicRecommendations: string[];
    };
    nextSteps: {
      immediate: string[];
      shortTerm: string[];
      longTerm: string[];
    };
    budgetOptimization: {
      costSavingStrategies: string[];
      scholarshipOpportunities: string[];
      financialPlanningTips: string[];
    };
    timeline: {
      preparation: string;
      application: string;
      decisionMaking: string;
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
            {suggestion.suggestedCountries.map((country, index) => (
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
                        {country.advantages.map((advantage, i) => (
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
                        {country.topUniversities.map((university, i) => (
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
                        <span className="text-gray-500">Tuition:</span>
                        <div className="font-medium">{country.estimatedCosts.tuitionRange}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Living:</span>
                        <div className="font-medium">{country.estimatedCosts.livingCosts}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Total Annual:</span>
                        <div className="font-medium">{country.estimatedCosts.totalAnnualCost}</div>
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
                    {suggestion.recommendations.personalizedInsights.strengthsAnalysis.map((strength, i) => (
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
                    {suggestion.recommendations.personalizedInsights.improvementAreas.map((area, i) => (
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
                    {suggestion.recommendations.personalizedInsights.strategicRecommendations.map((rec, i) => (
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
                    {suggestion.recommendations.budgetOptimization.costSavingStrategies.map((strategy, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-green-500 mr-2">💰</span>
                        <span className="text-gray-700">{strategy}</span>
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
                    {suggestion.recommendations.budgetOptimization.scholarshipOpportunities.map((scholarship, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-blue-500 mr-2">🎓</span>
                        <span className="text-gray-700">{scholarship}</span>
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
                      <p className="text-gray-700">{suggestion.recommendations.timeline.preparation}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-700 mb-2">Application Phase</h4>
                      <p className="text-gray-700">{suggestion.recommendations.timeline.application}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-700 mb-2">Decision Making</h4>
                      <p className="text-gray-700">{suggestion.recommendations.timeline.decisionMaking}</p>
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
                    {suggestion.recommendations.nextSteps.immediate.map((step, i) => (
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
                    {suggestion.recommendations.nextSteps.shortTerm.map((step, i) => (
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
                    {suggestion.recommendations.nextSteps.longTerm.map((step, i) => (
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