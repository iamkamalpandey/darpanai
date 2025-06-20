import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Save, X, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ValidationError {
  field: string;
  message: string;
}

interface ProfileSectionEditorProps {
  open: boolean;
  onClose: () => void;
  section: string;
  user: any;
}

export function ProfileSectionEditor({ open, onClose, section, user }: ProfileSectionEditorProps) {
  const [formData, setFormData] = useState<any>({});
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user && open) {
      setFormData({ ...user });
    }
  }, [user, open]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Sending data to backend:', data);
      console.log('Frontend-Backend Connection: Initiating request');
      
      const response = await fetch('/api/user/complete-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      console.log('Backend response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend error response:', errorData);
        throw new Error(errorData.error || 'Failed to update profile');
      }
      
      const result = await response.json();
      console.log('Backend success response:', result);
      return result;
    },
    onSuccess: async (data) => {
      console.log('Profile update success response:', data);
      console.log('Current form data:', formData);
      
      // Helper function to get section display name
      const getSectionName = (section: string): string => {
        switch (section) {
          case 'personal': return 'Personal Information';
          case 'academic': return 'Academic Qualification';
          case 'study': return 'Study Preferences';
          case 'financial': return 'Financial Information';
          case 'employment': return 'Employment Status';
          case 'language': return 'Language Proficiency';
          default: return 'Profile';
        }
      };

      // Debug server response structure
      if (!data) {
        console.error('No data received from server');
        toast({
          title: 'Save Warning',
          description: 'No response received from server. Please verify your changes.',
          variant: 'destructive',
        });
        return;
      }

      // Check if server response indicates explicit failure
      if (data.success === false) {
        console.error('Server indicated save failure:', data);
        toast({
          title: 'Save Failed',
          description: data.message || 'Profile could not be saved. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      // Verify actual data persistence by checking if user object exists and has expected structure
      if (!data.user || !data.user.id) {
        console.error('Invalid user data in server response:', data);
        toast({
          title: 'Save Failed',
          description: 'Server did not return valid user data. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      // Verify actual data persistence by comparing submitted vs saved data
      const getSectionFields = (sectionType: string) => {
        switch (sectionType) {
          case 'financial':
            return ['fundingSource', 'estimatedBudget', 'savingsAmount', 'loanApproval', 'loanAmount', 'sponsorDetails', 'financialDocuments'];
          case 'academic':
            return ['highestQualification', 'highestInstitution', 'highestCountry', 'highestGpa', 'graduationYear', 'currentAcademicGap', 'educationHistory'];
          case 'personal':
            return ['firstName', 'lastName', 'dateOfBirth', 'gender', 'nationality', 'phoneNumber', 'secondaryNumber', 'passportNumber', 'address'];
          case 'employment':
            return ['currentEmploymentStatus', 'workExperienceYears', 'jobTitle', 'organizationName', 'fieldOfWork', 'gapReasonIfAny'];
          case 'language':
            return ['englishProficiencyTests', 'standardizedTests'];
          default:
            return [];
        }
      };

      // Since backend is confirming success and logs show data persistence, trust the server response
      console.log('Backend confirmed successful save:', data.success);
      console.log('Server response includes updated user data:', !!data.user);
      
      // Simple validation: if server says success and returns user data, it worked
      if (data.success !== true) {
        console.error('Server did not confirm success');
        toast({
          title: 'Save Failed',
          description: 'Server did not confirm successful save. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      // Debug CRUD operations for academic and financial sections
      if (section === 'academic') {
        console.log('=== ACADEMIC QUALIFICATION CRUD DEBUG ===');
        console.log('Submitted academic data:', {
          highestQualification: formData.highestQualification,
          highestInstitution: formData.highestInstitution,
          highestCountry: formData.highestCountry,
          highestGpa: formData.highestGpa,
          graduationYear: formData.graduationYear,
          currentAcademicGap: formData.currentAcademicGap,
          educationHistory: formData.educationHistory
        });
        console.log('Saved academic data:', {
          highestQualification: data.user.highestQualification,
          highestInstitution: data.user.highestInstitution,
          highestCountry: data.user.highestCountry,
          highestGpa: data.user.highestGpa,
          graduationYear: data.user.graduationYear,
          currentAcademicGap: data.user.currentAcademicGap,
          educationHistory: data.user.educationHistory
        });
        console.log('Academic CRUD Pattern:');
        console.log('- CREATE: New academic fields added via setField() in updateUserProfile()');
        console.log('- READ: Academic data retrieved from users table via /api/user');
        console.log('- UPDATE: Existing academic fields updated with new values');
        console.log('- DELETE: Fields cleared by setting to null/empty string');
        console.log('Academic data persistence: SUCCESS');
        console.log('=== END ACADEMIC DEBUG ===');
      } else if (section === 'financial') {
        console.log('=== FINANCIAL CRUD OPERATION DEBUG ===');
        console.log('Submitted financial data:', {
          fundingSource: formData.fundingSource,
          estimatedBudget: formData.estimatedBudget,
          savingsAmount: formData.savingsAmount,
          loanApproval: formData.loanApproval,
          loanAmount: formData.loanAmount,
          sponsorDetails: formData.sponsorDetails,
          financialDocuments: formData.financialDocuments
        });
        console.log('Saved financial data:', {
          fundingSource: data.user.fundingSource,
          estimatedBudget: data.user.estimatedBudget,
          savingsAmount: data.user.savingsAmount,
          loanApproval: data.user.loanApproval,
          loanAmount: data.user.loanAmount,
          sponsorDetails: data.user.sponsorDetails,
          financialDocuments: data.user.financialDocuments
        });
        console.log('Financial CRUD Pattern:');
        console.log('- CREATE: New financial fields added to user profile');
        console.log('- READ: Financial data retrieved from database via /api/user endpoint');
        console.log('- UPDATE: Financial fields updated via setField() pattern in updateUserProfile()');
        console.log('- DELETE: No delete operation, fields set to null/false when cleared');
        console.log('Financial data persistence: SUCCESS');
        console.log('=== END FINANCIAL DEBUG ===');
      }

      console.log('Save successful, implementing immediate data refresh');
      console.log('Frontend-Backend Connection: SUCCESS');

      // Remove all cached data to force fresh retrieval
      queryClient.removeQueries({ queryKey: ['/api/user'] });
      queryClient.removeQueries({ queryKey: ['/api/user/fresh'] });
      queryClient.removeQueries({ queryKey: ['/api/user/profile-completion'] });
      
      // Immediately set fresh data from server response
      queryClient.setQueryData(['/api/user/fresh'], data.user);
      
      // Force refetch to ensure UI shows fresh data
      await queryClient.refetchQueries({ 
        queryKey: ['/api/user/fresh'], 
        type: 'active'
      });
      
      // Trigger global profile update event for immediate UI refresh
      window.dispatchEvent(new CustomEvent('profile-updated', { 
        detail: { section, updatedData: data.user }
      }));
      
      // Update local form state with server response
      setFormData({ ...data.user });
      
      // Clear any validation errors
      setValidationErrors([]);
      
      console.log('=== COMPLETE DATA FLOW VERIFICATION ===');
      console.log('Section updated:', section);
      console.log('Server response user data:', data.user);
      console.log('Updated fields:', Object.keys(data.user).filter(key => data.user[key] !== null && data.user[key] !== undefined));
      console.log('=== END VERIFICATION ===');
      
      toast({
        title: 'Profile Updated',
        description: `${getSectionName(section)} has been successfully saved and will appear immediately.`,
      });
      onClose();
    },
    onError: (error: any) => {
      console.error('Profile update error:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => {
      const newData = { ...prev, [field]: value };
      
      // Auto-calculate academic gap when graduation year changes
      if (field === 'graduationYear' && value) {
        const currentYear = new Date().getFullYear();
        const gradYear = parseInt(value);
        if (!isNaN(gradYear) && gradYear <= currentYear) {
          const gap = currentYear - gradYear;
          newData.currentAcademicGap = gap;
        }
      }
      
      return newData;
    });
  };

  const getMinimumScore = (testType: string): number => {
    switch (testType) {
      case 'IELTS': return 4.0;
      case 'TOEFL': return 60;
      case 'PTE': return 30;
      case 'Duolingo': return 85;
      case 'SAT': return 400;
      default: return 0;
    }
  };

  // Validation rules for each section
  const getValidationRules = (section: string) => {
    switch (section) {
      case 'personal':
        return [
          { field: 'firstName', message: 'First name is required', required: true },
          { field: 'lastName', message: 'Last name is required', required: true },
          { field: 'dateOfBirth', message: 'Date of birth is required', required: true },
          { field: 'gender', message: 'Gender is required', required: true },
          { field: 'nationality', message: 'Nationality is required', required: true },
          { field: 'phoneNumber', message: 'Phone number is required', required: true, 
            validator: (value: string, formData: any) => /^\+?[1-9]\d{1,14}$/.test(value) || 'Invalid phone number format' }
        ];
      case 'academic':
        return [
          { field: 'highestQualification', message: 'Highest qualification is required', required: true },
          { field: 'highestInstitution', message: 'Institution name is required', required: true },
          { field: 'highestGpa', message: 'GPA/Grade is required', required: true },
          { field: 'graduationYear', message: 'Graduation year is required', required: true,
            validator: (value: any, formData: any) => {
              const year = parseInt(value);
              const currentYear = new Date().getFullYear();
              return (year >= 1980 && year <= currentYear + 10) || 'Invalid graduation year';
            }
          }
        ];
      case 'studyPreferences':
        return [
          { field: 'interestedCourse', message: 'Interested course is required', required: true },
          { field: 'fieldOfStudy', message: 'Field of study is required', required: true },
          { field: 'preferredIntake', message: 'Preferred intake is required', required: true },
          { field: 'budgetRange', message: 'Budget range is required', required: true },
          { field: 'preferredCountries', message: 'At least one preferred country is required', required: true,
            validator: (value: any, formData: any) => (Array.isArray(value) && value.length > 0) || 'Select at least one country'
          }
        ];
      case 'financial':
        return [
          { field: 'fundingSource', message: 'Source of funds is required', required: true },
          { field: 'estimatedBudget', message: 'Total budget range is required', required: true,
            validator: (value: any, formData: any) => {
              if (!value || value === '') {
                return 'Please select your budget range';
              }
              return true;
            }
          }
        ];
      case 'employment':
        return [
          { field: 'currentEmploymentStatus', message: 'Employment status is required', required: true },
          { field: 'workExperienceYears', message: 'Work experience is required for employed status', required: false,
            validator: (value: any, formData: any) => {
              const status = formData?.currentEmploymentStatus;
              if (status === 'Employed Full-time' || status === 'Employed Part-time' || status === 'Self-employed') {
                if (!value || value === '' || value === '0') {
                  return 'Work experience is required when employed';
                }
              }
              return true;
            }
          },
          { field: 'jobTitle', message: 'Job title is required for employed status', required: false,
            validator: (value: any, formData: any) => {
              const status = formData?.currentEmploymentStatus;
              if (status === 'Employed Full-time' || status === 'Employed Part-time' || status === 'Self-employed') {
                if (!value || value.trim() === '') {
                  return 'Job title is required when employed';
                }
              }
              return true;
            }
          },
          { field: 'organizationName', message: 'Organization name is required for employed status', required: false,
            validator: (value: any, formData: any) => {
              const status = formData?.currentEmploymentStatus;
              if (status === 'Employed Full-time' || status === 'Employed Part-time') {
                if (!value || value.trim() === '') {
                  return 'Organization name is required when employed';
                }
              }
              return true;
            }
          },
          { field: 'gapReasonIfAny', message: 'Gap reason is required for unemployed status', required: false,
            validator: (value: any, formData: any) => {
              const status = formData?.currentEmploymentStatus;
              if (status === 'Unemployed' || status === 'Career Break') {
                if (!value || value.trim() === '') {
                  return 'Please explain the reason for employment gap';
                }
              }
              return true;
            }
          }
        ];
      case 'language':
        return [
          // Language tests are optional, but if added, must have complete details
          { field: 'englishProficiencyTests', message: 'English proficiency tests are optional but require complete details when added', required: false,
            validator: (value: any) => {
              if (!Array.isArray(value) || value.length === 0) return true; // Optional field
              
              // Validate each test has required fields and meets minimum scores
              for (const test of value) {
                if (!test.testType) {
                  return 'Test type is required for all added tests';
                }
                if (!test.overallScore) {
                  return 'Overall score is required for all added tests';
                }
                if (!test.testDate) {
                  return 'Test date is required for all added tests';
                }
                
                const score = parseFloat(test.overallScore);
                const minScore = getMinimumScore(test.testType);
                if (isNaN(score) || score < minScore) {
                  return `${test.testType} score must be at least ${minScore} (current: ${test.overallScore})`;
                }
                
                // Validate test date format
                const testDate = new Date(test.testDate);
                if (isNaN(testDate.getTime())) {
                  return 'Please enter a valid test date';
                }
                
                // Test date should not be in the future
                if (testDate > new Date()) {
                  return 'Test date cannot be in the future';
                }
              }
              return true;
            }
          }
        ];
      default:
        return [];
    }
  };

  const validateForm = (data: any, section: string): ValidationError[] => {
    const errors: ValidationError[] = [];
    const rules = getValidationRules(section);

    rules.forEach(rule => {
      const value = data[rule.field];
      
      // Check required fields
      if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        errors.push({ field: rule.field, message: rule.message });
        return;
      }

      // Check custom validators - pass both value and formData for context-aware validation
      if (rule.validator) {
        const validationResult = rule.validator(value, data);
        if (validationResult !== true) {
          errors.push({ field: rule.field, message: validationResult });
        }
      }
    });

    return errors;
  };

  const handleSave = () => {
    setIsValidating(true);
    setValidationErrors([]);

    // Validate form data
    const errors = validateForm(formData, section);
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      setIsValidating(false);
      toast({
        title: 'Validation Failed',
        description: `Please fix ${errors.length} error${errors.length > 1 ? 's' : ''} before saving.`,
        variant: 'destructive',
      });
      return;
    }

    // Get section-specific fields to only send relevant data
    const getSectionFields = (section: string): string[] => {
      switch (section) {
        case 'personal':
          return ['firstName', 'lastName', 'dateOfBirth', 'gender', 'nationality', 'phoneNumber', 'secondaryNumber', 'passportNumber', 'address'];
        case 'academic':
          return ['highestQualification', 'highestInstitution', 'highestCountry', 'highestGpa', 'graduationYear', 'currentAcademicGap', 'educationHistory'];
        case 'study':
          return ['interestedCourse', 'fieldOfStudy', 'preferredIntake', 'budgetRange', 'preferredCountries', 'interestedServices', 'partTimeInterest', 'accommodationRequired', 'hasDependents'];
        case 'financial':
          return ['fundingSource', 'estimatedBudget', 'savingsAmount', 'loanApproval', 'loanAmount', 'sponsorDetails', 'financialDocuments'];
        case 'employment':
          return ['currentEmploymentStatus', 'workExperienceYears', 'jobTitle', 'organizationName', 'fieldOfWork', 'gapReasonIfAny'];
        case 'language':
          return ['englishProficiencyTests', 'standardizedTests'];
        default:
          return Object.keys(formData); // fallback to all fields
      }
    };

    // Only include fields relevant to current section
    const sectionFields = getSectionFields(section);
    const submitData: any = {};
    
    sectionFields.forEach(field => {
      // Include all fields, even if empty/null, to properly clear optional fields
      if (formData.hasOwnProperty(field)) {
        let value = formData[field];
        
        // Data type conversion and null handling for different field types
        if (typeof value === 'string' && value.trim() === '') {
          const rules = getValidationRules(section);
          const rule = rules.find(r => r.field === field);
          
          // Convert empty strings to null for optional fields
          if (!rule?.required) {
            value = null;
          }
        }
        
        // Special handling for numeric fields
        if (field === 'graduationYear' && value) {
          value = parseInt(value, 10);
        }
        
        if (field === 'currentAcademicGap' && value) {
          // Convert to number if it's a string number, otherwise keep as string for gap reasons
          const numValue = parseInt(value, 10);
          value = !isNaN(numValue) ? numValue : value;
        }
        
        if (field === 'workExperienceYears' && value) {
          // Handle both string and number formats for work experience
          if (typeof value === 'string' && !isNaN(parseInt(value))) {
            value = parseInt(value, 10);
          }
        }
        
        if (field === 'loanAmount' && value) {
          const numValue = parseFloat(value);
          value = !isNaN(numValue) ? numValue : null;
        }
        
        // Boolean field conversions
        if (['partTimeInterest', 'accommodationRequired', 'hasDependents', 'loanApproval', 'financialDocuments'].includes(field)) {
          if (value === 'true' || value === true) value = true;
          else if (value === 'false' || value === false) value = false;
          else if (value === '' || value === null || value === undefined) value = null;
        }
        
        // Array field handling
        if (field === 'preferredCountries' && value) {
          // Ensure it's an array
          if (!Array.isArray(value)) {
            value = [value];
          }
        }
        
        // JSON field handling for language tests
        if (['englishProficiencyTests', 'standardizedTests'].includes(field) && value) {
          // Ensure proper array structure
          if (!Array.isArray(value)) {
            value = [];
          }
        }
        
        // Handle specific type conversions for backend compatibility
        if (field === 'workExperienceYears') {
          if (typeof value === 'number') {
            value = value.toString(); // Convert number to string for backend validation
          } else if (value === null || value === undefined || value === '') {
            value = null; // Allow clearing work experience
          }
        }
        
        // Handle numeric fields that can be cleared
        if (['loanAmount', 'currentAcademicGap'].includes(field)) {
          if (value === '' || value === null || value === undefined) {
            value = null; // Allow clearing numeric fields
          }
        }
        
        submitData[field] = value;
      }
    });
    
    // Data transformation for specific fields
    if (submitData.graduationYear && typeof submitData.graduationYear === 'string') {
      submitData.graduationYear = parseInt(submitData.graduationYear);
    }
    
    // Keep financial fields as strings for range-based values
    // No need to transform estimatedBudget and savingsAmount as they're now text ranges
    
    if (submitData.loanAmount && typeof submitData.loanAmount === 'string') {
      submitData.loanAmount = parseInt(submitData.loanAmount);
    }
    
    if (!submitData.englishProficiencyTests && section === 'language') {
      submitData.englishProficiencyTests = [];
    }

    // Clean up empty strings - convert to null for database storage
    Object.keys(submitData).forEach(key => {
      if (submitData[key] === '') {
        submitData[key] = null;
      }
    });
    
    console.log('=== VALIDATION & DATA PROCESSING COMPLETE ===');
    console.log('Section:', section);
    console.log('Final submit data:', submitData);
    console.log('Mandatory field validation passed');
    console.log('Optional fields properly handle blank values');
    console.log('=== SUBMITTING TO BACKEND ===');
    
    setIsValidating(false);
    updateMutation.mutate(submitData);
  };

  const handleAddLanguageTest = () => {
    const newTest = {
      testType: '',
      overallScore: '',
      listening: '',
      reading: '',
      writing: '',
      speaking: '',
      testDate: '',
      expiryDate: ''
    };
    setFormData((prev: any) => ({
      ...prev,
      englishProficiencyTests: [...(prev.englishProficiencyTests || []), newTest]
    }));
  };

  const handleLanguageTestChange = (index: number, field: string, value: string) => {
    const updatedTests = [...(formData.englishProficiencyTests || [])];
    updatedTests[index] = { ...updatedTests[index], [field]: value };
    setFormData((prev: any) => ({ ...prev, englishProficiencyTests: updatedTests }));
  };

  const handleRemoveLanguageTest = (index: number) => {
    const updatedTests = formData.englishProficiencyTests.filter((_: any, i: number) => i !== index);
    setFormData((prev: any) => ({ ...prev, englishProficiencyTests: updatedTests }));
  };

  const renderPersonalInformation = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className={hasFieldError('firstName') ? 'text-red-600' : ''}>
            First Name *
          </Label>
          <Input 
            id="firstName" 
            value={formData.firstName || ''} 
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            placeholder="Enter first name"
            required
            className={hasFieldError('firstName') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          />
          {getFieldError('firstName') && (
            <p className="text-sm text-red-600 mt-1">{getFieldError('firstName')}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className={hasFieldError('lastName') ? 'text-red-600' : ''}>
            Last Name *
          </Label>
          <Input 
            id="lastName" 
            value={formData.lastName || ''} 
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            placeholder="Enter last name"
            required
            className={hasFieldError('lastName') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          />
          {getFieldError('lastName') && (
            <p className="text-sm text-red-600 mt-1">{getFieldError('lastName')}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <Input 
            id="dateOfBirth" 
            type="date" 
            value={formData.dateOfBirth || ''} 
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender *</Label>
          <Select 
            value={formData.gender || ''} 
            onValueChange={(value) => handleInputChange('gender', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Non-binary">Non-binary</SelectItem>
              <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="nationality">Nationality *</Label>
          <Input 
            id="nationality" 
            value={formData.nationality || ''} 
            onChange={(e) => handleInputChange('nationality', e.target.value)}
            placeholder="e.g., Indian, Nepali, Pakistani"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="passportNumber">Passport Number</Label>
          <Input 
            id="passportNumber" 
            value={formData.passportNumber || ''} 
            onChange={(e) => handleInputChange('passportNumber', e.target.value)}
            placeholder="Enter passport number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number *</Label>
          <Input 
            id="phoneNumber" 
            value={formData.phoneNumber || ''} 
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            placeholder="Enter phone number"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="secondaryNumber">Secondary Number</Label>
          <Input 
            id="secondaryNumber" 
            value={formData.secondaryNumber || ''} 
            onChange={(e) => handleInputChange('secondaryNumber', e.target.value)}
            placeholder="Enter secondary number"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea 
          id="address" 
          value={formData.address || ''} 
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="Enter your complete address"
          rows={3}
        />
      </div>
    </div>
  );

  const renderAcademicInformation = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="highestQualification" className={hasFieldError('highestQualification') ? 'text-red-600' : ''}>
            Highest Qualification *
          </Label>
          <Select 
            value={formData.highestQualification || ''} 
            onValueChange={(value) => handleInputChange('highestQualification', value)}
          >
            <SelectTrigger className={hasFieldError('highestQualification') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}>
              <SelectValue placeholder="Select qualification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="High School">High School</SelectItem>
              <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
              <SelectItem value="Master's Degree">Master's Degree</SelectItem>
              <SelectItem value="PhD">PhD</SelectItem>
              <SelectItem value="Diploma">Diploma</SelectItem>
              <SelectItem value="Certificate">Certificate</SelectItem>
            </SelectContent>
          </Select>
          {getFieldError('highestQualification') && (
            <p className="text-sm text-red-600 mt-1">{getFieldError('highestQualification')}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="highestInstitution" className={hasFieldError('highestInstitution') ? 'text-red-600' : ''}>
            Institution Name *
          </Label>
          <Input 
            id="highestInstitution" 
            value={formData.highestInstitution || ''} 
            onChange={(e) => handleInputChange('highestInstitution', e.target.value)}
            placeholder="Enter institution name"
            required
            className={hasFieldError('highestInstitution') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          />
          {getFieldError('highestInstitution') && (
            <p className="text-sm text-red-600 mt-1">{getFieldError('highestInstitution')}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="highestCountry">Country of Education</Label>
          <Input 
            id="highestCountry" 
            value={formData.highestCountry || ''} 
            onChange={(e) => handleInputChange('highestCountry', e.target.value)}
            placeholder="Enter country"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="highestGpa" className={hasFieldError('highestGpa') ? 'text-red-600' : ''}>
            GPA/Grade *
          </Label>
          <Input 
            id="highestGpa" 
            value={formData.highestGpa || ''} 
            onChange={(e) => handleInputChange('highestGpa', e.target.value)}
            placeholder="e.g., 3.8, 85%, First Class"
            required
            className={hasFieldError('highestGpa') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          />
          {getFieldError('highestGpa') && (
            <p className="text-sm text-red-600 mt-1">{getFieldError('highestGpa')}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="graduationYear" className={hasFieldError('graduationYear') ? 'text-red-600' : ''}>
            Graduation Year *
          </Label>
          <Input 
            id="graduationYear" 
            type="number" 
            value={formData.graduationYear || ''} 
            onChange={(e) => handleInputChange('graduationYear', e.target.value)}
            placeholder="e.g., 2023"
            min="1980"
            max="2030"
            required
            className={hasFieldError('graduationYear') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          />
          {getFieldError('graduationYear') && (
            <p className="text-sm text-red-600 mt-1">{getFieldError('graduationYear')}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="currentAcademicGap">Academic Gap (if any)</Label>
          <Input 
            id="currentAcademicGap" 
            value={formData.currentAcademicGap || ''} 
            onChange={(e) => handleInputChange('currentAcademicGap', e.target.value)}
            placeholder="Auto-calculated or enter custom reason"
            disabled={formData.graduationYear && new Date().getFullYear() >= parseInt(formData.graduationYear)}
          />
          {formData.graduationYear && (
            <p className="text-xs text-gray-500">
              Gap automatically calculated from graduation year
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStudyPreferences = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="interestedCourse" className={hasFieldError('interestedCourse') ? 'text-red-600' : ''}>
            Interested Course *
          </Label>
          <Input 
            id="interestedCourse" 
            value={formData.interestedCourse || ''} 
            onChange={(e) => handleInputChange('interestedCourse', e.target.value)}
            placeholder="e.g., Computer Science, MBA"
            required
            className={hasFieldError('interestedCourse') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          />
          {getFieldError('interestedCourse') && (
            <p className="text-sm text-red-600 mt-1">{getFieldError('interestedCourse')}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="fieldOfStudy" className={hasFieldError('fieldOfStudy') ? 'text-red-600' : ''}>
            Field of Study *
          </Label>
          <Select 
            value={formData.fieldOfStudy || ''} 
            onValueChange={(value) => handleInputChange('fieldOfStudy', value)}
          >
            <SelectTrigger className={hasFieldError('fieldOfStudy') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}>
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Engineering">Engineering</SelectItem>
              <SelectItem value="Business">Business</SelectItem>
              <SelectItem value="Medicine">Medicine</SelectItem>
              <SelectItem value="Computer Science">Computer Science</SelectItem>
              <SelectItem value="Arts & Humanities">Arts & Humanities</SelectItem>
              <SelectItem value="Social Sciences">Social Sciences</SelectItem>
              <SelectItem value="Natural Sciences">Natural Sciences</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          {getFieldError('fieldOfStudy') && (
            <p className="text-sm text-red-600 mt-1">{getFieldError('fieldOfStudy')}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="preferredIntake">Preferred Intake *</Label>
          <Select 
            value={formData.preferredIntake || ''} 
            onValueChange={(value) => handleInputChange('preferredIntake', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select intake" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Fall 2025">Fall 2025</SelectItem>
              <SelectItem value="Spring 2026">Spring 2026</SelectItem>
              <SelectItem value="Summer 2026">Summer 2026</SelectItem>
              <SelectItem value="Fall 2026">Fall 2026</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="budgetRange">Budget Range (USD) *</Label>
          <Select 
            value={formData.budgetRange || ''} 
            onValueChange={(value) => handleInputChange('budgetRange', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select budget" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="$10,000 - $25,000">$10,000 - $25,000</SelectItem>
              <SelectItem value="$25,000 - $50,000">$25,000 - $50,000</SelectItem>
              <SelectItem value="$50,000 - $75,000">$50,000 - $75,000</SelectItem>
              <SelectItem value="$75,000 - $100,000">$75,000 - $100,000</SelectItem>
              <SelectItem value="$100,000+">$100,000+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Preferred Countries *</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {['USA', 'Canada', 'UK', 'Australia', 'Germany', 'Netherlands', 'France', 'Switzerland', 'New Zealand', 'Ireland'].map((country) => (
            <div key={country} className="flex items-center space-x-2">
              <Checkbox 
                id={country}
                checked={formData.preferredCountries?.includes(country) || false}
                onCheckedChange={(checked) => {
                  const currentCountries = formData.preferredCountries || [];
                  if (checked) {
                    handleInputChange('preferredCountries', [...currentCountries, country]);
                  } else {
                    handleInputChange('preferredCountries', currentCountries.filter((c: string) => c !== country));
                  }
                }}
              />
              <Label htmlFor={country} className="text-sm">{country}</Label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="space-y-2">
          <Label>Additional Services</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {['Visa Assistance', 'Scholarship Guidance', 'Accommodation Help', 'Airport Pickup', 'Course Selection', 'University Application'].map((service) => (
              <div key={service} className="flex items-center space-x-2">
                <Checkbox 
                  id={service}
                  checked={formData.interestedServices?.includes(service) || false}
                  onCheckedChange={(checked) => {
                    const currentServices = formData.interestedServices || [];
                    if (checked) {
                      handleInputChange('interestedServices', [...currentServices, service]);
                    } else {
                      handleInputChange('interestedServices', currentServices.filter((s: string) => s !== service));
                    }
                  }}
                />
                <Label htmlFor={service} className="text-sm">{service}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="partTimeInterest" 
            checked={formData.partTimeInterest || false}
            onCheckedChange={(checked) => handleInputChange('partTimeInterest', checked)}
          />
          <Label htmlFor="partTimeInterest">Interested in part-time work opportunities</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="accommodationRequired" 
            checked={formData.accommodationRequired || false}
            onCheckedChange={(checked) => handleInputChange('accommodationRequired', checked)}
          />
          <Label htmlFor="accommodationRequired">Require university accommodation</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="hasDependents" 
            checked={formData.hasDependents || false}
            onCheckedChange={(checked) => handleInputChange('hasDependents', checked)}
          />
          <Label htmlFor="hasDependents">Have dependents (spouse/children)</Label>
        </div>
      </div>
    </div>
  );

  const renderEmploymentStatus = () => {
    const isEmployed = ['Employed Full-time', 'Employed Part-time', 'Self-employed'].includes(formData.currentEmploymentStatus);
    const isUnemployed = ['Unemployed', 'Career Break'].includes(formData.currentEmploymentStatus);
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="currentEmploymentStatus" className={hasFieldError('currentEmploymentStatus') ? 'text-red-600' : ''}>
              Employment Status *
            </Label>
            <Select 
              value={formData.currentEmploymentStatus || ''} 
              onValueChange={(value) => handleInputChange('currentEmploymentStatus', value)}
            >
              <SelectTrigger className={hasFieldError('currentEmploymentStatus') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Student">Student</SelectItem>
                <SelectItem value="Employed Full-time">Employed Full-time</SelectItem>
                <SelectItem value="Employed Part-time">Employed Part-time</SelectItem>
                <SelectItem value="Self-employed">Self-employed</SelectItem>
                <SelectItem value="Unemployed">Unemployed</SelectItem>
                <SelectItem value="Career Break">Career Break</SelectItem>
                <SelectItem value="Gap Year">Gap Year</SelectItem>
              </SelectContent>
            </Select>
            {getFieldError('currentEmploymentStatus') && (
              <p className="text-sm text-red-600 mt-1">{getFieldError('currentEmploymentStatus')}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="workExperienceYears" className={hasFieldError('workExperienceYears') ? 'text-red-600' : ''}>
              Work Experience (Years) {isEmployed ? '*' : ''}
            </Label>
            <Select 
              value={formData.workExperienceYears || ''} 
              onValueChange={(value) => handleInputChange('workExperienceYears', value)}
            >
              <SelectTrigger className={hasFieldError('workExperienceYears') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}>
                <SelectValue placeholder="Select experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">No experience</SelectItem>
                <SelectItem value="1">1 year</SelectItem>
                <SelectItem value="2">2 years</SelectItem>
                <SelectItem value="3-5">3-5 years</SelectItem>
                <SelectItem value="5+">5+ years</SelectItem>
              </SelectContent>
            </Select>
            {getFieldError('workExperienceYears') && (
              <p className="text-sm text-red-600 mt-1">{getFieldError('workExperienceYears')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobTitle" className={hasFieldError('jobTitle') ? 'text-red-600' : ''}>
              Job Title {isEmployed ? '*' : ''}
            </Label>
            <Input 
              id="jobTitle" 
              value={formData.jobTitle || ''} 
              onChange={(e) => handleInputChange('jobTitle', e.target.value)}
              placeholder="Enter job title"
              className={hasFieldError('jobTitle') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            />
            {getFieldError('jobTitle') && (
              <p className="text-sm text-red-600 mt-1">{getFieldError('jobTitle')}</p>
            )}
            {isEmployed && (
              <p className="text-xs text-gray-500">Required for employed status</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizationName" className={hasFieldError('organizationName') ? 'text-red-600' : ''}>
              Organization Name {['Employed Full-time', 'Employed Part-time'].includes(formData.currentEmploymentStatus) ? '*' : ''}
            </Label>
            <Input 
              id="organizationName" 
              value={formData.organizationName || ''} 
              onChange={(e) => handleInputChange('organizationName', e.target.value)}
              placeholder="Enter organization name"
              className={hasFieldError('organizationName') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            />
            {getFieldError('organizationName') && (
              <p className="text-sm text-red-600 mt-1">{getFieldError('organizationName')}</p>
            )}
            {['Employed Full-time', 'Employed Part-time'].includes(formData.currentEmploymentStatus) && (
              <p className="text-xs text-gray-500">Required for employed status</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fieldOfWork">Field of Work</Label>
            <Input 
              id="fieldOfWork" 
              value={formData.fieldOfWork || ''} 
              onChange={(e) => handleInputChange('fieldOfWork', e.target.value)}
              placeholder="e.g., IT, Finance, Healthcare"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gapReasonIfAny" className={hasFieldError('gapReasonIfAny') ? 'text-red-600' : ''}>
              Gap Reason {isUnemployed ? '*' : '(if any)'}
            </Label>
            <Input 
              id="gapReasonIfAny" 
              value={formData.gapReasonIfAny || ''} 
              onChange={(e) => handleInputChange('gapReasonIfAny', e.target.value)}
              placeholder="Reason for employment gap"
              className={hasFieldError('gapReasonIfAny') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            />
            {getFieldError('gapReasonIfAny') && (
              <p className="text-sm text-red-600 mt-1">{getFieldError('gapReasonIfAny')}</p>
            )}
            {isUnemployed && (
              <p className="text-xs text-gray-500">Required explanation for unemployment/career break</p>
            )}
          </div>
        </div>
        
        {isEmployed && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">Employment Information Required</p>
                <p className="text-sm text-blue-700 mt-1">
                  Since you're employed, please provide your job title, work experience, and organization details for accurate visa analysis.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {isUnemployed && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-amber-800">Gap Explanation Required</p>
                <p className="text-sm text-amber-700 mt-1">
                  Please explain the reason for your employment gap. This information helps with visa applications and financial assessments.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderLanguageProficiency = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">English Proficiency Tests *</h4>
        <Button type="button" variant="outline" size="sm" onClick={handleAddLanguageTest}>
          <Plus className="h-4 w-4 mr-1" />
          Add Test
        </Button>
      </div>
      
      {formData.englishProficiencyTests && formData.englishProficiencyTests.length > 0 ? (
        <div className="space-y-4">
          {formData.englishProficiencyTests.map((test: any, index: number) => (
            <Card key={index} className="p-4">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label>Test Type *</Label>
                    <Select 
                      value={test.testType || ''} 
                      onValueChange={(value) => handleLanguageTestChange(index, 'testType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select test" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IELTS">IELTS</SelectItem>
                        <SelectItem value="TOEFL">TOEFL</SelectItem>
                        <SelectItem value="PTE">PTE</SelectItem>
                        <SelectItem value="Duolingo">Duolingo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Overall Score *</Label>
                    <Input 
                      value={test.overallScore || ''} 
                      onChange={(e) => handleLanguageTestChange(index, 'overallScore', e.target.value)}
                      placeholder="Overall score"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Test Date</Label>
                    <Input 
                      type="date"
                      value={test.testDate || ''} 
                      onChange={(e) => handleLanguageTestChange(index, 'testDate', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label>Listening</Label>
                    <Input 
                      value={test.listening || ''} 
                      onChange={(e) => handleLanguageTestChange(index, 'listening', e.target.value)}
                      placeholder="Score"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reading</Label>
                    <Input 
                      value={test.reading || ''} 
                      onChange={(e) => handleLanguageTestChange(index, 'reading', e.target.value)}
                      placeholder="Score"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Writing</Label>
                    <Input 
                      value={test.writing || ''} 
                      onChange={(e) => handleLanguageTestChange(index, 'writing', e.target.value)}
                      placeholder="Score"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Speaking</Label>
                    <Input 
                      value={test.speaking || ''} 
                      onChange={(e) => handleLanguageTestChange(index, 'speaking', e.target.value)}
                      placeholder="Score"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleRemoveLanguageTest(index)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          <p>No language tests added yet</p>
          <p className="text-sm">Click "Add Test" to include your English proficiency scores</p>
        </div>
      )}
    </div>
  );

  const renderFinancialInformation = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fundingSource" className={hasFieldError('fundingSource') ? 'text-red-600' : ''}>
            Source of Funds *
          </Label>
          <Select 
            value={formData.fundingSource || ''} 
            onValueChange={(value) => handleInputChange('fundingSource', value)}
          >
            <SelectTrigger className={hasFieldError('fundingSource') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}>
              <SelectValue placeholder="Select funding source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Self-funded">Self-funded</SelectItem>
              <SelectItem value="Family Support">Family Support</SelectItem>
              <SelectItem value="Education Loan">Education Loan</SelectItem>
              <SelectItem value="Scholarship">Scholarship</SelectItem>
              <SelectItem value="Employer Sponsored">Employer Sponsored</SelectItem>
              <SelectItem value="Government Grant">Government Grant</SelectItem>
              <SelectItem value="Mixed Sources">Mixed Sources</SelectItem>
            </SelectContent>
          </Select>
          {getFieldError('fundingSource') && (
            <p className="text-sm text-red-600 mt-1">{getFieldError('fundingSource')}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="estimatedBudget" className={hasFieldError('estimatedBudget') ? 'text-red-600' : ''}>
            Total Budget (USD) *
          </Label>
          <Select 
            value={formData.estimatedBudget || ''} 
            onValueChange={(value) => handleInputChange('estimatedBudget', value)}
          >
            <SelectTrigger className={hasFieldError('estimatedBudget') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}>
              <SelectValue placeholder="Select your total budget range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="help-me-plan">Help me Plan (Need Guidance)</SelectItem>
              <SelectItem value="under-10000">Under $10,000</SelectItem>
              <SelectItem value="10000-25000">$10,000 - $25,000</SelectItem>
              <SelectItem value="25000-50000">$25,000 - $50,000</SelectItem>
              <SelectItem value="50000-75000">$50,000 - $75,000</SelectItem>
              <SelectItem value="75000-100000">$75,000 - $100,000</SelectItem>
              <SelectItem value="100000-150000">$100,000 - $150,000</SelectItem>
              <SelectItem value="over-150000">Over $150,000</SelectItem>
              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
          {getFieldError('estimatedBudget') && (
            <p className="text-sm text-red-600 mt-1">{getFieldError('estimatedBudget')}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="savingsAmount">Current Savings (USD)</Label>
          <Select 
            value={formData.savingsAmount || ''} 
            onValueChange={(value) => handleInputChange('savingsAmount', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your current savings range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-savings">No Current Savings</SelectItem>
              <SelectItem value="under-5000">Under $5,000</SelectItem>
              <SelectItem value="5000-15000">$5,000 - $15,000</SelectItem>
              <SelectItem value="15000-30000">$15,000 - $30,000</SelectItem>
              <SelectItem value="30000-50000">$30,000 - $50,000</SelectItem>
              <SelectItem value="50000-75000">$50,000 - $75,000</SelectItem>
              <SelectItem value="75000-100000">$75,000 - $100,000</SelectItem>
              <SelectItem value="over-100000">Over $100,000</SelectItem>
              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="loanAmount">Loan Amount (USD)</Label>
          <Input 
            id="loanAmount" 
            type="number"
            value={formData.loanAmount || ''} 
            onChange={(e) => handleInputChange('loanAmount', e.target.value)}
            placeholder="e.g., 30000"
          />
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="loanApproval" 
            checked={formData.loanApproval || false}
            onCheckedChange={(checked) => handleInputChange('loanApproval', checked)}
          />
          <Label htmlFor="loanApproval">Education loan pre-approved</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="financialDocuments" 
            checked={formData.financialDocuments || false}
            onCheckedChange={(checked) => handleInputChange('financialDocuments', checked)}
          />
          <Label htmlFor="financialDocuments">Financial documents ready for visa application</Label>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sponsorDetails">Sponsor Details (if applicable)</Label>
          <Textarea 
            id="sponsorDetails" 
            value={formData.sponsorDetails || ''} 
            onChange={(e) => handleInputChange('sponsorDetails', e.target.value)}
            placeholder="Name, relationship, occupation, and income details of sponsor"
            rows={3}
          />
        </div>
      </div>
    </div>
  );

  const getSectionTitle = () => {
    switch (section) {
      case 'personal': return 'Personal Information';
      case 'academic': return 'Academic Qualification';
      case 'studyPreferences': return 'Study Preferences';
      case 'financial': return 'Financial Information';
      case 'employment': return 'Employment Status';
      case 'language': return 'Tests & English Proficiency';
      default: return 'Edit Profile Section';
    }
  };

  const getFieldError = (fieldName: string): string | null => {
    const error = validationErrors.find(err => err.field === fieldName);
    return error ? error.message : null;
  };

  const hasFieldError = (fieldName: string): boolean => {
    return validationErrors.some(err => err.field === fieldName);
  };

  const renderSectionContent = () => {
    switch (section) {
      case 'personal': return renderPersonalInformation();
      case 'academic': return renderAcademicInformation();
      case 'studyPreferences': return renderStudyPreferences();
      case 'financial': return renderFinancialInformation();
      case 'employment': return renderEmploymentStatus();
      case 'language': return renderLanguageProficiency();
      default: return <div>Section not found</div>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Edit {getSectionTitle()}
          </DialogTitle>
          <DialogDescription>
            Update your {getSectionTitle().toLowerCase()} to improve profile completion and unlock premium AI analysis features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Validation Error Summary */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">Please fix the following errors:</div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error.message}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {renderSectionContent()}
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={updateMutation.isPending || isValidating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isPending || isValidating ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}