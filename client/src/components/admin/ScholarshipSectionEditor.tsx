import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, X, Plus, Trash2 } from "lucide-react";
import { z } from "zod";

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

export default function ScholarshipSectionEditor({ 
  scholarship, 
  section, 
  onSubmit, 
  onCancel, 
  isLoading 
}: ScholarshipSectionEditorProps) {
  const [tempArrayItems, setTempArrayItems] = useState<{[key: string]: string[]}>({
    targetCountries: scholarship.targetCountries || [],
    eligibilityRequirements: scholarship.eligibilityRequirements || [],
    languageRequirements: scholarship.languageRequirements || []
  });

  // Create section-specific schema
  const createSectionSchema = (sectionKey: string) => {
    const baseSchemas = {
      basic: z.object({
        scholarshipId: z.string().min(3, "Scholarship ID must be at least 3 characters"),
        scholarshipName: z.string().min(5, "Scholarship name must be at least 5 characters"),
        providerName: z.string().min(3, "Provider name must be at least 3 characters"),
        providerType: z.enum(["government", "private", "institution", "other"]),
        providerCountry: z.string().min(2, "Provider country is required"),
        description: z.string().min(20, "Description must be at least 20 characters"),
        shortDescription: z.string().min(10, "Short description must be at least 10 characters")
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
        applicationUrl: z.string().url("Must be a valid URL"),
        applicationDeadline: z.string().min(1, "Application deadline is required"),
        difficultyLevel: z.enum(["easy", "medium", "hard", "very-hard"])
      }),
      additional: z.object({
        dataSource: z.string().default("official"),
        verified: z.boolean().default(true),
        status: z.enum(["active", "inactive", "pending"]).default("active")
      })
    };

    return baseSchemas[sectionKey as keyof typeof baseSchemas] || z.object({});
  };

  const schema = createSectionSchema(section);
  type FormData = z.infer<typeof schema>;

  const form = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: getSectionFields(section) as any
  });

  function getSectionFields(sectionKey: string) {
    const fieldMappings = {
      basic: {
        scholarshipId: scholarship.scholarshipId,
        scholarshipName: scholarship.scholarshipName,
        providerName: scholarship.providerName,
        providerType: scholarship.providerType,
        providerCountry: scholarship.providerCountry,
        description: scholarship.description,
        shortDescription: scholarship.shortDescription
      },
      funding: {
        fundingType: scholarship.fundingType,
        fundingAmount: scholarship.fundingAmount,
        fundingCurrency: scholarship.fundingCurrency
      },
      eligibility: {
        studyLevel: scholarship.studyLevel,
        fieldCategory: scholarship.fieldCategory,
        targetCountries: scholarship.targetCountries || [],
        eligibilityRequirements: scholarship.eligibilityRequirements || [],
        languageRequirements: scholarship.languageRequirements || []
      },
      application: {
        applicationUrl: scholarship.applicationUrl,
        applicationDeadline: scholarship.applicationDeadline,
        difficultyLevel: scholarship.difficultyLevel
      },
      additional: {
        dataSource: scholarship.dataSource,
        verified: scholarship.verified,
        status: scholarship.status
      }
    };

    return fieldMappings[sectionKey as keyof typeof fieldMappings] || {};
  }

  const handleSubmit = (data: FormData) => {
    // Include array fields in submission
    const submissionData = {
      ...data,
      targetCountries: tempArrayItems.targetCountries,
      eligibilityRequirements: tempArrayItems.eligibilityRequirements,
      languageRequirements: tempArrayItems.languageRequirements
    };
    onSubmit(submissionData);
  };

  const addArrayItem = (field: string, value: string) => {
    if (value.trim()) {
      setTempArrayItems(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), value.trim()]
      }));
    }
  };

  const removeArrayItem = (field: string, index: number) => {
    setTempArrayItems(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const renderArrayField = (field: string, label: string) => {
    const [newItem, setNewItem] = useState("");
    
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex gap-2">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder={`Add ${label.toLowerCase()}`}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addArrayItem(field, newItem);
                setNewItem("");
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              addArrayItem(field, newItem);
              setNewItem("");
            }}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tempArrayItems[field]?.map((item, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {item}
              <button
                type="button"
                onClick={() => removeArrayItem(field, index)}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  const renderSectionFields = () => {
    switch (section) {
      case 'basic':
        return (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control as any}
                name="scholarshipId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scholarship ID *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. AUS_AWARDS_2025" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="scholarshipName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scholarship Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Australia Awards Scholarship" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
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
                control={form.control as any}
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
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="institution">Institution</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
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
              control={form.control as any}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} placeholder="Detailed scholarship description..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control as any}
              name="shortDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description *</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} placeholder="Brief summary..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 'funding':
        return (
          <div className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control as any}
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
                      <SelectItem value="full">Full Funding</SelectItem>
                      <SelectItem value="partial">Partial Funding</SelectItem>
                      <SelectItem value="tuition-only">Tuition Only</SelectItem>
                      <SelectItem value="living-allowance">Living Allowance</SelectItem>
                      <SelectItem value="travel-grant">Travel Grant</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control as any}
              name="fundingAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Funding Amount *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      placeholder="50000"
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control as any}
              name="fundingCurrency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. USD, AUD, EUR" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 'eligibility':
        return (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control as any}
                name="studyLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Study Level *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Masters, PhD" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="fieldCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Field Category *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Engineering, Medicine" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {renderArrayField('targetCountries', 'Target Countries')}
            {renderArrayField('eligibilityRequirements', 'Eligibility Requirements')}
            {renderArrayField('languageRequirements', 'Language Requirements')}
          </div>
        );

      case 'application':
        return (
          <div className="space-y-4">
            <FormField
              control={form.control as any}
              name="applicationUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Application URL *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control as any}
                name="applicationDeadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Deadline *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. April 30, 2025" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="difficultyLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty Level *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                        <SelectItem value="very-hard">Very Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 'additional':
        return (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control as any}
                name="dataSource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Source</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. official, verified" />
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
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                  </div>
                </FormItem>
              )}
            />
          </div>
        );

      default:
        return <div>Section not found</div>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Edit {section.charAt(0).toUpperCase() + section.slice(1)} Information
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {renderSectionFields()}
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}