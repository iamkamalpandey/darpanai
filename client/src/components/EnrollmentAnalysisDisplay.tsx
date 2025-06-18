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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="findings" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
            Key Findings
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
            Recommendations
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
            <div className="grid gap-6">
              {analysis.keyFindings.map((finding, index) => (
                <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-lg text-gray-800">{finding.title}</h3>
                      <div className="flex gap-2">
                        {finding.category && (
                          <Badge variant="outline" className="text-xs">
                            {finding.category.replace('_', ' ')}
                          </Badge>
                        )}
                        <Badge className={`${getImportanceBadgeColor(finding.importance)} border`}>
                          {finding.importance}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-4">{finding.description}</p>
                    
                    {/* Enhanced finding details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {finding.actionRequired && (
                        <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                          <span className="font-medium text-blue-800">Action Required:</span>
                          <p className="text-blue-700 text-sm mt-1">{finding.actionRequired}</p>
                        </div>
                      )}
                      
                      {finding.deadline && (
                        <div className="bg-red-50 p-3 rounded-lg border-l-4 border-red-400">
                          <span className="font-medium text-red-800">Deadline:</span>
                          <p className="text-red-700 text-sm mt-1">{finding.deadline}</p>
                        </div>
                      )}
                      
                      {finding.amount && (
                        <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
                          <span className="font-medium text-green-800">Amount:</span>
                          <p className="text-green-700 text-sm mt-1 font-semibold">{finding.amount}</p>
                        </div>
                      )}
                      
                      {finding.consequence && (
                        <div className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-400">
                          <span className="font-medium text-amber-800">Consequence:</span>
                          <p className="text-amber-700 text-sm mt-1">{finding.consequence}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="shadow-lg border-0 bg-gray-50/80 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No specific key findings available for this analysis.</p>
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
            <div className="grid gap-6">
              {analysis.recommendations.map((rec, index) => (
                <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(rec.category)}
                        <h3 className="font-semibold text-lg text-gray-800">{rec.title}</h3>
                      </div>
                      <Badge className={`${getPriorityBadgeColor(rec.priority)} border`}>
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{rec.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="shadow-lg border-0 bg-gray-50/80 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No specific recommendations available for this analysis.</p>
              </CardContent>
            </Card>
          )}
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