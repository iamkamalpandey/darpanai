import { useState } from "react";
import { useNavigate } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import Assessment from "@/components/Assessment";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Star, Clock, Globe, ArrowRight, CheckCircle } from "lucide-react";
import { z } from "zod";
import { assessmentFormSchema } from "@shared/schema";

type AssessmentFormData = z.infer<typeof assessmentFormSchema>;

export default function AssessmentPage() {
  const [navigate] = useNavigate();
  const [showAssessment, setShowAssessment] = useState(false);

  const createAssessmentMutation = useMutation({
    mutationFn: async (data: AssessmentFormData) => {
      return apiRequest("POST", "/api/assessments", data);
    },
    onSuccess: (response) => {
      toast({
        title: "Assessment Completed Successfully",
        description: `Found ${response.matchCount} university matches for your profile`,
      });
      navigate(`/assessment-results/${response.assessmentId}`);
    },
    onError: (error: any) => {
      toast({
        title: "Assessment Failed",
        description: error.message || "Failed to process your assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAssessmentSubmit = (data: AssessmentFormData) => {
    createAssessmentMutation.mutate(data);
  };

  if (showAssessment) {
    return (
      <Assessment 
        onSubmit={handleAssessmentSubmit}
        isLoading={createAssessmentMutation.isPending}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Brain className="h-4 w-4" />
            AI-Powered University Matching
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Find Your Perfect 
            <span className="text-blue-600"> Study Destination</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Take our comprehensive assessment and get personalized university recommendations 
            powered by advanced AI analysis of your academic profile and preferences.
          </p>
          <Button 
            onClick={() => setShowAssessment(true)}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Start Assessment
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">AI-Powered Analysis</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-base">
                Our advanced AI analyzes your academic background, test scores, and preferences 
                to match you with the most suitable universities worldwide.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Global Universities</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-base">
                Access recommendations from top universities across the US, Canada, UK, 
                Australia, Europe, and other popular study destinations.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Personalized Results</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-base">
                Receive detailed insights, admission requirements, scholarship opportunities, 
                and career prospects tailored specifically to your profile.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Academic Profile",
                description: "Share your academic level, field of study, and GPA"
              },
              {
                step: "2", 
                title: "Test Scores",
                description: "Add your SAT, IELTS, TOEFL, or other standardized test scores"
              },
              {
                step: "3",
                title: "Preferences",
                description: "Select preferred countries, budget range, and lifestyle"
              },
              {
                step: "4",
                title: "AI Matching",
                description: "Get personalized university recommendations with detailed insights"
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white mb-16">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Why Use Our Assessment?</h2>
                <div className="space-y-4">
                  {[
                    "Save weeks of research with instant AI-powered recommendations",
                    "Discover universities you might not have considered",
                    "Get detailed admission requirements and scholarship information",
                    "Understand your chances of acceptance at each university",
                    "Receive career prospects and salary expectations by field"
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0 mt-0.5" />
                      <span className="text-lg">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <Clock className="h-24 w-24 text-white/80 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Quick Assessment</h3>
                <p className="text-xl text-white/90">Takes only 5-10 minutes</p>
                <p className="text-lg text-white/80">Get results instantly</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Find Your Perfect University?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of students who have discovered their ideal study destination through our AI assessment.
          </p>
          <Button 
            onClick={() => setShowAssessment(true)}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 text-xl font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Start Your Assessment Now
            <ArrowRight className="ml-3 h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}