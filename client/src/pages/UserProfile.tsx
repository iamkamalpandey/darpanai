import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  User, 
  Settings, 
  GraduationCap, 
  DollarSign, 
  Globe, 
  BookOpen, 
  CheckCircle, 
  AlertTriangle,
  Calendar as CalendarIcon,
  Languages,
  Target,
  Briefcase
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Form validation schema
const profileUpdateSchema = z.object({
  // Academic Information
  studyLevel: z.string().optional(),
  preferredStudyFields: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  
  // Financial Information
  budgetRange: z.string().optional(),
  fundingSource: z.string().optional(),
  
  // Destination Preferences
  studyDestination: z.string().optional(),
  languagePreferences: z.array(z.string()).optional(),
  climatePreference: z.string().optional(),
  culturalPreferences: z.array(z.string()).optional(),
  
  // Academic Priorities
  universityRankingImportance: z.string().optional(),
  workPermitImportance: z.string().optional(),
  careerGoals: z.string().optional(),
  counsellingMode: z.string().optional(),
  
  // English Language Proficiency
  englishProficiency: z.string().optional(),
  englishTestType: z.string().optional(),
  englishTestScore: z.string().optional(),
  englishTestDate: z.string().optional(),
  englishTestExpiry: z.string().optional(),
  needsEnglishImprovement: z.boolean().optional(),
});

type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  city: string;
  country: string;
  role: string;
  status: string;
  analysisCount: number;
  maxAnalyses: number;
  createdAt: string;
  
  // Extended profile fields
  studyLevel?: string;
  preferredStudyFields?: string[];
  startDate?: string;
  budgetRange?: string;
  fundingSource?: string;
  studyDestination?: string;
  languagePreferences?: string[];
  climatePreference?: string;
  culturalPreferences?: string[];
  universityRankingImportance?: string;
  workPermitImportance?: string;
  careerGoals?: string;
  counsellingMode?: string;
  
  // English Language Proficiency
  englishProficiency?: string;
  englishTestType?: string;
  englishTestScore?: string;
  englishTestDate?: string;
  englishTestExpiry?: string;
  needsEnglishImprovement?: boolean;
}

interface ProfileStatus {
  isComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
}

export default function UserProfile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  // Get user data
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['/api/user'],
    staleTime: 5 * 60 * 1000,
  });

  // Get profile completion status
  const { data: profileStatus, isLoading: statusLoading } = useQuery<ProfileStatus>({
    queryKey: ['/api/user/profile-completion'],
    staleTime: 5 * 60 * 1000,
  });

  // Form setup
  const form = useForm<ProfileUpdateData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      studyLevel: user?.studyLevel || '',
      preferredStudyFields: user?.preferredStudyFields || [],
      startDate: user?.startDate || '',
      budgetRange: user?.budgetRange || '',
      fundingSource: user?.fundingSource || '',
      studyDestination: user?.studyDestination || '',
      languagePreferences: user?.languagePreferences || [],
      climatePreference: user?.climatePreference || '',
      culturalPreferences: user?.culturalPreferences || [],
      universityRankingImportance: user?.universityRankingImportance || '',
      workPermitImportance: user?.workPermitImportance || '',
      careerGoals: user?.careerGoals || '',
      counsellingMode: user?.counsellingMode || '',
      englishProficiency: user?.englishProficiency || '',
      englishTestType: user?.englishTestType || '',
      englishTestScore: user?.englishTestScore || '',
      englishTestDate: user?.englishTestDate || '',
      englishTestExpiry: user?.englishTestExpiry || '',
      needsEnglishImprovement: user?.needsEnglishImprovement || false,
    },
  });

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileUpdateData) => {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to update profile');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile-completion'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ProfileUpdateData) => {
    updateProfileMutation.mutate(data);
  };

  if (userLoading || statusLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Unable to load user profile</p>
        </div>
      </DashboardLayout>
    );
  }

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEnglishProficiencyBadge = (level?: string) => {
    const colors = {
      'native': 'bg-green-100 text-green-800',
      'advanced': 'bg-blue-100 text-blue-800',
      'intermediate': 'bg-yellow-100 text-yellow-800',
      'basic': 'bg-orange-100 text-orange-800',
      'none': 'bg-red-100 text-red-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
            <p className="text-gray-600">Manage your account and preferences</p>
          </div>
        </div>

        {/* Profile Completion Alert */}
        {profileStatus && !profileStatus.isComplete && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Complete Your Profile</strong>
              <br />
              Your profile is {profileStatus.completionPercentage}% complete. 
              Complete it to unlock AI destination suggestions and personalized recommendations.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="english">English</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <p className="text-sm">{user.firstName} {user.lastName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-sm">{user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-sm">{user.phoneNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Location</label>
                      <p className="text-sm">{user.city}, {user.country}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Account Status</label>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Completion */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Profile Completion
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className={cn("text-sm font-medium", getCompletionColor(profileStatus?.completionPercentage || 0))}>
                        {profileStatus?.completionPercentage || 0}%
                      </span>
                    </div>
                    <Progress value={profileStatus?.completionPercentage || 0} className="w-full" />
                  </div>
                  
                  {profileStatus?.missingFields && profileStatus.missingFields.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Missing Fields:</p>
                      <div className="flex flex-wrap gap-2">
                        {profileStatus.missingFields.map((field, index) => (
                          <Badge key={index} variant="outline" className="text-orange-700 border-orange-200">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {profileStatus?.isComplete && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Profile Complete!</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Analysis Usage */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Analysis Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Analyses Used</span>
                      <span className="text-sm font-medium">{user.analysisCount} / {user.maxAnalyses}</span>
                    </div>
                    <Progress 
                      value={(user.analysisCount / user.maxAnalyses) * 100} 
                      className="w-full" 
                    />
                    <p className="text-xs text-gray-500">
                      {user.maxAnalyses - user.analysisCount} analyses remaining
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* English Proficiency Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Languages className="w-5 h-5 mr-2" />
                    English Proficiency
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Proficiency Level</span>
                    <Badge className={getEnglishProficiencyBadge(user.englishProficiency)}>
                      {user.englishProficiency || 'Not specified'}
                    </Badge>
                  </div>
                  {user.englishTestType && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Test Type</span>
                      <span className="text-sm font-medium">{user.englishTestType.toUpperCase()}</span>
                    </div>
                  )}
                  {user.englishTestScore && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Test Score</span>
                      <span className="text-sm font-medium">{user.englishTestScore}</span>
                    </div>
                  )}
                  {user.needsEnglishImprovement && (
                    <div className="flex items-center text-orange-600">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      <span className="text-sm">Needs Improvement</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Academic Tab */}
          <TabsContent value="academic" className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <GraduationCap className="w-5 h-5 mr-2" />
                      Academic Information
                    </CardTitle>
                    <CardDescription>
                      Your academic background and study preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="studyLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Study Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select study level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="undergraduate">Undergraduate</SelectItem>
                                <SelectItem value="graduate">Graduate</SelectItem>
                                <SelectItem value="postgraduate">Postgraduate</SelectItem>
                                <SelectItem value="phd">PhD</SelectItem>
                                <SelectItem value="diploma">Diploma</SelectItem>
                                <SelectItem value="certificate">Certificate</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Start Date</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Fall 2025, January 2025" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="careerGoals"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Career Goals</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your career goals and how this education will help you achieve them"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="universityRankingImportance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>University Ranking Importance</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select importance" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="not-important">Not Important</SelectItem>
                                <SelectItem value="somewhat">Somewhat Important</SelectItem>
                                <SelectItem value="very-important">Very Important</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="workPermitImportance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Work Permit Importance</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select importance" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="not-important">Not Important</SelectItem>
                                <SelectItem value="somewhat">Somewhat Important</SelectItem>
                                <SelectItem value="very-important">Very Important</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={updateProfileMutation.isPending}
                    className="min-w-[120px]"
                  >
                    {updateProfileMutation.isPending ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Globe className="w-5 h-5 mr-2" />
                      Study Preferences
                    </CardTitle>
                    <CardDescription>
                      Your destination and study environment preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="studyDestination"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Study Destination</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select destination" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="usa">United States</SelectItem>
                                <SelectItem value="canada">Canada</SelectItem>
                                <SelectItem value="uk">United Kingdom</SelectItem>
                                <SelectItem value="australia">Australia</SelectItem>
                                <SelectItem value="germany">Germany</SelectItem>
                                <SelectItem value="france">France</SelectItem>
                                <SelectItem value="netherlands">Netherlands</SelectItem>
                                <SelectItem value="singapore">Singapore</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="climatePreference"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Climate Preference</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select climate" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="tropical">Tropical</SelectItem>
                                <SelectItem value="temperate">Temperate</SelectItem>
                                <SelectItem value="cold">Cold</SelectItem>
                                <SelectItem value="arid">Arid</SelectItem>
                                <SelectItem value="no-preference">No Preference</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="budgetRange"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Budget Range (Annual)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select budget range" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low ($10,000 - $25,000)</SelectItem>
                                <SelectItem value="medium">Medium ($25,000 - $50,000)</SelectItem>
                                <SelectItem value="high">High ($50,000+)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fundingSource"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Funding Source</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select funding source" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="self-funded">Self-Funded</SelectItem>
                                <SelectItem value="family-funded">Family-Funded</SelectItem>
                                <SelectItem value="scholarship">Scholarship</SelectItem>
                                <SelectItem value="loan">Education Loan</SelectItem>
                                <SelectItem value="employer">Employer Sponsored</SelectItem>
                                <SelectItem value="government">Government Grant</SelectItem>
                                <SelectItem value="mixed">Mixed Sources</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={updateProfileMutation.isPending}
                    className="min-w-[120px]"
                  >
                    {updateProfileMutation.isPending ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          {/* English Proficiency Tab */}
          <TabsContent value="english" className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Languages className="w-5 h-5 mr-2" />
                      English Language Proficiency
                    </CardTitle>
                    <CardDescription>
                      Your English language skills and test scores
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="englishProficiency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>English Proficiency Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select proficiency level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="native">Native Speaker</SelectItem>
                                <SelectItem value="advanced">Advanced (C1-C2)</SelectItem>
                                <SelectItem value="intermediate">Intermediate (B1-B2)</SelectItem>
                                <SelectItem value="basic">Basic (A1-A2)</SelectItem>
                                <SelectItem value="none">Beginner</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="englishTestType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>English Test Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select test type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="ielts">IELTS</SelectItem>
                                <SelectItem value="toefl">TOEFL</SelectItem>
                                <SelectItem value="pte">PTE Academic</SelectItem>
                                <SelectItem value="duolingo">Duolingo English Test</SelectItem>
                                <SelectItem value="cambridge">Cambridge English</SelectItem>
                                <SelectItem value="none">No Test Taken</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="englishTestScore"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Test Score</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., 7.5, 100, 65"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter your overall score (IELTS: 0-9, TOEFL: 0-120, PTE: 10-90)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="englishTestDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Test Date</FormLabel>
                            <FormControl>
                              <Input 
                                type="date"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="englishTestExpiry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Test Expiry Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Most English tests are valid for 2 years from the test date
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="needsEnglishImprovement"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I need to improve my English skills
                            </FormLabel>
                            <FormDescription>
                              Check this if you plan to take English courses or retake language tests
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={updateProfileMutation.isPending}
                    className="min-w-[120px]"
                  >
                    {updateProfileMutation.isPending ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}