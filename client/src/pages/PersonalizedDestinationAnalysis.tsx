import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  GraduationCap, 
  Calendar, 
  DollarSign, 
  Clock, 
  Star, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Building,
  Users,
  Globe,
  Target,
  Award,
  BookOpen,
  Heart,
  ArrowLeft
} from "lucide-react";

// Define comprehensive interfaces for type safety
interface CountryRecommendation {
  country: string;
  countryCode: string;
  matchScore: number;
  ranking: number;
  personalizedReasons: string[];
  specificAdvantages: string[];
  potentialChallenges: string[];
  detailedCostBreakdown: {
    tuitionFees: {
      masters: string;
      bachelors: string;
      specificProgram: string;
    };
    livingExpenses: {
      totalMonthly: string;
      accommodation: string;
      food: string;
      transportation: string;
    };
    scholarshipPotential: string;
    workStudyEarnings: string;
  };
  targetedUniversities: Array<{
    name: string;
    ranking: string;
    programSpecific: string;
    scholarshipAvailable: string;
    admissionRequirements: string;
  }>;
  personalizedVisaGuidance: {
    workRights: string;
    successRate: string;
    timelineForUser: string;
    postStudyOptions: string;
  };
  careerPathway: {
    industryDemand: string;
    salaryExpectations: string;
    careerProgression: string;
    returnOnInvestment: string;
  };
}

interface PersonalizedInsights {
  strengthsAnalysis: string[];
  improvementAreas: string[];
  strategicRecommendations: string[];
}

interface NextSteps {
  immediate: string[];
  shortTerm: string[];
  longTerm: string[];
}

interface BudgetOptimization {
  costSavingStrategies: string[];
  scholarshipOpportunities: string[];
  financialPlanningTips: string[];
}

interface Timeline {
  preparation: string;
  application: string;
  decisionMaking: string;
}

interface IntelligentAlternative {
  country: string;
  whyBetter: string;
  keyBenefits: string[];
  matchScore: number;
  costAdvantage?: string;
}

interface PathwayProgram {
  type: string;
  description: string;
  duration: string;
  cost: string;
  entryRequirements: string[];
  pathwayTo: string;
}

interface PersonalizedDestinationAnalysis {
  id: number;
  userId: number;
  suggestedCountries: CountryRecommendation[];
  matchScore: number;
  reasoning: string;
  keyFactors: string[];
  intelligentAlternatives?: IntelligentAlternative[];
  pathwayPrograms?: PathwayProgram[];
  disclaimer?: string;
  recommendations: {
    personalizedInsights: PersonalizedInsights;
    nextSteps: NextSteps;
    budgetOptimization: BudgetOptimization;
    timeline: Timeline;
  };
  createdAt: string;
}

export default function PersonalizedDestinationAnalysis() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const { data: analysis, isLoading, error } = useQuery<PersonalizedDestinationAnalysis>({
    queryKey: ['/api/destination-suggestions', id],
    enabled: !!id,
  });

  // Debug logging to trace data structure
  if (analysis) {
    console.log('PersonalizedDestinationAnalysis - Full analysis data:', analysis);
    console.log('PersonalizedDestinationAnalysis - suggestedCountries:', analysis.suggestedCountries);
    console.log('PersonalizedDestinationAnalysis - suggestedCountries length:', analysis.suggestedCountries?.length);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-6 text-lg text-gray-600">Loading your personalized destination analysis...</p>
          <p className="mt-2 text-sm text-gray-500">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Analysis Not Found</h2>
          <p className="text-gray-600 mb-6">The destination analysis you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => setLocation('/destination-suggestions')} className="bg-blue-600 hover:bg-blue-700">
            Back to Analysis Hub
          </Button>
        </div>
      </div>
    );
  }

  // Get countries data with fallback
  const countries = analysis.suggestedCountries || [];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-start justify-between">
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/destination-suggestions')}
                className="text-white hover:bg-white/10 mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Analysis Hub
              </Button>
              <h1 className="text-4xl font-bold mb-4">Your Personalized Study Destination Analysis</h1>
              <p className="text-xl text-blue-100 mb-6 max-w-2xl">
                Comprehensive AI-powered recommendations tailored specifically to your academic profile, career goals, and personal preferences.
              </p>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-100">Overall Match</p>
                    <p className="text-2xl font-bold">{analysis.matchScore}%</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-100">Generated</p>
                    <p className="text-lg font-semibold">{new Date(analysis.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8 border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
              <BookOpen className="w-6 h-6 mr-3 text-blue-600" />
              Executive Summary
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              Key insights and strategic overview of your study abroad opportunities
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed">
                {analysis.reasoning || "Based on your comprehensive profile analysis, we've identified the most suitable study destinations that align with your academic background, career objectives, and personal preferences."}
              </p>
              {analysis.keyFactors && analysis.keyFactors.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Assessment Factors:</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keyFactors.map((factor: string, index: number) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="countries" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 h-12">
            <TabsTrigger value="countries" className="flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <span>Recommended Countries</span>
            </TabsTrigger>
            <TabsTrigger value="universities" className="flex items-center space-x-2">
              <GraduationCap className="w-4 h-4" />
              <span>Target Universities</span>
            </TabsTrigger>
            <TabsTrigger value="scholarships" className="flex items-center space-x-2">
              <Award className="w-4 h-4" />
              <span>Scholarship Matching</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Quarterly Action Plan</span>
            </TabsTrigger>
          </TabsList>

          {/* Country Matches Tab */}
          <TabsContent value="countries" className="space-y-6">
            <div className="grid gap-8">
              {countries && countries.length > 0 ? (
                countries.map((country: CountryRecommendation, index: number) => (
                  <Card key={index} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-2xl font-bold text-gray-900">{country.country}</CardTitle>
                            <CardDescription className="text-lg mt-1">
                              Compatibility Score: <span className="font-semibold text-blue-600">{country.matchScore}%</span>
                            </CardDescription>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="text-lg px-4 py-2 bg-blue-100 text-blue-800">
                            #{country.ranking} Choice
                          </Badge>
                          <div className="mt-2">
                            <Progress value={country.matchScore} className="w-24 h-2" />
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid lg:grid-cols-2 gap-8">
                        {/* Why This Country */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Heart className="w-5 h-5 mr-2 text-red-500" />
                            Why {country.country} is Perfect for You
                          </h4>
                          <ul className="space-y-3">
                            {country.personalizedReasons?.map((reason: string, i: number) => (
                              <li key={i} className="flex items-start">
                                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                                <span className="text-gray-700">{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Cost Grid */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                            Investment Overview
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <p className="text-sm text-blue-600 font-medium">Tuition (Masters)</p>
                              <p className="text-lg font-bold text-blue-900">{country.detailedCostBreakdown?.tuitionFees?.masters || 'Contact university'}</p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                              <p className="text-sm text-purple-600 font-medium">Living Expenses</p>
                              <p className="text-lg font-bold text-purple-900">{country.detailedCostBreakdown?.livingExpenses?.totalMonthly || 'Varies by city'}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                              <p className="text-sm text-green-600 font-medium">Work Rights</p>
                              <p className="text-lg font-bold text-green-900">{country.personalizedVisaGuidance?.workRights || 'Available'}</p>
                            </div>
                            <div className="bg-amber-50 p-4 rounded-lg">
                              <p className="text-sm text-amber-600 font-medium">Scholarship</p>
                              <p className="text-lg font-bold text-amber-900">{country.detailedCostBreakdown?.scholarshipPotential || 'Available'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Entry Requirements */}
                        <div className="lg:col-span-2">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Building className="w-5 h-5 mr-2 text-indigo-600" />
                            Entry Requirements & Pathway
                          </h4>
                          <div className="bg-gray-50 p-6 rounded-lg">
                            <div className="grid md:grid-cols-3 gap-6">
                              <div>
                                <p className="font-medium text-gray-900 mb-2">Visa Success Rate</p>
                                <p className="text-2xl font-bold text-green-600">{country.personalizedVisaGuidance?.successRate || '85%+'}</p>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 mb-2">Processing Time</p>
                                <p className="text-lg text-gray-700">{country.personalizedVisaGuidance?.timelineForUser || '4-8 weeks'}</p>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 mb-2">Post-Study Options</p>
                                <p className="text-lg text-gray-700">{country.personalizedVisaGuidance?.postStudyOptions || 'Work visa available'}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Career Prospects */}
                        {country.careerPathway && (
                          <div className="lg:col-span-2">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                              <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                              Career Prospects & ROI
                            </h4>
                            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
                              <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                  <p className="font-medium text-gray-900 mb-2">Industry Demand</p>
                                  <p className="text-gray-700">{country.careerPathway.industryDemand}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 mb-2">Starting Salary</p>
                                  <p className="text-gray-700">{country.careerPathway.salaryExpectations}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 mb-2">Career Growth</p>
                                  <p className="text-gray-700">{country.careerPathway.careerProgression}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 mb-2">ROI Assessment</p>
                                  <p className="text-gray-700">{country.careerPathway.returnOnInvestment}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Challenges */}
                        {country.potentialChallenges && country.potentialChallenges.length > 0 && (
                          <div className="lg:col-span-2">
                            <h5 className="font-semibold text-amber-800 mb-2 flex items-center">
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              Consider These Factors
                            </h5>
                            <ul className="space-y-1 text-sm text-amber-700">
                              {country.potentialChallenges.map((challenge: string, i: number) => (
                                <li key={i} className="flex items-start">
                                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                                  {challenge}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-0 shadow-lg">
                  <CardContent className="text-center py-16">
                    <MapPin className="w-24 h-24 text-gray-400 mx-auto mb-6" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">No Country Recommendations Available</h3>
                    <p className="text-gray-600 mb-6">Generate a new analysis to receive personalized country recommendations based on your profile.</p>
                    <Button onClick={() => setLocation('/destination-suggestions')} className="bg-blue-600 hover:bg-blue-700">
                      Generate New Analysis
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Universities Tab */}
          <TabsContent value="universities" className="space-y-6">
            <div className="grid gap-6">
              {countries && countries.length > 0 ? (
                countries.map((country: CountryRecommendation, countryIndex: number) => (
                  <Card key={countryIndex} className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                      <CardTitle className="flex items-center space-x-3 text-xl">
                        <GraduationCap className="w-6 h-6 text-blue-600" />
                        <span>Target Universities in {country.country}</span>
                        <Badge variant="outline" className="ml-auto">{country.matchScore}% Match</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid gap-6">
                        {country.targetedUniversities?.map((university, uniIndex: number) => (
                          <div key={uniIndex} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h4 className="text-lg font-bold text-gray-900 mb-1">{university.name}</h4>
                                <p className="text-blue-600 font-medium">{university.programSpecific}</p>
                              </div>
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                {university.ranking}
                              </Badge>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                              <div>
                                <p className="font-medium text-gray-900 mb-2">Admission Requirements</p>
                                <p className="text-gray-700 text-sm">{university.admissionRequirements}</p>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 mb-2">Scholarship Available</p>
                                <p className="text-gray-700 text-sm">{university.scholarshipAvailable}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-0 shadow-lg">
                  <CardContent className="text-center py-16">
                    <GraduationCap className="w-24 h-24 text-gray-400 mx-auto mb-6" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">No University Data Available</h3>
                    <p className="text-gray-600">University recommendations will appear here once your analysis is complete.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Scholarships Tab */}
          <TabsContent value="scholarships" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
                <CardTitle className="flex items-center space-x-3">
                  <Award className="w-6 h-6 text-green-600" />
                  <span>Scholarship Matching System</span>
                </CardTitle>
                <CardDescription>
                  Personalized scholarship opportunities based on your profile and target destinations
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {analysis.recommendations?.budgetOptimization?.scholarshipOpportunities?.length > 0 ? (
                  <div className="grid gap-6">
                    {analysis.recommendations.budgetOptimization.scholarshipOpportunities.map((scholarship: string, index: number) => (
                      <div key={index} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-bold text-gray-900 mb-2">Scholarship Opportunity</h4>
                            <p className="text-gray-700">{scholarship}</p>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Eligible
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Scholarship Analysis Coming Soon</h3>
                    <p className="text-gray-600">Detailed scholarship matching will be available in your comprehensive analysis.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid gap-6">
              {/* Quarterly Action Plan */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                  <CardTitle className="flex items-center space-x-3">
                    <Calendar className="w-6 h-6 text-purple-600" />
                    <span>Quarterly Action Plan</span>
                  </CardTitle>
                  <CardDescription>
                    Strategic timeline aligned with university admission cycles
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-8">
                    {/* Immediate Actions */}
                    {analysis.recommendations?.nextSteps?.immediate?.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Clock className="w-5 h-5 mr-2 text-red-600" />
                          Immediate Actions (Next 30 Days)
                        </h4>
                        <ul className="space-y-3">
                          {analysis.recommendations.nextSteps.immediate.map((action: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                                {index + 1}
                              </div>
                              <span className="text-gray-700">{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Short Term Goals */}
                    {analysis.recommendations?.nextSteps?.shortTerm?.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Target className="w-5 h-5 mr-2 text-blue-600" />
                          Short Term Goals (3-6 Months)
                        </h4>
                        <ul className="space-y-3">
                          {analysis.recommendations.nextSteps.shortTerm.map((goal: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                                {index + 1}
                              </div>
                              <span className="text-gray-700">{goal}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Long Term Strategy */}
                    {analysis.recommendations?.nextSteps?.longTerm?.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                          Long Term Strategy (6+ Months)
                        </h4>
                        <ul className="space-y-3">
                          {analysis.recommendations.nextSteps.longTerm.map((strategy: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                                {index + 1}
                              </div>
                              <span className="text-gray-700">{strategy}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Strategic Insights */}
              {analysis.recommendations?.personalizedInsights && (
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 border-b">
                    <CardTitle className="flex items-center space-x-3">
                      <Users className="w-6 h-6 text-blue-600" />
                      <span>Strategic Profile Insights</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Strengths */}
                      {analysis.recommendations.personalizedInsights.strengthsAnalysis?.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                            Your Strengths
                          </h4>
                          <ul className="space-y-2">
                            {analysis.recommendations.personalizedInsights.strengthsAnalysis.map((strength: string, index: number) => (
                              <li key={index} className="flex items-start">
                                <Star className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                                <span className="text-gray-700">{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Improvement Areas */}
                      {analysis.recommendations.personalizedInsights.improvementAreas?.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                            Growth Opportunities
                          </h4>
                          <ul className="space-y-2">
                            {analysis.recommendations.personalizedInsights.improvementAreas.map((area: string, index: number) => (
                              <li key={index} className="flex items-start">
                                <Target className="w-4 h-4 text-blue-500 mt-1 mr-2 flex-shrink-0" />
                                <span className="text-gray-700">{area}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Disclaimer */}
        <Card className="mt-12 border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-900 mb-2">Professional Disclaimer</h4>
                <p className="text-amber-800 text-sm leading-relaxed">
                  This analysis is generated using AI technology and provides general guidance based on available data. 
                  For making final decisions about your study abroad journey, we strongly recommend consulting with 
                  licensed education counselors and migration agents who can provide personalized advice based on 
                  current regulations and your specific circumstances.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}