import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Plus, X, Save, AlertCircle, Info, CheckCircle, Calendar, DollarSign, Globe, GraduationCap, FileText, Settings } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Enhanced validation schema following Google Material Design standards
const enhancedScholarshipSchema = z.object({
  // Basic Information (Required)
  scholarshipId: z.string()
    .min(3, "ID must be at least 3 characters")
    .max(50, "ID must not exceed 50 characters")
    .regex(/^[A-Z0-9_-]+$/, "Use only uppercase letters, numbers, underscores, and hyphens"),
  
  scholarshipName: z.string()
    .min(5, "Name must be at least 5 characters")
    .max(100, "Name must not exceed 100 characters")
    .refine(val => val.trim().length > 0, "Name cannot be empty"),
    
  providerName: z.string()
    .min(2, "Provider name must be at least 2 characters")
    .max(100, "Provider name must not exceed 100 characters"),
    
  providerType: z.enum(["government", "private", "institution", "other"], {
    required_error: "Please select a provider type"
  }),
  
  providerCountry: z.string()
    .min(2, "Country must be at least 2 characters")
    .max(50, "Country must not exceed 50 characters"),
    
  description: z.string()
    .min(50, "Description must be at least 50 characters for clarity")
    .max(2000, "Description must not exceed 2000 characters"),
    
  shortDescription: z.string()
    .min(20, "Short description must be at least 20 characters")
    .max(300, "Short description must not exceed 300 characters"),

  // Application Information
  applicationUrl: z.string()
    .url("Please enter a valid URL")
    .startsWith("https://", "URL must use HTTPS for security"),
    
  applicationDeadline: z.string()
    .min(1, "Application deadline is required")
    .refine(val => {
      const date = new Date(val);
      return date > new Date();
    }, "Deadline must be in the future"),

  // Study Information
  studyLevel: z.string()
    .min(2, "Study level is required")
    .max(50, "Study level must not exceed 50 characters"),
    
  fieldCategory: z.string()
    .min(2, "Field category is required")
    .max(100, "Field category must not exceed 100 characters"),
    
  targetCountries: z.array(z.string()).min(1, "At least one target country is required"),
  
  // Funding Information
  fundingType: z.enum(["full", "partial", "tuition-only", "living-allowance", "other"], {
    required_error: "Please select a funding type"
  }),
  
  fundingAmount: z.number()
    .min(100, "Funding amount must be at least $100")
    .max(1000000, "Funding amount cannot exceed $1,000,000"),
    
  fundingCurrency: z.string()
    .length(3, "Currency code must be exactly 3 characters")
    .regex(/^[A-Z]{3}$/, "Use standard 3-letter currency code (e.g., USD, EUR)"),

  // Requirements and Eligibility
  eligibilityRequirements: z.array(z.string()).min(1, "At least one eligibility requirement is required"),
  languageRequirements: z.array(z.string()).optional(),
  
  // Additional Information
  difficultyLevel: z.enum(["beginner", "intermediate", "advanced", "expert"], {
    required_error: "Please select a difficulty level"
  }),
  
  dataSource: z.string().min(2, "Data source is required"),
  verified: z.boolean().default(false),
  status: z.enum(["active", "inactive", "pending"]).default("active")
});

type EnhancedScholarshipFormData = z.infer<typeof enhancedScholarshipSchema>;

interface EnhancedScholarshipFormProps {
  initialData?: Partial<EnhancedScholarshipFormData>;
  onSubmit: (data: EnhancedScholarshipFormData) => void;
  isLoading: boolean;
  mode: "create" | "edit";
}

export default function EnhancedScholarshipForm({ 
  initialData, 
  onSubmit, 
  isLoading, 
  mode 
}: EnhancedScholarshipFormProps) {
  const [currentTab, setCurrentTab] = useState("basic");
  const [targetCountries, setTargetCountries] = useState<string[]>(initialData?.targetCountries || []);
  const [eligibilityRequirements, setEligibilityRequirements] = useState<string[]>(initialData?.eligibilityRequirements || []);
  const [languageRequirements, setLanguageRequirements] = useState<string[]>(initialData?.languageRequirements || []);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const form = useForm<EnhancedScholarshipFormData>({
    resolver: zodResolver(enhancedScholarshipSchema),
    defaultValues: {
      scholarshipId: "",
      scholarshipName: "",
      providerName: "",
      providerType: "government",
      providerCountry: "",
      description: "",
      shortDescription: "",
      applicationUrl: "",
      applicationDeadline: "",
      studyLevel: "",
      fieldCategory: "",
      targetCountries: [],
      fundingType: "full",
      fundingAmount: 0,
      fundingCurrency: "USD",
      eligibilityRequirements: [],
      languageRequirements: [],
      difficultyLevel: "intermediate",
      dataSource: "official",
      verified: false,
      status: "active",
      ...initialData
    }
  });

  const watchedFields = form.watch();
  const formProgress = calculateFormProgress(watchedFields);

  // Array field management
  const addArrayItem = (field: 'targetCountries' | 'eligibilityRequirements' | 'languageRequirements', value: string) => {
    if (!value.trim()) return;
    
    const currentItems = field === 'targetCountries' ? targetCountries : 
                        field === 'eligibilityRequirements' ? eligibilityRequirements : languageRequirements;
    
    if (currentItems.includes(value.trim())) return;
    
    const updatedItems = [...currentItems, value.trim()];
    
    if (field === 'targetCountries') setTargetCountries(updatedItems);
    else if (field === 'eligibilityRequirements') setEligibilityRequirements(updatedItems);
    else setLanguageRequirements(updatedItems);
    
    form.setValue(field, updatedItems);
  };

  const removeArrayItem = (field: 'targetCountries' | 'eligibilityRequirements' | 'languageRequirements', index: number) => {
    const currentItems = field === 'targetCountries' ? targetCountries : 
                        field === 'eligibilityRequirements' ? eligibilityRequirements : languageRequirements;
    
    const updatedItems = currentItems.filter((_, i) => i !== index);
    
    if (field === 'targetCountries') setTargetCountries(updatedItems);
    else if (field === 'eligibilityRequirements') setEligibilityRequirements(updatedItems);
    else setLanguageRequirements(updatedItems);
    
    form.setValue(field, updatedItems);
  };

  const handleFormSubmit = (data: EnhancedScholarshipFormData) => {
    // Final validation before submission
    const errors: string[] = [];
    
    if (targetCountries.length === 0) errors.push("At least one target country is required");
    if (eligibilityRequirements.length === 0) errors.push("At least one eligibility requirement is required");
    if (data.fundingAmount <= 0) errors.push("Funding amount must be greater than 0");
    if (new Date(data.applicationDeadline) <= new Date()) errors.push("Application deadline must be in the future");
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setValidationErrors([]);
    onSubmit({
      ...data,
      targetCountries,
      eligibilityRequirements,
      languageRequirements
    });
  };

  function calculateFormProgress(data: Partial<EnhancedScholarshipFormData>): number {
    const requiredFields = [
      'scholarshipId', 'scholarshipName', 'providerName', 'providerType', 'providerCountry',
      'description', 'shortDescription', 'applicationUrl', 'applicationDeadline', 'studyLevel',
      'fieldCategory', 'fundingType', 'fundingAmount', 'fundingCurrency', 'difficultyLevel', 'dataSource'
    ];
    
    const completedFields = requiredFields.filter(field => {
      const value = data[field as keyof EnhancedScholarshipFormData];
      return value !== undefined && value !== null && value !== "" && value !== 0;
    }).length;
    
    // Add array fields to progress calculation
    const arrayProgress = (targetCountries.length > 0 ? 1 : 0) + (eligibilityRequirements.length > 0 ? 1 : 0);
    
    return Math.round(((completedFields + arrayProgress) / (requiredFields.length + 2)) * 100);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Form Progress Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {mode === "create" ? "Create New Scholarship" : "Edit Scholarship"}
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">Progress:</div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${formProgress}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{formProgress}%</span>
              </div>
            </div>
          </div>
          {formProgress < 80 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Complete all required fields to enable scholarship submission. Missing fields will be highlighted.
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
      </Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <div className="font-medium">Please fix the following errors:</div>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Form Tabs */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Basic
              </TabsTrigger>
              <TabsTrigger value="application" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Application
              </TabsTrigger>
              <TabsTrigger value="study" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Study
              </TabsTrigger>
              <TabsTrigger value="funding" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Funding
              </TabsTrigger>
              <TabsTrigger value="requirements" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Requirements
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Provide essential scholarship details and identification information.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="scholarshipId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Scholarship ID *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="e.g. AUS_AWARDS_2025"
                              className="font-mono"
                            />
                          </FormControl>
                          <FormDescription>
                            Unique identifier using uppercase letters, numbers, and underscores
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="providerType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Provider Type *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select provider type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="government">Government</SelectItem>
                              <SelectItem value="private">Private Organization</SelectItem>
                              <SelectItem value="institution">Educational Institution</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="scholarshipName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scholarship Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. Australia Awards Scholarship Program" />
                        </FormControl>
                        <FormDescription>
                          Full official name of the scholarship program
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="providerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Provider Name *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g. Australian Government" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="providerCountry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Provider Country *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g. Australia" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            rows={4} 
                            placeholder="Provide a comprehensive description of the scholarship program, its objectives, and key benefits..."
                            className="resize-none"
                          />
                        </FormControl>
                        <FormDescription>
                          Detailed description (50-2000 characters) - Current: {field.value?.length || 0}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shortDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            rows={2} 
                            placeholder="Brief summary for listing displays..."
                            className="resize-none"
                          />
                        </FormControl>
                        <FormDescription>
                          Brief summary (20-300 characters) - Current: {field.value?.length || 0}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Application Information Tab */}
            <TabsContent value="application" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Application Information</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Application process details and important deadlines.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="applicationUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Application URL *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="https://example.com/apply"
                            type="url"
                          />
                        </FormControl>
                        <FormDescription>
                          Official application website (must use HTTPS)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="applicationDeadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Application Deadline *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="date"
                              min={new Date().toISOString().split('T')[0]}
                            />
                          </FormControl>
                          <FormDescription>
                            Final date for application submission
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="difficultyLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Application Difficulty *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select difficulty level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner - Simple requirements</SelectItem>
                              <SelectItem value="intermediate">Intermediate - Moderate requirements</SelectItem>
                              <SelectItem value="advanced">Advanced - Complex requirements</SelectItem>
                              <SelectItem value="expert">Expert - Highly competitive</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Study Information Tab */}
            <TabsContent value="study" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Study Information</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Academic levels, fields of study, and target countries.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="studyLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Study Level *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g. Masters, PhD, Undergraduate" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fieldCategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Field Category *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g. Engineering, Medicine, Business" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Target Countries *</Label>
                    <ArrayFieldManager
                      items={targetCountries}
                      onAdd={(value) => addArrayItem('targetCountries', value)}
                      onRemove={(index) => removeArrayItem('targetCountries', index)}
                      placeholder="e.g. Australia, United States, Canada"
                      label="Add Country"
                    />
                    {targetCountries.length === 0 && (
                      <p className="text-sm text-red-600">At least one target country is required</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Funding Information Tab */}
            <TabsContent value="funding" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Funding Information</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Financial support details and funding structure.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fundingType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Funding Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select funding type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="full">Full Funding - Covers all expenses</SelectItem>
                            <SelectItem value="partial">Partial Funding - Covers some expenses</SelectItem>
                            <SelectItem value="tuition-only">Tuition Only - Covers tuition fees</SelectItem>
                            <SelectItem value="living-allowance">Living Allowance - Covers living costs</SelectItem>
                            <SelectItem value="other">Other - Specify in description</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="fundingAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Funding Amount *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number"
                              min="100"
                              max="1000000"
                              step="100"
                              placeholder="0"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Total funding amount (minimum $100)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fundingCurrency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="USD"
                              maxLength={3}
                              className="uppercase"
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            />
                          </FormControl>
                          <FormDescription>
                            3-letter currency code (e.g. USD, EUR, GBP)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {watchedFields.fundingAmount && watchedFields.fundingCurrency && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Total funding: {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: watchedFields.fundingCurrency || 'USD'
                        }).format(watchedFields.fundingAmount)}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Requirements Tab */}
            <TabsContent value="requirements" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Requirements & Eligibility</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Eligibility criteria and language requirements.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Eligibility Requirements *</Label>
                    <ArrayFieldManager
                      items={eligibilityRequirements}
                      onAdd={(value) => addArrayItem('eligibilityRequirements', value)}
                      onRemove={(index) => removeArrayItem('eligibilityRequirements', index)}
                      placeholder="e.g. Bachelor's degree with 3.0 GPA minimum"
                      label="Add Requirement"
                    />
                    {eligibilityRequirements.length === 0 && (
                      <p className="text-sm text-red-600">At least one eligibility requirement is required</p>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label>Language Requirements (Optional)</Label>
                    <ArrayFieldManager
                      items={languageRequirements}
                      onAdd={(value) => addArrayItem('languageRequirements', value)}
                      onRemove={(index) => removeArrayItem('languageRequirements', index)}
                      placeholder="e.g. IELTS 6.5 overall, TOEFL 90+"
                      label="Add Language Requirement"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Settings & Metadata</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Administrative settings and data source information.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="dataSource"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Source *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g. official, verified, university website" />
                          </FormControl>
                          <FormDescription>
                            Source of this scholarship information
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Active - Available for applications</SelectItem>
                              <SelectItem value="inactive">Inactive - Not currently available</SelectItem>
                              <SelectItem value="pending">Pending - Under review</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="verified"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Verified Scholarship</FormLabel>
                          <FormDescription>
                            Mark this scholarship as officially verified and accurate
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground">
                    Form completion: {formProgress}%
                  </div>
                  {formProgress >= 80 && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Ready to submit
                    </Badge>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => window.history.back()}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading || formProgress < 80}
                    className="min-w-32"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? "Saving..." : mode === "create" ? "Create Scholarship" : "Update Scholarship"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}

// Array Field Manager Component
interface ArrayFieldManagerProps {
  items: string[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
  label: string;
}

function ArrayFieldManager({ items, onAdd, onRemove, placeholder, label }: ArrayFieldManagerProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={!inputValue.trim()}
        >
          <Plus className="w-4 h-4 mr-1" />
          {label}
        </Button>
      </div>
      
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1 pr-1">
              <span className="text-sm">{item}</span>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-sm p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}