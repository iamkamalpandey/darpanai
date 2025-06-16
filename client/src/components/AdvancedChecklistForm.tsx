import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Trash2, Move, FileText, DollarSign, Clock, AlertTriangle, Users, Building, Globe } from "lucide-react";
import { insertDocumentChecklistSchema, type DocumentChecklistFormData } from "@shared/schema";

interface AdvancedChecklistFormProps {
  initialData?: Partial<DocumentChecklistFormData>;
  onSubmit: (data: DocumentChecklistFormData) => void;
  isLoading?: boolean;
}

const userTypes = [
  { value: "student", label: "Student" },
  { value: "tourist", label: "Tourist" },
  { value: "work", label: "Work Visa" },
  { value: "family", label: "Family Reunion" },
  { value: "business", label: "Business" },
];

const feeCategories = [
  { value: "application", label: "Application Fee" },
  { value: "service", label: "Service Fee" },
  { value: "expedite", label: "Expedite Fee" },
  { value: "biometric", label: "Biometric Fee" },
  { value: "other", label: "Other" },
];

const requirementTypes = [
  { value: "eligibility", label: "Eligibility" },
  { value: "financial", label: "Financial" },
  { value: "health", label: "Health" },
  { value: "background", label: "Background Check" },
  { value: "other", label: "Other" },
];

const notarizationTypes = [
  { value: "notarized", label: "Notarized" },
  { value: "apostilled", label: "Apostilled" },
  { value: "embassy_certified", label: "Embassy Certified" },
];

export function AdvancedChecklistForm({ initialData, onSubmit, isLoading }: AdvancedChecklistFormProps) {
  const form = useForm<DocumentChecklistFormData>({
    resolver: zodResolver(insertDocumentChecklistSchema),
    defaultValues: {
      originCountry: initialData?.originCountry || "",
      destinationCountry: initialData?.destinationCountry || "",
      visaType: initialData?.visaType || "",
      userType: initialData?.userType || "student",
      categories: initialData?.categories || [],
      estimatedProcessingTime: initialData?.estimatedProcessingTime || "",
      fees: initialData?.fees || [],
      requirements: initialData?.requirements || [],
      timeline: initialData?.timeline || [],
      importantNotes: initialData?.importantNotes || [],
      isActive: initialData?.isActive ?? true,
    },
  });

  const { fields: categoryFields, append: appendCategory, remove: removeCategory } = useFieldArray({
    control: form.control,
    name: "categories",
  });

  const { fields: feeFields, append: appendFee, remove: removeFee } = useFieldArray({
    control: form.control,
    name: "fees",
  });

  const { fields: requirementFields, append: appendRequirement, remove: removeRequirement } = useFieldArray({
    control: form.control,
    name: "requirements",
  });

  const { fields: timelineFields, append: appendTimeline, remove: removeTimeline } = useFieldArray({
    control: form.control,
    name: "timeline",
  });

  const { fields: noteFields, append: appendNote, remove: removeNote } = useFieldArray({
    control: form.control,
    name: "importantNotes",
  });

  const addCategory = () => {
    appendCategory({
      id: `category_${Date.now()}`,
      name: "",
      description: "",
      required: true,
      order: categoryFields.length,
      icon: "",
      estimatedTime: "",
      documents: [],
    });
  };

  const addDocumentToCategory = (categoryIndex: number) => {
    const currentCategories = form.getValues("categories");
    const updatedCategories = [...currentCategories];
    updatedCategories[categoryIndex].documents.push({
      id: `doc_${Date.now()}`,
      name: "",
      description: "",
      required: true,
      alternatives: [],
      format: "",
      validity: "",
      tips: [],
      templateId: "",
      sampleUrl: "",
      fileSize: "",
      language: "",
      digitalAccepted: true,
      physicalRequired: false,
    });
    form.setValue("categories", updatedCategories);
  };

  const removeDocumentFromCategory = (categoryIndex: number, documentIndex: number) => {
    const currentCategories = form.getValues("categories");
    const updatedCategories = [...currentCategories];
    updatedCategories[categoryIndex].documents.splice(documentIndex, 1);
    form.setValue("categories", updatedCategories);
  };

  const addFee = () => {
    appendFee({
      name: "",
      amount: "",
      currency: "USD",
      description: "",
      required: true,
      category: "application",
      paymentMethods: [],
      refundable: false,
      dueDate: "",
    });
  };

  const addRequirement = () => {
    appendRequirement({
      id: `req_${Date.now()}`,
      title: "",
      description: "",
      type: "eligibility",
      mandatory: true,
      details: [],
    });
  };

  const addTimelineStage = () => {
    appendTimeline({
      stage: "",
      description: "",
      estimatedDuration: "",
      requirements: [],
      tips: [],
    });
  };

  const addNote = () => {
    appendNote("");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Accordion type="multiple" defaultValue={["basic", "categories"]} className="w-full">
          <AccordionItem value="basic">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Basic Information
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <FormField
                      control={form.control}
                      name="originCountry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Origin Country</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select origin country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Nepal">Nepal</SelectItem>
                              <SelectItem value="India">India</SelectItem>
                              <SelectItem value="Bangladesh">Bangladesh</SelectItem>
                              <SelectItem value="Pakistan">Pakistan</SelectItem>
                              <SelectItem value="Sri Lanka">Sri Lanka</SelectItem>
                              <SelectItem value="Vietnam">Vietnam</SelectItem>
                              <SelectItem value="China">China</SelectItem>
                              <SelectItem value="Philippines">Philippines</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="destinationCountry"
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
                              <SelectItem value="United States">United States</SelectItem>
                              <SelectItem value="Canada">Canada</SelectItem>
                              <SelectItem value="Australia">Australia</SelectItem>
                              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                              <SelectItem value="Germany">Germany</SelectItem>
                              <SelectItem value="France">France</SelectItem>
                              <SelectItem value="Netherlands">Netherlands</SelectItem>
                              <SelectItem value="Sweden">Sweden</SelectItem>
                              <SelectItem value="Norway">Norway</SelectItem>
                              <SelectItem value="New Zealand">New Zealand</SelectItem>
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
                              <SelectItem value="F-1 Student Visa">F-1 Student Visa</SelectItem>
                              <SelectItem value="Study Permit">Study Permit (Canada)</SelectItem>
                              <SelectItem value="Student Visa (Subclass 500)">Student Visa (Australia)</SelectItem>
                              <SelectItem value="Tier 4 Student Visa">Tier 4 Student Visa (UK)</SelectItem>
                              <SelectItem value="H-1B Work Visa">H-1B Work Visa</SelectItem>
                              <SelectItem value="Work Permit">Work Permit</SelectItem>
                              <SelectItem value="Tourist Visa">Tourist Visa</SelectItem>
                              <SelectItem value="Business Visa">Business Visa</SelectItem>
                              <SelectItem value="Family Reunion">Family Reunion</SelectItem>
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
                              {userTypes.map((type) => (
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
                    name="estimatedProcessingTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Processing Time</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 15-30 working days" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active Status</FormLabel>
                          <FormDescription>
                            Enable or disable this checklist for public use
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
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="categories">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Categories
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Document Categories
                    <Button type="button" onClick={addCategory} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Organize documents into logical categories with specific requirements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {categoryFields.map((category, categoryIndex) => (
                    <Card key={category.id} className="p-4 border-2">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Category {categoryIndex + 1}</h4>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeCategory(categoryIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`categories.${categoryIndex}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Financial Documents" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`categories.${categoryIndex}.estimatedTime`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Estimated Time</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., 2-3 hours" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name={`categories.${categoryIndex}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Category description..." rows={2} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`categories.${categoryIndex}.required`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm">Required Category</FormLabel>
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

                        {/* Documents in Category */}
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium text-sm">Documents in this Category</h5>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addDocumentToCategory(categoryIndex)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Document
                            </Button>
                          </div>

                          {form.watch(`categories.${categoryIndex}.documents`)?.map((doc, docIndex) => (
                            <Card key={docIndex} className="p-3 mb-3 bg-gray-50">
                              <div className="flex items-center justify-between mb-3">
                                <h6 className="font-medium text-sm">Document {docIndex + 1}</h6>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeDocumentFromCategory(categoryIndex, docIndex)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <Label htmlFor={`doc-name-${categoryIndex}-${docIndex}`}>Document Name</Label>
                                  <Input
                                    id={`doc-name-${categoryIndex}-${docIndex}`}
                                    placeholder="Document name..."
                                    value={doc.name}
                                    onChange={(e) => {
                                      const categories = form.getValues("categories");
                                      categories[categoryIndex].documents[docIndex].name = e.target.value;
                                      form.setValue("categories", categories);
                                    }}
                                  />
                                </div>

                                <div>
                                  <Label htmlFor={`doc-format-${categoryIndex}-${docIndex}`}>Format</Label>
                                  <Input
                                    id={`doc-format-${categoryIndex}-${docIndex}`}
                                    placeholder="PDF, JPG, etc."
                                    value={doc.format}
                                    onChange={(e) => {
                                      const categories = form.getValues("categories");
                                      categories[categoryIndex].documents[docIndex].format = e.target.value;
                                      form.setValue("categories", categories);
                                    }}
                                  />
                                </div>

                                <div className="col-span-2">
                                  <Label htmlFor={`doc-desc-${categoryIndex}-${docIndex}`}>Description</Label>
                                  <Textarea
                                    id={`doc-desc-${categoryIndex}-${docIndex}`}
                                    placeholder="Document description..."
                                    rows={2}
                                    value={doc.description}
                                    onChange={(e) => {
                                      const categories = form.getValues("categories");
                                      categories[categoryIndex].documents[docIndex].description = e.target.value;
                                      form.setValue("categories", categories);
                                    }}
                                  />
                                </div>

                                <div>
                                  <Label htmlFor={`doc-validity-${categoryIndex}-${docIndex}`}>Validity</Label>
                                  <Input
                                    id={`doc-validity-${categoryIndex}-${docIndex}`}
                                    placeholder="e.g., 6 months"
                                    value={doc.validity}
                                    onChange={(e) => {
                                      const categories = form.getValues("categories");
                                      categories[categoryIndex].documents[docIndex].validity = e.target.value;
                                      form.setValue("categories", categories);
                                    }}
                                  />
                                </div>

                                <div>
                                  <Label htmlFor={`doc-size-${categoryIndex}-${docIndex}`}>File Size</Label>
                                  <Input
                                    id={`doc-size-${categoryIndex}-${docIndex}`}
                                    placeholder="e.g., Max 5MB"
                                    value={doc.fileSize || ""}
                                    onChange={(e) => {
                                      const categories = form.getValues("categories");
                                      categories[categoryIndex].documents[docIndex].fileSize = e.target.value;
                                      form.setValue("categories", categories);
                                    }}
                                  />
                                </div>

                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      checked={doc.required}
                                      onCheckedChange={(checked) => {
                                        const categories = form.getValues("categories");
                                        categories[categoryIndex].documents[docIndex].required = checked;
                                        form.setValue("categories", categories);
                                      }}
                                    />
                                    <Label className="text-xs">Required</Label>
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      checked={doc.digitalAccepted}
                                      onCheckedChange={(checked) => {
                                        const categories = form.getValues("categories");
                                        categories[categoryIndex].documents[docIndex].digitalAccepted = checked;
                                        form.setValue("categories", categories);
                                      }}
                                    />
                                    <Label className="text-xs">Digital OK</Label>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}

                          {(!form.watch(`categories.${categoryIndex}.documents`) || form.watch(`categories.${categoryIndex}.documents`).length === 0) && (
                            <div className="text-center py-4 text-muted-foreground text-sm">
                              No documents in this category yet.
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}

                  {categoryFields.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No document categories defined yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="fees">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Fees & Costs
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Application Fees
                    <Button type="button" onClick={addFee} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Fee
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {feeFields.map((fee, index) => (
                    <Card key={fee.id} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Fee {index + 1}</h4>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeFee(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`fees.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fee Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Visa Application Fee" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`fees.${index}.amount`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Amount</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 160" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`fees.${index}.currency`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Currency</FormLabel>
                              <FormControl>
                                <Input placeholder="USD" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`fees.${index}.category`}
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
                                  {feeCategories.map((category) => (
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

                        <div className="col-span-2">
                          <FormField
                            control={form.control}
                            name={`fees.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Fee description..." rows={2} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name={`fees.${index}.required`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm">Required</FormLabel>
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
                          name={`fees.${index}.refundable`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm">Refundable</FormLabel>
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
                    </Card>
                  ))}

                  {feeFields.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No fees defined yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="requirements">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Requirements & Eligibility
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Eligibility Requirements
                    <Button type="button" onClick={addRequirement} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Requirement
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {requirementFields.map((requirement, index) => (
                    <Card key={requirement.id} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Requirement {index + 1}</h4>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeRequirement(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`requirements.${index}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Requirement title..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`requirements.${index}.type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {requirementTypes.map((type) => (
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

                        <div className="col-span-2">
                          <FormField
                            control={form.control}
                            name={`requirements.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Requirement description..." rows={3} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name={`requirements.${index}.mandatory`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm">Mandatory</FormLabel>
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
                    </Card>
                  ))}

                  {requirementFields.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No requirements defined yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="timeline">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Application Timeline
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Process Timeline
                    <Button type="button" onClick={addTimelineStage} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Stage
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {timelineFields.map((stage, index) => (
                    <Card key={stage.id} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Stage {index + 1}</h4>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeTimeline(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`timeline.${index}.stage`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Stage Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Document Preparation" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`timeline.${index}.estimatedDuration`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duration</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 1-2 weeks" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="col-span-2">
                          <FormField
                            control={form.control}
                            name={`timeline.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Stage description..." rows={2} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}

                  {timelineFields.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No timeline stages defined yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="notes">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Important Notes
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Important Notes & Warnings
                    <Button type="button" onClick={addNote} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {noteFields.map((note, index) => (
                    <div key={note.id} className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`importantNotes.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Textarea
                                placeholder="Important note or warning..."
                                rows={2}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeNote(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {noteFields.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No important notes added yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex items-center justify-end space-x-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Checklist"}
          </Button>
        </div>
      </form>
    </Form>
  );
}