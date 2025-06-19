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
  userName?: string;
  userEmail?: string;
}

interface AnalysisDisplayProps {
  analysis: AnalysisData;
  showUserInfo?: boolean;
  isAdmin?: boolean;
}

// Utility function to safely get nested values
const safeGet = (obj: any, path: string, fallback: string = 'Not specified in document') => {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return fallback;
    }
  }
  
  return current || fallback;
};

// Function to parse analysis data safely with enhanced structure handling
const parseAnalysisData = (analysis: any): any => {
  let parsedData: any = null;
  
  try {
    // Try multiple data sources for analysis content
    let rawAnalysisData = null;
    
    if (analysis?.analysis) {
      rawAnalysisData = typeof analysis.analysis === 'string' ? JSON.parse(analysis.analysis) : analysis.analysis;
    } else if (analysis?.summary) {
      // If no structured analysis, try to extract from summary
      rawAnalysisData = { summary: analysis.summary };
    }
    
    if (rawAnalysisData) {
      parsedData = { ...rawAnalysisData };
      
      // Flatten nested structures for easier access
      if (parsedData.institutionDetails) {
        parsedData.institutionName = parsedData.institutionDetails.institutionName || 'Not specified in document';
        parsedData.registrationCode = parsedData.institutionDetails.registrationCode || 'Not specified in document';
        parsedData.country = parsedData.institutionDetails.country || 'Not specified in document';
      }
      
      if (parsedData.courseDetails) {
        parsedData.programName = parsedData.courseDetails.courseTitle || 'Not specified in document';
        parsedData.programLevel = parsedData.courseDetails.level || 'Not specified in document';
        parsedData.fieldOfStudy = parsedData.courseDetails.fieldOfStudy || 'Not specified in document';
        parsedData.studyMode = parsedData.courseDetails.studyMode || 'Not specified in document';
        parsedData.courseCode = parsedData.courseDetails.courseCode || 'Not specified in document';
        
        if (parsedData.courseDetails.duration) {
          parsedData.startDate = parsedData.courseDetails.duration.startDate || 'Not specified in document';
          parsedData.endDate = parsedData.courseDetails.duration.endDate || 'Not specified in document';
          parsedData.duration = parsedData.courseDetails.duration.totalDuration || 'Not specified in document';
        }
      }
      
      if (parsedData.studentDetails) {
        parsedData.studentName = parsedData.studentDetails.fullName || 'Not specified in document';
        parsedData.studentId = parsedData.studentDetails.studentId || 'Not specified in document';
        parsedData.dateOfBirth = parsedData.studentDetails.dateOfBirth || 'Not specified in document';
        parsedData.nationality = parsedData.studentDetails.nationality || 'Not specified in document';
      }
      
      if (parsedData.financialDetails) {
        parsedData.tuitionFee = parsedData.financialDetails.totalTuitionFee || 'Not specified in document';
        parsedData.otherFees = parsedData.financialDetails.otherFees || 'Not specified in document';
        parsedData.initialPrepaid = parsedData.financialDetails.initialPrepaid || 'Not specified in document';
        
        if (parsedData.financialDetails.scholarships) {
          parsedData.scholarship = parsedData.financialDetails.scholarships.details || 'Not specified in document';
          parsedData.scholarshipValue = parsedData.financialDetails.scholarships.value || 'Not specified in document';
        }
        
        if (parsedData.financialDetails.costBreakdown) {
          parsedData.perYearCost = parsedData.financialDetails.costBreakdown.perYear || 'Not specified in document';
          parsedData.perSemesterCost = parsedData.financialDetails.costBreakdown.perSemester || 'Not specified in document';
        }
      }
      
      if (parsedData.healthInsurance) {
        parsedData.oshcProvider = parsedData.healthInsurance.provider || 'Not specified in document';
        parsedData.oshcCoverage = parsedData.healthInsurance.coverageType || 'Not specified in document';
        parsedData.oshcCost = parsedData.healthInsurance.estimatedCost || 'Not specified in document';
      }
      
      if (parsedData.languageRequirements) {
        parsedData.testType = parsedData.languageRequirements.testType || 'Not specified in document';
        parsedData.testScore = parsedData.languageRequirements.scoreAchieved || 'Not specified in document';
        parsedData.testDate = parsedData.languageRequirements.testDate || 'Not specified in document';
      }
      
      if (parsedData.keyDatesDeadlines) {
        parsedData.courseCommencement = parsedData.keyDatesDeadlines.courseCommencement || 'Not specified in document';
        parsedData.oshcStart = parsedData.keyDatesDeadlines.oshcStart || 'Not specified in document';
      }
      
      // Also preserve direct field access for backward compatibility
      Object.keys(analysis).forEach((key: string) => {
        if (!parsedData[key] && analysis[key] && key !== 'analysis') {
          parsedData[key] = analysis[key];
        }
      });
    }
  } catch (error) {
    console.error('Error parsing analysis data:', error);
    parsedData = {};
  }
  
  return parsedData || {};
};

// Function to extract financial information with enhanced structured data handling
const extractFinancialInfo = (parsedData: any, rawAnalysis: any) => {
  const financialFields = [
    { key: 'tuitionFee', label: 'Tuition Fee', paths: ['tuitionFee', 'financialDetails.totalTuitionFee', 'fees.tuition', 'costs.tuition', 'courseFee'] },
    { key: 'otherFees', label: 'Other Fees', paths: ['otherFees', 'financialDetails.otherFees', 'fees.other', 'costs.other', 'additionalFees'] },
    { key: 'initialPrepaid', label: 'Initial Prepaid', paths: ['initialPrepaid', 'financialDetails.initialPrepaid', 'prepaidAmount', 'deposit'] },
    { key: 'totalCost', label: 'Total Cost', paths: ['totalCost', 'fees.total', 'costs.total', 'totalAmount'] },
    { key: 'scholarship', label: 'Scholarship', paths: ['scholarship', 'financialDetails.scholarships.details', 'scholarshipDetails', 'financialAid', 'scholarshipInfo'] },
    { key: 'scholarshipValue', label: 'Scholarship Value', paths: ['scholarshipValue', 'financialDetails.scholarships.value', 'scholarshipAmount'] },
    { key: 'paymentTerms', label: 'Payment Arrangement', paths: ['paymentTerms', 'payment.terms', 'paymentMethod', 'financialArrangement'] },
    { key: 'oshcProvider', label: 'OSHC Provider', paths: ['oshcProvider', 'healthInsurance.provider', 'insuranceProvider'] },
    { key: 'oshcCost', label: 'OSHC Cost', paths: ['oshcCost', 'healthInsurance.estimatedCost', 'insuranceCost'] },
    { key: 'perYearCost', label: 'Per Year Cost', paths: ['perYearCost', 'financialDetails.costBreakdown.perYear', 'yearlyFee'] },
    { key: 'perSemesterCost', label: 'Per Semester Cost', paths: ['perSemesterCost', 'financialDetails.costBreakdown.perSemester', 'semesterFee'] }
  ];

  return financialFields.map(field => {
    let value = 'Not specified in document';
    
    // Try structured data extraction first (from parsed JSON)
    if (parsedData) {
      for (const path of field.paths) {
        const pathValue = safeGet(parsedData, path, '');
        if (pathValue && pathValue !== 'Not specified in document' && pathValue !== '' && pathValue !== null) {
          value = pathValue;
          break;
        }
      }
    }
    
    // Try direct property access on flattened data
    if (value === 'Not specified in document' && parsedData && parsedData[field.key]) {
      value = parsedData[field.key];
    }
    
    // Try direct property access on raw analysis
    if (value === 'Not specified in document' && rawAnalysis[field.key]) {
      value = rawAnalysis[field.key];
    }
    
    // Try intelligent extraction from summary as last resort
    if (value === 'Not specified in document' && rawAnalysis.summary) {
      const extractedValue = extractFromSummary(rawAnalysis.summary, field.key);
      if (extractedValue !== 'Not specified in document') {
        value = extractedValue;
      }
    }
    
    return { ...field, value };
  });
};

// Function to extract information from summary text using intelligent parsing
const extractFromSummary = (summary: string, field: string): string => {
  if (!summary) return 'Not specified in document';
  
  const patterns: Record<string, RegExp[]> = {
    institutionName: [
      /at\s+([A-Z][a-zA-Z\s&]+University)/i,
      /([A-Z][a-zA-Z\s&]+University)/i,
      /at\s+([A-Z][a-zA-Z\s&]+College)/i,
      /([A-Z][a-zA-Z\s&]+College)/i,
      /at\s+([A-Z][a-zA-Z\s&]+Institute)/i,
      /([A-Z][a-zA-Z\s&]+Institute)/i
    ],
    programName: [
      /Bachelor\s+of\s+([A-Z][a-zA-Z\s]+)/i,
      /Master\s+of\s+([A-Z][a-zA-Z\s]+)/i,
      /enrollment\s+in\s+the\s+([A-Z][a-zA-Z\s]+)/i,
      /in\s+the\s+([A-Z][a-zA-Z\s]+)/i,
      /course\s+([A-Z][a-zA-Z\s]+)/i,
      /(Bachelor[^,]+)/i,
      /(Master[^,]+)/i
    ],
    programLevel: [
      /(Bachelor)/i,
      /(Master)/i,
      /(Undergraduate)/i,
      /(Graduate)/i,
      /(Postgraduate)/i
    ],
    startDate: [
      /starting\s+on\s+(\d{2}\/\d{2}\/\d{4})/i,
      /commencing\s+(\d{2}\/\d{2}\/\d{4})/i,
      /from\s+(\d{2}\/\d{2}\/\d{4})/i,
      /(\d{2}\/\d{2}\/\d{4})\s+and\s+ending/i
    ],
    endDate: [
      /ending\s+on\s+(\d{2}\/\d{2}\/\d{4})/i,
      /until\s+(\d{2}\/\d{2}\/\d{4})/i,
      /to\s+(\d{2}\/\d{2}\/\d{4})/i,
      /and\s+ending\s+on\s+(\d{2}\/\d{2}\/\d{4})/i
    ],
    studentName: [
      /student\s+([A-Z][a-zA-Z\s]+)\s+has/i,
      /([A-Z][a-zA-Z\s]+)\s+has\s+been\s+awarded/i,
      /for\s+([A-Z][a-zA-Z\s]+)/i
    ],
    scholarship: [
      /awarded\s+a\s+scholarship/i,
      /scholarship\s+of\s+([^.]+)/i,
      /financial\s+aid\s+([^.]+)/i,
      /has\s+been\s+awarded\s+a\s+scholarship/i
    ],
    paymentTerms: [
      /arranged\s+([^.]+with\s+[^.]+)/i,
      /payment\s+through\s+([^.]+)/i,
      /with\s+([A-Z][a-zA-Z\s]+)/i,
      /OSHC\s+with\s+([^.]+)/i
    ]
  };

  const fieldPatterns = patterns[field];
  if (!fieldPatterns) return 'Not specified in document';

  for (const pattern of fieldPatterns) {
    const match = summary.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
    if (field === 'scholarship' && pattern.test(summary)) {
      return 'Scholarship awarded';
    }
  }

  return 'Not specified in document';
};

// Function to extract academic information with enhanced structured data handling
const extractAcademicInfo = (parsedData: any, rawAnalysis: any) => {
  const academicFields = [
    { key: 'institutionName', label: 'Institution', paths: ['institutionName', 'institutionDetails.institutionName', 'institution.name', 'school', 'universityName'] },
    { key: 'programName', label: 'Program', paths: ['programName', 'courseDetails.courseTitle', 'course.name', 'program', 'courseName', 'degree'] },
    { key: 'programLevel', label: 'Level', paths: ['programLevel', 'courseDetails.level', 'course.level', 'level', 'degreeLevel'] },
    { key: 'startDate', label: 'Start Date', paths: ['startDate', 'courseDetails.duration.startDate', 'course.startDate', 'duration.start', 'commencementDate'] },
    { key: 'endDate', label: 'End Date', paths: ['endDate', 'courseDetails.duration.endDate', 'course.endDate', 'duration.end', 'completionDate'] },
    { key: 'duration', label: 'Duration', paths: ['duration', 'courseDetails.duration.totalDuration', 'course.duration', 'totalDuration', 'courseDuration'] },
    { key: 'fieldOfStudy', label: 'Field of Study', paths: ['fieldOfStudy', 'courseDetails.fieldOfStudy', 'subject', 'area'] },
    { key: 'studyMode', label: 'Study Mode', paths: ['studyMode', 'courseDetails.studyMode', 'course.mode', 'modeOfStudy', 'deliveryMode'] },
    { key: 'courseCode', label: 'Course Code', paths: ['courseCode', 'courseDetails.courseCode', 'registrationCode'] },
    { key: 'registrationCode', label: 'Registration Code', paths: ['registrationCode', 'institutionDetails.registrationCode', 'cricosCode'] }
  ];

  return academicFields.map(field => {
    let value = 'Not specified in document';
    
    // Try structured data extraction first (from parsed JSON)
    if (parsedData) {
      for (const path of field.paths) {
        const pathValue = safeGet(parsedData, path, '');
        if (pathValue && pathValue !== 'Not specified in document' && pathValue !== '' && pathValue !== null) {
          value = pathValue;
          break;
        }
      }
    }
    
    // Try direct property access on flattened data
    if (value === 'Not specified in document' && parsedData && parsedData[field.key]) {
      value = parsedData[field.key];
    }
    
    // Try direct property access on raw analysis
    if (value === 'Not specified in document' && rawAnalysis[field.key]) {
      value = rawAnalysis[field.key];
    }
    
    // Try intelligent extraction from summary as last resort
    if (value === 'Not specified in document' && rawAnalysis.summary) {
      const extractedValue = extractFromSummary(rawAnalysis.summary, field.key);
      if (extractedValue !== 'Not specified in document') {
        value = extractedValue;
      }
    }
    
    return { ...field, value };
  });
};

// Function to highlight financial amounts in text
const highlightFinancialAmounts = (text: string) => {
  if (!text) return text;
  
  // Regex patterns for financial amounts
  const patterns = [
    /(\$[\d,]+(?:\.\d{2})?)/g, // $1,000.00
    /(USD\s*[\d,]+(?:\.\d{2})?)/g, // USD 1000
    /(CAD\s*[\d,]+(?:\.\d{2})?)/g, // CAD 1000
    /(AUD\s*[\d,]+(?:\.\d{2})?)/g, // AUD 1000
    /(GBP\s*[\d,]+(?:\.\d{2})?)/g, // GBP 1000
    /(€[\d,]+(?:\.\d{2})?)/g, // €1000
    /(₹[\d,]+(?:\.\d{2})?)/g, // ₹1000
    /(\d+%)/g, // percentages
  ];
  
  let highlightedText = text;
  patterns.forEach(pattern => {
    highlightedText = highlightedText.replace(pattern, '<span class="bg-blue-100 text-blue-800 px-1 rounded font-semibold">$1</span>');
  });
  
  return highlightedText;
};

export default function AnalysisDisplay({ analysis, showUserInfo = false, isAdmin = false }: AnalysisDisplayProps) {
  const parsedData = parseAnalysisData(analysis);
  const academicInfo = extractAcademicInfo(parsedData, analysis);
  const financialInfo = extractFinancialInfo(parsedData, analysis);
  
  // Debug logging to understand data structure
  console.log('AnalysisDisplay - Raw analysis:', analysis);
  console.log('AnalysisDisplay - Parsed data:', parsedData);
  console.log('AnalysisDisplay - Academic info:', academicInfo);
  console.log('AnalysisDisplay - Financial info:', financialInfo);
  
  // Enhanced extraction with multiple fallback strategies
  const extractedStudentName = parsedData?.studentName || 
    parsedData?.studentDetails?.fullName ||
    analysis.studentName || 
    (analysis.summary ? extractFromSummary(analysis.summary, 'studentName') : null) ||
    'Not specified in document';
  
  const extractedInstitutionName = parsedData?.institutionName ||
    parsedData?.institutionDetails?.institutionName ||
    analysis.institutionName ||
    academicInfo.find(f => f.key === 'institutionName')?.value ||
    (analysis.summary ? extractFromSummary(analysis.summary, 'institutionName') : null) ||
    'Not specified in document';
  
  const extractedProgramName = parsedData?.programName ||
    parsedData?.courseDetails?.courseTitle ||
    analysis.programName ||
    academicInfo.find(f => f.key === 'programName')?.value ||
    (analysis.summary ? extractFromSummary(analysis.summary, 'programName') : null) ||
    'Not specified in document';
  
  const documentTypeDisplay = analysis.documentType === 'coe' ? 'COE (Confirmation of Enrollment)' : 
                             analysis.documentType?.toUpperCase() || 'Document Analysis';

  return (
    <div className="space-y-6">
      {/* Header Information Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                {documentTypeDisplay} Analysis
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Analysis completed on {new Date(analysis.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              ID: {analysis.id}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">File Name:</span>
                <span className="font-semibold">{analysis.filename}</span>
              </div>
              {showUserInfo && (
                <>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-500">User:</span>
                    <span className="font-semibold">{analysis.userName || `User #${analysis.userId}`}</span>
                  </div>
                  {analysis.userEmail && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">Email:</span>
                      <span className="font-semibold">{analysis.userEmail}</span>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">Analysis Date:</span>
                <span className="font-semibold">{new Date(analysis.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Analysis Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
          <TabsTrigger value="academic" className="text-sm">Academic</TabsTrigger>
          <TabsTrigger value="financial" className="text-sm">Financial</TabsTrigger>
          <TabsTrigger value="requirements" className="text-sm">Requirements</TabsTrigger>
          <TabsTrigger value="details" className="text-sm">Details</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Summary Card */}
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Info className="h-5 w-5 text-purple-600" />
                Quick Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-purple-700">Institution:</span>
                    <span className="text-sm font-bold text-purple-900">{extractedInstitutionName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-purple-700">Student:</span>
                    <span className="text-sm font-bold text-purple-900">{extractedStudentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-purple-700">Program:</span>
                    <span className="text-sm font-bold text-purple-900">{extractedProgramName}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-purple-700">Start Date:</span>
                    <span className="text-sm font-bold text-purple-900">
                      {academicInfo.find(f => f.key === 'startDate')?.value || 'Not specified'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-purple-700">End Date:</span>
                    <span className="text-sm font-bold text-purple-900">
                      {academicInfo.find(f => f.key === 'endDate')?.value || 'Not specified'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-purple-700">Scholarship:</span>
                    <span className="text-sm font-bold text-purple-900">
                      {financialInfo.find(f => f.key === 'scholarship')?.value || 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Document Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.summary ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div 
                    className="text-gray-800 leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ 
                      __html: highlightFinancialAmounts(analysis.summary) 
                    }}
                  />
                </div>
              ) : (
                <p className="text-gray-600 italic">No summary available for this document.</p>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Quick Info Grid with Extracted Data */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building className="h-4 w-4 text-blue-600" />
                  Institution Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Institution</p>
                  <p className="font-semibold">{extractedInstitutionName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Program</p>
                  <p className="font-semibold">{extractedProgramName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Program Level</p>
                  <p className="font-semibold">{
                    academicInfo.find(f => f.key === 'programLevel')?.value || 
                    'Not specified in document'
                  }</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  Program Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Start Date</p>
                  <p className="font-semibold">{
                    academicInfo.find(f => f.key === 'startDate')?.value || 
                    'Not specified in document'
                  }</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">End Date</p>
                  <p className="font-semibold">{
                    academicInfo.find(f => f.key === 'endDate')?.value || 
                    'Not specified in document'
                  }</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Duration</p>
                  <p className="font-semibold">{
                    academicInfo.find(f => f.key === 'duration')?.value || 
                    'Not specified in document'
                  }</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-4 w-4 text-green-600" />
                Key Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">Scholarship</p>
                  <p className="font-bold text-blue-600">{
                    financialInfo.find(f => f.key === 'scholarship')?.value || 
                    'Not specified'
                  }</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">Payment Method</p>
                  <p className="font-bold text-green-600">{
                    financialInfo.find(f => f.key === 'paymentTerms')?.value || 
                    'Not specified'
                  }</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Cost</p>
                  <p className="font-bold text-purple-600">{
                    financialInfo.find(f => f.key === 'totalCost')?.value || 
                    'Not specified'
                  }</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-blue-600" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Student Name</p>
                <p className="font-semibold">{extractedStudentName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Document Type</p>
                <p className="font-semibold">{documentTypeDisplay}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Analysis Date</p>
                <p className="font-semibold">{new Date(analysis.createdAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic Tab */}
        <TabsContent value="academic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {academicInfo.map((field, index) => (
                  <div key={field.key} className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">{field.label}</p>
                    <p className="font-semibold">{field.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {financialInfo.map((field, index) => (
                  <div key={field.key} className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">{field.label}</p>
                    <div 
                      className="font-semibold"
                      dangerouslySetInnerHTML={{ 
                        __html: field.value.includes('$') || field.value.includes('USD') || field.value.includes('CAD') || field.value.includes('AUD') ? 
                          `<span class="text-blue-600">${field.value}</span>` : field.value 
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requirements Tab */}
        <TabsContent value="requirements" className="space-y-6">
          {/* Language Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Language Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Test Type</p>
                  <p className="font-semibold">{parsedData?.testType || 'Not specified in document'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Score Achieved</p>
                  <p className="font-semibold">{parsedData?.testScore || 'Not specified in document'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Test Date</p>
                  <p className="font-semibold">{parsedData?.testDate || 'Not specified in document'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Requirement Status</p>
                  <p className="font-semibold">{parsedData?.languageRequirements?.requirementStatus || 'Not specified in document'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Insurance (OSHC) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Health Insurance (OSHC)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Provider</p>
                  <p className="font-semibold">{financialInfo.find(f => f.key === 'oshcProvider')?.value || 'Not specified in document'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Coverage Type</p>
                  <p className="font-semibold">{parsedData?.oshcCoverage || 'Not specified in document'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Estimated Cost</p>
                  <p className="font-semibold text-blue-600">{financialInfo.find(f => f.key === 'oshcCost')?.value || 'Not specified in document'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Coverage Period</p>
                  <p className="font-semibold">{parsedData?.healthInsurance?.coveragePeriod?.duration || 'Not specified in document'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Findings from Analysis */}
          {parsedData?.keyFindings && parsedData.keyFindings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  Key Findings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {parsedData.keyFindings.map((finding: any, index: number) => (
                    <div key={index} className="border-l-4 border-orange-300 bg-orange-50 p-3 rounded-r-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-medium text-orange-700 uppercase tracking-wide">
                          {finding.category || 'General'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          finding.importance === 'high' ? 'bg-red-100 text-red-700' : 
                          finding.importance === 'medium' ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {finding.importance || 'Medium'} Priority
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 mb-2">{finding.finding}</p>
                      {finding.actionRequired && (
                        <p className="text-sm font-medium text-orange-700">
                          Action Required: {finding.actionRequired}
                        </p>
                      )}
                      {finding.deadline && (
                        <p className="text-xs text-orange-600 mt-1">
                          Deadline: {finding.deadline}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Compliance Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-purple-600" />
                Compliance & Registration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">CRICOS Registration</p>
                    <p className="font-semibold">{parsedData?.complianceInfo?.cricosRegistration || academicInfo.find(f => f.key === 'registrationCode')?.value || 'Not specified in document'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Government Registration</p>
                    <p className="font-semibold">{parsedData?.complianceInfo?.governmentRegistration || 'Not specified in document'}</p>
                  </div>
                </div>
                
                {/* Important Notes */}
                {parsedData?.complianceInfo?.importantNotes && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Important Compliance Notes:</h4>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <ul className="list-disc list-inside space-y-1">
                        {parsedData.complianceInfo.importantNotes.map((note: string, index: number) => (
                          <li key={index} className="text-sm text-purple-800">{note}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          {parsedData?.nextSteps && parsedData.nextSteps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                  Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {parsedData.nextSteps.map((step: any, index: number) => (
                    <div key={index} className="border border-indigo-200 bg-indigo-50 p-3 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-indigo-900">{step.step}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          step.priority === 'high' ? 'bg-red-100 text-red-700' : 
                          step.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-green-100 text-green-700'
                        }`}>
                          {step.priority || 'Normal'} Priority
                        </span>
                      </div>
                      <p className="text-sm text-indigo-800 mb-2">{step.description}</p>
                      {step.timeline && (
                        <p className="text-xs text-indigo-600">
                          Timeline: {step.timeline}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                Detailed Analysis Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              {parsedData ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(parsedData, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Detailed Analysis Data</h3>
                  <p className="text-gray-600">
                    This document has been processed, but detailed structured analysis data is not available.
                    The information shown in other tabs represents the extracted basic details.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}