import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CustomCTA } from '@/components/CustomCTA';
import { 
  ArrowLeft, 
  FileText, 
  Building, 
  User, 
  DollarSign, 
  Target,
  CheckCircle,
  AlertTriangle,
  Calendar,
  ExternalLink,
  Shield,
  TrendingUp,
  Clock
} from 'lucide-react';

interface OfferLetterAnalysisData {
  id: number;
  fileName: string;
  fileSize: number;
  analysisDate: string;
  documentAnalysis?: {
    totalPages: string;
    documentSections: string[];
    termsAndConditions: {
      academicRequirements: string[];
      financialObligations: string[];
      enrollmentConditions: string[];
      academicProgress: string[];
      complianceRequirements: string[];
      hiddenClauses: string[];
      criticalDeadlines: string[];
      penalties: string[];
    };
    riskAssessment: {
      highRiskFactors: string[];
      financialRisks: string[];
      academicRisks: string[];
      complianceRisks: string[];
      mitigationStrategies: string[];
    };
  };
  profileAnalysis: {
    academicStanding: string;
    gpa: string;
    financialStatus: string;
    relevantSkills: string[];
    strengths: string[];
    weaknesses: string[];
    competitivePosition?: string;
  };
  universityInfo: {
    name: string;
    location: string;
    program: string;
    tuition: string;
    duration: string;
    institutionalRanking?: string;
    programAccreditation?: string;
    totalProgramCost?: string;
  };
  scholarshipOpportunities: Array<{
    name: string;
    amount: string;
    criteria: string[];
    applicationDeadline: string;
    applicationProcess: string;
    sourceUrl: string;
    eligibilityMatch?: 'High' | 'Medium' | 'Low';
    scholarshipType?: 'Merit' | 'Need-based' | 'International' | 'Research' | 'Program-specific';
    studentProfileMatch?: {
      gpaRequirement: string;
      matchesGPA: boolean;
      gpaAnalysis?: string;
      academicRequirement: string;
      matchesAcademic: boolean;
      academicAnalysis?: string;
      nationalityRequirement?: string;
      matchesNationality?: boolean;
      programRequirement?: string;
      matchesProgram?: boolean;
      overallMatch: number;
      matchReasoning?: string;
      improvementSuggestions?: string[];
    };
    competitiveness?: 'Low' | 'Medium' | 'High';
    renewalRequirements?: string;
    additionalBenefits?: string[];
    applicationStrategy?: {
      recommendedSubmissionTime?: string;
      requiredDocuments?: string[];
      preparationTime?: string;
      successTips?: string[];
    };
  }>;
  costSavingStrategies: Array<{
    strategy: string;
    description: string;
    potentialSavings: string;
    implementationSteps: string[];
    timeline: string;
    difficulty: 'Low' | 'Medium' | 'High';
  }>;
  recommendations: string[];
  nextSteps: string[];
}

export default function OfferLetterAnalysisView() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const { data: analysis, isLoading, error } = useQuery<OfferLetterAnalysisData>({
    queryKey: ['/api/offer-letter-analyses', id],
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

  if (error || !analysis) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Analysis not found or error loading data. Please try again.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  const getEligibilityColor = (match: string) => {
    switch (match) {
      case 'High': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => setLocation('/my-analysis')}
              className="text-green-700 hover:text-green-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Analysis
            </Button>
            <Badge className="bg-green-100 text-green-800">Complete Analysis</Badge>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <FileText className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {analysis.fileName}
              </h1>
              <p className="text-gray-600 mb-4">
                Analyzed on {new Date(analysis.analysisDate).toLocaleDateString()}
              </p>
              
              {/* Quick Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-sm">University</span>
                  </div>
                  <p className="text-sm text-gray-600">{analysis.universityInfo?.name || 'Not specified'}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-purple-600" />
                    <span className="font-medium text-sm">Program</span>
                  </div>
                  <p className="text-sm text-gray-600">{analysis.universityInfo?.program || 'Not specified'}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-sm">Tuition</span>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">{analysis.universityInfo?.tuition || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Content */}
        <Tabs defaultValue="document" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="document" className="text-blue-700">Document Analysis</TabsTrigger>
            <TabsTrigger value="profile" className="text-purple-700">Profile</TabsTrigger>
            <TabsTrigger value="scholarships" className="text-yellow-700">Scholarships</TabsTrigger>
            <TabsTrigger value="savings" className="text-green-700">Cost Savings</TabsTrigger>
            <TabsTrigger value="next" className="text-indigo-700">Next Steps</TabsTrigger>
          </TabsList>

          {/* Document Analysis Tab */}
          <TabsContent value="document" className="space-y-6">
            {analysis.documentAnalysis ? (
              <div className="space-y-6">
                {/* Terms & Conditions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-700">
                      <Shield className="h-5 w-5" />
                      Terms & Conditions Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Academic Requirements */}
                    {analysis.documentAnalysis.termsAndConditions.academicRequirements?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Academic Requirements</h4>
                        <div className="space-y-2">
                          {analysis.documentAnalysis.termsAndConditions.academicRequirements.map((req, index) => (
                            <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{req}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Financial Obligations */}
                    {analysis.documentAnalysis.termsAndConditions.financialObligations?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Financial Obligations</h4>
                        <div className="space-y-2">
                          {analysis.documentAnalysis.termsAndConditions.financialObligations.map((obligation, index) => (
                            <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                              <DollarSign className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{obligation}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Critical Deadlines */}
                    {analysis.documentAnalysis.termsAndConditions.criticalDeadlines?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Critical Deadlines</h4>
                        <div className="space-y-2">
                          {analysis.documentAnalysis.termsAndConditions.criticalDeadlines.map((deadline, index) => (
                            <div key={index} className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                              <Calendar className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{deadline}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Risk Assessment */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700">
                      <AlertTriangle className="h-5 w-5" />
                      Risk Assessment & Mitigation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* High Risk Factors */}
                    {analysis.documentAnalysis.riskAssessment.highRiskFactors?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">High Risk Factors</h4>
                        <div className="space-y-2">
                          {analysis.documentAnalysis.riskAssessment.highRiskFactors.map((risk, index) => (
                            <div key={index} className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{risk}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mitigation Strategies */}
                    {analysis.documentAnalysis.riskAssessment.mitigationStrategies?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Mitigation Strategies</h4>
                        <div className="space-y-2">
                          {analysis.documentAnalysis.riskAssessment.mitigationStrategies.map((strategy, index) => (
                            <div key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{strategy}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Document analysis data not available. This may be from an older analysis before comprehensive document examination was implemented.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Profile Analysis Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <User className="h-5 w-5" />
                  Student Profile Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Academic Standing</h4>
                    <p className="text-gray-700 p-3 bg-purple-50 rounded-lg">{analysis.profileAnalysis?.academicStanding || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Financial Status</h4>
                    <p className="text-gray-700 p-3 bg-green-50 rounded-lg">{analysis.profileAnalysis?.financialStatus || 'Not specified'}</p>
                  </div>
                </div>

                {/* Strengths */}
                {analysis.profileAnalysis?.strengths?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Strengths</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {analysis.profileAnalysis.strengths.map((strength, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-gray-700">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Areas for Improvement */}
                {analysis.profileAnalysis?.weaknesses?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Areas for Improvement</h4>
                    <div className="space-y-2">
                      {analysis.profileAnalysis.weaknesses.map((weakness, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                          <TrendingUp className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{weakness}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scholarships Tab */}
          <TabsContent value="scholarships" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-700">
                  <Target className="h-5 w-5" />
                  Scholarship Opportunities ({analysis.scholarshipOpportunities?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analysis.scholarshipOpportunities?.length > 0 ? (
                  <div className="space-y-4">
                    {analysis.scholarshipOpportunities.map((scholarship, index) => (
                      <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{scholarship.name}</h4>
                            <p className="text-lg font-bold text-green-600 mt-1">{scholarship.amount}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getEligibilityColor(scholarship.eligibilityMatch || 'Low')}>
                              {scholarship.eligibilityMatch || 'Unknown'} Match
                            </Badge>
                            {scholarship.scholarshipType && (
                              <Badge variant="outline">{scholarship.scholarshipType}</Badge>
                            )}
                          </div>
                        </div>

                        {/* Match Analysis */}
                        {scholarship.studentProfileMatch && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${scholarship.studentProfileMatch.overallMatch}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{scholarship.studentProfileMatch.overallMatch}%</span>
                            </div>
                            {scholarship.studentProfileMatch.matchReasoning && (
                              <p className="text-sm text-gray-600 mb-2">{scholarship.studentProfileMatch.matchReasoning}</p>
                            )}
                          </div>
                        )}

                        {/* Criteria */}
                        <div className="mb-3">
                          <h5 className="font-medium text-gray-900 mb-2">Eligibility Criteria</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                            {scholarship.criteria.map((criterion, idx) => (
                              <div key={idx} className="text-sm text-gray-600 flex items-center gap-1">
                                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                {criterion}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Application Details */}
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Deadline: {scholarship.applicationDeadline}
                            </span>
                            {scholarship.competitiveness && (
                              <Badge variant="outline" className={getDifficultyColor(scholarship.competitiveness)}>
                                {scholarship.competitiveness} Competition
                              </Badge>
                            )}
                          </div>
                          {scholarship.sourceUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={scholarship.sourceUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Apply
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No scholarship opportunities found in this analysis.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cost Savings Tab */}
          <TabsContent value="savings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <DollarSign className="h-5 w-5" />
                  Cost Saving Strategies ({analysis.costSavingStrategies?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analysis.costSavingStrategies?.length > 0 ? (
                  <div className="space-y-4">
                    {analysis.costSavingStrategies.map((strategy, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{strategy.strategy}</h4>
                            <p className="text-sm text-gray-600 mt-1">{strategy.description}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-lg font-bold text-green-600">{strategy.potentialSavings}</span>
                            <Badge className={getDifficultyColor(strategy.difficulty)}>
                              {strategy.difficulty} Difficulty
                            </Badge>
                          </div>
                        </div>

                        {/* Implementation Steps */}
                        <div className="mb-3">
                          <h5 className="font-medium text-gray-900 mb-2">Implementation Steps</h5>
                          <div className="space-y-1">
                            {strategy.implementationSteps.map((step, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                <span className="w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                                  {idx + 1}
                                </span>
                                {step}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Timeline: {strategy.timeline}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No cost saving strategies found in this analysis.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Next Steps Tab */}
          <TabsContent value="next" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-700">
                  <CheckCircle className="h-5 w-5" />
                  Recommended Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analysis.nextSteps?.length > 0 ? (
                  <div className="space-y-3">
                    {analysis.nextSteps.map((step, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg">
                        <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{step}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No specific next steps provided in this analysis.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Professional Recommendations */}
            {analysis.recommendations?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <CheckCircle className="h-5 w-5" />
                    Professional Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <CustomCTA variant="offer-letter-analysis" />
      </div>
    </DashboardLayout>
  );
}