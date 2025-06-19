import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  DollarSign, 
  User,
  Calendar,
  Building,
  GraduationCap,
  CreditCard,
  Shield,
  Info
} from 'lucide-react';

interface AnalysisData {
  id: number;
  filename: string;
  documentType: string;
  institutionName?: string;
  studentName?: string;
  programName?: string;
  summary?: string;
  analysis?: any;
  createdAt: string;
  userId?: number;
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
}

// Function to parse analysis data safely with enhanced structure handling
const parseAnalysisData = (analysis: any): any => {
  let parsedData: any = {};
  
  console.log('AnalysisDisplay - Input analysis data:', analysis);
  
  try {
    // Parse the main analysis JSON field
    if (analysis?.analysis && analysis.analysis !== null && analysis.analysis !== '') {
      try {
        const rawAnalysisData = typeof analysis.analysis === 'string' ? JSON.parse(analysis.analysis) : analysis.analysis;
        parsedData = { ...rawAnalysisData };
        
        console.log('AnalysisDisplay - Parsed structured analysis data:', parsedData);
        
        // Extract structured data from nested objects
        if (rawAnalysisData.institutionDetails) {
          parsedData.institutionName = rawAnalysisData.institutionDetails.institutionName;
          parsedData.registrationCode = rawAnalysisData.institutionDetails.registrationCode;
          parsedData.country = rawAnalysisData.institutionDetails.country;
          if (rawAnalysisData.institutionDetails.contactInfo) {
            parsedData.institutionContact = `Phone: ${rawAnalysisData.institutionDetails.contactInfo.phone}, Email: ${rawAnalysisData.institutionDetails.contactInfo.email}`;
          }
        }
        
        if (rawAnalysisData.courseDetails) {
          parsedData.programName = rawAnalysisData.courseDetails.courseTitle;
          parsedData.programLevel = rawAnalysisData.courseDetails.level;
          parsedData.fieldOfStudy = rawAnalysisData.courseDetails.fieldOfStudy;
          parsedData.studyMode = rawAnalysisData.courseDetails.studyMode;
          parsedData.courseCode = rawAnalysisData.courseDetails.courseCode;
          
          if (rawAnalysisData.courseDetails.duration) {
            parsedData.startDate = rawAnalysisData.courseDetails.duration.startDate;
            parsedData.endDate = rawAnalysisData.courseDetails.duration.endDate;
            parsedData.duration = rawAnalysisData.courseDetails.duration.totalDuration;
          }
        }
        
        if (rawAnalysisData.studentDetails) {
          parsedData.studentName = rawAnalysisData.studentDetails.fullName;
          parsedData.studentId = rawAnalysisData.studentDetails.studentId;
          parsedData.dateOfBirth = rawAnalysisData.studentDetails.dateOfBirth;
          parsedData.nationality = rawAnalysisData.studentDetails.nationality;
          parsedData.gender = rawAnalysisData.studentDetails.gender;
          parsedData.age = rawAnalysisData.studentDetails.age;
        }
        
        if (rawAnalysisData.financialDetails) {
          parsedData.tuitionFee = rawAnalysisData.financialDetails.totalTuitionFee;
          parsedData.otherFees = rawAnalysisData.financialDetails.otherFees;
          parsedData.initialPrepaid = rawAnalysisData.financialDetails.initialPrepaid;
          
          if (rawAnalysisData.financialDetails.scholarships) {
            parsedData.scholarship = rawAnalysisData.financialDetails.scholarships.details;
            parsedData.scholarshipValue = rawAnalysisData.financialDetails.scholarships.value;
          }
          
          if (rawAnalysisData.financialDetails.costBreakdown) {
            parsedData.perYearCost = rawAnalysisData.financialDetails.costBreakdown.perYear;
            parsedData.perSemesterCost = rawAnalysisData.financialDetails.costBreakdown.perSemester;
          }
        }
        
        if (rawAnalysisData.healthInsurance) {
          parsedData.oshcProvider = rawAnalysisData.healthInsurance.provider;
          parsedData.oshcCoverage = rawAnalysisData.healthInsurance.coverageType;
          parsedData.oshcCost = rawAnalysisData.healthInsurance.estimatedCost;
          if (rawAnalysisData.healthInsurance.coveragePeriod) {
            parsedData.oshcStartDate = rawAnalysisData.healthInsurance.coveragePeriod.startDate;
            parsedData.oshcEndDate = rawAnalysisData.healthInsurance.coveragePeriod.endDate;
          }
        }
        
        if (rawAnalysisData.languageRequirements) {
          parsedData.testType = rawAnalysisData.languageRequirements.testType;
          parsedData.testScore = rawAnalysisData.languageRequirements.scoreAchieved;
          parsedData.testDate = rawAnalysisData.languageRequirements.testDate;
          parsedData.testStatus = rawAnalysisData.languageRequirements.requirementStatus;
        }
      } catch (parseError) {
        console.error('Failed to parse structured analysis:', parseError);
      }
    }
    
    // Extract from direct database fields as fallback
    const directFields = [
      'institutionName', 'studentName', 'programName', 'programLevel', 
      'startDate', 'endDate', 'tuitionAmount', 'currency', 'scholarshipAmount',
      'totalCost', 'healthCover', 'englishTestScore', 'institutionContact',
      'visaObligations', 'paymentSchedule', 'bankDetails', 'summary'
    ];
    
    directFields.forEach(field => {
      if (analysis[field] && !parsedData[field]) {
        parsedData[field] = analysis[field];
      }
    });
    
    // Parse JSON fields from database
    if (analysis.languageRequirements && typeof analysis.languageRequirements === 'string') {
      try {
        const langReq = JSON.parse(analysis.languageRequirements);
        if (!parsedData.testType) parsedData.testType = langReq.testType;
        if (!parsedData.testScore) parsedData.testScore = langReq.scoreAchieved;
        if (!parsedData.testDate) parsedData.testDate = langReq.testDate;
        if (!parsedData.testStatus) parsedData.testStatus = langReq.requirementStatus;
      } catch (e) {
        console.error('Error parsing languageRequirements:', e);
      }
    }
    
    console.log('AnalysisDisplay - Final parsed data:', parsedData);
    
  } catch (error) {
    console.error('Error parsing analysis data:', error);
  }
  
  return parsedData;
};

// Function to extract financial information
const extractFinancialInfo = (parsedData: any, rawAnalysis: any) => {
  const financialFields = [
    { key: 'tuitionFee', label: 'Total Tuition Fee', paths: ['tuitionFee', 'totalTuitionFee'] },
    { key: 'otherFees', label: 'Other Fees', paths: ['otherFees'] },
    { key: 'initialPrepaid', label: 'Initial Prepaid', paths: ['initialPrepaid'] },
    { key: 'totalCost', label: 'Total Cost', paths: ['totalCost'] },
    { key: 'scholarship', label: 'Scholarship', paths: ['scholarship'] },
    { key: 'scholarshipValue', label: 'Scholarship Value', paths: ['scholarshipValue'] },
    { key: 'oshcProvider', label: 'Health Insurance Provider', paths: ['oshcProvider'] },
    { key: 'oshcCost', label: 'Health Insurance Cost', paths: ['oshcCost'] },
    { key: 'perYearCost', label: 'Cost Per Year', paths: ['perYearCost'] },
    { key: 'perSemesterCost', label: 'Cost Per Semester', paths: ['perSemesterCost'] }
  ];

  return financialFields.map(field => {
    let value = 'Not specified in document';
    
    if (parsedData && parsedData[field.key]) {
      value = parsedData[field.key];
    } else if (rawAnalysis[field.key]) {
      value = rawAnalysis[field.key];
    }
    
    return { ...field, value };
  });
};

// Function to extract academic information
const extractAcademicInfo = (parsedData: any, rawAnalysis: any) => {
  const academicFields = [
    { key: 'institutionName', label: 'Institution' },
    { key: 'programName', label: 'Program' },
    { key: 'programLevel', label: 'Level' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date' },
    { key: 'duration', label: 'Duration' },
    { key: 'fieldOfStudy', label: 'Field of Study' },
    { key: 'studyMode', label: 'Study Mode' },
    { key: 'courseCode', label: 'Course Code' },
    { key: 'registrationCode', label: 'Registration Code' }
  ];

  return academicFields.map(field => {
    let value = 'Not specified in document';
    
    if (parsedData && parsedData[field.key]) {
      value = parsedData[field.key];
    } else if (rawAnalysis[field.key]) {
      value = rawAnalysis[field.key];
    }
    
    return { ...field, value };
  });
};

// Function to highlight numerical values
const highlightNumbers = (text: string) => {
  if (!text || typeof text !== 'string') return text;
  
  const numberRegex = /(\$?[\d,]+\.?\d*\s?(?:USD|CAD|EUR|GBP|AUD|₹)?|\d+\.?\d*\s?%|[A-Z]{2,4}-?\d+|\d+\.\d+\s?(?:GPA|CGPA)|\d+\s?(?:credits?|hours?|semesters?|years?|months?))/gi;
  
  return text.replace(numberRegex, '<span class="bg-blue-100 text-blue-800 px-1 rounded font-medium">$1</span>');
};

export default function AnalysisDisplay({ analysis }: { analysis: AnalysisData }) {
  // Handle case where analysis might be an array instead of object
  const analysisData = Array.isArray(analysis) ? analysis[0] : analysis;
  const parsedData = parseAnalysisData(analysisData);
  const academicInfo = extractAcademicInfo(parsedData, analysisData);
  const financialInfo = extractFinancialInfo(parsedData, analysisData);

  return (
    <div className="w-full max-w-none space-y-8">
      {/* Header Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Document Type</p>
                <p className="font-semibold text-gray-900">Enrollment Analysis</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Analysis Date</p>
                <p className="font-semibold text-gray-900">
                  {analysisData.createdAt ? new Date(analysisData.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  }) : 'Not available'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Document</p>
                <p className="font-semibold text-gray-900">{analysisData.filename}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="grid w-full grid-cols-4 h-12">
          <TabsTrigger value="overview" className="flex items-center gap-2 text-sm font-medium">
            <FileText className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="academic" className="flex items-center gap-2 text-sm font-medium">
            <GraduationCap className="h-4 w-4" />
            Academic
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2 text-sm font-medium">
            <DollarSign className="h-4 w-4" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="requirements" className="flex items-center gap-2 text-sm font-medium">
            <Shield className="h-4 w-4" />
            Requirements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
              <CardTitle className="text-2xl text-gray-800">Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div 
                className="whitespace-pre-wrap text-gray-700 leading-relaxed break-words text-base max-w-none overflow-hidden"
                dangerouslySetInnerHTML={{ 
                  __html: highlightNumbers(analysisData.summary || parsedData.summary || 'No summary available')
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic" className="space-y-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-2xl text-gray-800">
                <GraduationCap className="h-6 w-6" />
                Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {academicInfo.map((field, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Building className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      <span className="font-semibold text-gray-700 text-base">{field.label}</span>
                    </div>
                    <div 
                      className="text-gray-600 pl-8 break-words whitespace-pre-wrap text-base leading-relaxed max-w-none overflow-hidden word-wrap"
                      dangerouslySetInnerHTML={{ 
                        __html: highlightNumbers(field.value || 'Not specified in document')
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-2xl text-gray-800">
                <CreditCard className="h-6 w-6" />
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {financialInfo.map((field, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      <span className="font-semibold text-gray-700 text-base">{field.label}</span>
                    </div>
                    <div 
                      className="text-gray-600 pl-8 break-words whitespace-pre-wrap text-base leading-relaxed max-w-none overflow-hidden word-wrap"
                      dangerouslySetInnerHTML={{ 
                        __html: highlightNumbers(field.value || 'Not specified in document')
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-6">
          {/* Key Findings */}
          {analysisData.keyFindings && analysisData.keyFindings.length > 0 && (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                  <Info className="h-5 w-5" />
                  Key Findings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {analysisData.keyFindings.map((finding: any, index: number) => (
                  <div key={index} className="border-l-4 border-blue-400 pl-6 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{finding.title}</h4>
                      <Badge variant={finding.importance === 'high' ? 'destructive' : finding.importance === 'medium' ? 'default' : 'secondary'}>
                        {finding.importance}
                      </Badge>
                      {finding.category && (
                        <Badge variant="outline">{finding.category}</Badge>
                      )}
                    </div>
                    <p className="text-gray-700 mb-2">{finding.description}</p>
                    {finding.actionRequired && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="font-medium text-gray-800 mb-1">Action Required:</p>
                        <p className="text-gray-700">{finding.actionRequired}</p>
                        {finding.deadline && (
                          <p className="text-sm text-red-600 mt-1">Deadline: {finding.deadline}</p>
                        )}
                        {finding.amount && (
                          <p className="text-sm text-blue-600 mt-1">Amount: {finding.amount}</p>
                        )}
                        {finding.consequence && (
                          <p className="text-sm text-orange-600 mt-1">Consequence: {finding.consequence}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Language Requirements */}
          {parsedData.testType && (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                  <Shield className="h-5 w-5" />
                  Language Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="font-medium text-gray-700">Test Type</p>
                    <p className="text-gray-600">{parsedData.testType || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Score</p>
                    <p className="text-gray-600">{parsedData.testScore || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Test Date</p>
                    <p className="text-gray-600">{parsedData.testDate || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Health Insurance */}
          {parsedData.oshcProvider && (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                  <Shield className="h-5 w-5" />
                  Health Insurance (OSHC)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="font-medium text-gray-700">Provider</p>
                    <p className="text-gray-600">{parsedData.oshcProvider || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Coverage Type</p>
                    <p className="text-gray-600">{parsedData.oshcCoverage || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Coverage Period</p>
                    <p className="text-gray-600">
                      {parsedData.oshcStartDate && parsedData.oshcEndDate 
                        ? `${parsedData.oshcStartDate} to ${parsedData.oshcEndDate}`
                        : 'Not specified'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}