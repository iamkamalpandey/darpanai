import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FileText, Phone } from "lucide-react";
import { ConsultationForm } from "./ConsultationForm";

export function UsageLimitDisplay() {
  const { user } = useAuth();

  if (!user) return null;

  // Ensure we have valid numbers with fallbacks
  const analysisCount = user.analysisCount || 0;
  const maxAnalyses = user.maxAnalyses || 3;
  
  const usagePercentage = maxAnalyses > 0 ? (analysisCount / maxAnalyses) * 100 : 0;
  const remainingAnalyses = maxAnalyses - analysisCount;
  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = analysisCount >= maxAnalyses;

  return (
    <Card className={`mb-6 ${isAtLimit ? 'border-red-200 bg-red-50' : isNearLimit ? 'border-orange-200 bg-orange-50' : ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5" />
          Analysis Usage
          {isAtLimit && (
            <Badge variant="destructive" className="ml-auto">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Limit Reached
            </Badge>
          )}
          {isNearLimit && !isAtLimit && (
            <Badge variant="outline" className="ml-auto text-orange-600 border-orange-600">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Near Limit
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Used: {analysisCount} / {maxAnalyses}</span>
            <span>{remainingAnalyses} remaining</span>
          </div>
          <Progress 
            value={usagePercentage} 
            className={`h-2 ${isAtLimit ? '[&>div]:bg-red-500' : isNearLimit ? '[&>div]:bg-orange-500' : ''}`}
          />
        </div>
        
        {isAtLimit && (
          <div className="p-4 bg-white rounded-lg border border-red-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-red-900 mb-1">Analysis Limit Reached</h4>
                <p className="text-sm text-red-700 mb-3">
                  You have used all {maxAnalyses} of your available analyses. Contact our admin team to request additional analysis credits.
                </p>
                <ConsultationForm
                  buttonText="Contact Admin"
                  buttonVariant="default"
                  buttonSize="sm"
                  subject="Request Additional Analysis Credits"
                  className="bg-red-600 hover:bg-red-700"
                />
              </div>
            </div>
          </div>
        )}
        
        {isNearLimit && !isAtLimit && (
          <div className="p-4 bg-white rounded-lg border border-orange-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-orange-900 mb-1">Running Low on Analyses</h4>
                <p className="text-sm text-orange-700 mb-3">
                  You have {remainingAnalyses} analysis{remainingAnalyses !== 1 ? 'es' : ''} remaining. Consider booking a consultation to discuss your visa application strategy.
                </p>
                <div className="flex gap-2">
                  <ConsultationForm
                    buttonText="Book Consultation"
                    buttonVariant="outline"
                    buttonSize="sm"
                    subject="Visa Application Strategy Consultation"
                  />
                  <ConsultationForm
                    buttonText="Request More Credits"
                    buttonVariant="default"
                    buttonSize="sm"
                    subject="Request Additional Analysis Credits"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {!isNearLimit && (
          <div className="text-sm text-muted-foreground">
            You have {remainingAnalyses} analysis{remainingAnalyses !== 1 ? 'es' : ''} remaining in your current plan.
          </div>
        )}
      </CardContent>
    </Card>
  );
}