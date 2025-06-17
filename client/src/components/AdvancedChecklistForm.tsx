import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Trash2, CheckSquare, X, Move, FileText } from "lucide-react";
import { insertDocumentChecklistSchema, type InsertDocumentChecklist } from "@shared/schema";

const userTypes = [
  { value: "student", label: "Student" },
  { value: "tourist", label: "Tourist" },
  { value: "work", label: "Work" },
  { value: "family", label: "Family" },
  { value: "business", label: "Business" },
];

const countries = [
  "Other",
  "USA", 
  "UK", 
  "Canada", 
  "Australia", 
  "China",
  "Germany", 
  "France", 
  "Netherlands",
  "Japan",
  "South Korea",
  "Singapore",
  "Switzerland",
  "New Zealand",
  "Ireland",
  "Sweden",
  "Norway",
  "Denmark",
  "Italy",
  "Spain",
  "Nepal", 
  "India", 
  "Pakistan", 
  "Bangladesh", 
  "Sri Lanka", 
  "Vietnam",
  "Philippines", 
  "Indonesia", 
  "Thailand", 
  "Nigeria", 
  "Ghana", 
  "Kenya"
];

const visaTypes = [
  "Student F-1", "Tourist B-2", "Work H-1B", "Study Permit", "Visitor Visa",
  "Business B-1", "Transit C-1", "Family Reunification", "Investment E-2",
  "Artist O-1", "Researcher J-1", "Spouse/Partner", "Working Holiday",
  "Permanent Residence", "Refugee/Asylum", "Other"
];

const itemCategories = [
  { value: "application", label: "Application Forms" },
  { value: "documentation", label: "Documentation" },
  { value: "financial", label: "Financial Proof" },
  { value: "medical", label: "Medical Requirements" },
  { value: "submission", label: "Submission Process" },
];

interface AdvancedChecklistFormProps {
  onSubmit: (data: InsertDocumentChecklist) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: any;
  mode?: "create" | "edit";
}

export function AdvancedChecklistForm({ 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  initialData, 
  mode = "create" 
}: AdvancedChecklistFormProps) {
  const form = useForm<InsertDocumentChecklist>({
    resolver: zodResolver(insertDocumentChecklistSchema),
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

  const { fields: itemFields, append: appendItem, remove: removeItem, move: moveItem } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const [noteItems, setNoteItems] = useState<string[]>(initialData?.importantNotes || []);

  const addNewItem = () => {
    appendItem({
      id: `item-${Date.now()}`,
      name: "",
      description: "",
      required: true,
      completed: false,
      category: "documentation",
      order: itemFields.length,
      tips: [],
      sampleUrl: "",
    });
  };

  const addNewNote = () => {
    setNoteItems([...noteItems, ""]);
  };

  const removeNote = (index: number) => {
    setNoteItems(noteItems.filter((_, i) => i !== index));
  };

  const updateNote = (index: number, value: string) => {
    const newNotes = [...noteItems];
    newNotes[index] = value;
    setNoteItems(newNotes);
    form.setValue("importantNotes", newNotes);
  };

  const ArrayInputField = ({ 
    value, 
    onChange, 
    label, 
    placeholder 
  }: { 
    value: string[]; 
    onChange: (value: string[]) => void; 
    label: string; 
    placeholder: string; 
  }) => {
    const [inputValue, setInputValue] = useState("");

    const addItem = () => {
      if (inputValue.trim() && !value.includes(inputValue.trim())) {
        onChange([...value, inputValue.trim()]);
        setInputValue("");
      }
    };

    const removeItem = (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    };

    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex space-x-2">
          <Input
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addItem();
              }
            }}
          />
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {value.map((item, index) => (
            <Badge key={index} variant="secondary" className="px-2 py-1">
              {item}
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckSquare className="h-5 w-5" />
          <span>{mode === "create" ? "Create Document Checklist" : "Edit Document Checklist"}</span>
        </CardTitle>
        <CardDescription>
          {mode === "create" 
            ? "Create a comprehensive checklist of required documents for visa applications"
            : "Update the document checklist information"
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Accordion type="single" collapsible defaultValue="basic-info" className="w-full">
              
              {/* Basic Information */}
              <AccordionItem value="basic-info">
                <AccordionTrigger className="text-lg font-semibold">
                  Basic Information
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Checklist Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., USA F-1 Student Visa Requirements" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Comprehensive description of visa requirements and application process..."
                            className="min-h-[100px]"
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
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Destination Country *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select country" />
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
                      name="visaType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Visa Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select visa type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {visaTypes.map((visaType) => (
                                <SelectItem key={visaType} value={visaType}>
                                  {visaType}
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
                      name="userType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>User Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select user type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {userTypes.map((userType) => (
                                <SelectItem key={userType.value} value={userType.value}>
                                  {userType.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
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
                          <FormLabel>Estimated Processing Time *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 2-4 weeks" {...field} />
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
                          <FormLabel>Total Fees *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., $185 application fee + $350 SEVIS fee" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Document Items */}
              <AccordionItem value="document-items">
                <AccordionTrigger className="text-lg font-semibold">
                  Required Documents ({itemFields.length})
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Add all required documents for this visa application
                    </p>
                    <Button type="button" variant="outline" onClick={addNewItem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Document
                    </Button>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {itemFields.map((field, index) => (
                      <Card key={field.id} className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">Document #{index + 1}</Badge>
                            <div className="flex space-x-2">
                              {index > 0 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveItem(index, index - 1)}
                                >
                                  ↑
                                </Button>
                              )}
                              {index < itemFields.length - 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveItem(index, index + 1)}
                                >
                                  ↓
                                </Button>
                              )}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(index)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`items.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Document Name *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., Bank Statement" {...field} />
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
                                      {itemCategories.map((category) => (
                                        <SelectItem key={category.value} value={category.value}>
                                          {category.label}
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
                            name={`items.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description *</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Detailed requirements and specifications for this document..."
                                    className="min-h-[80px]"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`items.${index}.required`}
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">Required Document</FormLabel>
                                    <FormDescription>
                                      Is this document mandatory?
                                    </FormDescription>
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

                            <FormField
                              control={form.control}
                              name={`items.${index}.sampleUrl`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Sample URL (Optional)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://example.com/sample.pdf" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name={`items.${index}.tips`}
                            render={({ field }) => (
                              <FormItem>
                                <ArrayInputField
                                  value={field.value || []}
                                  onChange={field.onChange}
                                  label="Tips & Advice"
                                  placeholder="Add helpful tips for this document..."
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {itemFields.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">No documents added yet</p>
                      <Button type="button" variant="outline" onClick={addNewItem}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Document
                      </Button>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Important Notes */}
              <AccordionItem value="important-notes">
                <AccordionTrigger className="text-lg font-semibold">
                  Important Notes ({noteItems.length})
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Add important notes and warnings for applicants
                    </p>
                    <Button type="button" variant="outline" onClick={addNewNote}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {noteItems.map((note, index) => (
                      <div key={index} className="flex space-x-2">
                        <Textarea 
                          placeholder="Enter important note or warning..."
                          value={note}
                          onChange={(e) => updateNote(index, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNote(index)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {noteItems.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-gray-500 mb-4">No important notes added yet</p>
                      <Button type="button" variant="outline" onClick={addNewNote}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Note
                      </Button>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Settings */}
              <AccordionItem value="settings">
                <AccordionTrigger className="text-lg font-semibold">
                  Settings
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active Status</FormLabel>
                          <FormDescription>
                            Enable this checklist to make it available to users
                          </FormDescription>
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
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Separator />

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Processing..." : mode === "create" ? "Create Checklist" : "Update Checklist"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}