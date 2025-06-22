import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useState } from "react";

interface Scholarship {
  id: number;
  scholarshipId: string;
  scholarshipName: string;
  providerName: string;
  providerType: string;
  providerCountry: string;
  description: string;
  shortDescription: string;
  applicationUrl: string;
  studyLevel: string;
  fieldCategory: string;
  targetCountries: string[];
  fundingType: string;
  fundingAmount: number;
  fundingCurrency: string;
  applicationDeadline: string;
  eligibilityRequirements: string[];
  languageRequirements: string[];
  difficultyLevel: string;
  dataSource: string;
  verified: boolean;
  status: string;
}

interface ScholarshipSectionEditorProps {
  scholarship: Scholarship;
  section: string;
  onSubmit: (data: Partial<Scholarship>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const providerTypes = [
  { value: "government", label: "Government" },
  { value: "private", label: "Private" },
  { value: "institution", label: "Institution" },
  { value: "other", label: "Other" }
];

const fundingTypes = [
  { value: "full", label: "Full Scholarship" },
  { value: "partial", label: "Partial Scholarship" },
  { value: "tuition-only", label: "Tuition Only" },
  { value: "living-allowance", label: "Living Allowance" },
  { value: "travel-grant", label: "Travel Grant" }
];

const difficultyLevels = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "very-hard", label: "Very Hard" }
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "pending", label: "Pending" }
];

const studyLevels = [
  "Undergraduate", "Graduate", "Postgraduate", "Masters", "PhD", "Doctorate", "Certificate", "Diploma"
];

const fieldCategories = [
  "Engineering", "Medicine", "Business", "Computer Science", "Arts", "Science", "Social Sciences", 
  "Law", "Education", "Agriculture", "Environmental Studies", "Psychology", "Economics", "Mathematics"
];

const countries = [
  "Australia", "Canada", "United States", "United Kingdom", "Germany", "France", "Netherlands", 
  "Denmark", "Sweden", "Norway", "Finland", "New Zealand", "Singapore", "Japan", "South Korea"
];

const currencies = ["USD", "EUR", "GBP", "CAD", "AUD", "SGD", "JPY", "KRW", "DKK", "SEK", "NOK"];

export default function ScholarshipSectionEditor({ 
  scholarship, 
  section, 
  onSubmit, 
  onCancel, 
  isLoading 
}: ScholarshipSectionEditorProps) {
  const [newEligibilityReq, setNewEligibilityReq] = useState("");
  const [newLanguageReq, setNewLanguageReq] = useState("");

  // Create section-specific schema
  const createSectionSchema = (sectionKey: string) => {
    const baseSchema = {
      basic: z.object({
        scholarshipName: z.string().min(5, "Scholarship name must be at least 5 characters"),
        providerName: z.string().min(3, "Provider name must be at least 3 characters"),
        providerType: z.enum(["government", "private", "institution", "other"]),
        providerCountry: z.string().min(2, "Provider country is required"),
        description: z.string().min(20, "Description must be at least 20 characters"),
        shortDescription: z.string().min(10, "Short description must be at least 10 characters"),
        applicationUrl: z.string().url("Must be a valid URL")
      }),
      funding: z.object({
        fundingType: z.enum(["full", "partial", "tuition-only", "living-allowance", "travel-grant"]),
        fundingAmount: z.number().min(0, "Funding amount must be positive"),
        fundingCurrency: z.string().min(3, "Currency is required")
      }),
      eligibility: z.object({
        studyLevel: z.string().min(1, "Study level is required"),
        fieldCategory: z.string().min(1, "Field category is required"),
        targetCountries: z.array(z.string()).min(1, "At least one target country is required"),
        eligibilityRequirements: z.array(z.string()).min(1, "At least one eligibility requirement is required"),
        languageRequirements: z.array(z.string())
      }),
      application: z.object({
        applicationDeadline: z.string().min(1, "Application deadline is required"),
        difficultyLevel: z.enum(["easy", "medium", "hard", "very-hard"])
      }),
      additional: z.object({
        dataSource: z.string().default("official"),
        verified: z.boolean().default(true),
        status: z.enum(["active", "inactive", "pending"]).default("active")
      })
    };

    return baseSchema[sectionKey as keyof typeof baseSchema] || z.object({});
  };

  const schema = createSectionSchema(section);
  type FormData = z.infer<typeof schema>;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: (() => {
      const sectionFields = getSectionFields(section);
      const defaultValues: any = {};
      
      sectionFields.forEach(field => {
        defaultValues[field] = (scholarship as any)[field];
      });
      
      return defaultValues;
    })()
  });

  function getSectionFields(sectionKey: string) {
    const fieldMap = {
      basic: ['scholarshipName', 'providerName', 'providerType', 'providerCountry', 'description', 'shortDescription', 'applicationUrl'],
      funding: ['fundingType', 'fundingAmount', 'fundingCurrency'],
      eligibility: ['studyLevel', 'fieldCategory', 'targetCountries', 'eligibilityRequirements', 'languageRequirements'],
      application: ['applicationDeadline', 'difficultyLevel'],
      additional: ['dataSource', 'verified', 'status']
    };
    
    return fieldMap[sectionKey as keyof typeof fieldMap] || [];
  }

  const handleSubmit = (data: FormData) => {
    onSubmit(data as Partial<Scholarship>);
  };

  const addEligibilityRequirement = () => {
    if (newEligibilityReq.trim()) {
      const currentReqs = form.getValues('eligibilityRequirements' as any) || [];
      form.setValue('eligibilityRequirements' as any, [...currentReqs, newEligibilityReq.trim()]);
      setNewEligibilityReq("");
    }
  };

  const removeEligibilityRequirement = (index: number) => {
    const currentReqs = form.getValues('eligibilityRequirements' as any) || [];
    form.setValue('eligibilityRequirements' as any, currentReqs.filter((_: string, i: number) => i !== index));
  };

  const addLanguageRequirement = () => {
    if (newLanguageReq.trim()) {
      const currentReqs = form.getValues('languageRequirements' as any) || [];
      form.setValue('languageRequirements' as any, [...currentReqs, newLanguageReq.trim()]);
      setNewLanguageReq("");
    }
  };

  const removeLanguageRequirement = (index: number) => {
    const currentReqs = form.getValues('languageRequirements' as any) || [];
    form.setValue('languageRequirements' as any, currentReqs.filter((_: string, i: number) => i !== index));
  };

  const renderBasicFields = () => (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name={"scholarshipName" as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Scholarship Name</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter scholarship name" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={"providerName" as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Provider Name</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter provider name" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={"providerType" as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Provider Type</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {providerTypes.map((type) => (
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
        name={"providerCountry" as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Provider Country</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider country" />
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

      <FormField
        control={form.control}
        name={"shortDescription" as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Short Description</FormLabel>
            <FormControl>
              <Textarea {...field} placeholder="Enter short description" rows={2} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={"description" as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full Description</FormLabel>
            <FormControl>
              <Textarea {...field} placeholder="Enter full description" rows={4} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={"applicationUrl" as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Application URL</FormLabel>
            <FormControl>
              <Input {...field} placeholder="https://..." type="url" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderFundingFields = () => (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name={"fundingType" as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Funding Type</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select funding type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {fundingTypes.map((type) => (
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

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={"fundingAmount" as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Funding Amount</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number" 
                  placeholder="0"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={"fundingCurrency" as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
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
  );

  const renderEligibilityFields = () => {
    const eligibilityReqs = form.watch('eligibilityRequirements' as any) || [];
    const languageReqs = form.watch('languageRequirements' as any) || [];

    return (
      <div className="space-y-6">
        <FormField
          control={form.control}
          name={"studyLevel" as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Study Level</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
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
          control={form.control}
          name={"fieldCategory" as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Field Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select field category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {fieldCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
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
          name={"targetCountries" as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Countries</FormLabel>
              <div className="space-y-2">
                <Select
                  onValueChange={(value) => {
                    const current = field.value || [];
                    if (!current.includes(value)) {
                      field.onChange([...current, value]);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Add target country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="flex flex-wrap gap-2">
                  {(field.value || []).map((country: string, index: number) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-2">
                      {country}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => {
                          const updated = (field.value || []).filter((_: string, i: number) => i !== index);
                          field.onChange(updated);
                        }}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <Label>Eligibility Requirements</Label>
          <div className="space-y-2 mt-2">
            <div className="flex gap-2">
              <Input
                value={newEligibilityReq}
                onChange={(e) => setNewEligibilityReq(e.target.value)}
                placeholder="Add eligibility requirement"
                onKeyPress={(e) => e.key === 'Enter' && addEligibilityRequirement()}
              />
              <Button type="button" onClick={addEligibilityRequirement}>Add</Button>
            </div>
            
            <div className="space-y-2">
              {eligibilityReqs.map((req: string, index: number) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <span className="flex-1 text-sm">{req}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEligibilityRequirement(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <Label>Language Requirements</Label>
          <div className="space-y-2 mt-2">
            <div className="flex gap-2">
              <Input
                value={newLanguageReq}
                onChange={(e) => setNewLanguageReq(e.target.value)}
                placeholder="Add language requirement"
                onKeyPress={(e) => e.key === 'Enter' && addLanguageRequirement()}
              />
              <Button type="button" onClick={addLanguageRequirement}>Add</Button>
            </div>
            
            <div className="space-y-2">
              {languageReqs.map((req: string, index: number) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <span className="flex-1 text-sm">{req}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLanguageRequirement(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderApplicationFields = () => (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name={"applicationDeadline" as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Application Deadline</FormLabel>
            <FormControl>
              <Input {...field} placeholder="e.g., March 31, 2024" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={"difficultyLevel" as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Difficulty Level</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty level" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {difficultyLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
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

  const renderAdditionalFields = () => (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name={"dataSource" as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Data Source</FormLabel>
            <FormControl>
              <Input {...field} placeholder="e.g., official, website, manual" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={"verified" as any}
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Verified Scholarship</FormLabel>
              <p className="text-sm text-muted-foreground">
                Mark as verified if information has been confirmed
              </p>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={"status" as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {statusOptions.map((status) => (
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
    </div>
  );

  const renderSectionFields = () => {
    switch (section) {
      case 'basic':
        return renderBasicFields();
      case 'funding':
        return renderFundingFields();
      case 'eligibility':
        return renderEligibilityFields();
      case 'application':
        return renderApplicationFields();
      case 'additional':
        return renderAdditionalFields();
      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {renderSectionFields()}
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Section"}
          </Button>
        </div>
      </form>
    </Form>
  );
}