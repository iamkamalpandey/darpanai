import { useState } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AnalysisResponse } from "@shared/schema";
import { Button } from "@/components/ui/button";
import ProcessSteps from "@/components/ProcessSteps";
import FileUpload from "@/components/FileUpload";
import AnalysisResults from "@/components/AnalysisResults";

export default function VisaAnalyzer() {
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h1 className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">Visa Rejection Analyzer</h1>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Process Steps */}
          <ProcessSteps currentStep={currentStep} />
          
          {/* Upload Section */}
          {currentStep === 1 && (
            <div className="mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Upload Visa Rejection Letter</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
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
                      className="inline-flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                      </svg>
                      Analyze Document
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Processing Section */}
          {currentStep === 2 && (
            <div className="mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Processing Your Document</h2>
                  <div className="flex flex-col items-center justify-center py-12">
                    <svg className="animate-spin h-12 w-12 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-700 dark:text-gray-300 text-center">{processingStep}</p>
                    <div className="w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-6">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${processingProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Please do not close this window</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Results Section */}
          {currentStep === 3 && analysisResults && (
            <AnalysisResults 
              results={analysisResults} 
              onStartOver={handleStartOver} 
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400">
            <p>© 2023 Visa Rejection Analyzer. All rights reserved.</p>
            <div className="flex space-x-4 mt-2 md:mt-0">
              <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">Privacy Policy</a>
              <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">Terms of Service</a>
              <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">Help Center</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
