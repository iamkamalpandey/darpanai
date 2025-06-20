import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
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
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { DashboardLayout } from '@/components/DashboardLayout';
import { User, Calendar, GraduationCap, Globe, Briefcase, Languages } from 'lucide-react';

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

const englishTestSchema = z.object({
  testType: z.enum(["IELTS", "TOEFL", "PTE", "Duolingo", "Cambridge"]),
  testDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  overallScore: z.number().min(0),
  listening: z.number().min(0).optional(),
  reading: z.number().min(0).optional(),
  writing: z.number().min(0).optional(),
  speaking: z.number().min(0).optional(),
});

export default function UserProfile() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch user data
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/user'],
    staleTime: 5 * 60 * 1000,
  });

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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="academic" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Academic
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Study
            </TabsTrigger>
            <TabsTrigger value="employment" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Employment
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
        </Tabs>
      </div>
    </DashboardLayout>
  );
}