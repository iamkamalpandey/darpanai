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
      const response = await fetch(`/api/admin/scholarships/${scholarshipId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update scholarship');
      }
      
      return response.json();
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

  // Handle save operation - similar to ProfileSectionEditor
  const handleSave = async (section: string) => {
    const sectionFields = getSectionFields(section);
    const submitData: any = {};
    
    // Only include fields relevant to current section
    sectionFields.forEach(field => {
      if (formData.hasOwnProperty(field)) {
        let value = formData[field];
        
        // Handle empty strings
        if (typeof value === 'string' && value.trim() === '') {
          value = null;
        }
        
        // Type conversions for numeric fields
        if (['fundingAmountMin', 'fundingAmountMax', 'applicationFee'].includes(field) && value) {
          value = parseFloat(value) || null;
        }
        
        submitData[field] = value;
      }
    });
    
    console.log('Submitting scholarship data for section:', section, submitData);
    updateMutation.mutate(submitData);
  };

  // Get fields for each section - similar to ProfileSectionEditor
  const getSectionFields = (section: string): string[] => {
    switch (section) {
      case 'basic':
        return ['scholarshipId', 'name', 'providerType', 'providerName', 'providerWebsite', 'description'];
      case 'funding':
        return ['fundingType', 'fundingAmountMin', 'fundingAmountMax', 'currency', 'fundingDescription'];
      case 'eligibility':
        return ['hostCountries', 'eligibleCountries', 'studyLevels', 'fieldCategories', 'specificFields', 'minGpa', 'languageRequirements'];
      case 'application':
        return ['applicationDeadline', 'applicationFee', 'applicationProcess', 'documentsRequired', 'selectionCriteria'];
      case 'details':
        return ['duration', 'renewable', 'renewalCriteria', 'additionalBenefits', 'restrictions', 'contactEmail', 'tags'];
      default:
        return [];
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading scholarship...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!scholarship) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Unable to load scholarship data.</p>
          <Button onClick={() => setLocation('/admin/scholarships')} className="mt-4">
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
                  {scholarship.fundingType} • {scholarship.currency} {scholarship.fundingAmountMin?.toLocaleString()} - {scholarship.fundingAmountMax?.toLocaleString()}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Scholarship Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  <div className="text-sm font-medium text-gray-500">Scholarship ID</div>
                  <div className="text-gray-900">{scholarship.scholarshipId || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Provider Type</div>
                  <div className="text-gray-900 capitalize">{scholarship.providerType || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Provider Name</div>
                  <div className="text-gray-900">{scholarship.providerName || 'Not specified'}</div>
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
                  <div className="text-gray-900">{scholarship.currency || 'Not specified'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Amount Range</div>
                  <div className="text-gray-900">
                    {scholarship.fundingAmountMin && scholarship.fundingAmountMax 
                      ? `${scholarship.currency} ${scholarship.fundingAmountMin.toLocaleString()} - ${scholarship.fundingAmountMax.toLocaleString()}`
                      : 'Not specified'
                    }
                  </div>
                </div>
              </div>
              {scholarship.fundingDescription && (
                <div>
                  <div className="text-sm font-medium text-gray-500">Funding Description</div>
                  <div className="text-gray-900">{scholarship.fundingDescription}</div>
                </div>
              )}
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

              {scholarship.fieldCategories && scholarship.fieldCategories.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-2">Field Categories</div>
                  <div className="flex flex-wrap gap-2">
                    {scholarship.fieldCategories.map((field: string, index: number) => (
                      <Badge key={index} variant="outline">{field}</Badge>
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
                <div>
                  <div className="text-sm font-medium text-gray-500">Application Fee</div>
                  <div className="text-gray-900">
                    {scholarship.applicationFee 
                      ? `${scholarship.currency} ${scholarship.applicationFee}`
                      : 'Not specified'
                    }
                  </div>
                </div>
              </div>

              {scholarship.applicationProcess && (
                <div>
                  <div className="text-sm font-medium text-gray-500">Application Process</div>
                  <div className="text-gray-900">{scholarship.applicationProcess}</div>
                </div>
              )}

              {scholarship.documentsRequired && scholarship.documentsRequired.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-2">Required Documents</div>
                  <div className="flex flex-wrap gap-2">
                    {scholarship.documentsRequired.map((doc: string, index: number) => (
                      <Badge key={index} variant="outline">{doc}</Badge>
                    ))}
                  </div>
                </div>
              )}
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
  isLoading
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
              <SelectItem value="government">Government</SelectItem>
              <SelectItem value="private">Private Organization</SelectItem>
              <SelectItem value="institution">Educational Institution</SelectItem>
              <SelectItem value="other">Other</SelectItem>
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
          <Label htmlFor="providerWebsite">Provider Website</Label>
          <Input
            id="providerWebsite"
            value={formData.providerWebsite || ''}
            onChange={(e) => onInputChange('providerWebsite', e.target.value)}
            placeholder="https://example.com"
          />
        </div>
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
              <SelectItem value="full">Full Scholarship</SelectItem>
              <SelectItem value="partial">Partial Scholarship</SelectItem>
              <SelectItem value="tuition">Tuition Only</SelectItem>
              <SelectItem value="living">Living Expenses Only</SelectItem>
              <SelectItem value="travel">Travel Grant</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="currency">Currency *</Label>
          <Select value={formData.currency || ''} onValueChange={(value) => onInputChange('currency', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
              <SelectItem value="AUD">AUD</SelectItem>
              <SelectItem value="CAD">CAD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fundingAmountMin">Minimum Amount</Label>
          <Input
            id="fundingAmountMin"
            type="number"
            value={formData.fundingAmountMin || ''}
            onChange={(e) => onInputChange('fundingAmountMin', e.target.value)}
            placeholder="5000"
          />
        </div>
        <div>
          <Label htmlFor="fundingAmountMax">Maximum Amount</Label>
          <Input
            id="fundingAmountMax"
            type="number"
            value={formData.fundingAmountMax || ''}
            onChange={(e) => onInputChange('fundingAmountMax', e.target.value)}
            placeholder="50000"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="fundingDescription">Funding Description</Label>
        <Textarea
          id="fundingDescription"
          value={formData.fundingDescription || ''}
          onChange={(e) => onInputChange('fundingDescription', e.target.value)}
          placeholder="Details about what the funding covers"
          rows={3}
        />
      </div>
    </div>
  );

  const renderEligibilityCriteria = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="minGpa">Minimum GPA</Label>
        <Input
          id="minGpa"
          value={formData.minGpa || ''}
          onChange={(e) => onInputChange('minGpa', e.target.value)}
          placeholder="e.g., 3.0, 85%"
        />
      </div>

      <div>
        <Label>Host Countries</Label>
        <ArrayFieldEditor
          value={formData.hostCountries || []}
          onChange={(values) => onArrayFieldChange('hostCountries', values)}
          placeholder="Add host country"
        />
      </div>

      <div>
        <Label>Study Levels</Label>
        <ArrayFieldEditor
          value={formData.studyLevels || []}
          onChange={(values) => onArrayFieldChange('studyLevels', values)}
          placeholder="Add study level"
        />
      </div>

      <div>
        <Label>Field Categories</Label>
        <ArrayFieldEditor
          value={formData.fieldCategories || []}
          onChange={(values) => onArrayFieldChange('fieldCategories', values)}
          placeholder="Add field category"
        />
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
            value={formData.applicationDeadline ? formData.applicationDeadline.split('T')[0] : ''}
            onChange={(e) => onInputChange('applicationDeadline', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="applicationFee">Application Fee</Label>
          <Input
            id="applicationFee"
            type="number"
            value={formData.applicationFee || ''}
            onChange={(e) => onInputChange('applicationFee', e.target.value)}
            placeholder="0"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="applicationProcess">Application Process</Label>
        <Textarea
          id="applicationProcess"
          value={formData.applicationProcess || ''}
          onChange={(e) => onInputChange('applicationProcess', e.target.value)}
          placeholder="Steps to apply for this scholarship"
          rows={4}
        />
      </div>

      <div>
        <Label>Required Documents</Label>
        <ArrayFieldEditor
          value={formData.documentsRequired || []}
          onChange={(values) => onArrayFieldChange('documentsRequired', values)}
          placeholder="Add required document"
        />
      </div>
    </div>
  );

  const renderAdditionalDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="duration">Duration</Label>
          <Input
            id="duration"
            value={formData.duration || ''}
            onChange={(e) => onInputChange('duration', e.target.value)}
            placeholder="e.g., 1 year, 4 years"
          />
        </div>
        <div>
          <Label htmlFor="renewable">Renewable</Label>
          <Select value={formData.renewable?.toString() || ''} onValueChange={(value) => onInputChange('renewable', value === 'true')}>
            <SelectTrigger>
              <SelectValue placeholder="Is renewable?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="contactEmail">Contact Email</Label>
        <Input
          id="contactEmail"
          type="email"
          value={formData.contactEmail || ''}
          onChange={(e) => onInputChange('contactEmail', e.target.value)}
          placeholder="contact@example.com"
        />
      </div>

      <div>
        <Label>Tags</Label>
        <ArrayFieldEditor
          value={formData.tags || []}
          onChange={(values) => onArrayFieldChange('tags', values)}
          placeholder="Add tag"
        />
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {getSectionTitle()}</DialogTitle>
          <DialogDescription>
            Update the scholarship information below
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {renderSectionContent()}
          
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={() => onSave(section)}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Array Field Editor Component
interface ArrayFieldEditorProps {
  value: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
}

function ArrayFieldEditor({ value, onChange, placeholder }: ArrayFieldEditorProps) {
  const [inputValue, setInputValue] = useState('');

  const addValue = () => {
    if (inputValue.trim() && !value.includes(inputValue.trim())) {
      onChange([...value, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeValue = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          onKeyPress={(e) => e.key === 'Enter' && addValue()}
        />
        <Button type="button" variant="outline" onClick={addValue}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((item, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {item}
              <button
                type="button"
                onClick={() => removeValue(index)}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
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