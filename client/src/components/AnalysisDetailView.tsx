import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle, FileText, User, Calendar, ArrowRight } from "lucide-react";
import { format } from "date-fns";

interface AnalysisDetailProps {
  analysis: {
    id: number;
    userId: number;
    fileName: string;
    analysisResults: any;
    createdAt: string;
    isPublic: boolean;
    user?: {
      username: string;
      firstName: string;
      lastName: string;
      email: string;
    } | null;
  };
  showUserInfo?: boolean;
}

export function AnalysisDetailView({ analysis, showUserInfo = false }: AnalysisDetailProps) {
  const results = analysis.analysisResults;

  if (!results) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No analysis results available for this file.</p>
        </CardContent>
      </Card>
    );
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'documentation':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'eligibility':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'academic':
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      case 'immigration_history':
        return <AlertTriangle className="h-4 w-4 text-purple-500" />;
      case 'ties_to_home':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'credibility':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'general':
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
      // Legacy severity support
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'financial':
      case 'eligibility':
      case 'credibility':
        return 'destructive';
      case 'documentation':
      case 'ties_to_home':
      case 'immigration_history':
        return 'outline';
      case 'academic':
        return 'secondary';
      case 'general':
        return 'outline';
      // Legacy severity support
      case 'high':
        return 'destructive';
      case 'medium':
        return 'outline';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {analysis.fileName}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Analyzed on {format(new Date(analysis.createdAt), 'MMM dd, yyyy at h:mm a')}
              </p>
            </div>
            <Badge variant={analysis.isPublic ? "default" : "secondary"}>
              {analysis.isPublic ? "Public" : "Private"}
            </Badge>
          </div>
          {showUserInfo && analysis.user && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-muted rounded-lg">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <span className="font-medium">{`${analysis.user.firstName} ${analysis.user.lastName}`}</span>
                <span className="text-muted-foreground"> (@{analysis.user.username})</span>
                <span className="text-muted-foreground"> • {analysis.user.email}</span>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{results.summary}</p>
        </CardContent>
      </Card>

      {/* Rejection Reasons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Rejection Reasons
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {results.rejectionReasons?.map((reason: any, index: number) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-start gap-3">
                {getCategoryIcon(reason.category || reason.severity)}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{reason.title}</h4>
                    <Badge variant={getCategoryColor(reason.category || reason.severity)} className="text-xs">
                      {(reason.category || reason.severity || 'general').replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    {reason.description}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {results.recommendations?.map((recommendation: any, index: number) => (
            <div key={index} className="border rounded-lg p-4 bg-green-50/50">
              <div className="space-y-2">
                <h4 className="font-medium text-green-900">{recommendation.title}</h4>
                <div className="text-sm text-green-700 leading-relaxed">
                  {recommendation.description}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-blue-500" />
            Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {results.nextSteps?.map((step: any, index: number) => (
            <div key={index} className="border rounded-lg p-4 bg-blue-50/50">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-900">{step.title}</h4>
                  <div className="text-sm text-blue-700 leading-relaxed">
                    {step.description}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}