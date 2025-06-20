import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Building2, GraduationCap, DollarSign, Users, CheckCircle, AlertTriangle, Star, Calendar, Clock, Lightbulb, TrendingUp, Target, Loader2, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';

interface OfferLetterAnalysis {
  id: number;
  fileName: string;
  fileSize: number;
  analysisDate: string;
  analysisResults: any;
  createdAt: string;
}

export default function OfferLetterAnalysisView() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const { data: analysis, isLoading, error } = useQuery<OfferLetterAnalysis>({
    queryKey: [`/api/offer-letter-analyses/${id}`],
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Loading offer letter analysis...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !analysis) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Analysis Not Found</h2>
          <p className="text-gray-600 mb-4">
            The offer letter analysis you're looking for could not be found or may have been removed.
          </p>
          <Button onClick={() => setLocation('/offer-letter-analysis')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Offer Letter Analysis
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Extract analysis data with proper type safety
  const analysisData = analysis?.analysisResults || {};

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={() => setLocation('/offer-letter-analysis')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Offer Letter Analysis
            </Button>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Comprehensive Analysis
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Building2 className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">University</p>
                    <p className="font-semibold text-gray-900 truncate">
                      {analysisData.universityInfo?.name || 'Processing...'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Program</p>
                    <p className="font-semibold text-gray-900 truncate">
                      {analysisData.universityInfo?.program || 'Program details available'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Tuition</p>
                    <p className="font-semibold text-gray-900 truncate">
                      {analysisData.universityInfo?.tuition || 'Tuition information available'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold text-gray-900 truncate">
                      {analysisData.universityInfo?.duration || 'Duration specified'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Offer Letter Analysis Report</h1>
            <p className="text-gray-600">
              File: {analysis.fileName} • Analyzed on {new Date(analysis.analysisDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="document" className="text-xs">Document Analysis</TabsTrigger>
            <TabsTrigger value="scholarships" className="text-xs">Scholarships</TabsTrigger>
            <TabsTrigger value="financial" className="text-xs">Financial</TabsTrigger>
            <TabsTrigger value="recommendations" className="text-xs">Recommendations</TabsTrigger>
            <TabsTrigger value="next-steps" className="text-xs">Next Steps</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Profile Analysis
                  </CardTitle>
                  <CardDescription>Your academic and financial profile assessment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium text-gray-900 mb-2">Academic Standing</p>
                    <p className="text-gray-700">{analysisData.profileAnalysis?.academicStanding || 'Assessment in progress'}</p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-900 mb-2">Financial Status</p>
                    <p className="text-gray-700">{analysisData.profileAnalysis?.financialStatus || 'Evaluation in progress'}</p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-900 mb-2">Key Strengths</p>
                    <div className="space-y-1">
                      {(analysisData.profileAnalysis?.strengths || []).map((strength: any, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-900 mb-2">Improvement Areas</p>
                    <div className="space-y-1">
                      {(analysisData.profileAnalysis?.improvementAreas || []).map((area: any, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <Target className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Financial Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Financial Summary
                  </CardTitle>
                  <CardDescription>Key financial information and opportunities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">Total Cost</p>
                      <p className="text-blue-600 font-semibold">{analysisData.financialBreakdown?.totalCost || 'Calculating...'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Scholarships</p>
                      <p className="text-green-600 font-semibold">{analysisData.scholarshipOpportunities?.length || 0} opportunities</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Savings Strategies</p>
                      <p className="text-purple-600 font-semibold">{analysisData.costSavingStrategies?.length || 0} strategies</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Financial Aid</p>
                      <p className="text-orange-600 font-semibold">{analysisData.financialBreakdown?.scholarshipValue || 'Assessing...'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Document Analysis Tab */}
          <TabsContent value="document" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Terms & Conditions */}
              <Card>
                <CardHeader>
                  <CardTitle>Terms & Conditions Analysis</CardTitle>
                  <CardDescription>Key requirements and obligations from your offer letter</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium text-gray-900 mb-2">Academic Requirements</p>
                    <ul className="space-y-1">
                      {(analysisData.documentAnalysis?.termsAndConditions?.academicRequirements || []).map((req: any, index: number) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <GraduationCap className="h-3 w-3 text-blue-600 mt-1 flex-shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-900 mb-2">Financial Obligations</p>
                    <ul className="space-y-1">
                      {(analysisData.documentAnalysis?.termsAndConditions?.financialObligations || []).map((obligation: any, index: number) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <DollarSign className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                          {obligation}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-900 mb-2">Critical Deadlines</p>
                    <ul className="space-y-1">
                      {(analysisData.documentAnalysis?.termsAndConditions?.criticalDeadlines || []).map((deadline: any, index: number) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <Calendar className="h-3 w-3 text-red-600 mt-1 flex-shrink-0" />
                          {deadline}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Assessment */}
              <Card>
                <CardHeader>
                  <CardTitle>Risk Assessment</CardTitle>
                  <CardDescription>Potential risks and mitigation strategies</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium text-gray-900 mb-2">High Risk Factors</p>
                    <ul className="space-y-1">
                      {(analysisData.documentAnalysis?.riskAssessment?.highRiskFactors || []).map((risk: any, index: number) => (
                        <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                          <AlertTriangle className="h-3 w-3 text-red-600 mt-1 flex-shrink-0" />
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-900 mb-2">Financial Risks</p>
                    <ul className="space-y-1">
                      {(analysisData.documentAnalysis?.riskAssessment?.financialRisks || []).map((risk: any, index: number) => (
                        <li key={index} className="text-sm text-orange-700 flex items-start gap-2">
                          <DollarSign className="h-3 w-3 text-orange-600 mt-1 flex-shrink-0" />
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-900 mb-2">Mitigation Strategies</p>
                    <ul className="space-y-1">
                      {(analysisData.documentAnalysis?.riskAssessment?.mitigationStrategies || []).map((strategy: any, index: number) => (
                        <li key={index} className="text-sm text-green-700 flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                          {strategy}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Scholarships Tab */}
          <TabsContent value="scholarships" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Scholarship Opportunities</CardTitle>
                <CardDescription>
                  {(analysisData.scholarshipOpportunities || []).length} scholarship opportunities identified for your profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {(analysisData.scholarshipOpportunities || []).map((scholarship: any, index: number) => (
                  <div key={index} className="border rounded-lg p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{scholarship.name}</h3>
                        <p className="text-blue-600 font-medium">{scholarship.amount}</p>
                      </div>
                      <Badge className={getEligibilityColor(scholarship.eligibilityMatch?.overallMatch || 'Medium')}>
                        {scholarship.eligibilityMatch?.overallMatch || 'Medium'} Match
                      </Badge>
                    </div>
                    
                    <p className="text-gray-700">{scholarship.description}</p>
                    
                    <div>
                      <p className="font-medium text-gray-900 mb-2">Eligibility Criteria</p>
                      <ul className="space-y-1">
                        {(scholarship.criteria || []).map((criterion: any, criterionIndex: number) => (
                          <li key={criterionIndex} className="text-sm text-gray-700 flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                            {criterion}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">Application Deadline</p>
                        <p className="text-gray-700">{scholarship.applicationDeadline}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Competitiveness</p>
                        <Badge variant="outline" className={getDifficultyColor(scholarship.competitiveness || 'Medium')}>
                          {scholarship.competitiveness || 'Medium'}
                        </Badge>
                      </div>
                    </div>
                    
                    {scholarship.applicationStrategy && (
                      <div>
                        <p className="font-medium text-gray-900 mb-2">Application Strategy</p>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-900 mb-2">{scholarship.applicationStrategy.preparationTime}</p>
                          <div className="space-y-1">
                            {(scholarship.applicationStrategy?.successTips || []).map((tip: any, tipIndex: number) => (
                              <p key={tipIndex} className="text-sm text-blue-800 flex items-start gap-2">
                                <Lightbulb className="h-3 w-3 text-blue-600 mt-1 flex-shrink-0" />
                                {tip}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {scholarship.officialSource && (
                      <div className="border-t pt-3">
                        <a 
                          href={scholarship.officialSource} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Official Application →
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Financial Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Financial Breakdown</CardTitle>
                  <CardDescription>Complete cost analysis for your program</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">Total Program Cost</p>
                      <p className="text-xl font-bold text-blue-600">{analysisData.financialBreakdown?.totalCost || 'Calculating...'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Tuition Fees</p>
                      <p className="text-lg font-semibold text-gray-700">{analysisData.financialBreakdown?.tuitionFees || 'Processing...'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Living Expenses</p>
                      <p className="text-lg font-semibold text-gray-700">{analysisData.financialBreakdown?.livingExpenses || 'Estimating...'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Potential Savings</p>
                      <p className="text-lg font-semibold text-green-600">{analysisData.financialBreakdown?.potentialSavings || 'Calculating...'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Scholarship Value</p>
                      <p className="text-lg font-semibold text-purple-600">{analysisData.financialBreakdown?.scholarshipValue || 'Assessing...'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cost-Saving Strategies */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Cost-Saving Strategies
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(analysisData.costSavingStrategies || []).map((strategy: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{strategy.strategy}</h4>
                        <Badge className={getDifficultyColor(strategy.difficulty)}>
                          {strategy.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{strategy.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Potential Savings: <span className="font-medium text-green-600">{strategy.potentialSavings}</span></span>
                        <span>Timeline: {strategy.timeline}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            {['Financial', 'Academic', 'Application', 'Compliance'].map((category) => {
              const categoryRecs = (analysisData.recommendations || []).filter((rec: any) => 
                rec.category === category.toLowerCase()
              );
              
              if (categoryRecs.length === 0) return null;
              
              return (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      {category} Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(categoryRecs || []).map((rec: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{rec.recommendation}</h4>
                          <Badge className={getPriorityColor(rec.priority)}>
                            {rec.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">{rec.rationale}</p>
                        <div className="mt-3">
                          <p className="font-medium text-gray-900 mb-1">Implementation Steps</p>
                          <ul className="space-y-1">
                            {(rec.implementationSteps || []).map((step: any, stepIndex: number) => (
                              <li key={stepIndex} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-blue-600 font-medium">{stepIndex + 1}.</span>
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
                          <span>Timeline: {rec.timeline}</span>
                          <span>Success Metric: {rec.successMetric}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Next Steps Tab */}
          <TabsContent value="next-steps" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Action Plan</CardTitle>
                <CardDescription>
                  Prioritized next steps to maximize your offer letter benefits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(analysisData.nextSteps || []).map((step: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-3">
                        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">
                          Step {index + 1}
                        </span>
                        <div>
                          <h4 className="font-medium text-gray-900">{step.action}</h4>
                          <p className="text-sm text-gray-700 mt-1">{step.description}</p>
                        </div>
                      </div>
                      <Badge className={getPriorityColor(step.priority)}>
                        {step.priority}
                      </Badge>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">Deadline</p>
                        <p className="text-gray-700">{step.deadline}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Dependencies</p>
                        <ul className="text-gray-700">
                          {(step.dependencies || []).map((dep: any, depIndex: number) => (
                            <li key={depIndex}>• {dep}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Required Resources</p>
                        <div className="flex flex-wrap gap-2">
                          {(step.requiredResources || []).map((resource: any, resourceIndex: number) => (
                            <Badge key={resourceIndex} variant="outline" className="text-xs">
                              {resource}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Success Criteria</p>
                        <ul className="space-y-1">
                          {(step.successCriteria || []).map((criteria: any, criteriaIndex: number) => (
                            <li key={criteriaIndex} className="text-sm text-gray-700 flex items-start gap-2">
                              <Star className="h-3 w-3 text-yellow-600 mt-1 flex-shrink-0" />
                              {criteria}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}