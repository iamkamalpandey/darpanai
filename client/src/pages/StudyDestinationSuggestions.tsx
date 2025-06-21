import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { useLocation } from 'wouter';
import { 
  Globe, 
  Brain, 
  MapPin, 
  DollarSign, 
  GraduationCap,
  Clock,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Star,
  Loader2,
  Settings,
  Info
} from 'lucide-react';

interface UserStats {
  analysisCount: number;
  maxAnalyses: number;
  remainingAnalyses: number;
}

interface CountryRecommendation {
  country: string;
  countryCode: string;
  matchScore: number;
  ranking: number;
  entryOptions?: string[];
  academicFit?: {
    entryRequirements: string;
    programAlignment: string;
    intakeDeadlines: string;
  };
  financialBreakdown?: {
    tuitionRange: string;
    livingCosts: string;
    totalAnnualCost: string;
    scholarships: string;
    budgetFit: string;
  };
  languageFit?: {
    ieltsRequired: string;
    waivers: string;
    bridgingPrograms: string;
  };
  visaLandscape?: {
    successRate: string;
    processingTime: string;
    documentationComplexity: string;
    workPermit: string;
  };
  careerIntelligence?: {
    jobMarket: string;
    averageSalary: string;
    prPotential: string;
    postStudyWork: string;
  };
  uniqueAdvantages?: string[];
  risksAndRecommendations?: string[];
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
  intelligentAlternatives?: Array<{
    country: string;
    whyBetter: string;
    keyBenefits: string[];
  }>;
  actionPlan?: {
    applyTo: string[];
    required: string[];
    timeline: string[];
    optional: string[];
  };
  disclaimer?: string;
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

export default function StudyDestinationSuggestions() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user stats for aggregate usage tracking
  const { data: userStats } = useQuery<UserStats>({
    queryKey: ['/api/user/stats'],
    staleTime: 5 * 60 * 1000,
  });

  // Get profile completion status - REQUIRED for destination suggestions
  const { data: profileStatus, isLoading: profileLoading } = useQuery<{
    isComplete: boolean;
    completionPercentage: number;
    missingFields?: string[];
  }>({
    queryKey: ['/api/user/profile-completion'],
    staleTime: 1 * 60 * 1000, // Fresher data for profile status
  });

  // Get user's destination suggestions (ONLY if profile is 100% complete)
  const { data: suggestions = [], isLoading } = useQuery<DestinationSuggestion[]>({
    queryKey: ['/api/destination-suggestions'],
    staleTime: 5 * 60 * 1000,
    enabled: profileStatus?.isComplete === true && profileStatus?.completionPercentage === 100,
  });

  const generateSuggestionsMutation = useMutation({
    mutationFn: async (requestData: any) => {
      // Strict profile completion enforcement
      if (!profileStatus?.isComplete || profileStatus?.completionPercentage !== 100) {
        throw new Error(`Profile must be 100% complete to generate AI destination suggestions. Current completion: ${profileStatus?.completionPercentage || 0}%`);
      }

      // Check usage quota against aggregate analysis count
      if (userStats && userStats.analysisCount >= userStats.maxAnalyses) {
        throw new Error(`You have reached your analysis limit (${userStats.maxAnalyses}). Please upgrade your plan to continue.`);
      }

      const response = await fetch('/api/destination-suggestions/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to generate suggestions');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Suggestions Generated!",
        description: "Your personalized study destination recommendations are ready.",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/destination-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
      
      // Navigate to the new suggestion
      if (data.suggestionId) {
        setTimeout(() => {
          setLocation(`/destination-suggestions/${data.suggestionId}`);
        }, 1500);
      }
      
      setIsGenerating(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  });

  const handleGenerateSuggestions = async () => {
    setIsGenerating(true);
    
    // Basic request - can be enhanced with user preferences form
    const requestData = {
      userPreferences: {},
      additionalContext: "Please provide comprehensive destination recommendations based on my profile."
    };

    generateSuggestionsMutation.mutate(requestData);
  };

  // Check if user can generate based on aggregate usage and profile completion
  const canGenerate = userStats && userStats.remainingAnalyses > 0 && profileStatus?.isComplete && profileStatus?.completionPercentage === 100;
  const latestSuggestion = suggestions[0];

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-blue-600 bg-blue-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Show profile completion requirement if profile is incomplete
  if (profileStatus && !profileStatus.isComplete) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Profile Completion Required Alert */}
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Profile Completion Required</strong>
              <br />
              Please complete your profile to get personalized AI study destination recommendations.
              You have completed {profileStatus?.completionPercentage || 0}% of your profile.
            </AlertDescription>
          </Alert>

          {/* Profile Progress Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Complete Your Profile
              </CardTitle>
              <CardDescription>
                We need some additional information to provide accurate recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Profile Completion</span>
                  <span>{profileStatus?.completionPercentage || 0}%</span>
                </div>
                <Progress value={profileStatus?.completionPercentage || 0} className="w-full" />
              </div>
              
              {profileStatus?.missingFields && profileStatus.missingFields.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Missing Fields:</p>
                  <div className="flex flex-wrap gap-2">
                    {profileStatus?.missingFields?.map((field: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-orange-700 border-orange-200">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={() => setLocation('/profile')}
                  className="flex-1"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Complete Profile
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setLocation('/')}
                >
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Benefits of Completing Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2" />
                Why Complete Your Profile?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start space-x-3">
                  <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Personalized Recommendations</h4>
                    <p className="text-sm text-muted-foreground">Get AI-powered suggestions tailored to your academic background and career goals</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Brain className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Smart Matching</h4>
                    <p className="text-sm text-muted-foreground">Advanced algorithms match you with the best study destinations based on your preferences</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <DollarSign className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Budget Optimization</h4>
                    <p className="text-sm text-muted-foreground">Find study options that fit your budget with detailed cost analysis</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <GraduationCap className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Academic Fit</h4>
                    <p className="text-sm text-muted-foreground">Discover programs and universities aligned with your field of study</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">AI Study Destination Suggestions</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get personalized AI-powered recommendations for your ideal study destinations based on your 
            preferences, goals, and profile analysis.
          </p>
        </div>

        {/* Generator Card */}
        <div className="max-w-4xl mx-auto">
          <Card className="relative overflow-hidden border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                AI-Powered
              </Badge>
            </div>
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Brain className="h-8 w-8 text-purple-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl text-purple-900 mb-2">Personalized Destination Analysis</CardTitle>
                  <CardDescription className="text-purple-700">
                    Our AI analyzes your academic background, preferences, and goals to recommend the 
                    best study destinations with detailed insights on costs, opportunities, and cultural fit.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Feature Highlights */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white rounded-lg border border-purple-100">
                  <Globe className="h-5 w-5 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm text-purple-900 mb-1">Global Analysis</h4>
                  <p className="text-xs text-purple-600">Compare top destinations worldwide with detailed rankings</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-purple-100">
                  <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm text-purple-900 mb-1">Cost Analysis</h4>
                  <p className="text-xs text-purple-600">Complete financial breakdown with scholarship opportunities</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-purple-100">
                  <Target className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm text-purple-900 mb-1">Career Prospects</h4>
                  <p className="text-xs text-purple-600">Job market analysis and growth opportunities assessment</p>
                </div>
              </div>

              {/* Usage Statistics & Quota Display */}
              <div className="bg-white rounded-lg border border-purple-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm text-purple-900">Analysis Usage (Aggregate)</h4>
                  <Badge variant="outline" className="text-purple-700 border-purple-200">
                    {userStats ? `${userStats.remainingAnalyses} remaining` : 'Loading...'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Total Analyses Used</span>
                    <span className="font-medium">{userStats?.analysisCount || 0} / {userStats?.maxAnalyses || 0}</span>
                  </div>
                  <Progress 
                    value={userStats ? (userStats.analysisCount / userStats.maxAnalyses) * 100 : 0} 
                    className="w-full h-2" 
                  />
                  <p className="text-xs text-gray-500">
                    Includes all document analyses (Visa, COE, Offer Letter) and AI destination suggestions
                  </p>
                </div>
              </div>

              {/* Quota Warning */}
              {!canGenerate && userStats && userStats.remainingAnalyses <= 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>Analysis Quota Reached:</strong> You have used all {userStats.maxAnalyses} available analyses. 
                    Contact support to increase your quota.
                  </AlertDescription>
                </Alert>
              )}

              {/* Status Display */}
              {isGenerating && (
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 text-purple-600">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm font-medium">AI is analyzing your profile and generating personalized recommendations...</span>
                  </div>
                  <Progress value={75} className="w-full h-3" />
                  <p className="text-xs text-gray-600">This may take up to 60 seconds</p>
                </div>
              )}

              {/* Generate Button */}
              <div className="pt-2 space-y-3">
                <Button
                  onClick={handleGenerateSuggestions}
                  disabled={!canGenerate || isGenerating}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-400"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Generating Recommendations...
                    </>
                  ) : (
                    <>
                      <Brain className="h-5 w-5 mr-2" />
                      Generate AI Destination Suggestions
                    </>
                  )}
                </Button>
                
                {/* Button Status Info */}
                {!canGenerate && !isGenerating && (
                  <div className="text-center space-y-1">
                    {!profileStatus?.isComplete ? (
                      <p className="text-xs text-red-600">
                        Profile must be 100% complete to generate suggestions
                      </p>
                    ) : userStats?.remainingAnalyses === 0 ? (
                      <p className="text-xs text-red-600">
                        Analysis quota exceeded. Contact support to upgrade.
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Latest Suggestion Preview */}
        {latestSuggestion && (
          <Card className="shadow-lg max-w-6xl mx-auto">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Star className="h-5 w-5 text-purple-600" />
                    Latest AI Recommendations
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {latestSuggestion.reasoning}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <Badge className={`px-3 py-1 ${getMatchScoreColor(latestSuggestion.matchScore)}`}>
                    {latestSuggestion.matchScore}% Match
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(latestSuggestion.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              <Tabs defaultValue="countries" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="countries">Top Countries</TabsTrigger>
                  <TabsTrigger value="alternatives">Smart Alternatives</TabsTrigger>
                  <TabsTrigger value="insights">Insights</TabsTrigger>
                  <TabsTrigger value="budget">Budget</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>
                
                <TabsContent value="countries" className="space-y-4">
                  <div className="grid gap-4">
                    {(latestSuggestion.suggestedCountries || []).slice(0, 3).map((country, index) => (
                      <Card key={index} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-bold text-blue-600">#{country.ranking}</span>
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{country.country}</h3>
                                <p className="text-sm text-gray-600">{country.financialBreakdown?.totalAnnualCost || country.estimatedCosts?.totalAnnualCost || 'Cost not specified'}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className={getMatchScoreColor(country.matchScore)}>
                              {Math.round(country.matchScore * 10)}% Match
                            </Badge>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <h4 className="font-medium text-green-700 mb-1">Advantages</h4>
                              <ul className="space-y-1">
                                {(country.uniqueAdvantages || country.advantages || []).slice(0, 2).map((advantage, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">{advantage}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-medium text-blue-700 mb-1">Top Universities</h4>
                              <ul className="space-y-1">
                                {((country.topUniversities as string[]) || []).slice(0, 2).map((university, i) => (
                                  <li key={i} className="text-gray-700">• {university}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="text-center pt-4">
                    <Button
                      onClick={() => setLocation(`/destination-suggestions/${latestSuggestion.id}`)}
                      variant="outline"
                      className="w-full"
                    >
                      View Complete Analysis
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="alternatives" className="space-y-4">
                  {latestSuggestion.intelligentAlternatives && latestSuggestion.intelligentAlternatives.length > 0 ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">🎯 Smart Alternative Destinations</h3>
                        <p className="text-sm text-gray-600">AI-recommended alternatives that might be better matches for your profile</p>
                      </div>
                      
                      <div className="grid gap-4">
                        {(latestSuggestion.intelligentAlternatives || []).map((alternative: any, index: number) => (
                          <Card key={index} className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                  <Target className="h-4 w-4 text-orange-600" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-lg text-orange-900 mb-2">{alternative.country}</h4>
                                  <p className="text-sm text-orange-800 mb-3">{alternative.whyBetter}</p>
                                  
                                  <div className="space-y-2">
                                    <h5 className="font-medium text-orange-700">Key Benefits:</h5>
                                    <ul className="space-y-1">
                                      {(alternative.keyBenefits || []).map((benefit: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2">
                                          <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                          <span className="text-sm text-gray-700">{benefit}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-600">No intelligent alternatives identified for your current recommendations.</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="insights" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Your Strengths
                      </h3>
                      <ul className="space-y-2">
                        {(latestSuggestion.recommendations?.personalizedInsights?.strengthsAnalysis || []).map((strength: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Strategic Recommendations
                      </h3>
                      <ul className="space-y-2">
                        {(latestSuggestion.recommendations?.personalizedInsights?.strategicRecommendations || []).map((rec: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="budget" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Cost-Saving Strategies
                      </h3>
                      <ul className="space-y-2">
                        {(latestSuggestion.recommendations?.budgetOptimization?.costSavingStrategies || []).map((strategy: any, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{strategy}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Scholarship Opportunities
                      </h3>
                      <ul className="space-y-2">
                        {(latestSuggestion.recommendations?.budgetOptimization?.scholarshipOpportunities || []).map((scholarship: any, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <Star className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{scholarship}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="timeline" className="space-y-4">
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Clock className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-blue-700 mb-2">Preparation</h3>
                        <p className="text-sm text-gray-600">{latestSuggestion.recommendations?.timeline?.preparation || 'Not specified'}</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <GraduationCap className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-green-700 mb-2">Application</h3>
                        <p className="text-sm text-gray-600">{latestSuggestion.recommendations?.timeline?.application || 'Not specified'}</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Target className="h-6 w-6 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-purple-700 mb-2">Decision Making</h3>
                        <p className="text-sm text-gray-600">{latestSuggestion.recommendations?.timeline?.decisionMaking || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Usage Stats & All Suggestions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Usage Stats */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gray-50 rounded-t-lg">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5" />
                Usage Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {userStats ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Suggestions Generated</span>
                    <span className="text-2xl font-bold text-purple-600">{suggestions.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Total Analyses</span>
                    <span className="text-2xl font-bold text-gray-900">{userStats.analysisCount}</span>
                  </div>
                  <Progress 
                    value={(userStats.analysisCount / userStats.maxAnalyses) * 100} 
                    className="w-full h-3"
                  />
                  <div className="text-center">
                    <Badge variant={userStats.remainingAnalyses <= 0 ? "destructive" : "secondary"}>
                      {userStats.remainingAnalyses} remaining
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* All Suggestions */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gray-50 rounded-t-lg">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Previous Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : suggestions.length > 0 ? (
                <div className="space-y-4">
                  {suggestions.slice(0, 3).map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-all"
                      onClick={() => setLocation(`/destination-suggestions/${suggestion.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Brain className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {suggestion.suggestedCountries.length} Countries Analyzed
                          </p>
                          <p className="text-sm text-gray-600">
                            Top: {suggestion.suggestedCountries[0]?.country || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={getMatchScoreColor(suggestion.matchScore)}>
                          {suggestion.matchScore}% Match
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(suggestion.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No suggestions generated yet</p>
                  <p className="text-sm">Generate your first AI-powered recommendations above</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Professional Disclaimer */}
        <Card className="max-w-6xl mx-auto border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              Important Professional Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-sm text-amber-900">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">📋 Information Purpose Only</h4>
                <p className="mb-3">
                  These AI-generated destination suggestions are for informational purposes only and should not be 
                  considered as professional advice for your final study abroad decisions.
                </p>
                
                <h4 className="font-semibold mb-2">🎓 Professional Consultation Required</h4>
                <p>
                  Always consult with licensed education counsellors, migration agents, and academic advisors 
                  before making final decisions about study destinations, university applications, and visa processes.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">⚖️ Liability Limitation</h4>
                <p className="mb-3">
                  Darpan Intelligence and its analysis tools are not responsible for any financial, academic, 
                  or other losses that may result from decisions based on these recommendations.
                </p>
                
                <h4 className="font-semibold mb-2">🔄 Dynamic Information</h4>
                <p>
                  University requirements, visa policies, scholarship availability, and costs change frequently. 
                  Always verify current information with official sources before proceeding.
                </p>
              </div>
            </div>
            
            <div className="border-t border-amber-200 pt-4 mt-4">
              <p className="text-center font-medium">
                Use these suggestions as a starting point for your research, but make informed decisions with professional guidance.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}