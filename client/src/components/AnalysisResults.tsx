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
          
          {/* Summary Section */}
          <div className="mb-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Summary</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {summary}
            </p>
          </div>
          
          {/* Rejection Reasons */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Rejection Reasons</h3>
            
            {rejectionReasons.map((reason, index) => (
              <div 
                key={index} 
                className={`mb-4 border-l-4 ${
                  reason.severity === 'high' ? 'border-red-500' :
                  reason.severity === 'medium' ? 'border-orange-500' :
                  'border-yellow-500'
                } pl-4`}
              >
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">{reason.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{reason.description}</p>
              </div>
            ))}
          </div>
          
          {/* Recommendations */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Personalized Recommendations</h3>
            <div className="space-y-4">
              {recommendations.map((recommendation, index) => (
                <div key={index} className="bg-primary-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex">
                    <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">{recommendation.title}</h4>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{recommendation.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Next Steps */}
          <div>
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Suggested Next Steps</h3>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {nextSteps.map((step, index) => (
                  <li key={index} className="p-4 flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 relative mt-1">
                      <div className="absolute inset-0 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                        <span className="text-primary-600 dark:text-primary-400 text-xs font-medium">{index + 1}</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{step.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onStartOver}
          className="inline-flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          Analyze Another Document
        </Button>
        <Button 
          variant="default"
          className="bg-green-600 hover:bg-green-700 inline-flex items-center"
        >
          Get Expert Assistance
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
