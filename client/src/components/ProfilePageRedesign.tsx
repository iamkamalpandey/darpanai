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
import { AlertCircle, Check, Edit, User, GraduationCap, Globe, DollarSign, Briefcase, Languages, Save, X, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import DashboardLayout from '@/components/DashboardLayout';

// Enhanced validation schemas with comprehensive data validity checks
const personalInfoSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name too long')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name too long')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),
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
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 16 && age <= 100;
    }, 'Age must be between 16 and 100 years'),
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
      return passport.length >= 6 && passport.length <= 15;
    }, 'Passport number must be 6-15 characters'),
  secondaryNumber: z.string()
    .optional()
    .nullable()
    .refine((phone) => {
      if (!phone) return true;
      return /^[\+]?[1-9][\d]{9,19}$/.test(phone);
    }, 'Invalid secondary phone number format'),
  address: z.string().optional().nullable(),
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
    .min(1, 'Course interest is required')
    .max(100, 'Course name too long')
    .regex(/^[a-zA-Z0-9\s\-\.&,()]+$/, 'Course name contains invalid characters'),
  fieldOfStudy: z.enum(['Engineering', 'Business', 'Medicine', 'Arts', 'Science', 'Technology', 'Other'])
    .refine((field) => field !== undefined, 'Field of study is required'),
  preferredIntake: z.enum(['Fall 2024', 'Spring 2025', 'Fall 2025', 'Spring 2026', 'Fall 2026'])
    .refine((intake) => intake !== undefined, 'Preferred intake is required'),
  budgetRange: z.enum(['under-10000', '10000-25000', '25000-50000', '50000-75000', '75000-100000', 'over-100000'])
    .refine((budget) => budget !== undefined, 'Budget range is required'),
  preferredCountries: z.array(z.string())
    .min(1, 'At least one country must be selected')
    .max(5, 'Maximum 5 countries allowed'),
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

const languageProficiencySchema = z.object({
  englishProficiencyTests: z.array(z.object({
    testType: z.enum(['IELTS', 'TOEFL', 'PTE', 'Duolingo']),
    overallScore: z.string().min(1, 'Overall score is required'),
    testDate: z.string().min(1, 'Test date is required'),
    expiryDate: z.string().optional(),
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

// Profile completion calculation
const calculateProfileCompletion = (user: any) => {
  if (!user) return { percentage: 0, completedSections: 0, totalSections: 6 };

  const sections = {
    personal: !!(user.firstName && user.lastName && user.phoneNumber && user.nationality),
    academic: !!(user.highestQualification && user.highestInstitution && user.graduationYear),
    study: !!(user.interestedCourse && user.fieldOfStudy && user.preferredIntake && user.budgetRange && user.preferredCountries?.length),
    financial: !!(user.fundingSource && user.estimatedBudget),
    employment: !!(user.currentEmploymentStatus),
    language: !!(user.englishProficiencyTests?.length || user.standardizedTests?.length)
  };

  const completedSections = Object.values(sections).filter(Boolean).length;
  const totalSections = Object.keys(sections).length;
  const percentage = Math.round((completedSections / totalSections) * 100);

  return { percentage, completedSections, totalSections, sections };
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
      firstName: '',
      lastName: '',
      phoneNumber: '',
      dateOfBirth: '',
      gender: '',
      nationality: '',
      passportNumber: '',
      secondaryNumber: '',
      address: '',
    },
  });

  // Update form values when user data loads
  React.useEffect(() => {
    if (user) {
      personalForm.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        dateOfBirth: user.dateOfBirth || null,
        gender: user.gender || null,
        nationality: user.nationality || '',
        passportNumber: user.passportNumber || null,
        secondaryNumber: user.secondaryNumber || null,
        address: user.address || null,
      });
    }
  }, [user, personalForm]);

  // Academic Information Form
  const academicForm = useForm({
    resolver: zodResolver(academicInfoSchema),
    defaultValues: {
      highestQualification: user?.highestQualification || '',
      highestInstitution: user?.highestInstitution || '',
      highestCountry: user?.highestCountry || '',
      highestGpa: user?.highestGpa || '',
      graduationYear: user?.graduationYear || null,
      currentAcademicGap: user?.currentAcademicGap || null,
    },
  });

  // Study Preferences Form
  const studyForm = useForm({
    resolver: zodResolver(studyPreferencesSchema),
    defaultValues: {
      interestedCourse: user?.interestedCourse || '',
      fieldOfStudy: user?.fieldOfStudy || '',
      preferredIntake: user?.preferredIntake || '',
      budgetRange: user?.budgetRange || '',
      preferredCountries: user?.preferredCountries || [],
    },
  });

  // Financial Information Form
  const financialForm = useForm({
    resolver: zodResolver(financialInfoSchema),
    defaultValues: {
      fundingSource: user?.fundingSource || '',
      estimatedBudget: user?.estimatedBudget || '',
      savingsAmount: user?.savingsAmount || '',
      loanApproval: user?.loanApproval || false,
      loanAmount: user?.loanAmount || 0,
      sponsorDetails: user?.sponsorDetails || '',
      financialDocuments: user?.financialDocuments || false,
    },
  });

  // Employment Information Form
  const employmentForm = useForm({
    resolver: zodResolver(employmentInfoSchema),
    defaultValues: {
      currentEmploymentStatus: user?.currentEmploymentStatus || '',
      workExperienceYears: user?.workExperienceYears || 0,
      jobTitle: user?.jobTitle || '',
      organizationName: user?.organizationName || '',
      fieldOfWork: user?.fieldOfWork || '',
      gapReasonIfAny: user?.gapReasonIfAny || '',
    },
  });

  // Language Proficiency Form
  const languageForm = useForm({
    resolver: zodResolver(languageProficiencySchema),
    defaultValues: {
      englishProficiencyTests: user?.englishProficiencyTests || [],
      standardizedTests: user?.standardizedTests || [],
    },
  });

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

  // Submit handlers
  const submitPersonalInfo = (data: any) => {
    updateProfileMutation.mutate(data);
  };

  const submitAcademicInfo = (data: any) => {
    updateProfileMutation.mutate(data);
  };

  const submitStudyPreferences = (data: any) => {
    updateProfileMutation.mutate(data);
  };

  const submitFinancialInfo = (data: any) => {
    updateProfileMutation.mutate(data);
  };

  const submitEmploymentInfo = (data: any) => {
    updateProfileMutation.mutate(data);
  };

  const submitLanguageProficiency = (data: any) => {
    updateProfileMutation.mutate(data);
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
              <form onSubmit={personalForm.handleSubmit(submitPersonalInfo)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Name</Label>
                <p className="text-sm">{user?.firstName} {user?.lastName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Phone</Label>
                <p className="text-sm">{user?.phoneNumber || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Nationality</Label>
                <p className="text-sm">{user?.nationality || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Date of Birth</Label>
                <p className="text-sm">{user?.dateOfBirth || 'Not provided'}</p>
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
              <form onSubmit={academicForm.handleSubmit(submitAcademicInfo)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={academicForm.control}
                    name="highestQualification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Highest Qualification *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <FormLabel>GPA/Grade</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="3.8 or 85%" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Qualification</Label>
                <p className="text-sm">{user?.highestQualification || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Institution</Label>
                <p className="text-sm">{user?.highestInstitution || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Graduation Year</Label>
                <p className="text-sm">{user?.graduationYear || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">GPA/Grade</Label>
                <p className="text-sm">{user?.highestGpa || 'Not provided'}</p>
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
              <form onSubmit={studyForm.handleSubmit(submitStudyPreferences)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Interested Course</Label>
                <p className="text-sm">{user?.interestedCourse || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Field of Study</Label>
                <p className="text-sm">{user?.fieldOfStudy || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Preferred Countries</Label>
                <p className="text-sm">{user?.preferredCountries?.join(', ') || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Budget Range</Label>
                <p className="text-sm">{user?.budgetRange || 'Not provided'}</p>
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
              <form onSubmit={financialForm.handleSubmit(submitFinancialInfo)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Funding Source</Label>
                <p className="text-sm">{user?.fundingSource || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Estimated Budget</Label>
                <p className="text-sm">{user?.estimatedBudget || 'Not provided'}</p>
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
              <form onSubmit={employmentForm.handleSubmit(submitEmploymentInfo)} className="space-y-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Employment Status</Label>
                <p className="text-sm">{user?.currentEmploymentStatus || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Work Experience</Label>
                <p className="text-sm">{user?.workExperienceYears ? `${user.workExperienceYears} years` : 'Not provided'}</p>
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
          <div className="text-sm text-gray-600">
            <p>English proficiency tests and standardized test scores can be added to strengthen your profile.</p>
            <p className="mt-2">Current tests: {user?.englishProficiencyTests?.length || 0} English proficiency tests recorded</p>
          </div>
        </ProfileSectionCard>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePageRedesign;