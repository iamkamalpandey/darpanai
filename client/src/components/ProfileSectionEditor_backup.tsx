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
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
      
      // Aggressive cache invalidation for immediate UI updates
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile-completion'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/fresh'] });
      
      // Custom event for real-time profile refresh
      window.dispatchEvent(new CustomEvent('profile-updated', { detail: data }));
      
      // Reset validation errors and close dialog
      setValidationErrors([]);
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

  // Validation system with employment status correlations
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
            validator: (value: any, formData: any) => {
              if (!Array.isArray(value) || value.length === 0) return true; // Optional field
              
              for (const test of value) {
                if (!test.testType || !test.overallScore) {
                  return 'All English proficiency tests must have test type and overall score';
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

  const hasFieldError = (field: string): boolean => {
    return validationErrors.some(error => error.field === field);
  };

  const getFieldError = (field: string): string | undefined => {
    return validationErrors.find(error => error.field === field)?.message;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field-specific validation error when user starts typing
    if (hasFieldError(field)) {
      setValidationErrors(prev => prev.filter(error => error.field !== field));
    }
  };

  const handleSaveProfile = async () => {
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
        case 'studyPreferences':
          return ['interestedCourse', 'fieldOfStudy', 'preferredIntake', 'budgetRange', 'preferredCountries', 'interestedServices', 'partTimeInterest', 'accommodationRequired', 'hasDependents'];
        case 'financial':
          return ['fundingSource', 'estimatedBudget', 'savingsAmount', 'loanApproval', 'loanAmount', 'sponsorDetails', 'financialDocuments'];
        case 'employment':
          return ['currentEmploymentStatus', 'workExperienceYears', 'jobTitle', 'organizationName', 'fieldOfWork', 'gapReasonIfAny'];
        case 'language':
          return ['englishProficiencyTests', 'standardizedTests'];
        default:
          return Object.keys(formData);
      }
    };

    // Only include fields relevant to current section
    const sectionFields = getSectionFields(section);
    const submitData: any = {};
    
    sectionFields.forEach(field => {
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
          const numValue = parseInt(value, 10);
          value = !isNaN(numValue) ? numValue : value;
        }
        
        if (field === 'workExperienceYears' && value) {
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
          if (!Array.isArray(value)) {
            value = [value];
          }
        }
        
        // JSON field handling for language tests
        if (['englishProficiencyTests', 'standardizedTests'].includes(field) && value) {
          if (!Array.isArray(value)) {
            value = [];
          }
        }
        
        submitData[field] = value;
      }
    });
    
    console.log('=== VALIDATION & DATA PROCESSING COMPLETE ===');
    console.log('Section:', section);
    console.log('Final submit data:', submitData);
    console.log('=== SUBMITTING TO BACKEND ===');
    
    setIsValidating(false);
    updateMutation.mutate(submitData);
  };

  return (
    <div>ProfileSectionEditor Component - Fixed Structure</div>
  );
}