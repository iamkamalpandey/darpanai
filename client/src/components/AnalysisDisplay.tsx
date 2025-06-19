import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  School, 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
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
  rejectionReasons?: Array<{
    title: string;
    description: string;
    category?: string;
    severity?: 'high' | 'medium' | 'low';
  }>;
  recommendations?: Array<{
    title: string;
    description: string;
    priority?: 'urgent' | 'important' | 'suggested';
  }>;
  nextSteps?: Array<{
    title: string;
    description: string;
    category?: 'immediate' | 'short_term' | 'long_term';
    step?: string;
  }> | string;
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
  
  try {
    // First try to get structured analysis from the analysis field (priority)
    if (analysis?.analysis && analysis.analysis !== null && analysis.analysis !== '') {
      try {
        const rawAnalysisData = typeof analysis.analysis === 'string' ? JSON.parse(analysis.analysis) : analysis.analysis;
        parsedData = { ...rawAnalysisData };
        
        console.log('AnalysisDisplay - Using structured analysis data:', parsedData);
        
        // Flatten nested structures from structured analysis
        if (parsedData.institutionDetails) {
          parsedData.institutionName = parsedData.institutionDetails.institutionName;
          parsedData.registrationCode = parsedData.institutionDetails.registrationCode;
          parsedData.country = parsedData.institutionDetails.country;
        }
        
        if (parsedData.courseDetails) {
          parsedData.programName = parsedData.courseDetails.courseTitle;
          parsedData.programLevel = parsedData.courseDetails.level;
          parsedData.fieldOfStudy = parsedData.courseDetails.fieldOfStudy;
          parsedData.studyMode = parsedData.courseDetails.studyMode;
          parsedData.courseCode = parsedData.courseDetails.courseCode;
          
          if (parsedData.courseDetails.duration) {
            parsedData.startDate = parsedData.courseDetails.duration.startDate;
            parsedData.endDate = parsedData.courseDetails.duration.endDate;
            parsedData.duration = parsedData.courseDetails.duration.totalDuration;
          }
        }
        
        if (parsedData.studentDetails) {
          parsedData.studentName = parsedData.studentDetails.fullName;
          parsedData.studentId = parsedData.studentDetails.studentId;
          parsedData.dateOfBirth = parsedData.studentDetails.dateOfBirth;
          parsedData.nationality = parsedData.studentDetails.nationality;
        }
        
        if (parsedData.financialDetails) {
          parsedData.tuitionFee = parsedData.financialDetails.totalTuitionFee;
          parsedData.otherFees = parsedData.financialDetails.otherFees;
          parsedData.initialPrepaid = parsedData.financialDetails.initialPrepaid;
          
          if (parsedData.financialDetails.scholarships) {
            parsedData.scholarship = parsedData.financialDetails.scholarships.details;
            parsedData.scholarshipValue = parsedData.financialDetails.scholarships.value;
          }
          
          if (parsedData.financialDetails.costBreakdown) {
            parsedData.perYearCost = parsedData.financialDetails.costBreakdown.perYear;
            parsedData.perSemesterCost = parsedData.financialDetails.costBreakdown.perSemester;
          }
        }
        
        if (parsedData.healthInsurance) {
          parsedData.oshcProvider = parsedData.healthInsurance.provider;
          parsedData.oshcCoverage = parsedData.healthInsurance.coverageType;
          parsedData.oshcCost = parsedData.healthInsurance.estimatedCost;
        }
        
        if (parsedData.languageRequirements) {
          parsedData.testType = parsedData.languageRequirements.testType;
          parsedData.testScore = parsedData.languageRequirements.scoreAchieved;
          parsedData.testDate = parsedData.languageRequirements.testDate;
        }
      } catch (parseError) {
        console.error('Failed to parse structured analysis:', parseError);
        parsedData = {};
      }
    } else {
      console.log('AnalysisDisplay - No structured analysis found, using fallback extraction');
      parsedData = {};
    }
    
    // Extract data from individual database fields (for newer analyses stored in separate columns)
    if (analysis.languageRequirements) {
      try {
        const langReq = typeof analysis.languageRequirements === 'string' 
          ? JSON.parse(analysis.languageRequirements) 
          : analysis.languageRequirements;
        parsedData.testType = langReq.testType;
        parsedData.testScore = langReq.scoreAchieved;
        parsedData.testDate = langReq.testDate;
      } catch (e) {
        console.error('Error parsing languageRequirements:', e);
      }
    }
    
    if (analysis.scholarshipDetails) {
      try {
        const scholarship = typeof analysis.scholarshipDetails === 'string' 
          ? JSON.parse(analysis.scholarshipDetails) 
          : analysis.scholarshipDetails;
        parsedData.scholarship = scholarship.details || scholarship.name;
        parsedData.scholarshipValue = scholarship.value || scholarship.amount;
      } catch (e) {
        console.error('Error parsing scholarshipDetails:', e);
      }
    }
    
    // Extract direct database fields
    const directFields = [
      'institutionName', 'studentName', 'programName', 'programLevel', 
      'startDate', 'endDate', 'tuitionAmount', 'currency', 'scholarshipAmount',
      'totalCost', 'healthCover', 'englishTestScore', 'institutionContact',
      'visaObligations', 'paymentSchedule', 'bankDetails'
    ];
    
    directFields.forEach(field => {
      if (analysis[field] && !parsedData[field]) {
        parsedData[field] = analysis[field];
      }
    });
    
    // Map database field names to display names
    if (analysis.tuitionAmount && !parsedData.tuitionFee) {
      parsedData.tuitionFee = `${analysis.currency || ''} ${analysis.tuitionAmount}`.trim();
    }
    
    if (analysis.scholarshipAmount && !parsedData.scholarshipValue) {
      parsedData.scholarshipValue = `${analysis.currency || ''} ${analysis.scholarshipAmount}`.trim();
    }
    
    if (analysis.healthCover && !parsedData.oshcProvider) {
      parsedData.oshcProvider = analysis.healthCover;
    }
    
    if (analysis.englishTestScore && !parsedData.testScore) {
      parsedData.testScore = analysis.englishTestScore;
    }
    
  } catch (error) {
    console.error('Error parsing analysis data:', error);
  }
  
  return parsedData;
};

// Function to extract financial information with enhanced structured data handling
const extractFinancialInfo = (parsedData: any, rawAnalysis: any) => {
  const financialFields = [
    { key: 'tuitionFee', label: 'Tuition Fee', paths: ['tuitionFee', 'financialDetails.totalTuitionFee', 'fees.tuition', 'costs.tuition', 'courseFee'], dbField: 'tuitionAmount' },
    { key: 'otherFees', label: 'Other Fees', paths: ['otherFees', 'financialDetails.otherFees', 'fees.other', 'costs.other', 'additionalFees'] },
    { key: 'initialPrepaid', label: 'Initial Prepaid', paths: ['initialPrepaid', 'financialDetails.initialPrepaid', 'prepaidAmount', 'deposit'] },
    { key: 'totalCost', label: 'Total Cost', paths: ['totalCost', 'fees.total', 'costs.total', 'totalAmount'], dbField: 'totalCost' },
    { key: 'scholarship', label: 'Scholarship', paths: ['scholarship', 'financialDetails.scholarships.details', 'scholarshipDetails', 'financialAid', 'scholarshipInfo'] },
    { key: 'scholarshipValue', label: 'Scholarship Value', paths: ['scholarshipValue', 'financialDetails.scholarships.value', 'scholarshipAmount'], dbField: 'scholarshipAmount' },
    { key: 'paymentTerms', label: 'Payment Arrangement', paths: ['paymentTerms', 'payment.terms', 'paymentMethod', 'financialArrangement'], dbField: 'paymentSchedule' },
    { key: 'oshcProvider', label: 'OSHC Provider', paths: ['oshcProvider', 'healthInsurance.provider', 'insuranceProvider'], dbField: 'healthCover' },
    { key: 'oshcCost', label: 'OSHC Cost', paths: ['oshcCost', 'healthInsurance.estimatedCost', 'insuranceCost'] },
    { key: 'perYearCost', label: 'Per Year Cost', paths: ['perYearCost', 'financialDetails.costBreakdown.perYear', 'yearlyFee'] },
    { key: 'perSemesterCost', label: 'Per Semester Cost', paths: ['perSemesterCost', 'financialDetails.costBreakdown.perSemester', 'semesterFee'] }
  ];

  return financialFields.map(field => {
    let value = 'Not specified in document';
    
    // First check parsed data from structured analysis or database fields
    if (parsedData && parsedData[field.key] && parsedData[field.key] !== 'Not specified in document') {
      value = parsedData[field.key];
    }
    // Then check database field mappings
    else if (field.dbField && rawAnalysis[field.dbField]) {
      value = rawAnalysis[field.dbField];
      if (rawAnalysis.currency && typeof value === 'number') {
        value = `${rawAnalysis.currency} ${value}`;
      }
    }
    // Finally check structured data paths
    else {
      for (const path of field.paths) {
        const pathValue = getNestedValue(parsedData, path);
        if (pathValue && pathValue !== 'Not specified in document') {
          value = pathValue;
          break;
        }
      }
    }
    
    return { ...field, value };
  });
};

// Helper function to get nested values from object
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
};

// Function to extract academic information with enhanced structured data handling
const extractAcademicInfo = (parsedData: any, rawAnalysis: any) => {
  const academicFields = [
    { key: 'institutionName', label: 'Institution', paths: ['institutionName', 'institutionDetails.institutionName', 'institution.name'] },
    { key: 'programName', label: 'Program', paths: ['programName', 'courseDetails.courseTitle', 'course.title', 'program.name'] },
    { key: 'programLevel', label: 'Level', paths: ['programLevel', 'courseDetails.level', 'program.level', 'studyLevel'] },
    { key: 'startDate', label: 'Start Date', paths: ['startDate', 'courseDetails.duration.startDate', 'enrollment.startDate'] },
    { key: 'endDate', label: 'End Date', paths: ['endDate', 'courseDetails.duration.endDate', 'enrollment.endDate'] },
    { key: 'fieldOfStudy', label: 'Field of Study', paths: ['fieldOfStudy', 'courseDetails.fieldOfStudy', 'program.field'] },
    { key: 'studyMode', label: 'Study Mode', paths: ['studyMode', 'courseDetails.studyMode', 'program.mode'] },
    { key: 'courseCode', label: 'Course Code', paths: ['courseCode', 'courseDetails.courseCode', 'program.code'] },
    { key: 'registrationCode', label: 'Registration Code', paths: ['registrationCode', 'institutionDetails.registrationCode', 'institution.code'] },
    { key: 'duration', label: 'Duration', paths: ['duration', 'courseDetails.duration.totalDuration', 'program.duration'] }
  ];

  return academicFields.map(field => {
    let value = 'Not specified in document';
    
    // First check parsed data from structured analysis
    if (parsedData && parsedData[field.key] && parsedData[field.key] !== 'Not specified in document') {
      value = parsedData[field.key];
    }
    // Then check database fields
    else if (rawAnalysis[field.key] && rawAnalysis[field.key] !== 'Not specified in document') {
      value = rawAnalysis[field.key];
    }
    // Finally check structured data paths
    else {
      for (const path of field.paths) {
        const pathValue = getNestedValue(parsedData, path);
        if (pathValue && pathValue !== 'Not specified in document') {
          value = pathValue;
          break;
        }
      }
    }
    
    return { ...field, value };
  });
};

// Function to highlight numerical values with blue color
const highlightNumbers = (text: string) => {
  if (!text || typeof text !== 'string') return text;
  
  // Enhanced regex to capture various numerical formats
  const numberRegex = /(\$?[\d,]+\.?\d*\s?(?:USD|CAD|EUR|GBP|AUD|₹)?|\d+\.?\d*\s?%|[A-Z]{2,4}-?\d+|\d+\.\d+\s?(?:GPA|CGPA)|\d+\s?(?:credits?|hours?|semesters?|years?|months?))/gi;
  
  return text.replace(numberRegex, '<span class="bg-blue-100 text-blue-800 px-1 rounded font-medium">$1</span>');
};

export default function AnalysisDisplay({ analysis }: { analysis: AnalysisData }) {
  const parsedData = parseAnalysisData(analysis);
  const academicInfo = extractAcademicInfo(parsedData, analysis);
  const financialInfo = extractFinancialInfo(parsedData, analysis);

  return (
    <div className="space-y-6">
      {/* Header Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  {analysis.createdAt ? new Date(analysis.createdAt).toLocaleDateString('en-US', {
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
                <p className="font-semibold text-gray-900">{analysis.filename}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="academic" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Academic
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="requirements" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Requirements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
              <CardTitle className="text-xl text-gray-800">Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div 
                className="whitespace-pre-wrap text-gray-700 leading-relaxed break-words"
                dangerouslySetInnerHTML={{ 
                  __html: highlightNumbers(analysis.summary || 'No summary available')
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic" className="space-y-6">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                <GraduationCap className="h-5 w-5" />
                Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {academicInfo.map((field, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-700">{field.label}</span>
                    </div>
                    <div 
                      className="text-gray-600 pl-6 break-words whitespace-pre-wrap"
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

        <TabsContent value="financial" className="space-y-6">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                <CreditCard className="h-5 w-5" />
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {financialInfo.map((field, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-700">{field.label}</span>
                    </div>
                    <div 
                      className="text-gray-600 pl-6 break-words whitespace-pre-wrap"
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
          {analysis.keyFindings && analysis.keyFindings.length > 0 && (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                  <Info className="h-5 w-5" />
                  Key Findings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {analysis.keyFindings.map((finding, index) => (
                  <div key={index} className="border-l-4 border-blue-400 pl-4 py-2">
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
                    <p className="font-medium text-gray-700">Coverage</p>
                    <p className="text-gray-600">{parsedData.oshcCoverage || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Cost</p>
                    <p className="text-gray-600">{parsedData.oshcCost || 'Not specified'}</p>
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