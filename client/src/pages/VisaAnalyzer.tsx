import { useState } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AnalysisResponse } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ConsultationForm } from "@/components/ConsultationForm";
import { UsageLimitDisplay } from "@/components/UsageLimitDisplay";
import ProcessSteps from "@/components/ProcessSteps";
import FileUpload from "@/components/FileUpload";
import AnalysisResults from "@/components/AnalysisResults";
import { Loader2, BarChart3 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";

export default function VisaAnalyzer() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResponse | null>(null);
  const [processingStep, setProcessingStep] = useState("Extracting text from document...");
  const [processingProgress, setProcessingProgress] = useState(0);
  const { toast } = useToast();

  const analyzeDocument = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      setProcessingStep("Extracting text from document...");
      setProcessingProgress(30);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        let errorMessage = response.statusText;
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || response.statusText;
          } else {
            const errorText = await response.text();
            errorMessage = errorText || response.statusText;
          }
        } catch (parseError) {
          // Use default status text if parsing fails
          errorMessage = response.statusText;
        }
        throw new Error(errorMessage);
      }

      setProcessingStep("Analyzing content...");
      setProcessingProgress(60);

      // Simulate a slight delay to show the processing state
      await new Promise(resolve => setTimeout(resolve, 1500));

      setProcessingStep("Generating recommendations...");
      setProcessingProgress(90);

      await new Promise(resolve => setTimeout(resolve, 1000));

      setProcessingProgress(100);
      
      const responseData = await response.json();
      console.log('Analysis response received:', responseData);
      
      // Validate that we have the expected analysis structure
      if (!responseData || typeof responseData !== 'object') {
        throw new Error('Invalid response format from server');
      }
      
      // Check for required fields - arrays can be empty for non-visa documents
      const hasValidStructure = (
        responseData.summary &&
        Array.isArray(responseData.rejectionReasons) &&
        Array.isArray(responseData.recommendations) &&
        Array.isArray(responseData.nextSteps)
      );
      
      if (!hasValidStructure) {
        console.error('Invalid analysis response structure:', {
          hasSummary: !!responseData.summary,
          hasRejectionReasonsArray: Array.isArray(responseData.rejectionReasons),
          hasRecommendationsArray: Array.isArray(responseData.recommendations),
          hasNextStepsArray: Array.isArray(responseData.nextSteps),
          responseData
        });
        throw new Error('Analysis response is missing required fields or has invalid structure');
      }
      
      console.log('Analysis response validation successful');
      
      return responseData as AnalysisResponse;
    },
    onSuccess: (data) => {
      console.log('Analysis successful, setting results:', data);
      setAnalysisResults(data);
      setCurrentStep(3);
      toast({
        title: "Analysis Complete",
        description: "Your visa rejection letter has been analyzed successfully.",
      });
    },
    onError: (error) => {
      console.error('Analysis error:', error);
      toast({
        title: "Error analyzing document",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setCurrentStep(1);
    },
  });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleProcessDocument = () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to analyze.",
        variant: "destructive",
      });
      return;
    }

    // Check if user has credits available before processing
    if (user && user.analysisCount >= user.maxAnalyses) {
      toast({
        title: "Analysis Limit Reached",
        description: `You have used all ${user.maxAnalyses} of your analyses. Please contact admin for more credits.`,
        variant: "destructive"
      });
      return;
    }

    setCurrentStep(2);
    analyzeDocument.mutate(selectedFile);
  };

  const handleStartOver = () => {
    setSelectedFile(null);
    setAnalysisResults(null);
    setCurrentStep(1);
  };

  // Custom component to wrap analysis results with consultation options
  const EnhancedAnalysisResults = () => {
    if (!analysisResults) return null;

    return (
      <div className="space-y-6">
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Analysis Results</h2>
              <p className="text-muted-foreground">
                Here's what we found in your visa rejection letter
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/history">
                <Button variant="outline" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>View History</span>
                </Button>
              </Link>
              <ConsultationForm 
                buttonText="Get Expert Help" 
                subject="Visa Rejection Consultation"
              />
            </div>
          </div>
        </div>

        <AnalysisResults 
          results={analysisResults} 
          onStartOver={handleStartOver} 
        />

        <div className="rounded-lg bg-primary/10 p-6 mt-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-3">Need Additional Guidance?</h3>
            <p className="text-muted-foreground mb-4 max-w-xl mx-auto">
              Our visa experts can provide personalized advice based on this analysis
            </p>
            <ConsultationForm 
              buttonSize="lg" 
              subject={`Consultation Request: ${analysisResults.summary.substring(0, 50)}...`}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {currentStep < 3 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">Visa Analyzer</h1>
              <p className="text-muted-foreground mt-1">
                Upload your visa rejection letter for detailed analysis
              </p>
            </div>
            {currentStep === 1 && (
              <Link href="/history">
                <Button variant="outline" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>View History</span>
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Usage Limit Display */}
        <UsageLimitDisplay />

        {/* Process Steps */}
        <ProcessSteps currentStep={currentStep} />
        
        {/* Upload Section */}
        {currentStep === 1 && (
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Upload Visa Rejection Letter</h2>
              <p className="text-muted-foreground mb-6">
                Upload your visa rejection letter to receive a detailed analysis and personalized recommendations.
                We support PDF, JPG, and PNG formats.
              </p>
              
              <FileUpload 
                onFileSelect={handleFileSelect} 
                selectedFile={selectedFile}
                disabled={(user?.analysisCount ?? 0) >= (user?.maxAnalyses ?? 0) && !!user}
              />
              
              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={handleProcessDocument}
                  disabled={!selectedFile || analyzeDocument.isPending || (user?.analysisCount ?? 0) >= (user?.maxAnalyses ?? 0)}
                  className="gap-2"
                >
                  {analyzeDocument.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (user?.analysisCount ?? 0) >= (user?.maxAnalyses ?? 0) && user ? (
                    <>Credits Exhausted</>
                  ) : (
                    <>Analyze Document</>
                  )}
                </Button>
              </div>
            </div>
            
            {/* Strategic CTA for users who exhausted credits */}
            {(user?.analysisCount ?? 0) >= (user?.maxAnalyses ?? 0) && user && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6 mt-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-orange-900 mb-3">
                    Ready for Expert Analysis?
                  </h3>
                  <p className="text-orange-700 mb-4 max-w-2xl mx-auto">
                    You've used all your free analyses. Get unlimited expert consultations and personalized guidance from our visa specialists to maximize your approval chances.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <ConsultationForm 
                      buttonSize="lg"
                      buttonText="Book Expert Consultation"
                      subject="Need More Document Analysis - Credit Exhausted"
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    />
                    <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                      View Pricing Plans
                    </Button>
                  </div>
                  <p className="text-sm text-orange-600 mt-3">
                    Get personalized advice • Unlimited consultations • 90% success rate
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Processing Section */}
        {currentStep === 2 && (
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Processing Your Document</h2>
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground text-center font-medium mb-6">{processingStep}</p>
                <div className="w-full max-w-md">
                  <Progress value={processingProgress} className="h-2" />
                </div>
                <p className="text-xs text-muted-foreground mt-4">Please do not close this window</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Results Section */}
        {currentStep === 3 && analysisResults && <EnhancedAnalysisResults />}
      </div>
    </DashboardLayout>
  );
}
