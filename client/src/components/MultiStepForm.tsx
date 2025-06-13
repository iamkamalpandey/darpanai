import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ArrowLeft, ArrowRight, User, MapPin, GraduationCap } from "lucide-react";
import { insertUserSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

// Step-specific schemas for validation
const accountInfoSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be less than 20 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const personalInfoSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  city: z.string().min(2, "City must be at least 2 characters"),
  country: z.string().min(2, "Please select your country"),
});

const studyPreferencesSchema = z.object({
  studyDestination: z.string().min(1, "Please select your study destination"),
  studyLevel: z.string().min(1, "Please select your study level"),
  startDate: z.string().min(1, "Please select your preferred start date"),
  counsellingMode: z.string().min(1, "Please select your counselling preference"),
  fundingSource: z.string().min(1, "Please select your funding source"),
  agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms and conditions"),
  allowContact: z.boolean().optional(),
  receiveUpdates: z.boolean().optional(),
});

// Complete form schema - manually combine all fields
const completeFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be less than 20 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  city: z.string().min(2, "City must be at least 2 characters"),
  country: z.string().min(2, "Please select your country"),
  studyDestination: z.string().min(1, "Please select your study destination"),
  studyLevel: z.string().min(1, "Please select your study level"),
  startDate: z.string().min(1, "Please select your preferred start date"),
  counsellingMode: z.string().min(1, "Please select your counselling preference"),
  fundingSource: z.string().min(1, "Please select your funding source"),
  agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms and conditions"),
  allowContact: z.boolean().optional(),
  receiveUpdates: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type CompleteFormData = z.infer<typeof completeFormSchema>;

const steps = [
  {
    id: 1,
    title: "Account Information",
    description: "Create your secure account",
    icon: User,
    fields: ["username", "email", "password", "confirmPassword"],
  },
  {
    id: 2,
    title: "Personal Details",
    description: "Tell us about yourself",
    icon: MapPin,
    fields: ["firstName", "lastName", "phoneNumber", "city", "country"],
  },
  {
    id: 3,
    title: "Study Preferences",
    description: "Your educational goals",
    icon: GraduationCap,
    fields: ["studyDestination", "studyLevel", "startDate", "counsellingMode", "fundingSource", "agreeToTerms", "allowContact", "receiveUpdates"],
  },
];

const encouragingMessages = [
  "Great start! Let's get your account set up securely.",
  "You're doing amazing! Just a few personal details needed.",
  "Almost there! Tell us about your study goals to complete your journey.",
];

const studyDestinations = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", 
  "France", "Netherlands", "Sweden", "New Zealand", "Ireland", "Other"
];

const studyLevels = [
  "Bachelor's Degree", "Master's Degree", "PhD", "Diploma/Certificate", 
  "Language Course", "Foundation Course", "Other"
];

const counsellingModes = [
  "Online Consultation", "In-Person Meeting", "Phone Call", "Email Support", "Hybrid (Online + In-Person)"
];

const fundingSources = [
  "Self-Funded", "Family Support", "Scholarship", "Student Loan", 
  "Employer Sponsorship", "Government Grant", "Other"
];

const countries = [
  "India", "United States", "United Kingdom", "Canada", "Australia", 
  "Germany", "France", "Netherlands", "Sweden", "New Zealand", "Other"
];

export default function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  const { registerMutation } = useAuth();

  const form = useForm<CompleteFormData>({
    resolver: zodResolver(completeFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      city: "",
      country: "",
      studyDestination: "",
      studyLevel: "",
      startDate: "",
      counsellingMode: "",
      fundingSource: "",
      agreeToTerms: false,
      allowContact: true,
      receiveUpdates: true,
    },
    mode: "onChange",
  });

  const validateCurrentStep = async () => {
    const currentStepFields = steps[currentStep - 1].fields;
    const isValid = await form.trigger(currentStepFields as any);
    return isValid;
  };

  const nextStep = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: CompleteFormData) => {
    if (currentStep === steps.length) {
      const { confirmPassword, ...registerData } = data;
      registerMutation.mutate({ ...registerData, confirmPassword }, {
        onSuccess: () => {
          setLocation("/");
        },
      });
    }
  };

  const progress = (currentStep / steps.length) * 100;
  const currentStepData = steps[currentStep - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center mb-4">
            <currentStepData.icon className="h-8 w-8 text-primary mr-2" />
            <CardTitle className="text-2xl">Join Our Educational Journey</CardTitle>
          </div>
          <CardDescription className="text-lg">
            {encouragingMessages[currentStep - 1]}
          </CardDescription>
          
          {/* Progress Bar */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep} of {steps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center mt-4 space-x-4">
            {steps.map((step) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center space-y-1 ${
                    step.id < currentStep
                      ? "text-green-600"
                      : step.id === currentStep
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      step.id < currentStep
                        ? "bg-green-100 border-green-600"
                        : step.id === currentStep
                        ? "bg-primary/10 border-primary"
                        : "bg-gray-100 border-gray-300"
                    }`}
                  >
                    {step.id < currentStep ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-xs font-medium hidden sm:block">{step.title}</span>
                </div>
              );
            })}
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 1: Account Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-primary">Create Your Account</h3>
                    <p className="text-sm text-muted-foreground">Choose a secure username and password</p>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Choose a unique username" {...field} />
                        </FormControl>
                        <FormDescription>This will be your unique identifier</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your.email@example.com" {...field} />
                        </FormControl>
                        <FormDescription>We'll use this to send you important updates</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Create a strong password" {...field} />
                        </FormControl>
                        <FormDescription>Minimum 6 characters for security</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Re-enter your password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 2: Personal Information */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-primary">Personal Information</h3>
                    <p className="text-sm text-muted-foreground">Help us get to know you better</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your first name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormDescription>Include country code for international numbers</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Your current city" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {countries.map((country) => (
                                <SelectItem key={country} value={country}>
                                  {country}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Study Preferences */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-primary">Study Preferences</h3>
                    <p className="text-sm text-muted-foreground">Tell us about your educational goals</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="studyDestination"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Study Destination</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose destination" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {studyDestinations.map((destination) => (
                                <SelectItem key={destination} value={destination}>
                                  {destination}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="studyLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Study Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select study level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {studyLevels.map((level) => (
                                <SelectItem key={level} value={level}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Start Date</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="When would you like to start?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Fall 2025">Fall 2025</SelectItem>
                            <SelectItem value="Spring 2026">Spring 2026</SelectItem>
                            <SelectItem value="Summer 2026">Summer 2026</SelectItem>
                            <SelectItem value="Fall 2026">Fall 2026</SelectItem>
                            <SelectItem value="Flexible">Flexible</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="counsellingMode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Counselling Preference</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="How would you like to be counselled?" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {counsellingModes.map((mode) => (
                                <SelectItem key={mode} value={mode}>
                                  {mode}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fundingSource"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Funding Source</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="How will you fund your studies?" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {fundingSources.map((source) => (
                                <SelectItem key={source} value={source}>
                                  {source}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <FormField
                      control={form.control}
                      name="agreeToTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I agree to the Terms of Service and Privacy Policy
                            </FormLabel>
                            <FormDescription>
                              Required to create your account and access our services
                            </FormDescription>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="allowContact"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Allow counselors to contact me
                            </FormLabel>
                            <FormDescription>
                              Receive personalized guidance from our education experts
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="receiveUpdates"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Receive updates about opportunities
                            </FormLabel>
                            <FormDescription>
                              Stay informed about scholarships, programs, and deadlines
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>

                {currentStep < steps.length ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center space-x-2"
                  >
                    <span>Continue</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="flex items-center space-x-2"
                  >
                    {registerMutation.isPending ? (
                      <span>Creating Account...</span>
                    ) : (
                      <>
                        <span>Complete Registration</span>
                        <CheckCircle className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Encouraging Message */}
              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                  {currentStep === 1 && "🚀 Your educational journey starts here!"}
                  {currentStep === 2 && "✨ You're making great progress!"}
                  {currentStep === 3 && "🎓 Almost ready to begin your success story!"}
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}