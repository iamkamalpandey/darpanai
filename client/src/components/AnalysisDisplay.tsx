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

// Function to parse analysis data safely
const parseAnalysisData = (analysis: any) => {
  let parsedData = null;
  
  try {
    if (analysis?.analysis) {
      parsedData = typeof analysis.analysis === 'string' ? JSON.parse(analysis.analysis) : analysis.analysis;
    }
  } catch (error) {
    console.error('Error parsing analysis data:', error);
  }
  
  return parsedData;
};

// Function to extract financial information with intelligent parsing
const extractFinancialInfo = (parsedData: any, rawAnalysis: any) => {
  const financialFields = [
    { key: 'tuitionFee', label: 'Tuition Fee', paths: ['tuitionFee', 'fees.tuition', 'costs.tuition', 'courseFee'] },
    { key: 'otherFees', label: 'Other Fees', paths: ['otherFees', 'fees.other', 'costs.other', 'additionalFees'] },
    { key: 'totalCost', label: 'Total Cost', paths: ['totalCost', 'fees.total', 'costs.total', 'totalAmount'] },
    { key: 'scholarship', label: 'Scholarship', paths: ['scholarship', 'scholarshipDetails', 'financialAid', 'scholarshipInfo'] },
    { key: 'paymentTerms', label: 'Payment Arrangement', paths: ['paymentTerms', 'payment.terms', 'paymentMethod', 'financialArrangement'] },
    { key: 'refundPolicy', label: 'Refund Policy', paths: ['refundPolicy', 'policies.refund', 'refundTerms'] }
  ];

  return financialFields.map(field => {
    let value = 'Not specified in document';
    
    // Try to find value in parsed data first
    if (parsedData) {
      for (const path of field.paths) {
        const pathValue = safeGet(parsedData, path, '');
        if (pathValue && pathValue !== 'Not specified in document' && pathValue !== '' && pathValue !== null) {
          value = pathValue;
          break;
        }
      }
    }
    
    // Try direct property access
    if (value === 'Not specified in document' && rawAnalysis[field.key]) {
      value = rawAnalysis[field.key];
    }
    
    // Try intelligent extraction from summary if still not found
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
      /at\s+([A-Z][a-zA-Z\s&]+College)/i,
      /at\s+([A-Z][a-zA-Z\s&]+Institute)/i,
      /([A-Z][a-zA-Z\s&]+University)/i,
      /([A-Z][a-zA-Z\s&]+College)/i
    ],
    programName: [
      /Bachelor\s+of\s+([A-Z][a-zA-Z\s]+)/i,
      /Master\s+of\s+([A-Z][a-zA-Z\s]+)/i,
      /enrollment\s+in\s+the\s+([A-Z][a-zA-Z\s]+)/i,
      /in\s+([A-Z][a-zA-Z\s]+Education)/i,
      /course\s+([A-Z][a-zA-Z\s]+)/i
    ],
    startDate: [
      /starting\s+on\s+(\d{2}\/\d{2}\/\d{4})/i,
      /commencing\s+(\d{2}\/\d{2}\/\d{4})/i,
      /from\s+(\d{2}\/\d{2}\/\d{4})/i
    ],
    endDate: [
      /ending\s+on\s+(\d{2}\/\d{2}\/\d{4})/i,
      /until\s+(\d{2}\/\d{2}\/\d{4})/i,
      /to\s+(\d{2}\/\d{2}\/\d{4})/i
    ],
    scholarship: [
      /awarded\s+a\s+scholarship/i,
      /scholarship\s+of\s+([^.]+)/i,
      /financial\s+aid\s+([^.]+)/i
    ],
    financialArrangement: [
      /arranged\s+([^.]+with\s+[^.]+)/i,
      /payment\s+through\s+([^.]+)/i
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

// Function to extract academic information with intelligent parsing
const extractAcademicInfo = (parsedData: any, rawAnalysis: any) => {
  const academicFields = [
    { key: 'institutionName', label: 'Institution', paths: ['institutionName', 'institution.name', 'school', 'universityName'] },
    { key: 'programName', label: 'Program', paths: ['programName', 'course.name', 'program', 'courseName', 'degree'] },
    { key: 'programLevel', label: 'Level', paths: ['programLevel', 'course.level', 'level', 'degreeLevel'] },
    { key: 'startDate', label: 'Start Date', paths: ['startDate', 'course.startDate', 'duration.start', 'commencementDate'] },
    { key: 'endDate', label: 'End Date', paths: ['endDate', 'course.endDate', 'duration.end', 'completionDate'] },
    { key: 'duration', label: 'Duration', paths: ['duration', 'course.duration', 'totalDuration', 'courseDuration'] },
    { key: 'campus', label: 'Campus', paths: ['campus', 'location.campus', 'campusLocation'] },
    { key: 'modeOfStudy', label: 'Mode of Study', paths: ['modeOfStudy', 'course.mode', 'studyMode', 'deliveryMode'] }
  ];

  return academicFields.map(field => {
    let value = 'Not specified in document';
    
    // Try to find value in parsed data first
    if (parsedData) {
      for (const path of field.paths) {
        const pathValue = safeGet(parsedData, path, '');
        if (pathValue && pathValue !== 'Not specified in document' && pathValue !== '' && pathValue !== null) {
          value = pathValue;
          break;
        }
      }
    }
    
    // Try direct property access
    if (value === 'Not specified in document' && rawAnalysis[field.key]) {
      value = rawAnalysis[field.key];
    }
    
    // Try intelligent extraction from summary if still not found
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
                  <p className="font-semibold">{
                    academicInfo.find(f => f.key === 'institutionName')?.value || 
                    analysis.institutionName || 
                    'Not specified in document'
                  }</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Program</p>
                  <p className="font-semibold">{
                    academicInfo.find(f => f.key === 'programName')?.value || 
                    analysis.programName || 
                    'Not specified in document'
                  }</p>
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
          {analysis.studentName && (
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
                  <p className="font-semibold">{analysis.studentName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Document Type</p>
                  <p className="font-semibold">{documentTypeDisplay}</p>
                </div>
              </CardContent>
            </Card>
          )}
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                Test Scores & Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Extract and display test scores from summary */}
                {analysis.summary && analysis.summary.match(/IELTS|TOEFL|GRE|GMAT|SAT|ACT/i) ? (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Test Scores Mentioned:</h4>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        {analysis.summary.match(/[^.]*(?:IELTS|TOEFL|GRE|GMAT|SAT|ACT)[^.]*/gi)?.join('. ') || 'No specific test scores mentioned'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Test Scores:</h4>
                    <p className="text-gray-600 italic">No test score requirements specified in document</p>
                  </div>
                )}

                {/* Academic Requirements */}
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Academic Requirements:</h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-800">
                      {academicInfo.find(f => f.key === 'programLevel')?.value !== 'Not specified in document' 
                        ? `Program Level: ${academicInfo.find(f => f.key === 'programLevel')?.value}`
                        : 'Academic requirements not specified in document'
                      }
                    </p>
                  </div>
                </div>

                {/* Financial Requirements */}
                {financialInfo.find(f => f.key === 'scholarship')?.value !== 'Not specified in document' && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Financial Arrangements:</h4>
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="space-y-2">
                        <p className="text-sm text-green-800">
                          <span className="font-medium">Scholarship:</span> {financialInfo.find(f => f.key === 'scholarship')?.value}
                        </p>
                        {financialInfo.find(f => f.key === 'paymentTerms')?.value !== 'Not specified in document' && (
                          <p className="text-sm text-green-800">
                            <span className="font-medium">Payment Method:</span> {financialInfo.find(f => f.key === 'paymentTerms')?.value}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Compliance Information */}
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Compliance & Next Steps:</h4>
                  <div className="bg-amber-50 rounded-lg p-3">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                        <p className="text-sm text-amber-800">
                          Ensure all enrollment conditions are met as specified in the COE document
                        </p>
                      </div>
                      {academicInfo.find(f => f.key === 'startDate')?.value !== 'Not specified in document' && (
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 text-amber-600 mt-0.5" />
                          <p className="text-sm text-amber-800">
                            Program begins: {academicInfo.find(f => f.key === 'startDate')?.value}
                          </p>
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                        <p className="text-sm text-amber-800">
                          Verify visa conditions and maintain enrollment status
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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