import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle, User, Mail, Lock, UserPlus } from "lucide-react";
import { loginUserSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { z } from "zod";

// Step 1: Basic Account Setup
const basicAccountSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be less than 20 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  userType: z.enum(["student", "agent", "other"], { required_error: "Please select user type" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Step 2: Additional Information (conditional based on user type)
const studentAdditionalInfoSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  city: z.string().min(2, "City must be at least 2 characters"),
  country: z.string().min(1, "Please select your country"),
  studyDestination: z.string().min(1, "Please select your study destination"),
  studyLevel: z.string().min(1, "Please select your study level"),
  startDate: z.string().min(1, "Please select your preferred start date"),
  counsellingMode: z.string().min(1, "Please select your counselling preference"),
  fundingSource: z.string().min(1, "Please select your funding source"),
  agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms and conditions"),
  allowContact: z.boolean().optional(),
  receiveUpdates: z.boolean().optional(),
});

const agentAdditionalInfoSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  city: z.string().min(2, "City must be at least 2 characters"),
  country: z.string().min(1, "Please select your country"),
  businessName: z.string().min(2, "Business name is required"),
  businessAddress: z.string().min(5, "Business address is required"),
  businessLicense: z.string().optional(),
  yearsOfExperience: z.string().min(1, "Please specify years of experience"),
  specialization: z.string().min(1, "Please select your specialization"),
  agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms and conditions"),
  allowContact: z.boolean().optional(),
  receiveUpdates: z.boolean().optional(),
});

const otherAdditionalInfoSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  city: z.string().min(2, "City must be at least 2 characters"),
  country: z.string().min(1, "Please select your country"),
  visaCategory: z.string().min(1, "Please specify your visa category"),
  purposeOfTravel: z.string().min(1, "Please specify purpose of travel"),
  agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms and conditions"),
  allowContact: z.boolean().optional(),
  receiveUpdates: z.boolean().optional(),
});

const additionalInfoSchema = studentAdditionalInfoSchema;

// Complete form schema - manually combine all fields
const completeFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be less than 20 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  userType: z.enum(["student", "agent", "other"], { required_error: "Please select user type" }),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  city: z.string().min(2, "City must be at least 2 characters"),
  country: z.string().min(1, "Please select your country"),
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

type BasicAccountData = z.infer<typeof basicAccountSchema>;
type AdditionalInfoData = z.infer<typeof additionalInfoSchema>;
type CompleteFormData = z.infer<typeof completeFormSchema>;
type LoginFormData = z.infer<typeof loginUserSchema>;

const studyDestinations = [
  "Other",
  "United States", 
  "United Kingdom", 
  "Canada", 
  "Australia", 
  "China",
  "Germany", 
  "France", 
  "Netherlands", 
  "Sweden", 
  "New Zealand", 
  "Ireland",
  "Japan",
  "South Korea",
  "Singapore",
  "Switzerland",
  "Norway",
  "Denmark",
  "Italy",
  "Spain"
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

// Origin countries (popular study abroad sources)
const originCountries = [
  "Nepal", 
  "India", 
  "Sri Lanka",
  "Vietnam",
  "China",
  "Bangladesh",
  "Pakistan",
  "Philippines",
  "Thailand", 
  "Indonesia",
  "Malaysia",
  "South Korea",
  "Japan",
  "Myanmar",
  "Afghanistan",
  "Iran",
  "Turkey",
  "Nigeria",
  "Kenya",
  "Ghana",
  "Ethiopia",
  "Egypt",
  "Morocco",
  "Brazil",
  "Colombia",
  "Mexico",
  "Peru",
  "Ecuador",
  "Chile",
  "Other"
];

// Destination countries (popular study destinations)
const destinationCountries = [
  "Australia",
  "United States",
  "United Kingdom", 
  "Canada",
  "Germany",
  "New Zealand", 
  "France",
  "Netherlands",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Switzerland",
  "Austria",
  "Ireland",
  "Belgium",
  "Italy",
  "Spain",
  "Portugal",
  "Poland",
  "Czech Republic",
  "Hungary",
  "Singapore",
  "South Korea",
  "Japan",
  "Hong Kong",
  "Other"
];

export default function UserFriendlyAuth() {
  const [showLogin, setShowLogin] = useState(true);
  const [registrationStep, setRegistrationStep] = useState(1); // 1: Basic Account, 2: Additional Info
  const [basicAccountData, setBasicAccountData] = useState<BasicAccountData | null>(null);
  const [, setLocation] = useLocation();
  const { loginMutation, registerMutation } = useAuth();

  // Basic Account Form
  const basicForm = useForm<BasicAccountData>({
    resolver: zodResolver(basicAccountSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      userType: undefined,
    },
  });

  // Additional Info Form - conditional schema based on user type
  const getAdditionalSchema = (userType: string) => {
    switch (userType) {
      case 'agent':
        return agentAdditionalInfoSchema;
      case 'other':
        return otherAdditionalInfoSchema;
      default:
        return studentAdditionalInfoSchema;
    }
  };

  const additionalForm = useForm<any>({
    resolver: zodResolver(basicAccountData ? getAdditionalSchema(basicAccountData.userType) : studentAdditionalInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      city: "",
      country: "",
      ...(basicAccountData?.userType === 'student' && {
        studyDestination: "",
        studyLevel: "",
        startDate: "",
        counsellingMode: "",
        fundingSource: "",
      }),
      ...(basicAccountData?.userType === 'agent' && {
        businessName: "",
        businessAddress: "",
        businessLicense: "",
        yearsOfExperience: "",
        specialization: "",
      }),
      ...(basicAccountData?.userType === 'other' && {
        visaCategory: "",
        purposeOfTravel: "",
      }),
      agreeToTerms: false,
      allowContact: true,
      receiveUpdates: true,
    },
  });

  // Login Form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onBasicAccountSubmit = (data: BasicAccountData) => {
    setBasicAccountData(data);
    setRegistrationStep(2);
  };

  const onAdditionalInfoSubmit = (data: AdditionalInfoData) => {
    if (basicAccountData) {
      const completeData: CompleteFormData = {
        ...basicAccountData,
        ...data,
      };
      
      const { confirmPassword, ...registerData } = completeData;
      registerMutation.mutate({ ...registerData, confirmPassword }, {
        onSuccess: () => {
          setLocation("/");
        },
      });
    }
  };

  const onLoginSubmit = (values: LoginFormData) => {
    loginMutation.mutate(values, {
      onSuccess: () => {
        setLocation("/");
      },
    });
  };

  const goBackToBasicAccount = () => {
    setRegistrationStep(1);
  };

  // Login View
  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <User className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your educational consultation account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowLogin(false)}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Don't have an account? Sign up
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Basic Account Registration Step
  if (registrationStep === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          {/* Login Option */}
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => setShowLogin(true)}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Already have an account? Sign in
            </Button>
          </div>

          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <UserPlus className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Create Your Account</CardTitle>
              <CardDescription>
                Start your educational journey with us
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...basicForm}>
                <form onSubmit={basicForm.handleSubmit(onBasicAccountSubmit)} className="space-y-4">
                  <FormField
                    control={basicForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Username
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Choose a unique username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={basicForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your.email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={basicForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Password
                        </FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Create a strong password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={basicForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Confirm Password
                        </FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Re-enter your password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={basicForm.control}
                    name="userType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>I am a</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your user type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="student">Student (Study Abroad)</SelectItem>
                            <SelectItem value="agent">Education Agent/Consultant</SelectItem>
                            <SelectItem value="other">Other Visa Category</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    Continue <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Next: We'll collect some basic information to personalize your experience
                  </p>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Additional Information Step
  if (registrationStep === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Almost There!</CardTitle>
            <CardDescription>
              Tell us about yourself to complete your profile
            </CardDescription>
            
            <div className="mt-4">
              <Progress value={50} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">Step 2 of 2</p>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...additionalForm}>
              <form onSubmit={additionalForm.handleSubmit(onAdditionalInfoSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={additionalForm.control}
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
                      control={additionalForm.control}
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

                    <FormField
                      control={additionalForm.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={additionalForm.control}
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
                  </div>

                  <FormField
                    control={additionalForm.control}
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
                            {originCountries.map((country) => (
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

                {/* Student Study Preferences */}
                {basicAccountData?.userType === 'student' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Study Preferences</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={additionalForm.control}
                        name="studyDestination"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Study Destination</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose destination" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {destinationCountries.map((destination) => (
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
                        control={additionalForm.control}
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

                      <FormField
                        control={additionalForm.control}
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

                      <FormField
                        control={additionalForm.control}
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
                    </div>

                    <FormField
                      control={additionalForm.control}
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
                )}

                {/* Agent Business Information */}
                {basicAccountData?.userType === 'agent' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Business Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={additionalForm.control}
                        name="businessName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your business name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={additionalForm.control}
                        name="yearsOfExperience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Years of Experience</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select experience" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="0-1">0-1 years</SelectItem>
                                <SelectItem value="2-5">2-5 years</SelectItem>
                                <SelectItem value="6-10">6-10 years</SelectItem>
                                <SelectItem value="10+">10+ years</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={additionalForm.control}
                      name="businessAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Complete business address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={additionalForm.control}
                        name="businessLicense"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business License (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="License number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={additionalForm.control}
                        name="specialization"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Specialization</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select specialization" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="student-visa">Student Visa</SelectItem>
                                <SelectItem value="work-visa">Work Visa</SelectItem>
                                <SelectItem value="immigration">Immigration</SelectItem>
                                <SelectItem value="business-visa">Business Visa</SelectItem>
                                <SelectItem value="family-visa">Family Visa</SelectItem>
                                <SelectItem value="general">General Consultation</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Other Visa Category Information */}
                {basicAccountData?.userType === 'other' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Visa Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={additionalForm.control}
                        name="visaCategory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Visa Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select visa category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="tourist">Tourist/Visitor Visa</SelectItem>
                                <SelectItem value="business">Business Visa</SelectItem>
                                <SelectItem value="work">Work Visa</SelectItem>
                                <SelectItem value="family">Family Visa</SelectItem>
                                <SelectItem value="transit">Transit Visa</SelectItem>
                                <SelectItem value="medical">Medical Visa</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={additionalForm.control}
                        name="purposeOfTravel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Purpose of Travel</FormLabel>
                            <FormControl>
                              <Input placeholder="Brief description of travel purpose" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Terms and Preferences */}
                <div className="space-y-4 pt-4 border-t">
                  <FormField
                    control={additionalForm.control}
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
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={additionalForm.control}
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
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={additionalForm.control}
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
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goBackToBasicAccount}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>

                  <Button
                    type="submit"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Creating Account..." : "Complete Registration"}
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}