import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Switch } from "@/components/ui/switch";

// Simplified schema for destination-country focused checklists
const checklistFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  country: z.string().min(1, "Country is required"),
  visaType: z.string().min(1, "Visa type is required"),
  userType: z.enum(["student", "tourist", "work", "family", "business"]),
  items: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, "Item name is required"),
    description: z.string().min(1, "Description is required"),
    required: z.boolean().default(true),
    completed: z.boolean().default(false),
    category: z.enum(["application", "documentation", "financial", "medical", "submission"]).default("documentation"),
    order: z.number().optional(),
    tips: z.array(z.string()).default([]),
    sampleUrl: z.string().optional(),
  })).default([]),
  estimatedProcessingTime: z.string().min(1, "Processing time is required"),
  totalFees: z.string().min(1, "Total fees is required"),
  importantNotes: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

type ChecklistFormData = z.infer<typeof checklistFormSchema>;

interface SimpleChecklistFormProps {
  initialData?: Partial<ChecklistFormData>;
  onSubmit: (data: ChecklistFormData) => void;
  isLoading?: boolean;
}

const categoryColors = {
  application: "bg-blue-100 text-blue-800",
  documentation: "bg-green-100 text-green-800",
  financial: "bg-yellow-100 text-yellow-800",
  medical: "bg-red-100 text-red-800",
  submission: "bg-purple-100 text-purple-800",
};

export function SimpleChecklistForm({ initialData, onSubmit, isLoading }: SimpleChecklistFormProps) {
  const form = useForm<ChecklistFormData>({
    resolver: zodResolver(checklistFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      country: initialData?.country || "",
      visaType: initialData?.visaType || "",
      userType: initialData?.userType || "student",
      items: initialData?.items || [],
      estimatedProcessingTime: initialData?.estimatedProcessingTime || "",
      totalFees: initialData?.totalFees || "",
      importantNotes: initialData?.importantNotes || [],
      isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
    },
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const { fields: noteFields, append: appendNote, remove: removeNote } = useFieldArray({
    control: form.control,
    name: "importantNotes",
  });

  const addChecklistItem = () => {
    const newItem = {
      id: `item_${Date.now()}`,
      name: "",
      description: "",
      required: true,
      completed: false,
      category: "documentation" as const,
      order: itemFields.length + 1,
      tips: [],
      sampleUrl: "",
    };
    appendItem(newItem);
  };

  const addImportantNote = () => {
    appendNote("");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Australian Education (Offshore)" {...field} />
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
                    <FormLabel>Destination Country</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select destination country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Australia">Australia</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        <SelectItem value="New Zealand">New Zealand</SelectItem>
                        <SelectItem value="Germany">Germany</SelectItem>
                        <SelectItem value="France">France</SelectItem>
                        <SelectItem value="Netherlands">Netherlands</SelectItem>
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
                    <Textarea 
                      placeholder="Brief description of this checklist..." 
                      rows={2}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="visaType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visa Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visa type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Student Visa (Subclass 500)">Student Visa (Australia)</SelectItem>
                        <SelectItem value="Study Permit">Study Permit (Canada)</SelectItem>
                        <SelectItem value="F-1 Student Visa">F-1 Student Visa (USA)</SelectItem>
                        <SelectItem value="Student Visa (Tier 4)">Student Visa (UK)</SelectItem>
                        <SelectItem value="Student Visa">Student Visa (New Zealand)</SelectItem>
                        <SelectItem value="Tourist Visa">Tourist Visa</SelectItem>
                        <SelectItem value="Work Visa">Work Visa</SelectItem>
                        <SelectItem value="Business Visa">Business Visa</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="userType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="tourist">Tourist</SelectItem>
                        <SelectItem value="work">Work</SelectItem>
                        <SelectItem value="family">Family</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estimatedProcessingTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Processing Time</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 4-8 weeks" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalFees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Fees</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., AUD 650 + OSHC + tuition fees" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Checklist Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Checklist Items</CardTitle>
            <Button type="button" onClick={addChecklistItem} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {itemFields.map((field, index) => (
              <Card key={field.id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium">Item {index + 1}</span>
                      <FormField
                        control={form.control}
                        name={`items.${index}.category`}
                        render={({ field }) => (
                          <Badge className={categoryColors[field.value as keyof typeof categoryColors]}>
                            {field.value}
                          </Badge>
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Item Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Application Form" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.category`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="application">Application</SelectItem>
                              <SelectItem value="documentation">Documentation</SelectItem>
                              <SelectItem value="financial">Financial</SelectItem>
                              <SelectItem value="medical">Medical</SelectItem>
                              <SelectItem value="submission">Submission</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`items.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Detailed description of this checklist item..."
                            rows={2}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.required`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Required Item</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.sampleUrl`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sample URL (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/sample" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            {itemFields.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No checklist items yet. Click "Add Item" to get started.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Important Notes</CardTitle>
            <Button type="button" onClick={addImportantNote} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {noteFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <FormField
                  control={form.control}
                  name={`importantNotes.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input 
                          placeholder="Enter an important note..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeNote(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading} className="min-w-32">
            {isLoading ? "Saving..." : "Save Checklist"}
          </Button>
        </div>
      </form>
    </Form>
  );
}