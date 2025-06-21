import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, GraduationCap, DollarSign, Calendar, AlertTriangle, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CountryRecommendation {
  country: string;
  countryCode: string;
  matchScore: number;
  ranking: number;
  personalizedReasons: string[];
  specificAdvantages?: string[];
  potentialChallenges?: string[];
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

interface DestinationSuggestion {
  id: number;
  userId: number;
  suggestedCountries: CountryRecommendation[];
  matchScore: number;
  reasoning: string;
  keyFactors: string[];
  intelligentAlternatives?: any[];
  pathwayPrograms?: any[];
  disclaimer?: string;
  recommendations: any;
  createdAt: string;
}

export default function DestinationSuggestionDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const { data: suggestion, isLoading, error } = useQuery<DestinationSuggestion>({
    queryKey: ['/api/destination-suggestions', id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your destination analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !suggestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Not Found</h2>
          <p className="text-gray-600 mb-4">The destination analysis you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation('/destination-suggestions')}>
            Back to Analysis
          </Button>
        </div>
      </div>
    );
  }

  const getOverallMatch = () => {
    if (suggestion.matchScore) {
      return `${suggestion.matchScore}%`;
    }
    return "N/A%";
  };

  const getFormattedDate = () => {
    try {
      const date = new Date(suggestion.createdAt);
      if (isNaN(date.getTime())) {
        return "Recent";
      }
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return "Recent";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/destination-suggestions')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Analysis</span>
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Study Destination Analysis</h1>
                <p className="text-sm text-gray-500">Generated on {getFormattedDate()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Overall Match</div>
                <div className="text-2xl font-bold text-blue-600">{getOverallMatch()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Executive Summary */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-6 h-6 text-blue-600" />
              <CardTitle className="text-2xl">Executive Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              {suggestion.reasoning || "Comprehensive analysis completed based on your academic profile, financial situation, and study preferences."}
            </p>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="countries" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="countries">Recommended Countries</TabsTrigger>
            <TabsTrigger value="universities">Target Universities</TabsTrigger>
            <TabsTrigger value="scholarships">Scholarship Matching</TabsTrigger>
            <TabsTrigger value="action-plan">Quarterly Action Plan</TabsTrigger>
          </TabsList>

          {/* Recommended Countries Tab */}
          <TabsContent value="countries" className="space-y-6">
            <div className="grid gap-6">
              {suggestion.suggestedCountries && suggestion.suggestedCountries.length > 0 ? (
                suggestion.suggestedCountries.map((country: CountryRecommendation, index: number) => (
                  <Card key={index} className="overflow-hidden">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-6 h-6 text-blue-600" />
                          <div>
                            <CardTitle className="text-xl">{country.country}</CardTitle>
                            <CardDescription>
                              Match Score: {country.matchScore}%
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-lg px-3 py-1">
                          #{country.ranking}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Personalized Reasons */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-900 mb-2">Why This Match?</h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            {country.personalizedReasons?.map((reason: string, i: number) => (
                              <li key={i} className="flex items-start">
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Career Pathway */}
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-green-900 mb-2">Career Prospects</h4>
                          <div className="text-sm text-green-800 space-y-2">
                            <div><strong>Industry Demand:</strong> {country.careerPathway?.industryDemand}</div>
                            <div><strong>Starting Salary:</strong> {country.careerPathway?.salaryExpectations}</div>
                            <div><strong>Career Growth:</strong> {country.careerPathway?.careerProgression}</div>
                            <div><strong>ROI:</strong> {country.careerPathway?.returnOnInvestment}</div>
                          </div>
                        </div>

                        {/* Visa & Work Rights */}
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-purple-900 mb-2">Visa & Work Rights</h4>
                          <div className="text-sm text-purple-800 space-y-2">
                            <div><strong>Work Rights:</strong> {country.personalizedVisaGuidance?.workRights}</div>
                            <div><strong>Success Rate:</strong> {country.personalizedVisaGuidance?.successRate}</div>
                            <div><strong>Processing Time:</strong> {country.personalizedVisaGuidance?.timelineForUser}</div>
                            <div><strong>Post-Study:</strong> {country.personalizedVisaGuidance?.postStudyOptions}</div>
                          </div>
                        </div>
                      </div>

                      {/* Cost Breakdown */}
                      {country.detailedCostBreakdown && (
                        <div className="mt-6">
                          <h4 className="font-semibold text-gray-900 mb-3">Cost Breakdown</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-gray-50 p-3 rounded-lg text-center">
                              <div className="text-sm text-gray-600">Tuition (Masters)</div>
                              <div className="font-semibold text-gray-900">{country.detailedCostBreakdown.tuitionFees?.masters}</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg text-center">
                              <div className="text-sm text-gray-600">Living Costs</div>
                              <div className="font-semibold text-gray-900">{country.detailedCostBreakdown.livingExpenses?.totalMonthly}</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg text-center">
                              <div className="text-sm text-gray-600">Work Earnings</div>
                              <div className="font-semibold text-gray-900">{country.detailedCostBreakdown.workStudyEarnings}</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg text-center">
                              <div className="text-sm text-gray-600">Scholarship Potential</div>
                              <div className="font-semibold text-gray-900">{country.detailedCostBreakdown.scholarshipPotential}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Country Recommendations Available</h3>
                    <p className="text-gray-600 mb-4">Please generate a new analysis to receive personalized country recommendations.</p>
                    <Button onClick={() => setLocation('/destination-suggestions')}>
                      Generate New Analysis
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Target Universities Tab */}
          <TabsContent value="universities" className="space-y-6">
            <div className="grid gap-6">
              {suggestion.suggestedCountries && suggestion.suggestedCountries.length > 0 ? (
                suggestion.suggestedCountries.map((country: CountryRecommendation, countryIndex: number) => (
                  <Card key={countryIndex}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <GraduationCap className="w-5 h-5 text-blue-600" />
                        <span>Universities in {country.country}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {country.targetedUniversities?.map((university, uniIndex: number) => (
                          <div key={uniIndex} className="border rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-2">{university.name}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600 font-medium">Program: </span>
                                <span className="text-gray-800">{university.programSpecific}</span>
                              </div>
                              <div>
                                <span className="text-gray-600 font-medium">Ranking: </span>
                                <span className="text-gray-800">{university.ranking}</span>
                              </div>
                              <div>
                                <span className="text-gray-600 font-medium">Scholarship: </span>
                                <span className="text-gray-800">{university.scholarshipAvailable}</span>
                              </div>
                              <div>
                                <span className="text-gray-600 font-medium">Requirements: </span>
                                <span className="text-gray-800">{university.admissionRequirements}</span>
                              </div>
                            </div>
                          </div>
                        )) || (
                          <div className="text-center py-8">
                            <p className="text-gray-600">University information will be displayed here.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No University Information Available</h3>
                    <p className="text-gray-600">University recommendations will appear after generating country analysis.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Scholarship Matching Tab */}
          <TabsContent value="scholarships" className="space-y-6">
            <div className="grid gap-6">
              {suggestion.suggestedCountries && suggestion.suggestedCountries.length > 0 ? (
                suggestion.suggestedCountries.map((country: CountryRecommendation, index: number) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <span>Scholarship Opportunities in {country.country}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-2">Scholarship Potential</h4>
                        <div className="text-lg font-bold text-green-800 mb-2">
                          {country.detailedCostBreakdown?.scholarshipPotential}
                        </div>
                        <div className="space-y-2 text-sm text-green-700">
                          {country.targetedUniversities?.map((uni, idx) => (
                            <div key={idx}>
                              <strong>{uni.name}:</strong> {uni.scholarshipAvailable}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Scholarship Information</h3>
                    <p className="text-gray-600">Scholarship opportunities will be displayed after generating analysis.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Quarterly Action Plan Tab */}
          <TabsContent value="action-plan" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Quarterly Action Plan</h3>
                  <p className="text-gray-600 mb-6">Strategic timeline aligned with university admission cycles</p>
                  
                  <div className="grid gap-4 max-w-4xl mx-auto">
                    <div className="bg-purple-50 p-4 rounded-lg text-left">
                      <h4 className="font-semibold text-purple-900 mb-2">Q1: Foundation & Preparation</h4>
                      <ul className="text-sm text-purple-800 space-y-1">
                        <li>• Complete standardized tests (IELTS/TOEFL, GRE/GMAT if required)</li>
                        <li>• Research and shortlist target universities and programs</li>
                        <li>• Begin scholarship research and application preparation</li>
                        <li>• Organize academic transcripts and recommendation letters</li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg text-left">
                      <h4 className="font-semibold text-blue-900 mb-2">Q2: Application Submission</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Submit university applications for next intake</li>
                        <li>• Apply for scholarships and financial aid</li>
                        <li>• Prepare and submit visa documentation</li>
                        <li>• Attend university interviews (if required)</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg text-left">
                      <h4 className="font-semibold text-green-900 mb-2">Q3: Decision & Finalization</h4>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>• Review and compare admission offers</li>
                        <li>• Finalize university selection and accept offer</li>
                        <li>• Complete visa application process</li>
                        <li>• Arrange accommodation and travel plans</li>
                      </ul>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg text-left">
                      <h4 className="font-semibold text-orange-900 mb-2">Q4: Pre-Departure Preparation</h4>
                      <ul className="text-sm text-orange-800 space-y-1">
                        <li>• Complete pre-departure orientation programs</li>
                        <li>• Finalize financial arrangements and funding</li>
                        <li>• Prepare for cultural adaptation and academic transition</li>
                        <li>• Network with current students and alumni</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Professional Disclaimer */}
        <Card className="mt-8 border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">Professional Disclaimer</h3>
                <p className="text-yellow-800 text-sm leading-relaxed">
                  {suggestion.disclaimer || "This AI-generated analysis is for informational purposes only. Please consult with licensed education counsellors and migration agents for personalized advice. We recommend verifying all information with official sources before making any decisions."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="mt-8">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Expert Guidance Today</h3>
                <p className="text-gray-600 mb-4">Need personalized consultation on your study abroad journey?</p>
                <Button onClick={() => setLocation('/consultations')} className="bg-blue-600 hover:bg-blue-700">
                  Book Consultation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}