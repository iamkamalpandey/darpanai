import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Check, Edit, User, GraduationCap, Globe, DollarSign, Briefcase, Languages, Save, X, TrendingUp, CheckCircle2, CheckCircle, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import DashboardLayout from '@/components/DashboardLayout';

// Enhanced validation schemas with comprehensive data validity checks
const personalInfoSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name too long')
    .regex(/^[a-zA-Z\s\-'\.]+$/, 'First name can only contain letters, spaces, hyphens, apostrophes, and periods'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name too long')
    .regex(/^[a-zA-Z\s\-'\.]+$/, 'Last name can only contain letters, spaces, hyphens, apostrophes, and periods'),
  phoneNumber: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number too long')
    .regex(/^[\+]?[1-9][\d]{9,19}$/, 'Invalid phone number format'),
  dateOfBirth: z.string()
    .optional()
    .nullable()
    .refine((date) => {
      if (!date) return true;
      const birthDate = new Date(date);
      const today = new Date();
      // Check if date is not in future
      if (birthDate > today) return false;
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 16 && age <= 100;
    }, 'Date of birth cannot be in the future and age must be between 16 and 100 years'),
  gender: z.enum(['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other']).optional().nullable(),
  nationality: z.string()
    .min(1, 'Nationality is required')
    .max(50, 'Nationality too long')
    .regex(/^[a-zA-Z\s]+$/, 'Nationality can only contain letters and spaces'),
  passportNumber: z.string()
    .optional()
    .nullable()
    .refine((passport) => {
      if (!passport) return true;
      // Enhanced passport validation for common formats
      const cleanPassport = passport.replace(/\s/g, '');
      return cleanPassport.length >= 6 && cleanPassport.length <= 15 && /^[A-Z0-9]+$/i.test(cleanPassport);
    }, 'Passport number must be 6-15 alphanumeric characters'),
  secondaryNumber: z.string()
    .optional()
    .nullable()
    .refine((phone) => {
      if (!phone) return true;
      return /^[\+]?[1-9][\d]{9,19}$/.test(phone);
    }, 'Invalid secondary phone number format'),
  address: z.string()
    .optional()
    .nullable()
    .refine((address) => {
      if (!address) return true;
      // Address should be more than just numbers or very short text
      const trimmed = address.trim();
      return trimmed.length >= 10 && !/^\d+$/.test(trimmed);
    }, 'Address must be at least 10 characters and include more than just numbers'),
});

const academicInfoSchema = z.object({
  highestQualification: z.enum(["High School", "Bachelor's Degree", "Master's Degree", "PhD"])
    .refine((qual) => qual !== undefined, 'Highest qualification is required'),
  highestInstitution: z.string()
    .min(1, 'Institution name is required')
    .max(100, 'Institution name too long')
    .regex(/^[a-zA-Z0-9\s\-\.&,]+$/, 'Institution name contains invalid characters'),
  highestCountry: z.string().optional().nullable(),
  highestGpa: z.string()
    .optional()
    .nullable()
    .refine((gpa) => {
      if (!gpa) return true;
      // Accept percentage (0-100%) or GPA scale (0-4.0 or 0-10)
      const percentage = /^(\d{1,2}|100)%?$/.test(gpa);
      const gpaScale = /^([0-4](\.\d{1,2})?|[0-9](\.\d{1,2})?|10(\.0{1,2})?)$/.test(gpa);
      return percentage || gpaScale;
    }, 'GPA must be in percentage (0-100%) or scale format (0-4.0 or 0-10)'),
  graduationYear: z.number()
    .min(1980, 'Graduation year must be after 1980')
    .max(new Date().getFullYear() + 1, 'Graduation year cannot be more than 1 year in the future')
    .refine((year) => year !== undefined, 'Graduation year is required'),
  currentAcademicGap: z.number()
    .min(0, 'Academic gap cannot be negative')
    .max(50, 'Academic gap too large')
    .optional()
    .nullable(),
}).refine((data) => {
  // Cross-field validation: Calculate academic gap based on graduation year
  if (data.graduationYear) {
    const currentYear = new Date().getFullYear();
    const calculatedGap = currentYear - data.graduationYear;
    if (data.currentAcademicGap !== null && data.currentAcademicGap !== undefined) {
      return Math.abs(data.currentAcademicGap - calculatedGap) <= 1;
    }
  }
  return true;
}, 'Academic gap should match the difference between graduation year and current year');

const studyPreferencesSchema = z.object({
  interestedCourse: z.string()
    .min(3, 'Course name must be at least 3 characters')
    .max(100, 'Course name too long')
    .regex(/^[a-zA-Z][a-zA-Z0-9\s\-\.&,()]*$/, 'Course name must start with a letter and contain only valid characters')
    .refine((course) => {
      // Prevent numeric-only course names like "123"
      return !/^\d+$/.test(course.trim());
    }, 'Course name cannot be only numbers'),
  fieldOfStudy: z.enum(['Engineering', 'Business', 'Medicine', 'Arts', 'Science', 'Technology', 'Computer Science', 'Information Technology', 'Data Science', 'Finance', 'Marketing', 'Psychology', 'Other'])
    .refine((field) => field !== undefined, 'Field of study is required'),
  preferredIntake: z.enum(['Fall 2024', 'Spring 2025', 'Fall 2025', 'Spring 2026', 'Fall 2026'])
    .refine((intake) => intake !== undefined, 'Preferred intake is required'),
  budgetRange: z.enum(['under-10000', '10000-25000', '25000-50000', '50000-75000', '75000-100000', 'over-100000'])
    .refine((budget) => budget !== undefined, 'Budget range is required'),
  preferredCountries: z.array(z.string())
    .min(1, 'At least one country must be selected')
    .max(5, 'Maximum 5 countries allowed'),
  partTimeInterest: z.boolean().optional().nullable(),
  accommodationRequired: z.boolean().optional().nullable(),
  hasDependents: z.boolean().optional().nullable(),
});

const financialInfoSchema = z.object({
  fundingSource: z.enum(['Self-funded', 'Family-funded', 'Scholarship', 'Loan', 'Employer-sponsored', 'Other'])
    .refine((source) => source !== undefined, 'Funding source is required'),
  estimatedBudget: z.enum(['under-10000', '10000-25000', '25000-50000', '50000-75000', '75000-100000', 'over-100000'])
    .refine((budget) => budget !== undefined, 'Estimated budget is required'),
  savingsAmount: z.enum(['under-5000', '5000-15000', '15000-30000', '30000-50000', 'over-50000']).optional().nullable(),
  loanApproval: z.boolean().optional().nullable(),
  loanAmount: z.number()
    .min(0, 'Loan amount cannot be negative')
    .max(1000000, 'Loan amount too high')
    .optional()
    .nullable(),
  sponsorDetails: z.string()
    .optional()
    .nullable()
    .refine((details) => {
      if (!details) return true;
      return details.length >= 10 && details.length <= 500;
    }, 'Sponsor details must be between 10-500 characters'),
  financialDocuments: z.boolean().optional().nullable(),
}).refine((data) => {
  // Cross-field validation: Loan details consistency
  if (data.loanApproval === true && (!data.loanAmount || data.loanAmount <= 0)) {
    return false;
  }
  if (data.loanAmount && data.loanAmount > 0 && data.loanApproval !== true) {
    return false;
  }
  return true;
}, 'Loan approval and loan amount must be consistent');

const employmentInfoSchema = z.object({
  currentEmploymentStatus: z.enum(['Employed', 'Self-employed', 'Student', 'Unemployed']),
  workExperienceYears: z.number().min(0, 'Experience cannot be negative').max(50, 'Experience too high').optional().nullable(),
  jobTitle: z.string().optional().nullable(),
  organizationName: z.string().optional().nullable(),
  fieldOfWork: z.string().optional().nullable(),
  gapReasonIfAny: z.string().optional().nullable(),
}).refine((data) => {
  // Employment validation logic
  if (data.currentEmploymentStatus === 'Employed' || data.currentEmploymentStatus === 'Self-employed') {
    return data.jobTitle && data.organizationName && data.fieldOfWork;
  }
  if (data.currentEmploymentStatus === 'Unemployed') {
    return data.gapReasonIfAny;
  }
  return true;
}, {
  message: "Please provide required employment details",
  path: ["currentEmploymentStatus"]
});



// Function to calculate test validity based on test type
const calculateTestExpiry = (testDate: string, testType: string): string => {
  const date = new Date(testDate);
  let validityYears = 2; // Default validity for most tests
  
  switch (testType) {
    case 'IELTS':
    case 'PTE':
    case 'Duolingo':
      validityYears = 2;
      break;
    case 'TOEFL':
      validityYears = 2;
      break;
    case 'GRE':
    case 'GMAT':
      validityYears = 5;
      break;
    case 'SAT':
    case 'ACT':
      validityYears = 5;
      break;
  }
  
  date.setFullYear(date.getFullYear() + validityYears);
  return date.toISOString().split('T')[0];
};

// Function to check if test is still valid
const isTestValid = (testDate: string, testType: string): boolean => {
  const expiryDate = new Date(calculateTestExpiry(testDate, testType));
  return new Date() <= expiryDate;
};

const languageProficiencySchema = z.object({
  englishProficiencyTests: z.array(z.object({
    testType: z.enum(['IELTS', 'TOEFL', 'PTE', 'Duolingo']),
    overallScore: z.string().min(1, 'Overall score is required'),
    testDate: z.string().min(1, 'Test date is required'),
    listening: z.string().optional(),
    reading: z.string().optional(),
    writing: z.string().optional(),
    speaking: z.string().optional(),
  })).optional().nullable(),
  standardizedTests: z.array(z.object({
    testType: z.enum(['GRE', 'GMAT', 'SAT', 'ACT']),
    overallScore: z.string().min(1, 'Overall score is required'),
    testDate: z.string().min(1, 'Test date is required'),
  })).optional().nullable(),
});

type ProfileSection = 'personal' | 'academic' | 'study' | 'financial' | 'employment' | 'language';

// Profile completion calculation (excluding language as it's not compulsory)
const calculateProfileCompletion = (user: any) => {
  if (!user) return { percentage: 0, completedSections: 0, totalSections: 5 };

  const sections = {
    personal: !!(user.firstName && user.lastName && user.phoneNumber && user.nationality),
    academic: !!(user.highestQualification && user.highestInstitution && user.graduationYear),
    study: !!(user.interestedCourse && user.fieldOfStudy && user.preferredIntake && user.budgetRange && user.preferredCountries?.length),
    financial: !!(user.fundingSource && user.estimatedBudget),
    employment: !!(user.currentEmploymentStatus)
    // Note: language section removed from completion calculation as it's optional
  };

  const completedSections = Object.values(sections).filter(Boolean).length;
  const totalSections = Object.keys(sections).length;
  const percentage = Math.round((completedSections / totalSections) * 100);

  return { percentage, completedSections, totalSections, sections };
};

// Data validation warning component
const DataValidationWarnings: React.FC<{ user: any }> = ({ user }) => {
  const warnings = [];
  
  // Check for critical data integrity issues
  if (user?.dateOfBirth) {
    const birthDate = new Date(user.dateOfBirth);
    const today = new Date();
    if (birthDate > today) {
      warnings.push({
        type: 'error',
        field: 'Date of Birth',
        issue: 'Future date detected',
        value: user.dateOfBirth,
        recommendation: 'Please correct to a valid past date'
      });
    }
  }
  
  if (user?.passportNumber && user.passportNumber.length < 6) {
    warnings.push({
      type: 'error',
      field: 'Passport Number',
      issue: 'Invalid format',
      value: user.passportNumber,
      recommendation: 'Passport number must be 6-15 alphanumeric characters'
    });
  }
  
  if (user?.highestGpa && /^\d+%$/.test(user.highestGpa)) {
    const percentage = parseInt(user.highestGpa);
    if (percentage > 100) {
      warnings.push({
        type: 'error',
        field: 'GPA/Grade',
        issue: 'Invalid percentage format',
        value: user.highestGpa,
        recommendation: 'Percentage cannot exceed 100%'
      });
    }
  }
  
  if (user?.address && (user.address.length < 10 || /^\d+$/.test(user.address.trim()))) {
    warnings.push({
      type: 'warning',
      field: 'Address',
      issue: 'Incomplete address',
      value: user.address,
      recommendation: 'Please provide a complete address with street, city, and state'
    });
  }
  
  if (user?.interestedCourse && /^\d+$/.test(user.interestedCourse.trim())) {
    warnings.push({
      type: 'error',
      field: 'Interested Course',
      issue: 'Invalid course name',
      value: user.interestedCourse,
      recommendation: 'Course name cannot be only numbers'
    });
  }
  
  // Budget consistency check
  if (user?.budgetRange && user?.estimatedBudget && user.budgetRange !== user.estimatedBudget) {
    warnings.push({
      type: 'warning',
      field: 'Budget Consistency',
      issue: 'Budget mismatch between sections',
      value: `Study: ${user.budgetRange}, Financial: ${user.estimatedBudget}`,
      recommendation: 'Ensure budget ranges are consistent across all sections'
    });
  }
  
  if (warnings.length === 0) return null;
  
  return (
    <Alert className="mb-6 border-orange-200 bg-orange-50">
      <AlertCircle className="h-4 w-4 text-orange-600" />
      <AlertDescription>
        <div className="space-y-2">
          <p className="font-medium text-orange-800">Data Validation Issues Detected:</p>
          {warnings.map((warning, index) => (
            <div key={index} className={`p-2 rounded text-sm ${warning.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>
              <p className="font-medium">{warning.field}: {warning.issue}</p>
              <p className="text-xs">Current: {warning.value}</p>
              <p className="text-xs">{warning.recommendation}</p>
            </div>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  );
};

const ProfileSectionCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  isComplete: boolean;
  isEditing: boolean;
  onEdit: () => void;
  children: React.ReactNode;
}> = ({ title, description, icon, isComplete, isEditing, onEdit, children }) => {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          {icon}
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isComplete ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
              <Check className="w-3 h-3 mr-1" />
              Complete
            </Badge>
          ) : (
            <Badge variant="destructive">
              <AlertCircle className="w-3 h-3 mr-1" />
              Incomplete
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            disabled={isEditing}
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

const ProfilePageRedesign: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingSection, setEditingSection] = useState<ProfileSection | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  // Fetch user data
  const { data: user, isLoading, error } = useQuery<any>({
    queryKey: ['/api/user/fresh'],
    staleTime: 0,
    refetchOnMount: true,
  });

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/user/complete-profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/fresh'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile-completion'] });
      setEditingSection(null);
      setValidationErrors({});
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Profile update error:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Personal Information Form
  const personalForm = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneNumber: user?.phoneNumber || '',
      dateOfBirth: user?.dateOfBirth || '',
      gender: user?.gender || '',
      nationality: user?.nationality || '',
      passportNumber: user?.passportNumber || '',
      secondaryNumber: user?.secondaryNumber || '',
      address: user?.address || '',
    },
  });

  // Update form values when user data loads or when entering edit mode
  React.useEffect(() => {
    if (user && editingSection === 'personal') {
      console.log('Preloading personal form with data:', {
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        nationality: user.nationality,
        passportNumber: user.passportNumber,
        secondaryNumber: user.secondaryNumber,
        address: user.address,
      });
      personalForm.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        nationality: user.nationality || '',
        passportNumber: user.passportNumber || '',
        secondaryNumber: user.secondaryNumber || '',
        address: user.address || '',
      });
    }
  }, [user, editingSection, personalForm]);

  // Academic Information Form
  const academicForm = useForm({
    resolver: zodResolver(academicInfoSchema),
    defaultValues: {
      highestQualification: user?.highestQualification || '',
      highestInstitution: user?.highestInstitution || '',
      highestCountry: user?.highestCountry || '',
      highestGpa: user?.highestGpa || '',
      graduationYear: user?.graduationYear || undefined,
      currentAcademicGap: user?.currentAcademicGap || undefined,
    },
  });

  // Update academic form when entering edit mode
  React.useEffect(() => {
    if (user && editingSection === 'academic') {
      academicForm.reset({
        highestQualification: user.highestQualification || '',
        highestInstitution: user.highestInstitution || '',
        highestCountry: user.highestCountry || '',
        highestGpa: user.highestGpa || '',
        graduationYear: user.graduationYear || undefined,
        currentAcademicGap: user.currentAcademicGap || undefined,
      });
    }
  }, [user, editingSection, academicForm]);

  // Study Preferences Form
  const studyForm = useForm({
    resolver: zodResolver(studyPreferencesSchema),
    defaultValues: {
      interestedCourse: user?.interestedCourse || '',
      fieldOfStudy: user?.fieldOfStudy || '',
      preferredIntake: user?.preferredIntake || '',
      budgetRange: user?.budgetRange || '',
      preferredCountries: user?.preferredCountries || [],
      partTimeInterest: user?.partTimeInterest || false,
      accommodationRequired: user?.accommodationRequired || false,
      hasDependents: user?.hasDependents || false,
    },
  });

  // Update study form when entering edit mode
  React.useEffect(() => {
    if (user && editingSection === 'study') {
      studyForm.reset({
        interestedCourse: user.interestedCourse || '',
        fieldOfStudy: user.fieldOfStudy || '',
        preferredIntake: user.preferredIntake || '',
        budgetRange: user.budgetRange || '',
        preferredCountries: user.preferredCountries || [],
        partTimeInterest: user.partTimeInterest || false,
        accommodationRequired: user.accommodationRequired || false,
        hasDependents: user.hasDependents || false,
      });
    }
  }, [user, editingSection, studyForm]);

  // Financial Information Form
  const financialForm = useForm({
    resolver: zodResolver(financialInfoSchema),
    defaultValues: {
      fundingSource: '',
      estimatedBudget: '',
      savingsAmount: '',
      loanApproval: false,
      loanAmount: 0,
      sponsorDetails: '',
      financialDocuments: false,
    },
  });

  // Update financial form when entering edit mode
  React.useEffect(() => {
    if (user && editingSection === 'financial') {
      financialForm.reset({
        fundingSource: user.fundingSource || '',
        estimatedBudget: user.estimatedBudget || '',
        savingsAmount: user.savingsAmount || '',
        loanApproval: user.loanApproval || false,
        loanAmount: user.loanAmount || 0,
        sponsorDetails: user.sponsorDetails || '',
        financialDocuments: user.financialDocuments || false,
      });
    }
  }, [user, editingSection, financialForm]);

  // Employment Information Form
  const employmentForm = useForm({
    resolver: zodResolver(employmentInfoSchema),
    defaultValues: {
      currentEmploymentStatus: '',
      workExperienceYears: 0,
      jobTitle: '',
      organizationName: '',
      fieldOfWork: '',
      gapReasonIfAny: '',
    },
  });

  // Update employment form when entering edit mode
  React.useEffect(() => {
    if (user && editingSection === 'employment') {
      employmentForm.reset({
        currentEmploymentStatus: user.currentEmploymentStatus || '',
        workExperienceYears: user.workExperienceYears || 0,
        jobTitle: user.jobTitle || '',
        organizationName: user.organizationName || '',
        fieldOfWork: user.fieldOfWork || '',
        gapReasonIfAny: user.gapReasonIfAny || '',
      });
    }
  }, [user, editingSection, employmentForm]);





  // Language Proficiency Form
  const languageForm = useForm({
    resolver: zodResolver(languageProficiencySchema),
    defaultValues: {
      englishProficiencyTests: user?.englishProficiencyTests || [],
      standardizedTests: user?.standardizedTests || [],
    },
  });

  // Update language form when entering edit mode
  React.useEffect(() => {
    if (user && editingSection === 'language') {
      languageForm.reset({
        englishProficiencyTests: user.englishProficiencyTests || [],
        standardizedTests: user.standardizedTests || [],
      });
    }
  }, [user, editingSection, languageForm]);

  // Language form submission handler
  const onLanguageSubmit = (data: any) => {
    console.log('=== LANGUAGE PROFICIENCY SAVE TEST ===');
    console.log('Data being saved:', JSON.stringify(data, null, 2));
    updateProfileMutation.mutate(data, {
      onSuccess: (response) => {
        console.log('✓ Language proficiency saved successfully:', response);
        setEditingSection(null);
      },
      onError: (error) => {
        console.error('✗ Language proficiency save failed:', error);
      }
    });
  };


  // Check section completion
  const isSectionComplete = (section: ProfileSection): boolean => {
    switch (section) {
      case 'personal':
        return !!(user?.firstName && user?.lastName && user?.phoneNumber && user?.nationality);
      case 'academic':
        return !!(user?.highestQualification && user?.highestInstitution && user?.graduationYear);
      case 'study':
        return !!(user?.interestedCourse && user?.fieldOfStudy && user?.preferredIntake && user?.budgetRange && user?.preferredCountries?.length);
      case 'financial':
        return !!(user?.fundingSource && user?.estimatedBudget);
      case 'employment':
        return !!(user?.currentEmploymentStatus);
      case 'language':
        return true; // Optional section
      default:
        return false;
    }
  };

  // Submit handlers with comprehensive validation logging and save verification
  const submitPersonalInfo = (data: any) => {
    console.log('=== PERSONAL INFO SAVE TEST ===');
    console.log('Data being saved:', JSON.stringify(data, null, 2));
    console.log('Field count:', Object.keys(data).length);
    updateProfileMutation.mutate(data, {
      onSuccess: (response) => {
        console.log('✓ Personal info saved successfully:', response);
        console.log('✓ Save verification: Personal section complete');
        setEditingSection(null);
      },
      onError: (error) => {
        console.error('✗ Personal info save failed:', error);
      }
    });
  };

  const submitAcademicInfo = (data: any) => {
    console.log('=== ACADEMIC INFO SAVE TEST ===');
    console.log('Data being saved:', JSON.stringify(data, null, 2));
    console.log('Field count:', Object.keys(data).length);
    updateProfileMutation.mutate(data, {
      onSuccess: (response) => {
        console.log('✓ Academic info saved successfully:', response);
        console.log('✓ Save verification: Academic section complete');
        setEditingSection(null);
      },
      onError: (error) => {
        console.error('✗ Academic info save failed:', error);
      }
    });
  };

  const submitStudyPreferences = (data: any) => {
    console.log('=== STUDY PREFERENCES SAVE TEST ===');
    console.log('Data being saved:', JSON.stringify(data, null, 2));
    console.log('Field count:', Object.keys(data).length);
    updateProfileMutation.mutate(data, {
      onSuccess: (response) => {
        console.log('✓ Study preferences saved successfully:', response);
        console.log('✓ Save verification: Study section complete');
        setEditingSection(null);
      },
      onError: (error) => {
        console.error('✗ Study preferences save failed:', error);
      }
    });
  };

  const submitFinancialInfo = (data: any) => {
    console.log('=== FINANCIAL INFO SAVE TEST ===');
    console.log('Data being saved:', JSON.stringify(data, null, 2));
    console.log('Field count:', Object.keys(data).length);
    updateProfileMutation.mutate(data, {
      onSuccess: (response) => {
        console.log('✓ Financial info saved successfully:', response);
        console.log('✓ Save verification: Financial section complete');
        setEditingSection(null);
      },
      onError: (error) => {
        console.error('✗ Financial info save failed:', error);
      }
    });
  };

  const submitEmploymentInfo = (data: any) => {
    console.log('=== EMPLOYMENT INFO SAVE TEST ===');
    console.log('Data being saved:', JSON.stringify(data, null, 2));
    console.log('Field count:', Object.keys(data).length);
    updateProfileMutation.mutate(data, {
      onSuccess: (response) => {
        console.log('✓ Employment info saved successfully:', response);
        console.log('✓ Save verification: Employment section complete');
        setEditingSection(null);
      },
      onError: (error) => {
        console.error('✗ Employment info save failed:', error);
      }
    });
  };



  const submitLanguageProficiency = (data: any) => {
    console.log('=== LANGUAGE PROFICIENCY SAVE TEST ===');
    console.log('Data being saved:', JSON.stringify(data, null, 2));
    console.log('Field count:', Object.keys(data).length);
    updateProfileMutation.mutate(data, {
      onSuccess: (response) => {
        console.log('✓ Language proficiency saved successfully:', response);
        console.log('✓ Save verification: Language section complete');
        setEditingSection(null);
      },
      onError: (error) => {
        console.error('✗ Language proficiency save failed:', error);
      }
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading profile...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load profile data. Please refresh the page.
        </AlertDescription>
      </Alert>
    );
  }

  // Calculate profile completion
  const profileCompletion = calculateProfileCompletion(user);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Management</h1>
          <p className="text-gray-600 mt-2">
            Complete your profile to unlock personalized AI analysis and study destination recommendations.
          </p>
        </div>

        {/* Data Validation Warnings */}
        <DataValidationWarnings user={user} />

        {/* Profile Completion Card */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <div>
                <CardTitle className="text-xl text-blue-900">Profile Completion</CardTitle>
                <CardDescription className="text-blue-700">
                  {profileCompletion.completedSections} of {profileCompletion.totalSections} sections completed
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{profileCompletion.percentage}%</div>
              <div className="text-sm text-blue-700">Complete</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="w-full bg-blue-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${profileCompletion.percentage}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(profileCompletion.sections || {}).map(([section, isComplete]) => (
                <div key={section} className="flex items-center space-x-2">
                  {isComplete ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                  )}
                  <span className={`text-sm capitalize ${isComplete ? 'text-green-700' : 'text-gray-600'}`}>
                    {section.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
              ))}
            </div>

            {profileCompletion.percentage < 100 && (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Complete all sections to unlock advanced AI features and personalized study destination recommendations.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Personal Information */}
          <ProfileSectionCard
            title="Personal Information"
            description="Basic personal details and contact information"
            icon={<User className="w-5 h-5 text-blue-600" />}
            isComplete={isSectionComplete('personal')}
            isEditing={editingSection === 'personal'}
            onEdit={() => setEditingSection('personal')}
          >
          {editingSection === 'personal' ? (
            <Form {...personalForm}>
              <form onSubmit={personalForm.handleSubmit(submitPersonalInfo)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField
                    control={personalForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter first name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={personalForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter last name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={personalForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+1234567890" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={personalForm.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nationality *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter nationality" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={personalForm.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={personalForm.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Non-binary">Non-binary</SelectItem>
                            <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Missing Personal Information Fields */}
                  <FormField
                    control={personalForm.control}
                    name="passportNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Passport Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter passport number" value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={personalForm.control}
                    name="secondaryNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secondary Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter secondary phone" value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={personalForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="lg:col-span-3">
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Enter your complete address" value={field.value || ''} className="min-h-[60px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingSection(null)}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Name</Label>
                <p className="text-sm mt-1 font-medium">{user?.firstName} {user?.lastName}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Phone</Label>
                <p className="text-sm mt-1 font-medium">{user?.phoneNumber || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Nationality</Label>
                <p className="text-sm mt-1 font-medium">{user?.nationality || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Date of Birth</Label>
                <p className="text-sm mt-1 font-medium">{user?.dateOfBirth || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Gender</Label>
                <p className="text-sm mt-1 font-medium">{user?.gender || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Passport</Label>
                <p className="text-sm mt-1 font-medium">{user?.passportNumber || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Secondary Phone</Label>
                <p className="text-sm mt-1 font-medium">{user?.secondaryNumber || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg lg:col-span-1">
                <Label className="text-sm font-medium text-gray-600">Address</Label>
                <p className="text-sm mt-1 font-medium">{user?.address || 'Not provided'}</p>
              </div>
            </div>
          )}
        </ProfileSectionCard>

        {/* Academic Information */}
        <ProfileSectionCard
          title="Academic Information"
          description="Educational background and qualifications"
          icon={<GraduationCap className="w-5 h-5 text-green-600" />}
          isComplete={isSectionComplete('academic')}
          isEditing={editingSection === 'academic'}
          onEdit={() => setEditingSection('academic')}
        >
          {editingSection === 'academic' ? (
            <Form {...academicForm}>
              <form onSubmit={academicForm.handleSubmit(submitAcademicInfo)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField
                    control={academicForm.control}
                    name="highestQualification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Highest Qualification *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select qualification" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="High School">High School</SelectItem>
                            <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
                            <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                            <SelectItem value="PhD">PhD</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={academicForm.control}
                    name="highestInstitution"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Institution Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter institution name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={academicForm.control}
                    name="graduationYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Graduation Year *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="1980"
                            max="2030"
                            placeholder="2023"
                            onChange={(e) => field.onChange(parseInt(e.target.value) || null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={academicForm.control}
                    name="highestGpa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GPA/Grade *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., 3.8 or 85%" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={academicForm.control}
                    name="highestCountry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country of Education</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Nepal">Nepal</SelectItem>
                            <SelectItem value="India">India</SelectItem>
                            <SelectItem value="Bangladesh">Bangladesh</SelectItem>
                            <SelectItem value="Pakistan">Pakistan</SelectItem>
                            <SelectItem value="Sri Lanka">Sri Lanka</SelectItem>
                            <SelectItem value="China">China</SelectItem>
                            <SelectItem value="USA">USA</SelectItem>
                            <SelectItem value="UK">UK</SelectItem>
                            <SelectItem value="Canada">Canada</SelectItem>
                            <SelectItem value="Australia">Australia</SelectItem>
                            <SelectItem value="Germany">Germany</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={academicForm.control}
                    name="currentAcademicGap"
                    render={({ field }) => {
                      // Calculate automatic gap based on graduation year
                      const graduationYear = academicForm.watch('graduationYear');
                      const currentYear = new Date().getFullYear();
                      const calculatedGap = graduationYear ? Math.max(0, currentYear - graduationYear) : 0;
                      
                      return (
                        <FormItem>
                          <FormLabel>Academic Gap (Years)</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Input 
                                {...field} 
                                type="number" 
                                min="0" 
                                max="20" 
                                placeholder={calculatedGap.toString()}
                                value={field.value || calculatedGap || ''}
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : calculatedGap)}
                              />
                              {graduationYear && (
                                <p className="text-xs text-muted-foreground">
                                  Auto-calculated: {calculatedGap} years (from {graduationYear} to {currentYear})
                                </p>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
                
                {/* Education History Section */}
                <div className="space-y-4">
                  <FormLabel className="text-base font-semibold">Education History</FormLabel>
                  <div className="space-y-3">
                    <FormLabel className="text-sm font-medium">Previous Education Details</FormLabel>
                    <Textarea
                      placeholder="List your previous educational qualifications, institutions, and years (e.g., High School: ABC School (2018-2020), Bachelor's: XYZ University (2020-2024))"
                      value={user?.educationHistory ? JSON.stringify(user.educationHistory).replace(/["\[\]{}]/g, '').replace(/,/g, '\n') : ''}
                      onChange={(e) => {
                        const historyText = e.target.value;
                        const historyArray = historyText.split('\n').filter(line => line.trim());
                        updateProfileMutation.mutate({ educationHistory: historyArray });
                      }}
                      className="min-h-[80px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter each education qualification on a new line
                    </p>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingSection(null)}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Qualification</Label>
                <p className="text-sm mt-1 font-medium">{user?.highestQualification || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Institution</Label>
                <p className="text-sm mt-1 font-medium">{user?.highestInstitution || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Graduation Year</Label>
                <p className="text-sm mt-1 font-medium">{user?.graduationYear || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">GPA/Grade</Label>
                <p className="text-sm mt-1 font-medium">{user?.highestGpa || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Country</Label>
                <p className="text-sm mt-1 font-medium">{user?.highestCountry || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Academic Gap</Label>
                <p className="text-sm mt-1 font-medium">{user?.currentAcademicGap ? `${user.currentAcademicGap} years` : 'Not provided'}</p>
              </div>
            </div>
          )}
        </ProfileSectionCard>

        {/* Study Preferences */}
        <ProfileSectionCard
          title="Study Preferences"
          description="Your study abroad preferences and goals"
          icon={<Globe className="w-5 h-5 text-purple-600" />}
          isComplete={isSectionComplete('study')}
          isEditing={editingSection === 'study'}
          onEdit={() => setEditingSection('study')}
        >
          {editingSection === 'study' ? (
            <Form {...studyForm}>
              <form onSubmit={studyForm.handleSubmit(submitStudyPreferences)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField
                    control={studyForm.control}
                    name="interestedCourse"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interested Course *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Computer Science" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={studyForm.control}
                    name="fieldOfStudy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Field of Study *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Engineering">Engineering</SelectItem>
                            <SelectItem value="Business">Business</SelectItem>
                            <SelectItem value="Medicine">Medicine</SelectItem>
                            <SelectItem value="Arts">Arts</SelectItem>
                            <SelectItem value="Science">Science</SelectItem>
                            <SelectItem value="Technology">Technology</SelectItem>
                            <SelectItem value="Computer Science">Computer Science</SelectItem>
                            <SelectItem value="Information Technology">Information Technology</SelectItem>
                            <SelectItem value="Data Science">Data Science</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="Psychology">Psychology</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={studyForm.control}
                    name="preferredIntake"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Intake *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select intake" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Fall 2024">Fall 2024</SelectItem>
                            <SelectItem value="Spring 2025">Spring 2025</SelectItem>
                            <SelectItem value="Fall 2025">Fall 2025</SelectItem>
                            <SelectItem value="Spring 2026">Spring 2026</SelectItem>
                            <SelectItem value="Fall 2026">Fall 2026</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={studyForm.control}
                    name="budgetRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget Range *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select budget" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="under-10000">Under $10,000</SelectItem>
                            <SelectItem value="10000-25000">$10,000 - $25,000</SelectItem>
                            <SelectItem value="25000-50000">$25,000 - $50,000</SelectItem>
                            <SelectItem value="50000-75000">$50,000 - $75,000</SelectItem>
                            <SelectItem value="75000-100000">$75,000 - $100,000</SelectItem>
                            <SelectItem value="over-100000">Over $100,000</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Additional Study Preferences Fields */}
                <div className="space-y-6">
                  <div>
                    <FormLabel className="text-base font-semibold">Preferred Countries *</FormLabel>
                    <FormDescription>Select countries where you'd like to study (multiple selections allowed)</FormDescription>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
                      {['USA', 'Canada', 'UK', 'Australia', 'Germany', 'Netherlands', 'France', 'New Zealand', 'Ireland', 'Sweden', 'Norway', 'Denmark'].map((country) => (
                        <div key={country} className="flex items-center space-x-2">
                          <Checkbox
                            id={country}
                            checked={studyForm.watch('preferredCountries')?.includes(country) || false}
                            onCheckedChange={(checked) => {
                              const currentCountries = studyForm.getValues('preferredCountries') || [];
                              if (checked) {
                                studyForm.setValue('preferredCountries', [...currentCountries, country]);
                              } else {
                                studyForm.setValue('preferredCountries', currentCountries.filter((c: string) => c !== country));
                              }
                            }}
                          />
                          <Label htmlFor={country} className="text-sm font-medium">{country}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="partTimeInterest"
                        checked={user?.partTimeInterest || false}
                        onCheckedChange={(checked) => {
                          const updatedData = { ...studyForm.getValues(), partTimeInterest: checked as boolean };
                          studyForm.reset(updatedData);
                        }}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="partTimeInterest" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Part-time Study Interest
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Interested in part-time study options
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="accommodationRequired"
                        checked={user?.accommodationRequired || false}
                        onCheckedChange={(checked) => {
                          const updatedData = { ...studyForm.getValues(), accommodationRequired: checked as boolean };
                          studyForm.reset(updatedData);
                        }}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="accommodationRequired" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Accommodation Required
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Need assistance with accommodation
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasDependents"
                        checked={user?.hasDependents || false}
                        onCheckedChange={(checked) => {
                          const updatedData = { ...studyForm.getValues(), hasDependents: checked as boolean };
                          studyForm.reset(updatedData);
                        }}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="hasDependents" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Have Dependents
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Will be traveling with dependents
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional Study Services and Options */}
                  <div className="space-y-4">
                    <FormLabel className="text-base font-semibold">Additional Services & Preferences</FormLabel>
                    <div>
                      <FormLabel className="text-sm font-medium mb-3 block">Interested Services (Select all that apply)</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {['Visa Assistance', 'Accommodation Help', 'Airport Pickup', 'Document Translation', 'Bank Account Setup', 'Insurance Guidance', 'Career Counseling', 'Part-time Job Assistance'].map((service) => (
                          <div key={service} className="flex items-center space-x-2">
                            <Checkbox
                              id={service}
                              checked={user?.interestedServices?.includes(service) || false}
                              onCheckedChange={(checked) => {
                                const currentServices = user?.interestedServices || [];
                                const updatedServices = checked 
                                  ? [...currentServices, service]
                                  : currentServices.filter((s: string) => s !== service);
                                updateProfileMutation.mutate({ interestedServices: updatedServices });
                              }}
                            />
                            <Label htmlFor={service} className="text-sm">{service}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingSection(null)}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Interested Course</Label>
                <p className="text-sm mt-1 font-medium">{user?.interestedCourse || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Field of Study</Label>
                <p className="text-sm mt-1 font-medium">{user?.fieldOfStudy || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Preferred Intake</Label>
                <p className="text-sm mt-1 font-medium">{user?.preferredIntake || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Budget Range</Label>
                <p className="text-sm mt-1 font-medium">${user?.budgetRange?.replace('-', ' - ') || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg lg:col-span-2">
                <Label className="text-sm font-medium text-gray-600">Preferred Countries</Label>
                <p className="text-sm mt-1 font-medium">{user?.preferredCountries?.join(', ') || 'Not provided'}</p>
              </div>
            </div>
          )}
        </ProfileSectionCard>

        {/* Financial Information */}
        <ProfileSectionCard
          title="Financial Information"
          description="Funding sources and budget planning"
          icon={<DollarSign className="w-5 h-5 text-orange-600" />}
          isComplete={isSectionComplete('financial')}
          isEditing={editingSection === 'financial'}
          onEdit={() => setEditingSection('financial')}
        >
          {editingSection === 'financial' ? (
            <Form {...financialForm}>
              <form onSubmit={financialForm.handleSubmit(submitFinancialInfo)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField
                    control={financialForm.control}
                    name="fundingSource"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Funding Source *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select funding source" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Self-funded">Self-funded</SelectItem>
                            <SelectItem value="Family-funded">Family-funded</SelectItem>
                            <SelectItem value="Scholarship">Scholarship</SelectItem>
                            <SelectItem value="Loan">Loan</SelectItem>
                            <SelectItem value="Employer-sponsored">Employer-sponsored</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={financialForm.control}
                    name="estimatedBudget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Budget *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select budget range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="under-10000">Under $10,000</SelectItem>
                            <SelectItem value="10000-25000">$10,000 - $25,000</SelectItem>
                            <SelectItem value="25000-50000">$25,000 - $50,000</SelectItem>
                            <SelectItem value="50000-75000">$50,000 - $75,000</SelectItem>
                            <SelectItem value="75000-100000">$75,000 - $100,000</SelectItem>
                            <SelectItem value="over-100000">Over $100,000</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={financialForm.control}
                    name="savingsAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Savings</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select savings range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="under-5000">Under $5,000</SelectItem>
                            <SelectItem value="5000-15000">$5,000 - $15,000</SelectItem>
                            <SelectItem value="15000-30000">$15,000 - $30,000</SelectItem>
                            <SelectItem value="30000-50000">$30,000 - $50,000</SelectItem>
                            <SelectItem value="over-50000">Over $50,000</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={financialForm.control}
                    name="loanApproval"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Education Loan Pre-approval</FormLabel>
                          <FormDescription>
                            Have you received pre-approval for an education loan?
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={financialForm.control}
                    name="loanAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan Amount (USD)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            placeholder="0"
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter loan amount if applicable
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={financialForm.control}
                    name="sponsorDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sponsor Details</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Provide details about sponsors (if any)"
                            className="min-h-[80px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={financialForm.control}
                    name="financialDocuments"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Financial Documents Ready</FormLabel>
                          <FormDescription>
                            Are your financial documents prepared for visa application?
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingSection(null)}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Funding Source</Label>
                <p className="text-sm mt-1 font-medium">{user?.fundingSource || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Estimated Budget</Label>
                <p className="text-sm mt-1 font-medium">${user?.estimatedBudget?.replace('-', ' - ') || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Savings Amount</Label>
                <p className="text-sm mt-1 font-medium">${user?.savingsAmount?.replace('-', ' - ') || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Loan Approval</Label>
                <p className="text-sm mt-1 font-medium">{user?.loanApproval || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Loan Amount</Label>
                <p className="text-sm mt-1 font-medium">${user?.loanAmount || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg lg:col-span-3">
                <Label className="text-sm font-medium text-gray-600">Sponsor Details</Label>
                <p className="text-sm mt-1 font-medium">{user?.sponsorDetails || 'Not provided'}</p>
              </div>
            </div>
          )}
        </ProfileSectionCard>

        {/* Employment Information */}
        <ProfileSectionCard
          title="Employment Information"
          description="Work experience and current employment status"
          icon={<Briefcase className="w-5 h-5 text-red-600" />}
          isComplete={isSectionComplete('employment')}
          isEditing={editingSection === 'employment'}
          onEdit={() => setEditingSection('employment')}
        >
          {editingSection === 'employment' ? (
            <Form {...employmentForm}>
              <form onSubmit={employmentForm.handleSubmit(submitEmploymentInfo)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField
                    control={employmentForm.control}
                    name="currentEmploymentStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Employment Status *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select employment status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Employed">Employed</SelectItem>
                            <SelectItem value="Self-employed">Self-employed</SelectItem>
                            <SelectItem value="Student">Student</SelectItem>
                            <SelectItem value="Unemployed">Unemployed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={employmentForm.control}
                    name="workExperienceYears"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Experience (Years)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            min="0" 
                            max="50" 
                            placeholder="Years of experience"
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={employmentForm.control}
                    name="jobTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter job title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={employmentForm.control}
                    name="organizationName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter organization name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={employmentForm.control}
                    name="fieldOfWork"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Field of Work</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Information Technology" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={employmentForm.control}
                    name="gapReasonIfAny"
                    render={({ field }) => (
                      <FormItem className="lg:col-span-3">
                        <FormLabel>Gap Reason (if any)</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Explain any employment gaps" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingSection(null)}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Employment Status</Label>
                <p className="text-sm mt-1 font-medium">{user?.currentEmploymentStatus || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Work Experience</Label>
                <p className="text-sm mt-1 font-medium">{user?.workExperienceYears ? `${user.workExperienceYears} years` : 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Job Title</Label>
                <p className="text-sm mt-1 font-medium">{user?.jobTitle || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Organization</Label>
                <p className="text-sm mt-1 font-medium">{user?.organizationName || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm font-medium text-gray-600">Field of Work</Label>
                <p className="text-sm mt-1 font-medium">{user?.fieldOfWork || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg lg:col-span-3">
                <Label className="text-sm font-medium text-gray-600">Gap Reason</Label>
                <p className="text-sm mt-1 font-medium">{user?.gapReasonIfAny || 'Not provided'}</p>
              </div>
            </div>
          )}
        </ProfileSectionCard>

        {/* Language Proficiency */}
        <ProfileSectionCard
          title="Language Proficiency"
          description="English and standardized test scores (Optional)"
          icon={<Languages className="w-5 h-5 text-indigo-600" />}
          isComplete={isSectionComplete('language')}
          isEditing={editingSection === 'language'}
          onEdit={() => setEditingSection('language')}
        >
          {editingSection === 'language' ? (
            <Form {...languageForm}>
              <form onSubmit={languageForm.handleSubmit(onLanguageSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">English Proficiency Tests</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentTests = languageForm.getValues('englishProficiencyTests') || [];
                        languageForm.setValue('englishProficiencyTests', [
                          ...currentTests,
                          {
                            testType: 'IELTS',
                            overallScore: '',
                            testDate: '',
                            reading: '',
                            writing: '',
                            speaking: '',
                            listening: ''
                          }
                        ]);
                      }}
                    >
                      Add Test
                    </Button>
                  </div>
                  
                  {languageForm.watch('englishProficiencyTests')?.map((test: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h5 className="font-medium">Test #{index + 1}</h5>
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const currentTests = languageForm.getValues('englishProficiencyTests') || [];
                              const updatedTests = currentTests.filter((_: any, i: number) => i !== index);
                              languageForm.setValue('englishProficiencyTests', updatedTests);
                            }}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FormField
                          control={languageForm.control}
                          name={`englishProficiencyTests.${index}.testType`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Test Type *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ''}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select test type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="IELTS">IELTS</SelectItem>
                                  <SelectItem value="TOEFL">TOEFL</SelectItem>
                                  <SelectItem value="PTE">PTE Academic</SelectItem>
                                  <SelectItem value="Duolingo">Duolingo English Test</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={languageForm.control}
                          name={`englishProficiencyTests.${index}.overallScore`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Overall Score *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter overall score" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={languageForm.control}
                          name={`englishProficiencyTests.${index}.testDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Test Date *</FormLabel>
                              <FormControl>
                                <Input {...field} type="date" />
                              </FormControl>
                              <FormDescription>
                                {field.value && test.testType && (
                                  <>
                                    Valid until: {calculateTestExpiry(field.value, test.testType)}
                                    {!isTestValid(field.value, test.testType) && (
                                      <span className="text-red-500 ml-2">(Expired)</span>
                                    )}
                                  </>
                                )}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <FormField
                          control={languageForm.control}
                          name={`englishProficiencyTests.${index}.reading`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Reading</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Reading score" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={languageForm.control}
                          name={`englishProficiencyTests.${index}.writing`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Writing</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Writing score" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={languageForm.control}
                          name={`englishProficiencyTests.${index}.speaking`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Speaking</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Speaking score" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={languageForm.control}
                          name={`englishProficiencyTests.${index}.listening`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Listening</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Listening score" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingSection(null)}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="space-y-6">
              {user?.englishProficiencyTests && user.englishProficiencyTests.length > 0 ? (
                user.englishProficiencyTests.map((test: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">English Test #{index + 1}</h4>
                      {test.testDate && test.testType && (
                        <div className="text-sm">
                          {isTestValid(test.testDate, test.testType) ? (
                            <span className="text-green-600 bg-green-50 px-2 py-1 rounded-full">
                              Valid until {calculateTestExpiry(test.testDate, test.testType)}
                            </span>
                          ) : (
                            <span className="text-red-600 bg-red-50 px-2 py-1 rounded-full">
                              Expired on {calculateTestExpiry(test.testDate, test.testType)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Label className="text-sm font-medium text-gray-600">Test Type</Label>
                        <p className="text-sm mt-1 font-medium">{test.testType || 'Not provided'}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Label className="text-sm font-medium text-gray-600">Overall Score</Label>
                        <p className="text-sm mt-1 font-medium">{test.overallScore || 'Not provided'}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Label className="text-sm font-medium text-gray-600">Test Date</Label>
                        <p className="text-sm mt-1 font-medium">{test.testDate || 'Not provided'}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Label className="text-sm font-medium text-gray-600">Reading</Label>
                        <p className="text-sm mt-1 font-medium">{test.reading || 'Not provided'}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Label className="text-sm font-medium text-gray-600">Writing</Label>
                        <p className="text-sm mt-1 font-medium">{test.writing || 'Not provided'}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Label className="text-sm font-medium text-gray-600">Speaking</Label>
                        <p className="text-sm mt-1 font-medium">{test.speaking || 'Not provided'}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Label className="text-sm font-medium text-gray-600">Listening</Label>
                        <p className="text-sm mt-1 font-medium">{test.listening || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Languages className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>No English proficiency tests recorded</p>
                  <p className="text-sm">Click "Edit" to add your test scores</p>
                </div>
              )}
            </div>
          )}
        </ProfileSectionCard>


        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePageRedesign;