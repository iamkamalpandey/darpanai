import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  GraduationCap, 
  FileText, 
  DollarSign, 
  Building2, 
  Target, 
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Globe,
  BookOpen,
  CreditCard
} from 'lucide-react';

interface EnrollmentAnalysisData {
  id: number;
  fileName: string;
  createdAt: string;
  institution?: string;
  program?: string;
  studentName?: string;
  programLevel?: string;
  startDate?: string;
  endDate?: string;
  institutionCountry?: string;
  visaType?: string;
  healthCover?: string;
  englishTestScore?: string;
  institutionContact?: string;
  visaObligations?: string;
  orientationDate?: string;
  passportDetails?: string;
  supportServices?: string;
  paymentSchedule?: string;
  bankDetails?: string;
  conditionsOfOffer?: string;
  scholarshipDetails?: string;
  scholarshipPercentage?: string;
  scholarshipDuration?: string;
  scholarshipConditions?: string;
  internshipRequired?: string;
  internshipDuration?: string;
  workAuthorization?: string;
  workHoursLimit?: string;
  academicRequirements?: string;
  gpaRequirement?: string;
  attendanceRequirement?: string;
  languageRequirements?: string;
  graduationRequirements?: string;
  termsToFulfil?: string;
  summary?: string;
  keyFindings?: Array<{
    title: string;
    description: string;
    importance: 'high' | 'medium' | 'low';
    category?: string;
    actionRequired?: string;
    deadline?: string;
    amount?: string;
    consequence?: string;
  }>;
  recommendations?: Array<{
    title: string;
    description: string;
    priority: 'urgent' | 'important' | 'suggested';
    category: string;
  }>;
  missingInformation?: Array<{
    field: string;
    description: string;
    impact: string;
  }>;
}

interface EnrollmentAnalysisDisplayProps {
  analysis: EnrollmentAnalysisData;
  isAdmin?: boolean;
}

export const EnrollmentAnalysisDisplay: React.FC<EnrollmentAnalysisDisplayProps> = ({ 
  analysis, 
  isAdmin = false 
}) => {
  const getImportanceBadgeColor = (importance: 'high' | 'medium' | 'low') => {
    switch (importance) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getPriorityBadgeColor = (priority: 'urgent' | 'important' | 'suggested') => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'important': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'suggested': return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'documentation': return <FileText className="h-4 w-4" />;
      case 'financial': return <DollarSign className="h-4 w-4" />;
      case 'academic': return <GraduationCap className="h-4 w-4" />;
      case 'visa': return <Globe className="h-4 w-4" />;
      case 'preparation': return <Target className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Information */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <FileText className="h-5 w-5" />
            Document Analysis Report
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="font-medium text-gray-600">Document Type:</span>
              <p className="text-gray-800">Enrollment Confirmation</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Analysis Date:</span>
              <p className="text-gray-800">{new Date(analysis.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">File Name:</span>
              <p className="text-gray-800 break-words">{analysis.fileName}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="findings" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
            Key Findings
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="next-steps" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            Next Steps
          </TabsTrigger>
          <TabsTrigger value="details" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
            Complete Details
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Academic Information */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <GraduationCap className="h-5 w-5" />
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <span className="font-medium text-gray-600">Institution:</span>
                  <p className="text-gray-800">{analysis.institution || "Not specified in document"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Program:</span>
                  <p className="text-gray-800">{analysis.program || "Not specified in document"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Student Name:</span>
                  <p className="text-gray-800">{analysis.studentName || "Not specified in document"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Program Level:</span>
                  <p className="text-gray-800">{analysis.programLevel || "Not specified in document"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Duration:</span>
                  <p className="text-gray-800">
                    {analysis.startDate && analysis.endDate 
                      ? `${analysis.startDate} to ${analysis.endDate}`
                      : "Not specified in document"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Summary */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <Clock className="h-5 w-5" />
                  Quick Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-700 leading-relaxed">
                  {analysis.summary ? 
                    analysis.summary.substring(0, 300) + (analysis.summary.length > 300 ? '...' : '')
                    : 'No summary available for this analysis.'}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Key Findings Tab */}
        <TabsContent value="findings" className="space-y-6">
          {analysis.keyFindings && analysis.keyFindings.length > 0 ? (
            <div className="space-y-6">
              {/* Critical Findings Section */}
              {analysis.keyFindings.filter(f => f.importance === 'high').length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Critical Findings Requiring Immediate Attention
                  </h2>
                  <div className="grid gap-4">
                    {analysis.keyFindings.filter(f => f.importance === 'high').map((finding, index) => (
                      <Card key={index} className="shadow-lg border-0 bg-red-50/80 backdrop-blur-sm border-red-200">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <h3 className="font-semibold text-lg text-red-900">{finding.title}</h3>
                            <div className="flex gap-2">
                              {finding.category && (
                                <Badge variant="outline" className="text-xs bg-red-100 text-red-700 border-red-300">
                                  {finding.category.replace('_', ' ').toUpperCase()}
                                </Badge>
                              )}
                              <Badge className="bg-red-100 text-red-800 border-red-200 border">
                                CRITICAL
                              </Badge>
                            </div>
                          </div>
                          <p className="text-red-800 leading-relaxed mb-6 font-medium">{finding.description}</p>
                          
                          {/* Detailed action breakdown */}
                          <div className="space-y-4">
                            {finding.actionRequired && (
                              <div className="bg-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
                                <span className="font-semibold text-blue-900 flex items-center gap-2 mb-2">
                                  <CheckCircle className="h-4 w-4" />
                                  Immediate Actions Required:
                                </span>
                                <p className="text-blue-800 leading-relaxed">{finding.actionRequired}</p>
                              </div>
                            )}
                            
                            {finding.deadline && (
                              <div className="bg-red-100 p-4 rounded-lg border-l-4 border-red-500">
                                <span className="font-semibold text-red-900 flex items-center gap-2 mb-2">
                                  <Clock className="h-4 w-4" />
                                  Critical Deadline:
                                </span>
                                <p className="text-red-800 leading-relaxed font-medium">{finding.deadline}</p>
                                <p className="text-red-700 text-sm mt-2">⚠️ Missing this deadline may have serious consequences</p>
                              </div>
                            )}
                            
                            {finding.amount && (
                              <div className="bg-green-100 p-4 rounded-lg border-l-4 border-green-500">
                                <span className="font-semibold text-green-900 flex items-center gap-2 mb-2">
                                  <DollarSign className="h-4 w-4" />
                                  Financial Impact:
                                </span>
                                <p className="text-green-800 leading-relaxed font-bold text-lg">{finding.amount}</p>
                              </div>
                            )}
                            
                            {finding.consequence && (
                              <div className="bg-amber-100 p-4 rounded-lg border-l-4 border-amber-500">
                                <span className="font-semibold text-amber-900 flex items-center gap-2 mb-2">
                                  <AlertCircle className="h-4 w-4" />
                                  Potential Consequences:
                                </span>
                                <p className="text-amber-800 leading-relaxed">{finding.consequence}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Important Findings Section */}
              {analysis.keyFindings.filter(f => f.importance === 'medium').length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-yellow-800 mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Important Findings for Your Attention
                  </h2>
                  <div className="grid gap-4">
                    {analysis.keyFindings.filter(f => f.importance === 'medium').map((finding, index) => (
                      <Card key={index} className="shadow-lg border-0 bg-yellow-50/80 backdrop-blur-sm border-yellow-200">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <h3 className="font-semibold text-lg text-yellow-900">{finding.title}</h3>
                            <div className="flex gap-2">
                              {finding.category && (
                                <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-700 border-yellow-300">
                                  {finding.category.replace('_', ' ').toUpperCase()}
                                </Badge>
                              )}
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 border">
                                IMPORTANT
                              </Badge>
                            </div>
                          </div>
                          <p className="text-yellow-800 leading-relaxed mb-4">{finding.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {finding.actionRequired && (
                              <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                                <span className="font-medium text-blue-800 block mb-1">Recommended Action:</span>
                                <p className="text-blue-700 text-sm leading-relaxed">{finding.actionRequired}</p>
                              </div>
                            )}
                            
                            {finding.deadline && (
                              <div className="bg-red-50 p-3 rounded-lg border-l-4 border-red-400">
                                <span className="font-medium text-red-800 block mb-1">Timeline:</span>
                                <p className="text-red-700 text-sm leading-relaxed">{finding.deadline}</p>
                              </div>
                            )}
                            
                            {finding.amount && (
                              <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
                                <span className="font-medium text-green-800 block mb-1">Financial Details:</span>
                                <p className="text-green-700 text-sm font-semibold">{finding.amount}</p>
                              </div>
                            )}
                            
                            {finding.consequence && (
                              <div className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-400">
                                <span className="font-medium text-amber-800 block mb-1">If Not Addressed:</span>
                                <p className="text-amber-700 text-sm leading-relaxed">{finding.consequence}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* General Findings Section */}
              {analysis.keyFindings.filter(f => f.importance === 'low').length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    General Information & Notes
                  </h2>
                  <div className="grid gap-4">
                    {analysis.keyFindings.filter(f => f.importance === 'low').map((finding, index) => (
                      <Card key={index} className="shadow-lg border-0 bg-green-50/80 backdrop-blur-sm border-green-200">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-semibold text-lg text-green-900">{finding.title}</h3>
                            <div className="flex gap-2">
                              {finding.category && (
                                <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                                  {finding.category.replace('_', ' ').toUpperCase()}
                                </Badge>
                              )}
                              <Badge className="bg-green-100 text-green-800 border-green-200 border">
                                INFO
                              </Badge>
                            </div>
                          </div>
                          <p className="text-green-800 leading-relaxed mb-4">{finding.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {finding.actionRequired && (
                              <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                                <span className="font-medium text-blue-800 block mb-1">Optional Action:</span>
                                <p className="text-blue-700 text-sm">{finding.actionRequired}</p>
                              </div>
                            )}
                            
                            {finding.amount && (
                              <div className="bg-green-100 p-3 rounded-lg border-l-4 border-green-400">
                                <span className="font-medium text-green-800 block mb-1">Amount:</span>
                                <p className="text-green-700 text-sm font-semibold">{finding.amount}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Card className="shadow-lg border-0 bg-gray-50/80 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">No Key Findings Available</p>
                <p className="text-gray-500">This document may not contain specific items requiring attention, or the analysis is still processing.</p>
              </CardContent>
            </Card>
          )}

          {analysis.missingInformation && analysis.missingInformation.length > 0 && (
            <Card className="shadow-lg border-0 bg-yellow-50/80 backdrop-blur-sm border-yellow-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="h-5 w-5" />
                  Missing Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.missingInformation.map((missing, index) => (
                  <div key={index} className="bg-white/60 p-4 rounded-lg">
                    <div className="font-medium text-yellow-900 mb-1">{missing.field}</div>
                    <div className="text-sm text-yellow-800 mb-2">{missing.description}</div>
                    <div className="text-xs text-yellow-700 font-medium">Impact: {missing.impact}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          {analysis.recommendations && analysis.recommendations.length > 0 ? (
            <div className="space-y-8">
              {/* Urgent Recommendations */}
              {analysis.recommendations.filter(r => r.priority === 'urgent').length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-red-800 mb-6 flex items-center gap-3">
                    <AlertCircle className="h-6 w-6" />
                    Urgent Recommendations - Take Action Immediately
                  </h2>
                  <div className="space-y-6">
                    {analysis.recommendations.filter(r => r.priority === 'urgent').map((rec, index) => (
                      <Card key={index} className="shadow-xl border-0 bg-gradient-to-r from-red-50 to-pink-50 backdrop-blur-sm border-red-200">
                        <CardContent className="p-8">
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-red-100 rounded-full">
                                {getCategoryIcon(rec.category)}
                              </div>
                              <div>
                                <h3 className="font-bold text-xl text-red-900 mb-1">{rec.title}</h3>
                                <p className="text-red-700 font-medium uppercase text-sm tracking-wide">
                                  {rec.category.replace('_', ' ')} • IMMEDIATE ACTION REQUIRED
                                </p>
                              </div>
                            </div>
                            <Badge className="bg-red-500 text-white border-red-600 px-4 py-2 text-sm font-bold">
                              URGENT
                            </Badge>
                          </div>
                          
                          <div className="bg-white/80 p-6 rounded-lg border-l-4 border-red-500 mb-4">
                            <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              What You Need To Do:
                            </h4>
                            <p className="text-red-800 leading-relaxed text-lg">{rec.description}</p>
                          </div>
                          
                          <div className="bg-red-100/50 p-4 rounded-lg">
                            <p className="text-red-800 text-sm font-medium flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Time-sensitive: Address this within 24-48 hours to avoid complications
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Important Recommendations */}
              {analysis.recommendations.filter(r => r.priority === 'important').length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-orange-800 mb-6 flex items-center gap-3">
                    <Target className="h-6 w-6" />
                    Important Recommendations - Plan Your Actions
                  </h2>
                  <div className="space-y-6">
                    {analysis.recommendations.filter(r => r.priority === 'important').map((rec, index) => (
                      <Card key={index} className="shadow-lg border-0 bg-gradient-to-r from-orange-50 to-yellow-50 backdrop-blur-sm border-orange-200">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-5">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-orange-100 rounded-full">
                                {getCategoryIcon(rec.category)}
                              </div>
                              <div>
                                <h3 className="font-bold text-lg text-orange-900">{rec.title}</h3>
                                <p className="text-orange-700 font-medium text-sm uppercase tracking-wide">
                                  {rec.category.replace('_', ' ')} • HIGH PRIORITY
                                </p>
                              </div>
                            </div>
                            <Badge className="bg-orange-500 text-white border-orange-600 px-3 py-1 font-semibold">
                              IMPORTANT
                            </Badge>
                          </div>
                          
                          <div className="bg-white/70 p-5 rounded-lg border-l-4 border-orange-400 mb-4">
                            <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              Recommended Action Plan:
                            </h4>
                            <p className="text-orange-800 leading-relaxed">{rec.description}</p>
                          </div>
                          
                          <div className="bg-orange-100/50 p-3 rounded-lg">
                            <p className="text-orange-700 text-sm flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Suggested timeline: Complete within 1-2 weeks for optimal results
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Recommendations */}
              {analysis.recommendations.filter(r => r.priority === 'suggested').length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center gap-3">
                    <CheckCircle className="h-6 w-6" />
                    Suggested Improvements - Enhance Your Experience
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    {analysis.recommendations.filter(r => r.priority === 'suggested').map((rec, index) => (
                      <Card key={index} className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50 backdrop-blur-sm border-blue-200">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 rounded-full">
                                {getCategoryIcon(rec.category)}
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg text-blue-900">{rec.title}</h3>
                                <p className="text-blue-700 text-sm font-medium uppercase tracking-wide">
                                  {rec.category.replace('_', ' ')}
                                </p>
                              </div>
                            </div>
                            <Badge className="bg-blue-500 text-white border-blue-600 px-3 py-1">
                              SUGGESTED
                            </Badge>
                          </div>
                          
                          <div className="bg-white/60 p-4 rounded-lg border-l-4 border-blue-400">
                            <p className="text-blue-800 leading-relaxed">{rec.description}</p>
                          </div>
                          
                          <div className="mt-4 p-3 bg-blue-100/50 rounded-lg">
                            <p className="text-blue-700 text-sm flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              Optional enhancement - implement when convenient
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary Action Card */}
              <Card className="shadow-xl border-0 bg-gradient-to-r from-indigo-50 to-purple-50 backdrop-blur-sm border-indigo-200">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-indigo-800 flex items-center gap-3">
                    <Target className="h-6 w-6" />
                    Action Summary & Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-red-100 rounded-lg">
                      <div className="text-2xl font-bold text-red-800 mb-2">
                        {analysis.recommendations.filter(r => r.priority === 'urgent').length}
                      </div>
                      <p className="text-red-700 font-medium">Urgent Actions</p>
                      <p className="text-red-600 text-sm mt-1">Complete within 24-48 hours</p>
                    </div>
                    
                    <div className="text-center p-4 bg-orange-100 rounded-lg">
                      <div className="text-2xl font-bold text-orange-800 mb-2">
                        {analysis.recommendations.filter(r => r.priority === 'important').length}
                      </div>
                      <p className="text-orange-700 font-medium">Important Tasks</p>
                      <p className="text-orange-600 text-sm mt-1">Plan for 1-2 weeks</p>
                    </div>
                    
                    <div className="text-center p-4 bg-blue-100 rounded-lg">
                      <div className="text-2xl font-bold text-blue-800 mb-2">
                        {analysis.recommendations.filter(r => r.priority === 'suggested').length}
                      </div>
                      <p className="text-blue-700 font-medium">Suggestions</p>
                      <p className="text-blue-600 text-sm mt-1">Optional improvements</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-indigo-100/50 rounded-lg">
                    <p className="text-indigo-800 text-center font-medium">
                      💡 Pro Tip: Start with urgent items, then tackle important tasks systematically. 
                      Keep suggested improvements for when you have extra time.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="shadow-lg border-0 bg-gray-50/80 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Target className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-700 mb-3">No Specific Recommendations Available</h3>
                <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                  This document appears to be complete and doesn't require specific action items at this time. 
                  Check back after any document updates or changes to your situation.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Next Steps Tab */}
        <TabsContent value="next-steps" className="space-y-6">
          <div className="space-y-8">
            {/* Immediate Actions Section */}
            <Card className="shadow-xl border-0 bg-gradient-to-r from-red-50 to-pink-50 backdrop-blur-sm border-red-200">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-red-800 flex items-center gap-3">
                  <AlertCircle className="h-6 w-6" />
                  Immediate Actions (Next 24-48 Hours)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {analysis.keyFindings && analysis.keyFindings.filter(f => f.importance === 'high').length > 0 ? (
                    analysis.keyFindings.filter(f => f.importance === 'high').map((finding, index) => (
                      <div key={index} className="bg-white/80 p-5 rounded-lg border-l-4 border-red-500">
                        <div className="flex items-start gap-4">
                          <div className="bg-red-100 p-2 rounded-full flex-shrink-0 mt-1">
                            <span className="text-red-800 font-bold text-sm">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-red-900 mb-2">{finding.title}</h4>
                            <p className="text-red-800 mb-3">{finding.actionRequired || finding.description}</p>
                            {finding.deadline && (
                              <div className="bg-red-100 p-2 rounded text-sm">
                                <span className="font-medium text-red-900">⏰ Deadline: </span>
                                <span className="text-red-800">{finding.deadline}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white/80 p-6 rounded-lg text-center">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                      <h4 className="font-semibold text-green-800 mb-2">No Immediate Actions Required</h4>
                      <p className="text-green-700">Your enrollment documentation appears to be in good order with no urgent issues.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Short-term Planning Section */}
            <Card className="shadow-lg border-0 bg-gradient-to-r from-orange-50 to-yellow-50 backdrop-blur-sm border-orange-200">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-orange-800 flex items-center gap-3">
                  <Clock className="h-6 w-6" />
                  Short-term Planning (Next 1-2 Weeks)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Important Findings as Actions */}
                  {analysis.keyFindings && analysis.keyFindings.filter(f => f.importance === 'medium').length > 0 && (
                    <div>
                      <h4 className="font-semibold text-orange-900 mb-4 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Priority Tasks to Complete
                      </h4>
                      <div className="space-y-4">
                        {analysis.keyFindings.filter(f => f.importance === 'medium').map((finding, index) => (
                          <div key={index} className="bg-white/70 p-4 rounded-lg border-l-4 border-orange-400">
                            <div className="flex items-start gap-3">
                              <div className="bg-orange-100 p-1 rounded-full flex-shrink-0 mt-1">
                                <span className="text-orange-800 font-bold text-xs w-5 h-5 flex items-center justify-center">{index + 1}</span>
                              </div>
                              <div>
                                <h5 className="font-medium text-orange-900 mb-1">{finding.title}</h5>
                                <p className="text-orange-800 text-sm">{finding.actionRequired || finding.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Important Recommendations */}
                  {analysis.recommendations && analysis.recommendations.filter(r => r.priority === 'important').length > 0 && (
                    <div>
                      <h4 className="font-semibold text-orange-900 mb-4 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Recommended Preparations
                      </h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        {analysis.recommendations.filter(r => r.priority === 'important').map((rec, index) => (
                          <div key={index} className="bg-white/60 p-4 rounded-lg border border-orange-200">
                            <h5 className="font-medium text-orange-900 mb-2">{rec.title}</h5>
                            <p className="text-orange-700 text-sm">{rec.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(!analysis.keyFindings || analysis.keyFindings.filter(f => f.importance === 'medium').length === 0) && 
                   (!analysis.recommendations || analysis.recommendations.filter(r => r.priority === 'important').length === 0) && (
                    <div className="bg-white/70 p-6 rounded-lg text-center">
                      <CheckCircle className="h-10 w-10 text-green-600 mx-auto mb-3" />
                      <h4 className="font-semibold text-green-800 mb-2">Well Prepared!</h4>
                      <p className="text-green-700">No specific short-term actions are required. Focus on general preparation activities.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Long-term Preparation Section */}
            <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50 backdrop-blur-sm border-blue-200">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-blue-800 flex items-center gap-3">
                  <Building2 className="h-6 w-6" />
                  Long-term Preparation & Academic Success
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Academic Preparations */}
                  <div className="bg-white/70 p-6 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Academic Excellence
                    </h4>
                    <div className="space-y-3">
                      {analysis.gpaRequirement && (
                        <div className="bg-blue-100 p-3 rounded">
                          <span className="font-medium text-blue-800">Maintain GPA: </span>
                          <span className="text-blue-700">{analysis.gpaRequirement}</span>
                        </div>
                      )}
                      {analysis.attendanceRequirement && (
                        <div className="bg-blue-100 p-3 rounded">
                          <span className="font-medium text-blue-800">Attendance: </span>
                          <span className="text-blue-700">{analysis.attendanceRequirement}</span>
                        </div>
                      )}
                      <div className="text-blue-800 text-sm space-y-1">
                        <p>• Establish study routines early</p>
                        <p>• Connect with academic advisors</p>
                        <p>• Join study groups and academic clubs</p>
                        <p>• Utilize campus resources and libraries</p>
                      </div>
                    </div>
                  </div>

                  {/* Financial Management */}
                  <div className="bg-white/70 p-6 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Financial Management
                    </h4>
                    <div className="space-y-3">
                      {analysis.scholarshipConditions && (
                        <div className="bg-green-100 p-3 rounded">
                          <span className="font-medium text-green-800">Scholarship Requirements: </span>
                          <p className="text-green-700 text-sm mt-1">{analysis.scholarshipConditions.substring(0, 100)}...</p>
                        </div>
                      )}
                      <div className="text-blue-800 text-sm space-y-1">
                        <p>• Monitor scholarship compliance regularly</p>
                        <p>• Set up payment schedules and reminders</p>
                        <p>• Explore additional funding opportunities</p>
                        <p>• Create emergency financial plans</p>
                      </div>
                    </div>
                  </div>

                  {/* Career Development */}
                  <div className="bg-white/70 p-6 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Career & Work Authorization
                    </h4>
                    <div className="space-y-3">
                      {analysis.workAuthorization && (
                        <div className="bg-indigo-100 p-3 rounded">
                          <span className="font-medium text-indigo-800">Work Rights: </span>
                          <p className="text-indigo-700 text-sm mt-1">{analysis.workAuthorization.substring(0, 100)}...</p>
                        </div>
                      )}
                      {analysis.internshipRequired && (
                        <div className="bg-purple-100 p-3 rounded">
                          <span className="font-medium text-purple-800">Internship: </span>
                          <span className="text-purple-700">{analysis.internshipRequired}</span>
                        </div>
                      )}
                      <div className="text-blue-800 text-sm space-y-1">
                        <p>• Research career services early</p>
                        <p>• Understand work permit processes</p>
                        <p>• Build professional networks</p>
                        <p>• Plan internship applications</p>
                      </div>
                    </div>
                  </div>

                  {/* Compliance & Legal */}
                  <div className="bg-white/70 p-6 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Compliance & Legal
                    </h4>
                    <div className="space-y-3">
                      {analysis.visaObligations && (
                        <div className="bg-red-100 p-3 rounded">
                          <span className="font-medium text-red-800">Visa Obligations: </span>
                          <p className="text-red-700 text-sm mt-1">{analysis.visaObligations.substring(0, 100)}...</p>
                        </div>
                      )}
                      <div className="text-blue-800 text-sm space-y-1">
                        <p>• Stay updated on immigration rules</p>
                        <p>• Maintain valid documentation</p>
                        <p>• Report address changes promptly</p>
                        <p>• Seek legal advice when needed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline Summary */}
            <Card className="shadow-xl border-0 bg-gradient-to-r from-indigo-50 to-purple-50 backdrop-blur-sm border-indigo-200">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-indigo-800 flex items-center gap-3">
                  <Target className="h-6 w-6" />
                  Your Complete Action Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="text-center p-6 bg-red-100 rounded-xl">
                      <div className="text-3xl font-bold text-red-800 mb-2">
                        {analysis.keyFindings ? analysis.keyFindings.filter(f => f.importance === 'high').length : 0}
                      </div>
                      <p className="text-red-700 font-semibold mb-1">Immediate Actions</p>
                      <p className="text-red-600 text-sm">Next 24-48 hours</p>
                    </div>
                    
                    <div className="text-center p-6 bg-orange-100 rounded-xl">
                      <div className="text-3xl font-bold text-orange-800 mb-2">
                        {(analysis.keyFindings ? analysis.keyFindings.filter(f => f.importance === 'medium').length : 0) + 
                         (analysis.recommendations ? analysis.recommendations.filter(r => r.priority === 'important').length : 0)}
                      </div>
                      <p className="text-orange-700 font-semibold mb-1">Short-term Tasks</p>
                      <p className="text-orange-600 text-sm">Next 1-2 weeks</p>
                    </div>
                    
                    <div className="text-center p-6 bg-blue-100 rounded-xl">
                      <div className="text-3xl font-bold text-blue-800 mb-2">∞</div>
                      <p className="text-blue-700 font-semibold mb-1">Ongoing Success</p>
                      <p className="text-blue-600 text-sm">Throughout studies</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-lg">
                    <h4 className="font-bold text-indigo-900 mb-3 text-center">Success Strategy</h4>
                    <div className="grid gap-4 md:grid-cols-2 text-sm">
                      <div>
                        <p className="font-medium text-indigo-800 mb-2">🎯 Focus Areas:</p>
                        <ul className="text-indigo-700 space-y-1">
                          <li>• Academic excellence and compliance</li>
                          <li>• Financial planning and scholarship maintenance</li>
                          <li>• Career development and networking</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-indigo-800 mb-2">📋 Regular Reviews:</p>
                        <ul className="text-indigo-700 space-y-1">
                          <li>• Monthly progress check-ins</li>
                          <li>• Semester academic assessments</li>
                          <li>• Annual financial and visa reviews</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Complete Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <div className="space-y-6">
            {/* Scholarship & Financial Aid Information Card */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-amber-800">
                  <Target className="h-5 w-5" />
                  Scholarship & Financial Aid Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <span className="font-medium text-gray-600">Scholarship Details:</span>
                  <p className="text-gray-800 whitespace-pre-wrap">{analysis.scholarshipDetails || "Not specified in document"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Scholarship Percentage:</span>
                  <p className="text-gray-800">{analysis.scholarshipPercentage || "Not specified in document"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Scholarship Duration:</span>
                  <p className="text-gray-800">{analysis.scholarshipDuration || "Not specified in document"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Scholarship Conditions:</span>
                  <p className="text-gray-800 whitespace-pre-wrap">{analysis.scholarshipConditions || "Not specified in document"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Internship & Work Authorization Card */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-indigo-800">
                  <Building2 className="h-5 w-5" />
                  Internship & Work Authorization
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <span className="font-medium text-gray-600">Internship Required:</span>
                  <p className="text-gray-800">{analysis.internshipRequired || "Not specified in document"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Internship Duration:</span>
                  <p className="text-gray-800">{analysis.internshipDuration || "Not specified in document"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Work Authorization:</span>
                  <p className="text-gray-800 whitespace-pre-wrap">{analysis.workAuthorization || "Not specified in document"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Work Hours Limit:</span>
                  <p className="text-gray-800">{analysis.workHoursLimit || "Not specified in document"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Academic Requirements & Terms Card */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <BookOpen className="h-5 w-5" />
                  Academic Requirements & Terms to Fulfil
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <span className="font-medium text-gray-600">Academic Requirements:</span>
                  <p className="text-gray-800 whitespace-pre-wrap">{analysis.academicRequirements || "Not specified in document"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">GPA Requirement:</span>
                  <p className="text-gray-800">{analysis.gpaRequirement || "Not specified in document"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Attendance Requirement:</span>
                  <p className="text-gray-800">{analysis.attendanceRequirement || "Not specified in document"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Terms to Fulfil:</span>
                  <p className="text-gray-800 whitespace-pre-wrap">{analysis.termsToFulfil || "Not specified in document"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Language Requirements:</span>
                  <p className="text-gray-800">{analysis.languageRequirements || "Not specified in document"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Graduation Requirements:</span>
                  <p className="text-gray-800 whitespace-pre-wrap">{analysis.graduationRequirements || "Not specified in document"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Payment & Banking Information Card */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <CreditCard className="h-5 w-5" />
                  Payment & Banking Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <span className="font-medium text-gray-600">Payment Schedule:</span>
                  <p className="text-gray-800 whitespace-pre-wrap">{analysis.paymentSchedule || "Not specified in document"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Bank Details:</span>
                  <p className="text-gray-800 whitespace-pre-wrap">{analysis.bankDetails || "Not specified in document"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Conditions of Offer:</span>
                  <p className="text-gray-800 whitespace-pre-wrap">{analysis.conditionsOfOffer || "Not specified in document"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Document Details & Support Card */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <FileText className="h-5 w-5" />
                  Document Details & Support
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <span className="font-medium text-gray-600">Health Cover Details:</span>
                  <p className="text-gray-800">{analysis.healthCover || "Not specified in document"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">English Test Score:</span>
                  <p className="text-gray-800">{analysis.englishTestScore || "Not specified in document"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Institution Contact:</span>
                  <p className="text-gray-800">{analysis.institutionContact || "Not specified in document"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Visa Obligations:</span>
                  <p className="text-gray-800">{analysis.visaObligations || "Not specified in document"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Orientation Date:</span>
                  <p className="text-gray-800">{analysis.orientationDate || "Not specified in document"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Passport Details:</span>
                  <p className="text-gray-800">{analysis.passportDetails || "Not specified in document"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Support Services:</span>
                  <p className="text-gray-800">{analysis.supportServices || "Not specified in document"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};