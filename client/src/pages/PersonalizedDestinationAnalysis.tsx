import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, GraduationCap, DollarSign, Calendar, AlertTriangle, Users, TrendingUp, Globe, CheckCircle, Clock, Star, Award, BookOpen, Briefcase, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-6 text-lg text-gray-700 font-medium">Loading your personalized destination analysis...</p>
          <p className="mt-2 text-sm text-gray-500">Preparing comprehensive country recommendations</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Not Found</h2>
          <p className="text-gray-600 mb-6">The destination analysis you're looking for doesn't exist or may have been removed.</p>
          <Button onClick={() => setLocation('/destination-suggestions')} className="bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Analysis Hub
          </Button>
        </div>
      </div>
    );
  }

  const getOverallMatch = () => {
    if (analysis.matchScore) {
      return analysis.matchScore;
    }
    return 0;
  };

  const getFormattedDate = () => {
    try {
      const date = new Date(analysis.createdAt);
      if (isNaN(date.getTime())) {
        return "Recent Analysis";
      }
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return "Recent Analysis";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 80) return "text-blue-600 bg-blue-100";
    if (score >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent Match";
    if (score >= 80) return "Strong Match";
    if (score >= 70) return "Good Match";
    return "Consider Alternatives";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Enhanced Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/destination-suggestions')}
                className="flex items-center space-x-2 hover:bg-blue-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Hub</span>
              </Button>
              <div className="h-8 w-px bg-gray-300" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Globe className="w-6 h-6 mr-3 text-blue-600" />
                  Personalized Study Destination Analysis
                </h1>
                <p className="text-sm text-gray-500 mt-1">Generated on {getFormattedDate()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-sm text-gray-500 font-medium">Overall Compatibility</div>
                <div className={`text-3xl font-bold ${getScoreColor(getOverallMatch()).split(' ')[0]}`}>
                  {getOverallMatch()}%
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${getScoreColor(getOverallMatch())}`}>
                  {getScoreLabel(getOverallMatch())}
                </div>
              </div>
              <div className="w-16 h-16">
                <Progress value={getOverallMatch()} className="w-full h-2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Executive Summary */}
        <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <Target className="w-8 h-8" />
              <div>
                <CardTitle className="text-2xl font-bold">Executive Summary</CardTitle>
                <CardDescription className="text-blue-100 mt-1">
                  Comprehensive analysis based on your academic profile and career goals
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed text-blue-50">
              {analysis.reasoning || "We've analyzed your complete academic profile, financial situation, and career aspirations to provide personalized study destination recommendations. Each country has been evaluated using our comprehensive matching algorithm that considers academic fit, financial viability, visa success rates, and long-term career prospects."}
            </p>
            {analysis.keyFactors && analysis.keyFactors.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-blue-100 mb-3">Key Analysis Factors:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysis.keyFactors.map((factor: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-300 mt-0.5 flex-shrink-0" />
                      <span className="text-blue-50">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Tabs */}
        <Tabs defaultValue="countries" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 h-14 bg-white shadow-md rounded-xl">
            <TabsTrigger value="countries" className="flex items-center space-x-2 text-sm font-medium">
              <MapPin className="w-4 h-4" />
              <span>Country Matches</span>
            </TabsTrigger>
            <TabsTrigger value="universities" className="flex items-center space-x-2 text-sm font-medium">
              <GraduationCap className="w-4 h-4" />
              <span>Universities</span>
            </TabsTrigger>
            <TabsTrigger value="scholarships" className="flex items-center space-x-2 text-sm font-medium">
              <Award className="w-4 h-4" />
              <span>Scholarships</span>
            </TabsTrigger>
            <TabsTrigger value="action-plan" className="flex items-center space-x-2 text-sm font-medium">
              <Calendar className="w-4 h-4" />
              <span>Action Plan</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center space-x-2 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              <span>Insights</span>
            </TabsTrigger>
          </TabsList>

          {/* Country Matches Tab */}
          <TabsContent value="countries" className="space-y-6">
            <div className="grid gap-8">
              {analysis.suggestedCountries && analysis.suggestedCountries.length > 0 ? (
                analysis.suggestedCountries.map((country: CountryRecommendation, index: number) => (
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
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        {/* Personalized Match Reasons */}
                        <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
                          <h4 className="font-bold text-blue-900 mb-3 flex items-center">
                            <Target className="w-5 h-5 mr-2" />
                            Why This Match?
                          </h4>
                          <ul className="space-y-2">
                            {country.personalizedReasons?.map((reason: string, i: number) => (
                              <li key={i} className="flex items-start text-sm text-blue-800">
                                <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Career Prospects */}
                        <div className="bg-green-50 p-5 rounded-xl border border-green-200">
                          <h4 className="font-bold text-green-900 mb-3 flex items-center">
                            <Briefcase className="w-5 h-5 mr-2" />
                            Career Prospects
                          </h4>
                          <div className="space-y-2 text-sm text-green-800">
                            <div><strong>Industry Demand:</strong> {country.careerPathway?.industryDemand}</div>
                            <div><strong>Salary Range:</strong> {country.careerPathway?.salaryExpectations}</div>
                            <div><strong>Career Growth:</strong> {country.careerPathway?.careerProgression}</div>
                            <div><strong>ROI:</strong> {country.careerPathway?.returnOnInvestment}</div>
                          </div>
                        </div>

                        {/* Visa & Immigration */}
                        <div className="bg-purple-50 p-5 rounded-xl border border-purple-200">
                          <h4 className="font-bold text-purple-900 mb-3 flex items-center">
                            <Globe className="w-5 h-5 mr-2" />
                            Visa & Work Rights
                          </h4>
                          <div className="space-y-2 text-sm text-purple-800">
                            <div><strong>Work Rights:</strong> {country.personalizedVisaGuidance?.workRights}</div>
                            <div><strong>Success Rate:</strong> {country.personalizedVisaGuidance?.successRate}</div>
                            <div><strong>Processing:</strong> {country.personalizedVisaGuidance?.timelineForUser}</div>
                            <div><strong>Post-Study:</strong> {country.personalizedVisaGuidance?.postStudyOptions}</div>
                          </div>
                        </div>
                      </div>

                      {/* Financial Breakdown */}
                      {country.detailedCostBreakdown && (
                        <div className="bg-gray-50 p-5 rounded-xl border">
                          <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                            <DollarSign className="w-5 h-5 mr-2" />
                            Complete Financial Breakdown
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-lg border text-center">
                              <div className="text-xs text-gray-600 mb-1">Masters Tuition</div>
                              <div className="font-bold text-gray-900">{country.detailedCostBreakdown.tuitionFees?.masters}</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border text-center">
                              <div className="text-xs text-gray-600 mb-1">Monthly Living</div>
                              <div className="font-bold text-gray-900">{country.detailedCostBreakdown.livingExpenses?.totalMonthly}</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border text-center">
                              <div className="text-xs text-gray-600 mb-1">Work Earnings</div>
                              <div className="font-bold text-green-600">{country.detailedCostBreakdown.workStudyEarnings}</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border text-center">
                              <div className="text-xs text-gray-600 mb-1">Scholarship Potential</div>
                              <div className="font-bold text-blue-600">{country.detailedCostBreakdown.scholarshipPotential}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Advantages & Challenges */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        {country.specificAdvantages && (
                          <div>
                            <h5 className="font-semibold text-green-800 mb-2 flex items-center">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Key Advantages
                            </h5>
                            <ul className="space-y-1 text-sm text-green-700">
                              {country.specificAdvantages.map((advantage: string, i: number) => (
                                <li key={i} className="flex items-start">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                                  {advantage}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {country.potentialChallenges && (
                          <div>
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
              {analysis.suggestedCountries && analysis.suggestedCountries.length > 0 ? (
                analysis.suggestedCountries.map((country: CountryRecommendation, countryIndex: number) => (
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
                                <p className="text-sm text-gray-600 flex items-center">
                                  <Star className="w-4 h-4 mr-1" />
                                  {university.ranking}
                                </p>
                              </div>
                              <Badge className="bg-blue-100 text-blue-800">Recommended</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <span className="text-blue-800 font-medium block mb-1">Program</span>
                                <span className="text-blue-700">{university.programSpecific}</span>
                              </div>
                              <div className="bg-green-50 p-3 rounded-lg">
                                <span className="text-green-800 font-medium block mb-1">Scholarship</span>
                                <span className="text-green-700">{university.scholarshipAvailable}</span>
                              </div>
                              <div className="bg-purple-50 p-3 rounded-lg">
                                <span className="text-purple-800 font-medium block mb-1">Requirements</span>
                                <span className="text-purple-700">{university.admissionRequirements}</span>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <span className="text-gray-800 font-medium block mb-1">Application</span>
                                <span className="text-gray-700">Apply directly or through portal</span>
                              </div>
                            </div>
                          </div>
                        )) || (
                          <div className="text-center py-8">
                            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600">University recommendations will be displayed here after analysis generation.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-0 shadow-lg">
                  <CardContent className="text-center py-16">
                    <GraduationCap className="w-24 h-24 text-gray-400 mx-auto mb-6" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">No University Information Available</h3>
                    <p className="text-gray-600">University recommendations will appear after generating country analysis.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Scholarships Tab */}
          <TabsContent value="scholarships" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <Award className="w-6 h-6 text-yellow-600" />
                  <span>Scholarship Opportunities</span>
                </CardTitle>
                <CardDescription>
                  Scholarships matched to your profile and academic achievements
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {analysis.recommendations?.budgetOptimization?.scholarshipOpportunities && 
                 analysis.recommendations.budgetOptimization.scholarshipOpportunities.length > 0 ? (
                  <div className="grid gap-4">
                    {analysis.recommendations.budgetOptimization.scholarshipOpportunities.map((scholarship: string, index: number) => (
                      <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-3">
                          <Award className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-gray-800 leading-relaxed">{scholarship}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Scholarship Matching Coming Soon</h3>
                    <p className="text-gray-600">Personalized scholarship recommendations will be available after generating your analysis.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Action Plan Tab */}
          <TabsContent value="action-plan" className="space-y-6">
            <div className="grid gap-6">
              {analysis.recommendations?.nextSteps && (
                <>
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-red-50 border-b">
                      <CardTitle className="flex items-center space-x-3 text-red-800">
                        <Clock className="w-6 h-6" />
                        <span>Immediate Actions (Next 30 Days)</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        {analysis.recommendations.nextSteps.immediate?.map((action: string, index: number) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-red-600">{index + 1}</span>
                            </div>
                            <p className="text-red-800">{action}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-yellow-50 border-b">
                      <CardTitle className="flex items-center space-x-3 text-yellow-800">
                        <Calendar className="w-6 h-6" />
                        <span>Short-term Goals (Next 3-6 Months)</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        {analysis.recommendations.nextSteps.shortTerm?.map((action: string, index: number) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                            <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-yellow-600">{index + 1}</span>
                            </div>
                            <p className="text-yellow-800">{action}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-green-50 border-b">
                      <CardTitle className="flex items-center space-x-3 text-green-800">
                        <Target className="w-6 h-6" />
                        <span>Long-term Strategy (6-12 Months)</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        {analysis.recommendations.nextSteps.longTerm?.map((action: string, index: number) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-green-600">{index + 1}</span>
                            </div>
                            <p className="text-green-800">{action}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid gap-6">
              {analysis.recommendations?.personalizedInsights && (
                <>
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-green-50 border-b">
                      <CardTitle className="flex items-center space-x-3 text-green-800">
                        <CheckCircle className="w-6 h-6" />
                        <span>Your Profile Strengths</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        {analysis.recommendations.personalizedInsights.strengthsAnalysis?.map((strength: string, index: number) => (
                          <div key={index} className="flex items-start space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                            <p className="text-green-800">{strength}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-blue-50 border-b">
                      <CardTitle className="flex items-center space-x-3 text-blue-800">
                        <TrendingUp className="w-6 h-6" />
                        <span>Strategic Recommendations</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        {analysis.recommendations.personalizedInsights.strategicRecommendations?.map((recommendation: string, index: number) => (
                          <div key={index} className="flex items-start space-x-3">
                            <TrendingUp className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                            <p className="text-blue-800">{recommendation}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {analysis.recommendations.personalizedInsights.improvementAreas && 
                   analysis.recommendations.personalizedInsights.improvementAreas.length > 0 && (
                    <Card className="border-0 shadow-lg">
                      <CardHeader className="bg-amber-50 border-b">
                        <CardTitle className="flex items-center space-x-3 text-amber-800">
                          <AlertTriangle className="w-6 h-6" />
                          <span>Areas for Enhancement</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          {analysis.recommendations.personalizedInsights.improvementAreas.map((area: string, index: number) => (
                            <div key={index} className="flex items-start space-x-3">
                              <AlertTriangle className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                              <p className="text-amber-800">{area}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {/* Intelligent Alternatives */}
              {analysis.intelligentAlternatives && analysis.intelligentAlternatives.length > 0 && (
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-purple-50 border-b">
                    <CardTitle className="flex items-center space-x-3 text-purple-800">
                      <Globe className="w-6 h-6" />
                      <span>Smart Alternative Destinations</span>
                    </CardTitle>
                    <CardDescription>
                      Countries that might offer better opportunities than your initial preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid gap-4">
                      {analysis.intelligentAlternatives.map((alternative: IntelligentAlternative, index: number) => (
                        <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-lg text-gray-900">{alternative.country}</h4>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700">
                              {alternative.matchScore}% Match
                            </Badge>
                          </div>
                          <p className="text-gray-700 mb-3">{alternative.whyBetter}</p>
                          {alternative.costAdvantage && (
                            <p className="text-sm text-green-600 font-medium mb-2">{alternative.costAdvantage}</p>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {alternative.keyBenefits?.map((benefit: string, benefitIndex: number) => (
                              <Badge key={benefitIndex} variant="secondary" className="text-xs">
                                {benefit}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Professional Disclaimer */}
        <Card className="mt-8 border-0 shadow-lg bg-gradient-to-r from-amber-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-800 mb-2">Professional Consultation Recommended</h4>
                <p className="text-amber-700 text-sm leading-relaxed">
                  This analysis is for informational purposes only. We strongly recommend consulting with licensed education counselors, 
                  migration agents, and university admission advisors before making final decisions. Requirements, costs, and policies 
                  can change, and professional guidance ensures you have the most current and accurate information for your specific situation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}