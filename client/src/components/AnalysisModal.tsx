import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  Globe, 
  GraduationCap,
  Building2,
  Clock,
  TrendingUp,
  X
} from 'lucide-react';

interface AnalysisModalProps {
  analysisId: number | null;
  analysisType: 'visa_rejection' | 'enrollment' | null;
  isOpen: boolean;
  onClose: () => void;
}

interface VisaAnalysis {
  id: number;
  filename: string;
  createdAt: string;
  country?: string;
  visaType?: string;
  isPublic: boolean;
  analysisResults?: any;
  summary: string;
  rejectionReasons?: Array<{
    title: string;
    description: string;
    category: string;
    severity?: string;
  }>;
  keyTerms?: Array<{
    title: string;
    description: string;
    category: string;
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    priority?: string;
  }>;
  nextSteps: Array<{
    title: string;
    description: string;
  }>;
}

interface EnrollmentAnalysis {
  id: number;
  filename: string;
  createdAt: string;
  institutionCountry: string;
  studentCountry: string;
  visaType: string;
  analysisResults?: any;
  summary: string;
  eligibilityAssessment: Array<{
    title: string;
    description: string;
    status: string;
  }>;
  documentVerification: Array<{
    title: string;
    description: string;
    status: string;
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    priority: string;
  }>;
  nextSteps: Array<{
    title: string;
    description: string;
  }>;
}

export function AnalysisModal({ analysisId, analysisType, isOpen, onClose }: AnalysisModalProps) {
  const [analysis, setAnalysis] = useState<VisaAnalysis | EnrollmentAnalysis | null>(null);

  // Fetch visa analysis with detailed data
  const { data: visaAnalysis, isLoading: visaLoading } = useQuery<any>({
    queryKey: ['/api/analyses', analysisId],
    enabled: isOpen && analysisType === 'visa_rejection' && !!analysisId,
    select: (data) => {
      const analysis = Array.isArray(data) ? data[0] : data;
      if (!analysis) return null;
      
      // Return the complete original analysis data
      return {
        id: analysis.id,
        filename: analysis.filename,
        createdAt: analysis.createdAt,
        country: analysis.country,
        visaType: analysis.visaType,
        isPublic: analysis.isPublic,
        analysisResults: analysis.analysisResults || {},
        // Fallback to direct properties for backward compatibility
        summary: analysis.analysisResults?.summary || analysis.summary || '',
        rejectionReasons: analysis.analysisResults?.rejectionReasons || analysis.rejectionReasons || [],
        keyTerms: analysis.analysisResults?.keyTerms || analysis.keyTerms || [],
        recommendations: analysis.analysisResults?.recommendations || analysis.recommendations || [],
        nextSteps: analysis.analysisResults?.nextSteps || analysis.nextSteps || []
      };
    }
  });

  // Fetch enrollment analysis with detailed data
  const { data: enrollmentAnalysis, isLoading: enrollmentLoading } = useQuery<any>({
    queryKey: ['/api/enrollment-analyses', analysisId],
    enabled: isOpen && analysisType === 'enrollment' && !!analysisId,
    select: (data) => {
      const analysis = Array.isArray(data) ? data[0] : data;
      if (!analysis) return null;
      
      // Return the complete original analysis data
      return {
        id: analysis.id,
        filename: analysis.filename,
        createdAt: analysis.createdAt,
        institutionCountry: analysis.institutionCountry,
        studentCountry: analysis.studentCountry,
        visaType: analysis.visaType,
        analysisResults: analysis.analysisResults || {},
        // Fallback to direct properties for backward compatibility
        summary: analysis.analysisResults?.summary || analysis.summary || '',
        eligibilityAssessment: analysis.analysisResults?.eligibilityAssessment || analysis.eligibilityAssessment || [],
        documentVerification: analysis.analysisResults?.documentVerification || analysis.documentVerification || [],
        recommendations: analysis.analysisResults?.recommendations || analysis.recommendations || [],
        nextSteps: analysis.analysisResults?.nextSteps || analysis.nextSteps || []
      };
    }
  });

  useEffect(() => {
    if (analysisType === 'visa_rejection' && visaAnalysis) {
      setAnalysis(visaAnalysis);
    } else if (analysisType === 'enrollment' && enrollmentAnalysis) {
      setAnalysis(enrollmentAnalysis);
    }
  }, [analysisType, visaAnalysis, enrollmentAnalysis]);

  const isLoading = visaLoading || enrollmentLoading;

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'verified': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'missing': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderVisaAnalysis = (data: VisaAnalysis) => (
    <div className="space-y-6">
      {/* Important Disclaimer */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 mb-2">Important Legal Disclaimer</p>
              <p className="text-amber-700 leading-relaxed">
                This analysis is for informational purposes only and should not be considered as professional immigration advice. 
                Always consult with qualified immigration experts or lawyers before making any visa-related decisions. 
                This tool and company will not be liable for any financial or other losses caused by decisions made based on this analysis.
                Make your decisions based on professional expert guidance and your own thorough research.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Header Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Visa Document Analysis</p>
            <p className="text-sm text-gray-600">{data.filename}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(data.createdAt).toLocaleDateString()}
          </span>
          {data.country && (
            <span className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              {data.country}
            </span>
          )}
          {data.visaType && (
            <Badge variant="outline">{data.visaType}</Badge>
          )}
          <Badge variant={data.isPublic ? "default" : "secondary"}>
            {data.isPublic ? "Public" : "Private"}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Complete Original Analysis */}
      {data.analysisResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Complete Visa Analysis Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-sm break-words font-mono">
                {typeof data.analysisResults === 'string' 
                  ? data.analysisResults 
                  : JSON.stringify(data.analysisResults, null, 2).replace(/[{}"]/g, '').replace(/,\s*$/gm, '')
                }
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary - Fallback */}
      {!data.analysisResults && data.summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Visa Analysis Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed break-words">{data.summary}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expert Consultation Recommendation */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 mb-2">Next Steps Recommendation</p>
              <p className="text-blue-700 leading-relaxed">
                Based on this analysis, we strongly recommend consulting with qualified immigration experts who can provide 
                personalized guidance for your specific situation. Consider booking a consultation with our certified immigration advisors 
                who can help you understand these findings and create an actionable plan for your visa application process.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderEnrollmentAnalysis = (data: EnrollmentAnalysis) => (
    <div className="space-y-6">
      {/* Important Disclaimer */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 mb-2">Important Educational Disclaimer</p>
              <p className="text-amber-700 leading-relaxed">
                This enrollment document analysis is for informational purposes only and should not replace professional guidance from qualified education consultants or immigration experts. 
                Always verify information with the issuing institution and consult with certified professionals before making any study abroad or visa decisions. 
                This tool and company will not be liable for any financial or other losses caused by decisions made based on this analysis.
                Use this information as a starting point for your research and professional consultation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Header Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-lg">
            <GraduationCap className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Enrollment Document Analysis</p>
            <p className="text-sm text-gray-600">{data.filename}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(data.createdAt).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <Globe className="h-4 w-4" />
            {data.studentCountry} → {data.institutionCountry}
          </span>
          <Badge variant="outline">{data.visaType}</Badge>
        </div>
      </div>

      <Separator />

      {/* Summary */}
      {data.summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-600" />
              Analysis Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{data.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Eligibility Assessment */}
      {data.eligibilityAssessment && data.eligibilityAssessment.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Eligibility Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.eligibilityAssessment.map((item, index) => (
              <div key={index} className="border-l-4 border-green-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-gray-900">{item.title}</h4>
                  <Badge className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Document Verification */}
      {data.documentVerification && data.documentVerification.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Document Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.documentVerification.map((item, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-gray-900">{item.title}</h4>
                  <Badge className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {data.recommendations && data.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recommendations.map((rec, index) => (
              <div key={index} className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-medium text-gray-900">{rec.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                <Badge className={getPriorityColor(rec.priority)}>
                  {rec.priority}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      {data.nextSteps && data.nextSteps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {data.nextSteps.map((step, index) => (
                <li key={index} className="flex gap-3 text-sm">
                  <span className="bg-orange-100 text-orange-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{step.title}: {step.description}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {analysisType === 'visa_rejection' ? 'Visa Analysis Details' : 'Enrollment Analysis Details'}
          </DialogTitle>
          <DialogDescription>
            {analysisType === 'visa_rejection' 
              ? 'Detailed analysis of your visa document with key findings and recommendations'
              : 'Comprehensive analysis of your enrollment document with verification results'
            }
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading analysis...</p>
              </div>
            </div>
          ) : analysis ? (
            analysisType === 'visa_rejection' 
              ? renderVisaAnalysis(analysis as VisaAnalysis)
              : renderEnrollmentAnalysis(analysis as EnrollmentAnalysis)
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Analysis not found</p>
              </div>
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}