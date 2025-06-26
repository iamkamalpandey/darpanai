import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AssessmentStep, { CountrySelection } from "@/components/assessment-step";
import Navigation from "@/components/nav";

interface AssessmentData {
  userId?: number;
  academicLevel: string;
  fieldOfStudy: string;
  gpa: string;
  testScores: Record<string, number>;
  preferredCountries: string[];
  budgetRange: string;
  lifestyle: string;
  specialRequirements?: string;
}

export default function SimpleAssessment() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<AssessmentData>({
    academicLevel: '',
    fieldOfStudy: '',
    gpa: '',
    testScores: {},
    preferredCountries: [],
    budgetRange: '',
    lifestyle: '',
    specialRequirements: ''
  });

  const totalSteps = 6;

  const submitAssessment = useMutation({
    mutationFn: async (data: AssessmentData) => {
      const response = await apiRequest("POST", "/api/assessments", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Assessment Completed!",
        description: "Redirecting to your personalized results...",
      });
      setLocation(`/results/${data.assessment.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to process assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      submitAssessment.mutate(formData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (updates: Partial<AssessmentData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const canContinue = (): boolean => {
    switch (currentStep) {
      case 1:
        return Boolean(formData.academicLevel && formData.fieldOfStudy);
      case 2:
        return Boolean(formData.gpa);
      case 3:
        return formData.preferredCountries.length > 0;
      case 4:
        return Boolean(formData.budgetRange);
      case 5:
        return Boolean(formData.lifestyle);
      case 6:
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <AssessmentStep
            currentStep={currentStep}
            totalSteps={totalSteps}
            title="What's your academic background?"
            description="Tell us about your current academic level and field of interest to help us find the best matches."
            onNext={handleNext}
            onPrevious={handlePrevious}
            canContinue={canContinue()}
          >
            <div className="space-y-6">
              <div>
                <Label htmlFor="academicLevel">Academic Level</Label>
                <Select value={formData.academicLevel} onValueChange={(value) => updateFormData({ academicLevel: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your academic level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="graduate">Graduate (Master's)</SelectItem>
                    <SelectItem value="phd">PhD/Doctorate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="fieldOfStudy">Field of Study</Label>
                <Select value={formData.fieldOfStudy} onValueChange={(value) => updateFormData({ fieldOfStudy: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your field of study" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="computer-science">Computer Science</SelectItem>
                    <SelectItem value="data-science">Data Science</SelectItem>
                    <SelectItem value="business">Business Administration</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="medicine">Medicine</SelectItem>
                    <SelectItem value="law">Law</SelectItem>
                    <SelectItem value="arts">Arts & Humanities</SelectItem>
                    <SelectItem value="social-sciences">Social Sciences</SelectItem>
                    <SelectItem value="natural-sciences">Natural Sciences</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AssessmentStep>
        );

      case 2:
        return (
          <AssessmentStep
            currentStep={currentStep}
            totalSteps={totalSteps}
            title="What are your academic credentials?"
            description="Your GPA and test scores help us assess your competitiveness for different universities."
            onNext={handleNext}
            onPrevious={handlePrevious}
            canContinue={canContinue()}
          >
            <div className="space-y-6">
              <div>
                <Label htmlFor="gpa">GPA (4.0 scale)</Label>
                <Input
                  id="gpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={formData.gpa}
                  onChange={(e) => updateFormData({ gpa: e.target.value })}
                  placeholder="e.g., 3.7"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sat">SAT Score (optional)</Label>
                  <Input
                    id="sat"
                    type="number"
                    min="400"
                    max="1600"
                    value={formData.testScores.sat || ''}
                    onChange={(e) => updateFormData({ 
                      testScores: { ...formData.testScores, sat: parseInt(e.target.value) || 0 }
                    })}
                    placeholder="e.g., 1450"
                  />
                </div>
                <div>
                  <Label htmlFor="gre">GRE Score (optional)</Label>
                  <Input
                    id="gre"
                    type="number"
                    min="260"
                    max="340"
                    value={formData.testScores.gre || ''}
                    onChange={(e) => updateFormData({ 
                      testScores: { ...formData.testScores, gre: parseInt(e.target.value) || 0 }
                    })}
                    placeholder="e.g., 320"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="toefl">TOEFL Score (optional)</Label>
                  <Input
                    id="toefl"
                    type="number"
                    min="0"
                    max="120"
                    value={formData.testScores.toefl || ''}
                    onChange={(e) => updateFormData({ 
                      testScores: { ...formData.testScores, toefl: parseInt(e.target.value) || 0 }
                    })}
                    placeholder="e.g., 105"
                  />
                </div>
                <div>
                  <Label htmlFor="ielts">IELTS Score (optional)</Label>
                  <Input
                    id="ielts"
                    type="number"
                    step="0.5"
                    min="0"
                    max="9"
                    value={formData.testScores.ielts || ''}
                    onChange={(e) => updateFormData({ 
                      testScores: { ...formData.testScores, ielts: parseFloat(e.target.value) || 0 }
                    })}
                    placeholder="e.g., 7.5"
                  />
                </div>
              </div>
            </div>
          </AssessmentStep>
        );

      case 3:
        return (
          <AssessmentStep
            currentStep={currentStep}
            totalSteps={totalSteps}
            title="What's your preferred study destination?"
            description="Select all countries you're interested in studying in. This helps us narrow down the best matches for you."
            onNext={handleNext}
            onPrevious={handlePrevious}
            canContinue={canContinue()}
          >
            <CountrySelection
              selectedCountries={formData.preferredCountries}
              onSelectionChange={(countries) => updateFormData({ preferredCountries: countries })}
            />
          </AssessmentStep>
        );

      case 4:
        return (
          <AssessmentStep
            currentStep={currentStep}
            totalSteps={totalSteps}
            title="What's your budget range?"
            description="This includes tuition fees and living expenses per year. We'll factor this into our recommendations."
            onNext={handleNext}
            onPrevious={handlePrevious}
            canContinue={canContinue()}
          >
            <RadioGroup
              value={formData.budgetRange}
              onValueChange={(value) => updateFormData({ budgetRange: value })}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2 p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                <RadioGroupItem value="low" id="budget-low" />
                <Label htmlFor="budget-low" className="flex-1 cursor-pointer">
                  <div className="font-medium">Budget-Friendly ($10K - $30K/year)</div>
                  <div className="text-sm text-slate-600">Great value universities with lower costs</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                <RadioGroupItem value="medium" id="budget-medium" />
                <Label htmlFor="budget-medium" className="flex-1 cursor-pointer">
                  <div className="font-medium">Moderate ($30K - $60K/year)</div>
                  <div className="text-sm text-slate-600">Balanced option with good quality and reasonable cost</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                <RadioGroupItem value="high" id="budget-high" />
                <Label htmlFor="budget-high" className="flex-1 cursor-pointer">
                  <div className="font-medium">Premium ($60K+ /year)</div>
                  <div className="text-sm text-slate-600">Top-tier universities with premium facilities</div>
                </Label>
              </div>
            </RadioGroup>
          </AssessmentStep>
        );

      case 5:
        return (
          <AssessmentStep
            currentStep={currentStep}
            totalSteps={totalSteps}
            title="What's your preferred lifestyle?"
            description="Your living environment preference helps us recommend universities in locations that match your lifestyle."
            onNext={handleNext}
            onPrevious={handlePrevious}
            canContinue={canContinue()}
          >
            <RadioGroup
              value={formData.lifestyle}
              onValueChange={(value) => updateFormData({ lifestyle: value })}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2 p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                <RadioGroupItem value="urban" id="lifestyle-urban" />
                <Label htmlFor="lifestyle-urban" className="flex-1 cursor-pointer">
                  <div className="font-medium">Urban 🏙️</div>
                  <div className="text-sm text-slate-600">Major cities with vibrant culture, internships, and networking</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                <RadioGroupItem value="suburban" id="lifestyle-suburban" />
                <Label htmlFor="lifestyle-suburban" className="flex-1 cursor-pointer">
                  <div className="font-medium">Suburban 🏘️</div>
                  <div className="text-sm text-slate-600">Balanced environment with easy access to city amenities</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                <RadioGroupItem value="rural" id="lifestyle-rural" />
                <Label htmlFor="lifestyle-rural" className="flex-1 cursor-pointer">
                  <div className="font-medium">Rural/College Town 🌳</div>
                  <div className="text-sm text-slate-600">Quiet, focused academic environment with strong campus community</div>
                </Label>
              </div>
            </RadioGroup>
          </AssessmentStep>
        );

      case 6:
        return (
          <AssessmentStep
            currentStep={currentStep}
            totalSteps={totalSteps}
            title="Any special requirements or preferences?"
            description="Optional: Share any specific requirements, concerns, or preferences to help us provide more personalized recommendations."
            onNext={handleNext}
            onPrevious={handlePrevious}
            canContinue={canContinue()}
            isLoading={submitAssessment.isPending}
          >
            <div>
              <Label htmlFor="specialRequirements">Special Requirements (optional)</Label>
              <Textarea
                id="specialRequirements"
                value={formData.specialRequirements}
                onChange={(e) => updateFormData({ specialRequirements: e.target.value })}
                placeholder="e.g., Need research opportunities, prefer specific climate, accessibility requirements, scholarship opportunities, etc."
                className="min-h-[120px]"
              />
            </div>
          </AssessmentStep>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      {renderStep()}
    </div>
  );
}