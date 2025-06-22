import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Save } from "lucide-react";

// Section-specific validation schemas
const basicInfoSchema = z.object({
  scholarshipName: z.string().min(5, "Scholarship name must be at least 5 characters"),
  providerName: z.string().min(3, "Provider name must be at least 3 characters"),
  providerType: z.enum(["government", "private", "institution", "other"]),
  providerCountry: z.string().min(2, "Provider country is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  shortDescription: z.string().min(10, "Short description must be at least 10 characters"),
  applicationUrl: z.string().url("Must be a valid URL")
});

const studyInfoSchema = z.object({
  studyLevel: z.string().min(2, "Study level is required"),
  fieldCategory: z.string().min(2, "Field category is required"),
  targetCountries: z.array(z.string()).min(1, "At least one target country is required")
});

const fundingInfoSchema = z.object({
  fundingType: z.enum(["full", "partial", "tuition-only", "living-allowance", "other"]),
  fundingAmount: z.number().min(1, "Funding amount must be greater than 0"),
  fundingCurrency: z.string().length(3, "Currency must be 3 characters"),
  applicationDeadline: z.string().min(1, "Application deadline is required")
});

const requirementsSchema = z.object({
  eligibilityRequirements: z.array(z.string()).min(1, "At least one eligibility requirement is required"),
  languageRequirements: z.array(z.string()).optional(),
  difficultyLevel: z.enum(["beginner", "intermediate", "advanced", "expert"])
});

const settingsSchema = z.object({
  dataSource: z.string().min(2, "Data source is required"),
  verified: z.boolean(),
  status: z.enum(["active", "inactive", "pending"])
});

interface ScholarshipSectionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  section: string;
  title: string;
  initialData: any;
  isLoading?: boolean;
}

export default function ScholarshipSectionEditor({
  isOpen,
  onClose,
  onSave,
  section,
  title,
  initialData,
  isLoading = false
}: ScholarshipSectionEditorProps) {
  const [arrayFields, setArrayFields] = useState<{[key: string]: string[]}>({
    targetCountries: initialData?.targetCountries || [],
    eligibilityRequirements: initialData?.eligibilityRequirements || [],
    languageRequirements: initialData?.languageRequirements || []
  });

  // Select appropriate schema based on section
  const getSchema = () => {
    switch (section) {
      case 'basic': return basicInfoSchema;
      case 'study': return studyInfoSchema;
      case 'funding': return fundingInfoSchema;
      case 'requirements': return requirementsSchema;
      case 'settings': return settingsSchema;
      default: return basicInfoSchema;
    }
  };

  const form = useForm({
    resolver: zodResolver(getSchema()),
    defaultValues: initialData || {}
  });

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
      setArrayFields({
        targetCountries: initialData.targetCountries || [],
        eligibilityRequirements: initialData.eligibilityRequirements || [],
        languageRequirements: initialData.languageRequirements || []
      });
    }
  }, [initialData, form]);

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

  const handleSave = (data: any) => {
    // Merge array fields with form data
    const finalData = {
      ...data,
      ...arrayFields
    };
    onSave(finalData);
  };

  const renderBasicInfoFields = () => (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="scholarshipName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-red-600">Scholarship Name *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Australia Awards Scholarship" />
              </FormControl>
              <div className="text-sm text-red-600">Required</div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="providerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-red-600">Provider Name *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Australian Government" />
              </FormControl>
              <div className="text-sm text-red-600">Required</div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="providerType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-red-600">Provider Type *</FormLabel>
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
              <div className="text-sm text-red-600">Required</div>
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
                <Input {...field} placeholder="Australia" />
              </FormControl>
              <div className="text-sm text-red-600">Required</div>
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
                placeholder="Detailed scholarship description..."
                className="resize-none"
              />
            </FormControl>
            <div className="text-sm text-red-600">Required</div>
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
                placeholder="Brief summary..."
                className="resize-none"
              />
            </FormControl>
            <div className="text-sm text-red-600">Required</div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="applicationUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-red-600">Application URL *</FormLabel>
            <FormControl>
              <Input {...field} placeholder="https://example.com/apply" type="url" />
            </FormControl>
            <div className="text-sm text-red-600">Required</div>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  const renderStudyInfoFields = () => (
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
              <div className="text-sm text-red-600">Required</div>
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
              <div className="text-sm text-red-600">Required</div>
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

  const renderFundingInfoFields = () => (
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
            <div className="text-sm text-red-600">Required</div>
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
              <div className="text-sm text-red-600">Required</div>
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
              <div className="text-sm text-red-600">Required</div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

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
            <div className="text-sm text-red-600">Required</div>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  const renderRequirementsFields = () => (
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
            <div className="text-sm text-red-600">Required</div>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  const renderSettingsFields = () => (
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
            <div className="text-sm text-red-600">Required</div>
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
            <div className="text-sm text-red-600">Required</div>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  const renderSectionFields = () => {
    switch (section) {
      case 'basic': return renderBasicInfoFields();
      case 'study': return renderStudyInfoFields();
      case 'funding': return renderFundingInfoFields();
      case 'requirements': return renderRequirementsFields();
      case 'settings': return renderSettingsFields();
      default: return renderBasicInfoFields();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {title}</DialogTitle>
          <DialogDescription>
            Update scholarship information for the selected section
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
            {renderSectionFields()}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
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
      <div className={`text-sm font-medium ${required ? 'text-red-600' : ''}`}>
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