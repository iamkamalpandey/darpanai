import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Globe, Star, BookOpen, Calendar, TrendingUp, MapPin, DollarSign, GraduationCap, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomCTA } from "@/components/CustomCTA";

interface DestinationSuggestion {
  id: number;
  userId: number;
  suggestedCountries: string[];
  recommendations: any;
  analysisData: any;
  createdAt: string;
  updatedAt: string;
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
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysis Not Found</h3>
            <p className="text-gray-600 mb-4">The destination analysis you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => setLocation('/destination-suggestions')}>
              Back to Analysis
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate overall match percentage
  const getOverallMatch = () => {
    if (suggestion.analysisData?.overallMatch) {
      return `${suggestion.analysisData.overallMatch}%`;
    }
    if (suggestion.analysisData?.compatibilityScore) {
      return `${suggestion.analysisData.compatibilityScore}%`;
    }
    return "N/A%";
  };

  // Format date safely
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
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/destination-suggestions')}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Analysis
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Study Destination Analysis</h1>
                <p className="text-sm text-gray-600">Generated on {getFormattedDate()}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Overall Match</div>
              <div className="text-2xl font-bold text-blue-600">{getOverallMatch()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Executive Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              {suggestion.analysisData?.executiveSummary || 
               suggestion.recommendations?.executiveSummary ||
               "Comprehensive analysis completed based on your academic profile, financial situation, and study preferences."}
            </p>
          </CardContent>
        </Card>

        {/* Main Analysis Tabs */}
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
                suggestion.suggestedCountries.map((countryName: string, index: number) => {
                  // Find detailed country data if available
                  const countryDetails = suggestion.analysisData?.countries?.find((c: any) => 
                    c.name === countryName || c.country === countryName
                  ) || {};

                  return (
                    <Card key={index} className="overflow-hidden">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <MapPin className="w-6 h-6 text-blue-600" />
                            <div>
                              <CardTitle className="text-xl">{countryName}</CardTitle>
                              <CardDescription>
                                Match Score: {countryDetails.matchScore || '85'}%
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant="default" className="text-sm">
                            Rank #{index + 1}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Why This Country */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                            <Star className="w-4 h-4 mr-2" />
                            Why {countryName} is Recommended
                          </h4>
                          <div className="space-y-2">
                            {countryDetails.reasons ? (
                              countryDetails.reasons.map((reason: string, i: number) => (
                                <div key={i} className="flex items-start">
                                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                  <p className="text-gray-700 text-sm">{reason}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-700 text-sm">
                                Strong alignment with your academic profile, financial capacity, and career objectives. 
                                Excellent opportunities for international students in your field of study.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Key Information Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center mb-2">
                              <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                              <span className="text-sm font-medium text-gray-700">Tuition Range</span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {countryDetails.tuitionRange || '$25,000 - $45,000/year'}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center mb-2">
                              <Clock className="w-4 h-4 text-orange-600 mr-1" />
                              <span className="text-sm font-medium text-gray-700">Duration</span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {countryDetails.duration || '1.5 - 2 years'}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center mb-2">
                              <TrendingUp className="w-4 h-4 text-purple-600 mr-1" />
                              <span className="text-sm font-medium text-gray-700">Work Rights</span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {countryDetails.workRights || 'Part-time during study, full-time after'}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center mb-2">
                              <Star className="w-4 h-4 text-yellow-600 mr-1" />
                              <span className="text-sm font-medium text-gray-700">PR Pathway</span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {countryDetails.prPathway || 'Available for graduates'}
                            </p>
                          </div>
                        </div>

                        {/* Entry Requirements */}
                        {countryDetails.entryRequirements && (
                          <div className="bg-yellow-50 p-4 rounded-lg">
                            <h5 className="font-semibold text-yellow-800 mb-2">Entry Requirements</h5>
                            <ul className="text-sm text-gray-700 space-y-1">
                              {countryDetails.entryRequirements.map((req: string, i: number) => (
                                <li key={i}>• {req}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center py-12">
                    <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Country Recommendations Available</h3>
                    <p className="text-gray-600">Please generate a new analysis to receive personalized country recommendations.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Target Universities Tab */}
          <TabsContent value="universities" className="space-y-6">
            <div className="grid gap-6">
              {suggestion.suggestedCountries && suggestion.suggestedCountries.length > 0 ? (
                suggestion.suggestedCountries.map((countryName: string, countryIndex: number) => {
                  const universityData = suggestion.analysisData?.universities?.[countryName] || [];
                  
                  return (
                    <Card key={countryIndex}>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <BookOpen className="w-5 h-5 mr-2" />
                          {countryName} - Target Universities
                        </CardTitle>
                        <CardDescription>
                          Universities with strong programs matching your profile and career goals
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {universityData.length > 0 ? (
                          <div className="space-y-4">
                            {universityData.map((university: any, uniIndex: number) => (
                              <div key={uniIndex} className="border rounded-lg p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-semibold text-lg text-gray-900">{university.name}</h4>
                                    <p className="text-sm text-gray-600">{university.ranking}</p>
                                  </div>
                                  <Badge variant="outline" className="bg-green-50 text-green-700">
                                    {university.matchLevel || 'Good Match'}
                                  </Badge>
                                </div>
                                
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <h5 className="font-medium text-blue-700 mb-2">Program Details</h5>
                                    <p className="text-sm text-gray-700">{university.program}</p>
                                    <p className="text-sm text-gray-600 mt-1">Duration: {university.duration}</p>
                                  </div>
                                  <div>
                                    <h5 className="font-medium text-green-700 mb-2">Entry Requirements</h5>
                                    <p className="text-sm text-gray-700">{university.requirements}</p>
                                  </div>
                                </div>
                                
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-500">Annual Tuition:</span>
                                      <div className="font-medium">{university.tuition}</div>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Application Fee:</span>
                                      <div className="font-medium">{university.applicationFee || '$100-150'}</div>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Scholarship Available:</span>
                                      <div className="font-medium text-green-600">{university.scholarships || 'Merit-based'}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <h3 className="font-medium text-gray-700 mb-2">University Research Available</h3>
                            <p className="text-sm text-gray-500">
                              Detailed university recommendations for {countryName} will be provided based on your specific academic profile and career objectives.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No university data available. Please generate a new analysis.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Scholarship Matching Tab */}
          <TabsContent value="scholarships" className="space-y-6">
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="flex items-center text-yellow-800">
                  <Star className="w-5 h-5 mr-2" />
                  Scholarship Matching Analysis
                </CardTitle>
                <CardDescription className="text-yellow-700">
                  Scholarships you actually qualify for based on your profile, nationality, and academic performance
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid gap-6">
              {suggestion.analysisData?.scholarships && suggestion.analysisData.scholarships.length > 0 ? (
                suggestion.analysisData.scholarships.map((scholarship: any, index: number) => (
                  <Card key={index} className="border-l-4 border-l-green-500">
                    <CardHeader>
                      <CardTitle className="text-green-700">
                        {scholarship.name || `Scholarship Opportunity ${index + 1}`}
                      </CardTitle>
                      <CardDescription>
                        {scholarship.provider || 'Merit-based funding opportunity'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-green-50 p-3 rounded-lg">
                          <h5 className="font-medium text-green-700 mb-1">Scholarship Value</h5>
                          <p className="text-sm text-gray-700 font-semibold">
                            {scholarship.amount || 'Up to 50% tuition reduction'}
                          </p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h5 className="font-medium text-blue-700 mb-1">Your Match</h5>
                          <p className="text-sm text-gray-700">
                            {scholarship.matchLevel || 'Strong candidate'}
                          </p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <h5 className="font-medium text-purple-700 mb-1">Application Deadline</h5>
                          <p className="text-sm text-gray-700">
                            {scholarship.deadline || 'Research specific dates'}
                          </p>
                        </div>
                      </div>
                      
                      {scholarship.eligibility && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h5 className="font-medium text-gray-700 mb-2">Why You Qualify</h5>
                          <p className="text-sm text-gray-600">{scholarship.eligibility}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                // Country-based scholarship information
                suggestion.suggestedCountries && suggestion.suggestedCountries.length > 0 ? (
                  suggestion.suggestedCountries.map((countryName: string, countryIndex: number) => (
                    <Card key={`country-${countryIndex}`} className="border-l-4 border-l-orange-500">
                      <CardHeader>
                        <CardTitle className="text-orange-700">
                          {countryName} - Scholarship Opportunities
                        </CardTitle>
                        <CardDescription>
                          Financial aid opportunities for international students in {countryName}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="bg-orange-50 p-4 rounded-lg">
                            <h5 className="font-medium text-orange-700 mb-2">Available Funding</h5>
                            <p className="text-sm text-gray-700">
                              Government scholarships, university merit awards, and private foundation funding available for qualified international students.
                            </p>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h6 className="font-medium text-gray-700 mb-2">Funding Sources:</h6>
                              <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Government scholarships (up to 100% funding)</li>
                                <li>• University merit awards (15-50% tuition)</li>
                                <li>• Private foundation grants</li>
                                <li>• Industry-specific scholarships</li>
                              </ul>
                            </div>
                            <div>
                              <h6 className="font-medium text-gray-700 mb-2">Typical Benefits:</h6>
                              <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Tuition fee reductions</li>
                                <li>• Living expense stipends</li>
                                <li>• Research assistantships</li>
                                <li>• Work-study opportunities</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="pt-6 text-center py-12">
                      <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="font-medium text-gray-700 mb-2">Scholarship Research Available</h3>
                      <p className="text-sm text-gray-500">
                        Generate a new analysis to receive personalized scholarship matching based on your academic profile and destination preferences.
                      </p>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          </TabsContent>

          {/* Quarterly Action Plan Tab */}
          <TabsContent value="action-plan" className="space-y-6">
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center text-purple-800">
                  <Calendar className="w-5 h-5 mr-2" />
                  Quarterly Action Plan
                </CardTitle>
                <CardDescription className="text-purple-700">
                  Strategic timeline aligned with actual university admission cycles and deadlines
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid gap-6">
              {suggestion.analysisData?.actionPlan && suggestion.analysisData.actionPlan.length > 0 ? (
                suggestion.analysisData.actionPlan.map((quarter: any, index: number) => (
                  <Card key={index} className="border-l-4 border-l-purple-500">
                    <CardHeader>
                      <CardTitle className="text-purple-700">
                        {quarter.quarter || `Quarter ${index + 1}`}
                      </CardTitle>
                      <CardDescription>
                        {quarter.timeframe || 'Key milestone period'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {quarter.actions && quarter.actions.length > 0 ? (
                          <div>
                            <h5 className="font-medium text-gray-700 mb-3">Action Items:</h5>
                            <div className="space-y-2">
                              {quarter.actions.map((action: string, actionIndex: number) => (
                                <div key={actionIndex} className="flex items-start">
                                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                    <span className="text-xs font-medium text-purple-700">{actionIndex + 1}</span>
                                  </div>
                                  <p className="text-sm text-gray-700">{action}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                        
                        {quarter.deadlines && (
                          <div className="bg-red-50 p-3 rounded-lg">
                            <h6 className="font-medium text-red-700 mb-1">Important Deadlines:</h6>
                            <p className="text-sm text-red-600">{quarter.deadlines}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                // Default quarterly plan based on common admission cycles
                [
                  {
                    quarter: "Q1 2025 (Jan-Mar)",
                    focus: "Preparation & Language Improvement",
                    actions: [
                      "Complete English language test (IELTS/TOEFL) if score needs improvement",
                      "Research target universities and programs in detail",
                      "Prepare application documents (transcripts, SOP, LORs)",
                      "Start scholarship research and applications"
                    ]
                  },
                  {
                    quarter: "Q2 2025 (Apr-Jun)",
                    focus: "Application Submission",
                    actions: [
                      "Submit applications for Fall 2025/Spring 2026 intake",
                      "Apply for scholarships and financial aid",
                      "Prepare for potential university interviews",
                      "Begin visa documentation preparation"
                    ]
                  },
                  {
                    quarter: "Q3 2025 (Jul-Sep)",
                    focus: "Admission Decisions & Visa Processing",
                    actions: [
                      "Receive and evaluate admission offers",
                      "Accept final university offer and pay deposits",
                      "Submit visa application with all required documents",
                      "Arrange accommodation and travel plans"
                    ]
                  },
                  {
                    quarter: "Q4 2025 (Oct-Dec)",
                    focus: "Final Preparations",
                    actions: [
                      "Complete visa interview and receive visa approval",
                      "Finalize accommodation and arrival arrangements",
                      "Complete pre-departure preparations",
                      "Attend orientation programs and begin studies"
                    ]
                  }
                ].map((quarter, index) => (
                  <Card key={index} className="border-l-4 border-l-purple-500">
                    <CardHeader>
                      <CardTitle className="text-purple-700">{quarter.quarter}</CardTitle>
                      <CardDescription>{quarter.focus}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {quarter.actions.map((action: string, actionIndex: number) => (
                          <div key={actionIndex} className="flex items-start">
                            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                              <span className="text-xs font-medium text-purple-700">{actionIndex + 1}</span>
                            </div>
                            <p className="text-sm text-gray-700">{action}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Professional Disclaimer */}
        <Card className="mt-8 bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-yellow-800 mb-2">Professional Disclaimer</h4>
                <p className="text-sm text-yellow-700 leading-relaxed">
                  This AI-generated analysis is for informational purposes only. Please consult with licensed education counsellors and migration agents for personalized advice. We recommend verifying all information with official sources before making any decisions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="mt-8">
          <CustomCTA variant="generic" />
        </div>
      </div>
    </div>
  );
}