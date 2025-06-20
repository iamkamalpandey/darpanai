import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { CustomCTA } from "@/components/CustomCTA";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Target,
  DollarSign,
  Calendar,
  GraduationCap,
  Building,
  User,
  Loader2
} from "lucide-react";

interface OfferLetterAnalysis {
  id: number;
  fileName: string;
  fileSize: number;
  analysisDate: string;
  profileAnalysis: {
    academicStanding: string;
    gpa: string;
    financialStatus: string;
    relevantSkills: string[];
    strengths: string[];
    weaknesses: string[];
  };
  universityInfo: {
    name: string;
    location: string;
    program: string;
    tuition: string;
    duration: string;
  };
  scholarshipOpportunities: Array<{
    name: string;
    amount: string;
    criteria: string[];
    applicationDeadline: string;
    applicationProcess: string;
    sourceUrl: string;
    eligibilityMatch?: 'High' | 'Medium' | 'Low';
    scholarshipType?: 'Merit' | 'Need-based' | 'International' | 'Research' | 'Program-specific';
    studentProfileMatch?: {
      gpaRequirement: string;
      matchesGPA: boolean;
      academicRequirement: string;
      matchesAcademic: boolean;
      overallMatch: number;
    };
  }>;
  costSavingStrategies: Array<{
    strategy: string;
    description: string;
    potentialSavings: string;
    implementationSteps: string[];
    timeline: string;
    difficulty: 'Low' | 'Medium' | 'High';
  }>;
  recommendations: string[];
  nextSteps: string[];
}

interface UserStats {
  analysisCount: number;
  maxAnalyses: number;
}

export default function OfferLetterAnalysis() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user stats to check analysis credits
  const { data: userStats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ['/api/user/stats'],
  });

  // Fetch offer letter analyses
  const { data: analyses = [], isLoading: analysesLoading } = useQuery<OfferLetterAnalysis[]>({
    queryKey: ['/api/offer-letter-analyses'],
  });

  // Upload and analyze mutation
  const analyzeOfferLetter = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('document', file);
      
      const response = await fetch('/api/offer-letter-analyses', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Analysis failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Analysis Complete",
        description: "Your offer letter has been analyzed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/offer-letter-analyses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] });
      setSelectedFile(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (file: File) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please select a PDF, JPG, or PNG file.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const canAnalyze = userStats ? userStats.analysisCount < userStats.maxAnalyses : true;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Offer Letter Analysis</h1>
          </div>
          <p className="text-blue-100 text-lg">
            Comprehensive analysis of your university offer letter with scholarship matching and cost-saving strategies
          </p>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Your Offer Letter
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!canAnalyze ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You have reached your analysis limit. Please contact support to increase your quota.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragOver
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">
                    Drag and drop your offer letter here, or click to browse
                  </p>
                  <p className="text-gray-500 mb-4">
                    Supports PDF, JPG, PNG files up to 10MB
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" className="cursor-pointer">
                      Select File
                    </Button>
                  </label>
                </div>

                {selectedFile && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => analyzeOfferLetter.mutate(selectedFile)}
                      disabled={analyzeOfferLetter.isPending}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {analyzeOfferLetter.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Target className="h-4 w-4 mr-2" />
                          Analyze Offer Letter
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {userStats && (
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                      Analyses used: {userStats.analysisCount} / {userStats.maxAnalyses}
                    </span>
                    <span>
                      {userStats.maxAnalyses - userStats.analysisCount} analyses remaining
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-lg text-gray-600">Loading analyses...</span>
          </div>
        ) : analyses.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Analysis Results</h2>
            {analyses.map((analysis) => (
              <OfferLetterAnalysisCard key={analysis.id} analysis={analysis} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Analyses Yet</h3>
              <p className="text-gray-500 mb-6">
                Upload your first offer letter to get comprehensive analysis with scholarship matching and cost-saving strategies.
              </p>
            </CardContent>
          </Card>
        )}

        {/* CTA for Expert Guidance */}
        <CustomCTA variant="offer-letter-analysis" />
      </div>
    </DashboardLayout>
  );
}

function OfferLetterAnalysisCard({ analysis }: { analysis: OfferLetterAnalysis }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">
              {analysis.fileName}
            </CardTitle>
            <p className="text-gray-600 mt-1">
              Analyzed on {new Date(analysis.analysisDate).toLocaleDateString()}
            </p>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Complete Analysis
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="scholarships" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Scholarships
            </TabsTrigger>
            <TabsTrigger value="strategies" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Cost Savings
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Next Steps
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* University Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building className="h-5 w-5 text-blue-600" />
                    University Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Institution:</span>
                    <p className="text-gray-900">{analysis.universityInfo.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Location:</span>
                    <p className="text-gray-900">{analysis.universityInfo.location}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Program:</span>
                    <p className="text-gray-900">{analysis.universityInfo.program}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Tuition:</span>
                    <p className="text-blue-600 font-semibold">{analysis.universityInfo.tuition}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Duration:</span>
                    <p className="text-gray-900">{analysis.universityInfo.duration}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Academic Profile */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <GraduationCap className="h-5 w-5 text-green-600" />
                    Academic Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Academic Standing:</span>
                    <p className="text-gray-900">{analysis.profileAnalysis.academicStanding}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">GPA:</span>
                    <p className="text-blue-600 font-semibold">{analysis.profileAnalysis.gpa}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Financial Status:</span>
                    <p className="text-gray-900">{analysis.profileAnalysis.financialStatus}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Relevant Skills:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {analysis.profileAnalysis.relevantSkills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="scholarships" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">Available Scholarships</h3>
              </div>
              
              {analysis.scholarshipOpportunities.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Scholarship Name</th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Amount</th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Criteria</th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Deadline</th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Application Process</th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.scholarshipOpportunities.map((scholarship, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-4 py-2 font-medium">{scholarship.name}</td>
                          <td className="border border-gray-300 px-4 py-2 text-green-600 font-semibold">{scholarship.amount}</td>
                          <td className="border border-gray-300 px-4 py-2">
                            <ul className="list-disc list-inside text-sm">
                              {scholarship.criteria.map((criterion, idx) => (
                                <li key={idx}>{criterion}</li>
                              ))}
                            </ul>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-red-600 font-medium">{scholarship.applicationDeadline}</td>
                          <td className="border border-gray-300 px-4 py-2 text-sm">{scholarship.applicationProcess}</td>
                          <td className="border border-gray-300 px-4 py-2">
                            <a href={scholarship.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                              Official Source
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No specific scholarships found for this program. Consider checking the university's general scholarship page or contact the admissions office directly.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="strategies" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold">Cost-Saving Strategies</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Strategy</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Potential Savings</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Implementation Steps</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Timeline</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Difficulty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.costSavingStrategies.map((strategy, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-4 py-2">
                          <div>
                            <p className="font-medium">{strategy.strategy}</p>
                            <p className="text-sm text-gray-600 mt-1">{strategy.description}</p>
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-green-600 font-semibold">{strategy.potentialSavings}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          <ol className="list-decimal list-inside text-sm space-y-1">
                            {strategy.implementationSteps.map((step, idx) => (
                              <li key={idx}>{step}</li>
                            ))}
                          </ol>
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-blue-600 font-medium">{strategy.timeline}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          <Badge 
                            variant={strategy.difficulty === 'Low' ? 'default' : 
                                   strategy.difficulty === 'Medium' ? 'secondary' : 'destructive'}
                            className={strategy.difficulty === 'Low' ? 'bg-green-100 text-green-800' : 
                                     strategy.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                                     'bg-red-100 text-red-800'}
                          >
                            {strategy.difficulty}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analysis.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3">
                    {analysis.nextSteps.map((step, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <span className="text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Disclaimer */}
        <Alert className="mt-6 border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Disclaimer:</strong> This analysis is for informational purposes only. All scholarship information and cost-saving strategies are based on publicly available data and should be verified independently. Scholarship availability, criteria, and deadlines may change. Always consult official university sources and financial aid offices for the most current information. Darpan Intelligence is not responsible for any financial decisions made based on this analysis.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}