import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
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
import { Plus, Trash2, Upload, FileText, X } from "lucide-react";
import { documentTemplateUploadSchema, type DocumentTemplateUpload } from "@shared/schema";

interface AdvancedTemplateFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: any;
  mode?: "create" | "edit";
}

export function AdvancedTemplateForm({ 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  initialData, 
  mode = "create" 
}: AdvancedTemplateFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');

  // Fetch dynamic dropdown options
  const { data: dropdownOptions, isLoading: isLoadingOptions } = useQuery({
    queryKey: ['/api/dropdown-options'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const form = useForm<DocumentTemplateUpload>({
    resolver: zodResolver(documentTemplateUploadSchema),
    defaultValues: {
      title: "",
      description: "",
      documentType: "",
      category: "financial",
      visaTypes: [],
      countries: [],
      instructions: [],
      tips: [],
      requirements: [],
      isActive: true,
      externalUrl: "",
    },
  });

  // Reset form values when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || "",
        description: initialData.description || "",
        documentType: initialData.documentType || "",
        category: initialData.category || "financial",
        visaTypes: initialData.visaTypes || [],
        countries: initialData.countries || [],
        instructions: initialData.instructions || [],
        tips: initialData.tips || [],
        requirements: initialData.requirements || [],
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        externalUrl: initialData.externalUrl || "",
      });
    } else {
      form.reset({
        title: "",
        description: "",
        documentType: "",
        category: "financial",
        visaTypes: [],
        countries: [],
        instructions: [],
        tips: [],
        requirements: [],
        isActive: true,
        externalUrl: "",
      });
    }
  }, [initialData, form]);

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    
    const allowedTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain', 
      'application/rtf'
    ];
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.rtf'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      alert('Invalid file type. Only Word, PDF, Excel, PowerPoint, and text files are allowed.');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB.');
      return;
    }
    
    setSelectedFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const onFormSubmit = async (data: DocumentTemplateUpload) => {
    if (mode === "create" && !selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    
    // Append form data
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });

    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    await onSubmit(formData);
  };

  const addArrayItem = (fieldName: keyof DocumentTemplateUpload, item: string) => {
    const currentValues = form.getValues(fieldName) as string[];
    if (item.trim() && !currentValues.includes(item.trim())) {
      form.setValue(fieldName, [...currentValues, item.trim()] as any);
    }
  };

  const removeArrayItem = (fieldName: keyof DocumentTemplateUpload, index: number) => {
    const currentValues = form.getValues(fieldName) as string[];
    form.setValue(fieldName, currentValues.filter((_, i) => i !== index) as any);
  };

  const ArrayInputField = ({ 
    fieldName, 
    label, 
    placeholder, 
    description 
  }: { 
    fieldName: keyof DocumentTemplateUpload; 
    label: string; 
    placeholder: string; 
    description?: string;
  }) => {
    const [inputValue, setInputValue] = useState("");
    const values = form.watch(fieldName) as string[];

    return (
      <FormField
        control={form.control}
        name={fieldName}
        render={() => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Input
                  placeholder={placeholder}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (inputValue.trim()) {
                        addArrayItem(fieldName, inputValue);
                        setInputValue("");
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (inputValue.trim()) {
                      addArrayItem(fieldName, inputValue);
                      setInputValue("");
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {values.map((item, index) => (
                  <Badge key={index} variant="secondary" className="px-2 py-1">
                    {item}
                    <button
                      type="button"
                      onClick={() => removeArrayItem(fieldName, index)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>{mode === "create" ? "Create Document Template" : "Edit Document Template"}</span>
        </CardTitle>
        <CardDescription>
          {mode === "create" 
            ? "Upload a sample document template with detailed information"
            : "Update the document template information"
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
            <Accordion type="single" collapsible defaultValue="basic-info" className="w-full">
              
              {/* Basic Information */}
              <AccordionItem value="basic-info">
                <AccordionTrigger className="text-lg font-semibold">
                  Basic Information
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Template Title *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Bank Statement Template - USA F-1 Visa" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="documentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Document Type *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., bank_statement, sop, recommendation_letter" {...field} />
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
                            placeholder="Detailed description of the document template and its purpose..."
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingOptions}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={isLoadingOptions ? "Loading categories..." : "Select a category"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {dropdownOptions?.categories?.map((category: string) => (
                              <SelectItem key={category} value={category.toLowerCase()}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* File Upload */}
              {mode === "create" && (
                <AccordionItem value="file-upload">
                  <AccordionTrigger className="text-lg font-semibold">
                    File Upload
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragActive 
                          ? 'border-blue-400 bg-blue-50' 
                          : selectedFile 
                            ? 'border-green-400 bg-green-50' 
                            : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      {selectedFile ? (
                        <div className="space-y-2">
                          <FileText className="h-12 w-12 text-green-600 mx-auto" />
                          <p className="text-sm font-medium text-green-800">{selectedFile.name}</p>
                          <p className="text-xs text-green-600">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedFile(null)}
                          >
                            Remove File
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                          <div>
                            <p className="text-lg font-medium text-gray-900">
                              Drop your file here, or click to browse
                            </p>
                            <p className="text-sm text-gray-500">
                              Supports PDF, DOC, DOCX, TXT, RTF up to 10MB
                            </p>
                          </div>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.txt,.rtf"
                            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                            className="hidden"
                            id="file-upload"
                          />
                          <label htmlFor="file-upload">
                            <Button type="button" variant="outline" asChild>
                              <span>Choose File</span>
                            </Button>
                          </label>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Target Audience */}
              <AccordionItem value="target-audience">
                <AccordionTrigger className="text-lg font-semibold">
                  Target Audience
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-base font-medium">Visa Types</Label>
                      <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                        {dropdownOptions?.visaTypes?.map((visaType: string) => (
                          <label key={visaType} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={form.watch("visaTypes").includes(visaType)}
                              onChange={(e) => {
                                const current = form.getValues("visaTypes");
                                if (e.target.checked) {
                                  form.setValue("visaTypes", [...current, visaType]);
                                } else {
                                  form.setValue("visaTypes", current.filter(v => v !== visaType));
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">{visaType}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-medium">Countries</Label>
                      <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                        {dropdownOptions?.countries?.map((country: string) => (
                          <label key={country} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={form.watch("countries").includes(country)}
                              onChange={(e) => {
                                const current = form.getValues("countries");
                                if (e.target.checked) {
                                  form.setValue("countries", [...current, country]);
                                } else {
                                  form.setValue("countries", current.filter(c => c !== country));
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">{country}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Instructions & Tips */}
              <AccordionItem value="instructions-tips">
                <AccordionTrigger className="text-lg font-semibold">
                  Instructions & Tips
                </AccordionTrigger>
                <AccordionContent className="space-y-6 pt-4">
                  <ArrayInputField
                    fieldName="instructions"
                    label="Usage Instructions"
                    placeholder="Add step-by-step instructions..."
                    description="Step-by-step instructions for using this template"
                  />

                  <ArrayInputField
                    fieldName="tips"
                    label="Helpful Tips"
                    placeholder="Add helpful tips..."
                    description="Tips and best practices for completing this document"
                  />

                  <ArrayInputField
                    fieldName="requirements"
                    label="Information Requirements"
                    placeholder="Add required information..."
                    description="What information users need to provide when using this template"
                  />
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
                            Enable this template to make it available to users
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
                {isLoading ? "Processing..." : mode === "create" ? "Create Template" : "Update Template"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}