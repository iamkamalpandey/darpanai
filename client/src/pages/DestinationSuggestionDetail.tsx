import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, GraduationCap, DollarSign, Calendar, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomCTA } from "@/components/CustomCTA";

interface CountryRecommendation {
  country: string;
  countryCode?: string;
  matchScore: number;
  ranking: number;
  reasons: string[];
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

  // Calculate overall match percentage
  const getOverallMatch = () => {
    if (suggestion.matchScore) {
      return `${suggestion.matchScore}%`;
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
                suggestion.suggestedCountries.map((country: CountryRecommendation, index: number) => {
                  return (
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
                            #{country.ranking || index + 1}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-2">Why This Match?</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                              {(country.reasons || [
                                "Strong academic programs in your field",
                                "Excellent career opportunities",
                                "Favorable visa policies for students"
                              ]).map((reason: string, i: number) => (
                                <li key={i} className="flex items-start">
                                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                                  {reason}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-green-900 mb-2">Key Advantages</h4>
                            <ul className="text-sm text-green-800 space-y-1">
                              {(country.advantages || [
                                "High-quality education system",
                                "Strong job market for graduates",
                                "Multicultural environment"
                              ]).map((advantage: string, i: number) => (
                                <li key={i} className="flex items-start">
                                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                                  {advantage}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-orange-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-orange-900 mb-2">Considerations</h4>
                            <ul className="text-sm text-orange-800 space-y-1">
                              {(country.challenges || [
                                "Higher cost of living in major cities",
                                "Competitive admission process",
                                "Weather adaptation required"
                              ]).map((challenge: string, i: number) => (
                                <li key={i} className="flex items-start">
                                  <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                                  {challenge}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Cost Grid */}
                        {country.estimatedCosts && (
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 p-3 rounded-lg text-center">
                              <div className="text-sm text-gray-600">Tuition Range</div>
                              <div className="font-semibold text-gray-900">{country.estimatedCosts.tuitionRange}</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg text-center">
                              <div className="text-sm text-gray-600">Living Costs</div>
                              <div className="font-semibold text-gray-900">{country.estimatedCosts.livingCosts}</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg text-center">
                              <div className="text-sm text-gray-600">Total Annual Cost</div>
                              <div className="font-semibold text-gray-900">{country.estimatedCosts.totalAnnualCost}</div>
                            </div>
                          </div>
                        )}

                        {/* Entry Requirements */}
                        {country.visaRequirements && (
                          <div className="mt-4 bg-purple-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-purple-900 mb-2">Entry Requirements</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-purple-600 font-medium">Visa Difficulty: </span>
                                <span className="text-purple-800">{country.visaRequirements.difficulty}</span>
                              </div>
                              <div>
                                <span className="text-purple-600 font-medium">Processing Time: </span>
                                <span className="text-purple-800">{country.visaRequirements.processingTime}</span>
                              </div>
                              <div>
                                <span className="text-purple-600 font-medium">Work Permit: </span>
                                <span className="text-purple-800">{country.visaRequirements.workPermit}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
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
                suggestion.suggestedCountries.map((country: CountryRecommendation, countryIndex: number) => {
                  return (
                    <Card key={countryIndex}>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <GraduationCap className="w-5 h-5 text-blue-600" />
                          <span>Universities in {country.country}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4">
                          {(country.topUniversities || [
                            "Leading University in " + country.country,
                            "Prestigious Institute of Technology",
                            "National University"
                          ]).map((university: string, uniIndex: number) => (
                            <div key={uniIndex} className="border rounded-lg p-4">
                              <h4 className="font-semibold text-gray-900 mb-2">{university}</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600 font-medium">Program Details: </span>
                                  <span className="text-gray-800">Masters and undergraduate programs available</span>
                                </div>
                                <div>
                                  <span className="text-gray-600 font-medium">Admission Requirements: </span>
                                  <span className="text-gray-800">Academic transcripts, English proficiency, SOP</span>
                                </div>
                                <div>
                                  <span className="text-gray-600 font-medium">Tuition Fees: </span>
                                  <span className="text-gray-800">{country.estimatedCosts?.tuitionRange || "Contact university"}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600 font-medium">Scholarship Availability: </span>
                                  <span className="text-gray-800">Merit-based and need-based scholarships available</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
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
              {suggestion.recommendations?.budgetOptimization?.scholarshipOpportunities?.length > 0 ? (
                suggestion.recommendations.budgetOptimization.scholarshipOpportunities.map((scholarship: any, index: number) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <span>{scholarship.name || `Scholarship Opportunity ${index + 1}`}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Eligibility Criteria</h4>
                          <ul className="text-sm text-gray-700 space-y-1">
                            <li>• Academic excellence (minimum GPA requirements)</li>
                            <li>• English proficiency test scores</li>
                            <li>• Statement of purpose and recommendations</li>
                            <li>• Financial need demonstration (if applicable)</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Funding Details</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-600 font-medium">Funding Source: </span>
                              <span className="text-gray-800">Government/University/Private</span>
                            </div>
                            <div>
                              <span className="text-gray-600 font-medium">Coverage: </span>
                              <span className="text-gray-800">Partial to full tuition coverage</span>
                            </div>
                            <div>
                              <span className="text-gray-600 font-medium">Application Deadline: </span>
                              <span className="text-gray-800">Various deadlines throughout the year</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Scholarship Matching Available</h3>
                    <p className="text-gray-600 mb-4">Comprehensive scholarship opportunities will be identified based on your profile and chosen destinations.</p>
                    <div className="bg-blue-50 p-4 rounded-lg text-left max-w-2xl mx-auto">
                      <h4 className="font-semibold text-blue-900 mb-2">Potential Scholarship Types</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Merit-based scholarships for academic excellence</li>
                        <li>• Need-based financial aid programs</li>
                        <li>• Country-specific government scholarships</li>
                        <li>• University-specific funding opportunities</li>
                        <li>• Field-of-study specialized grants</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Quarterly Action Plan Tab */}
          <TabsContent value="action-plan" className="space-y-6">
            <div className="grid gap-6">
              {suggestion.recommendations?.timeline ? (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <span>Preparation Phase</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{suggestion.recommendations.timeline.preparation || "Focus on academic preparation, standardized test preparation, and initial research on target universities and countries."}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <span>Application Phase</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{suggestion.recommendations.timeline.application || "Submit applications to selected universities, prepare and submit scholarship applications, and complete visa documentation."}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-green-600" />
                        <span>Decision Making Phase</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{suggestion.recommendations.timeline.decisionMaking || "Review admission offers, finalize university selection, complete visa applications, and prepare for departure."}</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Quarterly Action Plan</h3>
                    <p className="text-gray-600 mb-6">Strategic timeline aligned with actual university admission cycles</p>
                    
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
              )}
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