import { AnalysisResponse } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, RotateCcw } from "lucide-react";
import { AnalysisDetailView } from "./AnalysisDetailView";

interface AnalysisResultsProps {
  results: AnalysisResponse;
  onStartOver: () => void;
}

export default function AnalysisResults({ results, onStartOver }: AnalysisResultsProps) {
  // Convert results to the format expected by AnalysisDetailView
  const analysisData = {
    id: 0,
    userId: 0,
    fileName: "Your Analysis Results",
    analysisResults: results,
    createdAt: new Date().toISOString(),
    isPublic: false,
  };

  const handleDownloadReport = () => {
    // Format the analysis results as text
    const reportContent = `
VISA REJECTION ANALYSIS REPORT

SUMMARY:
${results.summary}

REJECTION REASONS:
${results.rejectionReasons.map((reason, index) => `${index + 1}. ${reason.title}\n   ${reason.description}`).join('\n\n')}

RECOMMENDATIONS:
${results.recommendations.map((rec, index) => `${index + 1}. ${rec.title}\n   ${rec.description}`).join('\n\n')}

NEXT STEPS:
${results.nextSteps.map((step, index) => `${index + 1}. ${step.title}\n   ${step.description}`).join('\n\n')}
`;

    // Create a Blob with the text content
    const blob = new Blob([reportContent], { type: 'text/plain' });
    
    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'visa_rejection_analysis.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Analysis Complete</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadReport}
                className="inline-flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={onStartOver}
                className="inline-flex items-center"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Analyze Another File
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Analysis Results */}
      <AnalysisDetailView analysis={analysisData} showUserInfo={false} />
    </div>
  );
}