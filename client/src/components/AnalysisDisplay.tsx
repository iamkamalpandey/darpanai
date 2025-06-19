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

// Function to extract financial information with highlighting
const extractFinancialInfo = (parsedData: any, rawAnalysis: any) => {
  const financialFields = [
    { key: 'tuitionFee', label: 'Tuition Fee', paths: ['tuitionFee', 'fees.tuition', 'costs.tuition'] },
    { key: 'otherFees', label: 'Other Fees', paths: ['otherFees', 'fees.other', 'costs.other'] },
    { key: 'totalCost', label: 'Total Cost', paths: ['totalCost', 'fees.total', 'costs.total'] },
    { key: 'scholarship', label: 'Scholarship', paths: ['scholarship', 'scholarshipDetails', 'financialAid'] },
    { key: 'paymentTerms', label: 'Payment Terms', paths: ['paymentTerms', 'payment.terms'] },
    { key: 'refundPolicy', label: 'Refund Policy', paths: ['refundPolicy', 'policies.refund'] }
  ];

  return financialFields.map(field => {
    let value = 'Not specified in document';
    
    // Try to find value in parsed data
    if (parsedData) {
      for (const path of field.paths) {
        const pathValue = safeGet(parsedData, path, '');
        if (pathValue && pathValue !== 'Not specified in document' && pathValue !== '') {
          value = pathValue;
          break;
        }
      }
    }
    
    // Try direct property access
    if (value === 'Not specified in document' && rawAnalysis[field.key]) {
      value = rawAnalysis[field.key];
    }
    
    return { ...field, value };
  });
};

// Function to extract academic information
const extractAcademicInfo = (parsedData: any, rawAnalysis: any) => {
  const academicFields = [
    { key: 'institutionName', label: 'Institution', paths: ['institutionName', 'institution.name', 'school'] },
    { key: 'programName', label: 'Program', paths: ['programName', 'course.name', 'program'] },
    { key: 'programLevel', label: 'Level', paths: ['programLevel', 'course.level', 'level'] },
    { key: 'startDate', label: 'Start Date', paths: ['startDate', 'course.startDate', 'duration.start'] },
    { key: 'endDate', label: 'End Date', paths: ['endDate', 'course.endDate', 'duration.end'] },
    { key: 'duration', label: 'Duration', paths: ['duration', 'course.duration', 'totalDuration'] },
    { key: 'campus', label: 'Campus', paths: ['campus', 'location.campus'] },
    { key: 'modeOfStudy', label: 'Mode of Study', paths: ['modeOfStudy', 'course.mode', 'studyMode'] }
  ];

  return academicFields.map(field => {
    let value = 'Not specified in document';
    
    // Try to find value in parsed data
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
          <TabsTrigger value="academic" className="text-sm">Academic</TabsTrigger>
          <TabsTrigger value="financial" className="text-sm">Financial</TabsTrigger>
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

          {/* Quick Info Grid */}
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
                  <p className="font-semibold">{analysis.institutionName || 'Not specified in document'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Program</p>
                  <p className="font-semibold">{analysis.programName || 'Not specified in document'}</p>
                </div>
              </CardContent>
            </Card>

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
                  <p className="font-semibold">{analysis.studentName || 'Not specified in document'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Document Type</p>
                  <p className="font-semibold">{documentTypeDisplay}</p>
                </div>
              </CardContent>
            </Card>
          </div>
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