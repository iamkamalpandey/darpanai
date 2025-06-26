import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import AdvancedAssessment from "@/components/AdvancedAssessment";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, Star, Clock, Globe, ArrowRight, CheckCircle, 
  GraduationCap, MapPin, Award, TrendingUp, Users, Zap,
  Building2, Target, BookOpen, DollarSign
} from "lucide-react";
import { z } from "zod";
import { advancedAssessmentSchema } from "@shared/schema";

type AdvancedAssessmentFormData = z.infer<typeof advancedAssessmentSchema>;

interface University {
  id: number;
  name: string;
  country: string;
  city: string;
  ranking: number;
  tuitionFee: number;
  acceptanceRate: string;
  gpaRequirement: string;
  satRequirement: number;
  ieltsRequirement: number;
  toeflRequirement: number;
  programs: string[];
  scholarships: string[];
  researchOpportunities: boolean;
  campusSize: string;
  studentPopulation: number;
  internationalStudents: number;
  website: string;
  imageUrl?: string;
  description: string;
}

interface UniversityMatch {
  university: University;
  matchScore: number;
  matchReasons: string[];
  financialFit: string;
  academicFit: string;
  culturalFit: string;
  careerProspects: string;
  admissionProbability: string;
}

interface RecommendationResults {
  assessmentId: number;
  overallMatch: number;
  matches: UniversityMatch[];
  analysisTime: number;
  recommendations: string[];
  nextSteps: string[];
}

export default function AdvancedAssessmentPage() {
  const [, setLocation] = useLocation();
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<RecommendationResults | null>(null);

  const assessmentMutation = useMutation({
    mutationFn: async (data: AdvancedAssessmentFormData) => {
      const response = await apiRequest("POST", "/api/darpan/advanced-assessment", data);
      return response as unknown as RecommendationResults;
    },
    onSuccess: (data) => {
      setResults(data);
      setShowResults(true);
      toast({
        title: "Assessment Complete!",
        description: `Found ${data.matches.length} university matches with ${data.overallMatch}% compatibility`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Assessment Failed",
        description: error.message || "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (showResults && results) {
    return <RecommendationResults results={results} onStartOver={() => {
      setShowResults(false);
      setResults(null);
    }} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <AdvancedAssessment 
        onSubmit={assessmentMutation.mutate}
        isLoading={assessmentMutation.isPending}
      />
    </div>
  );
}

function RecommendationResults({ results, onStartOver }: { 
  results: RecommendationResults; 
  onStartOver: () => void; 
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-900">Assessment Complete</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Your Personalized University Recommendations
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Based on your comprehensive assessment, we've found {results.matches.length} universities 
            that match your profile with {results.overallMatch}% overall compatibility
          </p>
        </div>

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{results.overallMatch}%</div>
              <div className="text-sm text-gray-600">Overall Match</div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-3">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{results.matches.length}</div>
              <div className="text-sm text-gray-600">Universities Found</div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-3">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {new Set(results.matches.map(m => m.university.country)).size}
              </div>
              <div className="text-sm text-gray-600">Countries</div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-3">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{Math.round(results.analysisTime / 1000)}s</div>
              <div className="text-sm text-gray-600">Analysis Time</div>
            </CardContent>
          </Card>
        </div>

        {/* University Matches */}
        <div className="space-y-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-600" />
            Top University Matches
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {results.matches.map((match, index) => (
              <Card key={match.university.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          #{index + 1} Match
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${
                          match.matchScore >= 90 ? 'border-green-500 text-green-700' :
                          match.matchScore >= 80 ? 'border-blue-500 text-blue-700' :
                          match.matchScore >= 70 ? 'border-yellow-500 text-yellow-700' :
                          'border-gray-500 text-gray-700'
                        }`}>
                          {match.matchScore}% Match
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{match.university.name}</h3>
                      <p className="text-gray-600 mb-2">
                        {match.university.city}, {match.university.country}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span>#{match.university.ranking} Global Ranking</span>
                        <span>{match.university.acceptanceRate} Acceptance Rate</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        ${match.university.tuitionFee.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">Annual Tuition</div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Academic Fit</span>
                      <Badge variant="outline" className="text-xs">{match.academicFit}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Financial Fit</span>
                      <Badge variant="outline" className="text-xs">{match.financialFit}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Cultural Fit</span>
                      <Badge variant="outline" className="text-xs">{match.culturalFit}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Admission Probability</span>
                      <Badge variant="outline" className={`text-xs ${
                        match.admissionProbability === 'High' ? 'border-green-500 text-green-700' :
                        match.admissionProbability === 'Medium' ? 'border-yellow-500 text-yellow-700' :
                        'border-red-500 text-red-700'
                      }`}>
                        {match.admissionProbability}
                      </Badge>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Why This University Matches:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {match.matchReasons.slice(0, 3).map((reason, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" className="flex-1">
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      Save
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recommendations & Next Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                Key Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {results.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Star className="w-4 h-4 text-yellow-500 mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {results.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full text-xs font-semibold text-blue-600 mt-0.5 flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-sm text-gray-700">{step}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button onClick={onStartOver} variant="outline" size="lg">
            Take New Assessment
          </Button>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            Book Consultation
          </Button>
          <Button size="lg" variant="outline">
            Download Report
          </Button>
        </div>
      </div>
    </div>
  );
}