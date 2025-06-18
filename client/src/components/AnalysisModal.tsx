import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  User, 
  Globe, 
  GraduationCap,
  Building2,
  MapPin,
  Clock,
  BookOpen,
  TrendingUp,
  Download,
  X
} from 'lucide-react';

interface AnalysisModalProps {
  analysisId: number | null;
  analysisType: 'visa_rejection' | 'enrollment' | null;
  isOpen: boolean;
  onClose: () => void;
}

interface VisaRejectionAnalysis {
  id: number;
  filename: string;
  createdAt: string;
  rejectionReasons: Array<{
    title: string;
    description: string;
    category: string;
    severity: string;
  }>;
  nextSteps: Array<{
    title: string;
    description: string;
    priority: string;
  }>;
  tips: string[];
  country?: string;
  visaType?: string;
  isPublic: boolean;
}

interface EnrollmentAnalysis {
  id: number;
  filename: string;
  createdAt: string;
  institutionCountry: string;
  studentCountry: string;
  visaType: string;
  summary: string;
  compliance: {
    status: string;
    score: number;
    details: string[];
  };
  recommendations: Array<{
    title: string;
    description: string;
    priority: string;
  }>;
  requiredDocuments: string[];
  nextSteps: string[];
}

export function AnalysisModal({ analysisId, analysisType, isOpen, onClose }: AnalysisModalProps) {
  const [analysis, setAnalysis] = useState<VisaRejectionAnalysis | EnrollmentAnalysis | null>(null);

  // Fetch visa rejection analysis with detailed data
  const { data: visaAnalysis, isLoading: visaLoading } = useQuery<any>({
    queryKey: ['/api/analyses', analysisId],
    enabled: isOpen && analysisType === 'visa_rejection' && !!analysisId,
    select: (data) => {
      // Transform the data to match our interface expectations
      const analysis = Array.isArray(data) ? data[0] : data;
      if (!analysis) return null;
      
      return {
        id: analysis.id,
        filename: analysis.filename,
        createdAt: analysis.createdAt,
        country: analysis.country,
        visaType: analysis.visaType,
        isPublic: analysis.isPublic,
        rejectionReasons: analysis.analysisResults?.rejectionReasons || analysis.rejectionReasons || [],
        nextSteps: analysis.analysisResults?.nextSteps || analysis.nextSteps || [],
        tips: analysis.analysisResults?.tips || analysis.tips || [],
        summary: analysis.analysisResults?.summary || analysis.summary || '',
        recommendations: analysis.analysisResults?.recommendations || analysis.recommendations || []
      };
    }
  });

  // Fetch enrollment analysis with detailed data
  const { data: enrollmentAnalysis, isLoading: enrollmentLoading } = useQuery<any>({
    queryKey: ['/api/enrollment-analyses', analysisId],
    enabled: isOpen && analysisType === 'enrollment' && !!analysisId,
    select: (data) => {
      // Transform the data to match our interface expectations
      const analysis = Array.isArray(data) ? data[0] : data;
      if (!analysis) return null;
      
      return {
        id: analysis.id,
        filename: analysis.filename,
        createdAt: analysis.createdAt,
        institutionCountry: analysis.institutionCountry,
        studentCountry: analysis.studentCountry,
        visaType: analysis.visaType,
        summary: analysis.summary || '',
        compliance: analysis.compliance || { status: 'unknown', score: 0, details: [] },
        recommendations: analysis.recommendations || [],
        requiredDocuments: analysis.requiredDocuments || [],
        nextSteps: analysis.nextSteps || []
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
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderVisaRejectionAnalysis = (data: VisaRejectionAnalysis) => (
    <div className="space-y-6">
      {/* Header Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 p-2 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Visa Rejection Analysis</p>
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
        </div>
      </div>

      <Separator />

      {/* Rejection Reasons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            Rejection Reasons ({data.rejectionReasons?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.rejectionReasons?.map((reason, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <h4 className="font-medium text-gray-900">{reason.title}</h4>
                <div className="flex gap-2">
                  <Badge className={getSeverityColor(reason.severity)}>
                    {reason.severity}
                  </Badge>
                  <Badge variant="outline">{reason.category}</Badge>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{reason.description}</p>
            </div>
          )) || (
            <p className="text-gray-500 text-center py-4">No rejection reasons available</p>
          )}
        </CardContent>
      </Card>

      {/* Next Steps */}
      {data.nextSteps && Array.isArray(data.nextSteps) && data.nextSteps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Recommended Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.nextSteps.map((step, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-medium text-gray-900">{step.title}</h4>
                  <Badge className={getPriorityColor(step.priority)}>
                    {step.priority}
                  </Badge>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      {data.tips && data.tips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              Expert Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderEnrollmentAnalysis = (data: EnrollmentAnalysis) => (
    <div className="space-y-6">
      {/* Header Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <GraduationCap className="h-5 w-5 text-blue-600" />
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
            <MapPin className="h-4 w-4" />
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
            <p className="text-gray-700 leading-relaxed">{data.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Compliance Status */}
      {data.compliance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Compliance Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Overall Score:</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${data.compliance.score}%` }}
                  />
                </div>
                <span className="font-medium">{data.compliance.score}%</span>
              </div>
            </div>
            <div>
              <Badge 
                className={
                  data.compliance.status === 'compliant' 
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                }
              >
                {data.compliance.status}
              </Badge>
            </div>
            {data.compliance.details && data.compliance.details.length > 0 && (
              <ul className="space-y-1">
                {data.compliance.details.map((detail, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{detail}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {data.recommendations && data.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recommendations.map((rec, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-medium text-gray-900">{rec.title}</h4>
                  <Badge className={getPriorityColor(rec.priority)}>
                    {rec.priority}
                  </Badge>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{rec.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Required Documents */}
      {data.requiredDocuments && data.requiredDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Required Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.requiredDocuments.map((doc, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Building2 className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">{doc}</span>
                </li>
              ))}
            </ul>
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
                <li key={index} className="flex items-start gap-3">
                  <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full min-w-[1.5rem] text-center">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 text-sm">{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Analysis Details
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <ScrollArea className="px-6 pb-6 max-h-[calc(90vh-80px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : analysis ? (
            <>
              {analysisType === 'visa_rejection' && renderVisaRejectionAnalysis(analysis as VisaRejectionAnalysis)}
              {analysisType === 'enrollment' && renderEnrollmentAnalysis(analysis as EnrollmentAnalysis)}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Analysis not found</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}