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
  Check,
  AlertTriangle,
  Globe,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AdminLayout } from "@/components/AdminLayout";

// Predefined options for dropdown fields
const PROVIDER_TYPES = [
  { value: 'government', label: 'Government' },
  { value: 'private', label: 'Private' },
  { value: 'institution', label: 'Institution' },
  { value: 'foundation', label: 'Foundation' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'other', label: 'Other' }
];

const STUDY_LEVELS = [
  { value: 'undergraduate', label: 'Undergraduate' },
  { value: 'masters', label: 'Masters' },
  { value: 'phd', label: 'PhD' },
  { value: 'postdoc', label: 'Postdoc' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'other', label: 'Other' }
];

const FUNDING_TYPES = [
  { value: 'full', label: 'Full Funding' },
  { value: 'partial', label: 'Partial Funding' },
  { value: 'tuition_only', label: 'Tuition Only' },
  { value: 'living_allowance', label: 'Living Allowance Only' },
  { value: 'travel_grant', label: 'Travel Grant' },
  { value: 'research_grant', label: 'Research Grant' },
  { value: 'other', label: 'Other' }
];

const FUNDING_CURRENCIES = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'AUD', label: 'AUD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CAD', label: 'CAD ($)' },
  { value: 'INR', label: 'INR (₹)' },
  { value: 'JPY', label: 'JPY (¥)' },
  { value: 'CNY', label: 'CNY (¥)' },
  { value: 'SGD', label: 'SGD ($)' },
  { value: 'NZD', label: 'NZD ($)' },
  { value: 'other', label: 'Other' }
];

const DURATION_UNITS = [
  { value: 'months', label: 'Months' },
  { value: 'years', label: 'Years' },
  { value: 'semesters', label: 'Semesters' },
  { value: 'quarters', label: 'Quarters' },
  { value: 'other', label: 'Other' }
];

const DEGREE_REQUIREMENTS = [
  { value: 'High School', label: 'High School' },
  { value: 'Bachelor', label: 'Bachelor\'s Degree' },
  { value: 'Masters', label: 'Master\'s Degree' },
  { value: 'PhD', label: 'PhD' },
  { value: 'Associate', label: 'Associate Degree' },
  { value: 'Professional', label: 'Professional Degree' },
  { value: 'other', label: 'Other' }
];

const GENDER_REQUIREMENTS = [
  { value: 'any', label: 'Any Gender' },
  { value: 'male', label: 'Male Only' },
  { value: 'female', label: 'Female Only' },
  { value: 'non_binary', label: 'Non-Binary Inclusive' },
  { value: 'other', label: 'Other' }
];

const FIELD_CATEGORIES = [
  { value: 'STEM', label: 'STEM' },
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Medicine', label: 'Medicine' },
  { value: 'Business', label: 'Business' },
  { value: 'Arts', label: 'Arts & Humanities' },
  { value: 'Social Sciences', label: 'Social Sciences' },
  { value: 'Law', label: 'Law' },
  { value: 'Education', label: 'Education' },
  { value: 'Agriculture', label: 'Agriculture' },
  { value: 'Environmental', label: 'Environmental Studies' },
  { value: 'Psychology', label: 'Psychology' },
  { value: 'Communications', label: 'Communications' },
  { value: 'other', label: 'Other' }
];

const SCHOLARSHIP_STATUS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending Review' },
  { value: 'draft', label: 'Draft' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'archived', label: 'Archived' }
];

const LIVING_ALLOWANCE_FREQUENCY = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'semester', label: 'Per Semester' },
  { value: 'annually', label: 'Annually' },
  { value: 'lump_sum', label: 'Lump Sum' },
  { value: 'other', label: 'Other' }
];

// Streamlined validation schema for efficient creation
const scholarshipSchema = z.object({
  // Essential Information (Step 1)
  scholarshipId: z.string().min(3, "Scholarship ID must be at least 3 characters").max(50),
  name: z.string().min(5, "Name must be at least 5 characters").max(200),
  providerName: z.string().min(3, "Provider name required").max(100),
  providerType: z.string().min(1, "Provider type required"),
  providerCountry: z.string().min(2, "Provider country required"),
  
  // Funding Information (Step 2)
  fundingType: z.string().min(1, "Funding type required"),
  fundingCurrency: z.string().length(3, "Currency must be 3 characters"),
  totalValueMin: z.number().min(0).optional(),
  totalValueMax: z.number().min(0).optional(),
  
  // Eligibility Criteria (Step 3)
  studyLevels: z.array(z.string()).optional(),
  fieldCategories: z.array(z.string()).optional(),
  hostCountries: z.array(z.string()).optional(),
  
  // Application Details (Step 4)
  applicationDeadline: z.string().optional(),
  durationValue: z.number().min(1).optional(),
  durationUnit: z.string().optional(),
  
  // Optional fields
  shortName: z.string().optional(),
  providerWebsite: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  description: z.string().optional(),
  tuitionCoveragePercentage: z.number().min(0).max(100).optional(),
  livingAllowanceAmount: z.number().min(0).optional(),
  livingAllowanceFrequency: z.string().optional(),
  minGpa: z.number().min(0).max(4).optional(),
  gpaScale: z.number().min(1).max(10).optional(),
  minAge: z.number().min(16).max(100).optional(),
  maxAge: z.number().min(16).max(100).optional(),
  genderRequirement: z.string().default("any"),
  minWorkExperience: z.number().min(0).optional(),
  status: z.string().default("draft")
});

type ScholarshipFormData = z.infer<typeof scholarshipSchema>;

interface ScholarshipFormLayoutProps {
  mode: 'create' | 'edit';
  scholarshipId?: string;
  onSuccess?: () => void;
}

// Multi-select component for array fields
interface MultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}

function MultiSelect({ value, onChange, options, placeholder }: MultiSelectProps) {
  const [selectedValue, setSelectedValue] = useState('');

  const addValue = (newValue: string) => {
    if (newValue && !value.includes(newValue)) {
      onChange([...value, newValue]);
      setSelectedValue('');
    }
  };

  const removeValue = (valueToRemove: string) => {
    onChange(value.filter(v => v !== valueToRemove));
  };

  const getOptionLabel = (optionValue: string) => {
    const option = options.find(opt => opt.value === optionValue);
    return option ? option.label : optionValue;
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Select value={selectedValue} onValueChange={addValue}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options
              .filter(option => !value.includes(option.value))
              .map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))
            }
          </SelectContent>
        </Select>
      </div>
      
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((val) => (
            <Badge key={val} variant="secondary" className="flex items-center gap-1">
              {getOptionLabel(val)}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={() => removeValue(val)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export function ScholarshipFormLayout({ mode, scholarshipId, onSuccess }: ScholarshipFormLayoutProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<ScholarshipFormData>>({
    fundingCurrency: 'USD',
    genderRequirement: 'any',
    status: 'draft'
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Fetch countries for dropdown options
  const { data: countries } = useQuery({
    queryKey: ['/api/countries'],
    queryFn: async () => {
      const response = await fetch('/api/countries');
      if (!response.ok) throw new Error('Failed to fetch countries');
      const result = await response.json();
      return result.data || [];
    },
    staleTime: 60000 * 30, // Cache for 30 minutes
  });

  const form = useForm<ScholarshipFormData>({
    resolver: zodResolver(scholarshipSchema),
    defaultValues: formData
  });

  // Create/Update mutation
  const createMutation = useMutation({
    mutationFn: async (data: ScholarshipFormData) => {
      const endpoint = mode === 'create' ? '/api/admin/scholarships' : `/api/admin/scholarships/${scholarshipId}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';
      
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${mode} scholarship`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: mode === 'create' ? 'Scholarship Created' : 'Scholarship Updated',
        description: `Scholarship has been successfully ${mode === 'create' ? 'created' : 'updated'}.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/scholarships'] });
      
      if (onSuccess) {
        onSuccess();
      } else if (mode === 'create') {
        setLocation('/admin/scholarships');
      }
    },
    onError: (error: any) => {
      toast({
        title: `${mode === 'create' ? 'Creation' : 'Update'} Failed`,
        description: error.message || `Failed to ${mode} scholarship. Please try again.`,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ScholarshipFormData) => {
    createMutation.mutate(data);
  };

  const steps = [
    { 
      id: 1, 
      title: "Essential Information", 
      icon: FileText,
      fields: ['scholarshipId', 'name', 'providerName', 'providerType', 'providerCountry']
    },
    { 
      id: 2, 
      title: "Funding Details", 
      icon: DollarSign,
      fields: ['fundingType', 'fundingCurrency', 'totalValueMin', 'totalValueMax']
    },
    { 
      id: 3, 
      title: "Eligibility Criteria", 
      icon: Users,
      fields: ['studyLevels', 'fieldCategories', 'hostCountries']
    },
    { 
      id: 4, 
      title: "Application Details", 
      icon: Calendar,
      fields: ['applicationDeadline', 'durationValue', 'durationUnit']
    }
  ];

  const currentStepData = steps[currentStep - 1];
  const totalSteps = steps.length;
  const progress = (currentStep / totalSteps) * 100;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderEssentialInformation();
      case 2:
        return renderFundingDetails();
      case 3:
        return renderEligibilityCriteria();
      case 4:
        return renderApplicationDetails();
      default:
        return null;
    }
  };

  const renderEssentialInformation = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="scholarshipId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Scholarship ID *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., AUS_AWARDS_2025" />
              </FormControl>
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PROVIDER_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
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
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Scholarship Name *</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter scholarship name" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="providerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Provider Name *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Organization providing the scholarship" />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider country" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {countries?.map((country: any) => (
                    <SelectItem key={country.isoAlpha2} value={country.isoAlpha2}>
                      {country.countryName}
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
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea {...field} placeholder="Brief description of the scholarship" rows={3} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderFundingDetails = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="fundingType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Funding Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select funding type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {FUNDING_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
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
          name="fundingCurrency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {FUNDING_CURRENCIES.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="totalValueMin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Amount</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number" 
                  placeholder="5000"
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="totalValueMax"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Amount</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number" 
                  placeholder="50000"
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="tuitionCoveragePercentage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tuition Coverage %</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number" 
                  min="0" 
                  max="100" 
                  placeholder="100"
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="livingAllowanceAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Living Allowance Amount</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number" 
                  placeholder="18000"
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="livingAllowanceFrequency"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Living Allowance Frequency</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {LIVING_ALLOWANCE_FREQUENCY.map((frequency) => (
                  <SelectItem key={frequency.value} value={frequency.value}>
                    {frequency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderEligibilityCriteria = () => (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="hostCountries"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Host Countries</FormLabel>
            <FormControl>
              <MultiSelect
                value={field.value || []}
                onChange={field.onChange}
                options={countries?.map((country: any) => ({
                  value: country.isoAlpha2,
                  label: country.countryName
                })) || []}
                placeholder="Select host countries"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="studyLevels"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Study Levels</FormLabel>
            <FormControl>
              <MultiSelect
                value={field.value || []}
                onChange={field.onChange}
                options={STUDY_LEVELS}
                placeholder="Select study levels"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="fieldCategories"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Field Categories</FormLabel>
            <FormControl>
              <MultiSelect
                value={field.value || []}
                onChange={field.onChange}
                options={FIELD_CATEGORIES}
                placeholder="Select field categories"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="minGpa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum GPA</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number" 
                  step="0.1" 
                  placeholder="3.0"
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gpaScale"
          render={({ field }) => (
            <FormItem>
              <FormLabel>GPA Scale</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number" 
                  step="0.1" 
                  placeholder="4.0"
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="genderRequirement"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Gender Requirement</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender requirement" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {GENDER_REQUIREMENTS.map((requirement) => (
                  <SelectItem key={requirement.value} value={requirement.value}>
                    {requirement.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderApplicationDetails = () => (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="applicationDeadline"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Application Deadline</FormLabel>
            <FormControl>
              <Input {...field} type="date" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="durationValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration Value</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number" 
                  placeholder="2"
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="durationUnit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration Unit</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration unit" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DURATION_UNITS.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
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
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {SCHOLARSHIP_STATUS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
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
        name="providerWebsite"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Provider Website</FormLabel>
            <FormControl>
              <Input {...field} placeholder="https://example.com" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => setLocation('/admin/scholarships')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Scholarships
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {mode === 'create' ? 'Create New Scholarship' : 'Edit Scholarship'}
              </h1>
              <p className="text-gray-600 mt-1">Step {currentStep} of {totalSteps}: {currentStepData.title}</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">Progress</span>
              <span className="text-sm font-medium text-gray-900">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="mb-4" />
            
            {/* Step Navigation */}
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2 
                      ${isActive ? 'border-blue-600 bg-blue-600 text-white' : 
                        isCompleted ? 'border-green-600 bg-green-600 text-white' : 
                        'border-gray-300 bg-white text-gray-400'}
                    `}>
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="ml-3 hidden md:block">
                      <p className={`text-sm font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                        {step.title}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="flex-1 h-0.5 bg-gray-200 mx-4 hidden md:block" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Form Content */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <currentStepData.icon className="h-5 w-5" />
                  {currentStepData.title}
                </CardTitle>
                <CardDescription>
                  Fill in the required information for this step
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderStepContent()}
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              <div className="flex gap-2">
                {currentStep < totalSteps ? (
                  <Button type="button" onClick={nextStep}>
                    Next
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    {createMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {mode === 'create' ? 'Create Scholarship' : 'Update Scholarship'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}