import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertCircle, CheckCircle, AlertTriangle, TrendingUp, Target, Calendar, DollarSign, Users, Building2, GraduationCap, Clock, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';

interface ComprehensiveAnalysis {
  id: number;
  fileName: string;
  fileSize: number;
  analysisDate: string;
  analysisResults: {
    executiveSummary: {
      overallAssessment: string;
      riskLevel: 'Low' | 'Moderate' | 'High';
      recommendationStatus: string;
      keyFindings: string[];
      criticalActions: string[];
      statusUpdate: string;
    };
    coreOfferDetails: {
      studentInfo: {
        name: string;
        studentId: string;
        nationality: string;
        program: string;
        cricos: string;
        provider: string;
      };
      programStructure: {
        duration: string;
        startDate: string;
        studyMode: string;
        units: string;
        creditPoints: string;
        creditRecognition: string;
      };
      financialOverview: {
        totalTuition: string;
        initialPayment: string;
        paymentSchedule: string;
        estimatedTotalInvestment: string;
      };
    };
    accreditationVerification: {
      accreditationStatus: string;
      accreditingBody: string;
      professionalRecognition: string;
      careerImpact: string[];
      verificationSource: string;
      statusMeaning: string;
    };
    riskAssessmentMatrix: {
      riskFactors: Array<{
        factor: string;
        previousStatus?: string;
        currentStatus: 'Resolved' | 'Ongoing' | 'Critical';
        impactLevel: 'Low' | 'Moderate' | 'High';
        mitigationStrategy: string;
      }>;
      overallRiskLevel: 'Low' | 'Moderate' | 'High';
      riskLevelChange?: string;
    };
    financialAnalysis: {
      costBreakdown: Array<{
        component: string;
        amount: string;
        notes: string;
      }>;
      marketComparison: Array<{
        institution: string;
        tuition: string;
        accreditationStatus: string;
        graduateEmployment: string;
        notes?: string;
      }>;
      totalInvestment: string;
      marketPosition: string;
      costAnalysis?: string;
    };
    strategicOpportunities: {
      immediateNegotiationPoints: Array<{
        opportunity: string;
        impact: string;
        action: string;
        benefit: string;
        timeline: string;
      }>;
      leveragePoints: string[];
    };
    alternativeOptions: {
      tier1Universities: Array<{
        name: string;
        tuition: string;
        accreditationStatus: string;
        employment: string;
        startDates?: string;
        reputation?: string;
        advantages: string[];
      }>;
      tier2Alternatives: Array<{
        pathway: string;
        duration?: string;
        benefits: string[];
        considerations: string[];
      }>;
    };
    careerOutcomes: {
      salaryExpectations: {
        graduateStarting: string;
        experienced5Years: string;
        seniorRoles: string;
        specializedFields: string;
      };
      roiScenarios: Array<{
        scenario: string;
        totalInvestment: string;
        startingSalary: string;
        paybackPeriod: string;
        tenYearNetROI: string;
      }>;
      riskAdjustedAnalysis?: string;
    };
    finalRecommendations: Array<{
      priority: number;
      title: string;
      recommendation: string;
      rationale: string;
      timeline: string;
      expectedOutcome: string;
      investmentRequired?: string;
    }>;
  };
  createdAt: string;
}

export default function OfferLetterAnalysisViewComprehensive() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const { data: analysis, isLoading, error } = useQuery<ComprehensiveAnalysis>({
    queryKey: [`/api/offer-letter-analyses/${id}`],
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Loading comprehensive strategic analysis...</p>
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
            The comprehensive offer letter analysis could not be found.
          </p>
          <Button onClick={() => setLocation('/offer-letter-analysis')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Offer Letter Analysis
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const data = analysis.analysisResults;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Ongoing': return 'bg-yellow-100 text-yellow-800';
      case 'Critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={() => setLocation('/offer-letter-analysis')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Offer Letter Analysis
            </Button>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Comprehensive Strategic Analysis
            </Badge>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Comprehensive Offer Letter Analysis & Strategic Guide
            </h1>
            <h2 className="text-xl text-gray-700 mb-4">
              {data.coreOfferDetails?.studentInfo?.program || 'Program Analysis'}
            </h2>
            <p className="text-gray-600">
              File: {analysis.fileName} • Analyzed on {new Date(analysis.analysisDate).toLocaleDateString()} • Status Update: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Executive Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6 text-blue-600" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Badge className={getRiskColor(data.executiveSummary?.riskLevel || 'Moderate')}>
                  Risk Level: {data.executiveSummary?.riskLevel || 'Moderate'}
                </Badge>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Badge variant="outline" className="text-sm">
                  {data.executiveSummary?.recommendationStatus || 'Assessment Complete'}
                </Badge>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Status Update</span>
              </div>
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-800 leading-relaxed">
                {data.executiveSummary?.overallAssessment || 'Comprehensive analysis completed with detailed strategic insights and recommendations.'}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Key Findings</h4>
                <ul className="space-y-2">
                  {(data.executiveSummary?.keyFindings || []).map((finding, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Critical Actions</h4>
                <ul className="space-y-2">
                  {(data.executiveSummary?.criticalActions || []).map((action, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Core Offer Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-purple-600" />
              Core Offer Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Student Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">Student Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Name:</span> {data.coreOfferDetails?.studentInfo?.name || 'Student Name'}</div>
                  <div><span className="font-medium">Student ID:</span> {data.coreOfferDetails?.studentInfo?.studentId || 'ID'}</div>
                  <div><span className="font-medium">Nationality:</span> {data.coreOfferDetails?.studentInfo?.nationality || 'Nationality'}</div>
                  <div><span className="font-medium">Program:</span> {data.coreOfferDetails?.studentInfo?.program || 'Program'}</div>
                  <div><span className="font-medium">CRICOS:</span> {data.coreOfferDetails?.studentInfo?.cricos || 'CRICOS'}</div>
                  <div><span className="font-medium">Provider:</span> {data.coreOfferDetails?.studentInfo?.provider || 'Provider'}</div>
                </div>
              </div>

              {/* Program Structure */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">Program Structure</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Duration:</span> {data.coreOfferDetails?.programStructure?.duration || 'Duration'}</div>
                  <div><span className="font-medium">Start Date:</span> {data.coreOfferDetails?.programStructure?.startDate || 'Start Date'}</div>
                  <div><span className="font-medium">Study Mode:</span> {data.coreOfferDetails?.programStructure?.studyMode || 'Study Mode'}</div>
                  <div><span className="font-medium">Units:</span> {data.coreOfferDetails?.programStructure?.units || 'Units'}</div>
                  <div><span className="font-medium">Credit Points:</span> {data.coreOfferDetails?.programStructure?.creditPoints || 'Credit Points'}</div>
                  <div><span className="font-medium">Credit Recognition:</span> {data.coreOfferDetails?.programStructure?.creditRecognition || 'Recognition'}</div>
                </div>
              </div>

              {/* Financial Overview */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">Financial Overview</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Total Tuition:</span> <span className="text-blue-600 font-semibold">{data.coreOfferDetails?.financialOverview?.totalTuition || 'Total Tuition'}</span></div>
                  <div><span className="font-medium">Initial Payment:</span> <span className="text-green-600 font-semibold">{data.coreOfferDetails?.financialOverview?.initialPayment || 'Initial Payment'}</span></div>
                  <div><span className="font-medium">Payment Schedule:</span> {data.coreOfferDetails?.financialOverview?.paymentSchedule || 'Schedule'}</div>
                  <div><span className="font-medium">Estimated Total Investment:</span> <span className="text-purple-600 font-semibold">{data.coreOfferDetails?.financialOverview?.estimatedTotalInvestment || 'Total Investment'}</span></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accreditation Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Accreditation Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800">
                  {data.accreditationVerification?.accreditationStatus || 'Accreditation Status'}
                </span>
              </div>
              <p className="text-green-700 text-sm">
                <strong>Source:</strong> {data.accreditationVerification?.verificationSource || 'Official verification source'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Professional Recognition</h4>
                <p className="text-gray-700 text-sm">{data.accreditationVerification?.professionalRecognition || 'Professional recognition details'}</p>
                <p className="text-gray-600 text-sm mt-2"><strong>Status Meaning:</strong> {data.accreditationVerification?.statusMeaning || 'Status explanation'}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Career Impact</h4>
                <ul className="space-y-1">
                  {(data.accreditationVerification?.careerImpact || []).map((impact, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{impact}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Assessment Matrix */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              Risk Assessment Matrix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Risk Factor</th>
                    <th className="text-left p-3 font-semibold">Current Status</th>
                    <th className="text-left p-3 font-semibold">Impact Level</th>
                    <th className="text-left p-3 font-semibold">Mitigation Strategy</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.riskAssessmentMatrix?.riskFactors || []).map((risk, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-3 font-medium">{risk.factor}</td>
                      <td className="p-3">
                        <Badge className={getStatusColor(risk.currentStatus)}>
                          {risk.currentStatus}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge className={getRiskColor(risk.impactLevel)}>
                          {risk.impactLevel}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">{risk.mitigationStrategy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Overall Risk Level:</span>
                <Badge className={getRiskColor(data.riskAssessmentMatrix?.overallRiskLevel || 'Moderate')}>
                  {data.riskAssessmentMatrix?.overallRiskLevel || 'Moderate'}
                </Badge>
                {data.riskAssessmentMatrix?.riskLevelChange && (
                  <span className="text-sm text-gray-600">({data.riskAssessmentMatrix.riskLevelChange})</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Analysis & Market Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-green-600" />
              Financial Analysis & Market Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Cost Breakdown */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Cost Breakdown</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Component</th>
                      <th className="text-left p-3 font-semibold">Amount</th>
                      <th className="text-left p-3 font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.financialAnalysis?.costBreakdown || []).map((cost, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-3 font-medium">{cost.component}</td>
                        <td className="p-3 text-blue-600 font-semibold">{cost.amount}</td>
                        <td className="p-3 text-sm text-gray-700">{cost.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Market Comparison */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Market Comparison</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Institution</th>
                      <th className="text-left p-3 font-semibold">Tuition</th>
                      <th className="text-left p-3 font-semibold">Accreditation Status</th>
                      <th className="text-left p-3 font-semibold">Graduate Employment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.financialAnalysis?.marketComparison || []).map((comp, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-3 font-medium">{comp.institution}</td>
                        <td className="p-3 text-green-600 font-semibold">{comp.tuition}</td>
                        <td className="p-3">{comp.accreditationStatus}</td>
                        <td className="p-3">{comp.graduateEmployment}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {data.financialAnalysis?.costAnalysis && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-semibold text-blue-900 mb-2">Analysis</h5>
                <p className="text-blue-800 text-sm">{data.financialAnalysis.costAnalysis}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Strategic Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-purple-600" />
              Strategic Opportunities & Negotiations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Immediate Negotiation Points</h4>
              <div className="space-y-4">
                {(data.strategicOpportunities?.immediateNegotiationPoints || []).map((point, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{point.opportunity}</h5>
                      <Badge variant="outline">{point.timeline}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">Impact:</span>
                        <p className="text-gray-700">{point.impact}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Action:</span>
                        <p className="text-gray-700">{point.action}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Benefit:</span>
                        <p className="text-green-700">{point.benefit}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Leverage Points for Negotiation</h4>
              <ul className="space-y-2">
                {(data.strategicOpportunities?.leveragePoints || []).map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Alternative Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-blue-600" />
              Alternative Options Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Tier 1: Established Universities</h4>
              <div className="space-y-4">
                {(data.alternativeOptions?.tier1Universities || []).map((uni, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">{uni.name}</h5>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-3">
                      <div><span className="font-medium">Tuition:</span> <span className="text-green-600">{uni.tuition}</span></div>
                      <div><span className="font-medium">Status:</span> {uni.accreditationStatus}</div>
                      <div><span className="font-medium">Employment:</span> {uni.employment}</div>
                      {uni.reputation && <div><span className="font-medium">Reputation:</span> {uni.reputation}</div>}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Advantages:</span>
                      <ul className="mt-1 space-y-1">
                        {uni.advantages.map((advantage, advIndex) => (
                          <li key={advIndex} className="flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{advantage}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Tier 2: Alternative Pathways</h4>
              <div className="space-y-4">
                {(data.alternativeOptions?.tier2Alternatives || []).map((alt, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">{alt.pathway}</h5>
                    {alt.duration && <p className="text-sm text-gray-600 mb-2">Duration: {alt.duration}</p>}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium text-gray-900">Benefits:</span>
                        <ul className="mt-1 space-y-1">
                          {alt.benefits.map((benefit, benIndex) => (
                            <li key={benIndex} className="flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Considerations:</span>
                        <ul className="mt-1 space-y-1">
                          {alt.considerations.map((consideration, conIndex) => (
                            <li key={conIndex} className="flex items-start gap-2">
                              <AlertTriangle className="h-3 w-3 text-orange-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{consideration}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Career Outcomes & ROI Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-green-600" />
              Career Outcomes & ROI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Salary Expectations</h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Graduate Starting</p>
                  <p className="text-lg font-semibold text-green-600">{data.careerOutcomes?.salaryExpectations?.graduateStarting || 'Starting Salary'}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Experienced (5 years)</p>
                  <p className="text-lg font-semibold text-green-600">{data.careerOutcomes?.salaryExpectations?.experienced5Years || 'Experienced Salary'}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Senior Roles</p>
                  <p className="text-lg font-semibold text-green-600">{data.careerOutcomes?.salaryExpectations?.seniorRoles || 'Senior Salary'}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Specialized Fields</p>
                  <p className="text-lg font-semibold text-green-600">{data.careerOutcomes?.salaryExpectations?.specializedFields || 'Specialized Salary'}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Return on Investment Scenarios</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Scenario</th>
                      <th className="text-left p-3 font-semibold">Total Investment</th>
                      <th className="text-left p-3 font-semibold">Starting Salary</th>
                      <th className="text-left p-3 font-semibold">Payback Period</th>
                      <th className="text-left p-3 font-semibold">10-Year Net ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.careerOutcomes?.roiScenarios || []).map((scenario, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-3 font-medium">{scenario.scenario}</td>
                        <td className="p-3 text-red-600">{scenario.totalInvestment}</td>
                        <td className="p-3 text-green-600">{scenario.startingSalary}</td>
                        <td className="p-3 text-blue-600">{scenario.paybackPeriod}</td>
                        <td className="p-3 text-purple-600 font-semibold">{scenario.tenYearNetROI}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {data.careerOutcomes?.riskAdjustedAnalysis && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-semibold text-blue-900 mb-2">Risk-Adjusted Analysis</h5>
                <p className="text-blue-800 text-sm">{data.careerOutcomes.riskAdjustedAnalysis}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Final Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6 text-purple-600" />
              Final Strategic Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(data.finalRecommendations || [])
                .sort((a, b) => a.priority - b.priority)
                .map((rec, index) => (
                <div key={index} className="border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-purple-100 text-purple-800">
                        Priority {rec.priority}
                      </Badge>
                      <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                    </div>
                    <Badge variant="outline">{rec.timeline}</Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">Recommendation</h5>
                      <p className="text-gray-700 text-sm">{rec.recommendation}</p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">Rationale</h5>
                      <p className="text-gray-700 text-sm">{rec.rationale}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-1">Expected Outcome</h5>
                        <p className="text-green-700">{rec.expectedOutcome}</p>
                      </div>
                      {rec.investmentRequired && (
                        <div>
                          <h5 className="font-medium text-gray-900 mb-1">Investment Required</h5>
                          <p className="text-blue-700">{rec.investmentRequired}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}