import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Save, FileText, Users, DollarSign, Settings, BookOpen, GraduationCap, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AdminLayout } from "@/components/AdminLayout";

// Step-specific schemas
const basicInfoSchema = z.object({
  scholarshipId: z.string().min(3, "Scholarship ID must be at least 3 characters"),
  scholarshipName: z.string().min(5, "Scholarship name must be at least 5 characters"),
  providerName: z.string().min(3, "Provider name must be at least 3 characters"),
  providerType: z.enum(["government", "private", "institution", "other"]),
  providerCountry: z.string().min(2, "Provider country is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  shortDescription: z.string().min(10, "Short description must be at least 10 characters"),
});

const applicationSchema = z.object({
  applicationUrl: z.string().url("Must be a valid URL"),
  applicationDeadline: z.string().min(1, "Application deadline is required"),
});

const studySchema = z.object({
  studyLevel: z.string().min(2, "Study level is required"),
  fieldCategory: z.string().min(2, "Field category is required"),
  targetCountries: z.array(z.string()).min(1, "At least one target country is required"),
});

const fundingSchema = z.object({
  fundingType: z.enum(["full", "partial", "tuition-only", "living-allowance", "other"]),
  fundingAmount: z.number().min(1, "Funding amount must be greater than 0"),
  fundingCurrency: z.string().length(3, "Currency must be 3 characters"),
});

const requirementsSchema = z.object({
  eligibilityRequirements: z.array(z.string()).min(1, "At least one eligibility requirement is required"),
  languageRequirements: z.array(z.string()).optional(),
  difficultyLevel: z.enum(["beginner", "intermediate", "advanced", "expert"]),
});

const settingsSchema = z.object({
  dataSource: z.string().min(2, "Data source is required"),
  verified: z.boolean(),
  status: z.enum(["active", "inactive", "pending"]),
});

const steps = [
  {
    id: "basic",
    title: "Basic",
    icon: FileText,
    description: "Basic Information",
    schema: basicInfoSchema,
    fields: 7
  },
  {
    id: "application",
    title: "Application",
    icon: BookOpen,
    description: "Application Details",
    schema: applicationSchema,
    fields: 2
  },
  {
    id: "study",
    title: "Study",
    icon: GraduationCap,
    description: "Study Information",
    schema: studySchema,
    fields: 3
  },
  {
    id: "funding",
    title: "Funding",
    icon: DollarSign,
    description: "Funding Information",
    schema: fundingSchema,
    fields: 3
  },
  {
    id: "requirements",
    title: "Requirements",
    icon: Users,
    description: "Requirements & Eligibility",
    schema: requirementsSchema,
    fields: 3
  },
  {
    id: "settings",
    title: "Settings",
    icon: Settings,
    description: "Settings & Metadata",
    schema: settingsSchema,
    fields: 3
  }
];

type ScholarshipFormData = {
  scholarshipId: string;
  scholarshipName: string;
  providerName: string;
  providerType: "government" | "private" | "institution" | "other";
  providerCountry: string;
  description: string;
  shortDescription: string;
  applicationUrl: string;
  applicationDeadline: string;
  studyLevel: string;
  fieldCategory: string;
  targetCountries: string[];
  fundingType: "full" | "partial" | "tuition-only" | "living-allowance" | "other";
  fundingAmount: number;
  fundingCurrency: string;
  eligibilityRequirements: string[];
  languageRequirements?: string[];
  difficultyLevel: "beginner" | "intermediate" | "advanced" | "expert";
  dataSource: string;
  verified: boolean;
  status: "active" | "inactive" | "pending";
};

export default function ScholarshipCreate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState<Partial<ScholarshipFormData>>({});
  const [arrayFields, setArrayFields] = useState<{[key: string]: string[]}>({
    targetCountries: [],
    eligibilityRequirements: [],
    languageRequirements: []
  });

  const currentStepConfig = steps[currentStep];
  
  const form = useForm({
    resolver: zodResolver(currentStepConfig.schema),
    defaultValues: formData,
  });

  // Create scholarship mutation
  const createMutation = useMutation({
    mutationFn: async (data: ScholarshipFormData) => {
      return apiRequest("POST", "/api/admin/scholarships", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Scholarship created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/scholarships"] });
      setLocation('/admin/scholarships');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create scholarship",
        variant: "destructive",
      });
    },
  });

  const progress = Math.round(((completedSteps.length + (currentStep > 0 ? 1 : 0)) / steps.length) * 100);

  const handleNext = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      const stepData = form.getValues();
      const updatedFormData = { ...formData, ...stepData, ...arrayFields };
      setFormData(updatedFormData);
      
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
        form.reset(updatedFormData);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const stepData = form.getValues();
      const updatedFormData = { ...formData, ...stepData, ...arrayFields };
      setFormData(updatedFormData);
      setCurrentStep(currentStep - 1);
      form.reset(updatedFormData);
    }
  };

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      const stepData = form.getValues();
      const finalData = { ...formData, ...stepData, ...arrayFields };
      createMutation.mutate(finalData as ScholarshipFormData);
    }
  };

  const handleArrayAdd = (fieldName: string, value: string) => {
    if (!value.trim()) return;
    
    const currentItems = arrayFields[fieldName] || [];
    if (currentItems.includes(value.trim())) return;
    
    const updatedItems = [...currentItems, value.trim()];
    setArrayFields(prev => ({ ...prev, [fieldName]: updatedItems }));
    form.setValue(fieldName as any, updatedItems);
  };

  const handleArrayRemove = (fieldName: string, index: number) => {
    const currentItems = arrayFields[fieldName] || [];
    const updatedItems = currentItems.filter((_, i) => i !== index);
    setArrayFields(prev => ({ ...prev, [fieldName]: updatedItems }));
    form.setValue(fieldName as any, updatedItems);
  };

  const renderBasicStep = () => (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="scholarshipId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-red-600">Scholarship ID *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. AUS_AWARDS_2025" />
              </FormControl>
              <div className="text-xs text-gray-500">Unique identifier using uppercase letters, numbers, and underscores</div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="providerType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-red-600">Provider Type *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Government" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="government">Government</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="institution">Institution</SelectItem>
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
            <FormLabel className="text-red-600">Scholarship Name *</FormLabel>
            <FormControl>
              <Input {...field} placeholder="e.g. Australia Awards Scholarship Program" />
            </FormControl>
            <div className="text-xs text-gray-500">Full official name of the scholarship program</div>
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
              <FormLabel className="text-red-600">Provider Name *</FormLabel>
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
              <FormLabel className="text-red-600">Provider Country *</FormLabel>
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
            <FormLabel className="text-red-600">Description *</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                rows={4} 
                placeholder="Provide a comprehensive description of the scholarship program, its objectives, and key benefits..."
                className="resize-none"
              />
            </FormControl>
            <div className="text-xs text-gray-500">Detailed description (50-2000 characters) - Current: {field.value?.length || 0}</div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="shortDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-red-600">Short Description *</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                rows={2} 
                placeholder="Brief summary for listing displays..."
                className="resize-none"
              />
            </FormControl>
            <div className="text-xs text-gray-500">Brief summary (20-300 characters) - Current: {field.value?.length || 0}</div>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  const renderApplicationStep = () => (
    <>
      <FormField
        control={form.control}
        name="applicationUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-red-600">Application URL *</FormLabel>
            <FormControl>
              <Input {...field} placeholder="https://example.com/apply" type="url" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="applicationDeadline"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-red-600">Application Deadline *</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                type="date"
                min={new Date().toISOString().split('T')[0]}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  const renderStudyStep = () => (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="studyLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-red-600">Study Level *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Masters, PhD" />
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
              <FormLabel className="text-red-600">Field Category *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Engineering, Medicine" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <ArrayFieldEditor
        label="Target Countries"
        items={arrayFields.targetCountries}
        onAdd={(value) => handleArrayAdd('targetCountries', value)}
        onRemove={(index) => handleArrayRemove('targetCountries', index)}
        placeholder="e.g. Australia, United States"
        required
      />
    </>
  );

  const renderFundingStep = () => (
    <>
      <FormField
        control={form.control}
        name="fundingType"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-red-600">Funding Type *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select funding type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="full">Full Funding</SelectItem>
                <SelectItem value="partial">Partial Funding</SelectItem>
                <SelectItem value="tuition-only">Tuition Only</SelectItem>
                <SelectItem value="living-allowance">Living Allowance</SelectItem>
                <SelectItem value="other">Other</SelectItem>
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
              <FormLabel className="text-red-600">Funding Amount *</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number"
                  min="1"
                  placeholder="50000"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fundingCurrency"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-red-600">Currency *</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="USD"
                  maxLength={3}
                  className="uppercase"
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );

  const renderRequirementsStep = () => (
    <>
      <ArrayFieldEditor
        label="Eligibility Requirements"
        items={arrayFields.eligibilityRequirements}
        onAdd={(value) => handleArrayAdd('eligibilityRequirements', value)}
        onRemove={(index) => handleArrayRemove('eligibilityRequirements', index)}
        placeholder="e.g. Bachelor's degree with 3.0 GPA"
        required
      />

      <ArrayFieldEditor
        label="Language Requirements (Optional)"
        items={arrayFields.languageRequirements}
        onAdd={(value) => handleArrayAdd('languageRequirements', value)}
        onRemove={(index) => handleArrayRemove('languageRequirements', index)}
        placeholder="e.g. IELTS 6.5 overall"
      />

      <FormField
        control={form.control}
        name="difficultyLevel"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-red-600">Difficulty Level *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty level" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  const renderSettingsStep = () => (
    <>
      <FormField
        control={form.control}
        name="dataSource"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-red-600">Data Source *</FormLabel>
            <FormControl>
              <Input {...field} placeholder="official website" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-red-600">Status *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || 'active'}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return renderBasicStep();
      case 1: return renderApplicationStep();
      case 2: return renderStudyStep();
      case 3: return renderFundingStep();
      case 4: return renderRequirementsStep();
      case 5: return renderSettingsStep();
      default: return null;
    }
  };

  return (
    <AdminLayout>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <Button variant="ghost" size="sm" onClick={() => setLocation('/admin/scholarships')} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Scholarships
            </Button>
            
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Create New Scholarship</h2>
            <p className="text-sm text-gray-600 mb-4">
              Add a new scholarship to the database with comprehensive validation and Google Material Design standards
            </p>
          </div>

          {/* Progress */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress:</span>
              <span className="text-sm text-blue-600 font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-gray-500 mt-2">
              Complete all required fields to enable scholarship submission. Missing fields will be highlighted.
            </p>
          </div>

          {/* Steps */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="space-y-2">
                {steps.map((step, index) => {
                  const IconComponent = step.icon;
                  const isCompleted = completedSteps.includes(index);
                  const isCurrent = currentStep === index;
                  
                  return (
                    <div
                      key={step.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        isCurrent ? 'bg-blue-50 border border-blue-200' : 
                        isCompleted ? 'bg-green-50 border border-green-200' : 
                        'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        const stepData = form.getValues();
                        const updatedFormData = { ...formData, ...stepData, ...arrayFields };
                        setFormData(updatedFormData);
                        setCurrentStep(index);
                        form.reset(updatedFormData);
                      }}
                    >
                      <div className={`p-2 rounded-lg ${
                        isCurrent ? 'bg-blue-100' : 
                        isCompleted ? 'bg-green-100' : 
                        'bg-gray-100'
                      }`}>
                        <IconComponent className={`w-4 h-4 ${
                          isCurrent ? 'text-blue-600' : 
                          isCompleted ? 'text-green-600' : 
                          'text-gray-500'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium text-sm ${
                          isCurrent ? 'text-blue-900' : 
                          isCompleted ? 'text-green-900' : 
                          'text-gray-700'
                        }`}>
                          {step.title}
                        </div>
                        <div className="text-xs text-gray-500">{step.fields} fields</div>
                      </div>
                      {isCompleted && (
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500">
              Form completion: {progress}%
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Create New Scholarship
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <Badge variant="outline" className="px-3 py-1">
                  Step {currentStep + 1} of {steps.length}
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  {currentStepConfig.description}
                </Badge>
              </div>
            </div>

            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <currentStepConfig.icon className="w-5 h-5" />
                  {currentStepConfig.description}
                </CardTitle>
                <CardDescription>
                  Provide essential scholarship details and identification information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <div className="space-y-6">
                    {renderStepContent()}
                  </div>
                </Form>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setLocation('/admin/scholarships')}>
                  Cancel
                </Button>
                
                {currentStep === steps.length - 1 ? (
                  <Button 
                    onClick={handleSubmit}
                    disabled={createMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {createMutation.isPending ? "Creating..." : "Create Scholarship"}
                  </Button>
                ) : (
                  <Button onClick={handleNext}>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// Array Field Editor Component
interface ArrayFieldEditorProps {
  label: string;
  items: string[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
  required?: boolean;
}

function ArrayFieldEditor({ label, items, onAdd, onRemove, placeholder, required = false }: ArrayFieldEditorProps) {
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
      <div className={`text-sm font-medium ${required ? 'text-red-600' : 'text-gray-700'}`}>
        {label} {required && '*'}
      </div>
      
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
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      
      {required && items.length === 0 && (
        <div className="text-sm text-red-600">Required</div>
      )}
      
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