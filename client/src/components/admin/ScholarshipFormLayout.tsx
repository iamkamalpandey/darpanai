import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  X, 
  Loader2, 
  FileText, 
  Users, 
  DollarSign, 
  Settings, 
  BookOpen, 
  GraduationCap,
  Calendar as CalendarIcon,
  Check,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AdminLayout } from "@/components/AdminLayout";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Comprehensive validation schema with all 57+ database fields
const scholarshipSchema = z.object({
  // Basic Information
  scholarshipId: z.string().min(3, "Scholarship ID must be at least 3 characters").max(50),
  name: z.string().min(5, "Name must be at least 5 characters").max(200),
  shortName: z.string().optional(),
  
  // Provider Details
  providerName: z.string().min(3, "Provider name required").max(100),
  providerType: z.enum(["government", "private", "institution", "other"]),
  providerCountry: z.string().min(2, "Provider country required"),
  providerWebsite: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  
  // Target Information
  hostCountries: z.array(z.string()).optional(),
  eligibleCountries: z.array(z.string()).optional(),
  studyLevels: z.array(z.string()).optional(),
  fieldCategories: z.array(z.string()).optional(),
  specificFields: z.array(z.string()).optional(),
  
  // Funding Details
  fundingType: z.string().min(1, "Funding type required"),
  fundingCurrency: z.string().length(3, "Currency must be 3 characters").default("USD"),
  tuitionCoveragePercentage: z.number().min(0).max(100).optional(),
  livingAllowanceAmount: z.number().min(0).optional(),
  livingAllowanceFrequency: z.string().optional(),
  totalValueMin: z.number().min(0).optional(),
  totalValueMax: z.number().min(0).optional(),
  
  // Timeline
  applicationOpenDate: z.string().optional(),
  applicationDeadline: z.string().optional(),
  notificationDate: z.string().optional(),
  programStartDate: z.string().optional(),
  durationValue: z.number().min(1).optional(),
  durationUnit: z.string().optional(),
  
  // Academic Requirements
  minGpa: z.number().min(0).max(4).optional(),
  gpaScale: z.number().min(1).max(10).optional(),
  degreeRequired: z.array(z.string()).optional(),
  minAge: z.number().min(16).max(100).optional(),
  maxAge: z.number().min(16).max(100).optional(),
  genderRequirement: z.string().default("any"),
  minWorkExperience: z.number().min(0).optional(),
  leadershipRequired: z.boolean().default(false),
  languageRequirements: z.array(z.string()).optional(),
  
  // Application Process
  applicationUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  applicationFeeAmount: z.number().min(0).default(0),
  applicationFeeCurrency: z.string().length(3).default("USD"),
  feeWaiverAvailable: z.boolean().default(false),
  documentsRequired: z.array(z.string()).optional(),
  interviewRequired: z.boolean().default(false),
  essayRequired: z.boolean().default(false),
  
  // Renewal & Restrictions
  renewable: z.boolean().default(false),
  maxRenewalDuration: z.string().optional(),
  renewalCriteria: z.array(z.string()).optional(),
  workRestrictions: z.string().optional(),
  travelRestrictions: z.string().optional(),
  otherScholarshipsAllowed: z.string().optional(),
  
  // Additional Benefits
  mentorshipAvailable: z.boolean().default(false),
  networkingOpportunities: z.boolean().default(false),
  internshipOpportunities: z.boolean().default(false),
  researchOpportunities: z.boolean().default(false),
  
  // Metadata
  description: z.string().min(50, "Description must be at least 50 characters").max(2000),
  tags: z.array(z.string()).optional(),
  difficultyLevel: z.string().optional(),
  totalApplicantsPerYear: z.number().min(1).optional(),
  acceptanceRate: z.number().min(0).max(100).optional(),
  status: z.enum(["active", "inactive", "pending", "draft"]).default("active"),
  dataSource: z.string().default("official"),
  verified: z.boolean().default(true),
});

type ScholarshipFormData = z.infer<typeof scholarshipSchema>;

interface ScholarshipFormLayoutProps {
  mode: 'create' | 'edit' | 'view';
  scholarshipId?: string;
  initialData?: Partial<ScholarshipFormData>;
  onSuccess?: () => void;
}

const formSections = [
  {
    id: "basic",
    title: "Basic Information",
    icon: FileText,
    description: "Essential scholarship details and identification",
    fields: ["scholarshipId", "name", "shortName", "description"]
  },
  {
    id: "provider",
    title: "Provider Details", 
    icon: Users,
    description: "Scholarship provider information and contact details",
    fields: ["providerName", "providerType", "providerCountry", "providerWebsite"]
  },
  {
    id: "target",
    title: "Target Information",
    icon: Settings,
    description: "Host countries, eligible nationalities, and study fields",
    fields: ["hostCountries", "eligibleCountries", "studyLevels", "fieldCategories", "specificFields"]
  },
  {
    id: "funding",
    title: "Funding & Financial Details",
    icon: DollarSign,
    description: "Complete funding structure and financial coverage",
    fields: ["fundingType", "fundingCurrency", "tuitionCoveragePercentage", "livingAllowanceAmount", "livingAllowanceFrequency", "totalValueMin", "totalValueMax"]
  },
  {
    id: "timeline",
    title: "Timeline & Deadlines",
    icon: CalendarIcon,
    description: "Important dates and program duration",
    fields: ["applicationOpenDate", "applicationDeadline", "notificationDate", "programStartDate", "durationValue", "durationUnit"]
  },
  {
    id: "academic",
    title: "Academic Requirements",
    icon: GraduationCap,
    description: "Educational prerequisites and academic standards",
    fields: ["minGpa", "gpaScale", "degreeRequired", "minAge", "maxAge", "genderRequirement", "minWorkExperience", "leadershipRequired", "languageRequirements"]
  },
  {
    id: "application",
    title: "Application Process",
    icon: FileText,
    description: "Application procedures, fees, and required documents",
    fields: ["applicationUrl", "applicationFeeAmount", "applicationFeeCurrency", "feeWaiverAvailable", "documentsRequired", "interviewRequired", "essayRequired"]
  },
  {
    id: "renewal",
    title: "Renewal & Restrictions",
    icon: Settings,
    description: "Renewal policies and scholarship restrictions",
    fields: ["renewable", "maxRenewalDuration", "renewalCriteria", "workRestrictions", "travelRestrictions", "otherScholarshipsAllowed"]
  },
  {
    id: "benefits",
    title: "Additional Benefits",
    icon: Users,
    description: "Extra opportunities and support services",
    fields: ["mentorshipAvailable", "networkingOpportunities", "internshipOpportunities", "researchOpportunities"]
  },
  {
    id: "metadata",
    title: "Statistics & Metadata",
    icon: FileText,
    description: "Administrative data and scholarship statistics",
    fields: ["tags", "difficultyLevel", "totalApplicantsPerYear", "acceptanceRate", "status", "dataSource", "verified"]
  }
];

export function ScholarshipFormLayout({ 
  mode, 
  scholarshipId, 
  initialData = {}, 
  onSuccess 
}: ScholarshipFormLayoutProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentSection, setCurrentSection] = useState(0);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [arrayFields, setArrayFields] = useState<{[key: string]: string[]}>({
    targetCountries: [],
    eligibilityRequirements: [],
    languageRequirements: []
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Fetch existing scholarship data for edit mode
  const { data: scholarshipData, isLoading } = useQuery({
    queryKey: ['admin-scholarship', scholarshipId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/scholarships/${scholarshipId}`);
      if (!response.ok) throw new Error('Failed to fetch scholarship');
      return response.json();
    },
    enabled: mode === 'edit' && !!scholarshipId
  });

  const existingData = mode === 'edit' ? scholarshipData?.data : null;

  // Initialize form with comprehensive default values
  const form = useForm<ScholarshipFormData>({
    resolver: zodResolver(scholarshipSchema),
    defaultValues: {
      scholarshipId: "",
      name: "",
      shortName: "",
      providerName: "",
      providerType: "government",
      providerCountry: "",
      providerWebsite: "",
      description: "",
      applicationUrl: "",
      fundingType: "full",
      fundingCurrency: "USD",
      difficultyLevel: "intermediate",
      dataSource: "official",
      verified: true,
      status: "active",
    },
  });

  // Update form when scholarship data is loaded (for edit mode)
  useEffect(() => {
    if (existingData && mode === 'edit') {
      // Reset form with existing scholarship data
      form.reset({
        scholarshipId: existingData.scholarshipId || "",
        scholarshipName: existingData.name || "",
        providerName: existingData.providerName || "",
        providerType: existingData.providerType || "government",
        providerCountry: existingData.providerCountry || "",
        description: existingData.description || "",
        shortDescription: existingData.shortDescription || "",
        applicationUrl: existingData.applicationUrl || "",
        applicationDeadline: existingData.applicationDeadline || "",
        studyLevel: existingData.studyLevel || "",
        fieldCategory: existingData.fieldCategory || "",
        targetCountries: existingData.targetCountries || [],
        fundingType: existingData.fundingType || "full",
        fundingAmount: existingData.fundingAmount || 0,
        fundingCurrency: existingData.fundingCurrency || "USD",
        eligibilityRequirements: existingData.eligibilityRequirements || [],
        languageRequirements: existingData.languageRequirements || [],
        difficultyLevel: existingData.difficultyLevel || "intermediate",
        dataSource: existingData.dataSource || "",
        verified: existingData.verified || false,
        status: existingData.status || "pending",
      });

      // Update array fields state
      setArrayFields({
        targetCountries: existingData.targetCountries || [],
        eligibilityRequirements: existingData.eligibilityRequirements || [],
        languageRequirements: existingData.languageRequirements || []
      });
    } else if (initialData && mode === 'create') {
      // Handle initial data for create mode
      form.reset(initialData);
      setArrayFields({
        targetCountries: initialData.targetCountries || [],
        eligibilityRequirements: initialData.eligibilityRequirements || [],
        languageRequirements: initialData.languageRequirements || []
      });
    }
  }, [existingData, initialData, mode, form]);

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: async (data: ScholarshipFormData) => {
      const finalData = { ...data, ...arrayFields };
      
      if (mode === 'create') {
        return apiRequest("POST", "/api/admin/scholarships", finalData);
      } else {
        return apiRequest("PUT", `/api/admin/scholarships/${scholarshipId}`, finalData);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: mode === 'create' ? "Scholarship created successfully" : "Scholarship updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/scholarships"] });
      if (scholarshipId) {
        queryClient.invalidateQueries({ queryKey: [`/api/admin/scholarships/${scholarshipId}`] });
      }
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${mode} scholarship`,
        variant: "destructive",
      });
    },
  });

  // Progress calculation
  const progress = Math.round(((completedSections.length + (currentSection > 0 ? 1 : 0)) / formSections.length) * 100);

  // Section validation and navigation
  const validateCurrentSection = async () => {
    const currentSectionConfig = formSections[currentSection];
    const fieldsToValidate = currentSectionConfig.fields;
    
    const isValid = await form.trigger(fieldsToValidate as any);
    
    if (isValid) {
      if (!completedSections.includes(currentSection)) {
        setCompletedSections([...completedSections, currentSection]);
      }
      setFormErrors({});
      return true;
    } else {
      const errors = form.formState.errors;
      const sectionErrors: {[key: string]: string} = {};
      
      fieldsToValidate.forEach(field => {
        if (errors[field as keyof ScholarshipFormData]) {
          sectionErrors[field] = errors[field as keyof ScholarshipFormData]?.message || 'Invalid field';
        }
      });
      
      setFormErrors(sectionErrors);
      return false;
    }
  };

  const handleNext = async () => {
    const isValid = await validateCurrentSection();
    if (isValid && currentSection < formSections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSubmit = async (data: ScholarshipFormData) => {
    const isValid = await validateCurrentSection();
    if (isValid) {
      mutation.mutate(data);
    }
  };

  // Array field management
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

  // Render section content
  const renderSectionContent = () => {
    const section = formSections[currentSection];
    
    switch (section.id) {
      case "basic":
        return <BasicInformationSection form={form} mode={mode} errors={formErrors} />;
      case "application":
        return <ApplicationSection form={form} mode={mode} errors={formErrors} />;
      case "study":
        return <StudyInformationSection 
          form={form} 
          mode={mode} 
          errors={formErrors}
          arrayFields={arrayFields}
          onArrayAdd={handleArrayAdd}
          onArrayRemove={handleArrayRemove}
        />;
      case "funding":
        return <FundingInformationSection form={form} mode={mode} errors={formErrors} />;
      case "requirements":
        return <RequirementsSection 
          form={form} 
          mode={mode} 
          errors={formErrors}
          arrayFields={arrayFields}
          onArrayAdd={handleArrayAdd}
          onArrayRemove={handleArrayRemove}
        />;
      case "settings":
        return <SettingsSection form={form} mode={mode} errors={formErrors} />;
      default:
        return null;
    }
  };

  const getPageTitle = () => {
    switch (mode) {
      case 'create': return 'Create New Scholarship';
      case 'edit': return 'Edit Scholarship';
      case 'view': return 'Scholarship Details';
      default: return 'Scholarship Management';
    }
  };

  const getPageDescription = () => {
    switch (mode) {
      case 'create': return 'Add a new scholarship to the database with comprehensive validation and Google Material Design standards';
      case 'edit': return 'Update scholarship information with real-time validation and immediate data persistence';
      case 'view': return 'View comprehensive scholarship details with option to edit individual sections';
      default: return 'Manage scholarship information';
    }
  };

  // Show loading state for edit mode
  if (mode === 'edit' && isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading scholarship data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar Navigation */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLocation('/admin/scholarships')} 
              className="mb-4 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Scholarships
            </Button>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{getPageTitle()}</h2>
            <p className="text-sm text-gray-600 mb-4">{getPageDescription()}</p>
          </div>

          {/* Progress Indicator */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Form Progress</span>
              <span className="text-sm text-blue-600 font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 mb-2" />
            <p className="text-xs text-gray-500">
              {mode === 'view' ? 'All sections completed' : 'Complete all required fields to submit'}
            </p>
          </div>

          {/* Section Navigation */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Form Sections</h3>
              <div className="space-y-2">
                {formSections.map((section, index) => {
                  const IconComponent = section.icon;
                  const isCompleted = completedSections.includes(index);
                  const isCurrent = currentSection === index;
                  const hasErrors = section.fields.some(field => formErrors[field]);
                  
                  return (
                    <div
                      key={section.id}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all duration-200",
                        isCurrent 
                          ? "bg-blue-50 border-2 border-blue-200 shadow-sm" 
                          : isCompleted 
                            ? "bg-green-50 border border-green-200 hover:bg-green-100" 
                            : hasErrors
                              ? "bg-red-50 border border-red-200 hover:bg-red-100"
                              : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                      )}
                      onClick={() => mode !== 'view' ? setCurrentSection(index) : undefined}
                    >
                      <div className={cn(
                        "p-2 rounded-lg flex-shrink-0",
                        isCurrent 
                          ? "bg-blue-100" 
                          : isCompleted 
                            ? "bg-green-100" 
                            : hasErrors
                              ? "bg-red-100"
                              : "bg-gray-100"
                      )}>
                        <IconComponent className={cn(
                          "w-4 h-4",
                          isCurrent 
                            ? "text-blue-600" 
                            : isCompleted 
                              ? "text-green-600" 
                              : hasErrors
                                ? "text-red-600"
                                : "text-gray-500"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={cn(
                          "font-medium text-sm truncate",
                          isCurrent 
                            ? "text-blue-900" 
                            : isCompleted 
                              ? "text-green-900" 
                              : hasErrors
                                ? "text-red-900"
                                : "text-gray-700"
                        )}>
                          {section.title}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{section.fields.length} fields</div>
                      </div>
                      <div className="flex-shrink-0">
                        {isCompleted && (
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        {hasErrors && !isCompleted && (
                          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 space-y-1">
              <div>Mode: {mode.charAt(0).toUpperCase() + mode.slice(1)}</div>
              <div>Progress: {progress}% complete</div>
              {Object.keys(formErrors).length > 0 && (
                <div className="text-red-600">
                  {Object.keys(formErrors).length} validation error(s)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Section Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <Badge variant="outline" className="px-3 py-1">
                  Section {currentSection + 1} of {formSections.length}
                </Badge>
                <Badge variant="outline" className="px-3 py-1 capitalize">
                  {mode} Mode
                </Badge>
              </div>
              
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {(() => {
                      const IconComponent = formSections[currentSection].icon;
                      return <IconComponent className="w-5 h-5" />;
                    })()}
                    {formSections[currentSection].title}
                  </CardTitle>
                  <CardDescription>
                    {formSections[currentSection].description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Form Content */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                {renderSectionContent()}

                {/* Navigation Controls */}
                {mode !== 'view' && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevious}
                          disabled={currentSection === 0}
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Previous
                        </Button>

                        <div className="flex gap-3">
                          <Button 
                            type="button"
                            variant="outline" 
                            onClick={() => setLocation('/admin/scholarships')}
                          >
                            Cancel
                          </Button>
                          
                          {currentSection === formSections.length - 1 ? (
                            <Button 
                              type="submit"
                              disabled={mutation.isPending}
                              className="min-w-[140px]"
                            >
                              {mutation.isPending ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                                </>
                              ) : (
                                <>
                                  <Save className="w-4 h-4 mr-2" />
                                  {mode === 'create' ? 'Create Scholarship' : 'Update Scholarship'}
                                </>
                              )}
                            </Button>
                          ) : (
                            <Button 
                              type="button"
                              onClick={handleNext}
                              className="min-w-[100px]"
                            >
                              Next
                              <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </form>
            </Form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// Section Components with comprehensive validation

function BasicInformationSection({ form, mode, errors }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>
          Essential scholarship details and identification information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="scholarshipId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-red-600 flex items-center gap-1">
                  Scholarship ID *
                  <span className="text-xs text-gray-500">(Unique identifier)</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="e.g. AUS_AWARDS_2025" 
                    disabled={mode === 'view'}
                    className={cn(
                      errors.scholarshipId && "border-red-300 focus:border-red-500"
                    )}
                  />
                </FormControl>
                <div className="text-xs text-gray-500">
                  3-50 characters. Use uppercase letters, numbers, underscores, and hyphens only.
                </div>
                {errors.scholarshipId && (
                  <div className="text-sm text-red-600">{errors.scholarshipId}</div>
                )}
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
                {mode === 'view' ? (
                  <div className="p-3 bg-gray-50 rounded-md capitalize">
                    {field.value}
                  </div>
                ) : (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className={cn(
                        errors.providerType && "border-red-300 focus:border-red-500"
                      )}>
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
                )}
                {errors.providerType && (
                  <div className="text-sm text-red-600">{errors.providerType}</div>
                )}
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
                <Input 
                  {...field} 
                  placeholder="e.g. Australia Awards Scholarship Program" 
                  disabled={mode === 'view'}
                  className={cn(
                    errors.scholarshipName && "border-red-300 focus:border-red-500"
                  )}
                />
              </FormControl>
              <div className="text-xs text-gray-500">
                5-200 characters. Full official name of the scholarship program.
              </div>
              {errors.scholarshipName && (
                <div className="text-sm text-red-600">{errors.scholarshipName}</div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="providerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-red-600">Provider Name *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="e.g. Australian Government" 
                    disabled={mode === 'view'}
                    className={cn(
                      errors.providerName && "border-red-300 focus:border-red-500"
                    )}
                  />
                </FormControl>
                <div className="text-xs text-gray-500">
                  3-100 characters. Official name of the organization providing the scholarship.
                </div>
                {errors.providerName && (
                  <div className="text-sm text-red-600">{errors.providerName}</div>
                )}
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
                  <Input 
                    {...field} 
                    placeholder="e.g. Australia" 
                    disabled={mode === 'view'}
                    className={cn(
                      errors.providerCountry && "border-red-300 focus:border-red-500"
                    )}
                  />
                </FormControl>
                <div className="text-xs text-gray-500">
                  2-50 characters. Country where the scholarship provider is based.
                </div>
                {errors.providerCountry && (
                  <div className="text-sm text-red-600">{errors.providerCountry}</div>
                )}
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
              <FormLabel className="text-red-600">Detailed Description *</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  rows={6} 
                  placeholder="Provide a comprehensive description of the scholarship program, its objectives, key benefits, target audience, and selection criteria..."
                  className={cn(
                    "resize-none",
                    errors.description && "border-red-300 focus:border-red-500"
                  )}
                  disabled={mode === 'view'}
                />
              </FormControl>
              <div className="text-xs text-gray-500 flex justify-between">
                <span>50-2000 characters. Comprehensive program description.</span>
                <span>{field.value?.length || 0}/2000</span>
              </div>
              {errors.description && (
                <div className="text-sm text-red-600">{errors.description}</div>
              )}
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
                  rows={3} 
                  placeholder="Brief summary for listing displays and quick reference..."
                  className={cn(
                    "resize-none",
                    errors.shortDescription && "border-red-300 focus:border-red-500"
                  )}
                  disabled={mode === 'view'}
                />
              </FormControl>
              <div className="text-xs text-gray-500 flex justify-between">
                <span>20-300 characters. Brief summary for listings.</span>
                <span>{field.value?.length || 0}/300</span>
              </div>
              {errors.shortDescription && (
                <div className="text-sm text-red-600">{errors.shortDescription}</div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

function ApplicationSection({ form, mode, errors }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Details</CardTitle>
        <CardDescription>
          Application process and deadline information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="applicationUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-red-600">Application URL *</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="https://example.com/apply" 
                  type="url"
                  disabled={mode === 'view'}
                  className={cn(
                    errors.applicationUrl && "border-red-300 focus:border-red-500"
                  )}
                />
              </FormControl>
              <div className="text-xs text-gray-500">
                Valid URL (max 500 characters). Direct link to the application form or process.
              </div>
              {errors.applicationUrl && (
                <div className="text-sm text-red-600">{errors.applicationUrl}</div>
              )}
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
                  disabled={mode === 'view'}
                  className={cn(
                    errors.applicationDeadline && "border-red-300 focus:border-red-500"
                  )}
                />
              </FormControl>
              <div className="text-xs text-gray-500">
                Final date for application submission. Must be a future date.
              </div>
              {errors.applicationDeadline && (
                <div className="text-sm text-red-600">{errors.applicationDeadline}</div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

function StudyInformationSection({ form, mode, errors, arrayFields, onArrayAdd, onArrayRemove }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Study Information</CardTitle>
        <CardDescription>
          Academic levels, fields, and target countries
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="studyLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-red-600">Study Level *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="e.g. Masters, PhD, Undergraduate" 
                    disabled={mode === 'view'}
                    className={cn(
                      errors.studyLevel && "border-red-300 focus:border-red-500"
                    )}
                  />
                </FormControl>
                <div className="text-xs text-gray-500">
                  2-100 characters. Academic level(s) supported by this scholarship.
                </div>
                {errors.studyLevel && (
                  <div className="text-sm text-red-600">{errors.studyLevel}</div>
                )}
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
                  <Input 
                    {...field} 
                    placeholder="e.g. Engineering, Medicine, Arts" 
                    disabled={mode === 'view'}
                    className={cn(
                      errors.fieldCategory && "border-red-300 focus:border-red-500"
                    )}
                  />
                </FormControl>
                <div className="text-xs text-gray-500">
                  2-100 characters. Academic field(s) or subject area(s).
                </div>
                {errors.fieldCategory && (
                  <div className="text-sm text-red-600">{errors.fieldCategory}</div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <ArrayFieldEditor
          label="Target Countries"
          items={arrayFields.targetCountries}
          onAdd={(value) => onArrayAdd('targetCountries', value)}
          onRemove={(index) => onArrayRemove('targetCountries', index)}
          placeholder="e.g. Australia, United States, Canada"
          required
          disabled={mode === 'view'}
          maxItems={20}
          error={errors.targetCountries}
          description="Countries where scholarship recipients can study (1-20 countries)"
        />
      </CardContent>
    </Card>
  );
}

function FundingInformationSection({ form, mode, errors }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Funding Information</CardTitle>
        <CardDescription>
          Financial details and funding structure
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="fundingType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-red-600">Funding Type *</FormLabel>
              {mode === 'view' ? (
                <div className="p-3 bg-gray-50 rounded-md capitalize">
                  {field.value?.replace('-', ' ')}
                </div>
              ) : (
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className={cn(
                      errors.fundingType && "border-red-300 focus:border-red-500"
                    )}>
                      <SelectValue placeholder="Select funding type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="full">Full Funding (Tuition + Living)</SelectItem>
                    <SelectItem value="partial">Partial Funding</SelectItem>
                    <SelectItem value="tuition-only">Tuition Only</SelectItem>
                    <SelectItem value="living-allowance">Living Allowance Only</SelectItem>
                    <SelectItem value="other">Other Type</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {errors.fundingType && (
                <div className="text-sm text-red-600">{errors.fundingType}</div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
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
                    max="1000000"
                    placeholder="50000"
                    disabled={mode === 'view'}
                    className={cn(
                      errors.fundingAmount && "border-red-300 focus:border-red-500"
                    )}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <div className="text-xs text-gray-500">
                  1-1,000,000. Total or maximum funding amount.
                </div>
                {errors.fundingAmount && (
                  <div className="text-sm text-red-600">{errors.fundingAmount}</div>
                )}
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
                    disabled={mode === 'view'}
                    className={cn(
                      "uppercase",
                      errors.fundingCurrency && "border-red-300 focus:border-red-500"
                    )}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  />
                </FormControl>
                <div className="text-xs text-gray-500">
                  3 characters. ISO currency code (e.g., USD, EUR, GBP).
                </div>
                {errors.fundingCurrency && (
                  <div className="text-sm text-red-600">{errors.fundingCurrency}</div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function RequirementsSection({ form, mode, errors, arrayFields, onArrayAdd, onArrayRemove }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Requirements & Eligibility</CardTitle>
        <CardDescription>
          Eligibility criteria and language requirements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ArrayFieldEditor
          label="Eligibility Requirements"
          items={arrayFields.eligibilityRequirements}
          onAdd={(value) => onArrayAdd('eligibilityRequirements', value)}
          onRemove={(index) => onArrayRemove('eligibilityRequirements', index)}
          placeholder="e.g. Bachelor's degree with 3.0 GPA"
          required
          disabled={mode === 'view'}
          maxItems={50}
          error={errors.eligibilityRequirements}
          description="Academic and other eligibility criteria (1-50 requirements)"
        />

        <ArrayFieldEditor
          label="Language Requirements (Optional)"
          items={arrayFields.languageRequirements}
          onAdd={(value) => onArrayAdd('languageRequirements', value)}
          onRemove={(index) => onArrayRemove('languageRequirements', index)}
          placeholder="e.g. IELTS 6.5 overall, TOEFL 90+"
          disabled={mode === 'view'}
          maxItems={20}
          error={errors.languageRequirements}
          description="Language proficiency requirements (0-20 requirements)"
        />

        <FormField
          control={form.control}
          name="difficultyLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-red-600">Difficulty Level *</FormLabel>
              {mode === 'view' ? (
                <div className="p-3 bg-gray-50 rounded-md capitalize">
                  {field.value}
                </div>
              ) : (
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className={cn(
                      errors.difficultyLevel && "border-red-300 focus:border-red-500"
                    )}>
                      <SelectValue placeholder="Select difficulty level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (Basic requirements)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (Moderate requirements)</SelectItem>
                    <SelectItem value="advanced">Advanced (Stringent requirements)</SelectItem>
                    <SelectItem value="expert">Expert (Exceptional requirements)</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <div className="text-xs text-gray-500">
                Application difficulty based on requirements and competition level.
              </div>
              {errors.difficultyLevel && (
                <div className="text-sm text-red-600">{errors.difficultyLevel}</div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

function SettingsSection({ form, mode, errors }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings & Metadata</CardTitle>
        <CardDescription>
          Administrative settings and verification status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="dataSource"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-red-600">Data Source *</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="e.g. Official website, Government portal" 
                  disabled={mode === 'view'}
                  className={cn(
                    errors.dataSource && "border-red-300 focus:border-red-500"
                  )}
                />
              </FormControl>
              <div className="text-xs text-gray-500">
                2-200 characters. Source of scholarship information for verification.
              </div>
              {errors.dataSource && (
                <div className="text-sm text-red-600">{errors.dataSource}</div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="verified"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Verified Status</FormLabel>
                <div className="text-sm text-gray-500">
                  Mark this scholarship as verified and accurate
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={mode === 'view'}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-red-600">Publication Status *</FormLabel>
              {mode === 'view' ? (
                <div className="p-3 bg-gray-50 rounded-md capitalize">
                  {field.value}
                </div>
              ) : (
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className={cn(
                      errors.status && "border-red-300 focus:border-red-500"
                    )}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active (Publicly visible)</SelectItem>
                    <SelectItem value="inactive">Inactive (Hidden from public)</SelectItem>
                    <SelectItem value="pending">Pending (Under review)</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <div className="text-xs text-gray-500">
                Publication status determines visibility to users.
              </div>
              {errors.status && (
                <div className="text-sm text-red-600">{errors.status}</div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
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
  disabled?: boolean;
  maxItems?: number;
  error?: string;
  description?: string;
}

function ArrayFieldEditor({ 
  label, 
  items, 
  onAdd, 
  onRemove, 
  placeholder, 
  required = false, 
  disabled = false,
  maxItems = 50,
  error,
  description 
}: ArrayFieldEditorProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (inputValue.trim() && items.length < maxItems) {
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
    <div className="space-y-4">
      <div className={cn(
        "text-sm font-medium",
        required ? 'text-red-600' : 'text-gray-700'
      )}>
        {label} {required && '*'}
      </div>
      
      {description && (
        <div className="text-xs text-gray-500">{description}</div>
      )}
      
      {!disabled && (
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className={cn(
              "flex-1",
              error && "border-red-300 focus:border-red-500"
            )}
            disabled={items.length >= maxItems}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAdd}
            disabled={!inputValue.trim() || items.length >= maxItems}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      )}
      
      {required && items.length === 0 && (
        <div className="text-sm text-red-600">At least one item is required</div>
      )}
      
      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}
      
      {items.length >= maxItems && (
        <div className="text-sm text-amber-600">
          Maximum {maxItems} items reached
        </div>
      )}
      
      {items.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-gray-500">
            {items.length} item{items.length !== 1 ? 's' : ''} {maxItems && `(max ${maxItems})`}
          </div>
          <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1 pr-1">
                <span className="text-sm break-all">{item}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-sm p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}