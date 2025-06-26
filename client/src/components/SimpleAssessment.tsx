import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Brain, MapPin, BookOpen, DollarSign, GraduationCap, Target } from "lucide-react";

interface AssessmentData {
  academicLevel: string;
  fieldOfStudy: string;
  gpa: string;
  testScores?: {
    sat?: number;
    gre?: number;
    toefl?: number;
    ielts?: number;
  };
  preferredCountries: string[];
  budgetRange: string;
  lifestyle?: string;
  careerGoals: string;
}

interface RecommendationResult {
  universities: Array<{
    name: string;
    country: string;
    city: string;
    ranking: number;
    tuitionFee: number;
    matchScore: number;
    matchReasons: string[];
  }>;
  summary: string;
}

export default function SimpleAssessment() {
  const [currentStep, setCurrentStep] = useState(1);
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    academicLevel: "",
    fieldOfStudy: "",
    gpa: "",
    testScores: {},
    preferredCountries: [],
    budgetRange: "",
    lifestyle: "",
    careerGoals: ""
  });
  const [results, setResults] = useState<RecommendationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateData = (field: keyof AssessmentData, value: any) => {
    setAssessmentData(prev => ({ ...prev, [field]: value }));
  };

  const handleCountryChange = (country: string) => {
    setAssessmentData(prev => ({
      ...prev,
      preferredCountries: prev.preferredCountries.includes(country)
        ? prev.preferredCountries.filter(c => c !== country)
        : [...prev.preferredCountries, country]
    }));
  };

  const submitAssessment = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/assessment/generate-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentData),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data);
        setCurrentStep(3);
        toast({
          title: "Recommendations Generated",
          description: "Your personalized university recommendations are ready!",
        });
      } else {
        throw new Error('Failed to generate recommendations');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Academic Background
        </CardTitle>
        <CardDescription>Tell us about your academic profile</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="academicLevel">Academic Level</Label>
          <Select value={assessmentData.academicLevel} onValueChange={(value) => updateData('academicLevel', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your current level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high_school">High School</SelectItem>
              <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
              <SelectItem value="master">Master's Degree</SelectItem>
              <SelectItem value="phd">PhD</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fieldOfStudy">Field of Study</Label>
          <Select value={assessmentData.fieldOfStudy} onValueChange={(value) => updateData('fieldOfStudy', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your field" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="computer_science">Computer Science</SelectItem>
              <SelectItem value="medicine">Medicine</SelectItem>
              <SelectItem value="arts">Arts & Humanities</SelectItem>
              <SelectItem value="science">Natural Sciences</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gpa">GPA / Academic Score</Label>
          <Input
            id="gpa"
            placeholder="e.g., 3.8 or 85%"
            value={assessmentData.gpa}
            onChange={(e) => updateData('gpa', e.target.value)}
          />
        </div>

        <Button 
          onClick={() => setCurrentStep(2)} 
          className="w-full"
          disabled={!assessmentData.academicLevel || !assessmentData.fieldOfStudy || !assessmentData.gpa}
        >
          Continue to Preferences
        </Button>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Study Preferences
        </CardTitle>
        <CardDescription>Where would you like to study and what's your budget?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Preferred Countries (select all that apply)</Label>
          <div className="grid grid-cols-2 gap-2">
            {['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'Netherlands'].map(country => (
              <Button
                key={country}
                variant={assessmentData.preferredCountries.includes(country) ? "default" : "outline"}
                onClick={() => handleCountryChange(country)}
                className="text-sm"
              >
                {country}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Budget Range (USD per year)</Label>
          <RadioGroup
            value={assessmentData.budgetRange}
            onValueChange={(value) => updateData('budgetRange', value)}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
              <RadioGroupItem value="low" id="budget-low" />
              <Label htmlFor="budget-low" className="flex-1 cursor-pointer">
                <div className="font-medium">Budget-Friendly ($10K - $30K/year)</div>
                <div className="text-sm text-slate-600">Great value universities with lower costs</div>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
              <RadioGroupItem value="medium" id="budget-medium" />
              <Label htmlFor="budget-medium" className="flex-1 cursor-pointer">
                <div className="font-medium">Moderate ($30K - $60K/year)</div>
                <div className="text-sm text-slate-600">Balanced option with good quality and reasonable cost</div>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
              <RadioGroupItem value="high" id="budget-high" />
              <Label htmlFor="budget-high" className="flex-1 cursor-pointer">
                <div className="font-medium">Premium ($60K+ /year)</div>
                <div className="text-sm text-slate-600">Top-tier universities with premium facilities</div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="careerGoals">Career Goals (optional)</Label>
          <Textarea
            id="careerGoals"
            placeholder="Describe your career aspirations..."
            value={assessmentData.careerGoals}
            onChange={(e) => updateData('careerGoals', e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
            Back
          </Button>
          <Button 
            onClick={submitAssessment} 
            disabled={loading || assessmentData.preferredCountries.length === 0 || !assessmentData.budgetRange}
            className="flex-1"
          >
            {loading ? "Generating..." : "Get Recommendations"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderResults = () => (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Your Personalized Recommendations
        </CardTitle>
        <CardDescription>Universities matched to your profile</CardDescription>
      </CardHeader>
      <CardContent>
        {results && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Summary</h3>
              <p className="text-blue-800">{results.summary}</p>
            </div>
            
            <div className="grid gap-4">
              {results.universities.map((university, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{university.name}</h3>
                        <p className="text-sm text-gray-600">{university.city}, {university.country}</p>
                      </div>
                      <div className="text-right">
                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                          {university.matchScore}% Match
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">Ranking: #{university.ranking}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">Tuition: ${university.tuitionFee.toLocaleString()}/year</span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Why this matches your profile:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {university.matchReasons.map((reason, idx) => (
                          <li key={idx} className="text-sm text-gray-700">{reason}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-center">
              <Button onClick={() => {
                setCurrentStep(1);
                setResults(null);
                setAssessmentData({
                  academicLevel: "",
                  fieldOfStudy: "",
                  gpa: "",
                  testScores: {},
                  preferredCountries: [],
                  budgetRange: "",
                  lifestyle: "",
                  careerGoals: ""
                });
              }}>
                Start New Assessment
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderProgressIndicator = () => (
    <div className="flex justify-center mb-6">
      <div className="flex items-center space-x-2">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === step 
                ? 'bg-blue-600 text-white' 
                : currentStep > step 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {step}
            </div>
            {step < 3 && (
              <div className={`w-12 h-1 mx-2 ${
                currentStep > step ? 'bg-green-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Study Destination Assessment</h1>
          <p className="text-gray-600">Get personalized university recommendations in just 2 steps</p>
        </div>
        
        {renderProgressIndicator()}
        
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderResults()}
      </div>
    </div>
  );
}