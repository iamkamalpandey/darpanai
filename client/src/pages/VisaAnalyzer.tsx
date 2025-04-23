import { useState } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AnalysisResponse } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ConsultationForm } from "@/components/ConsultationForm";
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
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }

      setProcessingStep("Analyzing content...");
      setProcessingProgress(60);

      // Simulate a slight delay to show the processing state
      await new Promise(resolve => setTimeout(resolve, 1500));

      setProcessingStep("Generating recommendations...");
      setProcessingProgress(90);

      await new Promise(resolve => setTimeout(resolve, 1000));

      setProcessingProgress(100);
      return await response.json() as AnalysisResponse;
    },
    onSuccess: (data) => {
      setAnalysisResults(data);
      setCurrentStep(3);
    },
    onError: (error) => {
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
              />
              
              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={handleProcessDocument}
                  disabled={!selectedFile || analyzeDocument.isPending}
                  className="gap-2"
                >
                  {analyzeDocument.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>Analyze Document</>
                  )}
                </Button>
              </div>
            </div>
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
