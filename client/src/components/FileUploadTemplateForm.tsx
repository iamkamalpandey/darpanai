import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Upload, FileText, X, Plus } from 'lucide-react';
import { documentTemplateUploadSchema } from '@shared/schema';
import { z } from 'zod';

type DocumentTemplateUpload = z.infer<typeof documentTemplateUploadSchema>;

interface FileUploadTemplateFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const categories = [
  { value: "financial", label: "Financial" },
  { value: "academic", label: "Academic" },
  { value: "personal", label: "Personal" },
  { value: "employment", label: "Employment" },
  { value: "travel", label: "Travel" },
  { value: "legal", label: "Legal" }
];

const documentTypes = [
  "bank_statement", "financial_affidavit", "sponsorship_letter", "income_certificate",
  "transcript", "diploma", "recommendation_letter", "statement_of_purpose", "study_plan",
  "passport", "birth_certificate", "marriage_certificate", "police_clearance",
  "employment_letter", "experience_certificate", "resume", "cover_letter",
  "travel_itinerary", "flight_reservation", "hotel_booking",
  "visa_application", "invitation_letter", "power_of_attorney"
];

const countries = [
  "USA", "Canada", "UK", "Australia", "Germany", "France", "Netherlands", 
  "New Zealand", "Ireland", "Sweden", "Norway", "Denmark", "Other"
];

const visaTypes = [
  "F-1 Student Visa", "J-1 Exchange Visitor", "Study Permit", "Student Visa (Subclass 500)",
  "Student Visa (Tier 4)", "H-1B Work Visa", "Tourist Visa", "Business Visa", "Family Reunion"
];

export function FileUploadTemplateForm({ onSubmit, onCancel, isLoading }: FileUploadTemplateFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [visaTypesList, setVisaTypesList] = useState<string[]>([]);
  const [countriesList, setCountriesList] = useState<string[]>([]);
  const [instructionsList, setInstructionsList] = useState<string[]>([]);
  const [tipsList, setTipsList] = useState<string[]>([]);
  const [requirementsList, setRequirementsList] = useState<string[]>([]);
  const [newInstruction, setNewInstruction] = useState('');
  const [newTip, setNewTip] = useState('');
  const [newRequirement, setNewRequirement] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<DocumentTemplateUpload>({
    resolver: zodResolver(documentTemplateUploadSchema),
    defaultValues: {
      visaTypes: [],
      countries: [],
      instructions: [],
      tips: [],
      requirements: [],
      isActive: true
    }
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/rtf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Only PDF, DOC, DOCX, TXT, and RTF files are allowed.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('File size must be less than 10MB.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const addToList = (value: string, list: string[], setList: (list: string[]) => void, formField: keyof DocumentTemplateUpload) => {
    if (value.trim() && !list.includes(value.trim())) {
      const newList = [...list, value.trim()];
      setList(newList);
      setValue(formField, newList as any);
    }
  };

  const removeFromList = (index: number, list: string[], setList: (list: string[]) => void, formField: keyof DocumentTemplateUpload) => {
    const newList = list.filter((_, i) => i !== index);
    setList(newList);
    setValue(formField, newList as any);
  };

  const onFormSubmit = async (data: DocumentTemplateUpload) => {
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    
    // Append form data
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });

    await onSubmit(formData);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="h-5 w-5 mr-2" />
          Upload Document Template
        </CardTitle>
        <CardDescription>
          Upload sample document files that users can download as templates for their visa applications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Document File *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {selectedFile ? (
                <div className="flex items-center justify-center space-x-2">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500">PDF, DOC, DOCX, TXT, RTF (max 10MB)</p>
                </div>
              )}
              <Input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx,.txt,.rtf"
                onChange={handleFileChange}
                className="mt-4"
              />
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                {...register('title')}
                placeholder="e.g., Bank Statement Template - USA F-1 Visa"
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentType">Document Type *</Label>
              <Select onValueChange={(value) => setValue('documentType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.documentType && <p className="text-sm text-red-500">{errors.documentType.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              {...register('description')}
              placeholder="Describe what this template is for and how to use it"
              rows={3}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select onValueChange={(value) => setValue('category', value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
          </div>

          {/* Visa Types and Countries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Applicable Visa Types</Label>
              <div className="flex space-x-2">
                <Select onValueChange={(value) => addToList(value, visaTypesList, setVisaTypesList, 'visaTypes')}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Add visa type" />
                  </SelectTrigger>
                  <SelectContent>
                    {visaTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-2">
                {visaTypesList.map((type, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                    <span>{type}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeFromList(index, visaTypesList, setVisaTypesList, 'visaTypes')}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Applicable Countries</Label>
              <div className="flex space-x-2">
                <Select onValueChange={(value) => addToList(value, countriesList, setCountriesList, 'countries')}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Add country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-2">
                {countriesList.map((country, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                    <span>{country}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeFromList(index, countriesList, setCountriesList, 'countries')}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label>Instructions</Label>
            <div className="flex space-x-2">
              <Input
                value={newInstruction}
                onChange={(e) => setNewInstruction(e.target.value)}
                placeholder="Add instruction"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  addToList(newInstruction, instructionsList, setInstructionsList, 'instructions');
                  setNewInstruction('');
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {instructionsList.map((instruction, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">{instruction}</span>
                  <X 
                    className="h-4 w-4 cursor-pointer text-red-500" 
                    onClick={() => removeFromList(index, instructionsList, setInstructionsList, 'instructions')}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="space-y-2">
            <Label>Tips</Label>
            <div className="flex space-x-2">
              <Input
                value={newTip}
                onChange={(e) => setNewTip(e.target.value)}
                placeholder="Add tip"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  addToList(newTip, tipsList, setTipsList, 'tips');
                  setNewTip('');
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {tipsList.map((tip, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">{tip}</span>
                  <X 
                    className="h-4 w-4 cursor-pointer text-red-500" 
                    onClick={() => removeFromList(index, tipsList, setTipsList, 'tips')}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <Label>Requirements (What users need to fill in)</Label>
            <div className="flex space-x-2">
              <Input
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                placeholder="Add requirement"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  addToList(newRequirement, requirementsList, setRequirementsList, 'requirements');
                  setNewRequirement('');
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {requirementsList.map((requirement, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">{requirement}</span>
                  <X 
                    className="h-4 w-4 cursor-pointer text-red-500" 
                    onClick={() => removeFromList(index, requirementsList, setRequirementsList, 'requirements')}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Switch
              checked={watch('isActive')}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
            <Label>Active (visible to users)</Label>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Uploading...' : 'Upload Template'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}