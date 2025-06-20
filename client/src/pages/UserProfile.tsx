import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { DashboardLayout } from '@/components/DashboardLayout';
import { User, Calendar, GraduationCap, Globe, Briefcase, Languages, CheckCircle, AlertTriangle, Plus, Trash2, Info, TestTube2 } from 'lucide-react';

// Comprehensive form schemas based on global student lead profile
const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  gender: z.enum(["Male", "Female", "Non-binary", "Prefer not to say", "Other"]),
  email: z.string().email("Invalid email format"),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  secondaryNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format").optional().or(z.literal("")),
  nationality: z.string().min(1, "Nationality is required"),
  passportNumber: z.string().optional(),
  address: z.string().max(150).optional(),
});

const academicInfoSchema = z.object({
  highestQualification: z.enum(["High School", "Bachelor", "Master", "PhD"]),
  highestInstitution: z.string().min(1, "Institution name is required"),
  highestCountry: z.string().min(1, "Country is required"),
  highestGpa: z.string().min(1, "GPA is required"),
  graduationYear: z.number().int().min(1950).max(new Date().getFullYear() + 10),
  currentAcademicGap: z.number().int().min(0).max(20).optional(),
});

const studyPreferencesSchema = z.object({
  interestedCourse: z.string().min(1, "Interested course is required"),
  fieldOfStudy: z.string().min(1, "Field of study is required"),
  preferredIntake: z.string().min(1, "Preferred intake is required"),
  budgetRange: z.enum(["<10K", "10-20K", "20-30K", "30K+"]),
  preferredCountries: z.array(z.string()).min(1, "At least one preferred country is required"),
  partTimeInterest: z.boolean().default(false),
  accommodationRequired: z.boolean().default(false),
  hasDependents: z.boolean().default(false),
});

const employmentInfoSchema = z.object({
  currentEmploymentStatus: z.enum(["Employed", "Self-employed", "Studying", "Unemployed"]),
  workExperienceYears: z.number().int().min(0).max(50).optional(),
  jobTitle: z.string().optional(),
  organizationName: z.string().optional(),
  fieldOfWork: z.string().optional(),
});

// English Language Proficiency Tests
const englishTestSchema = z.object({
  testType: z.enum(["IELTS", "TOEFL", "PTE", "Duolingo", "Cambridge"]),
  testDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  overallScore: z.number().min(0),
  subscores: z.object({
    listening: z.number().min(0).optional(),
    reading: z.number().min(0).optional(),
    writing: z.number().min(0).optional(),
    speaking: z.number().min(0).optional(),
  }).optional(),
});

// Academic Standardized Tests
const academicTestSchema = z.object({
  testType: z.enum(["GRE", "GMAT", "SAT", "ACT"]),
  testDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  overallScore: z.number().int().min(0),
  subscores: z.object({
    math: z.number().int().min(0).optional(),
    verbal: z.number().int().min(0).optional(),
    writing: z.number().int().min(0).optional(),
  }).optional(),
});

const languageProficiencySchema = z.object({
  englishProficiencyTests: z.array(englishTestSchema).optional(),
  standardizedTests: z.array(academicTestSchema).optional(),
});

export default function UserProfile() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch user data
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/user'],
    staleTime: 5 * 60 * 1000,
  });

  // Calculate profile completeness
  const profileCompleteness = useMemo(() => {
    if (!user) return { percentage: 0, missingFields: [], completedSections: 0, totalSections: 5 };

    const requiredFields = {
      personal: ['firstName', 'lastName', 'dateOfBirth', 'gender', 'nationality', 'phoneNumber'],
      academic: ['highestQualification', 'highestInstitution', 'highestCountry', 'highestGpa', 'graduationYear'],
      study: ['interestedCourse', 'fieldOfStudy', 'preferredIntake', 'budgetRange'],
      employment: ['currentEmploymentStatus'],
      tests: [] // Optional section for now
    };

    let completedFields = 0;
    let totalFields = 0;
    let completedSections = 0;
    const missingFields: string[] = [];

    Object.entries(requiredFields).forEach(([section, fields]) => {
      let sectionComplete = true;
      fields.forEach(field => {
        totalFields++;
        if (user[field as keyof typeof user] && user[field as keyof typeof user] !== '') {
          completedFields++;
        } else {
          sectionComplete = false;
          missingFields.push(field);
        }
      });
      if (sectionComplete && fields.length > 0) completedSections++;
    });

    const percentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
    
    return {
      percentage,
      missingFields,
      completedSections,
      totalSections: Object.keys(requiredFields).length - 1 // Excluding tests for now
    };
  }, [user]);

  // Personal Info Form
  const personalForm = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      dateOfBirth: user?.dateOfBirth || "",
      gender: user?.gender || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      secondaryNumber: user?.secondaryNumber || "",
      nationality: user?.nationality || "",
      passportNumber: user?.passportNumber || "",
      address: user?.address || "",
    },
  });

  // Academic Info Form
  const academicForm = useForm({
    resolver: zodResolver(academicInfoSchema),
    defaultValues: {
      highestQualification: user?.highestQualification || "",
      highestInstitution: user?.highestInstitution || "",
      highestCountry: user?.highestCountry || "",
      highestGpa: user?.highestGpa || "",
      graduationYear: user?.graduationYear || new Date().getFullYear(),
      currentAcademicGap: user?.currentAcademicGap || 0,
    },
  });

  // Study Preferences Form
  const studyForm = useForm({
    resolver: zodResolver(studyPreferencesSchema),
    defaultValues: {
      interestedCourse: user?.interestedCourse || "",
      fieldOfStudy: user?.fieldOfStudy || "",
      preferredIntake: user?.preferredIntake || "",
      budgetRange: user?.budgetRange || "",
      preferredCountries: user?.preferredCountries || [],
      partTimeInterest: user?.partTimeInterest || false,
      accommodationRequired: user?.accommodationRequired || false,
      hasDependents: user?.hasDependents || false,
    },
  });

  // Employment Form
  const employmentForm = useForm({
    resolver: zodResolver(employmentInfoSchema),
    defaultValues: {
      currentEmploymentStatus: user?.currentEmploymentStatus || "",
      workExperienceYears: user?.workExperienceYears || 0,
      jobTitle: user?.jobTitle || "",
      organizationName: user?.organizationName || "",
      fieldOfWork: user?.fieldOfWork || "",
    },
  });

  // Tests Form (English Proficiency and Academic Standardized Tests)
  const testsForm = useForm({
    resolver: zodResolver(languageProficiencySchema),
    defaultValues: {
      englishProficiencyTests: user?.englishProficiencyTests || [],
      standardizedTests: user?.standardizedTests || [],
    },
  });

  const { 
    fields: englishTestFields, 
    append: appendEnglishTest, 
    remove: removeEnglishTest 
  } = useFieldArray({
    control: testsForm.control,
    name: "englishProficiencyTests"
  });

  const { 
    fields: academicTestFields, 
    append: appendAcademicTest, 
    remove: removeAcademicTest 
  } = useFieldArray({
    control: testsForm.control,
    name: "standardizedTests"
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/user/complete-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile-completion'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmitPersonal = (data: z.infer<typeof personalInfoSchema>) => {
    updateProfileMutation.mutate(data);
  };

  const onSubmitAcademic = (data: z.infer<typeof academicInfoSchema>) => {
    updateProfileMutation.mutate(data);
  };

  const onSubmitStudy = (data: z.infer<typeof studyPreferencesSchema>) => {
    updateProfileMutation.mutate(data);
  };

  const onSubmitEmployment = (data: z.infer<typeof employmentInfoSchema>) => {
    updateProfileMutation.mutate(data);
  };

  const onSubmitTests = (data: z.infer<typeof languageProficiencySchema>) => {
    updateProfileMutation.mutate(data);
  };

  // Helper functions for test score validation
  const getScoreRange = (testType: string) => {
    const ranges = {
      IELTS: { min: 0, max: 9, step: 0.5 },
      TOEFL: { min: 0, max: 120, step: 1 },
      PTE: { min: 10, max: 90, step: 1 },
      Duolingo: { min: 10, max: 160, step: 5 },
      Cambridge: { min: 0, max: 230, step: 1 },
      GRE: { min: 260, max: 340, step: 1 },
      GMAT: { min: 200, max: 800, step: 10 },
      SAT: { min: 400, max: 1600, step: 10 },
      ACT: { min: 1, max: 36, step: 1 }
    };
    return ranges[testType as keyof typeof ranges] || { min: 0, max: 100, step: 1 };
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your comprehensive student profile information</p>
        </div>

        {/* Profile Completeness Card */}
        <Card className="mb-6 border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Info className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Profile Completeness</CardTitle>
                  <CardDescription>
                    Complete your profile to get more accurate AI recommendations
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {profileCompleteness.percentage}%
                </div>
                <div className="text-sm text-gray-500">
                  {profileCompleteness.completedSections}/{profileCompleteness.totalSections} sections
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <Progress 
                value={profileCompleteness.percentage} 
                className="h-2"
              />
              {profileCompleteness.percentage < 100 && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800 mb-1">
                      Complete your profile for better recommendations
                    </p>
                    <p className="text-amber-700">
                      Missing information may affect the accuracy of AI-generated study destination suggestions and document analysis.
                    </p>
                  </div>
                </div>
              )}
              {profileCompleteness.percentage === 100 && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Profile complete! You can now access all AI features.
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-gray-50 rounded-lg p-1">
            <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="personal" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Personal</span>
            </TabsTrigger>
            <TabsTrigger value="academic" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Academic</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Study</span>
            </TabsTrigger>
            <TabsTrigger value="employment" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Work</span>
            </TabsTrigger>
            <TabsTrigger value="tests" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Languages className="h-4 w-4" />
              <span className="hidden sm:inline">Tests</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Overview</CardTitle>
                <CardDescription>
                  Summary of your student profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Personal Information</h3>
                    <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Phone:</strong> {user?.phoneNumber}</p>
                    <p><strong>Nationality:</strong> {user?.nationality || "Not specified"}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Academic Information</h3>
                    <p><strong>Qualification:</strong> {user?.highestQualification || "Not specified"}</p>
                    <p><strong>Institution:</strong> {user?.highestInstitution || "Not specified"}</p>
                    <p><strong>GPA:</strong> {user?.highestGpa || "Not specified"}</p>
                    <p><strong>Graduation:</strong> {user?.graduationYear || "Not specified"}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Study Preferences</h3>
                  <p><strong>Course:</strong> {user?.interestedCourse || "Not specified"}</p>
                  <p><strong>Field:</strong> {user?.fieldOfStudy || "Not specified"}</p>
                  <p><strong>Budget:</strong> {user?.budgetRange || "Not specified"}</p>
                  <p><strong>Countries:</strong> {user?.preferredCountries?.join(", ") || "Not specified"}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...personalForm}>
                  <form onSubmit={personalForm.handleSubmit(onSubmitPersonal)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={personalForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
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
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={personalForm.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={personalForm.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="+1234567890" />
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
                            <FormLabel>Secondary Number (Optional)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="+1234567890" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={personalForm.control}
                        name="nationality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nationality</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={personalForm.control}
                        name="passportNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Passport Number (Optional)</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={personalForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                      className="w-full"
                    >
                      {updateProfileMutation.isPending ? "Updating..." : "Update Personal Information"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="academic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Academic Information</CardTitle>
                <CardDescription>
                  Provide details about your educational background
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...academicForm}>
                  <form onSubmit={academicForm.handleSubmit(onSubmitAcademic)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={academicForm.control}
                        name="highestQualification"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Highest Qualification</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select qualification" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="High School">High School</SelectItem>
                                <SelectItem value="Bachelor">Bachelor's Degree</SelectItem>
                                <SelectItem value="Master">Master's Degree</SelectItem>
                                <SelectItem value="PhD">PhD</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={academicForm.control}
                        name="graduationYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Graduation Year</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={academicForm.control}
                      name="highestInstitution"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Institution Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={academicForm.control}
                        name="highestCountry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country of Institution</FormLabel>
                            <FormControl>
                              <Input {...field} />
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
                              <Input {...field} placeholder="e.g., 3.5, 85%, First Class" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={academicForm.control}
                      name="currentAcademicGap"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Academic Gap (Years)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                      className="w-full"
                    >
                      {updateProfileMutation.isPending ? "Updating..." : "Update Academic Information"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Study Preferences</CardTitle>
                <CardDescription>
                  Tell us about your study abroad preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...studyForm}>
                  <form onSubmit={studyForm.handleSubmit(onSubmitStudy)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={studyForm.control}
                        name="interestedCourse"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Interested Course</FormLabel>
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
                            <FormLabel>Field of Study</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., Technology" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={studyForm.control}
                        name="preferredIntake"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Intake</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g., Fall 2025" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={studyForm.control}
                        name="budgetRange"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Budget Range (USD)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select budget range" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="<10K">Less than $10,000</SelectItem>
                                <SelectItem value="10-20K">$10,000 - $20,000</SelectItem>
                                <SelectItem value="20-30K">$20,000 - $30,000</SelectItem>
                                <SelectItem value="30K+">More than $30,000</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-3">
                      <FormField
                        control={studyForm.control}
                        name="partTimeInterest"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Interested in part-time work</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={studyForm.control}
                        name="accommodationRequired"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Accommodation required</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={studyForm.control}
                        name="hasDependents"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Have dependents</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                      className="w-full"
                    >
                      {updateProfileMutation.isPending ? "Updating..." : "Update Study Preferences"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Employment Information</CardTitle>
                <CardDescription>
                  Provide details about your work experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...employmentForm}>
                  <form onSubmit={employmentForm.handleSubmit(onSubmitEmployment)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={employmentForm.control}
                        name="currentEmploymentStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employment Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Employed">Employed</SelectItem>
                                <SelectItem value="Self-employed">Self-employed</SelectItem>
                                <SelectItem value="Studying">Studying</SelectItem>
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
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={employmentForm.control}
                        name="jobTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Title</FormLabel>
                            <FormControl>
                              <Input {...field} />
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
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={employmentForm.control}
                      name="fieldOfWork"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Field of Work</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                      className="w-full"
                    >
                      {updateProfileMutation.isPending ? "Updating..." : "Update Employment Information"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Language & Academic Tests</CardTitle>
                <CardDescription>
                  Manage your English proficiency and academic standardized test scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...testsForm}>
                  <form onSubmit={testsForm.handleSubmit(onSubmitTests)} className="space-y-6">
                    
                    {/* English Language Proficiency Tests */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">English Language Proficiency Tests</h3>
                          <p className="text-sm text-gray-600">IELTS, TOEFL, PTE, Duolingo, Cambridge</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => appendEnglishTest({ 
                            testType: "IELTS", 
                            testDate: "", 
                            overallScore: 0,
                            subscores: {}
                          })}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add English Test
                        </Button>
                      </div>

                      {englishTestFields.length === 0 && (
                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                          <Languages className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p>No English proficiency tests added yet</p>
                          <p className="text-sm">Add your IELTS, TOEFL, PTE, or other test scores</p>
                        </div>
                      )}

                      {englishTestFields.map((field, index) => (
                        <Card key={field.id} className="border-blue-100 bg-blue-50/30">
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-4">
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                English Proficiency Test #{index + 1}
                              </Badge>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeEnglishTest(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <FormField
                                control={testsForm.control}
                                name={`englishProficiencyTests.${index}.testType`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Test Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select test" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="IELTS">IELTS (0-9)</SelectItem>
                                        <SelectItem value="TOEFL">TOEFL (0-120)</SelectItem>
                                        <SelectItem value="PTE">PTE (10-90)</SelectItem>
                                        <SelectItem value="Duolingo">Duolingo (10-160)</SelectItem>
                                        <SelectItem value="Cambridge">Cambridge (0-230)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={testsForm.control}
                                name={`englishProficiencyTests.${index}.testDate`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Test Date</FormLabel>
                                    <FormControl>
                                      <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={testsForm.control}
                                name={`englishProficiencyTests.${index}.overallScore`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Overall Score</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        step={getScoreRange(testsForm.watch(`englishProficiencyTests.${index}.testType`)).step}
                                        min={getScoreRange(testsForm.watch(`englishProficiencyTests.${index}.testType`)).min}
                                        max={getScoreRange(testsForm.watch(`englishProficiencyTests.${index}.testType`)).max}
                                        {...field} 
                                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* Subscores for English tests */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                              <FormField
                                control={testsForm.control}
                                name={`englishProficiencyTests.${index}.subscores.listening`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Listening</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        step={getScoreRange(testsForm.watch(`englishProficiencyTests.${index}.testType`)).step}
                                        min={getScoreRange(testsForm.watch(`englishProficiencyTests.${index}.testType`)).min}
                                        max={getScoreRange(testsForm.watch(`englishProficiencyTests.${index}.testType`)).max}
                                        placeholder="Optional"
                                        {...field} 
                                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={testsForm.control}
                                name={`englishProficiencyTests.${index}.subscores.reading`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Reading</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        step={getScoreRange(testsForm.watch(`englishProficiencyTests.${index}.testType`)).step}
                                        min={getScoreRange(testsForm.watch(`englishProficiencyTests.${index}.testType`)).min}
                                        max={getScoreRange(testsForm.watch(`englishProficiencyTests.${index}.testType`)).max}
                                        placeholder="Optional"
                                        {...field} 
                                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={testsForm.control}
                                name={`englishProficiencyTests.${index}.subscores.writing`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Writing</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        step={getScoreRange(testsForm.watch(`englishProficiencyTests.${index}.testType`)).step}
                                        min={getScoreRange(testsForm.watch(`englishProficiencyTests.${index}.testType`)).min}
                                        max={getScoreRange(testsForm.watch(`englishProficiencyTests.${index}.testType`)).max}
                                        placeholder="Optional"
                                        {...field} 
                                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={testsForm.control}
                                name={`englishProficiencyTests.${index}.subscores.speaking`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Speaking</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        step={getScoreRange(testsForm.watch(`englishProficiencyTests.${index}.testType`)).step}
                                        min={getScoreRange(testsForm.watch(`englishProficiencyTests.${index}.testType`)).min}
                                        max={getScoreRange(testsForm.watch(`englishProficiencyTests.${index}.testType`)).max}
                                        placeholder="Optional"
                                        {...field} 
                                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Separator />

                    {/* Academic Standardized Tests */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Academic Standardized Tests</h3>
                          <p className="text-sm text-gray-600">GRE, GMAT, SAT, ACT</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => appendAcademicTest({ 
                            testType: "GRE", 
                            testDate: "", 
                            overallScore: 0,
                            subscores: {}
                          })}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Academic Test
                        </Button>
                      </div>

                      {academicTestFields.length === 0 && (
                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                          <GraduationCap className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p>No academic tests added yet</p>
                          <p className="text-sm">Add your GRE, GMAT, SAT, or ACT scores</p>
                        </div>
                      )}

                      {academicTestFields.map((field, index) => (
                        <Card key={field.id} className="border-green-100 bg-green-50/30">
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-4">
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Academic Test #{index + 1}
                              </Badge>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAcademicTest(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <FormField
                                control={testsForm.control}
                                name={`standardizedTests.${index}.testType`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Test Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select test" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="GRE">GRE (260-340)</SelectItem>
                                        <SelectItem value="GMAT">GMAT (200-800)</SelectItem>
                                        <SelectItem value="SAT">SAT (400-1600)</SelectItem>
                                        <SelectItem value="ACT">ACT (1-36)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={testsForm.control}
                                name={`standardizedTests.${index}.testDate`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Test Date</FormLabel>
                                    <FormControl>
                                      <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={testsForm.control}
                                name={`standardizedTests.${index}.overallScore`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Overall Score</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        step={getScoreRange(testsForm.watch(`standardizedTests.${index}.testType`)).step}
                                        min={getScoreRange(testsForm.watch(`standardizedTests.${index}.testType`)).min}
                                        max={getScoreRange(testsForm.watch(`standardizedTests.${index}.testType`)).max}
                                        {...field} 
                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* Subscores for Academic tests */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                              <FormField
                                control={testsForm.control}
                                name={`standardizedTests.${index}.subscores.math`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Math/Quantitative</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        placeholder="Optional"
                                        {...field} 
                                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={testsForm.control}
                                name={`standardizedTests.${index}.subscores.verbal`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Verbal/Reading</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        placeholder="Optional"
                                        {...field} 
                                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={testsForm.control}
                                name={`standardizedTests.${index}.subscores.writing`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Writing</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        placeholder="Optional"
                                        {...field} 
                                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                      className="w-full"
                    >
                      {updateProfileMutation.isPending ? "Updating..." : "Update Test Scores"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}