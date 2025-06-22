import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit, Save, ArrowLeft, Plus, X } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';

// Array Field Editor Component
interface ArrayFieldEditorProps {
  values: string[];
  onChange: (values: string[]) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}

function ArrayFieldEditor({ values, onChange, options, placeholder }: ArrayFieldEditorProps) {
  const [selectedValue, setSelectedValue] = useState('');

  const addValue = () => {
    if (selectedValue && !values.includes(selectedValue)) {
      onChange([...values, selectedValue]);
      setSelectedValue('');
    }
  };

  const removeValue = (valueToRemove: string) => {
    onChange(values.filter(v => v !== valueToRemove));
  };

  const getOptionLabel = (value: string) => {
    const option = options.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Select value={selectedValue} onValueChange={setSelectedValue}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options
              .filter(option => !values.includes(option.value))
              .map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))
            }
          </SelectContent>
        </Select>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={addValue}
          disabled={!selectedValue || values.includes(selectedValue)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <Badge key={value} variant="secondary" className="flex items-center gap-1">
              {getOptionLabel(value)}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={() => removeValue(value)}
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

interface ScholarshipEditorProps {
  scholarshipId: string;
  mode: 'view' | 'edit';
}

export function ScholarshipEditor({ scholarshipId, mode }: ScholarshipEditorProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

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

  // Fetch scholarship data - similar to user profile data fetching
  const { data: scholarship, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/scholarships', scholarshipId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/scholarships/${scholarshipId}`);
      if (!response.ok) throw new Error('Failed to fetch scholarship');
      const result = await response.json();
      return result.data;
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // Initialize form data when scholarship loads - similar to ProfileSectionEditor
  useEffect(() => {
    if (scholarship) {
      console.log('Initializing scholarship form data:', scholarship);
      setFormData({ ...scholarship });
    }
  }, [scholarship]);

  // Update mutation - similar to user profile update
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Sending scholarship update:', data);
      
      const response = await fetch(`/api/admin/scholarships/${scholarshipId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      console.log('Response status:', response.status);
      
      const responseData = await response.json();
      console.log('Response data:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update scholarship');
      }
      
      // Check if the response indicates success
      if (responseData.success === false) {
        throw new Error(responseData.error || 'Update failed');
      }
      
      return responseData;
    },
    onSuccess: (data) => {
      console.log('Scholarship updated successfully:', data);
      
      // Clear cache and refresh data - similar to profile updates
      queryClient.removeQueries({ queryKey: ['/api/admin/scholarships'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/scholarships', scholarshipId] });
      
      toast({
        title: 'Scholarship Updated',
        description: 'Scholarship information has been successfully updated.',
      });
      
      setEditingSection(null);
      refetch();
    },
    onError: (error: any) => {
      console.error('Scholarship update error:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update scholarship. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handle input changes - similar to ProfileSectionEditor
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle array field changes
  const handleArrayFieldChange = (field: string, values: string[]) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: values
    }));
  };

  // Handle save - similar to ProfileSectionEditor
  const handleSave = (section: string) => {
    // Get only the fields relevant to this section
    const sectionData = getSectionData(section);
    console.log(`Saving ${section} section with data:`, sectionData);
    updateMutation.mutate(sectionData);
  };

  // Get section-specific data
  const getSectionData = (section: string) => {
    switch (section) {
      case 'basic':
        return {
          scholarshipId: formData.scholarshipId,
          name: formData.name,
          shortName: formData.shortName,
          providerName: formData.providerName,
          providerType: formData.providerType,
          providerCountry: formData.providerCountry,
          providerWebsite: formData.providerWebsite,
          description: formData.description
        };
      case 'funding':
        return {
          fundingType: formData.fundingType,
          fundingCurrency: formData.fundingCurrency,
          totalValueMin: formData.totalValueMin,
          totalValueMax: formData.totalValueMax,
          tuitionCoveragePercentage: formData.tuitionCoveragePercentage,
          livingAllowanceAmount: formData.livingAllowanceAmount,
          livingAllowanceFrequency: formData.livingAllowanceFrequency
        };
      case 'eligibility':
        return {
          hostCountries: formData.hostCountries,
          eligibleCountries: formData.eligibleCountries,
          studyLevels: formData.studyLevels,
          fieldCategories: formData.fieldCategories,
          minGpa: formData.minGpa,
          gpaScale: formData.gpaScale,
          degreeRequired: formData.degreeRequired,
          minAge: formData.minAge,
          maxAge: formData.maxAge,
          genderRequirement: formData.genderRequirement,
          minWorkExperience: formData.minWorkExperience
        };
      case 'application':
        return {
          applicationOpenDate: formData.applicationOpenDate,
          applicationDeadline: formData.applicationDeadline,
          notificationDate: formData.notificationDate,
          programStartDate: formData.programStartDate,
          durationValue: formData.durationValue,
          durationUnit: formData.durationUnit
        };
      default:
        return formData;
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!scholarship) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-900">Scholarship Not Found</h2>
          <p className="text-gray-600 mt-2">The scholarship you're looking for doesn't exist.</p>
          <Button 
            variant="outline" 
            onClick={() => setLocation('/admin/scholarships')}
            className="mt-4"
          >
            Back to Scholarships
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
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
                {mode === 'edit' ? 'Edit' : 'View'} Scholarship
              </h1>
              <p className="text-gray-600 mt-1">{scholarship.name}</p>
            </div>
          </div>
          <Badge variant={scholarship.status === 'active' ? 'default' : 'secondary'}>
            {scholarship.status}
          </Badge>
        </div>

        {/* Scholarship Overview Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-gray-900">
                  {scholarship.name}
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  {scholarship.providerName} • {scholarship.providerType}
                </CardDescription>
                <CardDescription className="text-gray-600 mt-1">
                  {scholarship.fundingType} • {scholarship.fundingCurrency} {Number(scholarship.totalValueMin)?.toLocaleString()} - {Number(scholarship.totalValueMax)?.toLocaleString()}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Scholarship Details Cards */}
        <div className="grid gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-2">
                <CardTitle>Basic Information</CardTitle>
              </div>
              {mode === 'edit' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEditingSection('basic')}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Provider Name</div>
                  <div className="text-gray-900">{scholarship.providerName || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Provider Type</div>
                  <div className="text-gray-900 capitalize">{scholarship.providerType || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Provider Country</div>
                  <div className="text-gray-900">{scholarship.providerCountry || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Website</div>
                  <div className="text-gray-900 break-all">{scholarship.providerWebsite || 'Not specified'}</div>
                </div>
              </div>
              {scholarship.description && (
                <div>
                  <div className="text-sm font-medium text-gray-500">Description</div>
                  <div className="text-gray-900">{scholarship.description}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Funding Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-2">
                <CardTitle>Funding Information</CardTitle>
              </div>
              {mode === 'edit' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEditingSection('funding')}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Funding Type</div>
                  <div className="text-gray-900 capitalize">{scholarship.fundingType || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Currency</div>
                  <div className="text-gray-900">{scholarship.fundingCurrency || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Amount Range</div>
                  <div className="text-gray-900">
                    {scholarship.totalValueMin && scholarship.totalValueMax 
                      ? `${scholarship.fundingCurrency} ${scholarship.totalValueMin.toLocaleString()} - ${scholarship.totalValueMax.toLocaleString()}`
                      : 'Not specified'
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Eligibility Criteria */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-2">
                <CardTitle>Eligibility Criteria</CardTitle>
              </div>
              {mode === 'edit' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEditingSection('eligibility')}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Minimum GPA</div>
                  <div className="text-gray-900">{scholarship.minGpa || 'Not specified'}</div>
                </div>
              </div>
              
              {scholarship.hostCountries && scholarship.hostCountries.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-2">Host Countries</div>
                  <div className="flex flex-wrap gap-2">
                    {scholarship.hostCountries.map((country: string, index: number) => (
                      <Badge key={index} variant="secondary">{country}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {scholarship.studyLevels && scholarship.studyLevels.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-2">Study Levels</div>
                  <div className="flex flex-wrap gap-2">
                    {scholarship.studyLevels.map((level: string, index: number) => (
                      <Badge key={index} variant="outline">{level}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Application Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-2">
                <CardTitle>Application Information</CardTitle>
              </div>
              {mode === 'edit' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEditingSection('application')}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Application Deadline</div>
                  <div className="text-gray-900">
                    {scholarship.applicationDeadline 
                      ? new Date(scholarship.applicationDeadline).toLocaleDateString()
                      : 'Not specified'
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section Editor Dialog - similar to ProfileSectionEditor */}
        <ScholarshipSectionEditor
          open={!!editingSection}
          onClose={() => setEditingSection(null)}
          section={editingSection || ''}
          scholarship={scholarship}
          formData={formData}
          onInputChange={handleInputChange}
          onArrayFieldChange={handleArrayFieldChange}
          onSave={handleSave}
          isLoading={updateMutation.isPending}
          countries={countries || []}
        />
      </div>
    </AdminLayout>
  );
}

// Section Editor Component - similar to ProfileSectionEditor structure
interface ScholarshipSectionEditorProps {
  open: boolean;
  onClose: () => void;
  section: string;
  scholarship: any;
  formData: any;
  onInputChange: (field: string, value: any) => void;
  onArrayFieldChange: (field: string, values: string[]) => void;
  onSave: (section: string) => void;
  isLoading: boolean;
  countries: any[];
}

function ScholarshipSectionEditor({
  open,
  onClose,
  section,
  scholarship,
  formData,
  onInputChange,
  onArrayFieldChange,
  onSave,
  isLoading,
  countries
}: ScholarshipSectionEditorProps) {
  
  const getSectionTitle = () => {
    switch (section) {
      case 'basic': return 'Basic Information';
      case 'funding': return 'Funding Information';
      case 'eligibility': return 'Eligibility Criteria';
      case 'application': return 'Application Information';
      case 'details': return 'Additional Details';
      default: return 'Scholarship Section';
    }
  };

  const renderSectionContent = () => {
    switch (section) {
      case 'basic':
        return renderBasicInformation();
      case 'funding':
        return renderFundingInformation();
      case 'eligibility':
        return renderEligibilityCriteria();
      case 'application':
        return renderApplicationInformation();
      case 'details':
        return renderAdditionalDetails();
      default:
        return <div>Section not found</div>;
    }
  };

  const renderBasicInformation = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="scholarshipId">Scholarship ID *</Label>
          <Input
            id="scholarshipId"
            value={formData.scholarshipId || ''}
            onChange={(e) => onInputChange('scholarshipId', e.target.value)}
            placeholder="e.g., AUS_AWARDS_2025"
          />
        </div>
        <div>
          <Label htmlFor="providerType">Provider Type *</Label>
          <Select value={formData.providerType || ''} onValueChange={(value) => onInputChange('providerType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select provider type" />
            </SelectTrigger>
            <SelectContent>
              {PROVIDER_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="name">Scholarship Name *</Label>
        <Input
          id="name"
          value={formData.name || ''}
          onChange={(e) => onInputChange('name', e.target.value)}
          placeholder="Enter scholarship name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="providerName">Provider Name *</Label>
          <Input
            id="providerName"
            value={formData.providerName || ''}
            onChange={(e) => onInputChange('providerName', e.target.value)}
            placeholder="Organization providing the scholarship"
          />
        </div>
        <div>
          <Label htmlFor="providerCountry">Provider Country *</Label>
          <Select value={formData.providerCountry || ''} onValueChange={(value) => onInputChange('providerCountry', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select provider country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country: any) => (
                <SelectItem key={country.isoAlpha2} value={country.isoAlpha2}>
                  {country.countryName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="providerWebsite">Provider Website</Label>
        <Input
          id="providerWebsite"
          value={formData.providerWebsite || ''}
          onChange={(e) => onInputChange('providerWebsite', e.target.value)}
          placeholder="https://example.com"
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => onInputChange('description', e.target.value)}
          placeholder="Brief description of the scholarship"
          rows={3}
        />
      </div>
    </div>
  );

  const renderFundingInformation = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fundingType">Funding Type *</Label>
          <Select value={formData.fundingType || ''} onValueChange={(value) => onInputChange('fundingType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select funding type" />
            </SelectTrigger>
            <SelectContent>
              {FUNDING_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="fundingCurrency">Currency *</Label>
          <Select value={formData.fundingCurrency || ''} onValueChange={(value) => onInputChange('fundingCurrency', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {FUNDING_CURRENCIES.map((currency) => (
                <SelectItem key={currency.value} value={currency.value}>
                  {currency.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="totalValueMin">Minimum Amount</Label>
          <Input
            id="totalValueMin"
            type="number"
            value={formData.totalValueMin || ''}
            onChange={(e) => onInputChange('totalValueMin', e.target.value)}
            placeholder="5000"
          />
        </div>
        <div>
          <Label htmlFor="totalValueMax">Maximum Amount</Label>
          <Input
            id="totalValueMax"
            type="number"
            value={formData.totalValueMax || ''}
            onChange={(e) => onInputChange('totalValueMax', e.target.value)}
            placeholder="50000"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tuitionCoveragePercentage">Tuition Coverage %</Label>
          <Input
            id="tuitionCoveragePercentage"
            type="number"
            min="0"
            max="100"
            value={formData.tuitionCoveragePercentage || ''}
            onChange={(e) => onInputChange('tuitionCoveragePercentage', e.target.value)}
            placeholder="100"
          />
        </div>
        <div>
          <Label htmlFor="livingAllowanceAmount">Living Allowance Amount</Label>
          <Input
            id="livingAllowanceAmount"
            type="number"
            value={formData.livingAllowanceAmount || ''}
            onChange={(e) => onInputChange('livingAllowanceAmount', e.target.value)}
            placeholder="18000"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="livingAllowanceFrequency">Living Allowance Frequency</Label>
        <Select value={formData.livingAllowanceFrequency || ''} onValueChange={(value) => onInputChange('livingAllowanceFrequency', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            {LIVING_ALLOWANCE_FREQUENCY.map((frequency) => (
              <SelectItem key={frequency.value} value={frequency.value}>
                {frequency.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderEligibilityCriteria = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="minGpa">Minimum GPA</Label>
          <Input
            id="minGpa"
            type="number"
            step="0.1"
            value={formData.minGpa || ''}
            onChange={(e) => onInputChange('minGpa', e.target.value)}
            placeholder="3.0"
          />
        </div>
        <div>
          <Label htmlFor="gpaScale">GPA Scale</Label>
          <Input
            id="gpaScale"
            type="number"
            step="0.1"
            value={formData.gpaScale || ''}
            onChange={(e) => onInputChange('gpaScale', e.target.value)}
            placeholder="4.0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="minAge">Minimum Age</Label>
          <Input
            id="minAge"
            type="number"
            value={formData.minAge || ''}
            onChange={(e) => onInputChange('minAge', e.target.value)}
            placeholder="18"
          />
        </div>
        <div>
          <Label htmlFor="maxAge">Maximum Age</Label>
          <Input
            id="maxAge"
            type="number"
            value={formData.maxAge || ''}
            onChange={(e) => onInputChange('maxAge', e.target.value)}
            placeholder="35"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="minWorkExperience">Min Work Experience (Years)</Label>
          <Input
            id="minWorkExperience"
            type="number"
            min="0"
            value={formData.minWorkExperience || ''}
            onChange={(e) => onInputChange('minWorkExperience', e.target.value)}
            placeholder="2"
          />
        </div>
        <div>
          <Label htmlFor="genderRequirement">Gender Requirement</Label>
          <Select value={formData.genderRequirement || ''} onValueChange={(value) => onInputChange('genderRequirement', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender requirement" />
            </SelectTrigger>
            <SelectContent>
              {GENDER_REQUIREMENTS.map((requirement) => (
                <SelectItem key={requirement.value} value={requirement.value}>
                  {requirement.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Degree Requirements</Label>
        <div className="space-y-2">
          <Select 
            value="" 
            onValueChange={(value) => {
              const currentValues = formData.degreeRequired || [];
              if (value && !currentValues.includes(value)) {
                onArrayFieldChange('degreeRequired', [...currentValues, value]);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Add degree requirement" />
            </SelectTrigger>
            <SelectContent>
              {DEGREE_REQUIREMENTS
                .filter(degree => !(formData.degreeRequired || []).includes(degree.value))
                .map((degree) => (
                  <SelectItem key={degree.value} value={degree.value}>
                    {degree.label}
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
          
          {formData.degreeRequired && formData.degreeRequired.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.degreeRequired.map((degreeValue: string) => {
                const degree = DEGREE_REQUIREMENTS.find(d => d.value === degreeValue);
                return (
                  <Badge key={degreeValue} variant="secondary" className="flex items-center gap-1">
                    {degree?.label || degreeValue}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        const newValues = (formData.degreeRequired || []).filter((d: string) => d !== degreeValue);
                        onArrayFieldChange('degreeRequired', newValues);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div>
        <Label>Host Countries</Label>
        <div className="space-y-2">
          <Select 
            value="" 
            onValueChange={(value) => {
              const currentValues = formData.hostCountries || [];
              if (value && !currentValues.includes(value)) {
                onArrayFieldChange('hostCountries', [...currentValues, value]);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Add host country" />
            </SelectTrigger>
            <SelectContent>
              {countries
                .filter((country: any) => !(formData.hostCountries || []).includes(country.isoAlpha2))
                .map((country: any) => (
                  <SelectItem key={country.isoAlpha2} value={country.isoAlpha2}>
                    {country.countryName}
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
          
          {formData.hostCountries && formData.hostCountries.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.hostCountries.map((countryCode: string) => {
                const country = countries.find((c: any) => c.isoAlpha2 === countryCode);
                return (
                  <Badge key={countryCode} variant="secondary" className="flex items-center gap-1">
                    {country?.countryName || countryCode}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        const newValues = (formData.hostCountries || []).filter((c: string) => c !== countryCode);
                        onArrayFieldChange('hostCountries', newValues);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div>
        <Label>Study Levels</Label>
        <div className="space-y-2">
          <Select 
            value="" 
            onValueChange={(value) => {
              const currentValues = formData.studyLevels || [];
              if (value && !currentValues.includes(value)) {
                onArrayFieldChange('studyLevels', [...currentValues, value]);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Add study level" />
            </SelectTrigger>
            <SelectContent>
              {STUDY_LEVELS
                .filter(level => !(formData.studyLevels || []).includes(level.value))
                .map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
          
          {formData.studyLevels && formData.studyLevels.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.studyLevels.map((levelValue: string) => {
                const level = STUDY_LEVELS.find(l => l.value === levelValue);
                return (
                  <Badge key={levelValue} variant="secondary" className="flex items-center gap-1">
                    {level?.label || levelValue}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        const newValues = (formData.studyLevels || []).filter((l: string) => l !== levelValue);
                        onArrayFieldChange('studyLevels', newValues);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div>
        <Label>Field Categories</Label>
        <div className="space-y-2">
          <Select 
            value="" 
            onValueChange={(value) => {
              const currentValues = formData.fieldCategories || [];
              if (value && !currentValues.includes(value)) {
                onArrayFieldChange('fieldCategories', [...currentValues, value]);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Add field category" />
            </SelectTrigger>
            <SelectContent>
              {FIELD_CATEGORIES
                .filter(category => !(formData.fieldCategories || []).includes(category.value))
                .map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
          
          {formData.fieldCategories && formData.fieldCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.fieldCategories.map((categoryValue: string) => {
                const category = FIELD_CATEGORIES.find(c => c.value === categoryValue);
                return (
                  <Badge key={categoryValue} variant="secondary" className="flex items-center gap-1">
                    {category?.label || categoryValue}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        const newValues = (formData.fieldCategories || []).filter((c: string) => c !== categoryValue);
                        onArrayFieldChange('fieldCategories', newValues);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderApplicationInformation = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="applicationDeadline">Application Deadline</Label>
          <Input
            id="applicationDeadline"
            type="date"
            value={formData.applicationDeadline || ''}
            onChange={(e) => onInputChange('applicationDeadline', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="durationValue">Duration Value</Label>
          <Input
            id="durationValue"
            type="number"
            value={formData.durationValue || ''}
            onChange={(e) => onInputChange('durationValue', e.target.value)}
            placeholder="2"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="durationUnit">Duration Unit</Label>
        <Select value={formData.durationUnit || ''} onValueChange={(value) => onInputChange('durationUnit', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select duration unit" />
          </SelectTrigger>
          <SelectContent>
            {DURATION_UNITS.map((unit) => (
              <SelectItem key={unit.value} value={unit.value}>
                {unit.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderAdditionalDetails = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="status">Scholarship Status</Label>
        <Select value={formData.status || ''} onValueChange={(value) => onInputChange('status', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {SCHOLARSHIP_STATUS.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {getSectionTitle()}</DialogTitle>
          <DialogDescription>
            Update the scholarship information below
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {renderSectionContent()}
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={() => onSave(section)}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}