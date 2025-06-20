import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader2, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

interface AnalysisProgressProps {
  isAnalyzing: boolean;
  isSuccess: boolean;
  isError: boolean;
  errorMessage?: string;
  analysisId?: number;
  fileName?: string;
  onViewReport?: () => void;
}

export function AnalysisProgressNotification({
  isAnalyzing,
  isSuccess,
  isError,
  errorMessage,
  analysisId,
  fileName,
  onViewReport
}: AnalysisProgressProps) {
  const [, setLocation] = useLocation();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true);
      // Auto-hide success message after 10 seconds
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const handleViewReport = () => {
    if (analysisId) {
      setLocation(`/offer-letter-analysis/${analysisId}`);
    } else if (onViewReport) {
      onViewReport();
    }
  };

  if (isAnalyzing) {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        <AlertDescription className="text-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Analysis in Progress</div>
              <div className="text-sm text-blue-600 mt-1">
                Processing your offer letter with AI analysis... This may take 30-60 seconds.
              </div>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (isError) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <div className="font-medium">Analysis Failed</div>
          <div className="text-sm text-red-600 mt-1">
            {errorMessage || 'An error occurred during analysis. Please try again.'}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (isSuccess && showSuccess) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Analysis Complete!</div>
              <div className="text-sm text-green-600 mt-1">
                {fileName && `Your comprehensive strategic analysis for "${fileName}" is ready.`}
              </div>
            </div>
            <Button
              onClick={handleViewReport}
              className="ml-4 bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <FileText className="h-4 w-4 mr-2" />
              View Report
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

interface AnalysisStatusProps {
  stage: 'uploading' | 'extracting' | 'parsing' | 'analyzing' | 'saving' | 'complete' | 'error';
  message?: string;
}

export function AnalysisStatus({ stage, message }: AnalysisStatusProps) {
  const getStageInfo = (currentStage: string) => {
    const stages = [
      { key: 'uploading', label: 'Uploading Document', icon: Loader2 },
      { key: 'extracting', label: 'Extracting Text', icon: Loader2 },
      { key: 'parsing', label: 'Parsing Information', icon: Loader2 },
      { key: 'analyzing', label: 'AI Strategic Analysis', icon: Loader2 },
      { key: 'saving', label: 'Saving Results', icon: Loader2 },
      { key: 'complete', label: 'Analysis Complete', icon: CheckCircle },
    ];

    return stages.map(s => ({
      ...s,
      isActive: s.key === currentStage,
      isComplete: stages.findIndex(stage => stage.key === currentStage) > stages.findIndex(stage => stage.key === s.key),
    }));
  };

  const stages = getStageInfo(stage);

  if (stage === 'error') {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <div className="font-medium">Processing Error</div>
          <div className="text-sm text-red-600 mt-1">{message}</div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-gray-700">Processing Your Document</div>
      <div className="space-y-2">
        {stages.map((stageInfo, index) => {
          const Icon = stageInfo.icon;
          return (
            <div key={stageInfo.key} className="flex items-center space-x-3">
              <div className={`flex items-center justify-center w-6 h-6 rounded-full ${
                stageInfo.isComplete 
                  ? 'bg-green-100 text-green-600' 
                  : stageInfo.isActive 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-400'
              }`}>
                {stageInfo.isComplete ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Icon className={`w-4 h-4 ${stageInfo.isActive ? 'animate-spin' : ''}`} />
                )}
              </div>
              <div className={`text-sm ${
                stageInfo.isComplete || stageInfo.isActive 
                  ? 'text-gray-700 font-medium' 
                  : 'text-gray-500'
              }`}>
                {stageInfo.label}
              </div>
            </div>
          );
        })}
      </div>
      {message && (
        <div className="text-xs text-gray-600 mt-2 pl-9">{message}</div>
      )}
    </div>
  );
}