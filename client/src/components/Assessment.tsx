import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { assessmentFormSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, Globe, DollarSign, User, FileText, ArrowRight, ArrowLeft } from "lucide-react";
import { z } from "zod";

type AssessmentFormData = z.infer<typeof assessmentFormSchema>;

const countries = [
  "United States", "Canada", "United Kingdom", "Australia", 
  "Germany", "France", "Netherlands", "Sweden", "Norway", "Switzerland"
];

interface AssessmentProps {
  onSubmit: (data: AssessmentFormData) => void;
  isLoading?: boolean;
}

export default function Assessment({ onSubmit, isLoading = false }: AssessmentProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  const form = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentFormSchema),
    defaultValues: {
      academicLevel: "",
      fieldOfStudy: "",
      gpa: "",
      testScores: {},
      preferredCountries: [],
      budgetRange: "",
      lifestyle: "",
      specialRequirements: "",
    },
  });

  const handleNext = async () => {
    let fieldsToValidate: (keyof AssessmentFormData)[] = [];
    
    switch (step) {
      case 1:
        fieldsToValidate = ["academicLevel", "fieldOfStudy", "gpa"];
        break;
      case 2:
        // Test scores are optional, no validation needed
        break;
      case 3:
        fieldsToValidate = ["preferredCountries"];
        break;
      case 4:
        fieldsToValidate = ["budgetRange", "lifestyle"];
        break;
      case 5:
        // Special requirements are optional
        break;
    }

    if (fieldsToValidate.length > 0) {
      const isValid = await form.trigger(fieldsToValidate);
      if (!isValid) return;
    }

    if (step < totalSteps) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (data: AssessmentFormData) => {
    onSubmit(data);
  };

  const progress = (step / totalSteps) * 100;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <GraduationCap className="h-6 w-6" />
            Study Abroad Assessment
          </CardTitle>
          <CardDescription>
            Get personalized university recommendations based on your academic profile and preferences
          </CardDescription>
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-500">Step {step} of {totalSteps}</span>
            <span className="text-sm font-medium">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="w-full mt-2" />
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    <h2 className="text-xl font-semibold">Academic Background</h2>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="academicLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Academic Level</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your academic level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="high-school">High School</SelectItem>
                            <SelectItem value="undergraduate">Undergraduate</SelectItem>
                            <SelectItem value="graduate">Graduate</SelectItem>
                            <SelectItem value="postgraduate">Postgraduate</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fieldOfStudy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Field of Study</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Computer Science, Business, Engineering" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gpa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GPA / Academic Performance</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 3.8, 85%, First Class" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h2 className="text-xl font-semibold">Test Scores (Optional)</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="testScores.sat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SAT Score</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="1400" 
                              onChange={(e) => {
                                const value = e.target.value ? parseInt(e.target.value) : undefined;
                                const currentScores = form.getValues("testScores") || {};
                                form.setValue("testScores", { ...currentScores, sat: value });
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="testScores.ielts"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IELTS Score</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.1"
                              placeholder="7.5" 
                              onChange={(e) => {
                                const value = e.target.value ? parseFloat(e.target.value) : undefined;
                                const currentScores = form.getValues("testScores") || {};
                                form.setValue("testScores", { ...currentScores, ielts: value });
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="testScores.toefl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>TOEFL Score</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="100" 
                              onChange={(e) => {
                                const value = e.target.value ? parseInt(e.target.value) : undefined;
                                const currentScores = form.getValues("testScores") || {};
                                form.setValue("testScores", { ...currentScores, toefl: value });
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="testScores.gre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GRE Score</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="320" 
                              onChange={(e) => {
                                const value = e.target.value ? parseInt(e.target.value) : undefined;
                                const currentScores = form.getValues("testScores") || {};
                                form.setValue("testScores", { ...currentScores, gre: value });
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <h2 className="text-xl font-semibold">Preferred Countries</h2>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="preferredCountries"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select countries you're interested in studying</FormLabel>
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          {countries.map((country) => (
                            <div key={country} className="flex items-center space-x-2">
                              <Checkbox
                                id={country}
                                checked={field.value?.includes(country)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([...current, country]);
                                  } else {
                                    field.onChange(current.filter((c) => c !== country));
                                  }
                                }}
                              />
                              <label htmlFor={country} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {country}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <h2 className="text-xl font-semibold">Budget & Lifestyle</h2>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="budgetRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Annual Budget Range (USD)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your budget range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="under-20k">Under $20,000</SelectItem>
                            <SelectItem value="20k-40k">$20,000 - $40,000</SelectItem>
                            <SelectItem value="40k-60k">$40,000 - $60,000</SelectItem>
                            <SelectItem value="60k-80k">$60,000 - $80,000</SelectItem>
                            <SelectItem value="over-80k">Over $80,000</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lifestyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Lifestyle</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select lifestyle preference" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="urban">Urban - City life with amenities</SelectItem>
                            <SelectItem value="suburban">Suburban - Quiet towns and communities</SelectItem>
                            <SelectItem value="rural">Rural - Countryside and natural settings</SelectItem>
                            <SelectItem value="mixed">Mixed - No strong preference</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-5 w-5 text-blue-600" />
                    <h2 className="text-xl font-semibold">Special Requirements</h2>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="specialRequirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Any special requirements or preferences? (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="e.g., Need scholarship opportunities, specific climate preferences, research opportunities, internship programs, specific university rankings..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 6 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h2 className="text-xl font-semibold">Review & Submit</h2>
                  </div>
                  
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-3">Assessment Summary</h3>
                    <div className="space-y-2 text-sm text-blue-800">
                      <p><span className="font-medium">Academic Level:</span> {form.getValues("academicLevel")}</p>
                      <p><span className="font-medium">Field of Study:</span> {form.getValues("fieldOfStudy")}</p>
                      <p><span className="font-medium">GPA:</span> {form.getValues("gpa")}</p>
                      <p><span className="font-medium">Preferred Countries:</span> {form.getValues("preferredCountries")?.join(", ")}</p>
                      <p><span className="font-medium">Budget Range:</span> {form.getValues("budgetRange")}</p>
                      <p><span className="font-medium">Lifestyle:</span> {form.getValues("lifestyle")}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Our AI will analyze your profile and generate personalized university recommendations 
                      based on your academic background, preferences, and goals. This process typically takes 30-60 seconds.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handlePrevious}
                  disabled={step === 1}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                {step < totalSteps ? (
                  <Button 
                    type="button" 
                    onClick={handleNext}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    {isLoading ? "Generating Recommendations..." : "Get My Recommendations"}
                    <GraduationCap className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}