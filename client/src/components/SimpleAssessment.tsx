import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Brain, MapPin, BookOpen, DollarSign } from "lucide-react";

interface AssessmentData {
  academicLevel: string;
  fieldOfStudy: string;
  gpa: string;
  preferredCountries: string[];
  budgetRange: string;
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
    preferredCountries: [],
    budgetRange: "",
    careerGoals: ""
  });
  const [results, setResults] = useState<RecommendationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateData = (field: keyof AssessmentData, value: any) => {
    setAssessmentData(prev => ({ ...prev, [field]: value }));
  };

  const handleCountryChange = (country: string) => {
    const countries = assessmentData.preferredCountries;
    if (countries.includes(country)) {
      updateData('preferredCountries', countries.filter(c => c !== country));
    } else {
      updateData('preferredCountries', [...countries, country]);
    }
  };

  const submitAssessment = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/assessment/generate-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentData),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Assessment failed');
      }

      const result = await response.json();
      setResults(result);
      setCurrentStep(3);
      
      toast({
        title: "Assessment Complete",
        description: "Your personalized recommendations are ready!"
      });
    } catch (error) {
      toast({
        title: "Assessment Error",
        description: "Please try again or contact support",
        variant: "destructive"
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
          <Label htmlFor="budgetRange">Budget Range (USD per year)</Label>
          <Select value={assessmentData.budgetRange} onValueChange={(value) => updateData('budgetRange', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your budget" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="under_20k">Under $20,000</SelectItem>
              <SelectItem value="20k_40k">$20,000 - $40,000</SelectItem>
              <SelectItem value="40k_60k">$40,000 - $60,000</SelectItem>
              <SelectItem value="above_60k">Above $60,000</SelectItem>
            </SelectContent>
          </Select>
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
        {results ? (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Summary</h3>
              <p className="text-sm text-gray-700">{results.summary}</p>
            </div>

            <div className="grid gap-4">
              {results.universities.map((uni, index) => (
                <Card key={index} className="border">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{uni.name}</h4>
                        <p className="text-sm text-gray-600">{uni.city}, {uni.country}</p>
                      </div>
                      <div className="text-right">
                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                          {uni.matchScore}% Match
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Ranking: #{uni.ranking}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm">${uni.tuitionFee.toLocaleString()}/year</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Why it's a good match:</p>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {uni.matchReasons.map((reason, i) => (
                          <li key={i}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button onClick={() => window.location.reload()} className="w-full">
              Take New Assessment
            </Button>
          </div>
        ) : (
          <p>No results available</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI University Assessment
          </h1>
          <p className="text-gray-600">
            Get personalized university recommendations based on your profile
          </p>
        </div>

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderResults()}
      </div>
    </div>
  );
}